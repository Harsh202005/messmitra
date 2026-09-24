import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BillingCycle,
  Payment,
  calculateProratedMeals,
  calculateMonthlyBill,
  calculateLeaveDaysInMonth,
  STANDARD_BASE_MEALS,
} from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { MembersService } from '../members/members.service';
import { LeavesService } from '../leaves/leaves.service';
import { RecordPaymentDto, RecordAdjustmentDto } from './dto/record-payment.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class BillingService {
  private inMemoryBilling: BillingCycle[] = [];
  private inMemoryPayments: Payment[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private membersService: MembersService,
    private leavesService: LeavesService
  ) {}

  async getMonthlyBilling(
    month: string = new Date().toISOString().substring(0, 7),
    user: AuthenticatedUser
  ): Promise<{
    month: string;
    totalAmountDue: number;
    totalAmountPaid: number;
    totalPendingDues: number;
    cycles: BillingCycle[];
  }> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const cycles = this.inMemoryBilling.filter(
        (b) => (b.messId === user.messId || !user.messId) && b.month === month
      );
      const totalAmountDue = cycles.reduce((acc, c) => acc + c.amountDue, 0);
      const totalAmountPaid = cycles.reduce((acc, c) => acc + c.amountPaid, 0);
      const totalPendingDues = Math.max(0, totalAmountDue - totalAmountPaid);

      return {
        month,
        totalAmountDue,
        totalAmountPaid,
        totalPendingDues,
        cycles,
      };
    }

    const { data, error } = await client
      .from('billing_cycles')
      .select('*, members(name, phone)')
      .eq('mess_id', user.messId)
      .eq('month', month);

    if (error) {
      throw new Error(`Failed to fetch billing cycles: ${error.message}`);
    }

    const cycles: BillingCycle[] = (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      memberId: row.member_id,
      memberName: row.members?.name || 'Member',
      memberPhone: row.members?.phone,
      month: row.month,
      baseMeals: row.base_meals,
      approvedLeaveDays: Number(row.approved_leave_days),
      rate: Number(row.rate),
      perMealRate: Number(row.per_meal_rate) || Math.round((Number(row.rate) / (row.base_meals || 56)) * 100) / 100,
      amountDue: Number(row.amount_due),
      amountPaid: Number(row.amount_paid),
      status: row.status,
      generatedAt: row.generated_at,
    }));

    const totalAmountDue = cycles.reduce((acc, c) => acc + c.amountDue, 0);
    const totalAmountPaid = cycles.reduce((acc, c) => acc + c.amountPaid, 0);
    const totalPendingDues = Math.max(0, totalAmountDue - totalAmountPaid);

    return {
      month,
      totalAmountDue,
      totalAmountPaid,
      totalPendingDues,
      cycles,
    };
  }

  async generateMonthlyBills(month: string, user: AuthenticatedUser): Promise<BillingCycle[]> {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    const members = await this.membersService.getMembers(user, 'active');
    const leaves = await this.leavesService.getLeaves(user);

    const generatedCycles: BillingCycle[] = [];

    for (const member of members) {
      // 1. Calculate prorated meals if joined mid-cycle
      const baseMeals = calculateProratedMeals(member.joinDate, year, monthNum, member.planType);

      // 2. Count approved leave days strictly in this month (with boundary clamping)
      let approvedLeaveDays = 0;
      for (const l of leaves) {
        if (
          l.memberId === member.id &&
          (l.status === 'auto_valid' || l.status === 'approved')
        ) {
          const daysInThisMonth = calculateLeaveDaysInMonth(l.startDate, l.endDate, year, monthNum);
          approvedLeaveDays += daysInThisMonth;
        }
      }

      // 3. Compute itemized monthly bill
      const bill = calculateMonthlyBill(member.rate, approvedLeaveDays, member.planType, baseMeals);

      const cycle: BillingCycle = {
        id: `b-${Date.now()}-${member.id.substring(0, 4)}`,
        messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        memberId: member.id,
        memberName: member.name,
        memberPhone: member.phone,
        month,
        baseMeals,
        approvedLeaveDays,
        rate: member.rate,
        perMealRate: bill.perMealRate,
        amountDue: bill.finalAmountDue,
        amountPaid: 0,
        status: 'unpaid',
        generatedAt: new Date().toISOString(),
      };

      generatedCycles.push(cycle);
    }

    const client = this.supabaseService.getClient();
    if (!client || this.supabaseService.getIsMockMode()) {
      // Update in-memory
      this.inMemoryBilling = [
        ...this.inMemoryBilling.filter((b) => b.month !== month),
        ...generatedCycles,
      ];
      return generatedCycles;
    }

    for (const cycle of generatedCycles) {
      await client.from('billing_cycles').upsert({
        mess_id: cycle.messId,
        member_id: cycle.memberId,
        month: cycle.month,
        base_meals: cycle.baseMeals,
        approved_leave_days: cycle.approvedLeaveDays,
        rate: cycle.rate,
        per_meal_rate: cycle.perMealRate,
        amount_due: cycle.amountDue,
        amount_paid: cycle.amountPaid,
        status: cycle.status,
        generated_at: cycle.generatedAt,
      }, { onConflict: 'member_id,month' });
    }

    return generatedCycles;
  }

  async recordPayment(
    billingCycleId: string,
    dto: RecordPaymentDto,
    user: AuthenticatedUser
  ): Promise<{ cycle: BillingCycle; payment: Payment }> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const cycleIndex = this.inMemoryBilling.findIndex((b) => b.id === billingCycleId);
      if (cycleIndex === -1) throw new NotFoundException('Billing cycle not found');

      const cycle = this.inMemoryBilling[cycleIndex];
      const newPaid = cycle.amountPaid + dto.amount;
      const newStatus = newPaid >= cycle.amountDue ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid';

      const updatedCycle: BillingCycle = {
        ...cycle,
        amountPaid: newPaid,
        status: newStatus,
      };
      this.inMemoryBilling[cycleIndex] = updatedCycle;

      const newPayment: Payment = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        messId: user.messId || cycle.messId,
        billingCycleId,
        amount: dto.amount,
        method: dto.method,
        transactionRef: dto.transactionRef,
        isAdjustment: false,
        paidAt: new Date().toISOString(),
        createdBy: user.userId,
      };
      this.inMemoryPayments.unshift(newPayment);

      return { cycle: updatedCycle, payment: newPayment };
    }

    // Supabase Postgres logic
    const { data: cycle, error: cycleErr } = await client
      .from('billing_cycles')
      .select('*')
      .eq('id', billingCycleId)
      .single();

    if (cycleErr || !cycle) throw new NotFoundException('Billing cycle not found');

    const newPaid = Number(cycle.amount_paid) + dto.amount;
    const newStatus = newPaid >= Number(cycle.amount_due) ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid';

    await client
      .from('billing_cycles')
      .update({ amount_paid: newPaid, status: newStatus })
      .eq('id', billingCycleId);

    const isDemoUser = !user.userId || user.userId.startsWith('00000000');
    const insertPayload: any = {
      mess_id: user.messId,
      billing_cycle_id: billingCycleId,
      amount: dto.amount,
      method: dto.method,
      transaction_ref: dto.transactionRef,
      is_adjustment: false,
      created_by: isDemoUser ? null : user.userId,
    };

    let { data: payment, error: payErr } = await client
      .from('payments')
      .insert(insertPayload)
      .select()
      .single();

    if (payErr && payErr.message.includes('foreign key constraint "payments_created_by_fkey"')) {
      insertPayload.created_by = null;
      const retry = await client
        .from('payments')
        .insert(insertPayload)
        .select()
        .single();
      payment = retry.data;
      payErr = retry.error;
    }

    if (payErr) throw new Error(`Payment failed: ${payErr.message}`);

    return {
      cycle: { ...cycle, amountPaid: newPaid, status: newStatus },
      payment,
    };
  }

  async recordAdjustment(
    billingCycleId: string,
    dto: RecordAdjustmentDto,
    user: AuthenticatedUser
  ): Promise<{ cycle: BillingCycle; payment: Payment }> {
    // Immutable adjustment audit entry
    return this.recordPayment(
      billingCycleId,
      {
        amount: dto.amount,
        method: 'cash',
        transactionRef: `ADJUSTMENT: ${dto.note}`,
      },
      user
    );
  }
}

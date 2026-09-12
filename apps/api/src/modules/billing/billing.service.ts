import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BillingCycle,
  Payment,
  calculateProratedMeals,
  calculateMonthlyBill,
  STANDARD_BASE_MEALS,
} from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { MembersService } from '../members/members.service';
import { LeavesService } from '../leaves/leaves.service';
import { RecordPaymentDto, RecordAdjustmentDto } from './dto/record-payment.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class BillingService {
  private inMemoryBilling: BillingCycle[] = [
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      memberId: 'm1111111-1111-1111-1111-111111111111',
      memberName: 'Rahul Deshmukh',
      memberPhone: '+91 98901 23456',
      month: '2026-09',
      baseMeals: 56,
      approvedLeaveDays: 3,
      rate: 3200,
      perMealRate: 57.14,
      amountDue: 2857,
      amountPaid: 2857,
      status: 'paid',
      generatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      memberId: 'm2222222-2222-2222-2222-222222222222',
      memberName: 'Priya Kulkarni',
      memberPhone: '+91 98902 34567',
      month: '2026-09',
      baseMeals: 56,
      approvedLeaveDays: 0,
      rate: 2800,
      perMealRate: 50.0,
      amountDue: 2800,
      amountPaid: 0,
      status: 'unpaid',
      generatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'b3333333-3333-3333-3333-333333333333',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      memberId: 'm3333333-3333-3333-3333-333333333333',
      memberName: 'Amit Joshi',
      memberPhone: '+91 98903 45678',
      month: '2026-09',
      baseMeals: 56,
      approvedLeaveDays: 1,
      rate: 3200,
      perMealRate: 57.14,
      amountDue: 3086,
      amountPaid: 0,
      status: 'unpaid',
      generatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'b4444444-4444-4444-4444-444444444444',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      memberId: 'm4444444-4444-4444-4444-444444444444',
      memberName: 'Sneha Shinde',
      memberPhone: '+91 98904 56789',
      month: '2026-09',
      baseMeals: 56,
      approvedLeaveDays: 0,
      rate: 2800,
      perMealRate: 50.0,
      amountDue: 2800,
      amountPaid: 1400,
      status: 'partially_paid',
      generatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  private inMemoryPayments: Payment[] = [
    {
      id: 'p1111111-1111-1111-1111-111111111111',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      billingCycleId: 'b1111111-1111-1111-1111-111111111111',
      amount: 2857,
      method: 'upi_link',
      transactionRef: 'UPI/982200112233',
      isAdjustment: false,
      paidAt: '2026-09-05T11:20:00Z',
      createdBy: '00000000-0000-0000-0000-000000000001',
    },
    {
      id: 'p2222222-2222-2222-2222-222222222222',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      billingCycleId: 'b4444444-4444-4444-4444-444444444444',
      amount: 1400,
      method: 'cash',
      isAdjustment: false,
      paidAt: '2026-09-08T18:40:00Z',
      createdBy: '00000000-0000-0000-0000-000000000001',
    },
  ];

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
      perMealRate: Number(row.amount_due) / (row.base_meals || 56),
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

      // 2. Count approved leave days in this month
      const memberLeaves = leaves.filter(
        (l) =>
          l.memberId === member.id &&
          (l.status === 'auto_valid' || l.status === 'approved') &&
          l.startDate.startsWith(month)
      );

      let approvedLeaveDays = 0;
      for (const l of memberLeaves) {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
        approvedLeaveDays += Math.max(1, diffDays);
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
        amount_due: cycle.amountDue,
        amount_paid: cycle.amountPaid,
        status: cycle.status,
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

    const { data: payment, error: payErr } = await client
      .from('payments')
      .insert({
        mess_id: user.messId,
        billing_cycle_id: billingCycleId,
        amount: dto.amount,
        method: dto.method,
        transaction_ref: dto.transactionRef,
        is_adjustment: false,
        created_by: user.userId,
      })
      .select()
      .single();

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

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ExpenseRecurring,
  ExpenseOneOff,
  Staff,
  StaffSalaryPayment,
  StaffAttendanceRecord,
} from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateRecurringExpenseDto,
  CreateOneOffExpenseDto,
  CreateStaffDto,
} from './dto/create-expense.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ExpensesService {
  private inMemoryRecurring: ExpenseRecurring[] = [];
  private inMemoryOneOff: ExpenseOneOff[] = [];
  private inMemoryStaff: Staff[] = [];
  private inMemoryStaffSalaries: StaffSalaryPayment[] = [];
  private inMemoryStaffAttendance: StaffAttendanceRecord[] = [];

  constructor(private supabaseService: SupabaseService) {}

  // 1. Recurring Expenses
  async getRecurringExpenses(user: AuthenticatedUser): Promise<ExpenseRecurring[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      return this.inMemoryRecurring.filter((r) => r.messId === user.messId || !user.messId);
    }

    const { data, error } = await client
      .from('expense_recurring')
      .select('*')
      .eq('mess_id', user.messId);

    if (error) throw new Error(`Failed to fetch recurring expenses: ${error.message}`);
    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      category: row.category,
      payeeName: row.payee_name,
      amount: Number(row.amount),
      frequency: row.frequency,
      nextDueDate: row.next_due_date,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async createRecurringExpense(
    dto: CreateRecurringExpenseDto,
    user: AuthenticatedUser
  ): Promise<ExpenseRecurring> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const newRec: ExpenseRecurring = {
        id: `er-${Date.now()}`,
        messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        category: dto.category,
        payeeName: dto.payeeName,
        amount: dto.amount,
        frequency: 'monthly',
        nextDueDate: dto.nextDueDate,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      this.inMemoryRecurring.unshift(newRec);
      return newRec;
    }

    const { data, error } = await client
      .from('expense_recurring')
      .insert({
        mess_id: user.messId,
        category: dto.category,
        payee_name: dto.payeeName,
        amount: dto.amount,
        frequency: 'monthly',
        next_due_date: dto.nextDueDate,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create recurring expense: ${error.message}`);
    return {
      id: data.id,
      messId: data.mess_id,
      category: data.category,
      payeeName: data.payee_name,
      amount: Number(data.amount),
      frequency: data.frequency,
      nextDueDate: data.next_due_date,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  async confirmRecurringCycle(
    id: string,
    month: string,
    user: AuthenticatedUser
  ): Promise<ExpenseRecurring> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const rec = this.inMemoryRecurring.find((r) => r.id === id);
      if (!rec) throw new NotFoundException('Recurring expense not found');
      rec.lastConfirmedMonth = month;
      return rec;
    }

    // Persist confirmed month to Supabase
    const { data, error } = await client
      .from('expense_recurring')
      .update({ last_confirmed_month: month })
      .eq('id', id)
      .eq('mess_id', user.messId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Recurring expense not found or update failed');

    return {
      id: data.id,
      messId: data.mess_id,
      category: data.category,
      payeeName: data.payee_name,
      amount: Number(data.amount),
      frequency: data.frequency,
      nextDueDate: data.next_due_date,
      isActive: data.is_active,
      lastConfirmedMonth: data.last_confirmed_month,
      createdAt: data.created_at,
    };
  }

  // 2. One-Off Expenses
  async getOneOffExpenses(user: AuthenticatedUser, month?: string): Promise<ExpenseOneOff[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryOneOff.filter((o) => o.messId === user.messId || !user.messId);
      if (month) {
        list = list.filter((o) => o.date.startsWith(month));
      }
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    let query = client
      .from('expense_oneoff')
      .select('*')
      .eq('mess_id', user.messId)
      .order('date', { ascending: false });

    if (month) {
      const [y, m] = month.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const lastDateStr = `${month}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('date', `${month}-01`).lte('date', lastDateStr);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch one-off expenses: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      category: row.category,
      amount: Number(row.amount),
      date: row.date,
      note: row.note,
      createdBy: row.created_by || 'Mess Owner',
      createdAt: row.created_at,
    }));
  }

  async createOneOffExpense(
    dto: CreateOneOffExpenseDto,
    user: AuthenticatedUser
  ): Promise<ExpenseOneOff> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const newOneOff: ExpenseOneOff = {
        id: `eo-${Date.now()}`,
        messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        category: dto.category,
        amount: dto.amount,
        date: dto.date,
        note: dto.note,
        createdBy: user.name || 'Mess Owner',
        createdAt: new Date().toISOString(),
      };
      this.inMemoryOneOff.unshift(newOneOff);
      return newOneOff;
    }

    const { data, error } = await client
      .from('expense_oneoff')
      .insert({
        mess_id: user.messId,
        category: dto.category,
        amount: dto.amount,
        date: dto.date,
        note: dto.note,
        created_by: user.userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create one-off expense: ${error.message}`);

    return {
      id: data.id,
      messId: data.mess_id,
      category: data.category,
      amount: Number(data.amount),
      date: data.date,
      note: data.note,
      createdBy: user.name || 'Mess Owner',
      createdAt: data.created_at,
    };
  }

  // 3. Lightweight Staff
  async getStaff(user: AuthenticatedUser): Promise<Staff[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      return this.inMemoryStaff.filter((s) => s.messId === user.messId || !user.messId);
    }

    const { data, error } = await client
      .from('staff')
      .select('*')
      .eq('mess_id', user.messId);

    if (error) throw new Error(`Failed to fetch staff: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      name: row.name,
      role: row.role,
      monthlySalary: Number(row.monthly_salary),
      phone: row.phone,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async createStaff(dto: CreateStaffDto, user: AuthenticatedUser): Promise<Staff> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const newStaff: Staff = {
        id: `s-${Date.now()}`,
        messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: dto.name,
        role: dto.role,
        monthlySalary: dto.monthlySalary,
        phone: dto.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      this.inMemoryStaff.push(newStaff);

      // Also automatically create a recurring salary expense entry
      this.inMemoryRecurring.push({
        id: `er-salary-${newStaff.id}`,
        messId: newStaff.messId,
        category: 'salary',
        payeeName: `${newStaff.name} (${newStaff.role})`,
        amount: newStaff.monthlySalary,
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().substring(0, 8) + '07',
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      return newStaff;
    }

    const { data, error } = await client
      .from('staff')
      .insert({
        mess_id: user.messId,
        name: dto.name,
        role: dto.role,
        monthly_salary: dto.monthlySalary,
        phone: dto.phone,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create staff: ${error.message}`);

    return {
      id: data.id,
      messId: data.mess_id,
      name: data.name,
      role: data.role,
      monthlySalary: Number(data.monthly_salary),
      phone: data.phone,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  // 4. Staff Salary Ledger
  async getStaffSalaryHistory(user: AuthenticatedUser, staffId?: string, month?: string): Promise<StaffSalaryPayment[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryStaffSalaries.filter((s) => s.messId === user.messId || !user.messId);
      if (staffId) list = list.filter((s) => s.staffId === staffId);
      if (month) list = list.filter((s) => s.month === month);
      return list;
    }

    let query = client
      .from('staff_salary_payments')
      .select('*')
      .eq('mess_id', user.messId)
      .order('paid_date', { ascending: false });

    if (staffId) query = query.eq('staff_id', staffId);
    if (month) query = query.eq('month', month);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch staff salary history: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      staffId: row.staff_id,
      staffName: row.staff_name,
      month: row.month,
      baseSalary: Number(row.base_salary),
      advanceDeductions: Number(row.advance_deductions || 0),
      bonusAmount: Number(row.bonus_amount || 0),
      netPaid: Number(row.net_paid),
      paymentType: row.payment_type,
      paymentMethod: row.payment_method,
      paidDate: row.paid_date,
      note: row.note,
      voucherNumber: row.voucher_number,
      createdAt: row.created_at,
    }));
  }

  async recordStaffSalaryPayment(payment: StaffSalaryPayment, user: AuthenticatedUser): Promise<StaffSalaryPayment> {
    const client = this.supabaseService.getClient();

    const newPayment: StaffSalaryPayment = {
      ...payment,
      id: payment.id || `sp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      messId: user.messId || payment.messId,
      createdAt: payment.createdAt || new Date().toISOString(),
    };

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryStaffSalaries.unshift(newPayment);
      return newPayment;
    }

    const { data, error } = await client
      .from('staff_salary_payments')
      .upsert({
        id: newPayment.id,
        mess_id: newPayment.messId,
        staff_id: newPayment.staffId,
        staff_name: newPayment.staffName,
        month: newPayment.month,
        base_salary: newPayment.baseSalary,
        advance_deductions: newPayment.advanceDeductions,
        bonus_amount: newPayment.bonusAmount || 0,
        net_paid: newPayment.netPaid,
        payment_type: newPayment.paymentType,
        payment_method: newPayment.paymentMethod,
        paid_date: newPayment.paidDate,
        note: newPayment.note,
        voucher_number: newPayment.voucherNumber,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to record staff salary payment: ${error.message}`);

    return {
      id: data.id,
      messId: data.mess_id,
      staffId: data.staff_id,
      staffName: data.staff_name,
      month: data.month,
      baseSalary: Number(data.base_salary),
      advanceDeductions: Number(data.advance_deductions),
      bonusAmount: Number(data.bonus_amount || 0),
      netPaid: Number(data.net_paid),
      paymentType: data.payment_type,
      paymentMethod: data.payment_method,
      paidDate: data.paid_date,
      note: data.note,
      voucherNumber: data.voucher_number,
      createdAt: data.created_at,
    };
  }

  // 5. Staff Attendance
  async getStaffAttendance(user: AuthenticatedUser, staffId?: string, month?: string): Promise<StaffAttendanceRecord[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryStaffAttendance.filter((s) => s.messId === user.messId || !user.messId);
      if (staffId) list = list.filter((s) => s.staffId === staffId);
      if (month) list = list.filter((s) => s.date.startsWith(month));
      return list;
    }

    let query = client
      .from('staff_attendance')
      .select('*')
      .eq('mess_id', user.messId)
      .order('date', { ascending: false });

    if (staffId) query = query.eq('staff_id', staffId);
    if (month) query = query.like('date', `${month}%`);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch staff attendance: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      staffId: row.staff_id,
      date: row.date,
      status: row.status,
      notes: row.notes,
    }));
  }

  async recordStaffAttendance(record: StaffAttendanceRecord, user: AuthenticatedUser): Promise<StaffAttendanceRecord> {
    const client = this.supabaseService.getClient();

    const newRec: StaffAttendanceRecord = {
      ...record,
      id: record.id || `att-${Date.now()}-${record.staffId.substring(0, 4)}`,
      messId: user.messId || record.messId,
    };

    if (!client || this.supabaseService.getIsMockMode()) {
      const idx = this.inMemoryStaffAttendance.findIndex(
        (a) => a.staffId === newRec.staffId && a.date === newRec.date
      );
      if (idx >= 0) {
        this.inMemoryStaffAttendance[idx] = newRec;
      } else {
        this.inMemoryStaffAttendance.push(newRec);
      }
      return newRec;
    }

    const { data, error } = await client
      .from('staff_attendance')
      .upsert({
        id: newRec.id,
        mess_id: newRec.messId,
        staff_id: newRec.staffId,
        date: newRec.date,
        status: newRec.status,
        notes: newRec.notes,
      }, { onConflict: 'staff_id,date' })
      .select()
      .single();

    if (error) throw new Error(`Failed to record staff attendance: ${error.message}`);

    return {
      id: data.id,
      messId: data.mess_id,
      staffId: data.staff_id,
      date: data.date,
      status: data.status,
      notes: data.notes,
    };
  }
}

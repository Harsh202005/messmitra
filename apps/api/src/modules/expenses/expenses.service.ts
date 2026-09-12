import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ExpenseRecurring,
  ExpenseOneOff,
  Staff,
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
  private inMemoryRecurring: ExpenseRecurring[] = [
    {
      id: 'er-1',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      category: 'rent',
      payeeName: 'Mess Space Landlord (श्री कुलकर्णी)',
      amount: 15000,
      frequency: 'monthly',
      nextDueDate: '2026-09-05',
      isActive: true,
      lastConfirmedMonth: '2026-09',
      createdAt: '2026-06-01T00:00:00Z',
    },
    {
      id: 'er-2',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      category: 'salary',
      payeeName: 'Mahadev Mama (महाराज / Cook)',
      amount: 18000,
      frequency: 'monthly',
      nextDueDate: '2026-09-07',
      isActive: true,
      lastConfirmedMonth: '2026-09',
      createdAt: '2026-06-01T00:00:00Z',
    },
    {
      id: 'er-3',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      category: 'gas',
      payeeName: 'Commercial HP Gas Cylinder (2 cylinders/mo)',
      amount: 3600,
      frequency: 'monthly',
      nextDueDate: '2026-09-10',
      isActive: true,
      lastConfirmedMonth: '2026-09',
      createdAt: '2026-06-01T00:00:00Z',
    },
  ];

  private inMemoryOneOff: ExpenseOneOff[] = [
    {
      id: 'eo-1',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      category: 'vegetables',
      amount: 1450,
      date: '2026-09-02',
      note: 'Fresh market vegetables (मंडी खरेदी)',
      createdBy: 'Ganesh Balaji Patil',
      createdAt: '2026-09-02T08:00:00Z',
    },
    {
      id: 'eo-2',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      category: 'dairy',
      amount: 840,
      date: '2026-09-05',
      note: 'Milk, Curd, Paneer for feast day',
      createdBy: 'Ganesh Balaji Patil',
      createdAt: '2026-09-05T07:30:00Z',
    },
    {
      id: 'eo-3',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      category: 'groceries',
      amount: 4200,
      date: '2026-09-08',
      note: 'Kolam Rice & Toor Dal sack',
      createdBy: 'Ganesh Balaji Patil',
      createdAt: '2026-09-08T16:00:00Z',
    },
  ];

  private inMemoryStaff: Staff[] = [
    {
      id: 's1111111-1111-1111-1111-111111111111',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Mahadev Mama',
      role: 'Head Cook (महाराज)',
      monthlySalary: 18000,
      phone: '+91 97654 32101',
      isActive: true,
      createdAt: '2026-06-01T00:00:00Z',
    },
    {
      id: 's2222222-2222-2222-2222-222222222222',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Santosh',
      role: 'Helper & Cleaning',
      monthlySalary: 10000,
      phone: '+91 97654 32102',
      isActive: true,
      createdAt: '2026-06-01T00:00:00Z',
    },
  ];

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
    const rec = this.inMemoryRecurring.find((r) => r.id === id);
    if (!rec) throw new NotFoundException('Recurring expense not found');
    rec.lastConfirmedMonth = month;
    return rec;
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
      query = query.gte('date', `${month}-01`).lte('date', `${month}-31`);
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
}

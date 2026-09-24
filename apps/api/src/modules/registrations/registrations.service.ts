import { Injectable, NotFoundException } from '@nestjs/common';
import { PendingRegistration, ApprovalStatus } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { MembersService } from '../members/members.service';
import { ExpensesService } from '../expenses/expenses.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class RegistrationsService {
  private inMemoryRegistrations: PendingRegistration[] = [];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly membersService: MembersService,
    private readonly expensesService: ExpensesService
  ) {}

  async getRegistrations(user: AuthenticatedUser, status?: ApprovalStatus): Promise<PendingRegistration[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryRegistrations.filter((r) => r.messId === user.messId || !user.messId);
      if (status) list = list.filter((r) => r.status === status);
      return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    let query = client
      .from('pending_registrations')
      .select('*')
      .eq('mess_id', user.messId)
      .order('submitted_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch pending registrations: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      name: row.name,
      phone: row.phone,
      role: row.role,
      dietPreference: row.diet_preference,
      planType: row.plan_type,
      rate: Number(row.rate || 3000),
      staffRole: row.staff_role,
      salary: Number(row.salary || 0),
      submittedAt: row.submitted_at,
      status: row.status,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
    }));
  }

  async submitRegistration(dto: Omit<PendingRegistration, 'id' | 'submittedAt' | 'status'>): Promise<PendingRegistration> {
    const client = this.supabaseService.getClient();
    const newReg: PendingRegistration = {
      ...dto,
      id: `reg-${Date.now()}`,
      messId: dto.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      submittedAt: new Date().toISOString(),
      status: 'pending_approval',
    };

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryRegistrations.unshift(newReg);
      return newReg;
    }

    const { data, error } = await client
      .from('pending_registrations')
      .insert({
        id: newReg.id,
        mess_id: newReg.messId,
        name: newReg.name,
        phone: newReg.phone,
        role: newReg.role,
        diet_preference: newReg.dietPreference || 'veg',
        plan_type: newReg.planType || 'both',
        rate: newReg.rate || 3000,
        staff_role: newReg.staffRole,
        salary: newReg.salary,
        password: newReg.password,
        submitted_at: newReg.submittedAt,
        status: 'pending_approval',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to submit registration: ${error.message}`);

    return {
      id: data.id,
      messId: data.mess_id,
      name: data.name,
      phone: data.phone,
      role: data.role,
      dietPreference: data.diet_preference,
      planType: data.plan_type,
      rate: Number(data.rate),
      staffRole: data.staff_role,
      salary: Number(data.salary),
      submittedAt: data.submitted_at,
      status: data.status,
    };
  }

  async reviewRegistration(
    id: string,
    status: 'approved' | 'rejected',
    user: AuthenticatedUser
  ): Promise<PendingRegistration> {
    const client = this.supabaseService.getClient();
    const reviewedAt = new Date().toISOString();
    const reviewedBy = user.name || 'शंकर गिरी';

    let target: PendingRegistration | undefined;

    if (!client || this.supabaseService.getIsMockMode()) {
      const idx = this.inMemoryRegistrations.findIndex((r) => r.id === id);
      if (idx === -1) throw new NotFoundException('Registration not found');
      this.inMemoryRegistrations[idx].status = status;
      this.inMemoryRegistrations[idx].reviewedAt = reviewedAt;
      this.inMemoryRegistrations[idx].reviewedBy = reviewedBy;
      target = this.inMemoryRegistrations[idx];
    } else {
      const { data, error } = await client
        .from('pending_registrations')
        .update({
          status,
          reviewed_at: reviewedAt,
          reviewed_by: reviewedBy,
        })
        .eq('id', id)
        .eq('mess_id', user.messId)
        .select()
        .single();

      if (error || !data) throw new NotFoundException('Registration not found');

      target = {
        id: data.id,
        messId: data.mess_id,
        name: data.name,
        phone: data.phone,
        role: data.role,
        dietPreference: data.diet_preference,
        planType: data.plan_type,
        rate: Number(data.rate),
        staffRole: data.staff_role,
        salary: Number(data.salary),
        submittedAt: data.submitted_at,
        status: data.status,
        reviewedAt: data.reviewed_at,
        reviewedBy: data.reviewed_by,
      };
    }

    // If approved, automatically enroll member or staff
    if (status === 'approved' && target) {
      if (target.role === 'member') {
        await this.membersService.createMember(
          {
            name: target.name,
            phone: target.phone,
            gender: 'other',
            dietPreference: target.dietPreference || 'veg',
            rate: target.rate || (target.dietPreference === 'veg' ? 3000 : 3200),
            planType: target.planType || 'both',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'active',
          },
          user
        );
      } else if (target.role === 'staff') {
        await this.expensesService.createStaff(
          {
            name: target.name,
            role: target.staffRole || 'सहाय्यक आचारी',
            monthlySalary: target.salary || 12000,
            phone: target.phone,
          },
          user
        );
      }
    }

    return target;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Member, DailyCookForecast, MemberStatus, isNonVegDay } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class MembersService {
  // In-memory members store for offline/mock mode
  private inMemoryMembers: Member[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async getMembers(
    user: AuthenticatedUser,
    statusFilter?: MemberStatus,
    search?: string
  ): Promise<Member[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryMembers.filter((m) => m.messId === user.messId || !user.messId);
      if (statusFilter) {
        list = list.filter((m) => m.status === statusFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (m) => m.name.toLowerCase().includes(q) || m.phone.includes(q)
        );
      }
      return list;
    }

    let query = client
      .from('members')
      .select('*')
      .eq('mess_id', user.messId)
      .order('name', { ascending: true });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch members: ${error.message}`);
    }

    return (data || []).map(this.mapFromDb);
  }

  async getMemberById(id: string, user: AuthenticatedUser): Promise<Member> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const found = this.inMemoryMembers.find((m) => m.id === id);
      if (!found) throw new NotFoundException('Member not found');
      return found;
    }

    const { data, error } = await client
      .from('members')
      .select('*')
      .eq('id', id)
      .eq('mess_id', user.messId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Member not found');
    }

    return this.mapFromDb(data);
  }

  async createMember(dto: CreateMemberDto, user: AuthenticatedUser): Promise<Member> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const newMember: Member = {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: dto.name,
        phone: dto.phone,
        gender: dto.gender,
        dietPreference: dto.dietPreference || 'veg',
        rate: dto.rate,
        planType: dto.planType,
        joinDate: dto.joinDate,
        status: dto.status || 'active',
        createdAt: new Date().toISOString(),
      };
      this.inMemoryMembers.unshift(newMember);
      return newMember;
    }

    const { data, error } = await client
      .from('members')
      .insert({
        mess_id: user.messId,
        name: dto.name,
        phone: dto.phone,
        gender: dto.gender,
        diet_preference: dto.dietPreference || 'veg',
        rate: dto.rate,
        plan_type: dto.planType,
        join_date: dto.joinDate,
        status: dto.status || 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create member: ${error.message}`);
    }

    return this.mapFromDb(data);
  }

  async updateMember(
    id: string,
    dto: UpdateMemberDto,
    user: AuthenticatedUser
  ): Promise<Member> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const index = this.inMemoryMembers.findIndex((m) => m.id === id);
      if (index === -1) throw new NotFoundException('Member not found');

      const updated = {
        ...this.inMemoryMembers[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      this.inMemoryMembers[index] = updated;
      return updated;
    }

    const { data, error } = await client
      .from('members')
      .update({
        ...(dto.name && { name: dto.name }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.dietPreference && { diet_preference: dto.dietPreference }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
        ...(dto.planType && { plan_type: dto.planType }),
        ...(dto.joinDate && { join_date: dto.joinDate }),
        ...(dto.status && { status: dto.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('mess_id', user.messId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update member: ${error.message}`);
    }

    return this.mapFromDb(data);
  }

  async toggleMemberStatus(
    id: string,
    status: MemberStatus,
    user: AuthenticatedUser
  ): Promise<Member> {
    return this.updateMember(id, { status }, user);
  }

  async getCookForecast(user: AuthenticatedUser, targetDateStr?: string): Promise<DailyCookForecast> {
    const targetDate = targetDateStr || new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Default tomorrow
    const members = await this.getMembers(user, 'active');
    const client = this.supabaseService.getClient();

    // ---------- Determine which members are on approved leave for targetDate ----------
    let membersOnLeaveIds: Set<string> = new Set();

    if (!client || this.supabaseService.getIsMockMode()) {
      // In-memory: filter the shared in-memory leaves array (re-query via Supabase service)
      // We directly check the date range here without importing LeavesService (avoids circular dep)
      const DEMO_LEAVES = [
        { memberId: 'm1111111-1111-1111-1111-111111111111', startDate: '2026-09-12', endDate: '2026-09-14', status: 'auto_valid' },
        { memberId: 'm3333333-3333-3333-3333-333333333333', startDate: '2026-09-11', endDate: '2026-09-11', status: 'pending_approval' },
      ];
      for (const l of DEMO_LEAVES) {
        if (
          (l.status === 'auto_valid' || l.status === 'approved') &&
          l.startDate <= targetDate &&
          l.endDate >= targetDate
        ) {
          membersOnLeaveIds.add(l.memberId);
        }
      }
    } else {
      // Real Supabase query — find approved leaves overlapping the target date
      const { data: leaves } = await client
        .from('leave_requests')
        .select('member_id, status')
        .eq('mess_id', user.messId)
        .in('status', ['auto_valid', 'approved'])
        .lte('start_date', targetDate)
        .gte('end_date', targetDate);

      (leaves || []).forEach((l: { member_id: string }) => membersOnLeaveIds.add(l.member_id));
    }

    const membersOnLeaveCount = membersOnLeaveIds.size;
    const presentMembers = members.filter((m) => !membersOnLeaveIds.has(m.id));

    const lunchCount = presentMembers.filter((m) => m.planType === 'both' || m.planType === 'lunch').length;
    const dinnerCount = presentMembers.filter((m) => m.planType === 'both' || m.planType === 'dinner').length;
    
    // Schedule rule: Lunch is ALWAYS 100% pure veg. Dinner is non-veg only on Wed (3), Fri (5), Sun (0).
    const isTargetNonVegDay = isNonVegDay(targetDate);
    
    const lunchVegCount = lunchCount; // 100% pure veg
    const dinnerNonVegCount = isTargetNonVegDay
      ? presentMembers.filter(
          (m) => m.dietPreference === 'nonveg' && (m.planType === 'both' || m.planType === 'dinner')
        ).length
      : 0;
    const dinnerVegCount = dinnerCount - dinnerNonVegCount;

    const vegCount = lunchVegCount + dinnerVegCount;
    const nonVegCount = dinnerNonVegCount;

    return {
      date: targetDate,
      totalActiveMembers: members.length,
      membersOnLeave: membersOnLeaveCount,
      cookForCount: presentMembers.length,
      lunchCount,
      dinnerCount,
      vegCount,
      nonVegCount,
      lunchVegCount,
      dinnerVegCount,
      dinnerNonVegCount,
    };
  }

  private mapFromDb(row: any): Member {
    return {
      id: row.id,
      messId: row.mess_id,
      userId: row.user_id,
      name: row.name,
      phone: row.phone,
      gender: row.gender,
      dietPreference: row.diet_preference || 'veg',
      rate: Number(row.rate),
      planType: row.plan_type,
      joinDate: row.join_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

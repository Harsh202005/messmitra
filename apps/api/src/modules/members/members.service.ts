import { Injectable, NotFoundException } from '@nestjs/common';
import { Member, DailyCookForecast, MemberStatus } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class MembersService {
  // In-memory initial members for demo/mock mode
  private inMemoryMembers: Member[] = [
    {
      id: 'm1111111-1111-1111-1111-111111111111',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Rahul Deshmukh',
      phone: '+91 98901 23456',
      gender: 'male',
      dietPreference: 'nonveg',
      rate: 3200,
      planType: 'both',
      joinDate: '2026-06-01',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm2222222-2222-2222-2222-222222222222',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Priya Kulkarni',
      phone: '+91 98902 34567',
      gender: 'female',
      dietPreference: 'veg',
      rate: 3000,
      planType: 'both',
      joinDate: '2026-07-15',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm3333333-3333-3333-3333-333333333333',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Amit Joshi',
      phone: '+91 98903 45678',
      gender: 'male',
      dietPreference: 'nonveg',
      rate: 3200,
      planType: 'both',
      joinDate: '2026-08-01',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm4444444-4444-4444-4444-444444444444',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Sneha Shinde',
      phone: '+91 98904 56789',
      gender: 'female',
      dietPreference: 'veg',
      rate: 3000,
      planType: 'both',
      joinDate: '2026-08-10',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm5555555-5555-5555-5555-555555555555',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Omkar Jadhav',
      phone: '+91 98905 67890',
      gender: 'male',
      dietPreference: 'veg',
      rate: 1500,
      planType: 'lunch',
      joinDate: '2026-09-01',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm6666666-6666-6666-6666-666666666666',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Tanvi Pawar',
      phone: '+91 98906 78901',
      gender: 'female',
      dietPreference: 'nonveg',
      rate: 1600,
      planType: 'dinner',
      joinDate: '2026-09-05',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm7777777-7777-7777-7777-777777777777',
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: 'Vikas Gaikwad',
      phone: '+91 98907 89012',
      gender: 'male',
      dietPreference: 'nonveg',
      rate: 3200,
      planType: 'both',
      joinDate: '2026-05-10',
      status: 'inactive',
      createdAt: new Date().toISOString(),
    },
  ];

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
        dietPreference: dto.dietPreference || (dto.gender === 'female' ? 'veg' : 'nonveg'),
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
        diet_preference: dto.dietPreference || (dto.gender === 'female' ? 'veg' : 'nonveg'),
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
    
    // In mock/supabase mode, compute members on approved leave for targetDate
    // For now, mock 1-2 members on leave for demo
    const membersOnLeave = 1;
    const lunchCount = members.filter(m => m.planType === 'both' || m.planType === 'lunch').length - membersOnLeave;
    const dinnerCount = members.filter(m => m.planType === 'both' || m.planType === 'dinner').length - membersOnLeave;
    const totalCookFor = Math.max(0, members.length - membersOnLeave);

    const vegMembers = members.filter((m) => m.dietPreference === 'veg');
    const nonVegMembers = members.filter((m) => m.dietPreference === 'nonveg');

    return {
      date: targetDate,
      totalActiveMembers: members.length,
      membersOnLeave,
      cookForCount: totalCookFor,
      lunchCount: Math.max(0, lunchCount),
      dinnerCount: Math.max(0, dinnerCount),
      vegCount: vegMembers.length,
      nonVegCount: Math.max(0, nonVegMembers.length - membersOnLeave),
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
      dietPreference: row.diet_preference || (row.gender === 'female' ? 'veg' : 'nonveg'),
      rate: Number(row.rate),
      planType: row.plan_type,
      joinDate: row.join_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { LeaveRequest, LeaveStatus, isLeaveSubmissionLate } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { MessService } from '../mess/mess.service';
import { MembersService } from '../members/members.service';
import { CreateLeaveDto, ReviewLeaveDto } from './dto/create-leave.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class LeavesService {
  private inMemoryLeaves: LeaveRequest[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private messService: MessService,
    private membersService: MembersService
  ) {}

  async getLeaves(user: AuthenticatedUser, status?: LeaveStatus): Promise<LeaveRequest[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryLeaves.filter((l) => l.messId === user.messId || !user.messId);
      if (status) {
        list = list.filter((l) => l.status === status);
      }
      return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    let query = client
      .from('leave_requests')
      .select('*, members(name, phone)')
      .eq('mess_id', user.messId)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch leaves: ${error.message}`);
    }

    return (data || []).map((row) => ({
      id: row.id,
      messId: row.mess_id,
      memberId: row.member_id,
      memberName: row.members?.name || 'Member',
      memberPhone: row.members?.phone,
      startDate: row.start_date,
      endDate: row.end_date,
      submittedAt: row.submitted_at,
      status: row.status,
      isLate: row.is_late,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      reason: row.reason,
      createdAt: row.created_at,
    }));
  }

  async submitLeave(dto: CreateLeaveDto, user: AuthenticatedUser): Promise<LeaveRequest> {
    const mess = await this.messService.getMessDetails(user);
    const member = await this.membersService.getMemberById(dto.memberId, user);

    const now = new Date();
    const isLate = isLeaveSubmissionLate(
      now,
      dto.startDate,
      mess.dailyCutoffTime || '09:00',
      member.planType,
      mess.lunchCutoffTime || '09:00',
      mess.dinnerCutoffTime || '18:00'
    );
    const status: LeaveStatus = isLate ? 'pending_approval' : 'auto_valid';

    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const newLeave: LeaveRequest = {
        id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        messId: user.messId || mess.id,
        memberId: dto.memberId,
        memberName: member.name,
        memberPhone: member.phone,
        startDate: dto.startDate,
        endDate: dto.endDate,
        submittedAt: now.toISOString(),
        status,
        isLate,
        reason: dto.reason,
        createdAt: now.toISOString(),
      };
      this.inMemoryLeaves.unshift(newLeave);
      return newLeave;
    }

    const { data, error } = await client
      .from('leave_requests')
      .insert({
        mess_id: user.messId,
        member_id: dto.memberId,
        start_date: dto.startDate,
        end_date: dto.endDate,
        submitted_at: now.toISOString(),
        status,
        is_late: isLate,
        reason: dto.reason,
      })
      .select('*, members(name, phone)')
      .single();

    if (error) {
      throw new Error(`Failed to submit leave: ${error.message}`);
    }

    return {
      id: data.id,
      messId: data.mess_id,
      memberId: data.member_id,
      memberName: data.members?.name || member.name,
      memberPhone: data.members?.phone || member.phone,
      startDate: data.start_date,
      endDate: data.end_date,
      submittedAt: data.submitted_at,
      status: data.status,
      isLate: data.is_late,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      reason: data.reason,
      createdAt: data.created_at,
    };
  }

  async reviewLeave(
    id: string,
    dto: ReviewLeaveDto,
    user: AuthenticatedUser
  ): Promise<LeaveRequest> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const index = this.inMemoryLeaves.findIndex((l) => l.id === id);
      if (index === -1) throw new NotFoundException('Leave request not found');

      const updated = {
        ...this.inMemoryLeaves[index],
        status: dto.status as LeaveStatus,
        reviewedBy: user.userId,
        reviewedAt: new Date().toISOString(),
      };
      this.inMemoryLeaves[index] = updated;
      return updated;
    }

    const { data, error } = await client
      .from('leave_requests')
      .update({
        status: dto.status,
        reviewed_by: user.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('mess_id', user.messId)
      .select('*, members(name, phone)')
      .single();

    if (error) {
      throw new Error(`Failed to review leave: ${error.message}`);
    }

    return {
      id: data.id,
      messId: data.mess_id,
      memberId: data.member_id,
      memberName: data.members?.name,
      memberPhone: data.members?.phone,
      startDate: data.start_date,
      endDate: data.end_date,
      submittedAt: data.submitted_at,
      status: data.status,
      isLate: data.is_late,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      reason: data.reason,
      createdAt: data.created_at,
    };
  }
}

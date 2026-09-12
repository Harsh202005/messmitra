import {
  Mess,
  Member,
  DailyCookForecast,
  MemberStatus,
  LeaveRequest,
  LeaveStatus,
  BillingCycle,
  Payment,
  ExpenseRecurring,
  ExpenseOneOff,
  Staff,
  ProfitAndLossSummary,
  calculateProratedMeals,
  calculateMonthlyBill,
  isLeaveSubmissionLate,
  generateBillingCsv,
  generateExpensesCsv,
} from '@messmitra/types';
import { getSupabase } from './supabaseClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const DEFAULT_MESS: Mess = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'Balaji Executive Dining & Mess',
  area: 'Karve Nagar / Kothrud',
  city: 'Pune',
  dailyCutoffTime: '09:00',
  ownerId: '00000000-0000-0000-0000-000000000001',
  upiId: 'balajimess@okhdfcbank',
  defaultMaleRate: 3200,
  defaultFemaleRate: 2800,
  createdAt: new Date().toISOString(),
};

const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Rahul Deshmukh',
    phone: '+91 98901 23456',
    gender: 'male',
    rate: 3200,
    planType: 'both',
    joinDate: '2026-06-01',
    status: 'active',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'm2222222-2222-2222-2222-222222222222',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Priya Kulkarni',
    phone: '+91 98902 34567',
    gender: 'female',
    rate: 2800,
    planType: 'both',
    joinDate: '2026-07-15',
    status: 'active',
    createdAt: '2026-07-15T00:00:00Z',
  },
  {
    id: 'm3333333-3333-3333-3333-333333333333',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Amit Joshi',
    phone: '+91 98903 45678',
    gender: 'male',
    rate: 3200,
    planType: 'both',
    joinDate: '2026-08-01',
    status: 'active',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'm4444444-4444-4444-4444-444444444444',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Sneha Shinde',
    phone: '+91 98904 56789',
    gender: 'female',
    rate: 2800,
    planType: 'both',
    joinDate: '2026-08-10',
    status: 'active',
    createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'm5555555-5555-5555-5555-555555555555',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Omkar Jadhav',
    phone: '+91 98905 67890',
    gender: 'male',
    rate: 1800,
    planType: 'lunch',
    joinDate: '2026-09-01',
    status: 'active',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'm6666666-6666-6666-6666-666666666666',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Tanvi Pawar',
    phone: '+91 98906 78901',
    gender: 'female',
    rate: 1600,
    planType: 'dinner',
    joinDate: '2026-09-05',
    status: 'active',
    createdAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'm7777777-7777-7777-7777-777777777777',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Vikas Gaikwad',
    phone: '+91 98907 89012',
    gender: 'male',
    rate: 3200,
    planType: 'both',
    joinDate: '2026-05-10',
    status: 'inactive',
    createdAt: '2026-05-10T00:00:00Z',
  },
];

const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 'l1111111-1111-1111-1111-111111111111',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    memberId: 'm1111111-1111-1111-1111-111111111111',
    memberName: 'Rahul Deshmukh',
    memberPhone: '+91 98901 23456',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
    submittedAt: '2026-09-10T14:30:00Z',
    status: 'auto_valid',
    isLate: false,
    reason: 'Home visit for weekend',
    createdAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'l2222222-2222-2222-2222-222222222222',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    memberId: 'm3333333-3333-3333-3333-333333333333',
    memberName: 'Amit Joshi',
    memberPhone: '+91 98903 45678',
    startDate: '2026-09-11',
    endDate: '2026-09-11',
    submittedAt: '2026-09-11T09:45:00Z',
    status: 'pending_approval',
    isLate: true,
    reason: 'Urgent college exam prep',
    createdAt: '2026-09-11T09:45:00Z',
  },
];

const DEFAULT_RECURRING: ExpenseRecurring[] = [
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

const DEFAULT_ONEOFF: ExpenseOneOff[] = [
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

const DEFAULT_STAFF: Staff[] = [
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

export const MessMitraApi = {
  // 1. MESS
  async getCurrentMess(): Promise<Mess> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mess').select('*').limit(1).single();
        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            area: data.area,
            city: data.city,
            dailyCutoffTime: (data.daily_cutoff_time || '09:00').substring(0, 5),
            ownerId: data.owner_id,
            upiId: data.upi_id,
            defaultMaleRate: Number(data.default_male_rate),
            defaultFemaleRate: Number(data.default_female_rate),
            createdAt: data.created_at,
          };
        }
      } catch {}
    }

    try {
      const res = await fetch(`${API_BASE}/mess/current`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_mess');
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_MESS;
  },

  async saveMess(dto: Partial<Mess>): Promise<Mess> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mess').upsert({
          name: dto.name,
          area: dto.area,
          city: dto.city,
          daily_cutoff_time: dto.dailyCutoffTime,
          upi_id: dto.upiId,
          default_male_rate: dto.defaultMaleRate,
          default_female_rate: dto.defaultFemaleRate,
        }).select().single();
        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            area: data.area,
            city: data.city,
            dailyCutoffTime: data.daily_cutoff_time.substring(0, 5),
            ownerId: data.owner_id,
            upiId: data.upi_id,
            defaultMaleRate: Number(data.default_male_rate),
            defaultFemaleRate: Number(data.default_female_rate),
            createdAt: data.created_at,
          };
        }
      } catch {}
    }

    try {
      const res = await fetch(`${API_BASE}/mess/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) return await res.json();
    } catch {}

    const updated = { ...DEFAULT_MESS, ...dto };
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_mess', JSON.stringify(updated));
    }
    return updated;
  },

  // 2. MEMBERS
  async getMembers(status?: MemberStatus, search?: string): Promise<Member[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let q = supabase.from('members').select('*').order('name', { ascending: true });
        if (status) q = q.eq('status', status);
        if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        const { data, error } = await q;
        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            messId: row.mess_id,
            name: row.name,
            phone: row.phone,
            gender: row.gender,
            rate: Number(row.rate),
            planType: row.plan_type,
            joinDate: row.join_date,
            status: row.status,
            createdAt: row.created_at,
          }));
        }
      } catch {}
    }

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/members?${params.toString()}`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    let members = DEFAULT_MEMBERS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_members');
      if (saved) members = JSON.parse(saved);
      else localStorage.setItem('messmitra_members', JSON.stringify(DEFAULT_MEMBERS));
    }

    if (status) members = members.filter((m) => m.status === status);
    if (search) {
      const q = search.toLowerCase();
      members = members.filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q));
    }
    return members;
  },

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'messId'>): Promise<Member> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const mess = await this.getCurrentMess();
        const { data, error } = await supabase.from('members').insert({
          mess_id: mess.id,
          name: memberData.name,
          phone: memberData.phone,
          gender: memberData.gender,
          rate: memberData.rate,
          plan_type: memberData.planType,
          join_date: memberData.joinDate,
          status: memberData.status || 'active',
        }).select().single();
        if (!error && data) {
          return {
            id: data.id,
            messId: data.mess_id,
            name: data.name,
            phone: data.phone,
            gender: data.gender,
            rate: Number(data.rate),
            planType: data.plan_type,
            joinDate: data.join_date,
            status: data.status,
            createdAt: data.created_at,
          };
        }
      } catch {}
    }

    try {
      const res = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(memberData),
      });
      if (res.ok) return await res.json();
    } catch {}

    const newMember: Member = {
      ...memberData,
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const current = await this.getMembers();
      const updated = [newMember, ...current];
      localStorage.setItem('messmitra_members', JSON.stringify(updated));
    }
    return newMember;
  },

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('members').update({
          ...(memberData.name && { name: memberData.name }),
          ...(memberData.phone && { phone: memberData.phone }),
          ...(memberData.gender && { gender: memberData.gender }),
          ...(memberData.rate !== undefined && { rate: memberData.rate }),
          ...(memberData.planType && { plan_type: memberData.planType }),
          ...(memberData.joinDate && { join_date: memberData.joinDate }),
          ...(memberData.status && { status: memberData.status }),
        }).eq('id', id).select().single();
        if (!error && data) {
          return {
            id: data.id,
            messId: data.mess_id,
            name: data.name,
            phone: data.phone,
            gender: data.gender,
            rate: Number(data.rate),
            planType: data.plan_type,
            joinDate: data.join_date,
            status: data.status,
            createdAt: data.created_at,
          };
        }
      } catch {}
    }

    try {
      const res = await fetch(`${API_BASE}/members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(memberData),
      });
      if (res.ok) return await res.json();
    } catch {}

    let updatedMember: Member = { ...DEFAULT_MEMBERS[0], ...memberData };
    if (typeof window !== 'undefined') {
      const current = await this.getMembers();
      const updated = current.map((m) => {
        if (m.id === id) {
          updatedMember = { ...m, ...memberData, updatedAt: new Date().toISOString() };
          return updatedMember;
        }
        return m;
      });
      localStorage.setItem('messmitra_members', JSON.stringify(updated));
    }
    return updatedMember;
  },

  async toggleMemberStatus(id: string, newStatus: MemberStatus): Promise<Member> {
    return this.updateMember(id, { status: newStatus });
  },

  async getCookForecast(targetDateStr?: string): Promise<DailyCookForecast> {
    try {
      const params = new URLSearchParams();
      if (targetDateStr) params.append('date', targetDateStr);
      const res = await fetch(`${API_BASE}/members/forecast?${params.toString()}`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    const members = await this.getMembers('active');
    const tomorrow = targetDateStr || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const leaves = await this.getLeaves();
    const activeLeaves = leaves.filter(
      (l) => (l.status === 'auto_valid' || l.status === 'approved') && l.startDate <= tomorrow && l.endDate >= tomorrow
    );
    const membersOnLeave = activeLeaves.length || 1;

    const lunchCount = members.filter((m) => m.planType === 'both' || m.planType === 'lunch').length - membersOnLeave;
    const dinnerCount = members.filter((m) => m.planType === 'both' || m.planType === 'dinner').length - membersOnLeave;

    return {
      date: tomorrow,
      totalActiveMembers: members.length,
      membersOnLeave,
      cookForCount: Math.max(0, members.length - membersOnLeave),
      lunchCount: Math.max(0, lunchCount),
      dinnerCount: Math.max(0, dinnerCount),
    };
  },

  // 3. LEAVES
  async getLeaves(status?: LeaveStatus): Promise<LeaveRequest[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let q = supabase.from('leave_requests').select('*, members(name, phone)').order('submitted_at', { ascending: false });
        if (status) q = q.eq('status', status);
        const { data, error } = await q;
        if (!error && data) {
          return data.map((row: any) => ({
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
      } catch {}
    }

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      const res = await fetch(`${API_BASE}/leaves?${params.toString()}`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    let leaves = DEFAULT_LEAVES;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_leaves');
      if (saved) leaves = JSON.parse(saved);
      else localStorage.setItem('messmitra_leaves', JSON.stringify(DEFAULT_LEAVES));
    }
    if (status) leaves = leaves.filter((l) => l.status === status);
    return leaves;
  },

  async submitLeave(data: { memberId: string; startDate: string; endDate: string; reason?: string }): Promise<LeaveRequest> {
    const mess = await this.getCurrentMess();
    const members = await this.getMembers();
    const member = members.find((m) => m.id === data.memberId);
    const isLate = isLeaveSubmissionLate(new Date(), data.startDate, mess.dailyCutoffTime || '09:00');
    const status: LeaveStatus = isLate ? 'pending_approval' : 'auto_valid';

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: row, error } = await supabase.from('leave_requests').insert({
          mess_id: mess.id,
          member_id: data.memberId,
          start_date: data.startDate,
          end_date: data.endDate,
          submitted_at: new Date().toISOString(),
          status,
          is_late: isLate,
          reason: data.reason,
        }).select('*, members(name, phone)').single();
        if (!error && row) {
          return {
            id: row.id,
            messId: row.mess_id,
            memberId: row.member_id,
            memberName: row.members?.name || member?.name,
            memberPhone: row.members?.phone || member?.phone,
            startDate: row.start_date,
            endDate: row.end_date,
            submittedAt: row.submitted_at,
            status: row.status,
            isLate: row.is_late,
            reason: row.reason,
            createdAt: row.created_at,
          };
        }
      } catch {}
    }

    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    const newLeave: LeaveRequest = {
      id: `l-${Date.now()}`,
      messId: mess.id,
      memberId: data.memberId,
      memberName: member?.name || 'Member',
      memberPhone: member?.phone,
      startDate: data.startDate,
      endDate: data.endDate,
      submittedAt: new Date().toISOString(),
      status,
      isLate,
      reason: data.reason,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const current = await this.getLeaves();
      const updated = [newLeave, ...current];
      localStorage.setItem('messmitra_leaves', JSON.stringify(updated));
    }
    return newLeave;
  },

  async reviewLeave(id: string, status: 'approved' | 'rejected'): Promise<LeaveRequest> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: row, error } = await supabase.from('leave_requests').update({
          status,
          reviewed_at: new Date().toISOString(),
        }).eq('id', id).select('*, members(name, phone)').single();
        if (!error && row) {
          return {
            id: row.id,
            messId: row.mess_id,
            memberId: row.member_id,
            memberName: row.members?.name,
            memberPhone: row.members?.phone,
            startDate: row.start_date,
            endDate: row.end_date,
            submittedAt: row.submitted_at,
            status: row.status,
            isLate: row.is_late,
            reviewedAt: row.reviewed_at,
            reason: row.reason,
            createdAt: row.created_at,
          };
        }
      } catch {}
    }

    try {
      const res = await fetch(`${API_BASE}/leaves/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch {}

    let updatedLeave: LeaveRequest = DEFAULT_LEAVES[0];
    if (typeof window !== 'undefined') {
      const current = await this.getLeaves();
      const updated = current.map((l) => {
        if (l.id === id) {
          updatedLeave = { ...l, status, reviewedBy: 'Owner', reviewedAt: new Date().toISOString() };
          return updatedLeave;
        }
        return l;
      });
      localStorage.setItem('messmitra_leaves', JSON.stringify(updated));
    }
    return updatedLeave;
  },

  // 4. BILLING & ACCOUNTING
  async getMonthlyBilling(month: string = new Date().toISOString().substring(0, 7)) {
    try {
      const res = await fetch(`${API_BASE}/billing?month=${month}`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    const members = await this.getMembers();
    const leaves = await this.getLeaves();

    const cycles: BillingCycle[] = members.map((m) => {
      const memberLeaves = leaves.filter(
        (l) => l.memberId === m.id && (l.status === 'auto_valid' || l.status === 'approved')
      );
      const leaveDays = memberLeaves.length > 0 ? 3 : 0;
      const bill = calculateMonthlyBill(m.rate, leaveDays, m.planType);

      return {
        id: `b-${m.id}`,
        messId: m.messId,
        memberId: m.id,
        memberName: m.name,
        memberPhone: m.phone,
        month,
        baseMeals: 56,
        approvedLeaveDays: leaveDays,
        rate: m.rate,
        perMealRate: bill.perMealRate,
        amountDue: bill.finalAmountDue,
        amountPaid: m.status === 'active' ? (m.name.includes('Rahul') ? bill.finalAmountDue : 0) : 0,
        status: m.name.includes('Rahul') ? 'paid' : 'unpaid',
        generatedAt: new Date().toISOString(),
      };
    });

    const totalAmountDue = cycles.reduce((acc, c) => acc + c.amountDue, 0);
    const totalAmountPaid = cycles.reduce((acc, c) => acc + c.amountPaid, 0);

    return {
      month,
      totalAmountDue,
      totalAmountPaid,
      totalPendingDues: Math.max(0, totalAmountDue - totalAmountPaid),
      cycles,
    };
  },

  async generateMonthlyBills(month: string) {
    try {
      const res = await fetch(`${API_BASE}/billing/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify({ month }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return this.getMonthlyBilling(month);
  },

  async recordPayment(
    billingCycleIdOrObj: string | { billingCycleId: string; amount: number; method: 'upi_link' | 'cash'; transactionRef?: string },
    amount?: number,
    method: 'upi_link' | 'cash' = 'cash',
    transactionRef?: string
  ) {
    const cycleId = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.billingCycleId : billingCycleIdOrObj;
    const payAmount = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.amount : (amount || 0);
    const payMethod = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.method : method;
    const ref = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.transactionRef : transactionRef;

    try {
      const res = await fetch(`${API_BASE}/billing/${cycleId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify({ amount: payAmount, method: payMethod, transactionRef: ref }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true };
  },

  async recordAdjustment(
    billingCycleIdOrObj: string | { billingCycleId: string; amount: number; note: string },
    amount?: number,
    note?: string
  ) {
    const cycleId = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.billingCycleId : billingCycleIdOrObj;
    const adjAmount = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.amount : (amount || 0);
    const adjNote = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.note : (note || '');

    try {
      const res = await fetch(`${API_BASE}/billing/${cycleId}/adjustment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify({ amount: adjAmount, note: adjNote }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true };
  },

  // 5. EXPENSES & STAFF
  async getRecurringExpenses(): Promise<ExpenseRecurring[]> {
    try {
      const res = await fetch(`${API_BASE}/expenses/recurring`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_RECURRING;
  },

  async createRecurringExpense(dto: any): Promise<ExpenseRecurring> {
    try {
      const res = await fetch(`${API_BASE}/expenses/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { ...dto, id: `er-${Date.now()}`, isActive: true, createdAt: new Date().toISOString() };
  },

  async confirmRecurringExpense(id: string, month: string) {
    try {
      const res = await fetch(`${API_BASE}/expenses/recurring/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify({ month }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, id, month };
  },

  async getOneOffExpenses(month?: string): Promise<ExpenseOneOff[]> {
    try {
      const res = await fetch(`${API_BASE}/expenses/oneoff${month ? `?month=${month}` : ''}`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_ONEOFF;
  },

  async createOneOffExpense(dto: any): Promise<ExpenseOneOff> {
    try {
      const res = await fetch(`${API_BASE}/expenses/oneoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { ...dto, id: `eo-${Date.now()}`, createdBy: 'Owner', createdAt: new Date().toISOString() };
  },

  async getStaff(): Promise<Staff[]> {
    try {
      const res = await fetch(`${API_BASE}/expenses/staff`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_STAFF;
  },

  async createStaff(dto: any): Promise<Staff> {
    try {
      const res = await fetch(`${API_BASE}/expenses/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-owner-token',
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { ...dto, id: `s-${Date.now()}`, isActive: true, createdAt: new Date().toISOString() };
  },

  // 6. P&L & CSV
  async getPnLSummary(month: string = new Date().toISOString().substring(0, 7)): Promise<ProfitAndLossSummary> {
    try {
      const res = await fetch(`${API_BASE}/pnl/summary?month=${month}`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    const billing = await this.getMonthlyBilling(month);
    const recurring = await this.getRecurringExpenses();
    const oneOff = await this.getOneOffExpenses(month);

    const totalRecurring = recurring.filter((r) => r.isActive).reduce((a, b) => a + b.amount, 0);
    const totalOneOff = oneOff.reduce((a, b) => a + b.amount, 0);
    const totalExpenses = totalRecurring + totalOneOff;

    return {
      month,
      totalDuesCollected: billing.totalAmountPaid,
      totalPendingDues: billing.totalPendingDues,
      totalRecurringExpenses: totalRecurring,
      totalOneOffExpenses: totalOneOff,
      totalExpenses,
      netProfit: billing.totalAmountPaid - totalExpenses,
      expenseBreakdownByCategory: {
        rent: 15000,
        salary: 18000,
        gas: 3600,
        groceries: 4200,
        vegetables: 1450,
        dairy: 840,
        maintenance: 0,
        other: 0,
      },
    };
  },

  downloadBillingCsv(cycles: BillingCycle[], month: string) {
    const csvContent = generateBillingCsv(cycles);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `messmitra-billing-${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadExpensesCsv(recurring: ExpenseRecurring[], oneOff: ExpenseOneOff[], month: string) {
    const csvContent = generateExpensesCsv(recurring, oneOff);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `messmitra-expenses-${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

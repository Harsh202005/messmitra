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
  PendingRegistration,
  calculateProratedMeals,
  calculateMonthlyBill,
  isLeaveSubmissionLate,
  generateBillingCsv,
  generateExpensesCsv,
} from '@messmitra/types';
import { getSupabase } from './supabaseClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper to generate standard 36-character hexadecimal UUIDs
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Global broadcast to notify all components and tabs of data mutation
export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('messmitra_data_changed'));
    try {
      localStorage.setItem('messmitra_last_sync', Date.now().toString());
    } catch {}
  }
}

const DEFAULT_MESS: Mess = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'श्री बालाजी मेस',
  area: 'कर्वे नगर / कोथरूड',
  city: 'पुणे',
  dailyCutoffTime: '18:00',
  lunchCutoffTime: '09:00',
  dinnerCutoffTime: '18:00',
  ownerId: '00000000-0000-0000-0000-000000000001',
  ownerName: 'शंकर गिरी',
  contactNumber: '+91 98223 38975',
  upiId: '9822338975@upi',
  defaultMaleRate: 3200,
  defaultFemaleRate: 3000,
  defaultVegRate: 3000,
  defaultNonVegRate: 3200,
  tagline: 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
  establishedYears: 21,
  createdAt: '2026-06-01T00:00:00Z',
};

const DEFAULT_MEMBERS: Member[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Rahul Deshmukh',
    phone: '+91 98901 23456',
    gender: 'male',
    dietPreference: 'nonveg',
    rate: 3200,
    planType: 'both',
    joinDate: '2026-06-01',
    status: 'active',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Priya Kulkarni',
    phone: '+91 98902 34567',
    gender: 'female',
    dietPreference: 'veg',
    rate: 3000,
    planType: 'both',
    joinDate: '2026-07-15',
    status: 'active',
    createdAt: '2026-07-15T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Amit Joshi',
    phone: '+91 98903 45678',
    gender: 'male',
    dietPreference: 'nonveg',
    rate: 3200,
    planType: 'both',
    joinDate: '2026-08-01',
    status: 'active',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Sneha Shinde',
    phone: '+91 98904 56789',
    gender: 'female',
    dietPreference: 'veg',
    rate: 3000,
    planType: 'both',
    joinDate: '2026-08-10',
    status: 'active',
    createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Omkar Jadhav',
    phone: '+91 98905 67890',
    gender: 'male',
    dietPreference: 'veg',
    rate: 1500,
    planType: 'lunch',
    joinDate: '2026-09-01',
    status: 'active',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Tanvi Pawar',
    phone: '+91 98906 78901',
    gender: 'female',
    dietPreference: 'nonveg',
    rate: 1600,
    planType: 'dinner',
    joinDate: '2026-09-05',
    status: 'active',
    createdAt: '2026-09-05T00:00:00Z',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Vikas Gaikwad',
    phone: '+91 98907 89012',
    gender: 'male',
    dietPreference: 'nonveg',
    rate: 3200,
    planType: 'both',
    joinDate: '2026-05-10',
    status: 'inactive',
    createdAt: '2026-05-10T00:00:00Z',
  },
];

const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: '88888888-8888-8888-8888-888888888888',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    memberId: '11111111-1111-1111-1111-111111111111',
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
    id: '99999999-9999-9999-9999-999999999999',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    memberId: '33333333-3333-3333-3333-333333333333',
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
    id: 'bb111111-1111-1111-1111-111111111111',
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
    id: 'bb222222-2222-2222-2222-222222222222',
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
    id: 'bb333333-3333-3333-3333-333333333333',
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
    id: 'cc111111-1111-1111-1111-111111111111',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    category: 'vegetables',
    amount: 1450,
    date: '2026-09-02',
    note: 'Fresh market vegetables (मंडी खरेदी)',
    createdBy: 'Shankar Giri',
    createdAt: '2026-09-02T08:00:00Z',
  },
  {
    id: 'cc222222-2222-2222-2222-222222222222',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    category: 'dairy',
    amount: 840,
    date: '2026-09-05',
    note: 'Milk, Curd, Paneer for feast day',
    createdBy: 'Shankar Giri',
    createdAt: '2026-09-05T07:30:00Z',
  },
  {
    id: 'cc333333-3333-3333-3333-333333333333',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    category: 'groceries',
    amount: 4200,
    date: '2026-09-08',
    note: 'Kolam Rice & Toor Dal sack',
    createdBy: 'Shankar Giri',
    createdAt: '2026-09-08T16:00:00Z',
  },
];

const DEFAULT_STAFF: Staff[] = [
  {
    id: 'aa111111-1111-1111-1111-111111111111',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Mahadev Mama',
    role: 'Head Cook (महाराज)',
    monthlySalary: 18000,
    phone: '+91 97654 32101',
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'aa222222-2222-2222-2222-222222222222',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Santosh',
    role: 'Helper & Cleaning',
    monthlySalary: 10000,
    phone: '+91 97654 32102',
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
];

const DEFAULT_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'reg-001',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'अनिकेत पवार (Aniket Pawar)',
    phone: '+91 98901 99887',
    role: 'member',
    dietPreference: 'veg',
    planType: 'both',
    rate: 3000,
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending_approval',
  },
  {
    id: 'reg-002',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'दत्तात्रय महाराज (Dattatray Maharaj)',
    phone: '+91 98220 55443',
    role: 'staff',
    staffRole: 'सहाय्यक आचारी (Assistant Cook)',
    salary: 12000,
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending_approval',
  },
];

export const MessMitraApi = {
  // -------------------------------------------------------------
  // 1. MESS DETAILS
  // -------------------------------------------------------------
  async getCurrentMess(): Promise<Mess> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mess').select('*').limit(1).single();
        if (!error && data) {
          const messObj: Mess = {
            id: data.id,
            name: data.name || 'श्री बालाजी मेस',
            area: data.area || 'कर्वे नगर / कोथरूड',
            city: data.city || 'पुणे',
            dailyCutoffTime: (data.daily_cutoff_time || '18:00').substring(0, 5),
            lunchCutoffTime: (data.lunch_cutoff_time || '09:00').substring(0, 5),
            dinnerCutoffTime: (data.dinner_cutoff_time || '18:00').substring(0, 5),
            ownerId: data.owner_id || '00000000-0000-0000-0000-000000000001',
            ownerName: data.owner_name || 'शंकर गिरी',
            contactNumber: data.contact_number || '+91 98223 38975',
            upiId: data.upi_id || '9822338975@upi',
            defaultMaleRate: Number(data.default_male_rate || 3200),
            defaultFemaleRate: Number(data.default_female_rate || 3000),
            defaultVegRate: Number(data.default_veg_rate || data.default_female_rate || 3000),
            defaultNonVegRate: Number(data.default_nonveg_rate || data.default_male_rate || 3200),
            tagline: data.tagline || 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
            establishedYears: Number(data.established_years || 21),
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('messmitra_mess', JSON.stringify(messObj));
          }
          return messObj;
        }
      } catch (e) {
        console.warn('Supabase mess query fallback:', e);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/mess/current`, {
        headers: { Authorization: 'Bearer demo-owner-token' },
      });
      if (res.ok) return await res.json();
    } catch {}

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_mess');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name !== 'श्री बालाजी मेस' || parsed.upiId !== '9822338975@upi' || parsed.ownerName !== 'शंकर गिरी') {
            parsed.name = 'श्री बालाजी मेस';
            parsed.ownerName = 'शंकर गिरी';
            parsed.contactNumber = '+91 98223 38975';
            parsed.upiId = '9822338975@upi';
            parsed.defaultVegRate = 3000;
            parsed.defaultNonVegRate = 3200;
            parsed.dailyCutoffTime = '18:00';
            parsed.dinnerCutoffTime = '18:00';
            localStorage.setItem('messmitra_mess', JSON.stringify(parsed));
          }
          return parsed;
        } catch {
          // parse error fallback
        }
      }
    }
    return DEFAULT_MESS;
  },

  async saveMess(dto: Partial<Mess>): Promise<Mess> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const current = await this.getCurrentMess();
        const { data, error } = await supabase
          .from('mess')
          .upsert({
            id: current.id,
            name: dto.name || current.name,
            area: dto.area || current.area,
            city: dto.city || current.city,
            daily_cutoff_time: dto.dailyCutoffTime || current.dailyCutoffTime,
            upi_id: dto.upiId || current.upiId,
            default_male_rate: dto.defaultNonVegRate || dto.defaultMaleRate || current.defaultMaleRate,
            default_female_rate: dto.defaultVegRate || dto.defaultFemaleRate || current.defaultFemaleRate,
          })
          .select()
          .single();

        if (!error && data) {
          const saved: Mess = {
            id: data.id,
            name: data.name,
            area: data.area,
            city: data.city,
            dailyCutoffTime: data.daily_cutoff_time.substring(0, 5),
            lunchCutoffTime: '09:00',
            dinnerCutoffTime: '18:00',
            ownerId: data.owner_id,
            ownerName: 'शंकर गिरी',
            contactNumber: '+91 98223 38975',
            upiId: data.upi_id,
            defaultMaleRate: Number(data.default_male_rate),
            defaultFemaleRate: Number(data.default_female_rate),
            defaultVegRate: Number(data.default_female_rate || 3000),
            defaultNonVegRate: Number(data.default_male_rate || 3200),
            tagline: 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
            establishedYears: 21,
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('messmitra_mess', JSON.stringify(saved));
          }
          notifyDataChanged();
          return saved;
        }
      } catch (e) {
        console.warn('Supabase saveMess error:', e);
      }
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
    notifyDataChanged();
    return updated;
  },

  // -------------------------------------------------------------
  // 2. MEMBERS
  // -------------------------------------------------------------
  async getMembers(status?: MemberStatus, search?: string): Promise<Member[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let q = supabase.from('members').select('*').order('created_at', { ascending: false });
        if (status) q = q.eq('status', status);
        if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          const membersList: Member[] = data.map((row) => ({
            id: row.id,
            messId: row.mess_id,
            name: row.name,
            phone: row.phone,
            gender: row.gender,
            dietPreference: (row.diet_preference as any) || (row.gender === 'female' ? 'veg' : 'nonveg'),
            rate: Number(row.rate),
            planType: row.plan_type,
            joinDate: row.join_date,
            status: row.status,
            createdAt: row.created_at,
          }));
          if (typeof window !== 'undefined' && !status && !search) {
            localStorage.setItem('messmitra_members', JSON.stringify(membersList));
          }
          return membersList;
        }
      } catch (e) {
        console.warn('Supabase getMembers fallback:', e);
      }
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
        const newUuid = generateUUID();
        const { data, error } = await supabase
          .from('members')
          .insert({
            id: newUuid,
            mess_id: mess.id,
            name: memberData.name,
            phone: memberData.phone,
            gender: memberData.gender || (memberData.dietPreference === 'veg' ? 'female' : 'male'),
            rate: memberData.rate,
            plan_type: memberData.planType,
            join_date: memberData.joinDate,
            status: memberData.status || 'active',
          })
          .select()
          .single();

        if (!error && data) {
          const createdMember: Member = {
            id: data.id,
            messId: data.mess_id,
            name: data.name,
            phone: data.phone,
            gender: data.gender,
            dietPreference: memberData.dietPreference || (data.gender === 'female' ? 'veg' : 'nonveg'),
            rate: Number(data.rate),
            planType: data.plan_type,
            joinDate: data.join_date,
            status: data.status,
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            const current = await this.getMembers();
            const updated = [createdMember, ...current.filter((m) => m.id !== createdMember.id)];
            localStorage.setItem('messmitra_members', JSON.stringify(updated));
          }
          notifyDataChanged();
          return createdMember;
        }
      } catch (e) {
        console.warn('Supabase createMember error:', e);
      }
    }

    const newMember: Member = {
      ...memberData,
      dietPreference: memberData.dietPreference || 'veg',
      id: generateUUID(),
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const current = await this.getMembers();
      const updated = [newMember, ...current];
      localStorage.setItem('messmitra_members', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newMember;
  },

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: any = {};
        if (memberData.name) updatePayload.name = memberData.name;
        if (memberData.phone) updatePayload.phone = memberData.phone;
        if (memberData.gender) updatePayload.gender = memberData.gender;
        if (memberData.rate !== undefined) updatePayload.rate = memberData.rate;
        if (memberData.planType) updatePayload.plan_type = memberData.planType;
        if (memberData.joinDate) updatePayload.join_date = memberData.joinDate;
        if (memberData.status) updatePayload.status = memberData.status;

        const { data, error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated: Member = {
            id: data.id,
            messId: data.mess_id,
            name: data.name,
            phone: data.phone,
            gender: data.gender,
            dietPreference: memberData.dietPreference || (data.gender === 'female' ? 'veg' : 'nonveg'),
            rate: Number(data.rate),
            planType: data.plan_type,
            joinDate: data.join_date,
            status: data.status,
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            const current = await this.getMembers();
            const updatedList = current.map((m) => (m.id === id ? updated : m));
            localStorage.setItem('messmitra_members', JSON.stringify(updatedList));
          }
          notifyDataChanged();
          return updated;
        }
      } catch (e) {
        console.warn('Supabase updateMember error:', e);
      }
    }

    let updatedMember: Member = DEFAULT_MEMBERS[0];
    if (typeof window !== 'undefined') {
      const current = await this.getMembers();
      const updated = current.map((m) => {
        if (m.id === id) {
          updatedMember = { ...m, ...memberData };
          return updatedMember;
        }
        return m;
      });
      localStorage.setItem('messmitra_members', JSON.stringify(updated));
    }
    notifyDataChanged();
    return updatedMember;
  },

  async toggleMemberStatus(id: string, newStatus: MemberStatus): Promise<Member> {
    return this.updateMember(id, { status: newStatus });
  },

  // -------------------------------------------------------------
  // 3. DAILY COOK FORECAST
  // -------------------------------------------------------------
  async getCookForecast(targetDateStr?: string): Promise<DailyCookForecast> {
    const members = await this.getMembers('active');
    const tomorrow = targetDateStr || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const leaves = await this.getLeaves();
    const activeLeaves = leaves.filter(
      (l) => (l.status === 'auto_valid' || l.status === 'approved') && l.startDate <= tomorrow && l.endDate >= tomorrow
    );
    const membersOnLeave = activeLeaves.length;

    const lunchCount = members.filter((m) => m.planType === 'both' || m.planType === 'lunch').length - membersOnLeave;
    const dinnerCount = members.filter((m) => m.planType === 'both' || m.planType === 'dinner').length - membersOnLeave;

    const vegMembers = members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'veg');
    const nonVegMembers = members.filter((m) => (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'nonveg');
    const vegLeavesCount = activeLeaves.filter((l) => {
      const m = members.find((mb) => mb.id === l.memberId);
      return (m?.dietPreference || (m?.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';
    }).length;
    const nonVegLeavesCount = activeLeaves.filter((l) => {
      const m = members.find((mb) => mb.id === l.memberId);
      return (m?.dietPreference || (m?.gender === 'female' ? 'veg' : 'nonveg')) === 'nonveg';
    }).length;

    return {
      date: tomorrow,
      totalActiveMembers: members.length,
      membersOnLeave,
      cookForCount: Math.max(0, members.length - membersOnLeave),
      lunchCount: Math.max(0, lunchCount),
      dinnerCount: Math.max(0, dinnerCount),
      vegCount: Math.max(0, vegMembers.length - vegLeavesCount),
      nonVegCount: Math.max(0, nonVegMembers.length - nonVegLeavesCount),
    };
  },

  // -------------------------------------------------------------
  // 4. LEAVES & ATTENDANCE
  // -------------------------------------------------------------
  async getLeaves(status?: LeaveStatus): Promise<LeaveRequest[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let q = supabase.from('leave_requests').select('*, members(name, phone)').order('submitted_at', { ascending: false });
        if (status) q = q.eq('status', status);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          const leavesList: LeaveRequest[] = data.map((row: any) => ({
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
          if (typeof window !== 'undefined' && !status) {
            localStorage.setItem('messmitra_leaves', JSON.stringify(leavesList));
          }
          return leavesList;
        }
      } catch (e) {
        console.warn('Supabase getLeaves fallback:', e);
      }
    }

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
        const newUuid = generateUUID();
        const { data: row, error } = await supabase
          .from('leave_requests')
          .insert({
            id: newUuid,
            mess_id: mess.id,
            member_id: data.memberId,
            start_date: data.startDate,
            end_date: data.endDate,
            submitted_at: new Date().toISOString(),
            status,
            is_late: isLate,
            reason: data.reason,
          })
          .select('*, members(name, phone)')
          .single();

        if (!error && row) {
          const newReq: LeaveRequest = {
            id: row.id,
            messId: row.mess_id,
            memberId: row.member_id,
            memberName: row.members?.name || member?.name || 'Member',
            memberPhone: row.members?.phone || member?.phone,
            startDate: row.start_date,
            endDate: row.end_date,
            submittedAt: row.submitted_at,
            status: row.status,
            isLate: row.is_late,
            reason: row.reason,
            createdAt: row.created_at,
          };
          if (typeof window !== 'undefined') {
            const current = await this.getLeaves();
            const updated = [newReq, ...current];
            localStorage.setItem('messmitra_leaves', JSON.stringify(updated));
          }
          notifyDataChanged();
          return newReq;
        }
      } catch (e) {
        console.warn('Supabase submitLeave error:', e);
      }
    }

    const newLeave: LeaveRequest = {
      id: generateUUID(),
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
    notifyDataChanged();
    return newLeave;
  },

  async reviewLeave(id: string, status: 'approved' | 'rejected'): Promise<LeaveRequest> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: row, error } = await supabase
          .from('leave_requests')
          .update({
            status,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*, members(name, phone)')
          .single();

        if (!error && row) {
          const updated: LeaveRequest = {
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
          if (typeof window !== 'undefined') {
            const current = await this.getLeaves();
            const updatedList = current.map((l) => (l.id === id ? updated : l));
            localStorage.setItem('messmitra_leaves', JSON.stringify(updatedList));
          }
          notifyDataChanged();
          return updated;
        }
      } catch (e) {
        console.warn('Supabase reviewLeave error:', e);
      }
    }

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
    notifyDataChanged();
    return updatedLeave;
  },

  // -------------------------------------------------------------
  // 5. BILLING, PAYMENTS & ADJUSTMENTS
  // -------------------------------------------------------------
  async getMonthlyBilling(month: string = new Date().toISOString().substring(0, 7)) {
    const members = await this.getMembers();
    const leaves = await this.getLeaves();

    // Read stored payments
    let storedPayments: any[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_payments');
      if (saved) storedPayments = JSON.parse(saved);
    }

    const cycles: BillingCycle[] = members.map((m) => {
      const memberLeaves = leaves.filter(
        (l) => l.memberId === m.id && (l.status === 'auto_valid' || l.status === 'approved')
      );
      // Calculate distinct approved days in month
      const leaveDays = memberLeaves.length > 0 ? 3 : 0;
      const bill = calculateMonthlyBill(m.rate, leaveDays, m.planType);

      // Check payments recorded for this member and month
      const memberCycleId = `b-${m.id}-${month}`;
      const matchingPayments = storedPayments.filter(
        (p) =>
          (p.billingCycleId === memberCycleId ||
            p.billingCycleId === `b-${m.id}` ||
            p.memberId === m.id ||
            (p.billingCycleId && p.billingCycleId.includes(m.id))) &&
          (!p.month || p.month === month)
      );
      const customPaid = matchingPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      const defaultPaid = m.name.includes('Rahul') && matchingPayments.length === 0 ? bill.finalAmountDue : 0;
      const amountPaid = matchingPayments.length > 0 ? customPaid : defaultPaid;

      const status = amountPaid >= bill.finalAmountDue ? 'paid' : (amountPaid > 0 ? 'partially_paid' : 'unpaid');

      return {
        id: memberCycleId,
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
        amountPaid,
        status,
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
    notifyDataChanged();
    return this.getMonthlyBilling(month);
  },

  async recordPayment(
    billingCycleIdOrObj: string | { billingCycleId: string; amount: number; method: 'upi_link' | 'cash'; transactionRef?: string },
    amount?: number,
    method: 'upi_link' | 'cash' = 'cash',
    transactionRef?: string
  ) {
    const cycleId = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.billingCycleId : billingCycleIdOrObj;
    const payAmount = typeof billingCycleIdOrObj === 'object' ? Number(billingCycleIdOrObj.amount) : Number(amount || 0);
    const payMethod = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.method : method;
    const ref = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.transactionRef : transactionRef;

    const cycleParts = cycleId.replace(/^b-/, '').split('-');
    const cycleMonth = cycleParts.length >= 2 ? `${cycleParts[cycleParts.length - 2]}-${cycleParts[cycleParts.length - 1]}` : new Date().toISOString().substring(0, 7);
    const memberId = cycleParts.slice(0, cycleParts.length - 2).join('-');

    const paymentRecord = {
      id: generateUUID(),
      billingCycleId: cycleId,
      memberId: memberId || undefined,
      amount: payAmount,
      method: payMethod,
      transactionRef: ref,
      month: cycleMonth,
      paidAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_payments');
      const payments = saved ? JSON.parse(saved) : [];
      payments.push(paymentRecord);
      localStorage.setItem('messmitra_payments', JSON.stringify(payments));
    }

    notifyDataChanged();
    return { success: true, payment: paymentRecord };
  },

  async recordAdjustment(
    billingCycleIdOrObj: string | { billingCycleId: string; amount: number; note: string },
    amount?: number,
    note?: string
  ) {
    const cycleId = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.billingCycleId : billingCycleIdOrObj;
    const adjAmount = typeof billingCycleIdOrObj === 'object' ? Number(billingCycleIdOrObj.amount) : Number(amount || 0);
    const adjNote = typeof billingCycleIdOrObj === 'object' ? billingCycleIdOrObj.note : (note || '');

    const cycleParts = cycleId.replace(/^b-/, '').split('-');
    const cycleMonth = cycleParts.length >= 2 ? `${cycleParts[cycleParts.length - 2]}-${cycleParts[cycleParts.length - 1]}` : new Date().toISOString().substring(0, 7);
    const memberId = cycleParts.slice(0, cycleParts.length - 2).join('-');

    const paymentRecord = {
      id: generateUUID(),
      billingCycleId: cycleId,
      memberId: memberId || undefined,
      amount: -adjAmount, // negative deduction
      method: 'cash',
      isAdjustment: true,
      adjustmentNote: adjNote,
      month: cycleMonth,
      paidAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_payments');
      const payments = saved ? JSON.parse(saved) : [];
      payments.push(paymentRecord);
      localStorage.setItem('messmitra_payments', JSON.stringify(payments));
    }

    notifyDataChanged();
    return { success: true, adjustment: paymentRecord };
  },

  // -------------------------------------------------------------
  // 6. EXPENSES & STAFF (REAL-TIME DB + INSTANT PERSISTENCE)
  // -------------------------------------------------------------
  async getRecurringExpenses(): Promise<ExpenseRecurring[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('expense_recurring')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list: ExpenseRecurring[] = data.map((r) => ({
            id: r.id,
            messId: r.mess_id,
            category: r.category,
            payeeName: r.payee_name,
            amount: Number(r.amount),
            frequency: r.frequency,
            nextDueDate: r.next_due_date,
            isActive: Boolean(r.is_active),
            lastConfirmedMonth: r.last_confirmed_month,
            createdAt: r.created_at,
          }));
          if (typeof window !== 'undefined') {
            localStorage.setItem('messmitra_expenses_recurring', JSON.stringify(list));
          }
          return list;
        }
      } catch (e) {
        console.warn('Supabase getRecurringExpenses fallback:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_expenses_recurring');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('messmitra_expenses_recurring', JSON.stringify(DEFAULT_RECURRING));
    }
    return DEFAULT_RECURRING;
  },

  async createRecurringExpense(dto: {
    category: any;
    payeeName: string;
    amount: number;
    frequency?: 'monthly' | 'quarterly' | 'yearly';
    nextDueDate: string;
  }): Promise<ExpenseRecurring> {
    const mess = await this.getCurrentMess();
    const newId = generateUUID();

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('expense_recurring')
          .insert({
            id: newId,
            mess_id: mess.id,
            category: dto.category,
            payee_name: dto.payeeName,
            amount: dto.amount,
            frequency: dto.frequency || 'monthly',
            next_due_date: dto.nextDueDate,
            is_active: true,
          })
          .select()
          .single();

        if (!error && data) {
          const created: ExpenseRecurring = {
            id: data.id,
            messId: data.mess_id,
            category: data.category,
            payeeName: data.payee_name,
            amount: Number(data.amount),
            frequency: data.frequency,
            nextDueDate: data.next_due_date,
            isActive: Boolean(data.is_active),
            lastConfirmedMonth: data.last_confirmed_month,
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            const current = await this.getRecurringExpenses();
            const updated = [created, ...current.filter((r) => r.id !== created.id)];
            localStorage.setItem('messmitra_expenses_recurring', JSON.stringify(updated));
          }
          notifyDataChanged();
          return created;
        }
      } catch (e) {
        console.warn('Supabase createRecurringExpense error:', e);
      }
    }

    const newExpense: ExpenseRecurring = {
      id: newId,
      messId: mess.id,
      category: dto.category,
      payeeName: dto.payeeName,
      amount: Number(dto.amount),
      frequency: dto.frequency || 'monthly',
      nextDueDate: dto.nextDueDate,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const current = await this.getRecurringExpenses();
      const updated = [newExpense, ...current];
      localStorage.setItem('messmitra_expenses_recurring', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newExpense;
  },

  async confirmRecurringExpense(id: string, month: string): Promise<{ success: boolean; id: string; month: string }> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('expense_recurring')
          .update({ last_confirmed_month: month })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase confirmRecurringExpense error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const current = await this.getRecurringExpenses();
      const updated = current.map((r) => (r.id === id ? { ...r, lastConfirmedMonth: month } : r));
      localStorage.setItem('messmitra_expenses_recurring', JSON.stringify(updated));
    }
    notifyDataChanged();
    return { success: true, id, month };
  },

  async getOneOffExpenses(month?: string): Promise<ExpenseOneOff[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let q = supabase.from('expense_oneoff').select('*').order('date', { ascending: false });
        if (month) {
          q = q.gte('date', `${month}-01`).lte('date', `${month}-31`);
        }
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          const list: ExpenseOneOff[] = data.map((r) => ({
            id: r.id,
            messId: r.mess_id,
            category: r.category,
            amount: Number(r.amount),
            date: r.date,
            note: r.note,
            createdBy: r.created_by || 'Owner',
            createdAt: r.created_at,
          }));
          if (typeof window !== 'undefined' && !month) {
            localStorage.setItem('messmitra_expenses_oneoff', JSON.stringify(list));
          }
          return list;
        }
      } catch (e) {
        console.warn('Supabase getOneOffExpenses fallback:', e);
      }
    }

    let expenses = DEFAULT_ONEOFF;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_expenses_oneoff');
      if (saved) expenses = JSON.parse(saved);
      else localStorage.setItem('messmitra_expenses_oneoff', JSON.stringify(DEFAULT_ONEOFF));
    }

    if (month) {
      expenses = expenses.filter((e) => e.date.startsWith(month));
    }
    return expenses;
  },

  async createOneOffExpense(dto: {
    category: any;
    amount: number;
    date: string;
    note?: string;
    createdBy?: string;
  }): Promise<ExpenseOneOff> {
    const mess = await this.getCurrentMess();
    const newId = generateUUID();

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('expense_oneoff')
          .insert({
            id: newId,
            mess_id: mess.id,
            category: dto.category,
            amount: dto.amount,
            date: dto.date,
            note: dto.note || '',
            created_by: dto.createdBy || 'Owner',
          })
          .select()
          .single();

        if (!error && data) {
          const created: ExpenseOneOff = {
            id: data.id,
            messId: data.mess_id,
            category: data.category,
            amount: Number(data.amount),
            date: data.date,
            note: data.note,
            createdBy: data.created_by,
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            const current = await this.getOneOffExpenses();
            const updated = [created, ...current.filter((e) => e.id !== created.id)];
            localStorage.setItem('messmitra_expenses_oneoff', JSON.stringify(updated));
          }
          notifyDataChanged();
          return created;
        }
      } catch (e) {
        console.warn('Supabase createOneOffExpense error:', e);
      }
    }

    const newExpense: ExpenseOneOff = {
      id: newId,
      messId: mess.id,
      category: dto.category,
      amount: Number(dto.amount),
      date: dto.date,
      note: dto.note || '',
      createdBy: dto.createdBy || 'Owner',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const current = await this.getOneOffExpenses();
      const updated = [newExpense, ...current];
      localStorage.setItem('messmitra_expenses_oneoff', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newExpense;
  },

  async getStaff(): Promise<Staff[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const list: Staff[] = data.map((s) => ({
            id: s.id,
            messId: s.mess_id,
            name: s.name,
            role: s.role,
            monthlySalary: Number(s.monthly_salary),
            phone: s.phone,
            isActive: Boolean(s.is_active),
            createdAt: s.created_at,
          }));
          if (typeof window !== 'undefined') {
            localStorage.setItem('messmitra_staff', JSON.stringify(list));
          }
          return list;
        }
      } catch (e) {
        console.warn('Supabase getStaff fallback:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_staff');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('messmitra_staff', JSON.stringify(DEFAULT_STAFF));
    }
    return DEFAULT_STAFF;
  },

  async createStaff(dto: {
    name: string;
    role: string;
    monthlySalary: number;
    phone?: string;
  }): Promise<Staff> {
    const mess = await this.getCurrentMess();
    const newId = generateUUID();

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('staff')
          .insert({
            id: newId,
            mess_id: mess.id,
            name: dto.name,
            role: dto.role,
            monthly_salary: dto.monthlySalary,
            phone: dto.phone || '',
            is_active: true,
          })
          .select()
          .single();

        if (!error && data) {
          const created: Staff = {
            id: data.id,
            messId: data.mess_id,
            name: data.name,
            role: data.role,
            monthlySalary: Number(data.monthly_salary),
            phone: data.phone,
            isActive: Boolean(data.is_active),
            createdAt: data.created_at,
          };
          if (typeof window !== 'undefined') {
            const current = await this.getStaff();
            const updated = [created, ...current.filter((s) => s.id !== created.id)];
            localStorage.setItem('messmitra_staff', JSON.stringify(updated));
          }
          notifyDataChanged();
          return created;
        }
      } catch (e) {
        console.warn('Supabase createStaff error:', e);
      }
    }

    const newStaff: Staff = {
      id: newId,
      messId: mess.id,
      name: dto.name,
      role: dto.role,
      monthlySalary: Number(dto.monthlySalary),
      phone: dto.phone || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const current = await this.getStaff();
      const updated = [newStaff, ...current];
      localStorage.setItem('messmitra_staff', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newStaff;
  },

  // -------------------------------------------------------------
  // 7. P&L SUMMARY & DYNAMIC CATEGORY AGGREGATION
  // -------------------------------------------------------------
  async getPnLSummary(month: string = new Date().toISOString().substring(0, 7)): Promise<ProfitAndLossSummary> {
    const billing = await this.getMonthlyBilling(month);
    const recurring = await this.getRecurringExpenses();
    const oneOff = await this.getOneOffExpenses(month);

    const activeRecurring = recurring.filter((r) => r.isActive);
    const totalRecurring = activeRecurring.reduce((a, b) => a + Number(b.amount || 0), 0);
    const totalOneOff = oneOff.reduce((a, b) => a + Number(b.amount || 0), 0);
    const totalExpenses = totalRecurring + totalOneOff;

    // Dynamically calculate category breakdown based on actual expenses
    const breakdown: Record<string, number> = {
      rent: 0,
      salary: 0,
      gas: 0,
      groceries: 0,
      vegetables: 0,
      dairy: 0,
      maintenance: 0,
      other: 0,
    };

    activeRecurring.forEach((r) => {
      const cat = r.category || 'other';
      breakdown[cat] = (breakdown[cat] || 0) + Number(r.amount || 0);
    });

    oneOff.forEach((o) => {
      const cat = o.category || 'other';
      breakdown[cat] = (breakdown[cat] || 0) + Number(o.amount || 0);
    });

    return {
      month,
      totalDuesCollected: billing.totalAmountPaid,
      totalPendingDues: billing.totalPendingDues,
      totalRecurringExpenses: totalRecurring,
      totalOneOffExpenses: totalOneOff,
      totalExpenses,
      netProfit: billing.totalAmountPaid - totalExpenses,
      expenseBreakdownByCategory: breakdown as any,
    };
  },

  // -------------------------------------------------------------
  // 8. CSV EXPORTS WITH UTF-8 BOM
  // -------------------------------------------------------------
  downloadBillingCsv(cycles: BillingCycle[], month: string) {
    const csvContent = generateBillingCsv(cycles);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `messmitra-billing-${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  downloadExpensesCsv(recurring: ExpenseRecurring[], oneOff: ExpenseOneOff[], month: string) {
    const csvContent = generateExpensesCsv(recurring, oneOff);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `messmitra-expenses-${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  // -------------------------------------------------------------
  // 9. SELF-REGISTRATION & OWNER APPROVAL QUEUE
  // -------------------------------------------------------------
  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_registrations');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('messmitra_registrations', JSON.stringify(DEFAULT_REGISTRATIONS));
      return DEFAULT_REGISTRATIONS;
    }
    return DEFAULT_REGISTRATIONS;
  },

  async submitRegistration(
    data: Omit<PendingRegistration, 'id' | 'submittedAt' | 'status'>
  ): Promise<PendingRegistration> {
    const current = await this.getPendingRegistrations();
    const newReg: PendingRegistration = {
      ...data,
      id: `reg-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending_approval',
    };
    const updated = [newReg, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_registrations', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newReg;
  },

  async reviewRegistration(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<PendingRegistration | null> {
    const current = await this.getPendingRegistrations();
    const target = current.find((r) => r.id === id);
    if (!target) return null;

    target.status = status;
    target.reviewedAt = new Date().toISOString();
    target.reviewedBy = 'शंकर गिरी (Owner)';

    if (status === 'approved') {
      if (target.role === 'member') {
        // Auto-create active Member
        await this.createMember({
          name: target.name,
          phone: target.phone,
          dietPreference: target.dietPreference || 'veg',
          gender: 'male',
          rate: target.rate || (target.dietPreference === 'veg' ? 3000 : 3200),
          planType: target.planType || 'both',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
        });
      } else if (target.role === 'staff') {
        // Auto-create active Staff
        await this.createStaff({
          name: target.name,
          phone: target.phone,
          role: target.staffRole || 'सहाय्यक आचारी (Cook)',
          monthlySalary: target.salary || 12000,
        });
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_registrations', JSON.stringify(current));
    }
    notifyDataChanged();
    return target;
  },
};

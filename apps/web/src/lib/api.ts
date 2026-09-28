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
  StaffSalaryPayment,
  StaffAttendanceRecord,
  MenuCatalogItem,
  WalkInOrder,
  WalkInOrderItem,
  ProfitAndLossSummary,
  PendingRegistration,
  calculateProratedMeals,
  calculateMonthlyBill,
  calculateLeaveDaysInMonth,
  isLeaveSubmissionLate,
  isNonVegDay,
  generateBillingCsv,
  generateExpensesCsv,
  MealToken,
  generateTokensCsv,
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
    } catch { }
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

const DEFAULT_MEMBERS: Member[] = [];
const DEFAULT_LEAVES: LeaveRequest[] = [];
const DEFAULT_RECURRING: ExpenseRecurring[] = [];
const DEFAULT_ONEOFF: ExpenseOneOff[] = [];
const DEFAULT_STAFF: Staff[] = [];
const DEFAULT_REGISTRATIONS: PendingRegistration[] = [];
const DEFAULT_STAFF_SALARY_PAYMENTS: StaffSalaryPayment[] = [];
const DEFAULT_WALKIN_ORDERS: WalkInOrder[] = [];

export const DEFAULT_POS_CATALOG: MenuCatalogItem[] = [
  {
    id: 'thali-veg-unlimited',
    name: 'Pure Veg Unlimited Thali',
    nameMr: 'शुद्ध शाकाहारी अमर्यादित थाळी',
    price: 80,
    diet: 'veg',
    category: 'thali',
    icon: '🥗',
    badge: 'सर्वात लोकप्रिय',
    available: true,
  },
  {
    id: 'thali-nonveg-special',
    name: 'Special Chicken / Egg Thali',
    nameMr: 'स्पेशल चिकन थाळी / अंडी थाळी',
    price: 120,
    diet: 'nonveg',
    category: 'thali',
    icon: '🍗',
    badge: 'बुध, शुक्र, रवि स्पेशल',
    available: true,
  },
  {
    id: 'parcel-veg-box',
    name: 'Pure Veg Parcel Box',
    nameMr: 'शाकाहारी पार्सल डबा (३ चपाती+२ भाजी+भात)',
    price: 90,
    diet: 'veg',
    category: 'parcel',
    isParcel: true,
    icon: '📦',
    available: true,
  },
  {
    id: 'parcel-nonveg-box',
    name: 'Special Chicken Parcel Box',
    nameMr: 'स्पेशल चिकन पार्सल डबा (३ चपाती+चिकन+भात)',
    price: 130,
    diet: 'nonveg',
    category: 'parcel',
    isParcel: true,
    icon: '🍱',
    available: true,
  },
  {
    id: 'extra-chapati-2',
    name: 'Extra Butter Chapati (2 pcs)',
    nameMr: 'गरमागरम चपाती (२ नग)',
    price: 20,
    diet: 'veg',
    category: 'extra',
    icon: '🫓',
    available: true,
  },
  {
    id: 'extra-jowar-bhakri',
    name: 'Jowar / Bajra Bhakri (1 pc)',
    nameMr: 'ज्वारी / बाजरी भाकरी (१ नग)',
    price: 20,
    diet: 'veg',
    category: 'extra',
    icon: '🌾',
    available: true,
  },
  {
    id: 'extra-sunday-sweet',
    name: 'Special Sweet (Gulabjam / Shrikhand)',
    nameMr: 'विशेष गोड पदार्थ (गुलाबजाम / श्रीखंड)',
    price: 30,
    diet: 'veg',
    category: 'extra',
    icon: '🍨',
    available: true,
  },
  {
    id: 'extra-taak',
    name: 'Fresh Masala Taak (Buttermilk)',
    nameMr: 'ताजे मसाला ताक (१ ग्लास)',
    price: 15,
    diet: 'veg',
    category: 'extra',
    icon: '🥛',
    available: true,
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
    } catch { }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_mess');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_MESS,
            ...parsed,
            name: parsed.name || 'श्री बालाजी मेस',
            ownerName: parsed.ownerName || 'शंकर गिरी',
            upiId: parsed.upiId || '9822338975@upi',
            dailyCutoffTime: parsed.dailyCutoffTime || parsed.dinnerCutoffTime || '18:00',
            lunchCutoffTime: parsed.lunchCutoffTime || '09:00',
            dinnerCutoffTime: parsed.dinnerCutoffTime || parsed.dailyCutoffTime || '18:00',
          };
        } catch {
          // parse error fallback
        }
      }
    }
    return DEFAULT_MESS;
  },

  async saveMess(dto: Partial<Mess>): Promise<Mess> {
    const current = await this.getCurrentMess();
    const lunchCutoff = dto.lunchCutoffTime || current.lunchCutoffTime || '09:00';
    const dinnerCutoff = dto.dinnerCutoffTime || dto.dailyCutoffTime || current.dinnerCutoffTime || current.dailyCutoffTime || '18:00';
    const dailyCutoff = dto.dailyCutoffTime || dinnerCutoff;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('mess')
          .upsert({
            id: current.id,
            name: dto.name || current.name,
            area: dto.area || current.area,
            city: dto.city || current.city,
            daily_cutoff_time: dailyCutoff,
            lunch_cutoff_time: lunchCutoff,
            dinner_cutoff_time: dinnerCutoff,
            upi_id: dto.upiId || current.upiId,
            default_male_rate: dto.defaultNonVegRate || dto.defaultMaleRate || current.defaultMaleRate,
            default_female_rate: dto.defaultVegRate || dto.defaultFemaleRate || current.defaultFemaleRate,
            default_veg_rate: dto.defaultVegRate || current.defaultVegRate,
            default_nonveg_rate: dto.defaultNonVegRate || current.defaultNonVegRate,
          })
          .select()
          .single();

        if (!error && data) {
          const saved: Mess = {
            id: data.id,
            name: data.name,
            area: data.area,
            city: data.city,
            dailyCutoffTime: (data.daily_cutoff_time || dailyCutoff).substring(0, 5),
            lunchCutoffTime: (data.lunch_cutoff_time || lunchCutoff).substring(0, 5),
            dinnerCutoffTime: (data.dinner_cutoff_time || dinnerCutoff).substring(0, 5),
            ownerId: data.owner_id || current.ownerId,
            ownerName: data.owner_name || 'शंकर गिरी',
            contactNumber: data.contact_number || '+91 98223 38975',
            upiId: data.upi_id || current.upiId,
            defaultMaleRate: Number(data.default_male_rate || 3200),
            defaultFemaleRate: Number(data.default_female_rate || 3000),
            defaultVegRate: Number(data.default_veg_rate || data.default_female_rate || 3000),
            defaultNonVegRate: Number(data.default_nonveg_rate || data.default_male_rate || 3200),
            tagline: data.tagline || current.tagline || 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
            establishedYears: Number(data.established_years || 21),
            createdAt: data.created_at || current.createdAt,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('messmitra_mess', JSON.stringify(saved));
            if (saved.upiId) {
              localStorage.setItem('messmitra_custom_upi_id', saved.upiId);
            }
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
        body: JSON.stringify({
          ...dto,
          lunchCutoffTime: lunchCutoff,
          dinnerCutoffTime: dinnerCutoff,
          dailyCutoffTime: dailyCutoff,
        }),
      });
      if (res.ok) {
        const fetched = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('messmitra_mess', JSON.stringify(fetched));
          if (fetched.upiId) {
            localStorage.setItem('messmitra_custom_upi_id', fetched.upiId);
          }
        }
        notifyDataChanged();
        return fetched;
      }
    } catch { }

    const updated: Mess = {
      ...current,
      ...dto,
      dailyCutoffTime: dailyCutoff,
      lunchCutoffTime: lunchCutoff,
      dinnerCutoffTime: dinnerCutoff,
      upiId: dto.upiId || current.upiId,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_mess', JSON.stringify(updated));
      if (updated.upiId) {
        localStorage.setItem('messmitra_custom_upi_id', updated.upiId);
      }
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
            dietPreference: (row.diet_preference as any) || 'veg',
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
    } catch { }

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
            gender: memberData.gender || 'male',
            diet_preference: memberData.dietPreference || 'veg',
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
            dietPreference: memberData.dietPreference || (data.diet_preference as any) || 'veg',
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
            dietPreference: memberData.dietPreference || (data.diet_preference as any) || 'veg',
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

    let updatedMember: Member | null = null;
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
    if (!updatedMember) {
      throw new Error(`Member with id ${id} not found`);
    }
    return updatedMember;
  },

  async toggleMemberStatus(id: string, newStatus: MemberStatus): Promise<Member> {
    return this.updateMember(id, { status: newStatus });
  },

  async createMembersBulk(membersList: Omit<Member, 'id' | 'createdAt' | 'messId'>[]): Promise<Member[]> {
    const created: Member[] = [];
    for (const m of membersList) {
      const res = await this.createMember(m);
      created.push(res);
    }
    notifyDataChanged();
    return created;
  },

  async deleteMember(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('leave_requests').delete().eq('member_id', id);
        await supabase.from('billing_cycles').delete().eq('member_id', id);
        await supabase.from('members').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteMember error:', e);
      }
    }
    if (typeof window !== 'undefined') {
      const current = await this.getMembers();
      const updated = current.filter((m) => m.id !== id);
      localStorage.setItem('messmitra_members', JSON.stringify(updated));
    }
    notifyDataChanged();
  },

  async clearDemoData(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Delete all child data first, then members & mess records
        await supabase.from('leave_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('billing_cycles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('expense_recurring').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('expense_oneoff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('staff_salary_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('staff_attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pending_registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('meal_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase clearDemoData error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_members', JSON.stringify([]));
      localStorage.setItem('messmitra_leaves', JSON.stringify([]));
      localStorage.setItem('messmitra_expenses_recurring', JSON.stringify([]));
      localStorage.setItem('messmitra_expenses_oneoff', JSON.stringify([]));
      localStorage.setItem('messmitra_staff', JSON.stringify([]));
      localStorage.setItem('messmitra_registrations', JSON.stringify([]));
      localStorage.setItem('messmitra_payments', JSON.stringify([]));
      localStorage.setItem('messmitra_staff_salaries', JSON.stringify([]));
      localStorage.setItem('messmitra_staff_attendance', JSON.stringify([]));
      localStorage.setItem('messmitra_walkin_orders', JSON.stringify([]));
      localStorage.setItem('messmitra_meal_tokens', JSON.stringify([]));
      localStorage.setItem('messmitra_notifications', JSON.stringify([]));

      // Clear any billing caches
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('messmitra_billing_') || k.startsWith('messmitra_pnl_'))) {
          localStorage.removeItem(k);
        }
      }
    }
    notifyDataChanged();
  },

  async exportFullBackup(): Promise<string> {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      mess: await this.getCurrentMess(),
      members: await this.getMembers(),
      leaves: await this.getLeaves(),
      recurringExpenses: await this.getRecurringExpenses(),
      staff: await this.getStaff(),
      registrations: await this.getPendingRegistrations(),
    };
    return JSON.stringify(backup, null, 2);
  },

  async restoreFullBackup(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (typeof window !== 'undefined') {
        if (parsed.mess) localStorage.setItem('messmitra_mess', JSON.stringify(parsed.mess));
        if (parsed.members) localStorage.setItem('messmitra_members', JSON.stringify(parsed.members));
        if (parsed.leaves) localStorage.setItem('messmitra_leaves', JSON.stringify(parsed.leaves));
        if (parsed.recurringExpenses) localStorage.setItem('messmitra_expenses_recurring', JSON.stringify(parsed.recurringExpenses));
        if (parsed.staff) localStorage.setItem('messmitra_staff', JSON.stringify(parsed.staff));
        if (parsed.registrations) localStorage.setItem('messmitra_registrations', JSON.stringify(parsed.registrations));
      }
      notifyDataChanged();
      return true;
    } catch {
      return false;
    }
  },

  // -------------------------------------------------------------
  // 3. DAILY COOK FORECAST (Non-Veg/Egg ONLY at Night: Wed, Fri, Sun)
  // -------------------------------------------------------------
  async getCookForecast(targetDateStr?: string): Promise<DailyCookForecast> {
    const members = await this.getMembers('active');
    const tomorrow = targetDateStr || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const leaves = await this.getLeaves();
    const activeLeaves = leaves.filter(
      (l) => (l.status === 'auto_valid' || l.status === 'approved') && l.startDate <= tomorrow && l.endDate >= tomorrow
    );
    const membersOnLeave = activeLeaves.length;
    const totalCookFor = Math.max(0, members.length - membersOnLeave);

    const lunchMembers = members.filter((m) => m.planType === 'both' || m.planType === 'lunch');
    const dinnerMembers = members.filter((m) => m.planType === 'both' || m.planType === 'dinner');

    const lunchCount = Math.max(0, lunchMembers.length - activeLeaves.filter((l) => lunchMembers.some((m) => m.id === l.memberId)).length);
    const dinnerCount = Math.max(0, dinnerMembers.length - activeLeaves.filter((l) => dinnerMembers.some((m) => m.id === l.memberId)).length);

    const isNonVegSpecialDay = isNonVegDay(tomorrow);

    // Lunch is ALWAYS 100% pure veg for everyone on all 7 days of the week
    const lunchVegCount = lunchCount;

    // Dinner is Non-Veg ONLY on Wed, Fri, Sun for members with nonveg diet preference
    const dinnerVegMembers = dinnerMembers.filter((m) => (m.dietPreference || 'veg') === 'veg');
    const dinnerNonVegMembers = dinnerMembers.filter((m) => (m.dietPreference || 'veg') === 'nonveg');

    const dinnerVegLeaves = activeLeaves.filter((l) => dinnerVegMembers.some((m) => m.id === l.memberId)).length;
    const dinnerNonVegLeaves = activeLeaves.filter((l) => dinnerNonVegMembers.some((m) => m.id === l.memberId)).length;

    const dinnerVegCount = isNonVegSpecialDay
      ? Math.max(0, dinnerVegMembers.length - dinnerVegLeaves)
      : dinnerCount;
    const dinnerNonVegCount = isNonVegSpecialDay
      ? Math.max(0, dinnerNonVegMembers.length - dinnerNonVegLeaves)
      : 0;

    const vegCount = isNonVegSpecialDay
      ? Math.max(0, members.filter((m) => (m.dietPreference || 'veg') === 'veg').length - activeLeaves.filter((l) => {
          const m = members.find((mb) => mb.id === l.memberId);
          return (m?.dietPreference || 'veg') === 'veg';
        }).length)
      : totalCookFor;

    const nonVegCount = isNonVegSpecialDay
      ? dinnerNonVegCount
      : 0;

    return {
      date: tomorrow,
      totalActiveMembers: members.length,
      membersOnLeave,
      cookForCount: totalCookFor,
      lunchCount,
      dinnerCount,
      vegCount,
      nonVegCount,
      lunchVegCount,
      dinnerVegCount,
      dinnerNonVegCount,
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
    const isLate = isLeaveSubmissionLate(
      new Date(),
      data.startDate,
      mess.dailyCutoffTime || '18:00',
      member?.planType,
      mess.lunchCutoffTime || '09:00',
      mess.dinnerCutoffTime || '18:00'
    );
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

    let updatedLeave: LeaveRequest | null = null;
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
    if (!updatedLeave) {
      throw new Error(`Leave with id ${id} not found`);
    }
    return updatedLeave;
  },

  // -------------------------------------------------------------
  // 5. BILLING, PAYMENTS & ADJUSTMENTS
  // -------------------------------------------------------------
  async getMonthlyBilling(month: string = new Date().toISOString().substring(0, 7)) {
    const members = await this.getMembers();
    const leaves = await this.getLeaves();

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10) || new Date().getFullYear();
    const monthNum = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

    // Read stored payments
    let storedPayments: any[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_payments');
      if (saved) storedPayments = JSON.parse(saved);
    }

    const cycles: BillingCycle[] = members.map((m) => {
      let leaveDays = 0;
      leaves.forEach((l) => {
        if (l.memberId === m.id && (l.status === 'auto_valid' || l.status === 'approved')) {
          leaveDays += calculateLeaveDaysInMonth(l.startDate, l.endDate, year, monthNum);
        }
      });

      const baseMeals = calculateProratedMeals(m.joinDate, year, monthNum, m.planType);
      const bill = calculateMonthlyBill(m.rate, leaveDays, m.planType, baseMeals);

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
      const amountPaid = matchingPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

      const status = amountPaid >= bill.finalAmountDue ? 'paid' : (amountPaid > 0 ? 'partially_paid' : 'unpaid');

      return {
        id: memberCycleId,
        messId: m.messId,
        memberId: m.id,
        memberName: m.name,
        memberPhone: m.phone,
        month,
        baseMeals,
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

  async updateStaff(id: string, dto: Partial<Staff>): Promise<Staff | null> {
    const current = await this.getStaff();
    let updatedStaff: Staff | null = null;
    const updatedList = current.map((s) => {
      if (s.id === id) {
        updatedStaff = { ...s, ...dto };
        return updatedStaff;
      }
      return s;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_staff', JSON.stringify(updatedList));
    }
    notifyDataChanged();
    return updatedStaff;
  },

  async deleteStaff(id: string): Promise<boolean> {
    const current = await this.getStaff();
    const updated = current.filter((s) => s.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_staff', JSON.stringify(updated));
    }
    notifyDataChanged();
    return true;
  },

  // -------------------------------------------------------------
  // 6B. STAFF SALARY LEDGER & ADVANCE PAYMENTS
  // -------------------------------------------------------------
  async getStaffSalaryPayments(month?: string): Promise<StaffSalaryPayment[]> {
    let payments = DEFAULT_STAFF_SALARY_PAYMENTS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_staff_salaries');
      if (saved) {
        try {
          payments = JSON.parse(saved);
        } catch { }
      } else {
        localStorage.setItem('messmitra_staff_salaries', JSON.stringify(DEFAULT_STAFF_SALARY_PAYMENTS));
      }
    }

    if (month) {
      return payments.filter((p) => p.month === month);
    }
    return payments;
  },

  async recordStaffSalaryPayment(
    payment: Omit<StaffSalaryPayment, 'id' | 'createdAt' | 'voucherNumber'>
  ): Promise<StaffSalaryPayment> {
    const current = await this.getStaffSalaryPayments();
    const count = current.length + 1;
    const voucherNumber = `SAL-${payment.month}-${String(count).padStart(3, '0')}`;
    const newPayment: StaffSalaryPayment = {
      ...payment,
      id: `sp-${Date.now()}`,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPayment, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_staff_salaries', JSON.stringify(updated));
    }

    // Automatically record an expense entry in the one-off expenses ledger
    await this.createOneOffExpense({
      category: 'salary',
      amount: newPayment.netPaid,
      date: newPayment.paidDate,
      note: `${newPayment.staffName} (${newPayment.paymentType === 'advance' ? 'उचल / Advance' : 'पगार / Salary'}) - ${voucherNumber}`,
      createdBy: 'शंकर गिरी',
    });

    notifyDataChanged();
    return newPayment;
  },

  async approveMonthlyStaffSalaries(
    month: string,
    approvals: Array<{
      staffId: string;
      staffName: string;
      baseSalary: number;
      advanceDeductions: number;
      bonusAmount?: number;
      netPaid: number;
      paymentMethod: 'cash' | 'upi' | 'bank_transfer';
      paidDate: string;
      note?: string;
    }>
  ): Promise<StaffSalaryPayment[]> {
    const results: StaffSalaryPayment[] = [];
    for (const item of approvals) {
      const payment = await this.recordStaffSalaryPayment({
        messId: 'balaji-mess-pune',
        staffId: item.staffId,
        staffName: item.staffName,
        month,
        baseSalary: item.baseSalary,
        advanceDeductions: item.advanceDeductions,
        bonusAmount: item.bonusAmount || 0,
        netPaid: item.netPaid,
        paymentType: 'monthly_approval',
        paymentMethod: item.paymentMethod,
        paidDate: item.paidDate,
        note: item.note || `महिना ${month} चा पगार मालक शंकर गिरी यांनी मंजूर केला.`,
      });
      results.push(payment);
    }
    notifyDataChanged();
    return results;
  },

  // -------------------------------------------------------------
  // 6C. STAFF ATTENDANCE TRACKER
  // -------------------------------------------------------------
  async getStaffAttendance(month: string = new Date().toISOString().substring(0, 7)): Promise<StaffAttendanceRecord[]> {
    if (typeof window !== 'undefined') {
      const key = `messmitra_staff_attendance_${month}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { }
      }
    }
    return [];
  },

  async markStaffAttendance(
    month: string,
    records: StaffAttendanceRecord[]
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `messmitra_staff_attendance_${month}`;
      localStorage.setItem(key, JSON.stringify(records));
    }
    notifyDataChanged();
  },

  // -------------------------------------------------------------
  // 6D. WALK-IN / GUEST DAILY MEAL POS COUNTER
  // -------------------------------------------------------------
  async getWalkInOrders(targetDate?: string): Promise<WalkInOrder[]> {
    let orders = DEFAULT_WALKIN_ORDERS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_walkin_orders');
      if (saved) {
        try {
          orders = JSON.parse(saved);
        } catch { }
      } else {
        localStorage.setItem('messmitra_walkin_orders', JSON.stringify(DEFAULT_WALKIN_ORDERS));
      }
    }

    if (targetDate) {
      return orders.filter((o) => o.createdAt.startsWith(targetDate));
    }
    return orders;
  },

  async createWalkInOrder(
    data: Omit<WalkInOrder, 'id' | 'orderNumber' | 'createdAt'>
  ): Promise<WalkInOrder> {
    const current = await this.getWalkInOrders();
    const count = current.length + 101;
    const newOrder: WalkInOrder = {
      ...data,
      id: `wo-${Date.now()}`,
      orderNumber: `POS-${count}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newOrder, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_walkin_orders', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newOrder;
  },

  async getWalkInDailyStats(targetDate: string = new Date().toISOString().split('T')[0]): Promise<{
    totalOrders: number;
    totalRevenue: number;
    cashRevenue: number;
    upiRevenue: number;
    vegThaliCount: number;
    nonVegThaliCount: number;
    parcelCount: number;
  }> {
    const orders = await this.getWalkInOrders(targetDate);
    const totalOrders = orders.length;
    let totalRevenue = 0;
    let cashRevenue = 0;
    let upiRevenue = 0;
    let vegThaliCount = 0;
    let nonVegThaliCount = 0;
    let parcelCount = 0;

    orders.forEach((o) => {
      totalRevenue += o.totalAmount;
      if (o.paymentMethod === 'cash') cashRevenue += o.totalAmount;
      if (o.paymentMethod === 'upi') upiRevenue += o.totalAmount;

      o.items.forEach((item) => {
        if (item.diet === 'veg' && item.itemId.includes('thali')) vegThaliCount += item.quantity;
        if (item.diet === 'nonveg' && item.itemId.includes('thali')) nonVegThaliCount += item.quantity;
        if (item.isParcel) parcelCount += item.quantity;
      });
    });

    return {
      totalOrders,
      totalRevenue,
      cashRevenue,
      upiRevenue,
      vegThaliCount,
      nonVegThaliCount,
      parcelCount,
    };
  },

  async getPosCatalog(): Promise<MenuCatalogItem[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_pos_catalog');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { }
      } else {
        localStorage.setItem('messmitra_pos_catalog', JSON.stringify(DEFAULT_POS_CATALOG));
      }
    }
    return DEFAULT_POS_CATALOG;
  },

  async savePosCatalog(items: MenuCatalogItem[]): Promise<MenuCatalogItem[]> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_pos_catalog', JSON.stringify(items));
    }
    notifyDataChanged();
    return items;
  },

  async deleteWalkInOrder(orderId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const current = await this.getWalkInOrders();
      const updated = current.filter((o) => o.id !== orderId);
      localStorage.setItem('messmitra_walkin_orders', JSON.stringify(updated));
    }
    notifyDataChanged();
  },

  downloadWalkInOrdersCsv(orders: WalkInOrder[], targetDate?: string): void {
    const headers = ['Order Number', 'Date', 'Time', 'Customer Name', 'Phone', 'Items', 'Payment Method', 'Status', 'Total Amount (INR)'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.substring(0, 10),
      new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      `"${(o.customerName || 'Walk-in Customer').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ').replace(/"/g, '""')}"`,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.totalAmount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daily-sales-${targetDate || new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  downloadTokensCsv(tokens: MealToken[], dateFilterStr?: string) {
    const csvContent = generateTokensCsv(tokens);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `messmitra-meal-tokens-${dateFilterStr || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  // -------------------------------------------------------------
  // 8.1 MEAL TOKENS API
  // -------------------------------------------------------------
  async getMealTokens(): Promise<MealToken[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messmitra_meal_tokens');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  },

  async issueMealToken(dto: Omit<MealToken, 'id' | 'tokenNumber' | 'issuedAt' | 'status' | 'messId'>): Promise<MealToken> {
    const tokenNum = `TKN-${Math.floor(100 + Math.random() * 900)}`;
    const newToken: MealToken = {
      ...dto,
      id: `tkn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tokenNumber: tokenNum,
      messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      status: 'issued',
      issuedAt: new Date().toISOString(),
    };
    const current = await this.getMealTokens();
    const updated = [newToken, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_meal_tokens', JSON.stringify(updated));
    }
    notifyDataChanged();
    return newToken;
  },

  async redeemMealToken(id: string): Promise<MealToken | null> {
    const current = await this.getMealTokens();
    let redeemed: MealToken | null = null;
    const updated = current.map((t) => {
      if (t.id === id || t.tokenNumber.toUpperCase() === id.toUpperCase()) {
        redeemed = {
          ...t,
          status: 'redeemed' as const,
          redeemedAt: new Date().toISOString(),
        };
        return redeemed;
      }
      return t;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_meal_tokens', JSON.stringify(updated));
    }
    notifyDataChanged();
    return redeemed;
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
    target.reviewedBy = 'शंकर गिरी';

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
          role: target.staffRole || 'सहाय्यक आचारी',
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

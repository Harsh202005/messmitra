/**
 * MessMitra Shared Types, Models, Enums & Domain Calculation Utilities
 */

export type UserRole = 'owner' | 'member' | 'staff';
export type Gender = 'male' | 'female' | 'other';
export type DietPreference = 'veg' | 'nonveg';
export type PlanType = 'lunch' | 'dinner' | 'both';
export type MemberStatus = 'active' | 'inactive';
export type LeaveStatus = 'auto_valid' | 'pending_approval' | 'approved' | 'rejected';
export type PaymentMethod = 'upi_link' | 'cash';
export type BillingStatus = 'unpaid' | 'partially_paid' | 'paid';
export type RecurringFrequency = 'monthly' | 'quarterly' | 'yearly';

export type ExpenseCategory = 
  | 'salary' 
  | 'rent' 
  | 'gas' 
  | 'groceries' 
  | 'dairy' 
  | 'vegetables' 
  | 'maintenance' 
  | 'other';

export interface Mess {
  id: string;
  name: string;
  area: string;
  city: string;
  dailyCutoffTime: string; // "18:00" (6:00 PM dinner cutoff)
  lunchCutoffTime?: string; // "09:00"
  dinnerCutoffTime?: string; // "18:00"
  ownerId: string;
  ownerName?: string;
  contactNumber?: string;
  upiId: string;
  defaultMaleRate?: number; // legacy fallback
  defaultFemaleRate?: number; // legacy fallback
  defaultVegRate: number; // ₹3000 for 56 veg meals
  defaultNonVegRate: number; // ₹3200 for 56 non-veg meals
  tagline?: string;
  establishedYears?: number; // 21 years
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  messId: string | null;
  role: UserRole;
  fullName: string;
  phone: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  messId: string;
  memberId?: string; // Populated when role === 'member'
  token?: string;
}

export interface LoginRequestDto {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponseDto {
  user: AuthUser;
  token: string;
  message: string;
}

export interface Member {
  id: string;
  messId: string;
  userId?: string | null;
  name: string;
  phone: string;
  gender?: Gender;
  dietPreference: DietPreference; // 'veg' | 'nonveg'
  rate: number; // Monthly rate: ₹3000 for veg, ₹3200 for non-veg
  planType: PlanType;
  joinDate: string; // ISO string "YYYY-MM-DD"
  status: MemberStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id: string;
  messId: string;
  memberId: string;
  memberName?: string;
  memberPhone?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  submittedAt: string; // ISO timestamp (Critical for dispute resolution)
  status: LeaveStatus;
  isLate: boolean; // Computed on submission based on mess cutoff_time
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reason?: string;
  createdAt: string;
}

export interface BillingCycle {
  id: string;
  messId: string;
  memberId: string;
  memberName?: string;
  memberPhone?: string;
  month: string; // "YYYY-MM"
  baseMeals: number; // 56 for full month or prorated
  approvedLeaveDays: number;
  rate: number;
  perMealRate: number;
  amountDue: number;
  amountPaid: number;
  status: BillingStatus;
  generatedAt: string;
}

export interface Payment {
  id: string;
  messId: string;
  billingCycleId: string;
  amount: number;
  method: PaymentMethod;
  transactionRef?: string;
  isAdjustment: boolean;
  adjustmentNote?: string;
  paidAt: string;
  createdBy: string;
}

export interface ExpenseRecurring {
  id: string;
  messId: string;
  category: ExpenseCategory;
  payeeName: string;
  amount: number;
  frequency: RecurringFrequency;
  nextDueDate: string; // "YYYY-MM-DD"
  isActive: boolean;
  lastConfirmedMonth?: string;
  createdAt: string;
}

export interface ExpenseOneOff {
  id: string;
  messId: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // "YYYY-MM-DD"
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  messId: string;
  name: string;
  role: string;
  monthlySalary: number;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DailyCookForecast {
  date: string;
  totalActiveMembers: number;
  membersOnLeave: number;
  cookForCount: number;
  lunchCount: number;
  dinnerCount: number;
  vegCount: number;
  nonVegCount: number;
}

export interface ProfitAndLossSummary {
  month: string;
  totalDuesCollected: number;
  totalPendingDues: number;
  totalRecurringExpenses: number;
  totalOneOffExpenses: number;
  totalExpenses: number;
  netProfit: number;
  expenseBreakdownByCategory: Record<ExpenseCategory, number>;
}

// -------------------------------------------------------------
// Pure Calculation Helpers & Domain Logic
// -------------------------------------------------------------

export const STANDARD_BASE_MEALS = 56;

/**
 * Checks if a leave submission is late relative to the daily cutoff time for the start date.
 */
export function isLeaveSubmissionLate(
  submissionDate: Date,
  startDateStr: string,
  cutoffTimeStr: string = '09:00'
): boolean {
  const [cutoffHour, cutoffMin] = cutoffTimeStr.split(':').map(Number);
  
  const subYear = submissionDate.getFullYear();
  const subMonth = String(submissionDate.getMonth() + 1).padStart(2, '0');
  const subDay = String(submissionDate.getDate()).padStart(2, '0');
  const submissionDateStr = `${subYear}-${subMonth}-${subDay}`;

  // If the leave starts in the future, it's timely
  if (startDateStr > submissionDateStr) {
    return false;
  }

  // If the leave starts before the submission date, retroactive = late
  if (startDateStr < submissionDateStr) {
    return true;
  }

  // If leave starts TODAY, check current time vs cutoff
  const currentMinutes = submissionDate.getHours() * 60 + submissionDate.getMinutes();
  const cutoffMinutes = cutoffHour * 60 + cutoffMin;

  return currentMinutes > cutoffMinutes;
}

/**
 * Prorates base meals for members joining mid-month.
 */
export function calculateProratedMeals(
  joinDateStr: string,
  year: number,
  month: number, // 1-12
  planType: PlanType = 'both'
): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  const joinDate = new Date(joinDateStr);
  const joinYear = joinDate.getFullYear();
  const joinMonth = joinDate.getMonth() + 1;
  const joinDay = joinDate.getDate();

  if (joinYear < year || (joinYear === year && joinMonth < month)) {
    return planType === 'both' ? STANDARD_BASE_MEALS : STANDARD_BASE_MEALS / 2;
  }

  if (joinYear > year || (joinYear === year && joinMonth > month)) {
    return 0;
  }

  const activeDays = Math.max(0, daysInMonth - joinDay + 1);
  const mealsPerDay = planType === 'both' ? 2 : 1;
  return activeDays * mealsPerDay;
}

/**
 * Calculates itemized monthly bill:
 * Monthly Bill = Base Amount - (Approved Leave Days * Per Meal Rate)
 */
export function calculateMonthlyBill(
  baseMonthlyRate: number,
  approvedLeaveDays: number,
  planType: PlanType = 'both',
  actualBaseMeals: number = STANDARD_BASE_MEALS
): { perMealRate: number; leaveDeduction: number; finalAmountDue: number } {
  const totalMealsInFullMonth = planType === 'both' ? STANDARD_BASE_MEALS : STANDARD_BASE_MEALS / 2;
  const perMealRate = Math.round((baseMonthlyRate / totalMealsInFullMonth) * 100) / 100;
  
  // Prorated base amount if member joined mid-cycle
  const effectiveBaseAmount = Math.round((actualBaseMeals / totalMealsInFullMonth) * baseMonthlyRate);
  
  const mealsPerDay = planType === 'both' ? 2 : 1;
  const leaveDeduction = Math.round(approvedLeaveDays * mealsPerDay * perMealRate);
  const finalAmountDue = Math.max(0, effectiveBaseAmount - leaveDeduction);

  return {
    perMealRate,
    leaveDeduction,
    finalAmountDue,
  };
}

/**
 * Generates an instant WhatsApp Click-to-Chat (wa.me) deep link with prefilled bill breakdown
 * and UPI intent link.
 */
export function generateWhatsAppReminderLink(
  phone: string,
  memberName: string,
  messName: string,
  amountDue: number,
  upiId: string,
  monthName: string,
  leaveDaysCount: number = 0
): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const upiIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(messName)}&am=${amountDue}&cu=INR`;
  
  const message = 
`🙏 *नमस्ते ${memberName}*,

${messName} चे *${monthName}* महिन्याचे मेस बिल:
💰 *एकूण बाकी रक्कम: ₹${amountDue}*
${leaveDaysCount > 0 ? `📅 मंजूर सुट्टी वजावट: ${leaveDaysCount} दिवस\n` : ''}
कृपया खालील UPI ID वर पैसे पाठवून द्या:
👉 *UPI ID:* \`${upiId}\`

किंवा थेट UPI ॲपवरून भरण्यासाठी खालील लिंक वापरा:
${upiIntent}

पैसे भरल्यावर स्क्रीनशॉट/रेफरन्स नंबर पाठवा. धन्यवाद! ✨`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * CSV Generation Utilities for Monthly Billing & Expenses
 */
export function generateBillingCsv(billingCycles: BillingCycle[]): string {
  const headers = ['Member Name', 'Phone', 'Month', 'Base Meals', 'Approved Leave Days', 'Per Meal Rate (INR)', 'Amount Due (INR)', 'Amount Paid (INR)', 'Status'];
  const rows = billingCycles.map(b => [
    `"${b.memberName || ''}"`,
    `"${b.memberPhone || ''}"`,
    `"${b.month}"`,
    b.baseMeals,
    b.approvedLeaveDays,
    b.perMealRate,
    b.amountDue,
    b.amountPaid,
    `"${b.status}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateExpensesCsv(recurring: ExpenseRecurring[], oneOff: ExpenseOneOff[]): string {
  const headers = ['Type', 'Category', 'Payee / Description', 'Amount (INR)', 'Date / Next Due', 'Created By / Status'];
  const rows: string[][] = [];

  recurring.forEach(r => {
    rows.push(['"Recurring"', `"${r.category}"`, `"${r.payeeName}"`, String(r.amount), `"${r.nextDueDate}"`, `"${r.isActive ? 'Active' : 'Inactive'}"`]);
  });

  oneOff.forEach(o => {
    rows.push(['"One-Off"', `"${o.category}"`, `"${o.note || '-'}"`, String(o.amount), `"${o.date}"`, `"${o.createdBy}"`]);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

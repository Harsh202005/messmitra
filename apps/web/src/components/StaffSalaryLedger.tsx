'use client';

import React, { useState, useEffect } from 'react';
import { Staff, StaffSalaryPayment, StaffAttendanceRecord, Mess } from '@messmitra/types';
import { MessMitraApi } from '../lib/api';
import { playNotificationChime } from '../lib/notificationService';
import { useI18n } from '../lib/i18n';
import {
  Users,
  DollarSign,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Printer,
  X,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Check,
  CreditCard,
  Building,
} from 'lucide-react';

interface StaffSalaryLedgerProps {
  mess: Mess | null;
  staffList: Staff[];
  onStaffUpdated: () => void;
}

export const StaffSalaryLedger: React.FC<StaffSalaryLedgerProps> = ({
  mess,
  staffList,
  onStaffUpdated,
}) => {
  const { language } = useI18n();
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'attendance' | 'staff_list'>('payroll');

  // Salary Payments State
  const [payments, setPayments] = useState<StaffSalaryPayment[]>([]);
  const [attendance, setAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals State
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [selectedStaffForPayment, setSelectedStaffForPayment] = useState<Staff | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<StaffSalaryPayment | null>(null);

  // Start of Month Salary Approval State
  const [isMonthlyApprovalModalOpen, setIsMonthlyApprovalModalOpen] = useState(false);
  const [approvalItems, setApprovalItems] = useState<
    Array<{
      staffId: string;
      staffName: string;
      role: string;
      phone?: string;
      baseSalary: number;
      advanceDeductions: number;
      bonusAmount: number;
      netPaid: number;
      paymentMethod: 'cash' | 'upi' | 'bank_transfer';
      isIncluded: boolean;
      isAlreadySettled: boolean;
    }>
  >([]);
  const [approvalPaymentDate, setApprovalPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvalPaymentMethod, setApprovalPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('bank_transfer');
  const [approvalNote, setApprovalNote] = useState('');

  // Payment Form State
  const [paymentType, setPaymentType] = useState<'advance' | 'salary_settlement' | 'bonus'>('advance');
  const [paymentAmount, setPaymentAmount] = useState<number>(2000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff Form State
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('मुख्य आचारी');
  const [staffSalary, setStaffSalary] = useState(18000);
  const [staffPhone, setStaffPhone] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salaries, att] = await Promise.all([
        MessMitraApi.getStaffSalaryPayments(selectedMonth),
        MessMitraApi.getStaffAttendance(selectedMonth),
      ]);
      setPayments(salaries);
      setAttendance(att);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  // Aggregate stats
  const totalPayrollBudget = staffList
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + Number(s.monthlySalary || 0), 0);

  const totalPaidThisMonth = payments.reduce((sum, p) => sum + Number(p.netPaid || 0), 0);
  const totalAdvancesThisMonth = payments
    .filter((p) => p.paymentType === 'advance')
    .reduce((sum, p) => sum + Number(p.netPaid || 0), 0);
  const totalSettlementsThisMonth = payments
    .filter((p) => p.paymentType === 'salary_settlement' || p.paymentType === 'monthly_approval')
    .reduce((sum, p) => sum + Number(p.netPaid || 0), 0);

  const remainingLiability = Math.max(0, totalPayrollBudget - totalPaidThisMonth);

  // Open Start-of-Month Approval Modal
  const openMonthlyApprovalModal = () => {
    const items = staffList
      .filter((s) => s.isActive)
      .map((staff) => {
        const staffPayments = payments.filter((p) => p.staffId === staff.id);
        const staffAdvances = staffPayments
          .filter((p) => p.paymentType === 'advance')
          .reduce((sum, p) => sum + p.netPaid, 0);
        const isSettled = staffPayments.some(
          (p) => p.paymentType === 'salary_settlement' || p.paymentType === 'monthly_approval'
        );
        const net = Math.max(0, staff.monthlySalary - staffAdvances);

        return {
          staffId: staff.id,
          staffName: staff.name,
          role: staff.role,
          phone: staff.phone,
          baseSalary: staff.monthlySalary,
          advanceDeductions: staffAdvances,
          bonusAmount: 0,
          netPaid: net,
          paymentMethod: approvalPaymentMethod,
          isIncluded: !isSettled,
          isAlreadySettled: isSettled,
        };
      });

    setApprovalItems(items);
    setApprovalNote(`महिना ${selectedMonth} चा अधिकृत मासिक पगार मालक शंकर गिरी यांनी मंजूर केला.`);
    setIsMonthlyApprovalModalOpen(true);
  };

  // Submit Start-of-Month Approvals in Batch
  const handleMonthlyApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toApprove = approvalItems.filter((i) => i.isIncluded && !i.isAlreadySettled);
    if (toApprove.length === 0) return;

    setIsSubmitting(true);
    try {
      await MessMitraApi.approveMonthlyStaffSalaries(
        selectedMonth,
        toApprove.map((item) => ({
          staffId: item.staffId,
          staffName: item.staffName,
          baseSalary: item.baseSalary,
          advanceDeductions: item.advanceDeductions,
          bonusAmount: item.bonusAmount,
          netPaid: item.netPaid,
          paymentMethod: item.paymentMethod,
          paidDate: approvalPaymentDate,
          note: approvalNote || undefined,
        }))
      );

      playNotificationChime();
      setIsMonthlyApprovalModalOpen(false);
      loadData();
      onStaffUpdated();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Record Payment Submit
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPayment) return;
    setIsSubmitting(true);
    try {
      await MessMitraApi.recordStaffSalaryPayment({
        messId: mess?.id || 'balaji-mess-pune',
        staffId: selectedStaffForPayment.id,
        staffName: selectedStaffForPayment.name,
        month: selectedMonth,
        baseSalary: selectedStaffForPayment.monthlySalary,
        advanceDeductions: paymentType === 'salary_settlement' ? totalAdvancesThisMonth : 0,
        bonusAmount: paymentType === 'bonus' ? paymentAmount : 0,
        netPaid: paymentAmount,
        paymentType,
        paymentMethod,
        paidDate: paymentDate,
        note: paymentNote || undefined,
      });

      playNotificationChime();
      setIsAddPaymentModalOpen(false);
      setSelectedStaffForPayment(null);
      setPaymentNote('');
      loadData();
      onStaffUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add/Edit Staff Submit
  const handleStaffFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        await MessMitraApi.updateStaff(editingStaff.id, {
          name: staffName,
          role: staffRole,
          monthlySalary: staffSalary,
          phone: staffPhone,
        });
      } else {
        await MessMitraApi.createStaff({
          name: staffName,
          role: staffRole,
          monthlySalary: staffSalary,
          phone: staffPhone,
        });
      }
      playNotificationChime();
      setIsAddStaffModalOpen(false);
      setEditingStaff(null);
      setStaffName('');
      setStaffPhone('');
      onStaffUpdated();
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Salary Slip advice generator
  const generateWhatsAppSalaryAdviceUrl = (payment: StaffSalaryPayment, staffObj?: Staff) => {
    const phone = staffObj?.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = language === 'en'
      ? `🙏 *Hello ${payment.staffName}*,\n\nSalary / Advance Voucher from *${mess?.name || 'Shree Balaji Mess'}*:\n\n📄 *Voucher #:* \`${payment.voucherNumber}\`\n📅 *Month:* ${payment.month}\n💰 *Net Paid: ₹${payment.netPaid}*\n📝 *Type:* ${payment.paymentType === 'advance' ? 'Advance' : 'Monthly Salary Settlement'}\n💳 *Method:* ${payment.paymentMethod.toUpperCase()}\n📆 *Date:* ${payment.paidDate}\n${payment.note ? `ℹ️ *Note:* ${payment.note}\n` : ''}\n_Please acknowledge receipt of payment. Thank you!_\n- Shankar Giri (${mess?.name || 'Shree Balaji Mess'})`
      : `🙏 *नमस्ते ${payment.staffName}*,\n\n*${mess?.name || 'श्री बालाजी मेस'}* कडून पगार / उचल पावती:\n\n📄 *व्हाउचर क्र:* \`${payment.voucherNumber}\`\n📅 *महिना:* ${payment.month}\n💰 *भरणा रक्कम: ₹${payment.netPaid}*\n📝 *प्रकार:* ${payment.paymentType === 'advance' ? 'उचल' : 'मासिक पगार जमा'}\n💳 *माध्यम:* ${payment.paymentMethod.toUpperCase()}\n📆 *तारीख:* ${payment.paidDate}\n${payment.note ? `ℹ️ *नोंद:* ${payment.note}\n` : ''}\n_पैसे मिळाल्याची पोच द्यावी. धन्यवाद!_\n- शंकर गिरी (${mess?.name || 'श्री बालाजी मेस'})`;

    return `https://wa.me/${validPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-8">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {language === 'en' ? 'Staff Payroll & Ledger' : 'कर्मचारी पगार व हिशोब वही'}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono text-[10px] font-bold">
                {staffList.length} {language === 'en' ? 'Staff' : 'कर्मचारी'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'en'
                ? 'Cook & helper salary, advance payments and ledger management'
                : 'महाराज व मदतनीस पगार, उचल व पावती व्यवस्थापन'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-mono focus:outline-none cursor-pointer text-xs"
            />
          </div>

          <button
            onClick={() => {
              setEditingStaff(null);
              setStaffName('');
              setStaffRole(language === 'en' ? 'Head Cook' : 'महाराज');
              setStaffSalary(18000);
              setStaffPhone('');
              setIsAddStaffModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'en' ? '+ Add Staff' : '+ नवीन कर्मचारी जोडा'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Payroll Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'Total Salary Liability' : 'एकूण पगार दायित्व'}</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{totalPayrollBudget.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            {selectedMonth} • {staffList.filter((s) => s.isActive).length} {language === 'en' ? 'Active' : 'सक्रिय'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'Advances Paid' : 'दिलेली उचल'}</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            ₹{totalAdvancesThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-semibold">
            {language === 'en' ? 'Deducted from salary' : 'पगारातून वजा करावयाची उचल'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'Salary Disbursed' : 'वाटप केलेला पगार'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{totalPaidThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold">
            {language === 'en' ? 'Vouchers recorded' : 'पावती नोंदणी पूर्ण'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'Remaining Payable' : 'शिल्लक देणे पगार'}</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            ₹{remainingLiability.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-semibold">
            {language === 'en' ? 'Pending settlement' : 'या महिन्याची देय बाकी'}
          </div>
        </div>
      </div>

      {/* 2.5. Start of Month Salary Approval & Authorization Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          remainingLiability === 0
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-emerald-950/60 dark:to-slate-900 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
            : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/50 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-600/60 text-slate-900 dark:text-white'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
              remainingLiability === 0
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/30 animate-pulse'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {language === 'en' ? '👑 Start of Month Salary Approval' : '👑 महिन्याच्या सुरुवातीची पगार मंजुरी'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  remainingLiability === 0
                    ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {remainingLiability === 0
                  ? (language === 'en' ? '✅ Approved' : '✅ सर्व मंजूर')
                  : `${language === 'en' ? '⏳ Pending Approval' : '⏳ मंजुरी प्रलंबित'} (${selectedMonth})`}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {remainingLiability === 0
                ? (language === 'en'
                    ? `All staff payroll for ${selectedMonth} has been approved by owner Shankar Giri.`
                    : `${selectedMonth} चा सर्व कर्मचाऱ्यांचा पगार चालक शंकर गिरी यांनी मंजूर केला आहे.`)
                : (language === 'en'
                    ? `Monthly payroll for ${selectedMonth} is awaiting owner Shankar Giri's approval.`
                    : `${selectedMonth} चा मासिक पगार चालक शंकर गिरी यांच्या मंजुरीसाठी उपलब्ध आहे.`)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {language === 'en' ? 'Active Staff:' : 'एकूण सक्रिय कर्मचारी:'}{' '}
              <strong>{staffList.filter((s) => s.isActive).length}</strong> •{' '}
              {language === 'en' ? 'Base Salary:' : 'एकूण मूळ पगार:'}{' '}
              <strong>₹{totalPayrollBudget.toLocaleString('en-IN')}</strong> •{' '}
              {language === 'en' ? 'Advance Deductions:' : 'उचल कपात:'}{' '}
              <strong className="text-amber-600">₹{totalAdvancesThisMonth.toLocaleString('en-IN')}</strong> •{' '}
              {language === 'en' ? 'Remaining Payable:' : 'अंतिम देय शिल्लक:'}{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                ₹{remainingLiability.toLocaleString('en-IN')}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={openMonthlyApprovalModal}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs shadow-lg transition cursor-pointer min-h-[46px] ${
              remainingLiability === 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 text-white ring-2 ring-amber-400/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {remainingLiability === 0
                ? (language === 'en' ? 'View Approval Status' : 'पगार मंजुरी स्थिती पहा')
                : (language === 'en' ? '👑 Approve Monthly Payroll' : '👑 मासिक पगार मंजूर करा')}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Sub-Tabs (Payroll / Staff List) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
            activeSubTab === 'payroll'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{language === 'en' ? 'Payroll & Advances' : 'पगार व उचल नोंदवही'} ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff_list')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
            activeSubTab === 'staff_list'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'en' ? 'Staff Profiles' : 'कर्मचारी यादी'} ({staffList.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PAYROLL & ADVANCES LEDGER */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-4">
          {/* Quick Action: Staff Advance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffList
              .filter((s) => s.isActive)
              .map((staff) => {
                const staffPayments = payments.filter((p) => p.staffId === staff.id);
                const staffAdvances = staffPayments
                  .filter((p) => p.paymentType === 'advance')
                  .reduce((sum, p) => sum + p.netPaid, 0);
                const staffSettled = staffPayments
                  .filter((p) => p.paymentType === 'salary_settlement' || p.paymentType === 'monthly_approval')
                  .reduce((sum, p) => sum + p.netPaid, 0);
                const balanceDue = Math.max(0, staff.monthlySalary - staffAdvances - staffSettled);
                const isApproved = staffSettled > 0 || balanceDue === 0;

                return (
                  <div
                    key={staff.id}
                    className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col justify-between gap-3 transition ${
                      isApproved
                        ? 'border-emerald-300 dark:border-emerald-800/80'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {staff.role}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              {language === 'en' ? '✅ Salary Approved' : '✅ पगार मंजूर'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                              {language === 'en' ? '⏳ Pending Approval' : '⏳ मंजुरी बाकी'}
                            </span>
                          )}
                          <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            ₹{staff.monthlySalary.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-base text-slate-900 dark:text-white mt-2">
                        {staff.name}
                      </h4>
                      {staff.phone && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{staff.phone}</p>
                      )}

                      <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>{language === 'en' ? 'Advances Paid:' : 'दिलेली उचल:'}</span>
                          <span className="font-mono font-bold text-amber-600">₹{staffAdvances}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>{language === 'en' ? 'Salary Settled:' : 'जमा पगार:'}</span>
                          <span className="font-mono font-bold text-emerald-600">₹{staffSettled}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>{language === 'en' ? 'Remaining Balance:' : 'शिल्लक बाकी:'}</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">
                            ₹{balanceDue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaffForPayment(staff);
                          setPaymentType('advance');
                          setPaymentAmount(2000);
                          setIsAddPaymentModalOpen(true);
                        }}
                        className="py-2 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-xs rounded-xl transition cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
                      >
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'en' ? 'Advance' : 'उचल'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaffForPayment(staff);
                          setPaymentType('salary_settlement');
                          setPaymentAmount(balanceDue);
                          setIsAddPaymentModalOpen(true);
                        }}
                        className={`py-2 px-3 font-bold text-xs rounded-xl transition cursor-pointer min-h-[40px] flex items-center justify-center gap-1 shadow-sm ${
                          balanceDue > 0
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={balanceDue <= 0}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                          {balanceDue > 0
                            ? (language === 'en' ? '👑 Approve Salary' : '👑 पगार मंजूर')
                            : (language === 'en' ? 'Salary Paid' : 'पगार पूर्ण')}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Payments History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>
                  {language === 'en'
                    ? `Salary & Advance Vouchers (${selectedMonth})`
                    : `या महिन्यातील पगार व उचल पावत्या (${selectedMonth})`}
                </span>
              </h3>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {language === 'en'
                  ? `No salary or advance recorded in ${selectedMonth}.`
                  : `${selectedMonth} या महिन्यात कोणताही पगार किंवा उचल नोंदवलेली नाही.`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">{language === 'en' ? 'Voucher #' : 'व्हाउचर क्र.'}</th>
                      <th className="p-3">{language === 'en' ? 'Staff Name' : 'कर्मचाऱ्याचे नाव'}</th>
                      <th className="p-3">{language === 'en' ? 'Type' : 'प्रकार'}</th>
                      <th className="p-3">{language === 'en' ? 'Amount' : 'रक्कम'}</th>
                      <th className="p-3">{language === 'en' ? 'Method' : 'माध्यम'}</th>
                      <th className="p-3">{language === 'en' ? 'Date' : 'तारीख'}</th>
                      <th className="p-3">{language === 'en' ? 'Note / Reason' : 'नोंद / कारण'}</th>
                      <th className="p-3 text-right">{language === 'en' ? 'Actions' : 'कृती'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map((p) => {
                      const staffObj = staffList.find((s) => s.id === p.staffId);
                      const waUrl = generateWhatsAppSalaryAdviceUrl(p, staffObj);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="p-3 font-mono font-bold text-slate-500">{p.voucherNumber}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p.staffName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                p.paymentType === 'advance'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                  : p.paymentType === 'salary_settlement'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                            >
                              {p.paymentType === 'advance'
                                ? (language === 'en' ? 'Advance' : 'उचल')
                                : p.paymentType === 'salary_settlement'
                                ? (language === 'en' ? 'Salary' : 'पगार')
                                : (language === 'en' ? 'Bonus' : 'बोनस')}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-black text-sm text-slate-900 dark:text-white">
                            ₹{p.netPaid.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 uppercase font-mono text-[11px] text-slate-500">
                            {p.paymentMethod}
                          </td>
                          <td className="p-3 font-mono text-slate-500">{p.paidDate}</td>
                          <td className="p-3 text-slate-500 max-w-[160px] truncate">{p.note || '-'}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedVoucherForPrint(p)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                title={language === 'en' ? 'Print Voucher' : 'पावती प्रिंट करा'}
                              >
                                <Printer className="w-3.5 h-3.5 text-indigo-500" />
                              </button>

                              {staffObj?.phone && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 transition"
                                  title={language === 'en' ? 'Send WhatsApp Voucher' : 'WhatsApp पावती पाठवा'}
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STAFF PROFILES LIST */}
      {activeSubTab === 'staff_list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    {staff.role}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      staff.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {staff.isActive ? (language === 'en' ? 'Active' : 'सक्रिय') : (language === 'en' ? 'Inactive' : 'बंद')}
                  </span>
                </div>

                <h4 className="font-black text-base text-slate-900 dark:text-white mt-2">
                  {staff.name}
                </h4>

                <div className="space-y-1 text-xs text-slate-500 mt-2">
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Monthly Salary:' : 'मासिक वेतन:'}</span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      ₹{staff.monthlySalary.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  {staff.phone && (
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Mobile:' : 'मोबाईल:'}</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{staff.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {staff.phone && (
                  <a
                    href={`tel:${staff.phone}`}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Call' : 'कॉल'}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingStaff(staff);
                    setStaffName(staff.name);
                    setStaffRole(staff.role);
                    setStaffSalary(staff.monthlySalary);
                    setStaffPhone(staff.phone || '');
                    setIsAddStaffModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Edit' : 'संपादित करा'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. RECORD PAYMENT MODAL */}
      {isAddPaymentModalOpen && selectedStaffForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {language === 'en' ? 'Record Payment' : 'पगार / उचल नोंदवा'}
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  {selectedStaffForPayment.name} ({selectedStaffForPayment.role})
                </p>
              </div>
              <button
                onClick={() => setIsAddPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5 text-xs">
              {/* Payment Type */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'en' ? 'Payment Type *' : 'भरणा प्रकार *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('advance')}
                    className={`py-2 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                      paymentType === 'advance'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {language === 'en' ? 'Advance' : 'उचल'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('salary_settlement')}
                    className={`py-2 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                      paymentType === 'salary_settlement'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {language === 'en' ? 'Salary' : 'पगार'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('bonus')}
                    className={`py-2 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                      paymentType === 'bonus'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {language === 'en' ? 'Bonus' : 'बोनस'}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'en' ? 'Amount (₹) *' : 'रक्कम (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'en' ? 'Method *' : 'माध्यम *'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="cash">{language === 'en' ? 'Cash' : 'रोकड'}</option>
                    <option value="upi">{language === 'en' ? 'UPI (GPay / PhonePe)' : 'UPI'}</option>
                    <option value="bank_transfer">{language === 'en' ? 'Bank Transfer' : 'बँक ट्रान्सफर'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'en' ? 'Date *' : 'तारीख *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'en' ? 'Note / Reason (Optional)' : 'नोंद / कारण (पर्यायी)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Festival advance / Rent' : 'उदा. सण खरेदीसाठी उचल / घरभाडे'}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? (language === 'en' ? 'Saving...' : 'जतन करत आहे...')
                    : (language === 'en' ? 'Create Voucher' : 'पावती तयार करा')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT STAFF MODAL */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {editingStaff
                  ? (language === 'en' ? 'Edit Staff Profile' : 'कर्मचारी माहिती संपादित करा')
                  : (language === 'en' ? 'Add New Staff' : 'नवीन कर्मचारी जोडा')}
              </h3>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStaffFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'en' ? 'Staff Full Name *' : 'कर्मचाऱ्याचे पूर्ण नाव *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Mahadev Mama' : 'उदा. महादेव मामा'}
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'en' ? 'Role / Designation *' : 'पद / कामाचे स्वरूप *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Head Cook / Helper / Cleaning' : 'उदा. महाराज / मदतनीस / स्वच्छता'}
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'en' ? 'Monthly Salary (₹) *' : 'मासिक वेतन (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={staffSalary}
                    onChange={(e) => setStaffSalary(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'en' ? 'WhatsApp Mobile' : 'मोबाईल नंबर'}
                  </label>
                  <input
                    type="tel"
                    placeholder="9765432101"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? (language === 'en' ? 'Saving...' : 'जतन करत आहे...')
                    : (language === 'en' ? 'Save Staff' : 'कर्मचारी सेव्ह करा')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PRINTABLE SALARY VOUCHER MODAL */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto print:shadow-none print:border-none">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500 shadow-sm">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    {mess?.name || (language === 'en' ? 'Shree Balaji Mess' : 'श्री बालाजी मेस')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {mess?.area || (language === 'en' ? 'Karve Nagar' : 'कर्वे नगर')}, {mess?.city || (language === 'en' ? 'Pune' : 'पुणे')} • {language === 'en' ? 'Contact:' : 'संपर्क:'} {mess?.contactNumber || '9822338975'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-mono text-[10px] font-bold">
                  {selectedVoucherForPrint.voucherNumber}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{selectedVoucherForPrint.paidDate}</p>
              </div>
            </div>

            {/* Voucher Title */}
            <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-black text-sm uppercase tracking-wider text-indigo-900">
                {language === 'en' ? 'Salary Payment Voucher' : 'पगार / उचल पावती'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en' ? 'Month:' : 'महिना:'} {selectedVoucherForPrint.month}
              </p>
            </div>

            {/* Voucher Breakdown */}
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">{language === 'en' ? 'Staff Name:' : 'कर्मचाऱ्याचे नाव:'}</span>
                <span className="font-bold text-slate-900 text-sm">{selectedVoucherForPrint.staffName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">{language === 'en' ? 'Payment Type:' : 'भरणा प्रकार:'}</span>
                <span className="font-bold uppercase">
                  {selectedVoucherForPrint.paymentType === 'advance'
                    ? (language === 'en' ? 'Advance' : 'उचल')
                    : selectedVoucherForPrint.paymentType === 'salary_settlement'
                    ? (language === 'en' ? 'Salary' : 'पगार')
                    : (language === 'en' ? 'Bonus' : 'बोनस')}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">{language === 'en' ? 'Base Monthly Salary:' : 'मासिक मूळ वेतन:'}</span>
                <span className="font-mono">₹{selectedVoucherForPrint.baseSalary}</span>
              </div>
              <div className="flex justify-between py-1.5 font-black text-sm text-indigo-900 bg-indigo-50/60 p-2 rounded-xl">
                <span>{language === 'en' ? 'Net Paid Amount:' : 'अदा केलेली रक्कम:'}</span>
                <span className="font-mono text-base">₹{selectedVoucherForPrint.netPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">{language === 'en' ? 'Payment Method:' : 'भरणा माध्यम:'}</span>
                <span className="font-mono uppercase">{selectedVoucherForPrint.paymentMethod}</span>
              </div>
              {selectedVoucherForPrint.note && (
                <div className="py-1.5 text-slate-500">
                  <span>{language === 'en' ? 'Note:' : 'नोंद:'}</span> <em>&quot;{selectedVoucherForPrint.note}&quot;</em>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs">
              <div className="border-t border-slate-300 pt-2">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'en' ? 'Staff Signature / Thumb' : 'कर्मचाऱ्याची सही / अंगठा'}
                </span>
                <strong className="text-slate-700">{selectedVoucherForPrint.staffName}</strong>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'en' ? 'Owner Signature' : 'मेस मालकाची सही'}
                </span>
                <strong className="text-slate-700">
                  {language === 'en' ? 'Shankar Giri (Owner)' : 'शंकर गिरी (चालक)'}
                </strong>
              </div>
            </div>

            {/* Print & Close */}
            <div className="pt-4 flex items-center gap-2 print:hidden border-t">
              <button
                type="button"
                onClick={() => setSelectedVoucherForPrint(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'बंद करा'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'en' ? 'Print Voucher' : 'प्रिंट पावती'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. START-OF-MONTH SALARY APPROVAL & SETTLEMENT MODAL */}
      {isMonthlyApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>👑 {selectedMonth} {language === 'en' ? 'Official Monthly Salary Approval' : 'मासिक पगार अधिकृत मंजुरी'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      {language === 'en' ? 'Owner: Shankar Giri' : 'चालक: शंकर गिरी'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'en'
                      ? 'Review staff monthly payroll and confirm official approval in ledger.'
                      : 'महिन्याच्या सुरुवातीला कर्मचाऱ्यांचा पगार तपासून अंतिम मंजुरी व हिशोबात नोंद करा.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMonthlyApprovalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMonthlyApprovalSubmit} className="space-y-4 text-xs">
              {/* Approval List Table / Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{language === 'en' ? 'Review & Approve Staff Payroll:' : 'कर्मचारी पगार तपशील व कपात:'}</span>
                  <span className="text-[11px] text-slate-500">
                    {approvalItems.filter((i) => i.isIncluded).length} {language === 'en' ? 'Staff Selected' : 'कर्मचारी निवडले'}
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {approvalItems.map((item, idx) => (
                    <div
                      key={item.staffId}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isAlreadySettled
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                          : item.isIncluded
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.isIncluded}
                          disabled={item.isAlreadySettled}
                          onChange={(e) => {
                            const updated = [...approvalItems];
                            updated[idx].isIncluded = e.target.checked;
                            setApprovalItems(updated);
                          }}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {item.staffName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.role}
                            </span>
                            {item.isAlreadySettled && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {language === 'en' ? '✅ Already Approved' : '✅ आधीच मंजूर'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {language === 'en' ? 'Base:' : 'मूळ:'} <strong className="font-mono text-slate-800 dark:text-slate-200">₹{item.baseSalary}</strong>
                            </span>
                            {item.advanceDeductions > 0 && (
                              <span className="text-amber-600 dark:text-amber-400">
                                {language === 'en' ? 'Advance Deduction:' : 'उचल कपात:'} <strong className="font-mono">-₹{item.advanceDeductions}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Net Payable & Bonus Adjustment */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">
                            {language === 'en' ? 'Net Payable Salary:' : 'अंतिम देय पगार:'}
                          </span>
                          <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                            ₹{(item.netPaid + item.bonusAmount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Approval Summary */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                    {language === 'en' ? 'Total Approved Payroll:' : 'एकूण मंजूर करावयाची पगार रक्कम:'}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    {language === 'en'
                      ? `Will be disbursed to ${approvalItems.filter((i) => i.isIncluded && !i.isAlreadySettled).length} staff members`
                      : `${approvalItems.filter((i) => i.isIncluded && !i.isAlreadySettled).length} कर्मचाऱ्यांना अदा होईल`}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  ₹{approvalItems
                    .filter((i) => i.isIncluded && !i.isAlreadySettled)
                    .reduce((sum, i) => sum + i.netPaid + i.bonusAmount, 0)
                    .toLocaleString('en-IN')}
                </div>
              </div>

              {/* Payment Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'en' ? 'Payment Date *' : 'पगार वाटप तारीख *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={approvalPaymentDate}
                    onChange={(e) => setApprovalPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {language === 'en' ? 'Payment Method *' : 'भरणा माध्यम *'}
                  </label>
                  <select
                    value={approvalPaymentMethod}
                    onChange={(e) => {
                      const mode = e.target.value as any;
                      setApprovalPaymentMethod(mode);
                      const updated = approvalItems.map((item) => ({ ...item, paymentMethod: mode }));
                      setApprovalItems(updated);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="bank_transfer">{language === 'en' ? '🏛️ Bank Transfer / NEFT' : '🏛️ बँक ट्रान्सफर'}</option>
                    <option value="upi">{language === 'en' ? '📲 UPI (Google Pay / PhonePe)' : '📲 UPI'}</option>
                    <option value="cash">{language === 'en' ? '💵 Cash in Hand' : '💵 रोख'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {language === 'en' ? 'Approval Note' : 'मंजुरी शेरा / नोंद'}
                </label>
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? `e.g. Regular monthly salary for ${selectedMonth} approved by owner Shankar Giri.`
                      : `उदा. महिना ${selectedMonth} चा नियमित पगार चालक शंकर गिरी यांनी मंजूर केला.`
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMonthlyApprovalModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    approvalItems.filter((i) => i.isIncluded && !i.isAlreadySettled).length === 0
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 text-white font-black rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (language === 'en' ? 'Approving...' : 'मंजूर करत आहे...')
                      : (language === 'en' ? '✅ Confirm & Approve All Payroll' : '✅ सर्व पगार अधिकृत मंजूर करा व नोंदवा')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



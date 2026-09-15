'use client';

import React, { useState, useEffect } from 'react';
import {
  Mess,
  Member,
  LeaveRequest,
  BillingCycle,
  ExpenseRecurring,
  ExpenseOneOff,
  Staff,
  ProfitAndLossSummary,
  DailyCookForecast,
  PendingRegistration,
} from '@messmitra/types';
import { MessMitraApi, notifyDataChanged } from '../lib/api';
import { subscribeToMessRealtime } from '../lib/supabaseClient';
import { useI18n } from '../lib/i18n';
import { AuthProvider, useAuth } from '../lib/auth';
import { Navbar, ActiveTab, UserViewRole } from '../components/Navbar';
import { DailyForecastCard } from '../components/DailyForecastCard';
import { MemberDirectory } from '../components/MemberDirectory';
import { LeavesManagement } from '../components/LeavesManagement';
import { BillingDashboard } from '../components/BillingDashboard';
import { ExpensesManagement } from '../components/ExpensesManagement';
import { PnLDashboard } from '../components/PnLDashboard';
import { MemberPortalView } from '../components/MemberPortalView';
import { KitchenDisplayView } from '../components/KitchenDisplayView';
import { RegistrationApprovalsQueue } from '../components/RegistrationApprovalsQueue';
import { LoginModal } from '../components/LoginModal';
import { MessSetupWizardModal } from '../components/MessSetupWizardModal';
import { AddEditMemberModal } from '../components/AddEditMemberModal';
import { CloudDatabaseSyncModal } from '../components/CloudDatabaseSyncModal';
import { BulkMemberImportModal } from '../components/BulkMemberImportModal';
import { MessNoticeBoardQrModal } from '../components/MessNoticeBoardQrModal';
import { WhatsAppBroadcastModal } from '../components/WhatsAppBroadcastModal';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';
import {
  CheckCircle2,
  Sparkles,
  IndianRupee,
  Users,
  QrCode,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';

function DashboardContent() {
  const { t } = useI18n();
  const { user, role, switchDemoRole } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Domain State
  const [mess, setMess] = useState<Mess | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [billingData, setBillingData] = useState<{
    month: string;
    totalAmountDue: number;
    totalAmountPaid: number;
    totalPendingDues: number;
    cycles: BillingCycle[];
  }>({
    month: '2026-09',
    totalAmountDue: 0,
    totalAmountPaid: 0,
    totalPendingDues: 0,
    cycles: [],
  });
  const [recurringExpenses, setRecurringExpenses] = useState<ExpenseRecurring[]>([]);
  const [oneOffExpenses, setOneOffExpenses] = useState<ExpenseOneOff[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [pnlData, setPnLData] = useState<ProfitAndLossSummary>({
    month: '2026-09',
    totalDuesCollected: 0,
    totalPendingDues: 0,
    totalRecurringExpenses: 0,
    totalOneOffExpenses: 0,
    totalExpenses: 0,
    netProfit: 0,
    expenseBreakdownByCategory: {
      salary: 0,
      rent: 0,
      gas: 0,
      groceries: 0,
      dairy: 0,
      vegetables: 0,
      maintenance: 0,
      other: 0,
    },
  });
  const [forecast, setForecast] = useState<DailyCookForecast>({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalActiveMembers: 0,
    membersOnLeave: 0,
    cookForCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    vegCount: 0,
    nonVegCount: 0,
  });

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isQrPosterOpen, setIsQrPosterOpen] = useState(false);
  const [isWhatsAppBroadcastOpen, setIsWhatsAppBroadcastOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL params for direct actions (e.g., ?register=true or ?join=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('register') === 'true' ||
        params.get('join') === 'true' ||
        params.get('action') === 'register'
      ) {
        setLoginModalMode('register');
        setIsLoginModalOpen(true);
      } else if (params.get('login') === 'true') {
        setLoginModalMode('login');
        setIsLoginModalOpen(true);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async (month: string = selectedMonth) => {
    try {
      const [
        messRes,
        membersRes,
        leavesRes,
        billingRes,
        recurringRes,
        oneOffRes,
        staffRes,
        pnlRes,
        forecastRes,
        registrationsRes,
      ] = await Promise.all([
        MessMitraApi.getCurrentMess(),
        MessMitraApi.getMembers(),
        MessMitraApi.getLeaves(),
        MessMitraApi.getMonthlyBilling(month),
        MessMitraApi.getRecurringExpenses(),
        MessMitraApi.getOneOffExpenses(month),
        MessMitraApi.getStaff(),
        MessMitraApi.getPnLSummary(month),
        MessMitraApi.getCookForecast(),
        MessMitraApi.getPendingRegistrations(),
      ]);

      setMess(messRes);
      setMembers(membersRes);
      setLeaves(leavesRes);
      setBillingData(billingRes);
      setRecurringExpenses(recurringRes);
      setOneOffExpenses(oneOffRes);
      setStaffList(staffRes);
      setPnLData(pnlRes);
      setForecast(forecastRes);
      setRegistrations(registrationsRes);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadAllData(selectedMonth);

    // 1. Listen for local and intra-app mutations
    const handleDataMutation = () => {
      loadAllData(selectedMonth);
    };
    window.addEventListener('messmitra_data_changed', handleDataMutation);
    window.addEventListener('storage', handleDataMutation);

    // 2. Subscribe to Supabase Postgres Realtime broadcast
    const unsubscribe = subscribeToMessRealtime(mess?.id || 'all', () => {
      loadAllData(selectedMonth);
    });

    return () => {
      window.removeEventListener('messmitra_data_changed', handleDataMutation);
      window.removeEventListener('storage', handleDataMutation);
      unsubscribe();
    };
  }, [selectedMonth, mess?.id]);

  // Handlers for Mess & Member Actions
  const handleSaveMess = async (data: Partial<Mess>) => {
    const saved = await MessMitraApi.saveMess(data);
    setMess(saved);
    showToast(t('setupSuccess'));
    loadAllData();
  };

  const handleSaveMember = async (
    memberData: Omit<Member, 'id' | 'createdAt' | 'messId'>,
    memberId?: string
  ) => {
    if (memberId) {
      await MessMitraApi.updateMember(memberId, memberData);
      showToast('सभासद माहिती अपडेट झाली!');
    } else {
      await MessMitraApi.createMember(memberData);
      showToast('नवीन सभासद यशस्वीरित्या जोडला!');
    }
    loadAllData();
  };

  const handleToggleMemberStatus = async (member: Member) => {
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    await MessMitraApi.toggleMemberStatus(member.id, nextStatus as any);
    showToast(`सभासद स्थिती: ${nextStatus === 'active' ? 'सक्रिय' : 'बंद'}`);
    loadAllData();
  };

  // Handlers for Leave Actions
  const handleSubmitLeave = async (data: {
    memberId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) => {
    await MessMitraApi.submitLeave(data);
    showToast('सुट्टी अर्ज यशस्वीरित्या दाखल झाला!');
    loadAllData();
  };

  const handleReviewLeave = async (id: string, status: 'approved' | 'rejected') => {
    await MessMitraApi.reviewLeave(id, status);
    showToast(`सुट्टी ${status === 'approved' ? 'मंजूर' : 'नामंजूर'} केली!`);
    loadAllData();
  };

  // Handlers for Billing & Ledger
  const handleGenerateBills = async () => {
    const res = await MessMitraApi.generateMonthlyBills(selectedMonth);
    setBillingData(res);
    showToast(`${selectedMonth} महिन्याची बिले यशस्वीरित्या तयार झाली! 💰`);
    loadAllData();
  };

  const handleRecordPayment = async (
    cycleId: string,
    amount: number,
    method: 'upi_link' | 'cash',
    ref?: string
  ) => {
    await MessMitraApi.recordPayment(cycleId, amount, method, ref);
    showToast('फी भरल्याची नोंद झाली! ✅');
    loadAllData();
  };

  const handleRecordAdjustment = async (cycleId: string, amount: number, note: string) => {
    await MessMitraApi.recordAdjustment(cycleId, amount, note);
    showToast('अडजस्टमेंट नोंद यशस्वी! 📝');
    loadAllData();
  };

  // Handlers for Expenses
  const handleAddRecurring = async (data: any) => {
    await MessMitraApi.createRecurringExpense(data);
    showToast('नियमित खर्च जोडला गेला!');
    loadAllData();
  };

  const handleConfirmRecurring = async (id: string, month: string) => {
    await MessMitraApi.confirmRecurringExpense(id, month);
    showToast('मासिक खर्च निश्चित केला गेला!');
    loadAllData();
  };

  const handleAddOneOff = async (data: any) => {
    await MessMitraApi.createOneOffExpense(data);
    showToast('दैनंदिन खर्च नोंदवला!');
    loadAllData();
  };

  const handleAddStaff = async (data: any) => {
    await MessMitraApi.createStaff(data);
    showToast('कर्मचारी जोडला गेला!');
    loadAllData();
  };

  // Handlers for Registration Approvals
  const handleReviewRegistration = async (id: string, status: 'approved' | 'rejected') => {
    await MessMitraApi.reviewRegistration(id, status);
    showToast(
      status === 'approved'
        ? 'नोंदणी मंजूर झाली व खाते सक्रिय झाले! ✅'
        : 'नोंदणी नामंजूर केली.'
    );
    loadAllData();
  };

  // Export Handlers
  const handleExportBillingCsv = () => {
    MessMitraApi.downloadBillingCsv(billingData.cycles, selectedMonth);
    showToast('Billing CSV डाउनलोड सुरू झाले!');
  };

  const handleExportExpensesCsv = () => {
    MessMitraApi.downloadExpensesCsv(recurringExpenses, oneOffExpenses, selectedMonth);
    showToast('Expenses CSV डाउनलोड सुरू झाले!');
  };

  // Handlers for Forecast Date Navigation
  const handleForecastDateChange = async (date: string) => {
    try {
      const f = await MessMitraApi.getCookForecast(date);
      setForecast(f);
    } catch (err) {
      console.error('Forecast fetch failed:', err);
    }
  };

  // Member resolution for Member Portal View
  const [currentPortalMemberId, setCurrentPortalMemberId] = useState<string>('');
  const activeMemberId = user?.memberId || currentPortalMemberId;
  const activeMember =
    members.find((m) => m.id === activeMemberId) ||
    members[0] || {
      id: 'm1111111-1111-1111-1111-111111111111',
      messId: mess?.id || '',
      name: 'Rahul Deshmukh',
      phone: '+91 98901 23456',
      gender: 'male',
      rate: 3200,
      planType: 'both',
      joinDate: '2026-06-01',
      status: 'active',
      createdAt: '2026-06-01T00:00:00Z',
    };

  const activeMemberBilling = billingData.cycles.find((c) => c.memberId === activeMember.id) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-400/30 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar with View & Tab Switcher */}
      <Navbar
        mess={mess}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        viewRole={role}
        onToggleViewRole={(r) => switchDemoRole(r)}
        onOpenSettings={() => setIsSetupWizardOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        onOpenQrPoster={() => setIsQrPosterOpen(true)}
        onOpenWhatsAppBroadcast={() => setIsWhatsAppBroadcastOpen(true)}
        pendingLeavesCount={leaves.filter((l) => l.status === 'pending_approval').length}
        pendingRegistrationsCount={registrations.filter((r) => r.status === 'pending_approval').length}
      />

      {/* Main Container with real mobile measures and safe area insets */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 space-y-4 sm:space-y-6">
        {/* ROLE 1: MEMBER PORTAL VIEW */}
        {role === 'member' && (
          <MemberPortalView
            member={activeMember}
            allMembers={members}
            onSwitchMember={(m) => setCurrentPortalMemberId(m.id)}
            mess={mess}
            leaves={leaves}
            billingCycle={activeMemberBilling}
            onSubmitLeave={handleSubmitLeave}
          />
        )}

        {/* ROLE 2: KITCHEN / COOK DISPLAY VIEW */}
        {role === 'staff' && (
          <KitchenDisplayView
            forecast={forecast}
            leaves={leaves}
            members={members}
            onDateChange={handleForecastDateChange}
            cutoffTime={mess?.dailyCutoffTime}
          />
        )}

        {/* ROLE 3: OWNER DASHBOARD VIEW */}
        {role === 'owner' && (
          <>
            {/* Owner Header / Quick Mess Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs tracking-wider uppercase mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>२१ वर्षांची अखंड परंपरा</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  श्री बालाजी मेस
                </h1>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-bold mt-1">
                  चालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong> • चव हीच आमची ओळख
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  दुपार कटऑफ: <strong className="text-slate-800 dark:text-slate-200">09:00 AM</strong> • रात्र कटऑफ: <strong className="text-slate-800 dark:text-slate-200">06:00 PM</strong> • UPI:{' '}
                  <span className="font-mono text-brand-600 dark:text-brand-300 font-bold">{mess?.upiId || '9822338975@upi'}</span>
                </p>
              </div>

              {/* Owner Stats & Quick Action Tools */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>जमा फी ({selectedMonth})</span>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{pnlData.totalDuesCollected.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 min-w-[110px]">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
                      <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>सक्रिय सभासद</span>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      {members.filter((m) => m.status === 'active').length}{' '}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {members.length}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcut Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setIsQrPosterOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 transition cursor-pointer min-h-[44px]"
                    title="टेबल किंवा नोटीस बोर्डासाठी QR कोड पोस्टर"
                  >
                    <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>QR पोस्टर</span>
                  </button>

                  <button
                    onClick={() => setIsWhatsAppBroadcastOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 transition cursor-pointer min-h-[44px]"
                    title="सर्व सभासदांना WhatsApp मेसेज पाठवा"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>ब्रॉडकास्ट</span>
                  </button>

                  <button
                    onClick={() => setIsBulkImportOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-900 dark:text-blue-200 text-xs font-bold rounded-xl border border-blue-300 dark:border-blue-700 transition cursor-pointer min-h-[44px]"
                    title="CSV / Excel फाईलवरून सभासद जोडा"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Excel इंपोर्ट</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TAB: MEMBERS */}
            {activeTab === 'members' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <DailyForecastCard
                  forecast={forecast}
                  cutoffTime={mess?.dailyCutoffTime}
                  onDateChange={handleForecastDateChange}
                />

                {/* New Member & Chef Registration Approvals Queue */}
                <RegistrationApprovalsQueue
                  registrations={registrations}
                  onReview={handleReviewRegistration}
                />

                <MemberDirectory
                  members={members}
                  onAddMember={() => {
                    setSelectedMember(null);
                    setIsMemberModalOpen(true);
                  }}
                  onEditMember={(m) => {
                    setSelectedMember(m);
                    setIsMemberModalOpen(true);
                  }}
                  onToggleStatus={handleToggleMemberStatus}
                />
              </div>
            )}

            {/* TAB: LEAVES */}
            {activeTab === 'leaves' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <DailyForecastCard
                  forecast={forecast}
                  cutoffTime={mess?.dailyCutoffTime}
                  onDateChange={handleForecastDateChange}
                />
                <LeavesManagement
                  leaves={leaves}
                  members={members}
                  mess={mess}
                  onSubmitLeave={handleSubmitLeave}
                  onReviewLeave={handleReviewLeave}
                />
              </div>
            )}

            {/* TAB: BILLING */}
            {activeTab === 'billing' && (
              <div className="animate-fadeIn">
                <BillingDashboard
                  billingData={billingData}
                  mess={mess}
                  onGenerateBills={handleGenerateBills}
                  onRecordPayment={handleRecordPayment}
                  onRecordAdjustment={handleRecordAdjustment}
                  onExportCsv={handleExportBillingCsv}
                />
              </div>
            )}

            {/* TAB: EXPENSES */}
            {activeTab === 'expenses' && (
              <div className="animate-fadeIn">
                <ExpensesManagement
                  recurringExpenses={recurringExpenses}
                  oneOffExpenses={oneOffExpenses}
                  staffList={staffList}
                  onAddRecurring={handleAddRecurring}
                  onConfirmRecurring={handleConfirmRecurring}
                  onAddOneOff={handleAddOneOff}
                  onAddStaff={handleAddStaff}
                  onExportCsv={handleExportExpensesCsv}
                />
              </div>
            )}

            {/* TAB: P&L */}
            {activeTab === 'pnl' && (
              <div className="animate-fadeIn">
                <PnLDashboard
                  pnlData={pnlData}
                  onMonthChange={(m) => {
                    setSelectedMonth(m);
                    loadAllData(m);
                  }}
                  onExportBillingCsv={handleExportBillingCsv}
                  onExportExpensesCsv={handleExportExpensesCsv}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* PWA Install Prompt (Mobile/Desktop) */}
      <PwaInstallPrompt />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-600 dark:text-slate-500">
        <p>
          श्री बालाजी मेस — २१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख • चालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong>
        </p>
      </footer>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => showToast('लॉगिन यशस्वी! भूमिकेनुसार डॅशबोर्ड लोड झाला.')}
      />

      <MessSetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        currentMess={mess}
        onSave={handleSaveMess}
      />

      <CloudDatabaseSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onReloadAllData={loadAllData}
      />

      <AddEditMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        member={selectedMember}
        mess={mess}
        onSave={handleSaveMember}
      />

      <BulkMemberImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        messId={mess?.id || 'balaji-mess-pune'}
        onMembersImported={() => {
          showToast('सर्व सभासद यशस्वीरित्या जोडले गेले! 🎉');
          loadAllData();
        }}
      />

      <MessNoticeBoardQrModal
        isOpen={isQrPosterOpen}
        onClose={() => setIsQrPosterOpen(false)}
        mess={mess}
      />

      <WhatsAppBroadcastModal
        isOpen={isWhatsAppBroadcastOpen}
        onClose={() => setIsWhatsAppBroadcastOpen(false)}
        members={members}
        billingCycles={billingData.cycles}
        mess={mess}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

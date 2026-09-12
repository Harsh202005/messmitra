'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { BillingCycle, Mess, generateWhatsAppReminderLink } from '@messmitra/types';
import { BillInvoiceModal } from './BillInvoiceModal';
import {
  IndianRupee,
  Calendar,
  Sparkles,
  Download,
  MessageCircle,
  CreditCard,
  Sliders,
  CheckCircle2,
  Clock,
  X,
  PlusCircle,
  HelpCircle,
  Receipt,
} from 'lucide-react';

interface BillingDashboardProps {
  billingData: {
    month: string;
    totalAmountDue: number;
    totalAmountPaid: number;
    totalPendingDues: number;
    cycles: BillingCycle[];
  };
  mess: Mess | null;
  onGenerateBills: (month: string) => Promise<void>;
  onRecordPayment: (cycleId: string, amount: number, method: 'upi_link' | 'cash', ref?: string) => Promise<void>;
  onRecordAdjustment: (cycleId: string, amount: number, note: string) => Promise<void>;
  onExportCsv: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  billingData,
  mess,
  onGenerateBills,
  onRecordPayment,
  onRecordAdjustment,
  onExportCsv,
}) => {
  const { t } = useI18n();
  const [selectedMonth, setSelectedMonth] = useState(billingData.month || '2026-09');
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals state
  const [selectedCycleForPayment, setSelectedCycleForPayment] = useState<BillingCycle | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi_link' | 'cash'>('upi_link');
  const [transactionRef, setTransactionRef] = useState('');

  const [selectedCycleForAdjustment, setSelectedCycleForAdjustment] = useState<BillingCycle | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentNote, setAdjustmentNote] = useState('');

  const [selectedCycleForInvoice, setSelectedCycleForInvoice] = useState<BillingCycle | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateBills(selectedMonth);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleForPayment) return;
    await onRecordPayment(
      selectedCycleForPayment.id,
      paymentAmount,
      paymentMethod,
      transactionRef || undefined
    );
    setSelectedCycleForPayment(null);
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleForAdjustment || !adjustmentNote) return;
    await onRecordAdjustment(
      selectedCycleForAdjustment.id,
      adjustmentAmount,
      adjustmentNote
    );
    setSelectedCycleForAdjustment(null);
    setAdjustmentNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-500" />
            <span>{t('monthlyBillingLedger')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            56 Meals/Month Fixed Formula • Approved Leave Deductions • WhatsApp Payment Reminders & Official Invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month input */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'तयार करत आहे...' : t('generateBills')}</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
            title={t('exportCsv')}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {t('amountDue')} ({selectedMonth})
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ₹{billingData.totalAmountDue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">एकूण बिल आकारणी</span>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-emerald-500/30">
          <span className="text-xs font-medium text-emerald-400 block mb-1">
            {t('totalCollected')} ({selectedMonth})
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{billingData.totalAmountPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-300/80">जमा झालेली रक्कम</span>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-amber-500/30">
          <span className="text-xs font-medium text-amber-400 block mb-1">
            {t('pendingDues')} ({selectedMonth})
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ₹{billingData.totalPendingDues.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-amber-300/80">येणे बाकी</span>
        </div>
      </div>

      {/* Billing Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            सभासद बिलिंग व पावती तपशील ({billingData.cycles.length} सभासद)
          </h4>
          <span className="text-xs text-slate-400 font-mono">UPI ID: {mess?.upiId || 'Not set'}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {billingData.cycles.map((cycle) => {
            const outstanding = Math.max(0, cycle.amountDue - cycle.amountPaid);
            const waLink = generateWhatsAppReminderLink(
              cycle.memberPhone || '9890123456',
              cycle.memberName || 'Member',
              mess?.name || 'Balaji Mess',
              outstanding,
              mess?.upiId || 'balajimess@okhdfcbank',
              selectedMonth,
              cycle.approvedLeaveDays
            );

            return (
              <div
                key={cycle.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition"
              >
                {/* Member Info & Itemized Breakdown */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {cycle.memberName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        cycle.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : cycle.status === 'partially_paid'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {cycle.status === 'paid' ? 'Paid' : cycle.status === 'partially_paid' ? 'Partial' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span>दर: ₹{cycle.rate}/महिना ({cycle.baseMeals} जेवण)</span>
                    <span>•</span>
                    <span>सुट्टी वजावट: {cycle.approvedLeaveDays} दिवस</span>
                    <span>•</span>
                    <span>दर जेवण: ₹{Math.round(cycle.perMealRate || 57.14)}</span>
                  </div>
                </div>

                {/* Amount Due / Paid & Actions */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      बाकी: <span className="text-amber-400 font-mono">₹{outstanding}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      एकूण: ₹{cycle.amountDue} | भरले: ₹{cycle.amountPaid}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* View Invoice Receipt Slip */}
                    <button
                      onClick={() => setSelectedCycleForInvoice(cycle)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
                      title="पावती पाहा / प्रिंट करा"
                    >
                      <Receipt className="w-3.5 h-3.5 text-brand-400" />
                      <span className="hidden sm:inline">पावती</span>
                    </button>

                    {/* WhatsApp Reminder Button */}
                    {cycle.status !== 'paid' && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        title={t('sendWhatsAppReminder')}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    {/* Record Payment Button */}
                    <button
                      onClick={() => {
                        setSelectedCycleForPayment(cycle);
                        setPaymentAmount(outstanding);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('recordPayment')}</span>
                    </button>

                    {/* Record Adjustment Button */}
                    <button
                      onClick={() => {
                        setSelectedCycleForAdjustment(cycle);
                        setAdjustmentAmount(0);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition"
                      title={t('recordAdjustment')}
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedCycleForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>{t('recordPayment')} — {selectedCycleForPayment.memberName}</span>
              </h3>
              <button
                onClick={() => setSelectedCycleForPayment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  रक्कम (Amount in INR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पद्धत (Method) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_link')}
                    className={`py-2 px-3 rounded-lg border font-semibold transition ${
                      paymentMethod === 'upi_link'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    UPI / Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-lg border font-semibold transition ${
                      paymentMethod === 'cash'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    रोख (Cash)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="उदा. UPI/982200112233 किंवा पावती क्र."
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCycleForPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md"
                >
                  {t('recordPayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Adjustment Modal */}
      {selectedCycleForAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>{t('recordAdjustment')} — {selectedCycleForAdjustment.memberName}</span>
              </h3>
              <button
                onClick={() => setSelectedCycleForAdjustment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] leading-relaxed">
                हिशोबातील पारदर्शकता राखण्यासाठी दुरुस्ती कधीही छुपी केली जात नाही. स्वतंत्र ॲडजस्टमेंट पावती व कारण नोंदवणे बंधनकारक आहे.
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  दुरुस्ती रक्कम (Adjustment Amount in INR) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  placeholder="उदा. 200 किंवा -200"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('adjustmentNoteRequired')} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  placeholder="उदा. २ दिवस जेवण न मिळाल्याबद्दल विशेष सूट"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCycleForAdjustment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md"
                >
                  {t('recordAdjustment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Invoice Slip Modal */}
      <BillInvoiceModal
        isOpen={Boolean(selectedCycleForInvoice)}
        onClose={() => setSelectedCycleForInvoice(null)}
        cycle={selectedCycleForInvoice}
        mess={mess}
        member={null}
      />
    </div>
  );
};

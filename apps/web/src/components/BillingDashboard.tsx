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
  Receipt,
  Phone,
  AlertCircle,
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
  onOpenWhatsAppBroadcast?: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  billingData,
  mess,
  onGenerateBills,
  onRecordPayment,
  onRecordAdjustment,
  onExportCsv,
  onOpenWhatsAppBroadcast,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>मासिक बिलिंग व हिशोब (Billing Ledger)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ५६ जेवण सूत्र • सुट्टी वजावट • WhatsApp बिल व QR पावत्या
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'तयार करत आहे...' : 'बिले तयार करा'}</span>
          </button>

          {onOpenWhatsAppBroadcast && (
            <button
              onClick={onOpenWhatsAppBroadcast}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition min-h-[44px] cursor-pointer"
              title="सर्व सभासदांना WhatsApp बिल पाठवा"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">सर्व WhatsApp</span>
            </button>
          )}

          <button
            onClick={onExportCsv}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition min-h-[44px] cursor-pointer"
            title={t('exportCsv')}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Mobile 2-col / Desktop 3-col) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            एकूण बिल ({selectedMonth})
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹{billingData.totalAmountDue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400">एकूण बिल आकारणी</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-emerald-300 dark:border-emerald-500/30 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
            जमा फी ({selectedMonth})
          </span>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{billingData.totalAmountPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600/80">प्राप्त झालेली रक्कम</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-amber-300 dark:border-amber-500/30 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
            येणे बाकी ({selectedMonth})
          </span>
          <div className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            ₹{billingData.totalPendingDues.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-600/80">शिल्लक रक्कम</span>
        </div>
      </div>

      {/* Billing Ledger List (Mobile-First Stacked Card Layout) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            सभासद बिल तपशील ({billingData.cycles.length} सभासद)
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">UPI: {mess?.upiId || '9822338975@upi'}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {billingData.cycles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              या महिन्यासाठी बिले तयार केलेली नाहीत. वर दिलेल्या &quot;बिले तयार करा&quot; बटनावर क्लिक करा.
            </div>
          ) : (
            billingData.cycles.map((cycle) => {
              const outstanding = Math.max(0, cycle.amountDue - cycle.amountPaid);
              const waLink = generateWhatsAppReminderLink(
                cycle.memberPhone || '9822338975',
                cycle.memberName || 'Member',
                mess?.name || 'श्री बालाजी मेस',
                outstanding,
                mess?.upiId || '9822338975@upi',
                selectedMonth,
                cycle.approvedLeaveDays
              );

              return (
                <div
                  key={cycle.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition flex flex-col space-y-3"
                >
                  {/* Row 1: Member Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{cycle.memberName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            cycle.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : cycle.status === 'partially_paid'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {cycle.status === 'paid' ? 'Paid • भरले' : cycle.status === 'partially_paid' ? 'Partial' : 'Unpaid • बाकी'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {cycle.memberPhone || '+91 98223 38975'}
                      </div>
                    </div>

                    {/* Outstanding Due in Big Font */}
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black font-mono">
                        {outstanding > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">बाकी: ₹{outstanding}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">पूर्ण भरले ✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        एकूण: ₹{cycle.amountDue} | भरले: ₹{cycle.amountPaid}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Calculation Breakdown Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                    <span>दर: ₹{cycle.rate}/महा</span>
                    <span>•</span>
                    <span>जेवण: {cycle.baseMeals}</span>
                    {cycle.approvedLeaveDays > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          सुट्टी: -{cycle.approvedLeaveDays} दिवस (-₹{Math.round(cycle.approvedLeaveDays * cycle.perMealRate * 2)})
                        </span>
                      </>
                    )}
                  </div>

                  {/* Row 3: Thumb-reachable Actions (min 44px height for mobile phones) */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 pt-1">
                    {/* WhatsApp Reminder Button (Big Green Button) */}
                    {cycle.status !== 'paid' && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 sm:col-span-1 min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp बिल आठवण पाठवा</span>
                      </a>
                    )}

                    {/* Record Payment Button */}
                    <button
                      onClick={() => {
                        setSelectedCycleForPayment(cycle);
                        setPaymentAmount(outstanding);
                      }}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold border border-brand-200 dark:border-brand-800 transition cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-brand-600" />
                      <span>फी जमा करा</span>
                    </button>

                    {/* View Invoice Receipt Button */}
                    <button
                      onClick={() => setSelectedCycleForInvoice(cycle)}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-amber-500" />
                      <span>पावती / बिल</span>
                    </button>

                    {/* Record Adjustment Button */}
                    <button
                      onClick={() => {
                        setSelectedCycleForAdjustment(cycle);
                        setAdjustmentAmount(0);
                      }}
                      className="col-span-2 sm:col-span-1 min-h-[40px] p-2 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 transition text-xs font-medium cursor-pointer"
                      title="अडजस्टमेंट / सवलत"
                    >
                      <Sliders className="w-3.5 h-3.5 mr-1" />
                      <span>सवलत / अडजस्टमेंट</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Record Payment Bottom-Sheet Modal (Mobile-First) */}
      {selectedCycleForPayment && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>मेस फी जमा नोंद (Record Payment)</span>
              </h3>
              <button
                onClick={() => setSelectedCycleForPayment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedCycleForPayment.memberName}
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>महिना: {selectedCycleForPayment.month}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    शिल्लक बाकी: ₹{Math.max(0, selectedCycleForPayment.amountDue - selectedCycleForPayment.amountPaid)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  जमा रक्कम (Amount in ₹) *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पेमेंट पद्धत (Payment Method) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_link')}
                    className={`min-h-[44px] rounded-xl font-bold border transition ${
                      paymentMethod === 'upi_link'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    UPI / Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`min-h-[44px] rounded-xl font-bold border transition ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    रोख (Cash)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  रेफरन्स / UTR नंबर (Optional)
                </label>
                <input
                  type="text"
                  placeholder="उदा. UPI-123456789"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition text-sm cursor-pointer"
                >
                  रक्कम जमा नोंदवा व पावती बनवा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Adjustment Bottom-Sheet Modal (Mobile-First) */}
      {selectedCycleForAdjustment && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-500" />
                <span>विशेष सवलत किंवा अडजस्टमेंट (Adjustment)</span>
              </h3>
              <button
                onClick={() => setSelectedCycleForAdjustment(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedCycleForAdjustment.memberName}
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  महिना: {selectedCycleForAdjustment.month} • सध्याचे बिल: ₹{selectedCycleForAdjustment.amountDue}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  सवलत रक्कम (वजा करा - Discount in ₹) *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  placeholder="उदा. 200"
                  className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  सवलतीचे कारण (Reason / Note) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. आजारपण सवलत / विशेष सूट"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer"
                >
                  अडजस्टमेंट सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Invoice Modal */}
      {selectedCycleForInvoice && (
        <BillInvoiceModal
          isOpen={true}
          onClose={() => setSelectedCycleForInvoice(null)}
          billingCycle={selectedCycleForInvoice}
          mess={mess}
        />
      )}
    </div>
  );
};

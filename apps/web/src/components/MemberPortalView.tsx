'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, Mess, LeaveRequest, BillingCycle, isLeaveSubmissionLate } from '@messmitra/types';
import { UpiQrCode } from './UpiQrCode';
import {
  User,
  CreditCard,
  CalendarDays,
  Clock,
  CheckCircle,
  Receipt,
  Send,
  Sparkles,
  QrCode,
  ShieldCheck,
  ChevronDown,
  Phone,
  ExternalLink,
} from 'lucide-react';

interface MemberPortalViewProps {
  member: Member;
  allMembers: Member[];
  onSwitchMember: (member: Member) => void;
  mess: Mess | null;
  leaves: LeaveRequest[];
  billingCycle: BillingCycle | null;
  onSubmitLeave: (data: { memberId: string; startDate: string; endDate: string; reason?: string }) => Promise<void>;
}

export const MemberPortalView: React.FC<MemberPortalViewProps> = ({
  member,
  allMembers,
  onSwitchMember,
  mess,
  leaves,
  billingCycle,
  onSubmitLeave,
}) => {
  const { t } = useI18n();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isLatePreview = isLeaveSubmissionLate(
    new Date(),
    startDate,
    mess?.dailyCutoffTime || '18:00',
    member.planType,
    mess?.lunchCutoffTime || '09:00',
    mess?.dinnerCutoffTime || '18:00'
  );
  const myLeaves = leaves.filter((l) => l.memberId === member.id);
  const amountDue = billingCycle ? Math.max(0, billingCycle.amountDue - billingCycle.amountPaid) : member.rate;

  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(mess?.upiId || '9822338975@upi')}&pn=${encodeURIComponent(mess?.name || 'श्री बालाजी मेस')}&am=${amountDue}&cu=INR`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endDate < startDate) {
      setToastMsg('कृपया योग्य तारीख निवडा (शेवटची तारीख सुरुवातीच्या तारखेनंतर असावी)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitLeave({
        memberId: member.id,
        startDate,
        endDate,
        reason: reason || undefined,
      });
      setToastMsg('सुट्टी यशस्वीरित्या नोंदवली गेली! ✨');
      setTimeout(() => setToastMsg(null), 3000);
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVeg = (member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 right-4 left-4 sm:left-auto z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-bounce text-center">
          {toastMsg}
        </div>
      )}

      {/* Member Profile Banner & Member Switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{member.name}</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isVeg
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}
              >
                {isVeg ? '🟢 शाकाहारी (Veg)' : '🔴 मांसाहारी (Non-Veg)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              श्री बालाजी मेस • दर: ₹{member.rate}/महिना (५६ जेवणे)
            </p>
          </div>
        </div>

        {/* Member Account Switcher Dropdown (for testing) */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <select
              value={member.id}
              onChange={(e) => {
                const found = allMembers.find((m) => m.id === e.target.value);
                if (found) onSwitchMember(found);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none min-h-[40px]"
            >
              {allMembers.map((m) => {
                const veg = (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({veg ? '🟢 व्हेज' : '🔴 नॉन-व्हेज'}, ₹{m.rate})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Current Month Bill & Dynamic QR Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Bill Summary & 1-Tap UPI Pay */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                चालू महिन्याचे बिल ({billingCycle?.month || 'Current'})
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  billingCycle?.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                {billingCycle?.status === 'paid' ? 'Paid • भरले' : 'Unpaid • बाकी'}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white my-1 font-mono">
              ₹{billingCycle ? billingCycle.amountDue : member.rate}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>मासिक दर (५६ जेवणे):</span>
                <span className="font-mono font-bold">₹{member.rate}</span>
              </div>
              {billingCycle && billingCycle.approvedLeaveDays > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>सुट्टी वजावट ({billingCycle.approvedLeaveDays} दिवस):</span>
                  <span className="font-mono">
                    -₹{Math.round(billingCycle.approvedLeaveDays * billingCycle.perMealRate * 2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>बाकी रक्कम (Total Due):</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 text-sm">
                  ₹{amountDue}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic UPI QR inside Member Portal */}
          <div className="pt-2 flex flex-col items-center space-y-3">
            <UpiQrCode
              upiId={mess?.upiId || '9822338975@upi'}
              name={mess?.name || 'श्री बालाजी मेस'}
              amount={amountDue > 0 ? amountDue : (billingCycle?.amountDue || member.rate)}
              size={140}
            />

            {/* Mobile 1-Tap UPI Intent Link Button */}
            {amountDue > 0 && (
              <a
                href={upiIntentUrl}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>UPI ॲपने पैसे भरा (GPay / PhonePe / Paytm)</span>
              </a>
            )}
          </div>
        </div>

        {/* Leave Request Form for Member */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-brand-500" />
              <span>सुट्टी नोंदवा (Submit Leave Request)</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">तारीख पासून *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">तारीख पर्यंत *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Cutoff Evaluation Preview */}
              <div
                className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  isLatePreview
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <span>⏰ कटऑफ वेळ: दुपार ०९:०० AM • रात्र ०६:०० PM</span>
                </div>
                {isLatePreview ? (
                  <span>⚠️ कटऑफ वेळेनंतर (दुपार ०९:०० AM / रात्र ०६:०० PM) दाखल होत असल्यामुळे मालकाची (शंकर गिरी) मंजुरी लागेल.</span>
                ) : (
                  <span>✅ कटऑफ वेळेच्या आत असल्यामुळे ही सुट्टी आपोआप मंजूर होईल.</span>
                )}
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">कारण (Reason - Optional)</label>
                <input
                  type="text"
                  placeholder="उदा. गावी जात आहे / परीक्षा"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'नोंदवत आहे...' : 'सुट्टी दाखल करा'}</span>
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 text-center">
            अचूक हिशोबासाठी सुट्टी सुरू होण्याआधी नोंदवा.
          </div>
        </div>
      </div>

      {/* Member Leave History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-brand-500" />
          <span>माझ्या सुट्ट्यांची नोंद ({myLeaves.length})</span>
        </h3>

        {myLeaves.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">कोणतीही सुट्टी नोंदवलेली नाही.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myLeaves.map((l) => (
              <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {l.startDate} ते {l.endDate}
                  </div>
                  {l.reason && <p className="text-[11px] text-slate-500 italic mt-0.5">&quot;{l.reason}&quot;</p>}
                </div>

                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'auto_valid' || l.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : l.status === 'pending_approval'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                    }`}
                  >
                    {l.status === 'auto_valid' || l.status === 'approved'
                      ? 'मंजूर ✓'
                      : l.status === 'pending_approval'
                      ? 'प्रलंबित ⏳'
                      : 'नामंजूर ✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

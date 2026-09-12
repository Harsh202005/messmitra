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

  const isLatePreview = isLeaveSubmissionLate(new Date(), startDate, mess?.dailyCutoffTime || '09:00');
  const myLeaves = leaves.filter((l) => l.memberId === member.id);
  const amountDue = billingCycle ? Math.max(0, billingCycle.amountDue - billingCycle.amountPaid) : member.rate;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Member Profile Banner & Member Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-glow flex-shrink-0">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{member.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                (member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg')) === 'veg'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {(member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg')) === 'veg' ? '🟢 शाकाहारी (Veg)' : '🔴 मांसाहारी (Non-Veg)'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {mess?.name || 'श्री बालाजी मेस'} • {member.planType === 'both' ? 'दुपार + रात्र' : member.planType} • दर: ₹{member.rate}/महिना (५६ जेवण)
            </p>
          </div>
        </div>

        {/* Member Account Switcher Dropdown (for Demo / Testing) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <label className="text-[10px] text-slate-400 block mb-0.5">खाते बदला (Switch Member)</label>
            <select
              value={member.id}
              onChange={(e) => {
                const found = allMembers.find((m) => m.id === e.target.value);
                if (found) onSwitchMember(found);
              }}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {allMembers.map((m) => {
                const isVeg = (m.dietPreference || (m.gender === 'female' ? 'veg' : 'nonveg')) === 'veg';
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({isVeg ? '🟢 व्हेज' : '🔴 नॉन-व्हेज'}, ₹{m.rate})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Current Month Bill & Dynamic QR Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bill Summary & 1-Tap UPI Pay */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                चालू महिन्याचे बिल ({billingCycle?.month || 'Current'})
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  billingCycle?.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {billingCycle?.status || 'Unpaid'}
              </span>
            </div>

            <div className="text-3xl font-black text-white my-2 font-mono">
              ₹{billingCycle ? billingCycle.amountDue : member.rate}
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>मूळ मासिक दर (56 जेवण):</span>
                <span className="text-slate-200 font-mono">₹{member.rate}</span>
              </div>
              <div className="flex justify-between">
                <span>मंजूर सुट्टी वजावट:</span>
                <span className="text-emerald-400 font-mono">
                  -{billingCycle?.approvedLeaveDays || 0} दिवस (₹
                  {Math.round((billingCycle?.approvedLeaveDays || 0) * 2 * (billingCycle?.perMealRate || 57.14))})
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-800/60">
                <span>बाकी देय रक्कम:</span>
                <span className={`font-mono text-base ${amountDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{amountDue}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic UPI QR inside Member Portal */}
          <div className="pt-2 flex justify-center">
            <UpiQrCode
              upiId={mess?.upiId || '9822338975@upi'}
              name={mess?.name || 'श्री बालाजी मेस'}
              amount={amountDue > 0 ? amountDue : (billingCycle?.amountDue || member.rate)}
              size={130}
            />
          </div>
        </div>

        {/* Leave Request Form for Member */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-brand-500" />
              <span>सुट्टी नोंदवा (Submit Leave Request)</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">तारीख पासून *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">तारीख पर्यंत *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Cutoff Evaluation Preview */}
              <div
                className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  isLatePreview
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {isLatePreview ? (
                  <span>⚠️ रात्रीचे जेवण कटऑफ वेळेनंतर (06:00 PM / 18:00) दाखल होत असल्यामुळे मालकाची मंजुरी लागेल.</span>
                ) : (
                  <span>✅ वेळेत असल्यामुळे ही सुट्टी आपोआप मंजूर होईल.</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">कारण (Reason)</label>
                <input
                  type="text"
                  placeholder="उदा. गावी जात आहे / परीक्षा"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'नोंदवत आहे...' : 'सुट्टी दाखल करा'}</span>
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            अचूक हिशोबासाठी सुट्टी सुरू होण्याआधी नोंदवा.
          </div>
        </div>
      </div>

      {/* Member Leave History */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>माझ्या सुट्ट्यांची नोंद (Leave History & Dispute Audit)</span>
        </h3>

        {myLeaves.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">कोणतीही सुट्टी नोंदवलेली नाही.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {myLeaves.map((l) => (
              <div key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-white">
                    {l.startDate} ते {l.endDate}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    दाखल वेळ: {new Date(l.submittedAt).toLocaleString()}
                  </span>
                  {l.reason && <p className="text-xs text-slate-400 italic">"{l.reason}"</p>}
                </div>

                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'auto_valid' || l.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : l.status === 'pending_approval'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {l.status === 'auto_valid'
                      ? 'Auto Valid ✅'
                      : l.status === 'approved'
                      ? 'Approved ✅'
                      : l.status === 'pending_approval'
                      ? 'Pending Approval ⏳'
                      : 'Rejected ❌'}
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

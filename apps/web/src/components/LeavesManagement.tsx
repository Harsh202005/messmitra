'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { LeaveRequest, Member, Mess, LeaveStatus, isLeaveSubmissionLate } from '@messmitra/types';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  User,
  PlusCircle,
  Check,
  X,
} from 'lucide-react';

interface LeavesManagementProps {
  leaves: LeaveRequest[];
  members: Member[];
  mess: Mess | null;
  onSubmitLeave: (data: { memberId: string; startDate: string; endDate: string; reason?: string }) => Promise<void>;
  onReviewLeave: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export const LeavesManagement: React.FC<LeavesManagementProps> = ({
  leaves,
  members,
  mess,
  onSubmitLeave,
  onReviewLeave,
}) => {
  const { t } = useI18n();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const isLatePreview = isLeaveSubmissionLate(
    new Date(),
    startDate,
    mess?.dailyCutoffTime || '18:00',
    selectedMember?.planType,
    mess?.lunchCutoffTime || '09:00',
    mess?.dinnerCutoffTime || '18:00'
  );

  const pendingLeaves = leaves.filter((l) => l.status === 'pending_approval');
  const validOrApprovedLeaves = leaves.filter((l) => l.status !== 'pending_approval');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setIsSubmitting(true);
    try {
      await onSubmitLeave({
        memberId: selectedMemberId,
        startDate,
        endDate,
        reason: reason || undefined,
      });
      setIsSubmitModalOpen(false);
      setReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: LeaveStatus, isLate: boolean) => {
    switch (status) {
      case 'auto_valid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            <span>{t('autoValidBadge')}</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>{t('latePendingBadge')}</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <CheckCircle className="w-3 h-3" />
            <span>{t('approvedBadge')}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            <span>{t('rejectedBadge')}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-500" />
            <span>{t('leaves')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('timestampAuditNote')} • Cutoff: <strong className="text-slate-800 dark:text-slate-200">{mess?.dailyCutoffTime || '18:00'} (06:00 PM)</strong>
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition self-stretch sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('submitLeave')}</span>
        </button>
      </div>

      {/* Owner Approval Queue (Late Submissions) */}
      {pendingLeaves.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
              {t('ownerApprovalQueue')} ({pendingLeaves.length})
            </h4>
          </div>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
            या सुट्ट्या रोजच्या कटऑफ वेळेनंतर ({mess?.dailyCutoffTime || '18:00'} / 06:00 PM) दाखल झाल्या आहेत. एका क्लिकवर मंजुरी द्या:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white dark:bg-slate-900/90 rounded-xl p-4 border border-amber-300 dark:border-amber-500/30 flex flex-col justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{leave.memberName}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                      दाखल वेळ: {new Date(leave.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                    <CalendarDays className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>{leave.startDate} ते {leave.endDate}</span>
                  </div>
                  {leave.reason && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1.5 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                      "{leave.reason}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onReviewLeave(leave.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('approveBtn')}</span>
                  </button>
                  <button
                    onClick={() => onReviewLeave(leave.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition"
                  >
                    <X className="w-4 h-4" />
                    <span>{t('rejectBtn')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Leave Requests Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>सुट्टी नोंदवही (Dispute Resolution Audit Ledger)</span>
          </h4>
          <span className="text-xs text-slate-400">एकूण {leaves.length} नोंदी</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {leave.memberName}
                  </span>
                  {getStatusBadge(leave.status, leave.isLate)}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                    <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                    {leave.startDate} ➔ {leave.endDate}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">
                    नोंद वेळ: {new Date(leave.submittedAt).toLocaleString()}
                  </span>
                </div>
                {leave.reason && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    कारण: <span className="italic">{leave.reason}</span>
                  </p>
                )}
              </div>

              <div className="text-right text-xs text-slate-400 self-start sm:self-auto font-mono">
                {leave.reviewedAt ? (
                  <span className="text-emerald-400">
                    तपासले: {new Date(leave.reviewedAt).toLocaleDateString()}
                  </span>
                ) : leave.status === 'auto_valid' ? (
                  <span className="text-emerald-400 font-medium">कटऑफ आधी दाखल ✅</span>
                ) : (
                  <span className="text-amber-400">प्रलंबित ⏳</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Leave Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-500" />
                <span>{t('submitLeave')}</span>
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Member Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('members')} *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    तारीख पासून (From) *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    तारीख पर्यंत (To) *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cutoff Evaluation Preview Banner */}
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isLatePreview
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {isLatePreview ? (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300">उशिरा दाखल (Late Submission):</strong>
                      कटऑफ वेळेनंतर (दुपार ०९:०० AM / रात्र ०६:०० PM) दाखल होत असल्यामुळे ही सुट्टी मालकाच्या मंजुरीसाठी प्रलंबित राहील.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-emerald-300">वेळेत दाखल (Auto-Valid):</strong>
                      सुट्टी कटऑफ वेळेच्या आधी असल्यामुळे ती तात्काळ आपोआप मंजूर होईल.
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Reason */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('leaveReason')}
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="उदा. गावी जाणे / परीक्षा"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-amber-600 rounded-xl shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'नोंदवत आहे...' : t('submitLeave')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

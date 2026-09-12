'use client';

import React, { useState } from 'react';
import { PendingRegistration } from '@messmitra/types';
import {
  UserCheck,
  UserX,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  User,
  ChefHat,
  ShieldCheck,
} from 'lucide-react';

interface RegistrationApprovalsQueueProps {
  registrations: PendingRegistration[];
  onReview: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export const RegistrationApprovalsQueue: React.FC<RegistrationApprovalsQueueProps> = ({
  registrations,
  onReview,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingList = registrations.filter((r) => r.status === 'pending_approval');
  const pastList = registrations.filter((r) => r.status !== 'pending_approval');

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await onReview(id, status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                नवीन नोंदणी मंजुरी (Registration Approvals Queue)
              </h3>
              {pendingList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs animate-pulse">
                  {pendingList.length} नवीन
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              नवीन सभासद आणि कर्मचाऱ्यांचे खाते मंजुरीनंतरच सक्रिय होईल (शंकर गिरी)
            </p>
          </div>
        </div>
      </div>

      {/* Pending List Cards */}
      {pendingList.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            सध्या कोणतीही नवीन नोंदणी मंजुरीसाठी प्रलंबित नाही.
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            नवीन सभासद किंवा आचाऱ्यांनी ॲपवर नोंदणी केल्यास येथे दिसेल.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingList.map((reg) => (
            <div
              key={reg.id}
              className="bg-amber-50/50 dark:bg-slate-800/80 rounded-2xl p-4 border border-amber-300 dark:border-amber-500/30 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-xl ${
                        reg.role === 'member'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {reg.role === 'member' ? <User className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                    </span>
                    <div>
                      <strong className="text-sm text-slate-900 dark:text-white block font-bold">
                        {reg.name}
                      </strong>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {reg.phone}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40">
                    प्रलंबित (Pending)
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="mt-3 p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  {reg.role === 'member' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">आहार प्रकार:</span>
                        <strong className={reg.dietPreference === 'veg' ? 'text-emerald-600' : 'text-rose-600'}>
                          {reg.dietPreference === 'veg' ? '🟢 शाकाहारी (₹3,000)' : '🔴 मांसाहारी (₹3,200)'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">प्लॅन प्रकार:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {reg.planType === 'both'
                            ? 'दोन्ही वेळ (दुपार + रात्र)'
                            : reg.planType === 'lunch'
                            ? 'फक्त दुपार'
                            : 'फक्त रात्र'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">पद / भूमिका:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{reg.staffRole || 'आचारी'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">अपेक्षित वेतन:</span>
                        <span className="font-bold text-emerald-600 font-mono">₹{reg.salary?.toLocaleString('en-IN')}/महिना</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>दाखल वेळ:</span>
                    <span>{new Date(reg.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={processingId === reg.id}
                  onClick={() => handleAction(reg.id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{processingId === reg.id ? 'मंजूर करत आहे...' : 'मंजूर करा (Approve)'}</span>
                </button>

                <button
                  type="button"
                  disabled={processingId === reg.id}
                  onClick={() => handleAction(reg.id, 'rejected')}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition cursor-pointer disabled:opacity-50"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>नामंजूर</span>
                </button>

                <a
                  href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(
                    reg.name
                  )},%20regarding%20your%20Shree%20Balaji%20Mess%20registration`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                  title="WhatsApp वर संपर्क साधा"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Approved / Rejected History Summary */}
      {pastList.length > 0 && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <details className="group cursor-pointer">
            <summary className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between">
              <span>पूर्वीच्या नोंदणींचा इतिहास ({pastList.length} नोंदी)</span>
              <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {pastList.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{p.name}</strong>
                    <span className="text-[11px] text-slate-400 ml-2">({p.role === 'member' ? 'सभासद' : 'आचारी'})</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{p.phone}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}
                  >
                    {p.status === 'approved' ? 'मंजूर ✅' : 'नामंजूर ❌'}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

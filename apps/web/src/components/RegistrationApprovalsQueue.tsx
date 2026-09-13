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
  Check,
  X,
} from 'lucide-react';
import { generateDirectWhatsAppUrl, BALAJI_WHATSAPP_TEMPLATES } from '../lib/whatsappTemplates';

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

  const handleVerifyOnWhatsApp = (reg: PendingRegistration) => {
    const text = `🙏 *नमस्ते ${reg.name}*,
मी *शंकर गिरी (श्री बालाजी मेस)* कडून बोलत आहे.
आपण ॲपवर नोंदणी केली आहे. आपली माहिती पडताळून खाते सक्रिय केले जात आहे. 
आहार: ${reg.dietPreference === 'veg' ? 'शाकाहारी (₹३,०००)' : 'मांसाहारी (₹३,२००)'}. धन्यवाद! ✨`;

    const url = generateDirectWhatsAppUrl(reg.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
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
        <div className="p-6 sm:p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            सध्या कोणतीही नवीन नोंदणी मंजुरीसाठी प्रलंबित नाही.
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            नवीन सभासद किंवा आचाऱ्यांनी ॲपवर नोंदणी केल्यास येथे दिसेल.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {pendingList.map((reg) => (
            <div
              key={reg.id}
              className="bg-amber-50/50 dark:bg-slate-800/80 rounded-2xl p-4 border border-amber-300 dark:border-amber-500/30 shadow-sm flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-2 rounded-xl ${
                        reg.role === 'member'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {reg.role === 'member' ? <User className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                    </span>
                    <div>
                      <strong className="text-sm sm:text-base text-slate-900 dark:text-white block font-black">
                        {reg.name}
                      </strong>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {reg.phone}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300">
                    प्रलंबित
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
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
                    <span>{new Date(reg.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Large Touch Targets for Mobile) */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={processingId === reg.id}
                    onClick={() => handleAction(reg.id, 'approved')}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>मंजूर करा (Approve)</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingId === reg.id}
                    onClick={() => handleAction(reg.id, 'rejected')}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>नामंजूर (Reject)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOnWhatsApp(reg)}
                  className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-700/50 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp वर संपर्क / पडताळणी करा</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

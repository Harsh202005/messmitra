'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Home,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

export interface RegistrationStatusPopupProps {
  isOpen: boolean;
  isSuccess: boolean;
  errorMsg?: string | null;
  registrationData?: {
    name: string;
    phone: string;
    role?: 'member' | 'staff';
    planType?: string;
    dietPreference?: string;
    rate?: number;
    staffRole?: string;
  } | null;
  onClose: () => void;
}

export const RegistrationStatusPopup: React.FC<RegistrationStatusPopupProps> = ({
  isOpen,
  isSuccess,
  errorMsg,
  registrationData,
  onClose,
}) => {
  const { language } = useI18n();
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  const handleRedirectToLanding = () => {
    onClose();
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/') {
        router.push('/');
      }
    }
  };

  useEffect(() => {
    if (!isOpen || !isSuccess) return;
    setCountdown(4);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirectToLanding();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  const ownerPhone = '9822338975';
  const ownerName = 'शंकर गिरी';

  const formatPlanName = (plan?: string, diet?: string) => {
    if (!plan) return 'मेस सभासद';
    const dietText = diet === 'nonveg' ? 'मांसाहारी स्पेशल' : 'शुद्ध शाकाहारी';
    if (plan === 'lunch') return `१-वेळ दुपार (${dietText})`;
    if (plan === 'dinner') return `१-वेळ रात्र (${dietText})`;
    return `२-वेळ दोन्ही वेळ (${dietText})`;
  };

  const whatsappText = encodeURIComponent(
    `नमस्ते शंकर गिरी सर, मी श्री बालाजी मेस साठी नवीन नोंदणी अर्ज भरला आहे.\nनाव: ${registrationData?.name || ''}\nमोबाईल: ${registrationData?.phone || ''}\nकृपया माझा अर्ज मंजूर करावा ही विनंती.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-scaleUp">
        
        {/* Top Decorative Header Accent */}
        <div
          className={`h-2.5 w-full ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
              : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Status Icon & Title */}
          {isSuccess ? (
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner relative">
                <CheckCircle2 className="w-9 h-9 animate-bounce" />
                <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {language === 'en'
                  ? 'Registration Submitted Successfully! 🎉'
                  : 'नोंदणी अर्ज यशस्वीरित्या सादर झाला! 🎉'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'en'
                  ? `Your application has been forwarded to Mess Owner ${ownerName} for approval.`
                  : `तुमचा नोंदणी अर्ज मेस चालक ${ownerName} (${ownerPhone}) यांच्याकडे मंजुरीसाठी पाठवण्यात आला आहे.`}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-9 h-9" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                {language === 'en' ? 'Registration Failed' : 'नोंदणी अयशस्वी झाली'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {errorMsg ||
                  (language === 'en'
                    ? 'There was an issue submitting your registration. Please verify your details and try again.'
                    : 'नोंदणी सबमिट करताना अडचण आली. कृपया माहिती तपासून पुन्हा प्रयत्न करा.')}
              </p>
            </div>
          )}

          {/* Details Summary Card (on success) */}
          {isSuccess && registrationData && (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === 'en' ? 'Applicant Name' : 'अर्जदाराचे नाव'}:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {registrationData.name}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === 'en' ? 'Mobile' : 'मोबाईल नंबर'}:
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {registrationData.phone}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === 'en' ? 'Plan / Role' : 'प्लॅन / पद'}:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {registrationData.role === 'staff'
                    ? registrationData.staffRole || 'कर्मचारी'
                    : formatPlanName(registrationData.planType, registrationData.dietPreference)}
                </span>
              </div>

              {registrationData.rate ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Monthly Fee' : 'मासिक शुल्क'}:
                  </span>
                  <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400">
                    ₹{registrationData.rate.toLocaleString('en-IN')}/महिना
                  </span>
                </div>
              ) : null}

              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>स्थिती: <strong>मंजुरी प्रलंबित (Pending Approval)</strong></span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {isSuccess ? (
              <>
                <a
                  href={`https://wa.me/91${ownerPhone}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {language === 'en'
                      ? 'WhatsApp Shri Shankar Giri'
                      : 'श्री. शंकर गिरी यांना WhatsApp करा'}
                  </span>
                </a>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${ownerPhone}`}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                    <span>कॉल करा (९८२२३३८९७५)</span>
                  </a>

                  <button
                    onClick={handleRedirectToLanding}
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? `Home (${countdown}s)` : `मुख्य पृष्ठ (${countdown}s)`}</span>
                  </button>
                </div>

                {/* Auto Redirect Notice Banner */}
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-750 flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {language === 'en'
                        ? `Redirecting to landing page in ${countdown}s...`
                        : `${countdown} सेकंदात मुख्य लँडिंग पृष्ठावर पाठवले जात आहे...`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRedirectToLanding}
                    className="underline text-amber-700 dark:text-amber-300 hover:text-amber-900 cursor-pointer"
                  >
                    {language === 'en' ? 'Go now' : 'आत्ताच जा →'}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {language === 'en' ? 'Try Again' : 'पुन्हा प्रयत्न करा'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

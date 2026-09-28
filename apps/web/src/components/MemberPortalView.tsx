'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import {
  Member,
  Mess,
  LeaveRequest,
  BillingCycle,
  isLeaveSubmissionLate,
  formatTime12Hour,
} from '@messmitra/types';
import { UpiQrCode } from './UpiQrCode';
import {
  InAppNotification,
  getStoredNotifications,
  markNotificationAsRead,
} from '../lib/notificationService';
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
  Phone,
  ExternalLink,
  Bell,
  Utensils,
  Salad,
  Egg,
  Copy,
  Check,
  MessageCircle,
  AlertCircle,
  Info,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface MemberPortalViewProps {
  member: Member;
  mess: Mess | null;
  leaves: LeaveRequest[];
  billingCycle: BillingCycle | null;
  onSubmitLeave: (data: {
    memberId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) => Promise<void>;
}

export const MemberPortalView: React.FC<MemberPortalViewProps> = ({
  member,
  mess,
  leaves,
  billingCycle,
  onSubmitLeave,
}) => {
  const { language, t } = useI18n();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Live in-app notifications for member
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    setNotifications(getStoredNotifications());

    const handleNewNotif = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('messmitra_new_notification', handleNewNotif);
    window.addEventListener('storage', handleNewNotif);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('messmitra_notification_channel');
        channel.onmessage = () => {
          setNotifications(getStoredNotifications());
        };
      }
    } catch { }

    return () => {
      window.removeEventListener('messmitra_new_notification', handleNewNotif);
      window.removeEventListener('storage', handleNewNotif);
      if (channel) channel.close();
    };
  }, []);

  if (!member) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
          {language === 'en' ? 'No Member Profile Found' : 'कोणताही सभासद प्रोफाइल सापडला नाही'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {language === 'en'
            ? 'Please enroll as a member or ask the mess admin to add your membership profile.'
            : 'कृपया नवीन सभासद म्हणून नोंदणी करा किंवा मेस मालकांना नवीन सभासद जोडण्यास सांगा.'}
        </p>
      </div>
    );
  }

  const lunchCutoff = mess?.lunchCutoffTime || '09:00';
  const dinnerCutoff = mess?.dinnerCutoffTime || mess?.dailyCutoffTime || '18:00';
  const formattedLunchCutoff = formatTime12Hour(lunchCutoff, '09:00 AM');
  const formattedDinnerCutoff = formatTime12Hour(dinnerCutoff, '06:00 PM');

  const isLatePreview = isLeaveSubmissionLate(
    new Date(),
    startDate,
    dinnerCutoff,
    member.planType,
    lunchCutoff,
    dinnerCutoff
  );

  const myLeaves = leaves.filter((l) => l.memberId === member.id);
  const amountDue = billingCycle
    ? Math.max(0, billingCycle.amountDue - billingCycle.amountPaid)
    : member.rate;

  const currentUpiId = mess?.upiId || '9822338975@upi';
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(currentUpiId)}&pn=${encodeURIComponent(
    mess?.name || 'श्री बालाजी मेस'
  )}&am=${amountDue}&cu=INR`;

  const copyUpiToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

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
      setTimeout(() => setToastMsg(null), 3500);
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVeg = member.dietPreference === 'veg';
  const isOneMeal = member.planType === 'lunch' || member.planType === 'dinner';
  const latestNotif = notifications[0] || null;

  const [showIdCard, setShowIdCard] = useState(false);

  // Time remaining to next cutoff calculation
  const [timeToCutoff, setTimeToCutoff] = useState<{ slot: string; timeStr: string; isPast: boolean }>({
    slot: 'lunch',
    timeStr: '',
    isPast: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      const totalMinutesNow = currentHours * 60 + currentMins;

      const [lH, lM] = (mess?.lunchCutoffTime || '09:00').split(':').map(Number);
      const [dH, dM] = (mess?.dinnerCutoffTime || mess?.dailyCutoffTime || '18:00').split(':').map(Number);

      const lunchTotalMins = (lH || 9) * 60 + (lM || 0);
      const dinnerTotalMins = (dH || 18) * 60 + (dM || 0);

      if (totalMinutesNow < lunchTotalMins) {
        const diff = lunchTotalMins - totalMinutesNow;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        setTimeToCutoff({
          slot: language === 'en' ? 'Lunch Cutoff' : 'दुपार कटऑफ',
          timeStr: `${hrs > 0 ? `${hrs}h ` : ''}${mins}m remaining`,
          isPast: false,
        });
      } else if (totalMinutesNow < dinnerTotalMins) {
        const diff = dinnerTotalMins - totalMinutesNow;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        setTimeToCutoff({
          slot: language === 'en' ? 'Dinner Cutoff' : 'रात्र कटऑफ',
          timeStr: `${hrs > 0 ? `${hrs}h ` : ''}${mins}m remaining`,
          isPast: false,
        });
      } else {
        setTimeToCutoff({
          slot: language === 'en' ? 'Today\'s Cutoffs' : 'आजचे कटऑफ संपले',
          timeStr: language === 'en' ? 'Closed for today' : 'उद्याच्या जेवणासाठी सुट्टी नोंदवा',
          isPast: true,
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [mess, language]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fadeIn pb-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 right-4 left-4 sm:left-auto z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-bounce text-center">
          {toastMsg}
        </div>
      )}

      {/* 1. MEMBER PROFILE & WELCOME CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-brand-500/10 via-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md bg-white">
                <img
                  src="/logo.jpeg"
                  alt="श्री बालाजी मेस"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-mono text-[10px] font-black shadow-xs">
                MEMBER
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {member.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                    isVeg
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                  }`}
                >
                  {isVeg ? <Salad className="w-3 h-3" /> : <Egg className="w-3 h-3" />}
                  <span>{isVeg ? (language === 'en' ? 'Pure Vegetarian' : 'शुद्ध शाकाहारी') : (language === 'en' ? 'Non-Veg / Special' : 'मांसाहारी / स्पेशल')}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2 flex-wrap">
                <span>
                  {language === 'en' ? 'Plan: ' : 'योजना: '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {member.planType === 'both'
                      ? (language === 'en' ? 'Lunch + Dinner (2 Meals)' : 'दुपार + रात्र (२-वेळ जेवण)')
                      : member.planType === 'lunch'
                      ? (language === 'en' ? 'Lunch Only (1 Meal)' : 'दुपारचे जेवण (१-वेळ)')
                      : (language === 'en' ? 'Dinner Only (1 Meal)' : 'रात्रीचे जेवण (१-वेळ)')}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  {language === 'en' ? 'Rate: ' : 'दर: '}<strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹{member.rate}/{language === 'en' ? 'mo' : 'महिना'}</strong>
                </span>
                {member.phone && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{member.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setShowIdCard(!showIdCard)}
              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showIdCard ? 'ओळखपत्र लपवा' : 'डिजिटल मेस पास'}</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'en' ? 'Active Member' : 'सक्रिय सभासद'}</span>
            </span>
          </div>
        </div>

        {/* Live Cutoff Countdown Ribbon */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>
              <strong>{timeToCutoff.slot}:</strong> {timeToCutoff.timeStr}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            दुपार: {formattedLunchCutoff} • रात्र: {formattedDinnerCutoff}
          </div>
        </div>

        {/* EXPANDABLE DIGITAL ID PASS */}
        {showIdCard && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700 animate-fadeIn">
            <div className="max-w-md mx-auto bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white rounded-3xl p-5 shadow-xl border-2 border-amber-300/40 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white p-0.5 shadow-sm">
                    <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight text-white leading-tight">श्री बालाजी मेस</h3>
                    <span className="text-[9px] text-amber-100">२१ वर्षांची अखंड परंपरा • पुणे</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 font-mono font-black text-[10px] uppercase shadow-sm">
                  PASS #BAL-{member.id.substring(0, 4).toUpperCase()}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="text-base font-black text-white">{member.name}</div>
                  <div className="text-[11px] text-amber-100 font-mono">{member.phone || 'N/A'}</div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[10px]">
                      {isVeg ? '🟢 शाकाहारी (Veg)' : '🔴 मांसाहारी (Non-Veg)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[10px]">
                      {member.planType === 'both' ? '२-वेळ जेवण' : '१-वेळ जेवण'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-md">
                  <UpiQrCode
                    upiId={currentUpiId}
                    name={mess?.name || 'श्री बालाजी मेस'}
                    amount={amountDue > 0 ? amountDue : member.rate}
                    size={75}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-amber-100">
                <span>चालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong></span>
                <span className="font-mono">सक्रिय सभासद • Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. LIVE MESS NOTICE / ANNOUNCEMENT BOARD */}
      {latestNotif && (
        <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/5 dark:from-amber-950/30 dark:to-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                  {language === 'en' ? 'Mess Notice' : 'मेस सूचना फलक'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(latestNotif.timestamp).toLocaleTimeString('mr-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                {latestNotif.title}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                {latestNotif.body}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotifOpen(true)}
            className="px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0 cursor-pointer"
          >
            सर्व पहा ({notifications.length})
          </button>
        </div>
      )}

      {/* 3. MAIN GRID: BILL & UPI PAYMENT + LEAVE SUBMISSION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* LEFT: Monthly Bill & Dynamic Live UPI Payment Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                चालू महिन्याचे बिल ({billingCycle?.month || '2026-09'})
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  billingCycle?.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                }`}
              >
                {billingCycle?.status === 'paid' ? 'Paid • फी जमा झाली' : 'Unpaid • बाकी'}
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white my-1 font-mono tracking-tight">
              ₹{billingCycle ? billingCycle.amountDue : member.rate}
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>मासिक मूळ दर ({isOneMeal ? '२८ जेवणे' : '५६ जेवणे'}):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  ₹{member.rate}
                </span>
              </div>

              {billingCycle && billingCycle.approvedLeaveDays > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span>
                    मंजूर सुट्टी वजावट ({billingCycle.approvedLeaveDays} दिवस):
                  </span>
                  <span className="font-mono">
                    -₹{Math.round(billingCycle.approvedLeaveDays * billingCycle.perMealRate * (isOneMeal ? 1 : 2))}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{language === 'en' ? 'Net Payable:' : 'एकूण बाकी रक्कम:'}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  ₹{amountDue}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Live UPI QR Code generated with Mess Owner's updated UPI ID */}
          <div className="pt-2 flex flex-col items-center space-y-3 bg-slate-50 dark:bg-slate-850/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-750">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <QrCode className="w-4 h-4 text-brand-500" />
              <span>{language === 'en' ? 'Scan & Pay Instantly' : 'स्कॅन करून त्वरित पैसे भरा'}</span>
            </div>

            <UpiQrCode
              upiId={currentUpiId}
              name={mess?.name || (language === 'en' ? 'Shree Balaji Mess' : 'श्री बालाजी मेस')}
              amount={amountDue > 0 ? amountDue : (billingCycle?.amountDue || member.rate)}
              size={140}
            />

            {/* Copy UPI ID */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono">
              <span className="text-slate-500">UPI ID:</span>
              <strong className="text-slate-900 dark:text-white">{currentUpiId}</strong>
              <button
                type="button"
                onClick={copyUpiToClipboard}
                className="p-1 text-slate-400 hover:text-brand-600 transition cursor-pointer"
                title={language === 'en' ? 'Copy UPI ID' : 'UPI ID कॉपी करा'}
              >
                {copiedUpi ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Mobile 1-Tap UPI Intent Link Button */}
            {amountDue > 0 && (
              <a
                href={upiIntentUrl}
                className="w-full min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{language === 'en' ? 'Pay via UPI App' : 'UPI ॲपने थेट पैसे भरा'}</span>
              </a>
            )}
          </div>
        </div>

        {/* RIGHT: Interactive Leave Application Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-500" />
                <span>{language === 'en' ? 'Submit Leave Request' : 'सुट्टी नोंदवा'}</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    {language === 'en' ? 'From Date *' : 'तारीख पासून *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    {language === 'en' ? 'To Date *' : 'तारीख पर्यंत *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  {language === 'en' ? 'Reason (Optional)' : 'सुट्टीचे कारण (ऐच्छिक)'}
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Going home for exams / family function' : 'उदा. परीक्षा / गावी जात आहे'}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Leave Policy Helper */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'en' ? 'Balaji Mess Leave Policy:' : 'श्री बालाजी मेस सुट्टी नियम:'}</span>
                </div>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {language === 'en'
                    ? `Lunch cutoff is ${formatTime12Hour(mess?.lunchCutoffTime || '09:00', '09:00 AM')} and dinner cutoff is ${formatTime12Hour(mess?.dinnerCutoffTime || mess?.dailyCutoffTime || '18:00', '06:00 PM')}. Min 3 days required for billing deduction.`
                    : `दुपारच्या सुट्टीसाठी सकाळी ${formatTime12Hour(mess?.lunchCutoffTime || '09:00', '09:00 AM')} च्या आधी व रात्रीच्या सुट्टीसाठी संध्याकाळी ${formatTime12Hour(mess?.dinnerCutoffTime || mess?.dailyCutoffTime || '18:00', '06:00 PM')} च्या आधी नोंद करावी. बिल सवलतीसाठी सलग किमान ३ दिवस आवश्यक.`}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[46px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (language === 'en' ? 'Submitting...' : 'नोंद होत आहे...') : (language === 'en' ? 'Submit Leave Request' : 'सुट्टी नोंदवा')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 4. MEMBER'S LEAVE HISTORY */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-brand-500" />
          <span>{language === 'en' ? 'Leave History' : 'माझ्या सुट्ट्यांची नोंदवही'}</span>
          <span className="text-xs font-normal text-slate-400 font-mono">({myLeaves.length})</span>
        </h3>

        {myLeaves.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {language === 'en' ? 'No leaves recorded for current month.' : 'चालू महिन्यात कोणतीही सुट्टी नोंदवलेली नाही.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myLeaves.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>
                      {l.startDate} {language === 'en' ? 'to' : 'ते'} {l.endDate}
                    </span>
                  </div>
                  {l.reason && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      &quot;{l.reason}&quot;
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      l.status === 'auto_valid' || l.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                        : l.status === 'pending_approval'
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300'
                    }`}
                  >
                    {l.status === 'auto_valid' || l.status === 'approved'
                      ? (language === 'en' ? 'Approved ✓' : 'मंजूर ✓')
                      : l.status === 'pending_approval'
                      ? (language === 'en' ? 'Pending ⏳' : 'प्रलंबित ⏳')
                      : (language === 'en' ? 'Rejected ✗' : 'नामंजूर ✗')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MESS OWNER SUPPORT & ASSISTANCE BAR */}
      <div className="bg-slate-100 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            {language === 'en' ? 'For any help or inquiries, contact manager ' : 'काही अडचण किंवा प्रश्न असल्यास मेस चालक '}<strong>शंकर गिरी</strong> {language === 'en' ? '.' : 'यांच्याशी संपर्क साधा.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+919822338975"
            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:border-brand-500 transition"
          >
            <Phone className="w-3.5 h-3.5 text-brand-500" />
            <span>{language === 'en' ? 'Call' : 'कॉल करा'}</span>
          </a>

          <a
            href="https://wa.me/919822338975?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0%20%E0%A4%B6%E0%A4%82%E0%A4%95%E0%A4%B0%20%E0%A4%97%E0%A4%BF%E0%A4%B0%E0%A5%80%20%E0%A4%B8%E0%A4%B0%2C%20%E0%A4%AE%E0%A4%BE%20..."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp मेसेज</span>
          </a>
        </div>
      </div>

      {/* 6. NOTIFICATIONS HISTORY MODAL */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {language === 'en' ? 'All Notifications' : 'मेस सूचना इतिहास'}
                </h3>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 text-xs">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-slate-400">{language === 'en' ? 'No notifications.' : 'कोणतीही सूचना नाही.'}</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsNotifOpen(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs rounded-xl text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {language === 'en' ? 'Close' : 'बंद करा'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

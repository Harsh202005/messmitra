'use client';

import React, { useState } from 'react';
import { Member, BillingCycle, Mess } from '@messmitra/types';
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  Phone,
  Filter,
  DollarSign,
  Utensils,
  Clock,
  ExternalLink,
  Smartphone,
  Copy,
  Bell,
  Check,
  Play,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { generateDirectWhatsAppUrl, BALAJI_WHATSAPP_TEMPLATES } from '../lib/whatsappTemplates';
import {
  broadcastInAppNotification,
  playNotificationChime,
  requestPushPermission,
  showSystemPushNotification,
} from '../lib/notificationService';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  billingCycles: BillingCycle[];
  mess: Mess | null;
}

type MainTab = 'whatsapp' | 'push_notification';
type BroadcastType = 'dues' | 'sunday_special' | 'cutoff' | 'custom';

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  members,
  billingCycles,
  mess,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('whatsapp');
  const [broadcastType, setBroadcastType] = useState<BroadcastType>('dues');
  const [filterMode, setFilterMode] = useState<'all' | 'unpaid' | 'veg' | 'nonveg'>('unpaid');
  const [customText, setCustomText] = useState('');
  const [cutoffMeal, setCutoffMeal] = useState<'lunch' | 'dinner'>('dinner');

  // Multi-Send Dispatcher Queue State
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [sentMemberIds, setSentMemberIds] = useState<Set<string>>(new Set());
  const [copiedGroupMessage, setCopiedGroupMessage] = useState(false);

  // Push Notification Form State
  const [pushTitle, setPushTitle] = useState('श्री बालाजी मेस - महत्त्वाची सूचना 🍛');
  const [pushBody, setPushBody] = useState(
    'या रविवारी स्पेशल मेनू: गुलाबजाम, पुरी, मटार पनीर व चिकन बिर्याणी! वेळ: दुपारी १२:३० ते ०३:३०.'
  );
  const [pushSuccessBanner, setPushSuccessBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter members based on selection
  const filteredMembers = members.filter((m) => {
    if (filterMode === 'veg') return m.dietPreference === 'veg';
    if (filterMode === 'nonveg') return m.dietPreference === 'nonveg';
    if (filterMode === 'unpaid') {
      const cycle = billingCycles.find((c) => c.memberId === m.id);
      return cycle ? cycle.amountDue - cycle.amountPaid > 0 : true;
    }
    return true;
  });

  const getMessageForMember = (m: Member): string => {
    const cycle = billingCycles.find((c) => c.memberId === m.id);
    const outstanding = cycle ? Math.max(0, cycle.amountDue - cycle.amountPaid) : (m.rate || 3200);

    if (broadcastType === 'dues') {
      return BALAJI_WHATSAPP_TEMPLATES.monthlyDues({
        memberName: m.name,
        month: cycle?.month || '2026-09',
        amountDue: outstanding,
        upiId: mess?.upiId || '9822338975@upi',
        ownerPhone: '9822338975',
      });
    }

    if (broadcastType === 'sunday_special') {
      return BALAJI_WHATSAPP_TEMPLATES.sundaySpecialAnnouncement({
        date: 'या रविवारी (This Sunday)',
        specialMenuVeg: 'गुलाबजाम, पुरी, मटार पनीर, जिरा राईस, डाळ तडका',
        specialMenuNonVeg: 'सुक्का चिकन / तांबडा पांढरा रस्सा, चिकन बिर्याणी',
        timeSlot: 'दुपारी १२:३० ते ०३:३०',
      });
    }

    if (broadcastType === 'cutoff') {
      return BALAJI_WHATSAPP_TEMPLATES.dailyCutoffReminder({
        mealType: cutoffMeal,
        cutoffTime: cutoffMeal === 'lunch' ? 'सकाळी 09:00 AM' : 'संध्याकाळी 06:00 PM',
      });
    }

    return customText || `नमस्कार ${m.name}, श्री बालाजी मेस कडून महत्त्वाची सूचना.`;
  };

  const getGenericBroadcastMessage = (): string => {
    if (broadcastType === 'dues') {
      return `📢 *श्री बालाजी मेस - मासिक फी स्मरणपत्र*\n\nसर्व सभासदांना विनंती आहे की चालू महिन्याची मेस फी कृपया लवकरात लवकर जमा करावी.\n\n💳 *UPI ID:* \`${mess?.upiId || '9822338975@upi'}\`\n📞 *संपर्क:* 9822338975\n\n_धन्यवाद! - श्री बालाजी मेस (२१ वर्षांची अखंड परंपरा)_`;
    }
    if (broadcastType === 'sunday_special') {
      return BALAJI_WHATSAPP_TEMPLATES.sundaySpecialAnnouncement({
        date: 'या रविवारी (This Sunday)',
        specialMenuVeg: 'गुलाबजाम, पुरी, मटार पनीर, जिरा राईस, डाळ तडका',
        specialMenuNonVeg: 'सुक्का चिकन / तांबडा पांढरा रस्सा, चिकन बिर्याणी',
        timeSlot: 'दुपारी १२:३० ते ०३:३०',
      });
    }
    if (broadcastType === 'cutoff') {
      return BALAJI_WHATSAPP_TEMPLATES.dailyCutoffReminder({
        mealType: cutoffMeal,
        cutoffTime: cutoffMeal === 'lunch' ? 'सकाळी 09:00 AM' : 'संध्याकाळी 06:00 PM',
      });
    }
    return customText || 'श्री बालाजी मेस कडून महत्त्वाची सूचना.';
  };

  // 1-Click Send All Queue Stepper Handler
  const handleSendCurrentInQueue = () => {
    if (filteredMembers.length === 0) return;
    const m = filteredMembers[currentQueueIndex];
    if (!m) return;

    const msg = getMessageForMember(m);
    const waUrl = generateDirectWhatsAppUrl(m.phone || '9822338975', msg);

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Mark as sent
    setSentMemberIds((prev) => new Set(prev).add(m.id));
    playNotificationChime();

    // Advance queue
    if (currentQueueIndex < filteredMembers.length - 1) {
      setCurrentQueueIndex((prev) => prev + 1);
    } else {
      setIsQueueRunning(false);
    }
  };

  // Copy Universal Group Broadcast Message
  const handleCopyGroupMessage = () => {
    const text = getGenericBroadcastMessage();
    navigator.clipboard.writeText(text);
    setCopiedGroupMessage(true);
    playNotificationChime();
    setTimeout(() => setCopiedGroupMessage(false), 3000);
  };

  // Send In-App & Mobile Push Notification to All (100% Free-Tier)
  const handleBroadcastPushNotification = () => {
    if (!pushTitle.trim() || !pushBody.trim()) return;

    const notif = broadcastInAppNotification({
      title: pushTitle,
      body: pushBody,
      type: broadcastType === 'custom' ? 'general' : broadcastType,
      targetAudience: filterMode,
      sender: 'श्री बालाजी मेस (व्यवस्थापक)',
    });

    setPushSuccessBanner(
      `✅ सर्व सभासदांच्या मोबाईलवर इन-ॲप व वेब पुश सूचना यशस्वीरीत्या पाठवली!`
    );
    setTimeout(() => setPushSuccessBanner(null), 5000);
  };

  // Send Test Push to Owner's Device
  const handleTestPushNotification = async () => {
    await requestPushPermission();
    playNotificationChime();
    showSystemPushNotification(
      pushTitle || 'श्री बालाजी मेस - टेस्ट सूचना 🔔',
      pushBody || 'ही एक टेस्ट मोबाईल पुश नोटिफिकेशन आहे.'
    );
    broadcastInAppNotification({
      title: pushTitle || 'श्री बालाजी मेस - टेस्ट सूचना 🔔',
      body: pushBody || 'ही एक टेस्ट मोबाईल पुश नोटिफिकेशन आहे.',
      type: 'general',
      targetAudience: 'all',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-3xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
          <div className="w-12 h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>१००% मोफत ब्रॉडकास्ट व मोबाईल सूचना केंद्र</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                Broadcast & Mobile Notifications Center
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveMainTab('whatsapp')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeMainTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 WhatsApp ब्रॉडकास्ट (Send to All)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('push_notification')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeMainTab === 'push_notification'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>🔔 मोफत इन-ॲप व मोबाईल पुश (Free-Tier)</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB 1: WHATSAPP BROADCAST & 1-CLICK SEND-ALL */}
          {activeMainTab === 'whatsapp' && (
            <div className="space-y-4 p-4">
              {/* Broadcast Type Selector */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  मेसेजचा विषय निवडा (Template):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <button
                    onClick={() => {
                      setBroadcastType('dues');
                      setFilterMode('unpaid');
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer ${
                      broadcastType === 'dues'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>💰 फी स्मरणपत्र (Pending Dues)</span>
                  </button>

                  <button
                    onClick={() => {
                      setBroadcastType('sunday_special');
                      setFilterMode('all');
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer ${
                      broadcastType === 'sunday_special'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>🍛 रविवार स्पेशल बेत (Special Feast)</span>
                  </button>

                  <button
                    onClick={() => {
                      setBroadcastType('cutoff');
                      setFilterMode('all');
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer ${
                      broadcastType === 'cutoff'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>⏰ सुट्टी कटऑफ सूचना (Cutoff Notice)</span>
                  </button>
                </div>
              </div>

              {/* Recipient Audience Filter */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>कोणाला पाठवायचे:</span>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => {
                      setFilterMode('unpaid');
                      setCurrentQueueIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      filterMode === 'unpaid'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    बाकी फी असलेले
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('all');
                      setCurrentQueueIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    सर्व ({members.length})
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('veg');
                      setCurrentQueueIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      filterMode === 'veg'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🟢 व्हेज
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('nonveg');
                      setCurrentQueueIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      filterMode === 'nonveg'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🔴 नॉनव्हेज
                  </button>
                </div>
              </div>

              {/* USP: SEND TO ALL 1-CLICK DISPATCHER HERO BANNER */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                        १-क्लिक व्हॉट्सअ‍ॅप सेंड-टू-ऑल
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        {sentMemberIds.size} / {filteredMembers.length} पाठवले
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-base text-white mt-1">
                      📢 सर्व {filteredMembers.length} सभासदांना एका मागोमाग १-क्लिकने पाठवा
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      ब्राउझर ब्लॉक न होता प्रत्येक सभासदास त्यांच्या अचूक बाकीसह थेट मेसेज जातो.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyGroupMessage}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer shrink-0 min-h-[44px]"
                      title="ग्रुप किंवा ब्रॉडकास्ट लिस्टसाठी मेसेज कॉपी करा"
                    >
                      {copiedGroupMessage ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>कॉपी झाले!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>ग्रुप मेसेज कॉपी</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsQueueRunning(true);
                        handleSendCurrentInQueue();
                      }}
                      disabled={filteredMembers.length === 0}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 shrink-0 min-h-[44px]"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>
                        {isQueueRunning
                          ? `पुढील पाठवा (${currentQueueIndex + 1}/${filteredMembers.length})`
                          : `🚀 सर्वांना पाठवणे सुरू करा`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {filteredMembers.length > 0 && (
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((sentMemberIds.size / filteredMembers.length) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Members List with individual launch buttons */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between pb-1">
                  <span>निवडलेले सभासद ({filteredMembers.length})</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    हिरव्या बटनावर टॅप करून WhatsApp उघडा
                  </span>
                </div>

                {filteredMembers.map((m, idx) => {
                  const msg = getMessageForMember(m);
                  const waUrl = generateDirectWhatsAppUrl(m.phone || '9822338975', msg);
                  const cycle = billingCycles.find((c) => c.memberId === m.id);
                  const outstanding = cycle ? Math.max(0, cycle.amountDue - cycle.amountPaid) : m.rate;
                  const isSent = sentMemberIds.has(m.id);
                  const isCurrent = isQueueRunning && currentQueueIndex === idx;

                  return (
                    <div
                      key={m.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500'
                          : isSent
                          ? 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-75'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isSent ? '✓' : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-slate-900 dark:text-white truncate">
                              {m.name}
                            </strong>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                                m.dietPreference === 'veg'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {m.dietPreference === 'veg' ? 'व्हेज' : 'नॉनव्हेज'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono">{m.phone}</span>
                            {broadcastType === 'dues' && (
                              <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                                बाकी: ₹{outstanding}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          setSentMemberIds((prev) => new Set(prev).add(m.id));
                          playNotificationChime();
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs shadow-sm transition shrink-0 min-h-[44px] cursor-pointer ${
                          isSent
                            ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSent ? 'पुन्हा पाठवा' : 'WhatsApp'}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FREE-TIER MOBILE PUSH & IN-APP NOTIFICATIONS */}
          {activeMainTab === 'push_notification' && (
            <div className="space-y-4 p-4">
              {/* Success Banner */}
              {pushSuccessBanner && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 animate-bounceIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{pushSuccessBanner}</span>
                </div>
              )}

              {/* Free Tier Highlight Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>१००% मोफत वेब व मोबाईल पुश अलर्ट सिस्टीम</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-300">
                      FREE TIER
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    कोणतेही शुल्क किंवा API फी न लागता सर्व सभासदांच्या मोबाईलवर, मेस ॲपवर आणि ब्राउझरवर लगेच पुश नोटिफिकेशन व आवाज बेल जाते!
                  </p>
                </div>
              </div>

              {/* Audience Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  कोणाच्या मोबाईलवर सूचना पाठवायची (Target Audience):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer min-h-[44px] ${
                      filterMode === 'all'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    सर्व सभासद ({members.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode('unpaid')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer min-h-[44px] ${
                      filterMode === 'unpaid'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    बाकी फी असलेले
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode('veg')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer min-h-[44px] ${
                      filterMode === 'veg'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    🟢 फक्त व्हेज
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode('nonveg')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer min-h-[44px] ${
                      filterMode === 'nonveg'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    🔴 फक्त नॉनव्हेज
                  </button>
                </div>
              </div>

              {/* Quick Presets for Push Notification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  तयार टेम्पलेट (Quick Templates):
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPushTitle('श्री बालाजी मेस - रविवार स्पेशल बेत 🍛');
                      setPushBody(
                        'या रविवारी स्पेशल मेनू: गुलाबजाम, पुरी, मटार पनीर व चिकन बिर्याणी! वेळ: दुपारी १२:३० ते ०३:३०.'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    🍛 रविवार स्पेशल मेनू
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPushTitle('श्री बालाजी मेस - मासिक फी स्मरणपत्र 💳');
                      setPushBody(
                        'चालू महिन्याची मेस फी कृपया लवकरात लवकर जमा करावी. UPI ID: 9822338975@upi'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    💰 फी स्मरणपत्र
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPushTitle('श्री बालाजी मेस - सुट्टी कटऑफ सूचना ⏰');
                      setPushBody(
                        'दुपारच्या जेवणाची सुट्टी नोंद सकाळी ९:०० च्या आधी व रात्रीच्या जेवणाची संध्याकाळी ६:०० च्या आधी नोंदवा.'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    ⏰ सुट्टी कटऑफ
                  </button>
                </div>
              </div>

              {/* Push Title & Body Form */}
              <div className="space-y-3 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सूचना शीर्षक (Notification Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="उदा. श्री बालाजी मेस - रविवार स्पेशल बेत 🍛"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सूचनेचा तपशील (Notification Body Message) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="सभासदांच्या मोबाईलवर दिसावयाचा मेसेज..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Mobile Notification Live Preview Mockup */}
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  मोबाईल स्क्रीनवर असे दिसेल (Mobile Push Preview):
                </span>
                <div className="bg-slate-950 text-white p-4 rounded-2xl border border-amber-500/40 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <div className="w-3.5 h-3.5 rounded-full overflow-hidden border border-amber-400 flex-shrink-0">
                        <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <span>श्री बालाजी मेस</span>
                    </div>
                    <span>आत्ताच (Just now)</span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white">{pushTitle}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">{pushBody}</div>
                </div>
              </div>

              {/* Push Broadcast Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestPushNotification}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📲 स्वतःच्या फोनवर टेस्ट करा</span>
                </button>

                <button
                  type="button"
                  onClick={handleBroadcastPushNotification}
                  className="w-full flex-1 px-5 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Bell className="w-4 h-4 fill-white" />
                  <span>🚀 सर्व सभासदांना मोबाईल सूचना पाठवा (Broadcast Now)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition cursor-pointer min-h-[44px]"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

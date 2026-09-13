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
} from 'lucide-react';
import { generateDirectWhatsAppUrl, BALAJI_WHATSAPP_TEMPLATES } from '../lib/whatsappTemplates';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  billingCycles: BillingCycle[];
  mess: Mess | null;
}

type BroadcastType = 'dues' | 'sunday_special' | 'cutoff' | 'custom';

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  members,
  billingCycles,
  mess,
}) => {
  const [broadcastType, setBroadcastType] = useState<BroadcastType>('dues');
  const [filterMode, setFilterMode] = useState<'all' | 'unpaid' | 'veg' | 'nonveg'>('unpaid');
  const [customText, setCustomText] = useState('');
  const [cutoffMeal, setCutoffMeal] = useState<'lunch' | 'dinner'>('dinner');

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-3xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="w-12 h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>१-क्लिक व्हॉट्सअ‍ॅप ब्रॉडकास्ट</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                WhatsApp मेसेज व बिल स्मरणपत्र (Broadcast Center)
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

        {/* Broadcast Type Selector Chips */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => {
                setBroadcastType('dues');
                setFilterMode('unpaid');
              }}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer ${
                broadcastType === 'dues'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
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
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
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
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>⏰ सुट्टी कटऑफ सूचना (Cutoff Notice)</span>
            </button>
          </div>

          {/* Sub-Filters: Recipient Segment */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>कोणाला पाठवायचे:</span>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setFilterMode('unpaid')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === 'unpaid' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                बाकी फी असलेले
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                सर्व ({members.length})
              </button>
              <button
                onClick={() => setFilterMode('veg')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === 'veg' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🟢 व्हेज
              </button>
              <button
                onClick={() => setFilterMode('nonveg')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === 'nonveg' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🔴 नॉनव्हेज
              </button>
            </div>
          </div>
        </div>

        {/* Recipient Queue List with 1-Click WhatsApp Launch */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between pb-1">
            <span>निवडलेले सभासद ({filteredMembers.length})</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
              हिरव्या बटनावर टॅप करून WhatsApp उघडा
            </span>
          </div>

          <div className="space-y-2">
            {filteredMembers.map((m) => {
              const msg = getMessageForMember(m);
              const waUrl = generateDirectWhatsAppUrl(m.phone || '9822338975', msg);
              const cycle = billingCycles.find((c) => c.memberId === m.id);
              const outstanding = cycle ? Math.max(0, cycle.amountDue - cycle.amountPaid) : m.rate;

              return (
                <div
                  key={m.id}
                  className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900 dark:text-white truncate">{m.name}</strong>
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

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-mono">{m.phone}</span>
                      {broadcastType === 'dues' && (
                        <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                          बाकी: ₹{outstanding}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition shrink-0 min-h-[44px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>
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

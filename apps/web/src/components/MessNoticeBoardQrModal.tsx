'use client';

import React from 'react';
import { Mess } from '@messmitra/types';
import { UpiQrCode } from './UpiQrCode';
import {
  Printer,
  X,
  Sparkles,
  Utensils,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  QrCode,
} from 'lucide-react';

interface MessNoticeBoardQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  mess: Mess | null;
}

export const MessNoticeBoardQrModal: React.FC<MessNoticeBoardQrModalProps> = ({
  isOpen,
  onClose,
  mess,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const registrationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?register=true`
      : 'https://balajimess.app/?register=true';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-100 dark:bg-slate-900">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header Controls (Hidden on Print) */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base">
              मेस नोटीस बोर्ड व टेबल स्टँडी पोस्टर (Printable Standee)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>पोस्टर प्रिंट करा (Print A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Notice Board Poster Content */}
        <div
          id="printable-notice-board"
          className="p-6 sm:p-10 space-y-6 overflow-y-auto bg-amber-50/40 text-slate-900 border-8 border-orange-600 m-2 sm:m-4 rounded-3xl"
        >
          {/* Header Banner */}
          <div className="text-center space-y-2 pb-5 border-b-2 border-orange-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>२१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-orange-700 tracking-tight">
              {mess?.name || 'श्री बालाजी मेस'}
            </h1>

            <p className="text-sm font-bold text-slate-700">
              {mess?.area || 'कर्वे नगर / कोथरूड'}, {mess?.city || 'पुणे'} • मालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong>
            </p>
          </div>

          {/* Dual Cutoff Time Notice Callout */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 rounded-2xl text-center space-y-1 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 text-amber-200">
              <Clock className="w-4 h-4" />
              <span>सुट्टी नोंदणीची अंतिम वेळ (Cutoff Rules)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono font-black text-sm sm:text-base">
              <div className="bg-white/15 p-2 rounded-xl">
                <span>दुपारचे जेवण: </span>
                <strong className="text-yellow-300">09:00 AM</strong>
              </div>
              <div className="bg-white/15 p-2 rounded-xl">
                <span>रात्रीचे जेवण: </span>
                <strong className="text-yellow-300">06:00 PM</strong>
              </div>
            </div>
            <p className="text-[11px] text-white/90 pt-1">
              * कटऑफ वेळेच्या आधी सुट्टी नोंदवल्यास बिलात पूर्ण वजावट दिली जाईल.
            </p>
          </div>

          {/* QR Code & Self-Registration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-white p-6 rounded-2xl border-2 border-orange-200 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white border-2 border-orange-500 rounded-2xl shadow-md">
                <UpiQrCode
                  upiId={mess?.upiId || '9822338975@upi'}
                  name={mess?.name || 'श्री बालाजी मेस'}
                  amount={3000}
                  size={170}
                />
              </div>
              <span className="text-[11px] font-bold text-orange-700 mt-2">
                📲 स्कॅन करून नाव नोंदवा किंवा फी भरा
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span>मासिक मेस योजना व दर (Monthly Rates):</span>
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div>
                    <strong className="text-emerald-800 text-sm block">🟢 शुद्ध शाकाहारी (Pure Veg)</strong>
                    <span className="text-[10px] text-emerald-600">अमर्यादित चपाती, भाजी, डाळ, भात</span>
                  </div>
                  <span className="text-base font-black font-mono text-emerald-700">₹३,०००/महिना</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-300">
                  <div>
                    <strong className="text-rose-800 text-sm block">🔴 मांसाहारी (Non-Veg Special)</strong>
                    <span className="text-[10px] text-rose-600">आठवड्यातून २ दिवस चिकन/अंडे स्पेशल</span>
                  </div>
                  <span className="text-base font-black font-mono text-rose-700">₹३,२००/महिना</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-600 space-y-1">
                <p className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>घरगुती चव व स्वच्छ वातावरण</span>
                </p>
                <p className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ऑनलाइन सुट्टी व्यवस्थापन व स्वयंचलित बिल</span>
                </p>
              </div>
            </div>
          </div>

          {/* Poster Footer Contact */}
          <div className="border-t-2 border-orange-300 pt-4 text-center space-y-1">
            <p className="font-black text-slate-800 text-sm">
              अधिक माहिती किंवा नाव नोंदणीसाठी संपर्क: <strong>शंकर गिरी — ९८२२३३८९७५</strong>
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              UPI ID: <strong>{mess?.upiId || '9822338975@upi'}</strong> • गुगल पे / फोनपे द्वारे थेट देयक
            </p>
          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="print:hidden p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
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

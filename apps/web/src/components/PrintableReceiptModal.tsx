'use client';

import React from 'react';
import { BillingCycle, Mess, Member } from '@messmitra/types';
import {
  X,
  Printer,
  MessageCircle,
  Receipt,
  Utensils,
  CheckCircle2,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { generateDirectWhatsAppUrl, BALAJI_WHATSAPP_TEMPLATES } from '../lib/whatsappTemplates';

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: BillingCycle | null;
  mess: Mess | null;
  member: Member | null;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  isOpen,
  onClose,
  cycle,
  mess,
  member,
}) => {
  if (!isOpen || !cycle) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = `SBM-${cycle.month.replace('-', '')}-${cycle.id.substring(cycle.id.length - 4)}`;
  const outstanding = Math.max(0, cycle.amountDue - cycle.amountPaid);
  const waMsg = BALAJI_WHATSAPP_TEMPLATES.paymentReceipt({
    memberName: cycle.memberName || member?.name || 'सभासद',
    receiptNo: receiptNo,
    amountPaid: cycle.amountPaid,
    month: cycle.month,
    balanceDue: outstanding,
    paymentMode: 'upi_link',
  });
  const waLink = generateDirectWhatsAppUrl(cycle.memberPhone || member?.phone || '9822338975', waMsg);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-100 dark:bg-slate-900">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header Controls (Hidden on Print) */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base">अधिकृत पावती (Official Payment Receipt)</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-5 overflow-y-auto bg-white text-slate-900">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-500 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black text-slate-900">{mess?.name || 'श्री बालाजी मेस'}</h2>
              </div>
              <p className="text-xs text-orange-700 font-bold">✨ २१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {mess?.area || 'कर्वे नगर / कोथरूड'}, {mess?.city || 'पुणे'} • चालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong>
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[11px]">
                #{receiptNo}
              </span>
              <p className="text-slate-500 font-mono mt-1">दिनांक: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Member & Month info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">सभासदाचे नाव (Member Name)</span>
              <strong className="text-sm text-slate-900">{cycle.memberName || member?.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">महिना (Billing Month)</span>
              <strong className="text-sm font-mono text-slate-900">{cycle.month}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">फोन नंबर (Phone)</span>
              <span className="font-mono text-slate-800">{cycle.memberPhone || member?.phone || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">देयक स्थिती (Status)</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{cycle.status === 'paid' ? 'Paid in Full ✅' : 'Partially Paid'}</span>
              </span>
            </div>
          </div>

          {/* Amounts Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 p-3 font-bold text-slate-700 flex justify-between border-b border-slate-200">
              <span>तपशील (Description)</span>
              <span>रक्कम (Amount)</span>
            </div>
            <div className="divide-y divide-slate-100 p-3 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>मासिक एकूण देय फी (Total Bill):</span>
                <span className="font-mono font-bold">₹{cycle.amountDue}</span>
              </div>
              {cycle.approvedLeaveDays > 0 && (
                <div className="flex justify-between text-emerald-700 pt-1">
                  <span>सुट्टी वजावट ({cycle.approvedLeaveDays} दिवस):</span>
                  <span className="font-mono font-bold">
                    -₹{Math.round(cycle.approvedLeaveDays * 2 * (cycle.perMealRate || 57.14))}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-emerald-800 font-bold pt-2 border-t-2 border-slate-300 text-sm">
                <span>भरलेली रक्कम (Amount Paid):</span>
                <span className="font-mono text-base">₹{cycle.amountPaid}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 text-xs">
                <span>शिल्लक बाकी (Balance Due):</span>
                <span className="font-mono font-bold text-amber-700">₹{outstanding}</span>
              </div>
            </div>
          </div>

          {/* Stamp / Verification Note */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>संगणकीकृत अधिकृत पावती (No Signature Required)</span>
            </div>
            <span className="font-bold text-slate-800">श्री बालाजी मेस</span>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="print:hidden p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp वर पावती पाठवा</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer min-h-[44px]"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

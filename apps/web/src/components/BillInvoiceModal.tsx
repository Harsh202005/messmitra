'use client';

import React from 'react';
import { useI18n } from '../lib/i18n';
import { BillingCycle, Mess, Member, generateWhatsAppReminderLink } from '@messmitra/types';
import { UpiQrCode } from './UpiQrCode';
import {
  X,
  Printer,
  MessageCircle,
  Receipt,
  Utensils,
  CheckCircle2,
  Calendar,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface BillInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: BillingCycle | null;
  mess: Mess | null;
  member: Member | null;
}

export const BillInvoiceModal: React.FC<BillInvoiceModalProps> = ({
  isOpen,
  onClose,
  cycle,
  mess,
  member,
}) => {
  const { t } = useI18n();

  if (!isOpen || !cycle) return null;

  const handlePrint = () => {
    window.print();
  };

  const outstanding = Math.max(0, cycle.amountDue - cycle.amountPaid);
  const waLink = generateWhatsAppReminderLink(
    cycle.memberPhone || '9890123456',
    cycle.memberName || 'Member',
    mess?.name || 'Balaji Mess',
    outstanding,
    mess?.upiId || 'balajimess@okhdfcbank',
    cycle.month,
    cycle.approvedLeaveDays
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Controls Header (Hidden on Print) */}
        <div className="print:hidden bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-base">
              अधिकृत मेस पावती (Official Bill Invoice Slip)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट / PDF डाउनलोड</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Slip Content */}
        <div id="printable-invoice" className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-white text-slate-900">
          {/* Slip Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {mess?.name || 'Balaji Executive Dining & Mess'}
                </h1>
              </div>
              <p className="text-xs text-slate-600">
                {mess?.area}, {mess?.city} • दैनिक कटऑफ: {mess?.dailyCutoffTime || '09:00'} AM
              </p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                UPI ID: <strong>{mess?.upiId || 'balajimess@okhdfcbank'}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-bold uppercase tracking-wider text-[11px]">
                पावती क्र. #INV-{cycle.month.replace('-', '')}-{cycle.id.substring(cycle.id.length - 4)}
              </span>
              <p className="text-slate-500 font-mono">महिना: <strong>{cycle.month}</strong></p>
              <p className="text-slate-500 font-mono">दिनांक: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Member Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">सभासदाचे नाव (Member Name)</span>
              <strong className="text-sm text-slate-900">{cycle.memberName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">संपर्क फोन (Phone)</span>
              <span className="font-mono text-slate-900">{cycle.memberPhone || '-'}</span>
            </div>
          </div>

          {/* Itemized Billing Breakdown Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">तपशील (Description)</th>
                  <th className="p-3 text-center">संख्या (Units)</th>
                  <th className="p-3 text-right">दर (Rate)</th>
                  <th className="p-3 text-right">रक्कम (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {/* Line 1: Base Monthly Meals */}
                <tr>
                  <td className="p-3 font-sans font-medium">
                    मासिक नियमित जेवण (Monthly Subscription Base)
                  </td>
                  <td className="p-3 text-center">{cycle.baseMeals} जेवण</td>
                  <td className="p-3 text-right">₹{cycle.rate}</td>
                  <td className="p-3 text-right font-bold">₹{cycle.rate}</td>
                </tr>

                {/* Line 2: Approved Leaves Deduction */}
                {cycle.approvedLeaveDays > 0 ? (
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td className="p-3 font-sans font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      मंजूर सुट्टी वजावट (Approved Leaves Deduction)
                    </td>
                    <td className="p-3 text-center">{cycle.approvedLeaveDays} दिवस ({cycle.approvedLeaveDays * 2} जेवण)</td>
                    <td className="p-3 text-right">-₹{Math.round(cycle.perMealRate || 57.14)}/meal</td>
                    <td className="p-3 text-right font-bold">
                      -₹{Math.round((cycle.approvedLeaveDays || 0) * 2 * (cycle.perMealRate || 57.14))}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="p-3 font-sans text-slate-500">सुट्टी वजावट (No Leaves Taken)</td>
                    <td className="p-3 text-center text-slate-500">0 दिवस</td>
                    <td className="p-3 text-right text-slate-500">-</td>
                    <td className="p-3 text-right text-slate-500">₹0.00</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Totals & Dynamic QR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-center">
            {/* Dynamic UPI QR Code for instant scanning */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <UpiQrCode
                upiId={mess?.upiId || 'balajimess@okhdfcbank'}
                name={mess?.name || 'Mess'}
                amount={outstanding > 0 ? outstanding : cycle.amountDue}
                size={140}
              />
            </div>

            {/* Calculations Summary */}
            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>एकूण आकारलेली रक्कम (Total Due):</span>
                <span className="font-mono font-bold text-slate-900">₹{cycle.amountDue}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>भरलेली रक्कम (Amount Paid):</span>
                <span className="font-mono font-bold">₹{cycle.amountPaid}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t-2 border-slate-300 text-slate-900">
                <span>बाकी देय रक्कम (Balance Due):</span>
                <span className={`font-mono ${outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₹{outstanding}
                </span>
              </div>
              <div className="pt-2 text-center text-[10px] text-slate-500">
                स्थिती:{' '}
                <strong className="uppercase">
                  {cycle.status === 'paid' ? 'Paid in Full ✅' : cycle.status === 'partially_paid' ? 'Partially Paid' : 'Pending'}
                </strong>
              </div>
            </div>
          </div>

          {/* Slip Footer Note */}
          <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 space-y-1">
            <p>🙏 MessMitra स्वयंचलित हिशोब प्रणालीद्वारे तयार केलेली अधिकृत पावती.</p>
            <p>कोणत्याही प्रश्नासाठी कृपया मेस व्यवस्थापकाशी संपर्क साधा.</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="print:hidden p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp वर पावती पाठवा</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

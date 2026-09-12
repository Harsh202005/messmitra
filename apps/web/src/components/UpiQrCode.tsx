'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Sparkles } from 'lucide-react';

interface UpiQrCodeProps {
  upiId: string;
  name: string;
  amount: number;
  note?: string;
  size?: number;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  name,
  amount,
  note = 'Mess Subscription Bill',
  size = 180,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Standard UPI URI format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  useEffect(() => {
    if (!upiId) return;

    QRCode.toDataURL(upiUri, {
      width: size,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Code generation failed:', err));
  }, [upiId, name, amount, note, size, upiUri]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!upiId) {
    return (
      <div className="p-4 rounded-xl bg-slate-800 text-center text-xs text-slate-400">
        UPI ID not configured in Mess Settings.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
        <QrCode className="w-4 h-4 text-brand-500" />
        <span>स्कॅन करून थेट पैसे भरा (Scan & Pay)</span>
      </div>

      {/* QR Code Canvas */}
      <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-200 mb-3">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="UPI QR Code"
            width={size}
            height={size}
            className="rounded-lg"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 text-slate-400 text-xs"
          >
            QR तयार होत आहे...
          </div>
        )}
      </div>

      {/* Amount Display */}
      <div className="text-lg font-black text-slate-900 dark:text-white mb-2 font-mono">
        ₹{amount.toLocaleString('en-IN')}
      </div>

      {/* UPI ID Pill & Copy Button */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
        <span>{upiId}</span>
        <button
          onClick={copyUpiId}
          className="p-1 hover:text-brand-500 transition"
          title="Copy UPI ID"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <span className="text-[10px] text-slate-400 mt-2">
        GPay • PhonePe • Paytm • BHIM • Cred
      </span>
    </div>
  );
};

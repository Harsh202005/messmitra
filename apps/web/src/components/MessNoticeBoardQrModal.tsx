'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Mess } from '@messmitra/types';
import {
  Printer,
  Download,
  X,
  Sparkles,
  Utensils,
  CheckCircle2,
  QrCode,
  Share2,
  Check,
  Globe,
  Edit3,
  ExternalLink,
  RotateCcw,
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
  const [qrType, setQrType] = useState<'register' | 'payment'>('register');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Determine initial live public URL
  const getInitialPublicUrl = () => {
    if (typeof window === 'undefined') return 'https://shreebalajimess.app/?register=true';

    // 1. Check saved custom URL in localStorage
    const saved = localStorage.getItem('messmitra_custom_app_url');
    if (saved) return saved;

    // 2. If on a live production hostname (not localhost)
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return `${window.location.origin}/?register=true`;
    }

    // 3. If on localhost, use production live domain fallback so printed posters have a real working link
    return process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/?register=true`
      : 'https://shreebalajimess.app/?register=true';
  };

  const [liveAppUrl, setLiveAppUrl] = useState<string>('https://shreebalajimess.app/?register=true');

  useEffect(() => {
    if (isOpen) {
      setLiveAppUrl(getInitialPublicUrl());
    }
  }, [isOpen]);

  const handleSaveCustomUrl = (url: string) => {
    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    if (cleanUrl && !cleanUrl.includes('register=true')) {
      cleanUrl = cleanUrl.includes('?') ? `${cleanUrl}&register=true` : `${cleanUrl}/?register=true`;
    }
    setLiveAppUrl(cleanUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_custom_app_url', cleanUrl);
    }
  };

  const upiUri = `upi://pay?pa=${encodeURIComponent(
    mess?.upiId || '9822338975@upi'
  )}&pn=${encodeURIComponent(mess?.name || 'श्री बालाजी मेस')}&cu=INR&tn=${encodeURIComponent(
    'श्री बालाजी मेस मासिक फी'
  )}`;

  const activeQrContent = qrType === 'register' ? liveAppUrl : upiUri;

  useEffect(() => {
    if (!isOpen || !activeQrContent) return;

    QRCode.toDataURL(activeQrContent, {
      width: 450,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [isOpen, activeQrContent, qrType]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPoster = async () => {
    setIsGeneratingDownload(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      templateImg.src = '/poster_template.jpg';

      await new Promise((resolve, reject) => {
        templateImg.onload = resolve;
        templateImg.onerror = reject;
      });

      canvas.width = templateImg.naturalWidth || 720;
      canvas.height = templateImg.naturalHeight || 1080;

      // 1. Draw base poster template
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      // 2. Draw dynamic QR Code in the designated white square
      const qrX = canvas.width * 0.622;
      const qrY = canvas.height * 0.338;
      const qrSize = canvas.width * 0.315;

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      // Clear the placeholder area with crisp white fill
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
      ctx.fill();

      // Draw QR Code
      ctx.drawImage(qrImg, qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);

      // Download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `shree_balaji_mess_poster_${qrType}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Poster generation failed:', err);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-100 dark:bg-slate-900">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header Controls (Hidden on Print) */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-brand-500/40 shadow-sm shrink-0 bg-white">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                अधिकृत मेस पोस्टर व नोंदणी QR
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                टेबल स्टँडी किंवा नोटीस बोर्डावर लावण्यासाठी
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[38px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट (Print)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={isGeneratingDownload || !qrDataUrl}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingDownload ? 'डाऊनलोड होत आहे...' : 'पोस्टर डाऊनलोड'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (Hidden on Print) */}
        <div className="print:hidden px-5 py-2.5 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQrType('register')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer min-h-[32px] ${
                  qrType === 'register'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                👥 नवीन सभासद नोंदणी QR
              </button>

              <button
                type="button"
                onClick={() => setQrType('payment')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer min-h-[32px] ${
                  qrType === 'payment'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                💰 UPI पेमेंट QR
              </button>
            </div>

            {qrType === 'register' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(!isEditingUrl)}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingUrl ? 'लिंक लपवा' : 'वेबसाईट लिंक बदला (Live URL)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>लिंक कॉपी झाली!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>कॉपी</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Live Public URL Editor Section */}
          {qrType === 'register' && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>QR स्कॅन केल्यानंतर उघडणारी लिंक (Public Link):</span>
                </span>
                <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 truncate max-w-[200px]">
                  {liveAppUrl}
                </span>
              </div>

              {/* Editable input */}
              {isEditingUrl && (
                <div className="space-y-1.5 pt-1 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={liveAppUrl}
                      onChange={(e) => setLiveAppUrl(e.target.value)}
                      onBlur={(e) => handleSaveCustomUrl(e.target.value)}
                      placeholder="उदा. https://shreebalajimess.app किंवा https://balajimess.vercel.app"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCustomUrl(liveAppUrl)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition shrink-0"
                    >
                      जतन करा (Save)
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 dark:text-slate-400">
                    <span>जलद लिंक्स:</span>
                    <button
                      type="button"
                      onClick={() => handleSaveCustomUrl('https://shreebalajimess.app/?register=true')}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 hover:text-brand-600 cursor-pointer font-mono"
                    >
                      shreebalajimess.app
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveCustomUrl('https://balajimess.vercel.app/?register=true')}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 hover:text-brand-600 cursor-pointer font-mono"
                    >
                      balajimess.vercel.app
                    </button>
                    {isLocalhost && (
                      <button
                        type="button"
                        onClick={() => handleSaveCustomUrl(`${window.location.origin}/?register=true`)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 hover:text-brand-600 cursor-pointer font-mono"
                      >
                        Localhost (PC Test)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Poster Preview with Embedded Dynamic QR Code */}
        <div className="p-3 sm:p-5 overflow-y-auto bg-slate-200 dark:bg-slate-950 flex flex-col items-center">
          {/* Authentic High-Resolution Poster Card */}
          <div
            id="printable-notice-board"
            className="relative w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-300 select-none"
            style={{ aspectRatio: '720/1080' }}
          >
            {/* Base Poster Graphic */}
            <img
              src="/poster_template.jpg"
              alt="श्री बालाजी मेस अधिकृत पोस्टर"
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Live QR Code Overlay positioned perfectly inside the white dashed frame */}
            <div
              className="absolute bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md border border-emerald-300/40"
              style={{
                top: '33.8%',
                left: '62.2%',
                width: '31.5%',
                height: '21.0%',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Live QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-[10px] text-slate-400 text-center animate-pulse">
                  QR तयार होत आहे...
                </div>
              )}
            </div>
          </div>

          {/* Quick Guidance Notice */}
          <div className="mt-3 text-center text-xs text-slate-600 dark:text-slate-400 max-w-md space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              💡 हे पोस्टर थेट A4 किंवा टेबल स्टँडीवर प्रिंट करून मेसमध्ये लावा.
            </p>
            <p className="text-[11px]">
              {qrType === 'register' ? (
                <>
                  विद्यार्थी त्यांच्या मोबाईल कॅमेऱ्याने QR स्कॅन करून थेट <strong className="text-brand-600 dark:text-brand-400 font-mono">{liveAppUrl}</strong> वर स्वतःचे नाव नोंदवू शकतात.
                </>
              ) : (
                <>
                  ग्राहक Google Pay / PhonePe / Paytm द्वारे थेट <strong className="text-brand-600 dark:text-brand-400 font-mono">{mess?.upiId || '9822338975@upi'}</strong> वर फी भरू शकतात.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="print:hidden px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            चालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPoster}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer min-h-[40px] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>JPG डाऊनलोड करा</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition cursor-pointer min-h-[40px]"
            >
              बंद करा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

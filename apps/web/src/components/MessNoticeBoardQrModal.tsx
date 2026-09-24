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
  Upload,
  Image as ImageIcon,
  IndianRupee,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { MessMitraApi } from '../lib/api';

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
  const { t, language } = useI18n();
  const [qrType, setQrType] = useState<'register' | 'payment'>('register');
  const [registerPosterStyle, setRegisterPosterStyle] = useState<'clean' | 'template'>('clean');
  const [paymentQrSource, setPaymentQrSource] = useState<'generate' | 'upload'>('generate');

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // UPI Form State
  const [upiId, setUpiId] = useState<string>(mess?.upiId || '9822338975@upi');
  const [payeeName, setPayeeName] = useState<string>(mess?.name || 'श्री बालाजी मेस');
  const [paymentAmount, setPaymentAmount] = useState<string>(''); // Optional fixed amount
  const [uploadedQrImage, setUploadedQrImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Determine initial live public URL
  const getInitialPublicUrl = () => {
    if (typeof window === 'undefined') return 'https://messmitra-web.vercel.app/?register=true';

    const saved = localStorage.getItem('messmitra_custom_app_url');
    if (saved) return saved;

    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return `${window.location.origin}/?register=true`;
    }

    return process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/?register=true`
      : 'https://messmitra-web.vercel.app/?register=true';
  };

  const [liveAppUrl, setLiveAppUrl] = useState<string>('https://messmitra-web.vercel.app/?register=true');

  useEffect(() => {
    if (isOpen) {
      setLiveAppUrl(getInitialPublicUrl());

      if (mess?.upiId) {
        setUpiId(mess.upiId);
      } else {
        const savedUpi = localStorage.getItem('messmitra_custom_upi_id');
        if (savedUpi) setUpiId(savedUpi);
      }

      if (mess?.name) {
        setPayeeName(mess.name);
      }

      const savedQrImg = localStorage.getItem('messmitra_uploaded_upi_qr');
      if (savedQrImg) {
        setUploadedQrImage(savedQrImg);
      }
    }
  }, [isOpen, mess?.upiId, mess?.name]);

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

  const handleSaveUpiId = async (newUpi: string) => {
    setUpiId(newUpi);
    const clean = newUpi.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_custom_upi_id', clean);
    }
    if (clean) {
      try {
        await MessMitraApi.saveMess({ upiId: clean });
      } catch (e) {
        console.warn('Failed to sync UPI with database:', e);
      }
    }
  };

  // Handle Upload QR Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedQrImage(result);
        setPaymentQrSource('upload');
        localStorage.setItem('messmitra_uploaded_upi_qr', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedQr = () => {
    setUploadedQrImage(null);
    setPaymentQrSource('generate');
    localStorage.removeItem('messmitra_uploaded_upi_qr');
  };

  // Generate dynamic QR Code string
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(
    payeeName.trim()
  )}&cu=INR${paymentAmount ? `&am=${paymentAmount}` : ''}&tn=${encodeURIComponent('श्री बालाजी मेस मासिक फी / जेवण बिल')}`;

  const activeQrContent = qrType === 'register' ? liveAppUrl : upiUri;

  useEffect(() => {
    if (!isOpen) return;

    if (qrType === 'payment' && paymentQrSource === 'upload' && uploadedQrImage) {
      setQrDataUrl(uploadedQrImage);
      return;
    }

    if (!activeQrContent) return;

    QRCode.toDataURL(activeQrContent, {
      width: 500,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [isOpen, activeQrContent, qrType, paymentQrSource, uploadedQrImage]);

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

      if (qrType === 'register') {
        if (registerPosterStyle === 'template') {
          // MODE 1A: Graphic Flyer Template with calibrated coordinates
          const templateImg = new Image();
          templateImg.crossOrigin = 'anonymous';
          templateImg.src = '/poster_template.jpg';

          await new Promise((resolve, reject) => {
            templateImg.onload = resolve;
            templateImg.onerror = reject;
          });

          canvas.width = templateImg.naturalWidth || 682;
          canvas.height = templateImg.naturalHeight || 1024;

          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

          const qrX = canvas.width * 0.638;
          const qrY = canvas.height * 0.342;
          const qrW = canvas.width * 0.295;
          const qrH = canvas.height * 0.180;

          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          await new Promise((resolve, reject) => {
            qrImg.onload = resolve;
            qrImg.onerror = reject;
          });

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(qrX, qrY, qrW, qrH, 6);
          ctx.fill();

          ctx.drawImage(qrImg, qrX + 2, qrY + 2, qrW - 4, qrH - 4);
        } else {
          // MODE 1B: Official High-Res A4 Registration Notice Poster (Vector Sizing)
          canvas.width = 800;
          canvas.height = 1180;

          // Background Gradient
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.12, '#fffaf0');
          grad.addColorStop(1, '#f8fafc');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Top Saffron Bar
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(0, 0, canvas.width, 24);

          // Border Frame
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 8;
          ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

          // Header Brand Title
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 38px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('श्री बालाजी मेस (पुणे)', canvas.width / 2, 95);

          ctx.fillStyle = '#c2410c';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('🚩 २१ वर्षांची अखंड परंपरा • घरगुती रुचकर जेवण व टिफिन सेवा 🚩', canvas.width / 2, 135);

          // Header Pill: SCAN TO REGISTER
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.roundRect(canvas.width / 2 - 230, 165, 460, 48, 24);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText('📱 ऑनलाईन नोंदणी • SCAN TO REGISTER', canvas.width / 2, 197);

          // Draw QR Container Card
          const qrBoxSize = 460;
          const qrBoxX = (canvas.width - qrBoxSize) / 2;
          const qrBoxY = 240;

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.12)';
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw QR Image
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          await new Promise((resolve, reject) => {
            qrImg.onload = resolve;
            qrImg.onerror = reject;
          });

          ctx.drawImage(qrImg, qrBoxX + 24, qrBoxY + 24, qrBoxSize - 48, qrBoxSize - 48);

          // Feature Highlights Box
          const infoY = 740;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(60, infoY, canvas.width - 120, 240, 20);
          ctx.fill();

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('✨ मेस मित्र वैशिष्ट्ये:', 90, infoY + 45);

          ctx.font = '19px sans-serif';
          ctx.fillStyle = '#334155';
          ctx.fillText('🍲  घरगुती रुचकर व ताजे जेवण (दुपारी व रात्री)', 90, infoY + 85);
          ctx.fillText('📅  मोबाईल ॲपवरून सुट्टी (Leave) नोंदवण्याची सोय', 90, infoY + 125);
          ctx.fillText('📊  पारदर्शक मासिक बिलिंग व त्वरित UPI पेमेंट', 90, infoY + 165);
          ctx.fillText('🎫  डिजिटल मील टोकन व डाएट निवड (व्हेज / नॉन-व्हेज)', 90, infoY + 205);

          // Contact Box
          ctx.textAlign = 'center';
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('चालक: शंकर गिरी • मो. ९८२२३३८९७५', canvas.width / 2, 1040);

          ctx.fillStyle = '#64748b';
          ctx.font = '16px monospace';
          ctx.fillText(liveAppUrl, canvas.width / 2, 1080);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
          ctx.fillText('Powered by MessMitra (मेस मित्र)', canvas.width / 2, 1120);
        }
      } else {
        // MODE 2: Dedicated Official UPI Merchant Standee Poster
        canvas.width = 800;
        canvas.height = 1150;

        // Background Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.12, '#fffaf0');
        grad.addColorStop(1, '#f8fafc');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Top Bar with Brand Saffron
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(0, 0, canvas.width, 24);

        // Border
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 8;
        ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

        // Header Text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('श्री बालाजी मेस (पुणे)', canvas.width / 2, 95);

        ctx.fillStyle = '#c2410c';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('🚩 २१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख 🚩', canvas.width / 2, 135);

        // UPI Header Pill
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 220, 165, 440, 48, 24);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('SCAN & PAY WITH ANY UPI APP', canvas.width / 2, 197);

        // Draw QR Container Box
        const qrBoxSize = 480;
        const qrBoxX = (canvas.width - qrBoxSize) / 2;
        const qrBoxY = 240;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw the QR Code Image
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
        });

        ctx.drawImage(qrImg, qrBoxX + 25, qrBoxY + 25, qrBoxSize - 50, qrBoxSize - 50);

        // Payee & Owner Info Box
        const infoY = 760;
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.roundRect(80, infoY, canvas.width - 160, 200, 20);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`UPI ID: ${upiId}`, canvas.width / 2, infoY + 50);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`खातेदार: ${payeeName}`, canvas.width / 2, infoY + 95);

        ctx.fillStyle = '#475569';
        ctx.font = '20px sans-serif';
        ctx.fillText('चालक: शंकर गिरी • मो. ९८२२३३८९७५', canvas.width / 2, infoY + 140);

        if (paymentAmount) {
          ctx.fillStyle = '#16a34a';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`निश्चित रक्कम: ₹${paymentAmount}`, canvas.width / 2, infoY + 175);
        }

        // Footer Brand & Apps
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Google Pay  •  PhonePe  •  Paytm  •  BHIM UPI', canvas.width / 2, 1020);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText('मेस मासिक फी व जेवण बिलासाठी हे स्टँडी काउंटरवर वापरा.', canvas.width / 2, 1060);
      }

      // Trigger download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = qrType === 'register' ? 'shree_balaji_mess_joining_poster.jpg' : 'shree_balaji_mess_upi_standee.jpg';
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

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full sm:max-w-4xl lg:max-w-5xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-100 dark:bg-slate-900">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header Controls */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-brand-500/40 shadow-sm shrink-0 bg-white">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {qrType === 'register'
                  ? (language === 'en' ? 'Official Mess Registration Poster' : 'अधिकृत मेस नोंदणी पोस्टर')
                  : (language === 'en' ? 'Official UPI Payment Standee' : 'अधिकृत UPI पेमेंट क्यूआर स्टँडी')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {qrType === 'register'
                  ? (language === 'en' ? 'A4 Printable standee for member onboarding' : 'नवीन सदस्यांच्या ऑनलाईन नोंदणीसाठी A4 स्टँडी')
                  : (language === 'en' ? 'Separate standee for counter / table payment' : 'काउंटर व टेबल पेमेंटसाठी स्वतंत्र स्टँडी')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[36px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Print' : 'प्रिंट'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={isGeneratingDownload || !qrDataUrl}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingDownload ? (language === 'en' ? 'Downloading...' : 'डाऊनलोड...') : (language === 'en' ? 'Download Poster' : 'पोस्टर डाऊनलोड')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* LEFT 5 COLS: CONTROLS & CUSTOMIZATIONS */}
          <div className="print:hidden md:col-span-5 p-4 sm:p-5 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-xs">
            {/* Mode Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                {language === 'en' ? 'Poster Type' : 'पोस्टर प्रकार निवडा:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setQrType('register')}
                  className={`py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1 text-xs ${
                    qrType === 'register'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>👥 नवीन नोंदणी</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrType('payment')}
                  className={`py-2 px-2.5 rounded-xl font-bold transition cursor-pointer text-center flex items-center justify-center gap-1 text-xs ${
                    qrType === 'payment'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>💰 UPI पेमेंट</span>
                </button>
              </div>
            </div>

            {/* Sub-Style Selector for Registration */}
            {qrType === 'register' && (
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                  {language === 'en' ? 'Design Style' : 'डिझाईन लेआउट:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRegisterPosterStyle('clean')}
                    className={`py-2 px-2 rounded-xl font-bold transition cursor-pointer text-center text-xs ${
                      registerPosterStyle === 'clean'
                        ? 'bg-white dark:bg-slate-800 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ✨ A4 स्टँडी नोटीस
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterPosterStyle('template')}
                    className={`py-2 px-2 rounded-xl font-bold transition cursor-pointer text-center text-xs ${
                      registerPosterStyle === 'template'
                        ? 'bg-white dark:bg-slate-800 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🎨 फ्लायर टेम्पलेट
                  </button>
                </div>
              </div>
            )}

            {/* Registration Live URL Editor */}
            {qrType === 'register' && (
              <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>QR स्कॅन लिंक:</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>कॉपी झाली!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" />
                        <span>कॉपी करा</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 break-all select-all">
                  {liveAppUrl}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(!isEditingUrl)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingUrl ? 'कस्टमाईझ लपवा' : 'कस्टम लिंक बदला'}</span>
                  </button>
                </div>

                {isEditingUrl && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <input
                      type="text"
                      value={liveAppUrl}
                      onChange={(e) => setLiveAppUrl(e.target.value)}
                      onBlur={(e) => handleSaveCustomUrl(e.target.value)}
                      placeholder="उदा. https://messmitra-web.vercel.app/register"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none"
                    />

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 dark:text-slate-400">
                      <span>जलद शॉर्टकट:</span>
                      <button
                        type="button"
                        onClick={() => handleSaveCustomUrl('https://messmitra-web.vercel.app/register')}
                        className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-brand-500 text-brand-600 font-bold cursor-pointer font-mono"
                      >
                        /register
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCustomUrl('https://messmitra-web.vercel.app/?register=true')}
                        className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 font-mono"
                      >
                        /?register=true
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* UPI Payment Configuration Controls */}
            {qrType === 'payment' && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentQrSource('generate')}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer text-center ${
                      paymentQrSource === 'generate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ⚡ UPI ID वरून QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentQrSource('upload')}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                      paymentQrSource === 'upload'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>QR फोटो अपलोड</span>
                  </button>
                </div>

                {paymentQrSource === 'generate' && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        मेस UPI ID (PhonePe / GPay / Paytm) *
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => handleSaveUpiId(e.target.value)}
                        placeholder="उदा. 9822338975@upi"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        निश्चित रक्कम (ऐच्छिक ₹)
                      </label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="उदा. 3000 किंवा मोकळे ठेवा"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentQrSource === 'upload' && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {uploadedQrImage ? (
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                            <img src={uploadedQrImage} alt="Uploaded QR" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-emerald-600 block">
                              QR फोटो लोड झाला ✔️
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                          >
                            बदला
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveUploadedQr}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl bg-white dark:bg-slate-900 hover:bg-blue-50/50 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                          QR फोटो निवडा (PNG / JPG)
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Notice Tip */}
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-300/40 text-[11px] text-amber-900 dark:text-amber-200">
              💡 <strong>टीप:</strong> हे पोस्टर डाऊनलोड करून A4 साईझवर कलर प्रिंट करा व मेस काउंटर किंवा टेबल स्टँडीवर लावा.
            </div>
          </div>

          {/* RIGHT 7 COLS: PERFECTLY CENTERED & SCALED LIVE STANDEE PREVIEW */}
          <div className="md:col-span-7 p-4 sm:p-6 bg-slate-200/90 dark:bg-slate-950 flex flex-col items-center justify-center overflow-y-auto min-h-[440px]">
            {/* 1. REGISTRATION POSTER */}
            {qrType === 'register' && (
              <>
                {registerPosterStyle === 'clean' ? (
                  /* 1A. CLEAN PROPORTIONAL HIGH-RES A4 STANDEE */
                  <div
                    id="printable-notice-board"
                    className="w-full max-w-[360px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl bg-white border-4 border-emerald-600 text-slate-900 select-none p-4 sm:p-5 text-center space-y-3 relative"
                  >
                    {/* Top Saffron Badge */}
                    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-1 px-3 rounded-xl -mx-1 shadow-sm">
                      <span className="font-extrabold text-[11px] tracking-wider uppercase">
                        🚩 श्री बालाजी मेस • २१ वर्षांची अखंड परंपरा 🚩
                      </span>
                    </div>

                    {/* Header */}
                    <div>
                      <div className="w-12 h-12 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md mb-1.5 bg-white">
                        <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                        श्री बालाजी मेस (पुणे)
                      </h2>
                      <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        घरगुती रुचकर जेवण व टिफिन सेवा
                      </p>
                    </div>

                    {/* Header Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>📱 ऑनलाईन नोंदणी • SCAN TO REGISTER</span>
                    </div>

                    {/* QR Card Container */}
                    <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto bg-white p-2.5 rounded-2xl shadow-md border-2 border-slate-200 flex items-center justify-center">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Registration QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-xs text-slate-400">QR तयार होत आहे...</div>
                      )}
                    </div>

                    {/* Highlights Card */}
                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] space-y-1 text-left font-medium">
                      <div className="font-bold text-slate-900 text-[11px] pb-0.5 border-b border-slate-200">
                        ✨ मेस मित्र वैशिष्ट्ये:
                      </div>
                      <div className="text-slate-700 flex items-center gap-1.5">
                        <span>🍲</span>
                        <span>घरगुती रुचकर व ताजे जेवण (दुपारी व रात्री)</span>
                      </div>
                      <div className="text-slate-700 flex items-center gap-1.5">
                        <span>📅</span>
                        <span>मोबाईल ॲपवरून सुट्टी (Leave) नोंदवण्याची सोय</span>
                      </div>
                      <div className="text-slate-700 flex items-center gap-1.5">
                        <span>📊</span>
                        <span>पारदर्शक मासिक बिलिंग व डिजिटल टोकन</span>
                      </div>
                    </div>

                    {/* Owner Contact */}
                    <div className="pt-1.5 border-t border-slate-100 text-slate-700 text-[11px] font-bold">
                      <span>चालक: शंकर गिरी • मो. ९८२२३३८९७५</span>
                    </div>
                  </div>
                ) : (
                  /* 1B. GRAPHIC FLYER TEMPLATE WITH CALIBRATED QR */
                  <div
                    id="printable-notice-board"
                    className="relative w-full max-w-[360px] sm:max-w-[380px] rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-300 select-none"
                  >
                    <img
                      src="/poster_template.jpg"
                      alt="श्री बालाजी मेस पोस्टर"
                      className="w-full h-auto block"
                    />

                    {/* Embedded Calibrated Live QR Code */}
                    <div
                      className="absolute p-0.5 flex items-center justify-center bg-white rounded-lg pointer-events-none"
                      style={{
                        top: '34.2%',
                        left: '63.8%',
                        width: '29.5%',
                        height: '18.0%',
                      }}
                    >
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Registration QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-400 text-center">QR तयार होत आहे...</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. DEDICATED OFFICIAL UPI PAYMENT STANDEE */}
            {qrType === 'payment' && (
              <div
                id="printable-payment-standee"
                className="w-full max-w-[360px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl bg-white border-4 border-amber-500 text-slate-900 select-none p-4 sm:p-5 text-center space-y-3 relative"
              >
                {/* Top Saffron Badge */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-1 px-3 rounded-xl -mx-1 shadow-sm">
                  <span className="font-extrabold text-[11px] tracking-wider uppercase">
                    🚩 श्री बालाजी मेस • २१ वर्षांची अखंड परंपरा 🚩
                  </span>
                </div>

                {/* Header */}
                <div>
                  <div className="w-12 h-12 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md mb-1.5 bg-white">
                    <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                    श्री बालाजी मेस (पुणे)
                  </h2>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    {language === 'en' ? 'Official UPI Payment Standee' : 'अधिकृत UPI पेमेंट काउंटर स्टँडी'}
                  </p>
                </div>

                {/* UPI Pill Header */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] shadow-sm">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>SCAN & PAY WITH ANY UPI APP</span>
                </div>

                {/* Standee QR Box */}
                <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto bg-white p-2.5 rounded-2xl shadow-md border-2 border-slate-200 flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">QR तयार होत आहे...</div>
                  )}
                </div>

                {/* Payee Info Card */}
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] space-y-0.5 font-mono">
                  <div className="font-black text-xs text-slate-900 truncate">
                    UPI ID: <span className="text-blue-600 font-bold">{upiId}</span>
                  </div>
                  <div className="text-slate-700 font-bold">
                    खातेदार: {payeeName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    चालक: शंकर गिरी (९८२२३३८९७५)
                  </div>
                  {paymentAmount && (
                    <div className="text-emerald-700 font-black text-xs pt-0.5">
                      रक्कम: ₹{paymentAmount}
                    </div>
                  )}
                </div>

                {/* Accepted Apps Footer */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold">
                  <span>GPay</span>
                  <span>•</span>
                  <span>PhonePe</span>
                  <span>•</span>
                  <span>Paytm</span>
                  <span>•</span>
                  <span>BHIM UPI</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Buttons */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            चालक: शंकर गिरी (९८२२३३८९७५)
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={isGeneratingDownload || !qrDataUrl}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px]"
            >
              <Download className="w-4 h-4" />
              <span>JPG डाऊनलोड करा</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer min-h-[38px]"
            >
              बंद करा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

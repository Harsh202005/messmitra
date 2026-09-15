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

      // Load saved UPI details and uploaded QR image
      const savedUpi = localStorage.getItem('messmitra_custom_upi_id');
      if (savedUpi) setUpiId(savedUpi);

      const savedQrImg = localStorage.getItem('messmitra_uploaded_upi_qr');
      if (savedQrImg) {
        setUploadedQrImage(savedQrImg);
      }
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

  const handleSaveUpiId = (newUpi: string) => {
    setUpiId(newUpi);
    if (typeof window !== 'undefined') {
      localStorage.setItem('messmitra_custom_upi_id', newUpi);
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
        // MODE 1: Registration Poster Template
        const templateImg = new Image();
        templateImg.crossOrigin = 'anonymous';
        templateImg.src = '/poster_template.jpg';

        await new Promise((resolve, reject) => {
          templateImg.onload = resolve;
          templateImg.onerror = reject;
        });

        canvas.width = templateImg.naturalWidth || 720;
        canvas.height = templateImg.naturalHeight || 1080;

        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        const qrX = canvas.width * 0.622;
        const qrY = canvas.height * 0.338;
        const qrSize = canvas.width * 0.315;

        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
        });

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
        ctx.fill();

        ctx.drawImage(qrImg, qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
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
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-100 dark:bg-slate-900">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header Controls */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-brand-500/40 shadow-sm shrink-0 bg-white">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {qrType === 'register' ? 'अधिकृत मेस नोंदणी पोस्टर' : 'अधिकृत UPI पेमेंट क्यूआर स्टँडी'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {qrType === 'register'
                  ? 'नवीन सदस्यांच्या ऑनलाईन नोंदणीसाठी'
                  : 'टेबल स्टँडी किंवा काउंटर पेमेंटसाठी स्वतंत्र पोस्टर'}
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
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="print:hidden px-5 py-2.5 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQrType('register')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                  qrType === 'register'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>👥 नवीन नोंदणी पोस्टर</span>
              </button>

              <button
                type="button"
                onClick={() => setQrType('payment')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                  qrType === 'payment'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>💰 स्वतंत्र UPI पेमेंट स्टँडी</span>
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
                  <span>{isEditingUrl ? 'लपवा' : 'लिंक बदला'}</span>
                </button>

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
                      <span>कॉपी</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Registration Live URL Editor */}
          {qrType === 'register' && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>QR स्कॅन लिंक:</span>
                </span>
                <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 truncate max-w-[240px]">
                  {liveAppUrl}
                </span>
              </div>

              {isEditingUrl && (
                <div className="space-y-1.5 pt-1 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={liveAppUrl}
                      onChange={(e) => setLiveAppUrl(e.target.value)}
                      onBlur={(e) => handleSaveCustomUrl(e.target.value)}
                      placeholder="उदा. https://messmitra-web.vercel.app/register"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCustomUrl(liveAppUrl)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition shrink-0"
                    >
                      सेव्ह
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 dark:text-slate-400">
                    <span>जलद लिंक्स:</span>
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
            <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs space-y-3">
              {/* Payment Mode Selector: Generate vs Upload */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentQrSource('generate')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      paymentQrSource === 'generate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ⚡ UPI आयडी वरून QR तयार करा
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentQrSource('upload')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                      paymentQrSource === 'upload'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>स्वतःचा QR फोटो अपलोड करा</span>
                  </button>
                </div>
              </div>

              {/* Option A: Generate from UPI ID */}
              {paymentQrSource === 'generate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      मेस UPI ID (PhonePe / GPay / Paytm) *
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => handleSaveUpiId(e.target.value)}
                      placeholder="उदा. 9822338975@upi"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      निश्चित रक्कम (ऐच्छिक / Optional ₹)
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="उदा. 3000 किंवा मोकळे ठेवा"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Option B: Upload Official Scanner Photo */}
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
                            QR फोटो यशस्वीरित्या लोड झाला! ✔️
                          </span>
                          <span className="text-[10px] text-slate-400">हा QR थेट पेमेंट स्टँडीवर बसेल.</span>
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
                      <Upload className="w-6 h-6 text-blue-500" />
                      <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                        PhonePe / Google Pay / Paytm चा QR फोटो अपलोड करा
                      </span>
                      <span className="text-[10px] text-slate-400">PNG, JPG किंवा WebP फॉरमॅट</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Live Poster / Standee Preview */}
        <div className="p-3 sm:p-5 overflow-y-auto bg-slate-200 dark:bg-slate-950 flex flex-col items-center">
          {/* 1. REGISTRATION POSTER TEMPLATE */}
          {qrType === 'register' && (
            <div
              id="printable-notice-board"
              className="relative w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-300 select-none"
            >
              <img
                src="/poster_template.jpg"
                alt="श्री बालाजी मेस पोस्टर"
                className="w-full h-auto block"
              />

              {/* Embedded Live QR Code */}
              <div
                className="absolute bg-white rounded-xl shadow-md p-1.5 flex items-center justify-center"
                style={{
                  top: '33.8%',
                  left: '62.2%',
                  width: '31.5%',
                  height: '21.5%',
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

          {/* 2. DEDICATED OFFICIAL UPI PAYMENT STANDEE (Distinct Design) */}
          {qrType === 'payment' && (
            <div
              id="printable-payment-standee"
              className="w-full max-w-[440px] rounded-3xl overflow-hidden shadow-2xl bg-white border-4 border-amber-500 text-slate-900 select-none p-5 sm:p-6 text-center space-y-4 relative"
            >
              {/* Top Saffron Badge */}
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-1.5 px-4 rounded-xl -mx-2 shadow-sm">
                <span className="font-extrabold text-xs tracking-wider uppercase">
                  🚩 श्री बालाजी मेस • २१ वर्षांची अखंड परंपरा 🚩
                </span>
              </div>

              {/* Header */}
              <div>
                <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md mb-2 bg-white">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  श्री बालाजी मेस (पुणे)
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  अधिकृत UPI पेमेंट काउंटर स्टँडी (Official Payment Standee)
                </p>
              </div>

              {/* UPI Pill Header */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-sm">
                <QrCode className="w-4 h-4" />
                <span>SCAN & PAY WITH ANY UPI APP</span>
              </div>

              {/* Standee QR Box */}
              <div className="w-52 h-52 sm:w-56 sm:h-56 mx-auto bg-white p-3 rounded-2xl shadow-lg border-2 border-slate-200 flex items-center justify-center">
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
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-mono">
                <div className="font-black text-sm text-slate-900 truncate">
                  UPI ID: <span className="text-blue-600 font-bold">{upiId}</span>
                </div>
                <div className="text-slate-700 font-bold">
                  खातेदार: {payeeName}
                </div>
                <div className="text-[11px] text-slate-500">
                  चालक: शंकर गिरी (९८२२३३८९७५)
                </div>
                {paymentAmount && (
                  <div className="text-emerald-700 font-black text-sm pt-1">
                    रक्कम: ₹{paymentAmount}
                  </div>
                )}
              </div>

              {/* Accepted Apps Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-slate-500 text-[11px] font-bold">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM UPI</span>
              </div>
            </div>
          )}

          {/* Quick Notice Tip */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-3 max-w-sm">
            💡 हे पोस्टर थेट A4 किंवा टेबल स्टँडीवर प्रिंट करून मेस काउंटरवर लावा.
          </p>
        </div>

        {/* Modal Bottom Action Buttons */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-900 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            चालक: शंकर गिरी (९८२२३३८९७५)
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={isGeneratingDownload || !qrDataUrl}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>JPG डाऊनलोड करा</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer min-h-[40px]"
            >
              बंद करा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

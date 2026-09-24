'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export const PwaInstallPrompt: React.FC = () => {
  const { language } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true); // show install banner / mobile app preview
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If standalone install prompt is not triggered by browser, show preview
      setShowPreviewModal(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible && !isInstalled) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-sm bg-gradient-to-r from-brand-600 via-orange-600 to-amber-600 text-white p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-slideUp">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setShowPreviewModal(true)}>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/40 shadow-sm">
            <img src="/logo.jpeg" alt="श्री बालाजी मेस Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <strong className="text-xs font-bold block leading-tight">
              {language === 'en' ? 'Shree Balaji Mess App' : 'श्री बालाजी मेस ॲप'}
            </strong>
            <span className="text-[10px] text-white/90 underline">
              {language === 'en' ? 'View App Preview' : 'मोबाईल ॲप दृश्य पहा'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1.5 bg-white text-brand-700 font-extrabold text-xs rounded-xl shadow transition hover:bg-white/90 cursor-pointer"
          >
            {deferredPrompt ? (language === 'en' ? 'Install' : 'इन्स्टॉल') : (language === 'en' ? 'View App' : 'ॲप पहा')}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-white/70 hover:text-white cursor-pointer"
            title={language === 'en' ? 'Hide' : 'लपवा'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile App Full Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[92vh]">
            <div className="p-4 bg-gradient-to-r from-brand-600 to-amber-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">{language === 'en' ? 'Shree Balaji Mess • Mobile App' : 'श्री बालाजी मेस • मोबाईल ॲप'}</h3>
                <p className="text-[11px] text-white/90">Android & iOS PWA App Interface</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex justify-center">
                <img
                  src="/mobile_app_mockup.jpg"
                  alt="श्री बालाजी मेस Mobile App Preview"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>

              <div className="text-center space-y-1 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'en' ? '📱 Install directly without any app store' : '📱 कोणत्याही ॲप स्टोअर शिवाय थेट इन्स्टॉल करा'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === 'en'
                    ? 'In Chrome or Safari, tap "Add to Home Screen" to install and use like a native app.'
                    : 'Chrome किंवा Safari मध्ये "Add to Home Screen" निवडून ॲप प्रमाणे वापरा.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full py-2 bg-gradient-to-r from-brand-600 to-amber-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'समजले'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

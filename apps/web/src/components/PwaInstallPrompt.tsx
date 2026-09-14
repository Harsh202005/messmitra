'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
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
              श्री बालाजी मेस ॲप
            </strong>
            <span className="text-[10px] text-white/90 underline">
              मोबाईल ॲप दृश्य पहा (App Preview)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1.5 bg-white text-brand-700 font-extrabold text-xs rounded-xl shadow transition hover:bg-white/90 cursor-pointer"
          >
            {deferredPrompt ? 'इन्स्टॉल' : 'ॲप पहा'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-white/70 hover:text-white cursor-pointer"
            title="लपवा"
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
                <h3 className="font-black text-sm">श्री बालाजी मेस • मोबाईल ॲप</h3>
                <p className="text-[11px] text-white/90">Android & iOS PWA App Interface</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col items-center space-y-3">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xl max-w-[280px]">
                <img
                  src="/mobile_app_mockup.jpg"
                  alt="श्री बालाजी मेस Mobile App Preview"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>

              <div className="text-center space-y-1 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  📱 कोणत्याही ॲप स्टोअर शिवाय थेट इन्स्टॉल करा
                </p>
                <p className="text-[11px] text-slate-500">
                  Chrome किंवा Safari मध्ये "Add to Home Screen" निवडून ॲप प्रमाणे वापरा.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full py-2 bg-gradient-to-r from-brand-600 to-amber-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
              >
                समजले (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

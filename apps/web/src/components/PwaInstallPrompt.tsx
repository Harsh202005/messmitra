'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible && !isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm bg-gradient-to-r from-brand-600 via-orange-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-slideUp">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <strong className="text-xs font-bold block leading-tight">
            MessMitra ॲप इन्स्टॉल करा
          </strong>
          <span className="text-[10px] text-white/80">
            होम स्क्रीनवर थेट वापरा (No Play Store required)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-white text-brand-700 font-extrabold text-xs rounded-xl shadow transition hover:bg-white/90"
        >
          इन्स्टॉल
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

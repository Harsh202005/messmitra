'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Mess } from '@messmitra/types';
import {
  X,
  Store,
  Clock,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  MessageCircle,
} from 'lucide-react';

interface MessSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMess: Mess | null;
  onSave: (data: Partial<Mess>) => Promise<void>;
}

export const MessSetupWizardModal: React.FC<MessSetupWizardModalProps> = ({
  isOpen,
  onClose,
  currentMess,
  onSave,
}) => {
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: currentMess?.name || 'श्री बालाजी मेस',
    area: currentMess?.area || 'कर्वे नगर / कोथरूड',
    city: currentMess?.city || 'पुणे',
    dailyCutoffTime: currentMess?.dailyCutoffTime || '18:00',
    lunchCutoffTime: currentMess?.lunchCutoffTime || '09:00',
    dinnerCutoffTime: currentMess?.dinnerCutoffTime || '18:00',
    defaultVegRate: currentMess?.defaultVegRate || 3000,
    defaultNonVegRate: currentMess?.defaultNonVegRate || 3200,
    upiId: currentMess?.upiId || '9822338975@upi',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep((step + 1) as 2 | 3);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

        {/* Header with Step indicator */}
        <div className="bg-gradient-to-r from-brand-600 to-amber-600 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">
              {t('setupWizard')}
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-black">
            {step === 1 && 'पायरी १: मेसचे नाव व पत्ता'}
            {step === 2 && 'पायरी २: कटऑफ वेळा (०९:०० AM / ०६:०० PM) व आहार दर'}
            {step === 3 && 'पायरी ३: UPI QR कोड व संपर्क तपशील'}
          </h2>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-3">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 1 ? 'w-12 bg-white' : 'w-4 bg-white/40'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 2 ? 'w-12 bg-white' : 'w-4 bg-white/40'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 3 ? 'w-12 bg-white' : 'w-4 bg-white/40'
              }`}
            />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मेसचे नाव *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    placeholder="उदा. श्री बालाजी मेस"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    परिसर / गल्ली *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    placeholder="उदा. कर्वे नगर / कोथरूड"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    शहर *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    placeholder="उदा. पुणे"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cutoff Time & Veg/Non-Veg Rates */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    दुपार कटऑफ (Lunch - 09:00 AM) *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="time"
                      required
                      value={formData.lunchCutoffTime}
                      onChange={(e) => setFormData({ ...formData, lunchCutoffTime: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    सकाळी ०९:०० वाजेपर्यंत दुपारची सुट्टी
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    रात्र कटऑफ (Dinner - 06:00 PM) *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="time"
                      required
                      value={formData.dailyCutoffTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyCutoffTime: e.target.value,
                          dinnerCutoffTime: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    संध्याकाळी ०६:०० वाजेपर्यंत रात्रीची सुट्टी
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    🟢 शाकाहारी दर (Veg - 56 जेवण) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min={0}
                    step={50}
                    value={formData.defaultVegRate}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultVegRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    🔴 मांसाहारी दर (Non-Veg - 56 जेवण) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min={0}
                    step={50}
                    value={formData.defaultNonVegRate}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultNonVegRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPI Setup & Preview */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  अधिकृत UPI ID (शंकर गिरी) *
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                    placeholder="उदा. 9822338975@upi"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  सर्व WhatsApp बिलांवर हाच QR कोड व UPI ID पाठवला जाईल.
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs">
                ✨ <strong>२१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख</strong> — श्री बालाजी मेसची सर्व सेटिंग्ज सुरक्षितपणे जतन केली जातील.
              </div>
            </div>
          )}

          {/* Modal Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2)}
                className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>मागे</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                रद्द करा
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[48px] rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <span>{step === 3 ? (isSubmitting ? 'जतन करत आहे...' : 'सेटिंग्ज पूर्ण करा ✓') : 'पुढे चला'}</span>
              {step < 3 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

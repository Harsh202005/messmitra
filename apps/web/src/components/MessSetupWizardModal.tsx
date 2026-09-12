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
    name: currentMess?.name || 'Balaji Executive Dining & Mess',
    area: currentMess?.area || 'Karve Nagar / Kothrud',
    city: currentMess?.city || 'Pune',
    dailyCutoffTime: currentMess?.dailyCutoffTime || '09:00',
    defaultMaleRate: currentMess?.defaultMaleRate || 3200,
    defaultFemaleRate: currentMess?.defaultFemaleRate || 2800,
    upiId: currentMess?.upiId || 'balajimess@okhdfcbank',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header with Step indicator */}
        <div className="bg-gradient-to-r from-brand-600 to-amber-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">
              {t('setupWizard')}
            </span>
          </div>

          <h2 className="text-xl font-bold">
            {step === 1 && t('wizardStep1Title')}
            {step === 2 && t('wizardStep2Title')}
            {step === 3 && t('wizardStep3Title')}
          </h2>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('messName')} *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="उदा. Balaji Executive Mess"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('messArea')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="उदा. Karve Nagar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('messCity')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="उदा. Pune"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cutoff Time & Gender Rates */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('cutoffTime')} *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="time"
                    required
                    value={formData.dailyCutoffTime}
                    onChange={(e) => setFormData({ ...formData, dailyCutoffTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('cutoffTimeHelp')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('maleRateLabel')} *
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2 text-sm font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={formData.defaultMaleRate}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultMaleRate: Number(e.target.value) })
                      }
                      className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('femaleRateLabel')} *
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3 top-2 text-sm font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={formData.defaultFemaleRate}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultFemaleRate: Number(e.target.value) })
                      }
                      className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPI Setup & Preview */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('upiIdLabel')} *
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                    placeholder="उदा. yourname@okhdfcbank"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('upiIdHelp')}
                </p>
              </div>

              {/* Live WhatsApp Bill Reminder Preview Card */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Reminder Preview (थेट लिंक):</span>
                </div>
                <p className="font-sans whitespace-pre-line bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-100 dark:border-slate-700 text-[11px] leading-relaxed shadow-sm">
                  🙏 *नमस्ते राहुल*,{'\n'}
                  {formData.name} चे *सप्टेंबर* महिन्याचे बिल:{'\n'}
                  💰 *एकूण बाकी: ₹3,200*{'\n'}
                  👉 *UPI ID:* <span className="font-mono text-brand-600 font-bold">{formData.upiId}</span>{'\n'}
                  🔗 थेट पेमेंट लिंक: <span className="text-blue-500 underline">upi://pay?pa={formData.upiId}...</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('prevStep')}
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>जतन करत आहे...</span>
              ) : step === 3 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('completeSetup')}</span>
                </>
              ) : (
                <>
                  <span>{t('nextStep')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

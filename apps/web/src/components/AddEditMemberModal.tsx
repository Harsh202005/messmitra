'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, Gender, DietPreference, PlanType, MemberStatus, Mess } from '@messmitra/types';
import { X, User, Phone, DollarSign, Calendar, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  mess: Mess | null;
  onSave: (data: Omit<Member, 'id' | 'createdAt' | 'messId'>, memberId?: string) => Promise<void>;
}

export const AddEditMemberModal: React.FC<AddEditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  mess,
  onSave,
}) => {
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultVegRate = mess?.defaultVegRate || 3000;
  const defaultNonVegRate = mess?.defaultNonVegRate || 3200;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dietPreference: 'veg' as DietPreference,
    gender: 'male' as Gender,
    rate: defaultVegRate,
    planType: 'both' as PlanType,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as MemberStatus,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        phone: member.phone,
        dietPreference: member.dietPreference || (member.gender === 'female' ? 'veg' : 'nonveg'),
        gender: member.gender || 'male',
        rate: member.rate,
        planType: member.planType,
        joinDate: member.joinDate,
        status: member.status,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        dietPreference: 'veg',
        gender: 'male',
        rate: defaultVegRate,
        planType: 'both',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
  }, [member, isOpen, defaultVegRate]);

  if (!isOpen) return null;

  const handleDietChange = (dietPreference: DietPreference) => {
    let rate = formData.rate;
    if (!member) {
      rate = dietPreference === 'veg' ? defaultVegRate : defaultNonVegRate;
      if (formData.planType !== 'both') {
        rate = Math.round(rate / 2);
      }
    }
    setFormData({ ...formData, dietPreference, rate });
  };

  const handlePlanChange = (planType: PlanType) => {
    let rate = formData.rate;
    if (!member) {
      const base = formData.dietPreference === 'veg' ? defaultVegRate : defaultNonVegRate;
      rate = planType === 'both' ? base : Math.round(base / 2);
    }
    setFormData({ ...formData, planType, rate });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData, member?.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/30">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base">
              {member ? 'सभासद माहिती संपादित करा' : 'नवीन सभासद जोडा (Add Member)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              सभासदाचे पूर्ण नाव *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="उदा. राहुल देशमुख"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              मोबाइल नंबर (WhatsApp) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                inputMode="numeric"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="उदा. 9822338975"
              />
            </div>
          </div>

          {/* Diet Preference */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              आहार प्रकार (Diet Preference) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDietChange('veg')}
                className={`min-h-[44px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  formData.dietPreference === 'veg'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🟢 शाकाहारी (Veg)</span>
                <span className="text-[10px] opacity-90">(₹3,000)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDietChange('nonveg')}
                className={`min-h-[44px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  formData.dietPreference === 'nonveg'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🔴 मांसाहारी (Non-Veg)</span>
                <span className="text-[10px] opacity-90">(₹3,200)</span>
              </button>
            </div>
          </div>

          {/* Plan Type */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              प्लॅन प्रकार (Plan Type) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePlanChange('both')}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-center font-bold border transition text-xs cursor-pointer ${
                  formData.planType === 'both'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                दोन्ही वेळ (56 जेवण)
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange('lunch')}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-center font-bold border transition text-xs cursor-pointer ${
                  formData.planType === 'lunch'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                फक्त दुपार (28 जेवण)
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange('dinner')}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-center font-bold border transition text-xs cursor-pointer ${
                  formData.planType === 'dinner'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                फक्त रात्र (28 जेवण)
              </button>
            </div>
          </div>

          {/* Rate & Join Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                मासिक दर (₹ Rate) *
              </label>
              <input
                type="number"
                inputMode="numeric"
                required
                min={0}
                step={50}
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                className="w-full px-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                सामील तारीख *
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              स्थिती (Status) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'active' })}
                className={`min-h-[44px] rounded-xl font-bold border transition ${
                  formData.status === 'active'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                सक्रिय (Active)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                className={`min-h-[44px] rounded-xl font-bold border transition ${
                  formData.status === 'inactive'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                बंद (Inactive)
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'जतन करत आहे...' : member ? 'बदल सेव्ह करा' : 'सभासद नोंदणी पूर्ण करा'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

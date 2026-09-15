'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, Gender, DietPreference, PlanType, MemberStatus, Mess } from '@messmitra/types';
import { X, User, Phone, DollarSign, Calendar, UtensilsCrossed, CheckCircle2, Tag } from 'lucide-react';
import { getDynamicRateForPlan, getStoredPlans } from '../lib/pricePlanService';

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

  // Dynamic rates computed from Owner's Plan Manager
  const veg1Rate = getDynamicRateForPlan('lunch', 'veg');
  const veg2Rate = getDynamicRateForPlan('both', 'veg');
  const nonveg1Rate = getDynamicRateForPlan('lunch', 'nonveg');
  const nonveg2Rate = getDynamicRateForPlan('both', 'nonveg');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dietPreference: 'veg' as DietPreference,
    gender: 'male' as Gender,
    rate: veg2Rate,
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
      const initialRate = getDynamicRateForPlan('both', 'veg');
      setFormData({
        name: '',
        phone: '',
        dietPreference: 'veg',
        gender: 'male',
        rate: initialRate,
        planType: 'both',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleDietChange = (dietPreference: DietPreference) => {
    let rate = formData.rate;
    if (!member) {
      rate = getDynamicRateForPlan(formData.planType, dietPreference, formData.gender);
    }
    setFormData({ ...formData, dietPreference, rate });
  };

  const handlePlanChange = (planType: PlanType) => {
    let rate = formData.rate;
    if (!member) {
      rate = getDynamicRateForPlan(planType, formData.dietPreference, formData.gender);
    }
    setFormData({ ...formData, planType, rate });
  };

  const handleGenderChange = (gender: Gender) => {
    let rate = formData.rate;
    if (!member) {
      rate = getDynamicRateForPlan(formData.planType, formData.dietPreference, gender);
    }
    setFormData({ ...formData, gender, rate });
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

          {/* Gender Selection */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              लिंग (Gender) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`min-h-[44px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  formData.gender === 'male'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>👨 पुरुष (Male)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`min-h-[44px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  formData.gender === 'female'
                    ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>👩 विद्यार्थिनी / महिला (Female)</span>
              </button>
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
                <span className="text-[10px] opacity-90 font-mono">
                  (१ वेळ: ₹{veg1Rate} / २ वेळ: ₹{veg2Rate})
                </span>
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
                <span className="text-[10px] opacity-90 font-mono">
                  (१ वेळ: ₹{nonveg1Rate} / २ वेळ: ₹{nonveg2Rate})
                </span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              * मांसाहारी/अंडी: आठवड्यातून ३ दिवस (बुध, शुक्र, रविवार). इतर दिवस स्वादिष्ट शाकाहारी भोजन.
            </p>
          </div>

          {/* Plan Type (1 meal vs 2 meals) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              जेवणाचा वेळ व प्रकार (Plan Type) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePlanChange('both')}
                className={`min-h-[48px] py-2 px-1 rounded-xl text-center font-bold border transition text-xs cursor-pointer flex flex-col items-center justify-center ${
                  formData.planType === 'both'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>२-वेळ दोन्ही (Lunch+Dinner)</span>
                <span className="text-[10px] font-mono opacity-90">
                  ₹{formData.dietPreference === 'veg' ? veg2Rate : nonveg2Rate}/महिना
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlanChange('lunch')}
                className={`min-h-[48px] py-2 px-1 rounded-xl text-center font-bold border transition text-xs cursor-pointer flex flex-col items-center justify-center ${
                  formData.planType === 'lunch'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>१-वेळ फक्त दुपार (Lunch)</span>
                <span className="text-[10px] font-mono opacity-90">
                  ₹{formData.dietPreference === 'veg' ? veg1Rate : nonveg1Rate}/महिना
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlanChange('dinner')}
                className={`min-h-[48px] py-2 px-1 rounded-xl text-center font-bold border transition text-xs cursor-pointer flex flex-col items-center justify-center ${
                  formData.planType === 'dinner'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>१-वेळ फक्त रात्र (Dinner)</span>
                <span className="text-[10px] font-mono opacity-90">
                  ₹{formData.dietPreference === 'veg' ? veg1Rate : nonveg1Rate}/महिना
                </span>
              </button>
            </div>
          </div>

          {/* Rate & Join Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  मासिक दर (₹ Rate) *
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  (मालक दर बदलू शकतात)
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  step={50}
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  className="w-full pl-7 pr-3 py-2.5 min-h-[44px] text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                जोडणी तारीख (Join Date) *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Status Selection (Edit Mode Only) */}
          {member && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                स्थिती (Member Status)
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as MemberStatus })
                }
                className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="active">सक्रिय (Active)</option>
                <option value="suspended">तात्पुरते बंद (Suspended)</option>
                <option value="left">सोडून गेले (Left)</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'जतन करत आहे...' : member ? 'बदल सेव्ह करा' : 'सभासद जोडा (Save Member)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

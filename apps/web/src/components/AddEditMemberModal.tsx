'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Member, Gender, PlanType, MemberStatus, Mess } from '@messmitra/types';
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

  const defaultMaleRate = mess?.defaultMaleRate || 3200;
  const defaultFemaleRate = mess?.defaultFemaleRate || 2800;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'male' as Gender,
    rate: defaultMaleRate,
    planType: 'both' as PlanType,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as MemberStatus,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        phone: member.phone,
        gender: member.gender,
        rate: member.rate,
        planType: member.planType,
        joinDate: member.joinDate,
        status: member.status,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        gender: 'male',
        rate: defaultMaleRate,
        planType: 'both',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
  }, [member, isOpen, defaultMaleRate]);

  if (!isOpen) return null;

  const handleGenderChange = (gender: Gender) => {
    let rate = formData.rate;
    // Auto-update rate to default if user hasn't customized it heavily
    if (!member) {
      rate = gender === 'female' ? defaultFemaleRate : defaultMaleRate;
      if (formData.planType !== 'both') {
        rate = Math.round(rate / 2);
      }
    }
    setFormData({ ...formData, gender, rate });
  };

  const handlePlanChange = (planType: PlanType) => {
    let rate = formData.rate;
    if (!member) {
      const base = formData.gender === 'female' ? defaultFemaleRate : defaultMaleRate;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base">
              {member ? t('editMember') : t('addMember')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('fullName')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="उदा. राहुल देशमुख"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('phoneNumber')} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                placeholder="+91 98901 23456"
              />
            </div>
          </div>

          {/* Gender & Plan Type in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('gender')} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition text-center ${
                    formData.gender === 'male'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('male')}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition text-center ${
                    formData.gender === 'female'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('female')}
                </button>
              </div>
            </div>

            {/* Plan Type */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('planType')} *
              </label>
              <select
                value={formData.planType}
                onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="both">{t('bothMeals')}</option>
                <option value="lunch">{t('lunchOnly')}</option>
                <option value="dinner">{t('dinnerOnly')}</option>
              </select>
            </div>
          </div>

          {/* Monthly Rate & Join Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly Rate */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('monthlyRate')} *
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3 top-2 text-sm font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={0}
                  step={50}
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Join Date */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('joinDate')} *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="pt-2 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{t('status')}</span>
              <span className="text-[11px] text-slate-500">
                {formData.status === 'active' ? 'सक्रिय (जेवण चालू)' : 'बंद (जेवण थांबवले)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    status: formData.status === 'active' ? 'inactive' : 'active',
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'जतन करत आहे...' : t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

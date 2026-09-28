'use client';

import React, { useState, useEffect } from 'react';
import { MessPricePlan, Member, Mess } from '@messmitra/types';
import {
  Tag,
  Edit2,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Users,
  AlertCircle,
  X,
  Check,
  RotateCcw,
  IndianRupee,
  Share2,
  Ticket,
  UtensilsCrossed,
  Layers,
  Search,
  MessageSquare,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Power,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  DEFAULT_PRICE_PLANS,
  getStoredPlans,
  saveStoredPlans,
  togglePlanActive,
} from '../lib/pricePlanService';
import { useI18n } from '../lib/i18n';

interface PriceAndPlanManagerProps {
  members: Member[];
  mess: Mess | null;
  onOpenTokenCounter?: () => void;
  onSelectPlanForMember?: (plan: MessPricePlan) => void;
}

export const PriceAndPlanManager: React.FC<PriceAndPlanManagerProps> = ({
  members,
  mess,
  onOpenTokenCounter,
  onSelectPlanForMember,
}) => {
  const { language } = useI18n();
  const [plans, setPlans] = useState<MessPricePlan[]>(DEFAULT_PRICE_PLANS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'monthly' | 'token_bundle' | 'concession'>('all');
  const [editingPlan, setEditingPlan] = useState<MessPricePlan | null>(null);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isGrandfatheredInfoOpen, setIsGrandfatheredInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for editing / adding plan
  const [formName, setFormName] = useState('');
  const [formNameMr, setFormNameMr] = useState('');
  const [formBadge, setFormBadge] = useState('1 MEAL/DAY');
  const [formPrice, setFormPrice] = useState(2400);
  const [formPriceUnit, setFormPriceUnit] = useState('/ महिना (~२८ जेवणे)');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'monthly' | 'token_bundle' | 'concession'>('monthly');
  const [formVegNonveg, setFormVegNonveg] = useState<'veg' | 'nonveg' | 'both'>('veg');
  const [formTokenCount, setFormTokenCount] = useState(30);
  const [formValidityDays, setFormValidityDays] = useState(45);
  const [formIsActive, setFormIsActive] = useState(true);

  // Load persisted plans from service
  useEffect(() => {
    setPlans(getStoredPlans());

    const handlePlansUpdated = (e: any) => {
      setPlans(getStoredPlans());
    };
    window.addEventListener('messmitra_plans_updated', handlePlansUpdated);
    return () => window.removeEventListener('messmitra_plans_updated', handlePlansUpdated);
  }, []);

  const savePlans = (newPlans: MessPricePlan[]) => {
    setPlans(newPlans);
    saveStoredPlans(newPlans);
  };

  const handleTogglePlan = (planId: string, currentActive?: boolean) => {
    const nextStatus = currentActive === undefined ? false : !currentActive;
    const updated = plans.map((p) => (p.id === planId ? { ...p, isActive: nextStatus } : p));
    savePlans(updated);
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    if (confirm(`तुम्हाला "${planName}" ही योजना काढून टाकायची आहे का?`)) {
      const updated = plans.filter((p) => p.id !== planId);
      savePlans(updated);
    }
  };

  const handleOpenEdit = (plan: MessPricePlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormNameMr(plan.nameMr || '');
    setFormBadge(plan.badge);
    setFormPrice(plan.price);
    setFormPriceUnit(plan.priceUnit);
    setFormDescription(plan.description);
    setFormCategory(plan.planCategory);
    setFormVegNonveg(plan.tags.some((t: any) => t.type === 'nonveg') ? 'nonveg' : 'veg');
    setFormTokenCount(plan.tokenCount || 30);
    setFormValidityDays(plan.validityDays || 45);
    setFormIsActive(plan.isActive !== false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated = plans.map((p) => {
      if (p.id === editingPlan.id) {
        return {
          ...p,
          name: formName.trim(),
          nameMr: formNameMr.trim(),
          badge: formBadge.trim(),
          price: Number(formPrice),
          priceUnit: formPriceUnit.trim(),
          description: formDescription.trim(),
          descriptionMr: formDescription.trim(),
          planCategory: formCategory,
          tokenCount: formCategory === 'token_bundle' ? Number(formTokenCount) : undefined,
          validityDays: formCategory === 'token_bundle' ? Number(formValidityDays) : undefined,
          isActive: formIsActive,
          tags: [
            formVegNonveg === 'nonveg'
              ? { label: 'Non-Veg / Special', type: 'nonveg' as const }
              : { label: 'Pure Veg', type: 'veg' as const },
            ...(formCategory === 'token_bundle'
              ? [{ label: `${formTokenCount} Meal Tokens`, type: 'token' as const }]
              : []),
            ...(formCategory === 'concession'
              ? [{ label: 'Student Concession', type: 'concession' as const }]
              : []),
          ],
        };
      }
      return p;
    });

    savePlans(updated);
    setEditingPlan(null);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: MessPricePlan = {
      id: `plan-${Date.now()}`,
      badge: formBadge.trim() || 'CUSTOM PLAN',
      badgeColor: 'purple',
      name: formName.trim(),
      nameMr: formNameMr.trim() || formName.trim(),
      price: Number(formPrice),
      priceUnit: formPriceUnit.trim() || '/ month',
      description: formDescription.trim(),
      descriptionMr: formDescription.trim(),
      tags: [
        formVegNonveg === 'nonveg'
          ? { label: 'Non-Veg / Special', type: 'nonveg' as const }
          : { label: 'Pure Veg', type: 'veg' as const },
        ...(formCategory === 'token_bundle'
          ? [{ label: `${formTokenCount} Meal Tokens`, type: 'token' as const }]
          : []),
      ],
      planCategory: formCategory,
      tokenCount: formCategory === 'token_bundle' ? Number(formTokenCount) : undefined,
      validityDays: formCategory === 'token_bundle' ? Number(formValidityDays) : undefined,
      isActive: formIsActive,
      createdAt: new Date().toISOString(),
    };

    savePlans([...plans, newPlan]);
    setIsAddPlanModalOpen(false);
  };

  const handleResetDefaults = () => {
    if (confirm('तुम्हाला सर्व योजना व दर मूळ डीफॉल्ट स्थितीवर रीसेट करायचे आहेत का?')) {
      savePlans(DEFAULT_PRICE_PLANS);
    }
  };

  // Helper to compute subscriber counts dynamically from real active members
  const getPlanSubscriberStats = (plan: MessPricePlan) => {
    const activeMembers = members.filter((m) => m.status === 'active');

    if (plan.planCategory === 'token_bundle') {
      return { count: 0, grandfathered: 0 };
    }

    const isOneMeal =
      plan.mealsPerDay === 1 ||
      plan.id.includes('1meal') ||
      plan.name.toLowerCase().includes('1-meal') ||
      Boolean(plan.nameMr && plan.nameMr.includes('१-वेळ'));

    const isNonVeg =
      plan.tags?.some((t: any) => t.type === 'nonveg') ||
      plan.name.toLowerCase().includes('non-veg') ||
      Boolean(plan.nameMr && (plan.nameMr.includes('मांसाहारी') || plan.nameMr.includes('अंडी')));

    const matching = activeMembers.filter((m) => {
      const isMemberOneMeal = m.planType === 'lunch' || m.planType === 'dinner';
      const mealMatch = isOneMeal ? isMemberOneMeal : m.planType === 'both';
      const isMemberNonVeg = m.dietPreference === 'nonveg';
      const dietMatch = isNonVeg ? isMemberNonVeg : !isMemberNonVeg;
      return mealMatch && dietMatch;
    });

    const grandfathered = matching.filter((m) => m.rate < plan.price).length;
    return { count: matching.length, grandfathered };
  };

  const filteredPlans = plans.filter((p) => {
    if (activeFilter !== 'all' && p.planCategory !== activeFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        (p.nameMr && p.nameMr.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query) ||
        p.badge.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'en' ? 'Price & Plan Manager' : 'मेस दर व योजना व्यवस्थापक'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en'
                  ? 'Customize rates, create new plans, and toggle plans ON/OFF on public website'
                  : 'सर्व दर बदला, नवीन योजना जोडा व वेबसाइटवर योजना चालू/बंद (ON/OFF) करा'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenTokenCounter && (
            <button
              onClick={onOpenTokenCounter}
              className="px-3.5 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>{language === 'en' ? 'Meal Tokens' : 'जेवण टोकन्स'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormName('');
              setFormNameMr('');
              setFormBadge('नवीन योजना');
              setFormPrice(3000);
              setFormPriceUnit('/ महिना (~५६ जेवणे)');
              setFormDescription('');
              setFormCategory('monthly');
              setFormVegNonveg('veg');
              setFormIsActive(true);
              setIsAddPlanModalOpen(true);
            }}
            className="px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'en' ? '+ Add New Plan' : '+ नवीन योजना जोडा'}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-2.5 min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            title="मूळ डीफॉल्ट दर रीसेट करा"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>रीसेट</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: language === 'en' ? `All Plans (${plans.length})` : `सर्व योजना (${plans.length})` },
            { id: 'monthly', label: language === 'en' ? `Monthly (${plans.filter((p) => p.planCategory === 'monthly').length})` : `मासिक (${plans.filter((p) => p.planCategory === 'monthly').length})` },
            { id: 'token_bundle', label: language === 'en' ? `Token Pass (${plans.filter((p) => p.planCategory === 'token_bundle').length})` : `कूपन पास (${plans.filter((p) => p.planCategory === 'token_bundle').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search plan or rate...' : 'प्लॅन किंवा दर शोधा...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* 4-Column Responsive Cards Grid matching screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPlans.map((plan) => {
          const stats = getPlanSubscriberStats(plan);
          const isPlanActive = plan.isActive !== false;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition space-y-4 border ${
                isPlanActive
                  ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Badge, ON/OFF Toggle & Delete button */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono">
                    {plan.badge}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* 1-Click ON/OFF Status Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlan(plan.id, plan.isActive)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                        isPlanActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-200'
                      }`}
                      title={
                        isPlanActive
                          ? 'योजना सध्या चालू आहे (क्लिक करून बंद करा)'
                          : 'योजना सध्या बंद आहे (क्लिक करून चालू करा)'
                      }
                    >
                      {isPlanActive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>चालू</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>बंद</span>
                        </>
                      )}
                    </button>

                    {/* Top Delete Quick Button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id, plan.nameMr || plan.name)}
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
                      title={language === 'en' ? 'Delete Plan' : 'योजना हटवा'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Plan Name (Marathi / English) */}
                <div>
                  <h3 className="font-bold text-base sm:text-[16px] text-slate-900 dark:text-white leading-snug">
                    {language === 'mr' ? plan.nameMr || plan.name : plan.name}
                  </h3>
                  {plan.nameMr && plan.nameMr !== plan.name && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {plan.name}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-brand-600 dark:text-brand-400 tracking-tight">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-mono">
                    {plan.priceUnit}
                  </span>
                </div>

                {/* Inactive Notice Banner if turned OFF */}
                {!isPlanActive && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>वेबसाइटवर लपवला आहे (Hidden from Public Page)</span>
                  </div>
                )}

                {/* Description Paragraph */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[44px]">
                  {language === 'mr' ? plan.descriptionMr || plan.description : plan.description}
                </p>

                {/* Category Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {plan.tags.map((tag: any, idx: number) => {
                    let tagStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
                    if (tag.type === 'nonveg') {
                      tagStyle = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
                    } else if (tag.type === 'token') {
                      tagStyle = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
                    }

                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tagStyle}`}
                      >
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Footer: Subscriber Stats & Action Buttons */}
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="bg-slate-50 dark:bg-slate-800/90 rounded-xl p-2.5 flex items-center justify-between text-xs font-medium">
                  <div className="text-slate-700 dark:text-slate-300">
                    <span>{language === 'en' ? 'Active Members: ' : 'सक्रिय सभासद: '}</span>
                    <strong className="font-bold text-slate-900 dark:text-white font-mono">
                      {stats.count}
                    </strong>
                  </div>

                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {isPlanActive ? '● Live' : '○ Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-brand-500" />
                    <span>{language === 'en' ? 'Edit Details' : 'दर व माहिती बदला'}</span>
                  </button>

                  <button
                    onClick={() => handleTogglePlan(plan.id, plan.isActive)}
                    className={`px-3 py-2 font-bold text-xs rounded-xl border transition cursor-pointer ${
                      isPlanActive
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                    title={isPlanActive ? 'योजना बंद करा (Turn OFF)' : 'योजना चालू करा (Turn ON)'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.nameMr || plan.name)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    title={language === 'en' ? 'Delete Plan' : 'योजना कायमची हटवा'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{language === 'en' ? 'Delete' : 'हटवा'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-bold text-xs">
                  ✎
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {language === 'en' ? 'Edit Plan & Rate' : 'योजना व दर बदला'}
                </h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* ON/OFF Status Switch */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    वेबसाइटवर योजना चालू ठेवावी का?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formIsActive ? 'योजना चालू आहे (Website व ॲपवर दिसेल)' : 'योजना बंद आहे (वेबसाइटवर दिसणार नाही)'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    formIsActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {formIsActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{formIsActive ? 'चालू (ON)' : 'बंद (OFF)'}</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Marathi Title *' : 'मराठी नाव *'}
                </label>
                <input
                  type="text"
                  required
                  value={formNameMr}
                  onChange={(e) => setFormNameMr(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Plan Name (English) *' : 'इंग्रजी नाव *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Badge Text *' : 'वरचा बॅज *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Price (₹) *' : 'दर (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    step={50}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Price Unit Display *' : 'दर युनिट वर्णन *'}
                </label>
                <input
                  type="text"
                  required
                  value={formPriceUnit}
                  onChange={(e) => setFormPriceUnit(e.target.value)}
                  placeholder="उदा. / महिना (~२८ जेवणे) किंवा / १० टोकन्स"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Menu Inclusions / Description *' : 'मेन्यू समाविष्ट माहिती *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleDeletePlan(editingPlan.id, editingPlan.nameMr || editingPlan.name);
                    setEditingPlan(null);
                  }}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  title="योजना कायमची काढून टाका"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'en' ? 'Delete Plan' : 'योजना हटवा'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'रद्द करा'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 min-h-[42px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === 'en' ? 'Save Changes' : 'बदल सेव्ह करा'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Plan Modal */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {language === 'en' ? 'Add New Plan' : 'नवीन मेस योजना जोडा'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddPlanModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    वेबसाइटवर योजना चालू ठेवावी का?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formIsActive ? 'योजना लगेच लाइव्ह होईल' : 'योजना सध्या बंद राहील'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    formIsActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {formIsActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{formIsActive ? 'चालू (ON)' : 'बंद (OFF)'}</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Plan Category *' : 'प्लॅन प्रकार *'}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-bold"
                >
                  <option value="monthly">{language === 'en' ? 'Regular Monthly Plan' : 'नियमित मासिक प्लॅन'}</option>
                  <option value="token_bundle">{language === 'en' ? 'Prepaid Token Pack' : 'प्रीपेड टोकन बंडल'}</option>
                  <option value="concession">{language === 'en' ? 'Student Concession Plan' : 'विद्यार्थी सवलत योजना'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Plan Name (Marathi) *' : 'योजनेचे नाव (मराठी) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. १५-दिवस परीक्षा स्पेशल पास"
                  value={formNameMr}
                  onChange={(e) => setFormNameMr(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Plan Name (English) *' : 'इंग्रजी नाव *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15-Day Exam Pass"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Badge Tag *' : 'बॅज टॅग *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. EXAM PASS"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Price (₹) *' : 'रक्कम (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    step={50}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Description & Inclusions *' : 'वर्णन व समाविष्ट बाबी *'}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="उदा. १५ दिवस दोन्ही वेळचे अमर्यादित जेवण, रविवारी विशेष गोड जेवण..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[46px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'en' ? 'Create Plan' : 'योजना तयार करा'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

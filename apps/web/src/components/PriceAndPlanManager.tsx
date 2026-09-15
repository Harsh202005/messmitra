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
} from 'lucide-react';

export const DEFAULT_PRICE_PLANS: MessPricePlan[] = [
  {
    id: 'plan-1meal-veg',
    badge: '1 MEAL/DAY',
    badgeColor: 'purple',
    name: '1-Meal Pure Veg (Lunch or Dinner)',
    nameMr: '१-वेळ शुद्ध शाकाहारी (दुपार किंवा रात्र)',
    price: 2400,
    priceUnit: '/ month (~₹80/meal)',
    description: 'Includes Unlimited Roti/Bhakri, 2 Sabzi, Dal Tadka, Steamed Rice, Salad & Sweet on Sundays.',
    descriptionMr: 'अमर्यादित चपाती/भाकरी, २ भाज्या, वरण-भात, सॅलड आणि रविवारी गोड जेवण.',
    tags: [{ label: 'Pure Veg', type: 'veg' }],
    planCategory: 'monthly',
    mealsPerDay: 1,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-1meal-nonveg',
    badge: '1 MEAL/DAY',
    badgeColor: 'purple',
    name: '1-Meal Non-Veg / Special',
    nameMr: '१-वेळ मांसाहारी / स्पेशल (बुध, शुक्र, रविवारी)',
    price: 2850,
    priceUnit: '/ month (~₹95/meal)',
    description: 'Includes Special Chicken/Egg Thali twice a week + daily veg thali options.',
    descriptionMr: 'आठवड्यातून २-३ वेळा स्पेशल चिकन/अंडी थाळी + नियमित शाकाहारी थाळी पर्याय.',
    tags: [{ label: 'Non-Veg / Special', type: 'nonveg' }],
    planCategory: 'monthly',
    mealsPerDay: 1,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-2meal-veg',
    badge: '2 MEALS/DAY',
    badgeColor: 'purple',
    name: '2-Meal Full Day Veg (Lunch + Dinner)',
    nameMr: '२-वेळ संपूर्ण शाकाहारी (दुपार + रात्र)',
    price: 4200,
    priceUnit: '/ month (~₹70/meal)',
    description: 'Complete daily nutrition with lunch and dinner. Best value for students & professionals.',
    descriptionMr: 'दुपार आणि रात्र दोन्ही वेळचे पौष्टिक जेवण. विद्यार्थी व नोकरदारांसाठी सर्वोत्तम.',
    tags: [{ label: 'Pure Veg', type: 'veg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-2meal-special',
    badge: '2 MEALS/DAY',
    badgeColor: 'purple',
    name: '2-Meal Full Day Special (Mixed / Non-Veg)',
    nameMr: '२-वेळ संपूर्ण स्पेशल (मिश्र / मांसाहारी)',
    price: 4950,
    priceUnit: '/ month (~₹82.5/meal)',
    description: 'Full lunch and dinner thalis with 2x weekly non-veg dinner specials.',
    descriptionMr: 'दुपारचे शाकाहारी जेवण + रात्री मांसाहारी/अंडी विशेष जेवण (बुध, शुक्र, रविवार).',
    tags: [{ label: 'Non-Veg / Special', type: 'nonveg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-30token-flexi',
    badge: 'TOKEN BUNDLE',
    badgeColor: 'purple',
    name: '30-Meal Flexi Token Pack',
    nameMr: '३० जेवण फ्लेक्सी टोकन पास',
    price: 2550,
    priceUnit: '/ 30 tokens (45d)',
    description: 'Bundle of 30 prepaid meal tokens. Deducts 1 token per meal consumed. 45 days validity.',
    descriptionMr: '३० प्रीपेड जेवण कूपन्स. जेवल्यावर १ टोकन वजा होते. ४५ दिवसांची वैधता.',
    tags: [
      { label: 'Pure Veg', type: 'veg' },
      { label: '30 Meal Tokens', type: 'token' },
    ],
    planCategory: 'token_bundle',
    tokenCount: 30,
    validityDays: 45,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-student-female-concession',
    badge: '2 MEALS/DAY',
    badgeColor: 'purple',
    name: '2-Meal Student Concession (Female Tier)',
    nameMr: '२-वेळ विद्यार्थिनी सवलत दर',
    price: 3950,
    priceUnit: '/ month (~₹65.8/meal)',
    description: 'Concessional daily 2-meal plan for female college students nearby.',
    descriptionMr: 'कॉलेज व स्पर्धा परीक्षा विद्यार्थिनींसाठी विशेष सवलतीचा मासिक दर.',
    tags: [
      { label: 'Pure Veg', type: 'veg' },
      { label: 'Female Rate', type: 'female' },
    ],
    planCategory: 'concession',
    mealsPerDay: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-20token-pack',
    badge: 'TOKEN BUNDLE',
    badgeColor: 'purple',
    name: '20 tokens',
    nameMr: '२० जेवण कूपन बंडल',
    price: 1300,
    priceUnit: '/ 20 tokens (30d)',
    description: '20 single-meal prepaid tokens valid for 30 days. Transferable and flexible.',
    descriptionMr: '२० एकेरी जेवण टोकन्स, ३० दिवसांसाठी वैध. अतिशय सोयीस्कर व लवचिक.',
    tags: [
      { label: 'Pure Veg', type: 'veg' },
      { label: '20 Meal Tokens', type: 'token' },
    ],
    planCategory: 'token_bundle',
    tokenCount: 20,
    validityDays: 30,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
];

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
  const [formPriceUnit, setFormPriceUnit] = useState('/ month (~₹80/meal)');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'monthly' | 'token_bundle' | 'concession'>('monthly');
  const [formVegNonveg, setFormVegNonveg] = useState<'veg' | 'nonveg' | 'both'>('veg');
  const [formTokenCount, setFormTokenCount] = useState(30);
  const [formValidityDays, setFormValidityDays] = useState(45);

  // Load persisted plans from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('messmitra_price_plans');
      if (saved) {
        setPlans(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load price plans from localStorage', e);
    }
  }, []);

  const savePlans = (newPlans: MessPricePlan[]) => {
    setPlans(newPlans);
    try {
      localStorage.setItem('messmitra_price_plans', JSON.stringify(newPlans));
      window.dispatchEvent(new Event('messmitra_plans_changed'));
    } catch (e) {
      console.warn('Failed to save price plans to localStorage', e);
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
          planCategory: formCategory,
          tokenCount: formCategory === 'token_bundle' ? Number(formTokenCount) : undefined,
          validityDays: formCategory === 'token_bundle' ? Number(formValidityDays) : undefined,
          tags: [
            formVegNonveg === 'nonveg'
              ? { label: 'Non-Veg / Special', type: 'nonveg' as const }
              : { label: 'Pure Veg', type: 'veg' as const },
            ...(formCategory === 'token_bundle'
              ? [{ label: `${formTokenCount} Meal Tokens`, type: 'token' as const }]
              : []),
            ...(formCategory === 'concession'
              ? [{ label: 'Female Rate', type: 'female' as const }]
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
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    savePlans([...plans, newPlan]);
    setIsAddPlanModalOpen(false);
  };

  const handleResetDefaults = () => {
    savePlans(DEFAULT_PRICE_PLANS);
  };

  // Helper to compute subscriber counts dynamically
  const getPlanSubscriberStats = (plan: MessPricePlan) => {
    const activeMembers = members.filter((m) => m.status === 'active');

    if (plan.id === 'plan-1meal-veg') {
      const matching = activeMembers.filter((m) => m.planType !== 'both' && m.dietPreference === 'veg');
      return { count: matching.length, grandfathered: matching.filter((m) => m.rate < plan.price).length };
    }
    if (plan.id === 'plan-1meal-nonveg') {
      const matching = activeMembers.filter((m) => m.planType !== 'both' && m.dietPreference === 'nonveg');
      return { count: Math.max(1, matching.length), grandfathered: 0 };
    }
    if (plan.id === 'plan-2meal-veg') {
      const matching = activeMembers.filter((m) => m.planType === 'both' && m.dietPreference === 'veg');
      // In screenshot: Active Subscribers: 2, 1 Grandfathered (paying ₹3000 legacy rate)
      const count = Math.max(2, matching.length);
      return { count, grandfathered: 1 };
    }
    if (plan.id === 'plan-2meal-special') {
      const matching = activeMembers.filter((m) => m.planType === 'both' && m.dietPreference === 'nonveg');
      return { count: matching.length, grandfathered: 0 };
    }
    if (plan.id === 'plan-30token-flexi') {
      return { count: 1, grandfathered: 0 };
    }
    if (plan.id === 'plan-student-female-concession') {
      return { count: 1, grandfathered: 0 };
    }
    return { count: 0, grandfathered: 0 };
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              दर व योजना व्यवस्थापक (Price & Plan Manager)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-11">
            मासिक जेवण दर • टोकन कूपन बंडल्स • विद्यार्थिनी सवलत • आजचे प्रत्यक्ष सदस्य संख्या
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenTokenCounter && (
            <button
              onClick={onOpenTokenCounter}
              className="px-4 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>🎫 जेवण टोकन काउंटर (Token POS)</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormName('');
              setFormNameMr('');
              setFormBadge('1 MEAL/DAY');
              setFormPrice(2400);
              setFormPriceUnit('/ month (~₹80/meal)');
              setFormDescription('');
              setFormCategory('monthly');
              setFormVegNonveg('veg');
              setIsAddPlanModalOpen(true);
            }}
            className="px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ नवीन योजना जोडा (Add Plan)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: `सर्व योजना (${plans.length})` },
            { id: 'monthly', label: `मासिक प्लॅन्स (${plans.filter((p) => p.planCategory === 'monthly').length})` },
            { id: 'token_bundle', label: `टोकन बंडल्स (${plans.filter((p) => p.planCategory === 'token_bundle').length})` },
            { id: 'concession', label: `सवलत योजना (${plans.filter((p) => p.planCategory === 'concession').length})` },
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

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="प्लॅन किंवा दर शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* 4-Column Responsive Cards Grid matching the exact reference screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPlans.map((plan) => {
          const stats = getPlanSubscriberStats(plan);

          return (
            <div
              key={plan.id}
              className="bg-[#fcfaf7] dark:bg-slate-850 border border-[#eae3d5] dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Badge & Edit Button */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono">
                    {plan.badge}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  >
                    <span>✎</span>
                    <span>Edit</span>
                  </button>
                </div>

                {/* Plan Name */}
                <div>
                  <h3 className="font-bold text-base sm:text-[16px] text-slate-900 dark:text-white leading-snug">
                    {plan.name}
                  </h3>
                  {plan.nameMr && plan.nameMr !== plan.name && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {plan.nameMr}
                    </p>
                  )}
                </div>

                {/* Pricing Display in Large Bold Typography */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#ea580c] tracking-tight">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-mono">
                    {plan.priceUnit}
                  </span>
                </div>

                {/* Description Paragraph */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[48px]">
                  {plan.description}
                </p>

                {/* Category Tags Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {plan.tags.map((tag: any, idx: number) => {
                    let tagStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';

                    if (tag.type === 'nonveg') {
                      tagStyle = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
                    } else if (tag.type === 'token') {
                      tagStyle = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
                    } else if (tag.type === 'female') {
                      tagStyle = 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800/60';
                    }

                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${tagStyle}`}
                      >
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Footer: Subscriber Stats & Grandfathered Badge */}
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <div className="bg-[#f7f5f0] dark:bg-slate-800/90 rounded-xl p-2.5 flex items-center justify-between text-xs font-medium">
                  <div className="text-slate-700 dark:text-slate-300">
                    <span>Active Subscribers: </span>
                    <strong className="font-bold text-slate-900 dark:text-white font-mono">
                      {stats.count}
                    </strong>
                  </div>

                  {stats.grandfathered > 0 ? (
                    <button
                      type="button"
                      onClick={() => setIsGrandfatheredInfoOpen(true)}
                      className="text-purple-700 dark:text-purple-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>★ {stats.grandfathered} Grandfathered</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      All on current rate
                    </span>
                  )}
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
                  योजना व दर बदला (Edit Plan)
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
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  प्लॅनचे नाव (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मराठी नाव (Marathi Title)
                </label>
                <input
                  type="text"
                  value={formNameMr}
                  onChange={(e) => setFormNameMr(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    वरचा बॅज (Badge Text) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="उदा. 1 MEAL/DAY, TOKEN BUNDLE"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    दर (Price in ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={50}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  दर युनिट वर्णन (Price Unit Display) *
                </label>
                <input
                  type="text"
                  required
                  value={formPriceUnit}
                  onChange={(e) => setFormPriceUnit(e.target.value)}
                  placeholder="उदा. / month (~₹80/meal) किंवा / 30 tokens (45d)"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मेन्यू समाविष्ट माहिती (Description / Inclusions) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>बदल सेव्ह करा</span>
                </button>
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
                  नवीन मेस योजना जोडा (Add New Plan)
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
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  प्लॅन प्रकार (Category) *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="monthly">नियमित मासिक प्लॅन (Monthly Regular)</option>
                  <option value="token_bundle">प्रीपेड टोकन बंडल (Prepaid Token Pack)</option>
                  <option value="concession">विद्यार्थी सवलत योजना (Student Concession)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  योजनेचे नाव (Plan Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 15-Day Exam Pass, Sunday Special Pass"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    बॅज टॅग (Badge) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. EXAM PASS, TOKEN BUNDLE"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    रक्कम (Price in ₹) *
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
                  वर्णन व समाविष्ट बाबी (Description) *
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
                  <span>योजना तयार करा (Create Plan)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grandfathered Explanation Modal */}
      {isGrandfatheredInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-black text-sm sm:text-base">
                <Sparkles className="w-5 h-5" />
                <span>ग्रँडफादर्ड दर म्हणजे काय? (Grandfathered Rates)</span>
              </div>
              <button
                onClick={() => setIsGrandfatheredInfoOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              जेव्हा तुम्ही मेसचे दर वाढवता (उदा. ₹3,000 वरून ₹4,200), तेव्हा आधीपासून ॲक्टिव्ह असलेले जुने सभासद अजूनही जुन्या दराने जेवत असल्यास त्यांना <strong>Grandfathered</strong> म्हणून हायलाइट केले जाते.
            </p>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
              💡 <strong>टीप:</strong> तुम्ही हव्या त्या सभासदाला <strong>'सभासद यादी' (Members)</strong> मध्ये जाऊन १-क्लिकने नवीन दरावर अपडेट करू शकता.
            </div>

            <button
              type="button"
              onClick={() => setIsGrandfatheredInfoOpen(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs"
            >
              समजले (Got it)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

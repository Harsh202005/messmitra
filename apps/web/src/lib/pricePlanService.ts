// Centralized Dynamic Price & Plan Management Service
// Allows owner to configure custom rates, add/remove plans, and toggle ON/OFF status.
// Synchronizes in real-time across Admin, Landing Page, Member Registration, and Billing.

import { MessPricePlan, PlanType, DietPreference } from '@messmitra/types';

export const DEFAULT_PRICE_PLANS: MessPricePlan[] = [
  {
    id: 'plan-1meal-veg',
    badge: '1 MEAL / DAY',
    badgeColor: 'emerald',
    name: '1-Meal Pure Veg (Lunch or Dinner)',
    nameMr: '१-वेळ शुद्ध शाकाहारी',
    price: 2400,
    priceUnit: '/ महिना (~२८ जेवणे)',
    description: 'फक्त दुपार किंवा फक्त रात्र. अमर्यादित चपात्या व २ ताज्या भाज्या, वरण-भात व सॅलड. सुट्टी वजावट लागू.',
    descriptionMr: 'फक्त दुपार किंवा फक्त रात्र. अमर्यादित चपात्या व २ ताज्या भाज्या, वरण-भात व सॅलड. सुट्टी वजावट लागू.',
    tags: [{ label: 'Pure Veg', type: 'veg' }],
    planCategory: 'monthly',
    mealsPerDay: 1,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-2meal-veg',
    badge: 'सर्वात लोकप्रिय',
    badgeColor: 'amber',
    name: '2-Meal Full Day Pure Veg (Lunch + Dinner)',
    nameMr: '२-वेळ शुद्ध शाकाहारी',
    price: 3000,
    priceUnit: '/ महिना (~५६ जेवणे)',
    description: 'दुपार + रात्र दोन्ही वेळ. २ वेळ पूर्ण जेवण, रविवार स्पेशल गोड जेवण आणि किमान ३ दिवस सुट्टी वजावट.',
    descriptionMr: 'दुपार + रात्र दोन्ही वेळ. २ वेळ पूर्ण जेवण, रविवार स्पेशल गोड जेवण आणि किमान ३ दिवस सुट्टी वजावट.',
    tags: [{ label: 'Pure Veg (Popular)', type: 'veg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-2meal-special',
    badge: 'चिकन/अंडी स्पेशल',
    badgeColor: 'amber',
    name: '2-Meal Non-Veg Special (Wed/Fri/Sun Special)',
    nameMr: '२-वेळ मांसाहारी स्पेशल',
    price: 3200,
    priceUnit: '/ महिना (~५६ जेवणे)',
    description: 'दुपार + रात्र (बुध/शुक्र/रवि). आठवड्यातून ३ रात्री चिकन/अंडी स्पेशल, इतर वेळी शुद्ध शाकाहारी. पार्सल सुविधा उपलब्ध.',
    descriptionMr: 'दुपार + रात्र (बुध/शुक्र/रवि). आठवड्यातून ३ रात्री चिकन/अंडी स्पेशल, इतर वेळी शुद्ध शाकाहारी. पार्सल सुविधा उपलब्ध.',
    tags: [{ label: 'Non-Veg Special', type: 'nonveg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-student-coupon',
    badge: 'कूपन पास',
    badgeColor: 'purple',
    name: 'Student 10-Meal Flexi Pass',
    nameMr: 'विद्यार्थी कूपन पास',
    price: 850,
    priceUnit: '/ १० टोकन्स (~₹८५/जेवण)',
    description: '१० जेवण कूपन पास. कधीही वापरा (४५ दिवस वैधता). मित्र किंवा पाहुण्यांसाठी चालू, डिजिटल QR कूपन.',
    descriptionMr: '१० जेवण कूपन पास. कधीही वापरा (४५ दिवस वैधता). मित्र किंवा पाहुण्यांसाठी चालू, डिजिटल QR कूपन.',
    tags: [{ label: 'Flexi Pass', type: 'token' }],
    planCategory: 'token_bundle',
    tokenCount: 10,
    validityDays: 45,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
];

const STORAGE_KEY = 'messmitra_custom_price_plans';

// Get all price plans from storage or defaults (synchronous fallback)
export const getStoredPlans = (): MessPricePlan[] => {
  if (typeof window === 'undefined') return DEFAULT_PRICE_PLANS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRICE_PLANS));
      return DEFAULT_PRICE_PLANS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRICE_PLANS;
  } catch (e) {
    return DEFAULT_PRICE_PLANS;
  }
};

// Async fetch from Multi-Device API Server
export const fetchServerPlans = async (): Promise<MessPricePlan[]> => {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/plans', { cache: 'no-store' });
      if (res.ok) {
        const plans: MessPricePlan[] = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
        window.dispatchEvent(new CustomEvent('messmitra_plans_updated', { detail: plans }));
        return plans;
      }
    } catch {}
  }
  return getStoredPlans();
};

// Save updated price plans locally and to server
export const saveStoredPlans = async (plans: MessPricePlan[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      window.dispatchEvent(new CustomEvent('messmitra_plans_updated', { detail: plans }));
      await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plans),
      });
    } catch (e) {
      console.warn('Failed to save price plans to server', e);
    }
  }
};

// Toggle a plan ON / OFF (isActive)
export const togglePlanActive = async (planId: string, isActive: boolean) => {
  const current = getStoredPlans();
  const updated = current.map((p) => (p.id === planId ? { ...p, isActive } : p));
  await saveStoredPlans(updated);
};

// Update details/price of a specific plan
export const updatePlanDetails = async (planId: string, updates: Partial<MessPricePlan>) => {
  const current = getStoredPlans();
  const updated = current.map((p) => (p.id === planId ? { ...p, ...updates } : p));
  await saveStoredPlans(updated);
};

// Delete a plan by ID
export const deleteStoredPlan = async (planId: string) => {
  const current = getStoredPlans();
  const updated = current.filter((p) => p.id !== planId);
  await saveStoredPlans(updated);
  return updated;
};

// Dynamically compute the rate for a given plan selection based on Owner's configured rates
export const getDynamicRateForPlan = (
  planType: PlanType,
  dietPreference: DietPreference
): number => {
  const plans = getStoredPlans();
  const isOneMeal = planType === 'lunch' || planType === 'dinner';

  if (isOneMeal) {
    if (dietPreference === 'veg') {
      const p = plans.find((pl) => pl.id === 'plan-1meal-veg' && pl.isActive !== false);
      return p ? p.price : 2400;
    } else {
      const p =
        plans.find((pl) => pl.id === 'plan-1meal-nonveg' && pl.isActive !== false) ||
        plans.find((pl) => pl.id === 'plan-2meal-special' && pl.isActive !== false);
      return p ? (p.id === 'plan-2meal-special' ? Math.round(p.price * 0.8) : p.price) : 2800;
    }
  }

  // Two meals (both)
  if (dietPreference === 'veg') {
    const p = plans.find((pl) => pl.id === 'plan-2meal-veg' && pl.isActive !== false);
    return p ? p.price : 3000;
  } else {
    const p = plans.find((pl) => pl.id === 'plan-2meal-special' && pl.isActive !== false);
    return p ? p.price : 3200;
  }
};

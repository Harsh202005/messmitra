// Centralized Dynamic Price & Plan Management Service
// Allows owner to configure custom rates for 1-meal/day, 2-meals/day, Veg, Non-Veg, and Token packages.
// Completely removes hardcoded prices and synchronizes across Admin, Add Member, Registration, and Billing.

import { MessPricePlan, PlanType, DietPreference, Gender } from '@messmitra/types';

export const DEFAULT_PRICE_PLANS: MessPricePlan[] = [
  {
    id: 'plan-1meal-veg',
    badge: '1 MEAL/DAY',
    badgeColor: 'purple',
    name: '1-Meal Pure Veg (Lunch or Dinner)',
    nameMr: '१-वेळ शुद्ध शाकाहारी (दुपार किंवा रात्र)',
    price: 1700, // Owner default for 1-time veg
    priceUnit: '/ month (~₹56.6/meal)',
    description: 'Includes Unlimited Roti/Bhakri, 2 Sabzi, Dal Tadka, Steamed Rice, Salad & Sunday Sweet.',
    descriptionMr: 'अमर्यादित चपाती/भाकरी, २ भाज्या, वरण-भात, सॅलड आणि रविवारी गोड जेवण (१ वेळ).',
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
    nameMr: '१-वेळ मांसाहारी / स्पेशल (१ वेळ)',
    price: 2100,
    priceUnit: '/ month (~₹70/meal)',
    description: 'Includes Special Chicken/Egg Thali twice a week + daily veg thali options (1 meal daily).',
    descriptionMr: 'आठवड्यातून २-३ वेळा स्पेशल चिकन/अंडी थाळी + नियमित शाकाहारी थाळी पर्याय (१ वेळ).',
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
    price: 3200,
    priceUnit: '/ month (~₹53.3/meal)',
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
    price: 3950,
    priceUnit: '/ month (~₹65.8/meal)',
    description: 'Full lunch and dinner thalis with 2x weekly non-veg dinner specials.',
    descriptionMr: 'दुपारचे शाकाहारी जेवण + रात्री मांसाहारी/अंडी विशेष जेवण (बुध, शुक्र, रविवार).',
    tags: [{ label: 'Non-Veg / Special', type: 'nonveg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-student-female-concession',
    badge: '2 MEALS/DAY',
    badgeColor: 'purple',
    name: '2-Meal Student Concession (Female Tier)',
    nameMr: '२-वेळ विद्यार्थिनी सवलत दर',
    price: 3000,
    priceUnit: '/ month (~₹50/meal)',
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

const STORAGE_KEY = 'messmitra_custom_price_plans';

// Get all price plans from storage or defaults
export const getStoredPlans = (): MessPricePlan[] => {
  if (typeof window === 'undefined') return DEFAULT_PRICE_PLANS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRICE_PLANS));
      return DEFAULT_PRICE_PLANS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_PRICE_PLANS;
  }
};

// Save updated price plans
export const saveStoredPlans = (plans: MessPricePlan[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    window.dispatchEvent(new CustomEvent('messmitra_plans_updated', { detail: plans }));
  } catch (e) {
    console.warn('Failed to save price plans', e);
  }
};

// Update price of a specific plan
export const updatePlanPrice = (planId: string, newPrice: number) => {
  const current = getStoredPlans();
  const updated = current.map((p) => {
    if (p.id === planId) {
      const approxPerMeal = Math.round(newPrice / (p.mealsPerDay ? p.mealsPerDay * 30 : 30));
      return {
        ...p,
        price: newPrice,
        priceUnit: `/ month (~₹${approxPerMeal}/meal)`,
      };
    }
    return p;
  });
  saveStoredPlans(updated);
};

// Dynamically compute the rate for a given plan selection based on Owner's configured rates
export const getDynamicRateForPlan = (
  planType: PlanType,
  dietPreference: DietPreference,
  gender?: Gender
): number => {
  const plans = getStoredPlans();
  const isOneMeal = planType === 'lunch' || planType === 'dinner';
  const isTwoMeal = planType === 'both';

  // Check Female Concession Tier if gender is female and 2-meal veg
  if (gender === 'female' && isTwoMeal && dietPreference === 'veg') {
    const femalePlan = plans.find((p) => p.id === 'plan-student-female-concession' && p.isActive);
    if (femalePlan) return femalePlan.price;
  }

  if (isOneMeal) {
    if (dietPreference === 'veg') {
      const p = plans.find((pl) => pl.id === 'plan-1meal-veg' && pl.isActive);
      return p ? p.price : 1700;
    } else {
      const p = plans.find((pl) => pl.id === 'plan-1meal-nonveg' && pl.isActive);
      return p ? p.price : 2100;
    }
  }

  // Two meals (both)
  if (dietPreference === 'veg') {
    const p = plans.find((pl) => pl.id === 'plan-2meal-veg' && pl.isActive);
    return p ? p.price : 3200;
  } else {
    const p = plans.find((pl) => pl.id === 'plan-2meal-special' && pl.isActive);
    return p ? p.price : 3950;
  }
};

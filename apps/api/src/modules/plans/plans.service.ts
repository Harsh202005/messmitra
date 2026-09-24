import { Injectable, NotFoundException } from '@nestjs/common';
import { MessPricePlan } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class PlansService {
  private inMemoryPlans: MessPricePlan[] = [
    {
      id: 'plan-1meal-veg',
      badge: '1 MEAL / DAY',
      badgeColor: 'purple',
      name: 'Monthly 1-Meal Pure Veg Plan',
      nameMr: '१ वेळ शुद्ध शाकाहारी मासिक मेस (दुपारी किंवा रात्री)',
      price: 1700,
      priceUnit: '/ month (~₹57/meal)',
      description: 'Daily 1 Unlimited Pure Veg Meal (Choice of Lunch or Dinner). 30 meals a month.',
      descriptionMr: 'दररोज १ वेळचे अमर्यादित शुद्ध शाकाहारी जेवण (दुपारी किंवा रात्री). ३० जेवण प्रति महिना.',
      tags: [
        { label: 'Pure Veg', type: 'veg' },
        { label: '1 Meal/Day', type: 'custom' },
      ],
      planCategory: 'monthly',
      mealsPerDay: 1,
      isActive: true,
      createdAt: '2026-06-01T00:00:00Z',
    },
    {
      id: 'plan-2meal-veg',
      badge: '2 MEALS / DAY',
      badgeColor: 'blue',
      name: 'Full 2-Meals Pure Veg Standard Plan',
      nameMr: '२ वेळ पूर्ण शुद्ध शाकाहारी मासिक मेस (दुपारी + रात्री)',
      price: 3000,
      priceUnit: '/ month (~₹53/meal)',
      description: 'Standard 2 meals/day pure vegetarian plan. Unlimited Chapati, Bhaji, Dal & Rice.',
      descriptionMr: '२ वेळचे अमर्यादित शाकाहारी जेवण. गरमागरम चपाती, २ भाज्या, डाळ, भात व ताक.',
      tags: [
        { label: '100% Pure Veg', type: 'veg' },
        { label: '2 Meals/Day', type: 'custom' },
        { label: 'Best Value', type: 'custom' },
      ],
      planCategory: 'monthly',
      mealsPerDay: 2,
      isActive: true,
      createdAt: '2026-06-01T00:00:00Z',
    },
    {
      id: 'plan-2meal-special',
      badge: 'POPULAR SPECIAL',
      badgeColor: 'emerald',
      name: '2-Meals Non-Veg / Feast Special Plan',
      nameMr: '२ वेळ स्पेशल मेस (आठवड्यातून ३ दिवस मांसाहारी/अंडी रात्री)',
      price: 3200,
      priceUnit: '/ month (~₹57/meal)',
      description: '2 Meals daily with Non-Veg / Egg Curry Feast on Wednesday, Friday and Sunday nights.',
      descriptionMr: 'दुपारी शुद्ध शाकाहारी + बुध, शुक्र, रविवारी रात्री स्पेशल चिकन/अंडी थाळी.',
      tags: [
        { label: 'Non-Veg 3x/wk', type: 'nonveg' },
        { label: 'Special Feast', type: 'custom' },
      ],
      planCategory: 'monthly',
      mealsPerDay: 2,
      isActive: true,
      createdAt: '2026-06-01T00:00:00Z',
    },
  ];

  constructor(private readonly supabaseService: SupabaseService) {}

  async getPlans(user: AuthenticatedUser): Promise<MessPricePlan[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      return this.inMemoryPlans;
    }

    const { data, error } = await client
      .from('mess_price_plans')
      .select('*')
      .eq('mess_id', user.messId)
      .order('price', { ascending: true });

    if (error || !data || data.length === 0) {
      return this.inMemoryPlans;
    }

    return data.map((row) => ({
      id: row.id,
      badge: row.badge,
      badgeColor: row.badge_color,
      name: row.name,
      nameMr: row.name_mr,
      price: Number(row.price),
      priceUnit: row.price_unit,
      description: row.description,
      descriptionMr: row.description_mr,
      tags: row.tags || [],
      planCategory: row.plan_category,
      mealsPerDay: row.meals_per_day,
      tokenCount: row.token_count,
      validityDays: row.validity_days,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async savePlan(plan: MessPricePlan, user: AuthenticatedUser): Promise<MessPricePlan> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const idx = this.inMemoryPlans.findIndex((p) => p.id === plan.id);
      if (idx >= 0) this.inMemoryPlans[idx] = plan;
      else this.inMemoryPlans.push(plan);
      return plan;
    }

    const { data, error } = await client
      .from('mess_price_plans')
      .upsert({
        id: plan.id,
        mess_id: user.messId,
        badge: plan.badge,
        badge_color: plan.badgeColor || 'purple',
        name: plan.name,
        name_mr: plan.nameMr,
        price: plan.price,
        price_unit: plan.priceUnit,
        description: plan.description,
        description_mr: plan.descriptionMr,
        tags: plan.tags,
        plan_category: plan.planCategory,
        meals_per_day: plan.mealsPerDay,
        token_count: plan.tokenCount,
        validity_days: plan.validityDays,
        is_active: plan.isActive !== false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save price plan: ${error.message}`);

    return {
      id: data.id,
      badge: data.badge,
      badgeColor: data.badge_color,
      name: data.name,
      nameMr: data.name_mr,
      price: Number(data.price),
      priceUnit: data.price_unit,
      description: data.description,
      descriptionMr: data.description_mr,
      tags: data.tags || [],
      planCategory: data.plan_category,
      mealsPerDay: data.meals_per_day,
      tokenCount: data.token_count,
      validityDays: data.validity_days,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  async deletePlan(id: string, user: AuthenticatedUser): Promise<{ success: boolean }> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryPlans = this.inMemoryPlans.filter((p) => p.id !== id);
      return { success: true };
    }

    await client.from('mess_price_plans').delete().eq('id', id).eq('mess_id', user.messId);
    return { success: true };
  }
}

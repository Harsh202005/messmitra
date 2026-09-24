import { Injectable, NotFoundException } from '@nestjs/common';
import { MealToken, TokenStatus } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class TokensService {
  private inMemoryTokens: MealToken[] = [];

  constructor(private readonly supabaseService: SupabaseService) {}

  async getTokens(user: AuthenticatedUser, status?: TokenStatus, search?: string): Promise<MealToken[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryTokens.filter((t) => t.messId === user.messId || !user.messId);
      if (status) list = list.filter((t) => t.status === status);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((t) => t.customerName.toLowerCase().includes(q) || t.tokenNumber.toLowerCase().includes(q));
      }
      return list.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    }

    let query = client
      .from('meal_tokens')
      .select('*')
      .eq('mess_id', user.messId)
      .order('issued_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) query = query.or(`customer_name.ilike.%${search}%,token_number.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch meal tokens: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      tokenNumber: row.token_number,
      messId: row.mess_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      memberId: row.member_id,
      planId: row.plan_id,
      tokenType: row.token_type,
      tokenName: row.token_name,
      amount: Number(row.amount),
      dietPreference: row.diet_preference,
      mealSlot: row.meal_slot,
      paymentMethod: row.payment_method,
      status: row.status,
      issuedAt: row.issued_at,
      redeemedAt: row.redeemed_at,
      expiresAt: row.expires_at,
      notes: row.notes,
    }));
  }

  async issueToken(
    dto: Omit<MealToken, 'id' | 'tokenNumber' | 'issuedAt' | 'status' | 'messId'>,
    user: AuthenticatedUser
  ): Promise<MealToken> {
    const client = this.supabaseService.getClient();
    const tokenNumber = `TKN-${Date.now().toString().slice(-4)}`;
    const newToken: MealToken = {
      ...dto,
      id: `tkn-${Date.now()}`,
      tokenNumber,
      messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      status: 'issued',
      issuedAt: new Date().toISOString(),
    };

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryTokens.unshift(newToken);
      return newToken;
    }

    const { data, error } = await client
      .from('meal_tokens')
      .insert({
        id: newToken.id,
        token_number: newToken.tokenNumber,
        mess_id: newToken.messId,
        customer_name: newToken.customerName,
        customer_phone: newToken.customerPhone,
        member_id: newToken.memberId,
        plan_id: newToken.planId,
        token_type: newToken.tokenType,
        token_name: newToken.tokenName,
        amount: newToken.amount,
        diet_preference: newToken.dietPreference || 'veg',
        meal_slot: newToken.mealSlot || 'both',
        payment_method: newToken.paymentMethod,
        status: 'issued',
        issued_at: newToken.issuedAt,
        notes: newToken.notes,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to issue token: ${error.message}`);

    return {
      id: data.id,
      tokenNumber: data.token_number,
      messId: data.mess_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      memberId: data.member_id,
      planId: data.plan_id,
      tokenType: data.token_type,
      tokenName: data.token_name,
      amount: Number(data.amount),
      dietPreference: data.diet_preference,
      mealSlot: data.meal_slot,
      paymentMethod: data.payment_method,
      status: data.status,
      issuedAt: data.issued_at,
      redeemedAt: data.redeemed_at,
      expiresAt: data.expires_at,
      notes: data.notes,
    };
  }

  async redeemToken(id: string, user: AuthenticatedUser): Promise<MealToken> {
    const client = this.supabaseService.getClient();
    const redeemedAt = new Date().toISOString();

    if (!client || this.supabaseService.getIsMockMode()) {
      const idx = this.inMemoryTokens.findIndex((t) => t.id === id || t.tokenNumber === id);
      if (idx === -1) throw new NotFoundException('Meal token not found');
      this.inMemoryTokens[idx].status = 'redeemed';
      this.inMemoryTokens[idx].redeemedAt = redeemedAt;
      return this.inMemoryTokens[idx];
    }

    const { data, error } = await client
      .from('meal_tokens')
      .update({
        status: 'redeemed',
        redeemed_at: redeemedAt,
      })
      .or(`id.eq.${id},token_number.eq.${id}`)
      .eq('mess_id', user.messId)
      .select()
      .single();

    if (error) throw new Error(`Failed to redeem token: ${error.message}`);

    return {
      id: data.id,
      tokenNumber: data.token_number,
      messId: data.mess_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      memberId: data.member_id,
      planId: data.plan_id,
      tokenType: data.token_type,
      tokenName: data.token_name,
      amount: Number(data.amount),
      dietPreference: data.diet_preference,
      mealSlot: data.meal_slot,
      paymentMethod: data.payment_method,
      status: data.status,
      issuedAt: data.issued_at,
      redeemedAt: data.redeemed_at,
      expiresAt: data.expires_at,
      notes: data.notes,
    };
  }
}

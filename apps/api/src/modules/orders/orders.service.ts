import { Injectable, NotFoundException } from '@nestjs/common';
import { WalkInOrder, MenuCatalogItem } from '@messmitra/types';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class OrdersService {
  private inMemoryOrders: WalkInOrder[] = [];

  private inMemoryCatalog: MenuCatalogItem[] = [
    {
      id: 'thali-veg-unlimited',
      name: 'Pure Veg Unlimited Thali',
      nameMr: 'शुद्ध शाकाहारी अमर्यादित थाळी',
      price: 80,
      diet: 'veg',
      category: 'thali',
      icon: '🥗',
      badge: 'सर्वात लोकप्रिय',
      available: true,
    },
    {
      id: 'thali-nonveg-special',
      name: 'Special Chicken / Egg Thali',
      nameMr: 'स्पेशल चिकन थाळी / अंडी थाळी',
      price: 120,
      diet: 'nonveg',
      category: 'thali',
      icon: '🍗',
      badge: 'बुध, शुक्र, रवि स्पेशल',
      available: true,
    },
    {
      id: 'parcel-veg-box',
      name: 'Pure Veg Parcel Box',
      nameMr: 'शाकाहारी पार्सल डबा (३ चपाती+२ भाजी+भात)',
      price: 90,
      diet: 'veg',
      category: 'parcel',
      isParcel: true,
      icon: '📦',
      available: true,
    },
    {
      id: 'parcel-nonveg-box',
      name: 'Special Chicken Parcel Box',
      nameMr: 'स्पेशल चिकन पार्सल डबा (३ चपाती+चिकन+भात)',
      price: 130,
      diet: 'nonveg',
      category: 'parcel',
      isParcel: true,
      icon: '🍱',
      available: true,
    },
    {
      id: 'extra-chapati-2',
      name: 'Extra Butter Chapati (2 pcs)',
      nameMr: 'गरमागरम चपाती (२ नग)',
      price: 20,
      diet: 'veg',
      category: 'extra',
      icon: '🫓',
      available: true,
    },
  ];

  constructor(private readonly supabaseService: SupabaseService) {}

  async getOrders(user: AuthenticatedUser, targetDate?: string): Promise<WalkInOrder[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      let list = this.inMemoryOrders.filter((o) => o.messId === user.messId || !user.messId);
      if (targetDate) {
        list = list.filter((o) => o.createdAt.startsWith(targetDate));
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    let query = client
      .from('walkin_orders')
      .select('*')
      .eq('mess_id', user.messId)
      .order('created_at', { ascending: false });

    if (targetDate) {
      query = query.gte('created_at', `${targetDate}T00:00:00Z`).lte('created_at', `${targetDate}T23:59:59Z`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch POS orders: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      messId: row.mess_id,
      items: row.items || [],
      totalAmount: Number(row.total_amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      notes: row.notes,
      createdAt: row.created_at,
    }));
  }

  async createOrder(
    dto: Omit<WalkInOrder, 'id' | 'orderNumber' | 'createdAt' | 'messId'>,
    user: AuthenticatedUser
  ): Promise<WalkInOrder> {
    const client = this.supabaseService.getClient();
    const count = this.inMemoryOrders.length + 101;
    const orderNumber = `POS-${Date.now().toString().slice(-4)}`;
    const newOrder: WalkInOrder = {
      ...dto,
      id: `wo-${Date.now()}`,
      orderNumber,
      messId: user.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      createdAt: new Date().toISOString(),
    };

    if (!client || this.supabaseService.getIsMockMode()) {
      this.inMemoryOrders.unshift(newOrder);
      return newOrder;
    }

    const { data, error } = await client
      .from('walkin_orders')
      .insert({
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        mess_id: newOrder.messId,
        items: newOrder.items,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        notes: newOrder.notes,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create walk-in order: ${error.message}`);

    return {
      id: data.id,
      orderNumber: data.order_number,
      messId: data.mess_id,
      items: data.items,
      totalAmount: Number(data.total_amount),
      paymentMethod: data.payment_method,
      paymentStatus: data.payment_status,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      notes: data.notes,
      createdAt: data.created_at,
    };
  }

  async getDailyStats(user: AuthenticatedUser, targetDate: string = new Date().toISOString().split('T')[0]) {
    const orders = await this.getOrders(user, targetDate);
    const totalOrders = orders.length;
    let totalRevenue = 0;
    let cashRevenue = 0;
    let upiRevenue = 0;
    let vegThaliCount = 0;
    let nonVegThaliCount = 0;
    let parcelCount = 0;

    orders.forEach((o) => {
      totalRevenue += o.totalAmount;
      if (o.paymentMethod === 'cash') cashRevenue += o.totalAmount;
      if (o.paymentMethod === 'upi') upiRevenue += o.totalAmount;

      (o.items || []).forEach((item) => {
        if (item.diet === 'veg' && item.itemId?.includes('thali')) vegThaliCount += item.quantity;
        if (item.diet === 'nonveg' && item.itemId?.includes('thali')) nonVegThaliCount += item.quantity;
        if (item.isParcel) parcelCount += item.quantity;
      });
    });

    return {
      date: targetDate,
      totalOrders,
      totalRevenue,
      cashRevenue,
      upiRevenue,
      vegThaliCount,
      nonVegThaliCount,
      parcelCount,
    };
  }

  async getCatalog(user: AuthenticatedUser): Promise<MenuCatalogItem[]> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      return this.inMemoryCatalog;
    }

    const { data, error } = await client
      .from('menu_catalog_items')
      .select('*')
      .order('price', { ascending: true });

    if (error || !data || data.length === 0) {
      return this.inMemoryCatalog;
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      nameMr: row.name_mr,
      price: Number(row.price),
      diet: row.diet,
      category: row.category,
      isParcel: row.is_parcel,
      icon: row.icon,
      badge: row.badge,
      available: row.available,
    }));
  }

  async saveCatalogItem(item: MenuCatalogItem, user: AuthenticatedUser): Promise<MenuCatalogItem> {
    const client = this.supabaseService.getClient();

    if (!client || this.supabaseService.getIsMockMode()) {
      const idx = this.inMemoryCatalog.findIndex((c) => c.id === item.id);
      if (idx >= 0) this.inMemoryCatalog[idx] = item;
      else this.inMemoryCatalog.push(item);
      return item;
    }

    const { data, error } = await client
      .from('menu_catalog_items')
      .upsert({
        id: item.id,
        mess_id: user.messId,
        name: item.name,
        name_mr: item.nameMr,
        price: item.price,
        diet: item.diet,
        category: item.category,
        is_parcel: item.isParcel || false,
        icon: item.icon,
        badge: item.badge,
        available: item.available !== false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save catalog item: ${error.message}`);
    return {
      id: data.id,
      name: data.name,
      nameMr: data.name_mr,
      price: Number(data.price),
      diet: data.diet,
      category: data.category,
      isParcel: data.is_parcel,
      icon: data.icon,
      badge: data.badge,
      available: data.available,
    };
  }
}

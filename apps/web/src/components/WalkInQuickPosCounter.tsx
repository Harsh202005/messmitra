'use client';

import React, { useState, useEffect } from 'react';
import { WalkInOrder, WalkInOrderItem, MenuCatalogItem, Mess } from '@messmitra/types';
import { MessMitraApi, DEFAULT_POS_CATALOG, notifyDataChanged } from '../lib/api';
import { playNotificationChime } from '../lib/notificationService';
import { useI18n } from '../lib/i18n';
import { UpiQrCode } from './UpiQrCode';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  QrCode,
  DollarSign,
  Phone,
  MessageCircle,
  Clock,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  Salad,
  Package,
  Calendar,
  CreditCard,
  X,
  TrendingUp,
  Edit2,
  Edit3,
  Download,
  Search,
  Settings2,
  RotateCcw,
  Save,
  Tag,
} from 'lucide-react';

interface WalkInQuickPosCounterProps {
  mess: Mess | null;
  onOrderCompleted?: () => void;
}

export const WalkInQuickPosCounter: React.FC<WalkInQuickPosCounterProps> = ({
  mess,
  onOrderCompleted,
}) => {
  const { language } = useI18n();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [orders, setOrders] = useState<WalkInOrder[]>([]);
  const [catalog, setCatalog] = useState<MenuCatalogItem[]>(DEFAULT_POS_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'thali' | 'parcel' | 'extra'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<Record<string, number>>({
    'thali-veg-unlimited': 1,
  });

  // Customer info & payment state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card' | 'owner_pass'>('upi');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<WalkInOrder | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Quick Price Edit state
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<number>(0);

  // Dish Manager Modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuCatalogItem | null>(null);
  const [dishFormData, setDishFormData] = useState<Partial<MenuCatalogItem>>({
    name: '',
    nameMr: '',
    price: 80,
    diet: 'veg',
    category: 'thali',
    icon: '🍲',
    badge: '',
    available: true,
  });

  // Daily stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    cashRevenue: 0,
    upiRevenue: 0,
    vegThaliCount: 0,
    nonVegThaliCount: 0,
    parcelCount: 0,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadCatalogAndOrders = async () => {
    try {
      const [catList, ordersList, dailyStats] = await Promise.all([
        MessMitraApi.getPosCatalog(),
        MessMitraApi.getWalkInOrders(selectedDate),
        MessMitraApi.getWalkInDailyStats(selectedDate),
      ]);
      setCatalog(catList);
      setOrders(ordersList);
      setStats(dailyStats);
    } catch (e) {
      console.error('Failed to load POS data:', e);
    }
  };

  useEffect(() => {
    loadCatalogAndOrders();

    const handleDataChanged = () => {
      loadCatalogAndOrders();
    };

    window.addEventListener('messmitra_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('messmitra_data_changed', handleDataChanged);
    };
  }, [selectedDate]);

  // Cart Management
  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[itemId] > 1) {
        copy[itemId] -= 1;
      } else {
        delete copy[itemId];
      }
      return copy;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  // Cart total calculations
  const cartItems: WalkInOrderItem[] = Object.entries(cart)
    .map(([id, qty]) => {
      const item = catalog.find((i) => i.id === id);
      if (!item || qty <= 0) return null;
      return {
        itemId: item.id,
        name: item.name,
        nameMr: item.nameMr,
        price: item.price,
        quantity: qty,
        diet: item.diet,
        isParcel: item.isParcel,
      };
    })
    .filter(Boolean) as WalkInOrderItem[];

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const currentUpiId = mess?.upiId || '9822338975@upi';

  // 1. Place Order Submit & Record to Daily Sales
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const created = await MessMitraApi.createWalkInOrder({
        messId: mess?.id || 'balaji-mess-pune',
        items: cartItems,
        totalAmount: paymentMethod === 'owner_pass' ? 0 : cartSubtotal,
        paymentMethod,
        paymentStatus: 'paid',
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: orderNotes.trim() || undefined,
      });

      playNotificationChime();
      setSelectedOrderReceipt(created);
      setCart({ 'thali-veg-unlimited': 1 });
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      showToast(
        language === 'en'
          ? `Order #${created.orderNumber} recorded to Daily Sales!`
          : `ऑर्डर #${created.orderNumber} रोजच्या विक्रीमध्ये नोंदवली!`
      );
      loadCatalogAndOrders();
      if (onOrderCompleted) onOrderCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Delete / Cancel Order
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (
      window.confirm(
        language === 'en'
          ? `Are you sure you want to delete order #${orderNumber}?`
          : `खात्री आहे का? ऑर्डर #${orderNumber} कायमची हटवायची आहे?`
      )
    ) {
      await MessMitraApi.deleteWalkInOrder(orderId);
      showToast(language === 'en' ? 'Order deleted' : 'ऑर्डर हटवली');
      loadCatalogAndOrders();
    }
  };

  // 3. Quick Price Edit Handlers
  const handleStartQuickPriceEdit = (e: React.MouseEvent, item: MenuCatalogItem) => {
    e.stopPropagation();
    setEditingPriceItemId(item.id);
    setTempPriceValue(item.price);
  };

  const handleSaveQuickPrice = async (itemId: string) => {
    const updatedCatalog = catalog.map((item) =>
      item.id === itemId ? { ...item, price: Number(tempPriceValue) || item.price } : item
    );
    setCatalog(updatedCatalog);
    await MessMitraApi.savePosCatalog(updatedCatalog);
    setEditingPriceItemId(null);
    showToast(language === 'en' ? 'Dish price updated!' : 'पदार्थाचा दर बदलला!');
  };

  // 4. Menu Manager (Add/Edit/Delete Dish) Handlers
  const handleOpenAddDish = () => {
    setEditingItem(null);
    setDishFormData({
      name: '',
      nameMr: '',
      price: 90,
      diet: 'veg',
      category: 'thali',
      icon: '🍲',
      badge: '',
      available: true,
      isParcel: false,
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditDish = (item: MenuCatalogItem) => {
    setEditingItem(item);
    setDishFormData({ ...item });
    setIsMenuModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishFormData.nameMr && !dishFormData.name) return;

    let updatedCatalog: MenuCatalogItem[];

    if (editingItem) {
      // Update existing dish
      updatedCatalog = catalog.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              ...dishFormData,
              name: dishFormData.name || dishFormData.nameMr || 'Special Dish',
              nameMr: dishFormData.nameMr || dishFormData.name || 'विशेष पदार्थ',
              price: Number(dishFormData.price) || 80,
              isParcel: dishFormData.category === 'parcel',
            }
          : it
      );
      showToast(language === 'en' ? 'Dish updated successfully!' : 'पदार्थाची माहिती जतन झाली!');
    } else {
      // Add new dish
      const newDish: MenuCatalogItem = {
        id: `dish-${Date.now()}`,
        name: dishFormData.name || dishFormData.nameMr || 'Special Dish',
        nameMr: dishFormData.nameMr || dishFormData.name || 'नवीन पदार्थ',
        price: Number(dishFormData.price) || 80,
        diet: dishFormData.diet || 'veg',
        category: dishFormData.category || 'thali',
        isParcel: dishFormData.category === 'parcel',
        icon: dishFormData.icon || '🍲',
        badge: dishFormData.badge || undefined,
        available: true,
      };
      updatedCatalog = [...catalog, newDish];
      showToast(language === 'en' ? 'New dish added to menu!' : 'नवीन पदार्थ मेनूमध्ये जोडला!');
    }

    setCatalog(updatedCatalog);
    await MessMitraApi.savePosCatalog(updatedCatalog);
    setIsMenuModalOpen(false);
  };

  const handleDeleteDish = async (dishId: string) => {
    if (
      window.confirm(
        language === 'en'
          ? 'Are you sure you want to remove this dish from the menu?'
          : 'हा पदार्थ मेनूमधून काढून टाकायचा आहे का?'
      )
    ) {
      const updatedCatalog = catalog.filter((it) => it.id !== dishId);
      setCatalog(updatedCatalog);
      await MessMitraApi.savePosCatalog(updatedCatalog);
      setIsMenuModalOpen(false);
      showToast(language === 'en' ? 'Dish removed' : 'पदार्थ काढून टाकला');
    }
  };

  const handleResetDefaultMenu = async () => {
    if (
      window.confirm(
        language === 'en'
          ? 'Reset menu back to default Shree Balaji Mess catalog?'
          : 'मूळ मेनू दर व यादी पुन्हा लोड करायची का?'
      )
    ) {
      setCatalog(DEFAULT_POS_CATALOG);
      await MessMitraApi.savePosCatalog(DEFAULT_POS_CATALOG);
      setIsMenuModalOpen(false);
      showToast(language === 'en' ? 'Menu reset to default' : 'मूळ मेनू रीसेट झाला');
    }
  };

  // WhatsApp e-receipt link generator
  const generateWhatsAppReceiptUrl = (order: WalkInOrder) => {
    const phone = order.customerPhone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsText = order.items
      .map((it) => `• ${language === 'en' ? it.name : it.nameMr} x ${it.quantity} = ₹${it.price * it.quantity}`)
      .join('\n');

    const message =
      language === 'en'
        ? `🙏 *Hello ${order.customerName || 'Customer'}*,\n\nGuest Meal / Parcel Bill from *${mess?.name || 'Shree Balaji Mess'}*:\n\n🧾 *Order #:* \`${order.orderNumber}\`\n⏰ *Time:* ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n*Items:*\n${itemsText}\n\n💰 *Total Amount: ₹${order.totalAmount}*\n💳 *Payment Method:* ${order.paymentMethod.toUpperCase()}\n✅ *Status: PAID*\n\n_Thank you for dining at Shree Balaji Mess! Visit again._ ✨\nOwner: Shankar Giri • 9822338975`
        : `🙏 *नमस्ते ${order.customerName || 'ग्राहक'}*,\n\n*${mess?.name || 'श्री बालाजी मेस'}* कडून सुटे जेवण / पार्सल बिल:\n\n🧾 *ऑर्डर क्र:* \`${order.orderNumber}\`\n⏰ *वेळ:* ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n*तपशील:*\n${itemsText}\n\n💰 *एकूण रक्कम: ₹${order.totalAmount}*\n💳 *पेमेंट माध्यम:* ${order.paymentMethod.toUpperCase()}\n✅ *स्थिती: जमा (पूर्ण)*\n\n_श्री बालाजी मेसमध्ये जेवल्याबद्दल धन्यवाद! पुन्हा अवश्य या._ ✨\nचालक: शंकर गिरी • ९८२२३३८९७५`;

    return `https://wa.me/${validPhone}?text=${encodeURIComponent(message)}`;
  };

  // Filtered Menu Items
  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q)) ||
      o.items.some((i) => i.name.toLowerCase().includes(q) || i.nameMr.includes(q))
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-400/30 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. POS Top Bar & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {language === 'en' ? 'Walk-in & Parcel POS' : 'सुटे जेवण व पार्सल काउंटर'}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-black">
                LIVE POS
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                💾 {language === 'en' ? 'Daily Sales Sync Active' : 'दैनिक विक्री नोंदणी सुरू'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'en'
                ? 'Manage dish prices, add new items & record walk-in orders automatically to daily sales'
                : 'पदार्थांचे दर बदला, नवीन पदार्थ जोडा व थेट रोजच्या विक्री हिशोबात नोंद करा'}
            </p>
          </div>
        </div>

        {/* Top Buttons: Date picker + Manage Menu & Dishes */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            type="button"
            onClick={handleOpenAddDish}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'en' ? 'Add New Dish' : 'नवीन पदार्थ जोडा'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsMenuModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-amber-500" />
            <span>{language === 'en' ? 'Manage Menu & Prices' : 'दर व मेनू व्यवस्थापन'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-mono focus:outline-none cursor-pointer text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Today's Walk-in Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? "Today's Revenue" : 'आजची एकूण कमाई'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            {stats.totalOrders} {language === 'en' ? 'Orders recorded' : 'ऑर्डर्स विक्री नोंद'} • {selectedDate}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'UPI Collection' : 'UPI कलेक्शन'}</span>
            <QrCode className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            ₹{stats.upiRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-semibold font-mono truncate">
            {currentUpiId}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'Cash Collected' : 'रोकड जमा'}</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            ₹{stats.cashRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">
            {language === 'en' ? 'Cash in register' : 'गल्ल्यातील रोख शिल्लक'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{language === 'en' ? 'Thali & Parcel Count' : 'थाळी व पार्सल संख्या'}</span>
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white space-y-0.5 font-mono">
            <div className="text-emerald-600">
              🟢 {language === 'en' ? 'Veg' : 'व्हेज'}: {stats.vegThaliCount} {language === 'en' ? 'Thalis' : 'थाळी'}
            </div>
            <div className="text-rose-600">
              🔴 {language === 'en' ? 'Special' : 'स्पेशल'}: {stats.nonVegThaliCount} {language === 'en' ? 'Thalis' : 'थाळी'}
            </div>
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            📦 {stats.parcelCount} {language === 'en' ? 'Parcel Boxes' : 'पार्सल डबे'}
          </div>
        </div>
      </div>

      {/* 3. POS WORKSPACE (LEFT: Menu Catalog Grid with Price Editor, RIGHT: Live Cart & Instant QR Payment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* LEFT 7 COLS: MENU CATALOG */}
        <div className="lg:col-span-7 space-y-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {[
                { id: 'all', label: language === 'en' ? 'All Items' : 'सर्व मेनू' },
                { id: 'thali', label: language === 'en' ? 'Thalis' : 'थाळी' },
                { id: 'parcel', label: language === 'en' ? 'Parcels' : 'पार्सल डबे' },
                { id: 'extra', label: language === 'en' ? 'Extras & Sweets' : 'एक्स्ट्रा / गोड' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400">
              {language === 'en'
                ? '💡 Click ✏️ to quickly change dish price'
                : '💡 दर बदलण्यासाठी ✏️ वर क्लिक करा'}
            </span>
          </div>

          {/* Dish Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCatalog.map((item) => {
              const qtyInCart = cart[item.id] || 0;
              const isEditingPrice = editingPriceItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 shadow-xs group relative ${
                    qtyInCart > 0
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                            {language === 'en' ? item.name : item.nameMr}
                          </h4>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                              {language === 'en' && item.badge === 'सर्वात लोकप्रिय'
                                ? 'Most Popular'
                                : language === 'en' && item.badge === 'बुध, शुक्र, रवि स्पेशल'
                                ? 'Wed, Fri, Sun Special'
                                : item.badge}
                            </span>
                          )}
                        </div>

                        {/* Price & Inline Price Editor */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 mt-1.5"
                        >
                          {isEditingPrice ? (
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-amber-500 shadow-sm animate-fadeIn">
                              <span className="text-xs font-mono font-bold text-amber-600">₹</span>
                              <input
                                type="number"
                                autoFocus
                                min={1}
                                step={5}
                                value={tempPriceValue}
                                onChange={(e) => setTempPriceValue(Number(e.target.value))}
                                className="w-16 px-1 py-0.5 text-xs font-mono font-black bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-600 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveQuickPrice(item.id)}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 cursor-pointer"
                                title="दर जतन करा"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPriceItemId(null)}
                                className="p-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 cursor-pointer"
                                title="रद्द करा"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                                ₹{item.price}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleStartQuickPriceEdit(e, item)}
                                className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition cursor-pointer"
                                title={language === 'en' ? 'Edit Price' : 'दर बदला'}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-center"
                  >
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black font-mono text-xs text-slate-900 dark:text-white">
                      {qtyInCart}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item.id)}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 5 COLS: LIVE CART & INSTANT QR PAYMENT */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {language === 'en' ? 'Current Order' : 'सध्याची ऑर्डर'}
                </h3>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{language === 'en' ? 'Clear' : 'साफ करा'}</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-48 overflow-y-auto py-1 text-xs">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {language === 'en' ? 'Select items on the left to add to order.' : 'ऑर्डर जोडण्यासाठी डाव्या बाजूला थाळी निवडा.'}
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.itemId} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {language === 'en' ? item.name : item.nameMr}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal & Total */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400">
                <span>{language === 'en' ? 'Total Item Count:' : 'एकूण आयटम्स संख्या:'}</span>
                <span className="font-mono">
                  {cartItems.reduce((sum, i) => sum + i.quantity, 0)} {language === 'en' ? 'items' : 'नग'}
                </span>
              </div>
              <div className="flex justify-between font-black text-base text-slate-900 dark:text-white pt-1">
                <span>{language === 'en' ? 'Total Payable:' : 'एकूण देय रक्कम:'}</span>
                <span className="font-mono text-xl text-emerald-600 dark:text-emerald-400">
                  ₹{cartSubtotal}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'en' ? 'Payment Method:' : 'पेमेंट माध्यम:'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer flex flex-col items-center justify-center ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 mb-0.5" />
                  <span>UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer flex flex-col items-center justify-center ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 mb-0.5" />
                  <span>{language === 'en' ? 'Cash' : 'रोकड'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('owner_pass')}
                  className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer flex flex-col items-center justify-center ${
                    paymentMethod === 'owner_pass'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 mb-0.5" />
                  <span>{language === 'en' ? 'Free / Owner' : 'फ्री / मालक'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic UPI QR Display if UPI is selected */}
            {paymentMethod === 'upi' && cartSubtotal > 0 && (
              <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {language === 'en'
                    ? `Ask customer to scan QR (₹${cartSubtotal})`
                    : `ग्राहकास हा QR स्कॅन करायला सांगा (₹${cartSubtotal})`}
                </span>
                <UpiQrCode
                  upiId={currentUpiId}
                  name={mess?.name || 'श्री बालाजी मेस'}
                  amount={cartSubtotal}
                  size={120}
                />
                <span className="text-[10px] font-mono text-slate-400">{currentUpiId}</span>
              </div>
            )}

            {/* Customer Details Form (Optional) */}
            <div className="pt-3 space-y-2 text-xs">
              <input
                type="text"
                placeholder={language === 'en' ? 'Customer Name (Optional)' : 'ग्राहकाचे नाव (पर्यायी)'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <input
                type="tel"
                placeholder={language === 'en' ? 'WhatsApp Mobile Number (For Receipt)' : 'WhatsApp मोबाईल नंबर (पावती पाठवण्यासाठी)'}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isSubmitting
                ? (language === 'en' ? 'Recording to Daily Sales...' : 'दैनिक विक्रीत नोंदवत आहे...')
                : (language === 'en'
                    ? `Complete & Save to Daily Sales (₹${paymentMethod === 'owner_pass' ? 0 : cartSubtotal})`
                    : `बिल पूर्ण करा व विक्री नोंदवा (₹${paymentMethod === 'owner_pass' ? 0 : cartSubtotal})`)}
            </span>
          </button>
        </div>
      </div>

      {/* 4. DAILY SALES LEDGER / ALL ORDERS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                {language === 'en' ? `Daily Sales Register (${selectedDate})` : `रोजचा विक्री हिशोब नोंदवही (${selectedDate})`}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'en'
                  ? 'All walk-in guest meals & parcel orders permanently stored'
                  : 'सर्व सुटे जेवण व पार्सल विक्रीचे कायमस्वरूपी रेकॉर्ड'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search order #, name...' : 'ऑर्डर क्र. किंवा नाव शोधा...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Export CSV */}
            {orders.length > 0 && (
              <button
                type="button"
                onClick={() => MessMitraApi.downloadWalkInOrdersCsv(orders, selectedDate)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Export CSV' : 'CSV डाउनलोड'}</span>
              </button>
            )}

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredOrders.length} {language === 'en' ? 'Records' : 'नोंदी'}
            </span>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {language === 'en'
              ? 'No sales records found on this date. Place an order above to record.'
              : 'या तारखेला कोणतीही विक्री नोंद सापडली नाही. वरून ऑर्डर तयार करा.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">{language === 'en' ? 'Order #' : 'ऑर्डर क्र.'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Time' : 'वेळ'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Customer' : 'ग्राहक'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Items' : 'आयटम्स'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Method' : 'माध्यम'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Amount' : 'रक्कम'}</th>
                  <th className="p-3.5 text-right">{language === 'en' ? 'Actions' : 'कृती'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((o) => {
                  const waUrl = generateWhatsAppReceiptUrl(o);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition">
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {o.orderNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {o.customerName || (language === 'en' ? 'Walk-in Guest' : 'सुटे ग्राहक')}
                        </div>
                        {o.customerPhone && (
                          <div className="text-[10px] text-slate-400 font-mono">{o.customerPhone}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {o.items.map((it) => `${language === 'en' ? it.name : it.nameMr} (${it.quantity})`).join(', ')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            o.paymentMethod === 'upi'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : o.paymentMethod === 'cash'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-sm text-slate-900 dark:text-white">
                        ₹{o.totalAmount}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderReceipt(o)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                            title={language === 'en' ? 'View / Print Receipt' : 'पावती पहा / प्रिंट करा'}
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-500" />
                          </button>

                          {o.customerPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 transition"
                              title={language === 'en' ? 'Send WhatsApp Receipt' : 'WhatsApp पावती पाठवा'}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                            title={language === 'en' ? 'Delete order' : 'ऑर्डर हटवा'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MANAGE MENU & ADD/EDIT DISH MODAL */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                <h3 className="font-black text-base">
                  {editingItem
                    ? (language === 'en' ? 'Edit Dish Details' : 'पदार्थाचे दर व माहिती बदला')
                    : (language === 'en' ? 'Manage Menu & Add New Dishes' : 'मेनू व्यवस्थापन व नवीन पदार्थ जोडा')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
              {/* Add / Edit Dish Form */}
              <form onSubmit={handleSaveDish} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>
                    {editingItem
                      ? (language === 'en' ? `Editing: ${editingItem.name}` : `बदल करत आहे: ${editingItem.nameMr}`)
                      : (language === 'en' ? 'Add a New Dish to Menu' : 'नवीन पदार्थ मेनूत समाविष्ट करा')}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Marathi Dish Name *' : 'मराठी नाव *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. स्पेशल पनीर थाळी / मटार उसळ"
                      value={dishFormData.nameMr}
                      onChange={(e) => setDishFormData({ ...dishFormData, nameMr: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'English Name *' : 'इंग्रजी नाव *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Special Paneer Thali"
                      value={dishFormData.name}
                      onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Price (₹) *' : 'दर (₹) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      step={5}
                      value={dishFormData.price}
                      onChange={(e) => setDishFormData({ ...dishFormData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-black text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Category *' : 'प्रवर्ग / प्रकार *'}
                    </label>
                    <select
                      value={dishFormData.category}
                      onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
                    >
                      <option value="thali">{language === 'en' ? 'Thali (Dining)' : 'थाळी (डायनिंग)'}</option>
                      <option value="parcel">{language === 'en' ? 'Parcel Box' : 'पार्सल डबा'}</option>
                      <option value="extra">{language === 'en' ? 'Extra / Sweet / Drink' : 'एक्स्ट्रा / गोड / पेय'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Diet Type *' : 'आहार प्रकार *'}
                    </label>
                    <select
                      value={dishFormData.diet}
                      onChange={(e) => setDishFormData({ ...dishFormData, diet: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
                    >
                      <option value="veg">🟢 {language === 'en' ? 'Pure Veg' : 'शुद्ध शाकाहारी'}</option>
                      <option value="nonveg">🔴 {language === 'en' ? 'Non-Veg Special' : 'मांसाहारी स्पेशल'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Emoji Icon' : 'इमोजी आयकॉन'}
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['🥗', '🍗', '📦', '🍱', '🫓', '🌾', '🍨', '🥛', '🍲', '🍳', '🥟', '☕', '🥤', '🍛'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setDishFormData({ ...dishFormData, icon: emoji })}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition ${
                            dishFormData.icon === emoji
                              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Badge Tag (Optional)' : 'बॅज / विशेष टॅग (पर्यायी)'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. सर्वात लोकप्रिय / स्पेशल"
                      value={dishFormData.badge || ''}
                      onChange={(e) => setDishFormData({ ...dishFormData, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {editingItem ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteDish(editingItem.id)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Delete Dish' : 'पदार्थ काढून टाका'}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {editingItem && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setDishFormData({
                            name: '',
                            nameMr: '',
                            price: 90,
                            diet: 'veg',
                            category: 'thali',
                            icon: '🍲',
                            badge: '',
                            available: true,
                          });
                        }}
                        className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                      >
                        रद्द करा
                      </button>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingItem ? 'बदल सेव्ह करा ✓' : 'मेनूमध्ये जोडा +'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Current Menu Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {language === 'en' ? `Active Menu Dishes (${catalog.length})` : `सध्याचे मेनू पदार्थ (${catalog.length})`}
                  </h4>

                  <button
                    type="button"
                    onClick={handleResetDefaultMenu}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'en' ? 'Reset Default Menu' : 'मूळ मेनू रीसेट करा'}</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {catalog.map((dish) => (
                    <div
                      key={dish.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{dish.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-slate-900 dark:text-white">
                              {dish.nameMr}
                            </strong>
                            <span className="text-slate-400 text-[11px]">({dish.name})</span>
                            {dish.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                                {dish.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {dish.category.toUpperCase()} • {dish.diet === 'veg' ? '🟢 VEG' : '🔴 NON-VEG'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          ₹{dish.price}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenEditDish(dish)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold rounded-lg transition cursor-pointer flex items-center gap-1 text-xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>बदला</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRINTABLE POS ORDER RECEIPT MODAL */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto print:shadow-none print:border-none">
            {/* Header */}
            <div className="text-center border-b pb-3 space-y-1">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500 shadow-sm mx-auto">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-black text-base text-slate-900">
                {mess?.name || (language === 'en' ? 'Shree Balaji Mess' : 'श्री बालाजी मेस')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mess?.area || (language === 'en' ? 'Karve Nagar / Kothrud' : 'कर्वे नगर / कोथरूड')}, {mess?.city || (language === 'en' ? 'Pune' : 'पुणे')}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {language === 'en' ? 'Mobile:' : 'मोबाईल:'} {mess?.contactNumber || '9822338975'}
              </p>
            </div>

            {/* Order meta */}
            <div className="flex justify-between text-xs font-mono border-b pb-2">
              <div>
                <span className="text-slate-400 block text-[10px]">{language === 'en' ? 'Order #' : 'ऑर्डर क्र.'}</span>
                <strong className="text-amber-600">{selectedOrderReceipt.orderNumber}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">{language === 'en' ? 'Date & Time' : 'दिनांक व वेळ'}</span>
                <span>
                  {new Date(selectedOrderReceipt.createdAt).toLocaleDateString()}{' '}
                  {new Date(selectedOrderReceipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 text-xs divide-y divide-slate-100">
              {selectedOrderReceipt.items.map((it, idx) => (
                <div key={idx} className="pt-1.5 flex justify-between">
                  <div>
                    <span className="font-bold">{language === 'en' ? it.name : it.nameMr}</span>
                    <span className="text-slate-400 block text-[10px]">
                      ₹{it.price} × {it.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-dashed border-slate-300 pt-2 flex justify-between font-black text-base">
              <span>{language === 'en' ? 'Total Amount:' : 'एकूण जमा:'}</span>
              <span className="font-mono">₹{selectedOrderReceipt.totalAmount}</span>
            </div>

            <div className="text-[10px] text-center text-slate-400 border-t pt-2 space-y-0.5">
              <p className="font-bold text-slate-700">
                {language === 'en' ? '21 Years of Tradition • Quality is our Identity' : '२१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख'}
              </p>
              <p>{language === 'en' ? 'Thank you! Visit again. ✨' : 'धन्यवाद! पुन्हा अवश्य भेट द्या. ✨'}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट पावती</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

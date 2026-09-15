'use client';

import React, { useState, useEffect } from 'react';
import { MealToken, Mess, Member, TokenStatus, TokenType } from '@messmitra/types';
import QRCode from 'qrcode';
import {
  Ticket,
  PlusCircle,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Search,
  IndianRupee,
  UtensilsCrossed,
  ChefHat,
  Flame,
  QrCode,
  Sparkles,
  X,
  Check,
  Download,
  Phone,
  User,
  ShoppingBag,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const DEFAULT_TOKENS: MealToken[] = [
  {
    id: 'tkn-001',
    tokenNumber: 'TKN-101',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    customerName: 'सुनील पवार (Walk-in)',
    customerPhone: '+91 98901 11223',
    tokenType: 'single_veg',
    tokenName: '१-वेळ शुद्ध शाकाहारी जेवण',
    amount: 90,
    mealSlot: 'lunch',
    paymentMethod: 'upi',
    status: 'redeemed',
    issuedAt: new Date(Date.now() - 3600000).toISOString(),
    redeemedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'tkn-002',
    tokenNumber: 'TKN-102',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    customerName: 'अनिकेत कदम (Guest)',
    customerPhone: '+91 98902 22334',
    tokenType: 'single_nonveg',
    tokenName: '१-वेळ स्पेशल चिकन थाळी टोकन',
    amount: 150,
    mealSlot: 'dinner',
    paymentMethod: 'cash',
    status: 'issued',
    issuedAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'tkn-003',
    tokenNumber: 'TKN-103',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    customerName: 'अमोल शिंदे (Tiffin)',
    customerPhone: '+91 98903 33445',
    tokenType: 'parcel_box',
    tokenName: 'डबा / पार्सल पॅकिंग जेवण',
    amount: 100,
    mealSlot: 'lunch',
    paymentMethod: 'upi',
    status: 'redeemed',
    issuedAt: new Date(Date.now() - 7200000).toISOString(),
    redeemedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'tkn-004',
    tokenNumber: 'TKN-104',
    messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    customerName: 'सचिन थोरात',
    tokenType: 'single_veg',
    tokenName: '१-वेळ शुद्ध शाकाहारी जेवण',
    amount: 90,
    mealSlot: 'dinner',
    paymentMethod: 'cash',
    status: 'issued',
    issuedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

interface MealTokenSystemProps {
  mess: Mess | null;
  members: Member[];
  onExportCsv?: () => void;
}

export const MealTokenSystem: React.FC<MealTokenSystemProps> = ({ mess, members }) => {
  const [tokens, setTokens] = useState<MealToken[]>(DEFAULT_TOKENS);
  const [activeTab, setActiveTab] = useState<'pos' | 'kitchen' | 'register'>('pos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // POS Form State
  const [tokenType, setTokenType] = useState<TokenType>('single_veg');
  const [customName, setCustomName] = useState('१-वेळ शुद्ध शाकाहारी जेवण');
  const [tokenPrice, setTokenPrice] = useState(90);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mealSlot, setMealSlot] = useState<'lunch' | 'dinner'>('lunch');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'prepaid_bundle'>('cash');
  const [tokenNotes, setTokenNotes] = useState('');

  // Newly Issued Token Receipt Modal
  const [latestIssuedToken, setLatestIssuedToken] = useState<MealToken | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('messmitra_meal_tokens');
      if (saved) {
        setTokens(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load meal tokens', e);
    }
  }, []);

  const saveTokens = (newTokens: MealToken[]) => {
    setTokens(newTokens);
    try {
      localStorage.setItem('messmitra_meal_tokens', JSON.stringify(newTokens));
    } catch (e) {
      console.warn('Failed to save meal tokens', e);
    }
  };

  // Preset token quick selections
  const handleSelectPreset = (
    type: TokenType,
    name: string,
    price: number,
    slot: 'lunch' | 'dinner' = 'lunch'
  ) => {
    setTokenType(type);
    setCustomName(name);
    setTokenPrice(price);
    setMealSlot(slot);
  };

  // Issue Token Action
  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();

    const tokenNum = `TKN-${Math.floor(100 + Math.random() * 900)}`;
    const newToken: MealToken = {
      id: `tkn-${Date.now()}`,
      tokenNumber: tokenNum,
      messId: mess?.id || 'balaji-mess',
      customerName: customerName.trim() || 'Walk-in Customer (अनोळखी ग्राहक)',
      customerPhone: customerPhone.trim() || undefined,
      tokenType,
      tokenName: customName,
      amount: Number(tokenPrice),
      mealSlot,
      paymentMethod,
      status: 'issued',
      issuedAt: new Date().toISOString(),
      notes: tokenNotes.trim() || undefined,
    };

    const updated = [newToken, ...tokens];
    saveTokens(updated);

    // Generate QR code for receipt
    try {
      const qrData = await QRCode.toDataURL(
        `MESS_TOKEN:${newToken.tokenNumber}:${newToken.amount}:${newToken.mealSlot}:${newToken.status}`,
        { width: 250, margin: 1 }
      );
      setQrCodeDataUrl(qrData);
    } catch (err) {
      console.warn('QR generation error', err);
    }

    setLatestIssuedToken(newToken);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setTokenNotes('');
  };

  // Redeem token in Kitchen
  const handleRedeemToken = (id: string) => {
    const updated = tokens.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: 'redeemed' as TokenStatus,
          redeemedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    saveTokens(updated);
  };

  // Daily statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTokens = tokens.filter((t) => t.issuedAt.startsWith(todayStr));
  const todayTotalAmount = todayTokens.reduce((a, b) => a + b.amount, 0);
  const todayPendingCount = todayTokens.filter((t) => t.status === 'issued').length;
  const todayRedeemedCount = todayTokens.filter((t) => t.status === 'redeemed').length;
  const cashTotal = todayTokens.filter((t) => t.paymentMethod === 'cash').reduce((a, b) => a + b.amount, 0);
  const upiTotal = todayTokens.filter((t) => t.paymentMethod === 'upi').reduce((a, b) => a + b.amount, 0);

  const filteredTokens = tokens.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.tokenNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        (t.customerPhone && t.customerPhone.includes(q)) ||
        t.tokenName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              जेवण टोकन सिस्टीम (Mess Meal Token System)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              एकेरी जेवण • पार्सल डबा टोकन्स • किचन काउंटर पंचिंग • आजचा रोख गल्ला
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pos'
                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>टोकन काउंटर (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kitchen'
                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>किचन पंच ({todayPendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>नोंदवही ({tokens.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Today's Token Sales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            आजचे एकूण टोकन्स
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {todayTokens.length}
          </div>
          <span className="text-[10px] text-slate-400">Issued Today</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            आजची टोकन वसुली
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{todayTotalAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Total Revenue</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            प्रलंबित / जेवण बाकी
          </span>
          <div className="text-2xl font-black text-amber-500 font-mono">
            {todayPendingCount}
          </div>
          <span className="text-[10px] text-slate-400">Ready in Kitchen</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            रोख vs UPI
          </span>
          <div className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono mt-1">
            रोख: ₹{cashTotal} • UPI: ₹{upiTotal}
          </div>
          <span className="text-[10px] text-slate-400">Payment Channels</span>
        </div>
      </div>

      {/* TAB 1: QUICK POS TOKEN COUNTER */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Quick Presets */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>१-क्लिक जलद टोकन निवडा (Quick Token Presets):</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  type: 'single_veg' as TokenType,
                  name: '१-वेळ शुद्ध शाकाहारी जेवण (Single Veg Meal)',
                  price: 90,
                  tag: 'Pure Veg',
                  desc: 'अमर्यादित चपाती, २ भाज्या, वरण, भात, सॅलड',
                  slot: 'lunch' as const,
                  color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20',
                },
                {
                  type: 'single_nonveg' as TokenType,
                  name: '१-वेळ स्पेशल चिकन थाळी टोकन (Special Non-Veg)',
                  price: 150,
                  tag: 'Special Non-Veg',
                  desc: 'चिकन सुक्का/रस्सा, भाकरी, भात, तांबडा-पांढरा रस्सा',
                  slot: 'dinner' as const,
                  color: 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20',
                },
                {
                  type: 'parcel_box' as TokenType,
                  name: 'पार्सल / डबा पॅकिंग जेवण (Tiffin Box Parcel)',
                  price: 100,
                  tag: 'Tiffin Parcel',
                  desc: '४ पोळ्या, २ डबे भाजी, वरण, भात पॅकिंगसह',
                  slot: 'lunch' as const,
                  color: 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20',
                },
                {
                  type: 'bundle_pass' as TokenType,
                  name: '१० जेवण विद्यार्थी कूपन पास (10-Meal Student Pass)',
                  price: 850,
                  tag: '10-Meal Pass',
                  desc: 'विद्यार्थ्यांसाठी १० जेवण पास (~₹८५/जेवण)',
                  slot: 'lunch' as const,
                  color: 'border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20',
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.type, preset.name, preset.price, preset.slot)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer hover:scale-[1.01] hover:shadow-md ${preset.color} ${
                    tokenType === preset.type && tokenPrice === preset.price
                      ? 'ring-2 ring-brand-500 shadow-md'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
                        {preset.tag}
                      </span>
                      <span className="text-xs text-slate-400 font-mono uppercase">
                        {preset.slot}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {preset.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      ₹{preset.price}
                    </span>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <span>निवडा</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Issue Form */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-500" />
              <span>टोकन बिलिंग फॉर्म (Issue Token)</span>
            </h3>

            <form onSubmit={handleIssueToken} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  टोकन तपशील (Token Title) *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    रक्कम (Price in ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={10}
                      step={5}
                      value={tokenPrice}
                      onChange={(e) => setTokenPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-black text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    जेवणाची वेळ (Slot) *
                  </label>
                  <select
                    value={mealSlot}
                    onChange={(e) => setMealSlot(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    <option value="lunch">दुपारचे जेवण (Lunch)</option>
                    <option value="dinner">रात्रीचे जेवण (Dinner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ग्राहकाचे नाव (Customer Name)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="उदा. राहुल, Walk-in ग्राहक"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मोबाईल नंबर (WhatsApp Receipt)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="उदा. 9890123456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पेमेंट पद्धत (Payment Mode) *
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'cash', label: 'रोख (Cash)' },
                    { id: 'upi', label: 'UPI QR' },
                    { id: 'prepaid_bundle', label: 'पास (Pass)' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === mode.id
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 min-h-[46px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>टोकन जारी करा (Issue ₹{tokenPrice})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: KITCHEN COUNTER REDEMPTION VIEW */}
      {activeTab === 'kitchen' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-500" />
              <span>स्वयंपाकघर टोकन काउंटर (Live Kitchen Punch Screen)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              प्रलंबित: <strong>{todayPendingCount}</strong> | जेवण दिले: <strong>{todayRedeemedCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {tokens.filter((t) => t.status === 'issued').length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-10 text-center text-slate-400 space-y-2 border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  सर्व टोकन्सचे जेवण दिले गेले आहे!
                </h4>
                <p className="text-xs">कोणतेही टोकन प्रलंबित नाही.</p>
              </div>
            ) : (
              tokens
                .filter((t) => t.status === 'issued')
                .map((token) => (
                  <div
                    key={token.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-amber-400 dark:border-amber-600 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono font-bold text-[10px] px-3 py-0.5 rounded-bl-xl uppercase">
                      {token.mealSlot}
                    </div>

                    <div>
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                        #{token.tokenNumber}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                        {token.tokenName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        ग्राहक: <strong>{token.customerName}</strong>
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        वेळ: {new Date(token.issuedAt).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })} • ₹{token.amount} ({token.paymentMethod.toUpperCase()})
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeemToken(token.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>✔️ जेवण दिले (Punch & Redeem)</span>
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY REGISTER & TOKEN LOGS */}
      {activeTab === 'register' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-3">
          {/* Header & Filter */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                सर्व ({tokens.length})
              </button>
              <button
                onClick={() => setStatusFilter('issued')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  statusFilter === 'issued'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                प्रलंबित ({tokens.filter((t) => t.status === 'issued').length})
              </button>
              <button
                onClick={() => setStatusFilter('redeemed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  statusFilter === 'redeemed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                जेवण दिले ({tokens.filter((t) => t.status === 'redeemed').length})
              </button>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="टोकन # किंवा नाव शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Tokens List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTokens.map((t) => (
              <div
                key={t.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-black shrink-0 ${
                      t.status === 'redeemed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                    }`}
                  >
                    <span className="text-[10px] font-bold">#{t.tokenNumber.split('-')[1]}</span>
                    <span className="text-[8px] uppercase">{t.mealSlot}</span>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t.tokenName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'redeemed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {t.status === 'redeemed' ? 'जेवण दिले' : 'प्रलंबित'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                      <span>{t.customerName}</span>
                      {t.customerPhone && <span>• {t.customerPhone}</span>}
                      <span>• {new Date(t.issuedAt).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 font-mono">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 dark:text-white block">
                      ₹{t.amount}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">{t.paymentMethod}</span>
                  </div>

                  {t.status === 'issued' && (
                    <button
                      onClick={() => handleRedeemToken(t.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Redeem
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Digital Token Slip Modal */}
      {latestIssuedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400">डिजिटल जेवण टोकन स्लिप</span>
              <button
                onClick={() => setLatestIssuedToken(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Token Printable Card */}
            <div
              id="token-print-slip"
              className="bg-[#fbf9f4] dark:bg-slate-850 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-lg overflow-hidden">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  श्री बालाजी मेस (पुणे)
                </span>
              </div>

              <div className="py-2 border-y border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-black font-mono text-[#ea580c]">
                  #{latestIssuedToken.tokenNumber}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {latestIssuedToken.tokenName}
                </div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
                  {latestIssuedToken.mealSlot} Pass • ₹{latestIssuedToken.amount}
                </span>
              </div>

              {qrCodeDataUrl && (
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-inner border border-slate-200">
                  <img src={qrCodeDataUrl} alt="Token QR" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="text-[10px] text-slate-500 font-mono">
                ग्राहक: {latestIssuedToken.customerName} • {new Date(latestIssuedToken.issuedAt).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट करा</span>
              </button>

              <button
                type="button"
                onClick={() => setLatestIssuedToken(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>पूर्ण झाले (Done)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { MealToken, Mess, Member, TokenStatus, TokenType, DietPreference } from '@messmitra/types';
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
  Salad,
  Egg,
  Sun,
  Moon,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

export const DEFAULT_TOKENS: MealToken[] = [];

interface MealTokenSystemProps {
  mess: Mess | null;
  members: Member[];
  onExportCsv?: () => void;
}

export const MealTokenSystem: React.FC<MealTokenSystemProps> = ({ mess, members }) => {
  const { language } = useI18n();
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
  const [dietPreference, setDietPreference] = useState<DietPreference>('veg');
  const [mealSlot, setMealSlot] = useState<'lunch' | 'dinner' | 'both'>('lunch');
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
    diet: DietPreference = 'veg',
    slot: 'lunch' | 'dinner' | 'both' = 'lunch'
  ) => {
    setTokenType(type);
    setCustomName(name);
    setTokenPrice(price);
    setDietPreference(diet);
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
      customerName: customerName.trim() || (language === 'en' ? 'Walk-in Customer' : 'अनोळखी ग्राहक'),
      customerPhone: customerPhone.trim() || undefined,
      tokenType,
      tokenName: customName,
      amount: Number(tokenPrice),
      dietPreference,
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
        `MESS_TOKEN:${newToken.tokenNumber}:${newToken.amount}:${newToken.dietPreference}:${newToken.mealSlot}:${newToken.status}`,
        { width: 250, margin: 1 }
      );
      setQrCodeDataUrl(qrData);
    } catch (err) {
      console.error('QR generation failed:', err);
    }

    setLatestIssuedToken(newToken);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setTokenNotes('');
  };

  // Redeem token in Kitchen
  const handleRedeemToken = (id: string) => {
    const updated = tokens.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'redeemed' as TokenStatus,
            redeemedAt: new Date().toISOString(),
          }
        : t
    );
    saveTokens(updated);
  };

  // Stats calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTokens = tokens.filter((t) => t.issuedAt.startsWith(todayStr));
  const todayTotalAmount = todayTokens.reduce((a, b) => a + b.amount, 0);
  const todayPendingCount = tokens.filter((t) => t.status === 'issued').length;
  const todayRedeemedCount = todayTokens.filter((t) => t.status === 'redeemed').length;
  const cashTotal = todayTokens.filter((t) => t.paymentMethod === 'cash').reduce((a, b) => a + b.amount, 0);
  const upiTotal = todayTokens.filter((t) => t.paymentMethod === 'upi').reduce((a, b) => a + b.amount, 0);

  // Filtered tokens for register
  const filteredTokens = tokens.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.tokenNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.tokenName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSlotLabel = (slot: 'lunch' | 'dinner' | 'both') => {
    if (slot === 'lunch') return language === 'en' ? 'Lunch' : 'दुपारचे जेवण';
    if (slot === 'dinner') return language === 'en' ? 'Dinner' : 'रात्रीचे जेवण';
    return language === 'en' ? 'Both (Lunch + Dinner)' : 'दोन्ही वेळ (दुपार+रात्र)';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'en' ? 'Meal Token System' : 'जेवण टोकन सिस्टीम'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'en'
                ? 'Single meals • Veg/Non-Veg • Lunch/Dinner/Both • Parcel Tiffin tokens'
                : 'एकेरी जेवण • व्हेज/नॉनव्हेज • दुपार/रात्र/दोन्ही वेळ • पार्सल डबा टोकन्स'}
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
            <span>{language === 'en' ? 'Token POS' : 'टोकन काउंटर'}</span>
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
              <span>{language === 'en' ? 'Quick Token Presets:' : '१-क्लिक जलद टोकन निवडा:'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  type: 'single_veg' as TokenType,
                  name: language === 'en' ? '1-Time Pure Veg Meal' : '१-वेळ शुद्ध शाकाहारी जेवण',
                  price: 90,
                  diet: 'veg' as DietPreference,
                  tag: language === 'en' ? 'Pure Veg' : 'शाकाहारी',
                  desc: language === 'en' ? 'Unlimited chapati, 2 sabzi, dal, rice, salad' : 'अमर्यादित चपाती, २ भाज्या, वरण, भात, सॅलड',
                  slot: 'lunch' as const,
                  color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20',
                },
                {
                  type: 'single_nonveg' as TokenType,
                  name: language === 'en' ? 'Special Chicken Thali' : '१-वेळ स्पेशल चिकन थाळी टोकन',
                  price: 150,
                  diet: 'nonveg' as DietPreference,
                  tag: language === 'en' ? 'Special Non-Veg' : 'स्पेशल नॉनव्हेज',
                  desc: language === 'en' ? 'Chicken sukka/curry, bhakri, rice, soup' : 'चिकन सुक्का/रस्सा, भाकरी, भात, तांबडा-पांढरा रस्सा',
                  slot: 'dinner' as const,
                  color: 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20',
                },
                {
                  type: 'bundle_pass' as TokenType,
                  name: language === 'en' ? 'Full Day Pass (Lunch + Dinner)' : '२-वेळ संपूर्ण दिवस पास (दुपार+रात्र)',
                  price: 170,
                  diet: 'veg' as DietPreference,
                  tag: language === 'en' ? 'Full Day (2 Meals)' : 'दोन्ही वेळ पास',
                  desc: language === 'en' ? 'Both lunch + dinner complete meals' : 'दुपार + रात्र दोन्ही वेळचे संपूर्ण जेवण टोकन',
                  slot: 'both' as const,
                  color: 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20',
                },
                {
                  type: 'parcel_box' as TokenType,
                  name: language === 'en' ? 'Tiffin Box Parcel' : 'पार्सल / डबा पॅकिंग जेवण',
                  price: 100,
                  diet: 'veg' as DietPreference,
                  tag: language === 'en' ? 'Tiffin Parcel' : 'डबा पार्सल',
                  desc: language === 'en' ? '4 rotis, 2 sabzis, dal, rice packed' : '४ पोळ्या, २ डबे भाजी, वरण, भात पॅकिंगसह',
                  slot: 'lunch' as const,
                  color: 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20',
                },
                {
                  type: 'bundle_pass' as TokenType,
                  name: language === 'en' ? '10-Meal Student Pass' : '१० जेवण विद्यार्थी कूपन पास',
                  price: 850,
                  diet: 'veg' as DietPreference,
                  tag: language === 'en' ? '10-Meal Pass' : '१० जेवण पास',
                  desc: language === 'en' ? 'Student discount pass (~₹85/meal)' : 'विद्यार्थ्यांसाठी १० जेवण पास (~₹८५/जेवण)',
                  slot: 'both' as const,
                  color: 'border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20',
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectPreset(preset.type, preset.name, preset.price, preset.diet, preset.slot)
                  }
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer hover:scale-[1.01] hover:shadow-md ${preset.color} ${
                    tokenType === preset.type && tokenPrice === preset.price && dietPreference === preset.diet
                      ? 'ring-2 ring-brand-500 shadow-md'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
                        {preset.tag}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">
                        {preset.slot === 'both' ? 'दोन्ही वेळ' : preset.slot === 'lunch' ? 'दुपार' : 'रात्र'}
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
              <span>{language === 'en' ? 'Issue Meal Token' : 'टोकन बिलिंग फॉर्म'}</span>
            </h3>

            <form onSubmit={handleIssueToken} className="space-y-3.5 mt-4 text-xs">
              {/* Diet Preference Selector (Veg vs Non-Veg) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Diet Preference *' : 'आहार प्रकार *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDietPreference('veg');
                      if (tokenType === 'single_nonveg') {
                        setTokenType('single_veg');
                        setCustomName(language === 'en' ? '1-Time Pure Veg Meal' : '१-वेळ शुद्ध शाकाहारी जेवण');
                        setTokenPrice(90);
                      }
                    }}
                    className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs border ${
                      dietPreference === 'veg'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Salad className="w-4 h-4" />
                    <span>{language === 'en' ? '🟢 Pure Veg' : '🟢 शाकाहारी'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDietPreference('nonveg');
                      if (tokenType === 'single_veg') {
                        setTokenType('single_nonveg');
                        setCustomName(language === 'en' ? 'Special Chicken Thali' : '१-वेळ स्पेशल चिकन थाळी टोकन');
                        setTokenPrice(150);
                      }
                    }}
                    className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs border ${
                      dietPreference === 'nonveg'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Egg className="w-4 h-4" />
                    <span>{language === 'en' ? '🔴 Non-Veg' : '🔴 मांसाहारी'}</span>
                  </button>
                </div>
              </div>

              {/* Token Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Token Title *' : 'टोकन तपशील *'}
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              {/* Price & Meal Slot (Lunch / Dinner / Both) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Price (₹) *' : 'रक्कम (₹) *'}
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
                    {language === 'en' ? 'Meal Slot *' : 'जेवणाची वेळ *'}
                  </label>
                  <select
                    value={mealSlot}
                    onChange={(e) => setMealSlot(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none text-xs"
                  >
                    <option value="lunch">{language === 'en' ? 'Lunch' : 'दुपारचे जेवण'}</option>
                    <option value="dinner">{language === 'en' ? 'Dinner' : 'रात्रीचे जेवण'}</option>
                    <option value="both">{language === 'en' ? 'Both (Lunch + Dinner)' : 'दोन्ही वेळ (दुपार+रात्र)'}</option>
                  </select>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Customer Name' : 'ग्राहकाचे नाव'}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. Rahul, Walk-in Guest' : 'उदा. राहुल, Walk-in ग्राहक'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'WhatsApp Mobile' : 'मोबाईल नंबर'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="9890123456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Payment Mode *' : 'पेमेंट पद्धत *'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'cash', label: language === 'en' ? 'Cash' : 'रोख' },
                    { id: 'upi', label: 'UPI QR' },
                    { id: 'prepaid_bundle', label: language === 'en' ? 'Pass' : 'पास' },
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
                  <span>{language === 'en' ? `Issue Token (₹${tokenPrice})` : `टोकन जारी करा (₹${tokenPrice})`}</span>
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
              <span>{language === 'en' ? 'Live Kitchen Punch Screen' : 'स्वयंपाकघर टोकन काउंटर'}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {language === 'en'
                ? `Pending: ${todayPendingCount} | Served: ${todayRedeemedCount}`
                : `प्रलंबित: ${todayPendingCount} | जेवण दिले: ${todayRedeemedCount}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {tokens.filter((t) => t.status === 'issued').length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-10 text-center text-slate-400 space-y-2 border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  {language === 'en' ? 'All tokens served!' : 'सर्व टोकन्सचे जेवण दिले गेले आहे!'}
                </h4>
                <p className="text-xs">{language === 'en' ? 'No pending tokens in kitchen.' : 'कोणतेही टोकन प्रलंबित नाही.'}</p>
              </div>
            ) : (
              tokens
                .filter((t) => t.status === 'issued')
                .map((token) => (
                  <div
                    key={token.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-amber-400 dark:border-amber-600 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 flex items-center">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase ${
                          token.dietPreference === 'nonveg'
                            ? 'bg-rose-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {token.dietPreference === 'nonveg'
                          ? (language === 'en' ? '🔴 Non-Veg' : '🔴 नॉनव्हेज')
                          : (language === 'en' ? '🟢 Veg' : '🟢 व्हेज')}
                      </span>
                      <span className="bg-amber-500 text-slate-950 font-mono font-bold text-[9px] px-2 py-0.5 uppercase">
                        {token.mealSlot === 'both'
                          ? (language === 'en' ? 'Both' : 'दोन्ही वेळ')
                          : token.mealSlot === 'lunch'
                          ? (language === 'en' ? 'Lunch' : 'दुपार')
                          : (language === 'en' ? 'Dinner' : 'रात्र')}
                      </span>
                    </div>

                    <div>
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                        #{token.tokenNumber}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                        {token.tokenName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'en' ? 'Customer:' : 'ग्राहक:'} <strong>{token.customerName}</strong>
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        {language === 'en' ? 'Time:' : 'वेळ:'} {new Date(token.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ₹{token.amount} ({token.paymentMethod.toUpperCase()})
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeemToken(token.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>{language === 'en' ? '✔️ Punch & Redeem' : '✔️ जेवण दिले'}</span>
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
                    <span className="text-[8px] uppercase font-bold">
                      {t.dietPreference === 'nonveg' ? '🔴 NV' : '🟢 VG'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{t.tokenName}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                          t.dietPreference === 'nonveg'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {t.dietPreference === 'nonveg' ? 'नॉनव्हेज' : 'व्हेज'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {t.mealSlot === 'both' ? 'दोन्ही वेळ' : t.mealSlot === 'lunch' ? 'दुपार' : 'रात्र'}
                      </span>
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
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  श्री बालाजी मेस (पुणे)
                </h3>
              </div>

              <div className="text-[10px] text-slate-500">
                २१ वर्षांची अखंड परंपरा • चालक: शंकर गिरी
              </div>

              {/* Big Token Number */}
              <div className="py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl">
                <span className="text-xs text-slate-400 block font-mono">TOKEN NUMBER</span>
                <span className="text-3xl font-black font-mono tracking-wider">
                  #{latestIssuedToken.tokenNumber}
                </span>
              </div>

              {/* Badges: Diet & Slot */}
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                    latestIssuedToken.dietPreference === 'nonveg'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {latestIssuedToken.dietPreference === 'nonveg'
                    ? (language === 'en' ? '🔴 Non-Veg' : '🔴 नॉनव्हेज')
                    : (language === 'en' ? '🟢 Pure Veg' : '🟢 शुद्ध शाकाहारी')}
                </span>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {latestIssuedToken.mealSlot === 'both'
                    ? (language === 'en' ? 'Both (Lunch+Dinner)' : 'दोन्ही वेळ')
                    : latestIssuedToken.mealSlot === 'lunch'
                    ? (language === 'en' ? 'Lunch' : 'दुपारचे जेवण')
                    : (language === 'en' ? 'Dinner' : 'रात्रीचे जेवण')}
                </span>
              </div>

              {/* Token Details */}
              <div className="text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300 pt-1 text-left bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>{language === 'en' ? 'Title:' : 'तपशील:'} <strong>{latestIssuedToken.tokenName}</strong></div>
                <div>{language === 'en' ? 'Customer:' : 'ग्राहक:'} <strong>{latestIssuedToken.customerName}</strong></div>
                <div>{language === 'en' ? 'Amount:' : 'रक्कम:'} <strong className="text-emerald-600 font-bold">₹{latestIssuedToken.amount} ({latestIssuedToken.paymentMethod.toUpperCase()})</strong></div>
                <div>{language === 'en' ? 'Date:' : 'तारीख:'} <strong>{new Date(latestIssuedToken.issuedAt).toLocaleDateString('en-IN')}</strong></div>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img src={qrCodeDataUrl} alt="Token QR" className="w-28 h-28 rounded-lg border border-slate-200" />
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">{language === 'en' ? 'Scan at kitchen counter' : 'किचन काउंटरवर स्कॅन करा'}</span>
                </div>
              )}
            </div>

            {/* Print & Close Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट टोकन स्लिप</span>
              </button>

              <button
                type="button"
                onClick={() => setLatestIssuedToken(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
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

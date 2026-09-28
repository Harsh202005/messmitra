'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MealToken, Mess, Member, TokenStatus, TokenType, DietPreference } from '@messmitra/types';
import { MessMitraApi } from '../lib/api';
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
  Volume2,
  VolumeX,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface MealTokenSystemProps {
  mess: Mess | null;
  members: Member[];
  onExportCsv?: () => void;
}

// Available Quick Add-ons for Meals
interface AddOnOption {
  id: string;
  name: string;
  nameMr: string;
  price: number;
  icon: string;
}

const AVAILABLE_ADDONS: AddOnOption[] = [
  { id: 'taak', name: 'Fresh Masala Taak (Buttermilk)', nameMr: 'मसाला ताक', price: 15, icon: '🥛' },
  { id: 'chapati_2', name: 'Extra 2 Chapati', nameMr: '२ चपाती', price: 20, icon: '🫓' },
  { id: 'bhakri', name: 'Jowar Bhakri', nameMr: 'ज्वारी भाकरी', price: 20, icon: '🌾' },
  { id: 'sweet', name: 'Special Sweet (Gulab Jamun)', nameMr: 'गुलाबजाम / गोड', price: 30, icon: '🍨' },
  { id: 'egg', name: 'Extra Boiled / Curry Egg', nameMr: 'अतिरिक्त अंडे', price: 25, icon: '🥚' },
  { id: 'chicken_bowl', name: 'Extra Chicken Rassa Bowl', nameMr: 'चिकन रस्सा वाटी', price: 40, icon: '🍗' },
];

export const MealTokenSystem: React.FC<MealTokenSystemProps> = ({ mess, members }) => {
  const { language } = useI18n();
  const [tokens, setTokens] = useState<MealToken[]>([]);
  const [activeTab, setActiveTab] = useState<'pos' | 'kitchen' | 'register'>('pos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // POS Form State
  const [tokenType, setTokenType] = useState<TokenType>('single_veg');
  const [customName, setCustomName] = useState(language === 'en' ? '1-Time Pure Veg Meal' : '१-वेळ शुद्ध शाकाहारी जेवण');
  const [tokenPrice, setTokenPrice] = useState(90);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [dietPreference, setDietPreference] = useState<DietPreference>('veg');
  const [mealSlot, setMealSlot] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'prepaid_bundle' | 'member_wallet'>('cash');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [tokenNotes, setTokenNotes] = useState('');

  // Kitchen Quick Punch input
  const [kitchenScanInput, setKitchenScanInput] = useState('');
  const [kitchenPunchToast, setKitchenPunchToast] = useState<{ msg: string; success: boolean } | null>(null);

  // Slip modal state
  const [latestIssuedToken, setLatestIssuedToken] = useState<MealToken | null>(null);
  const [batchIssuedTokens, setBatchIssuedTokens] = useState<MealToken[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isThermalReceiptMode, setIsThermalReceiptMode] = useState(false);

  // Audio Beep Synthesizer using Web Audio API
  const playChime = (type: 'success' | 'alert' | 'redeem' = 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'redeem') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.14); // G5
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.21); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context ignored if not allowed by browser policy
    }
  };

  // Load tokens on mount
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

  // Preset Selection
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
    setSelectedAddOns([]);
  };

  // Toggle Add-on
  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  // Add-ons subtotal
  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const item = AVAILABLE_ADDONS.find((a) => a.id === id);
    return sum + (item?.price || 0);
  }, 0);

  // Total amount per token and grand total
  const singleTokenTotal = Number(tokenPrice) + addOnsTotal;
  const grandTotal = singleTokenTotal * quantity;

  // Handle Member Autocomplete
  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) return;
    const m = members.find((mem) => mem.id === memberId);
    if (m) {
      setCustomerName(m.name);
      setCustomerPhone(m.phone || '');
      setDietPreference(m.dietPreference || 'veg');
      setPaymentMethod('member_wallet');
    }
  };

  // Issue Token(s) Form Submit
  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();

    const addOnNames = selectedAddOns
      .map((id) => AVAILABLE_ADDONS.find((a) => a.id === id)?.nameMr || '')
      .filter(Boolean);

    const newTokensList: MealToken[] = [];
    const count = Math.max(1, Math.min(20, quantity));

    for (let i = 0; i < count; i++) {
      const tokenNum = `TKN-${Math.floor(100 + Math.random() * 900)}`;
      const newToken: MealToken = {
        id: `tkn-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        tokenNumber: tokenNum,
        messId: mess?.id || 'balaji-mess',
        customerName: customerName.trim() || (language === 'en' ? 'Walk-in Customer' : 'अनोळखी ग्राहक'),
        customerPhone: customerPhone.trim() || undefined,
        memberId: selectedMemberId || undefined,
        tokenType,
        tokenName: count > 1 ? `${customName} (${i + 1}/${count})` : customName,
        amount: singleTokenTotal,
        quantity: 1,
        dietPreference,
        mealSlot,
        paymentMethod,
        status: 'issued',
        issuedAt: new Date().toISOString(),
        notes: tokenNotes.trim() || undefined,
        addOns: addOnNames.length > 0 ? addOnNames : undefined,
      };
      newTokensList.push(newToken);
    }

    const updated = [...newTokensList, ...tokens];
    saveTokens(updated);

    const primaryToken = newTokensList[0];

    // Generate QR Code
    try {
      const qrData = await QRCode.toDataURL(
        `MESS_TOKEN:${primaryToken.tokenNumber}:${primaryToken.amount}:${primaryToken.dietPreference}:${primaryToken.mealSlot}:${primaryToken.status}`,
        { width: 250, margin: 1 }
      );
      setQrCodeDataUrl(qrData);
    } catch (err) {
      console.error('QR generation failed:', err);
    }

    setLatestIssuedToken(primaryToken);
    setBatchIssuedTokens(newTokensList);
    playChime('success');

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setSelectedMemberId('');
    setSelectedAddOns([]);
    setTokenNotes('');
    setQuantity(1);
  };

  // Redeem token in Kitchen
  const handleRedeemToken = (idOrNum: string) => {
    let found = false;
    const updated = tokens.map((t) => {
      if (t.id === idOrNum || t.tokenNumber.toUpperCase() === idOrNum.toUpperCase().trim()) {
        found = true;
        return {
          ...t,
          status: 'redeemed' as TokenStatus,
          redeemedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    if (found) {
      saveTokens(updated);
      playChime('redeem');
      return true;
    }
    return false;
  };

  // Kitchen Direct Punch by input box
  const handleKitchenPunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = kitchenScanInput.trim();
    if (!query) return;

    let target = tokens.find(
      (t) =>
        t.status === 'issued' &&
        (t.tokenNumber.toUpperCase() === query.toUpperCase() ||
          t.tokenNumber.replace('TKN-', '').toUpperCase() === query.toUpperCase() ||
          t.id === query)
    );

    if (target) {
      handleRedeemToken(target.id);
      setKitchenPunchToast({
        msg: `टोकन #${target.tokenNumber} (${target.customerName}) पंच झाले! ✅`,
        success: true,
      });
      setKitchenScanInput('');
    } else {
      playChime('alert');
      setKitchenPunchToast({
        msg: `टोकन "${query}" सापडले नाही किंवा आधीच जेवण दिले आहे!`,
        success: false,
      });
    }

    setTimeout(() => setKitchenPunchToast(null), 3000);
  };

  // Batch Redeem All Pending in Kitchen
  const handleRedeemAllPending = () => {
    const pendingCount = tokens.filter((t) => t.status === 'issued').length;
    if (pendingCount === 0) return;
    if (confirm(`सर्व ${pendingCount} प्रलंबित टोकन्सचे जेवण दिले असे नोंदवायचे आहे का?`)) {
      const now = new Date().toISOString();
      const updated = tokens.map((t) =>
        t.status === 'issued' ? { ...t, status: 'redeemed' as TokenStatus, redeemedAt: now } : t
      );
      saveTokens(updated);
      playChime('redeem');
    }
  };

  // Clear all tokens
  const handleClearTokens = () => {
    if (confirm('सर्व जुनी टोकन नोंदवही पूर्णपणे रिकामी करायची आहे का?')) {
      saveTokens([]);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    MessMitraApi.downloadTokensCsv(tokens, new Date().toISOString().split('T')[0]);
  };

  // Stats Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTokens = tokens.filter((t) => t.issuedAt.startsWith(todayStr));
  const todayTotalAmount = todayTokens.reduce((a, b) => a + b.amount, 0);
  const todayPendingCount = tokens.filter((t) => t.status === 'issued').length;
  const todayRedeemedCount = todayTokens.filter((t) => t.status === 'redeemed').length;
  const cashTotal = todayTokens.filter((t) => t.paymentMethod === 'cash').reduce((a, b) => a + b.amount, 0);
  const upiTotal = todayTokens.filter((t) => t.paymentMethod === 'upi').reduce((a, b) => a + b.amount, 0);
  const walletTotal = todayTokens
    .filter((t) => t.paymentMethod === 'member_wallet' || t.paymentMethod === 'prepaid_bundle')
    .reduce((a, b) => a + b.amount, 0);

  const todayVegCount = todayTokens.filter((t) => (t.dietPreference || 'veg') === 'veg').length;
  const todayNonVegCount = todayTokens.filter((t) => t.dietPreference === 'nonveg').length;
  const todayLunchCount = todayTokens.filter((t) => t.mealSlot === 'lunch' || t.mealSlot === 'both').length;
  const todayDinnerCount = todayTokens.filter((t) => t.mealSlot === 'dinner' || t.mealSlot === 'both').length;

  // Filtered tokens for register
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.tokenNumber.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.tokenName.toLowerCase().includes(q) ||
          (t.customerPhone && t.customerPhone.includes(q))
        );
      }
      return true;
    });
  }, [tokens, statusFilter, searchQuery]);

  // WhatsApp formatted share link
  const getWhatsAppTokenLink = (token: MealToken) => {
    let cleanPhone = (token.customerPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

    const dietEmoji = token.dietPreference === 'nonveg' ? '🔴 Non-Veg (चिकन/अंडी)' : '🟢 Pure Veg (शुद्ध शाकाहारी)';
    const slotLabel =
      token.mealSlot === 'both' ? 'दुपार + रात्र दोन्ही वेळ' : token.mealSlot === 'lunch' ? 'दुपारचे जेवण' : 'रात्रीचे जेवण';

    const text =
`🎫 *श्री बालाजी मेस — डिजिटल जेवण टोकन*
━━━━━━━━━━━━━━━━━━━━
🏷️ *टोकन नंबर:* \`#${token.tokenNumber}\`
👤 *ग्राहक:* ${token.customerName}
🍱 *तपशील:* ${token.tokenName}
🥗 *आहार:* ${dietEmoji}
⏰ *वेळ:* ${slotLabel}
💰 *रक्कम:* ₹${token.amount} (${token.paymentMethod.toUpperCase()})
${token.addOns && token.addOns.length > 0 ? `➕ *अतिरिक्त:* ${token.addOns.join(', ')}\n` : ''}📅 *तारीख:* ${new Date(token.issuedAt).toLocaleDateString('mr-IN')}
━━━━━━━━━━━━━━━━━━━━
📍 *श्री बालाजी मेस (पुणे)* • चालक: शंकर गिरी (९८२२३३८९७५)
*कृपया हे टोकन किचन काउंटरवर दाखवून जेवण घ्या.* धन्यवाद! ✨`;

    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'en' ? 'Smart Meal Token System' : 'स्मार्ट जेवण टोकन सिस्टीम'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                POS + KDS v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'en'
                ? 'Multi-meal tokens • Veg/Non-Veg • WhatsApp slips • Live Kitchen KDS • Audio Chimes'
                : 'एकेरी/ग्रुप टोकन्स • व्हेज/नॉनव्हेज • WhatsApp स्लिप्स • किचन KDS काउंटर • ऑडिओ बीप'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Sound Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'ऑडिओ बीप चालू' : 'ऑडिओ बीप बंद'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

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
      </div>

      {/* KPI Cards: Today's Token Sales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            आजचे एकूण टोकन्स
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center justify-between">
            <span>{todayTokens.length}</span>
            <span className="text-xs text-slate-400 font-normal">
              🥗 {todayVegCount} • 🍗 {todayNonVegCount}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            दुपार: {todayLunchCount} | रात्र: {todayDinnerCount}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            आजची टोकन वसुली
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{todayTotalAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Total Collection</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            प्रलंबित / जेवण बाकी
          </span>
          <div className="text-2xl font-black text-amber-500 font-mono flex items-center gap-2">
            <span>{todayPendingCount}</span>
            {todayPendingCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
            )}
          </div>
          <span className="text-[10px] text-slate-400">In Kitchen Queue</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
            पेमेंट चॅनेल्स
          </span>
          <div className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono mt-1 space-y-0.5">
            <div>रोख: ₹{cashTotal} • UPI: ₹{upiTotal}</div>
            <div className="text-[10px] text-slate-400">पास/खाते: ₹{walletTotal}</div>
          </div>
        </div>
      </div>

      {/* TAB 1: QUICK POS TOKEN COUNTER */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Quick Presets & Add-ons */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'en' ? '1-Click Quick Token Presets:' : '१-क्लिक जलद टोकन निवडा:'}</span>
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
                  tag: language === 'en' ? 'Special Non-Veg' : 'स्पेशल चिकन',
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
                {
                  type: 'single_veg' as TokenType,
                  name: language === 'en' ? 'Sunday Special Feast Thali' : 'रविवार स्पेशल गोड जेवण थाळी',
                  price: 180,
                  diet: 'veg' as DietPreference,
                  tag: language === 'en' ? 'Sunday Feast' : 'रविवार स्पेशल',
                  desc: language === 'en' ? 'Special sweet, puri, kurdaya, paneer' : 'श्रीखंड/गुलाबजाम, पुरी, पापड, पनीर भाजी, पुलाव',
                  slot: 'lunch' as const,
                  color: 'border-teal-300 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20',
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectPreset(preset.type, preset.name, preset.price, preset.diet, preset.slot)
                  }
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer hover:scale-[1.01] hover:shadow-md ${preset.color} ${
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

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 dark:border-slate-800">
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

            {/* Quick Add-ons Section */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                  <span>अतिरिक्त ॲड-ऑन्स निवडा (Add-ons):</span>
                </label>
                {selectedAddOns.length > 0 && (
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    + ₹{addOnsTotal} / टोकन
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_ADDONS.map((addon) => {
                  const isSelected = selectedAddOns.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-amber-100 border-amber-400 text-amber-950 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{addon.icon}</span>
                        <span className="font-bold truncate">{addon.nameMr}</span>
                      </div>
                      <span className="font-mono font-bold shrink-0 text-[11px]">
                        +₹{addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Issue Form */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-brand-500" />
                <span>{language === 'en' ? 'Issue Meal Token' : 'टोकन बिलिंग फॉर्म'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                Live POS
              </span>
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

              {/* Price & Quantity Counter */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Base Price (₹) *' : 'दर (₹) *'}
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
                    {language === 'en' ? 'Quantity *' : 'नग (संख्या) *'}
                  </label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value))))}
                      className="w-full text-center py-2 bg-transparent font-mono font-black text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(20, quantity + 1))}
                      className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Meal Slot (Lunch / Dinner / Both) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Meal Slot *' : 'जेवणाची वेळ *'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-bold">
                  {[
                    { id: 'lunch', label: language === 'en' ? 'Lunch' : 'दुपार' },
                    { id: 'dinner', label: language === 'en' ? 'Dinner' : 'रात्र' },
                    { id: 'both', label: language === 'en' ? 'Both' : 'दोन्ही वेळ' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setMealSlot(s.id as any)}
                      className={`py-2 px-1 text-center rounded-xl border transition cursor-pointer text-xs ${
                        mealSlot === s.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Member Linker (Optional search) */}
              {members.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>{language === 'en' ? 'Link Member (Optional)' : 'मेस सदस्य जोडा (ऐच्छिक)'}</span>
                    {selectedMemberId && (
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId('')}
                        className="text-[10px] text-rose-500 font-bold hover:underline"
                      >
                        काढून टाका
                      </button>
                    )}
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none text-xs"
                  >
                    <option value="">-- अनोळखी / Walk-in ग्राहक --</option>
                    {members
                      .filter((m) => m.status === 'active')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.phone}) - {m.dietPreference === 'nonveg' ? '🔴 Non-Veg' : '🟢 Veg'}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Customer Name' : 'ग्राहकाचे नाव'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Rahul, Guest' : 'उदा. राहुल'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'WhatsApp Mobile' : 'मोबाईल'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="9890123456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'en' ? 'Payment Mode *' : 'पेमेंट पद्धत *'}
                </label>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                  {[
                    { id: 'cash', label: language === 'en' ? 'Cash' : 'रोख' },
                    { id: 'upi', label: 'UPI QR' },
                    { id: 'prepaid_bundle', label: language === 'en' ? 'Pass' : 'कूपन पास' },
                    { id: 'member_wallet', label: language === 'en' ? 'Member' : 'खात्यावर' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === mode.id
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation Summary Callout */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>दर प्रति टोकन:</span>
                  <span>₹{singleTokenTotal} ({tokenPrice} + ॲडऑन्स {addOnsTotal})</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>एकूण बिल ({quantity} टोकन्स):</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{grandTotal}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-3 min-h-[48px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>
                    {language === 'en'
                      ? `Issue ${quantity} Token(s) • ₹${grandTotal}`
                      : `${quantity} टोकन जारी करा • ₹${grandTotal}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: KITCHEN COUNTER REDEMPTION VIEW & KDS */}
      {activeTab === 'kitchen' && (
        <div className="space-y-4">
          {/* Quick Scanner & Punch Input Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleKitchenPunchSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="टोकन क्रमांक टाका (उदा. TKN-842 किंवा 842) व Enter दाबा..."
                  value={kitchenScanInput}
                  onChange={(e) => setKitchenScanInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-amber-400 dark:border-amber-600 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>पंच करा</span>
              </button>
            </form>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRedeemAllPending}
                disabled={todayPendingCount === 0}
                className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                सर्व टोकन्स पंच करा
              </button>
            </div>
          </div>

          {/* Toast feedback for Kitchen punch */}
          {kitchenPunchToast && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce ${
                kitchenPunchToast.success
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{kitchenPunchToast.msg}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-500" />
              <span>{language === 'en' ? 'Live Kitchen Orders Screen' : 'स्वयंपाकघर टोकन काउंटर (KDS)'}</span>
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
                <p className="text-xs">
                  {language === 'en' ? 'No pending tokens in kitchen queue.' : 'किचनमध्ये कोणतेही टोकन प्रलंबित नाही.'}
                </p>
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
                          ? language === 'en'
                            ? '🔴 Non-Veg'
                            : '🔴 नॉनव्हेज'
                          : language === 'en'
                          ? '🟢 Veg'
                          : '🟢 व्हेज'}
                      </span>
                      <span className="bg-amber-500 text-slate-950 font-mono font-bold text-[9px] px-2 py-0.5 uppercase">
                        {token.mealSlot === 'both'
                          ? language === 'en'
                            ? 'Both'
                            : 'दोन्ही वेळ'
                          : token.mealSlot === 'lunch'
                          ? language === 'en'
                            ? 'Lunch'
                            : 'दुपार'
                          : language === 'en'
                          ? 'Dinner'
                          : 'रात्र'}
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

                      {/* Add-ons badges if any */}
                      {token.addOns && token.addOns.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {token.addOns.map((add, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                            >
                              ➕ {add}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 font-mono mt-2">
                        {language === 'en' ? 'Issued:' : 'वेळ:'}{' '}
                        {new Date(token.issuedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • ₹{token.amount} ({token.paymentMethod.toUpperCase()})
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeemToken(token.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>{language === 'en' ? '✔️ Punch & Redeem' : '✔️ जेवण दिले (पंच)'}</span>
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
            <div className="flex items-center gap-2 flex-wrap">
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

            <div className="flex items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="टोकन # किंवा नाव शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                title="CSV / Excel डाऊनलोड करा"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearTokens}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="नोंदवही साफ करा"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tokens List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTokens.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                कोणतेही टोकन नोंदी सापडल्या नाहीत.
              </div>
            ) : (
              filteredTokens.map((t) => (
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
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {t.tokenName}
                        </span>
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
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 font-mono flex-wrap">
                        <span>{t.customerName}</span>
                        {t.customerPhone && <span>• {t.customerPhone}</span>}
                        {t.addOns && t.addOns.length > 0 && (
                          <span className="text-amber-600 font-bold">• ➕ {t.addOns.join(', ')}</span>
                        )}
                        <span>
                          •{' '}
                          {new Date(t.issuedAt).toLocaleTimeString('mr-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 font-mono">
                    <div className="text-right mr-2">
                      <span className="text-base font-black text-slate-900 dark:text-white block">
                        ₹{t.amount}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">{t.paymentMethod}</span>
                    </div>

                    {/* WhatsApp share action */}
                    <a
                      href={getWhatsAppTokenLink(t)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl transition cursor-pointer"
                      title="WhatsApp वर टोकन पाठवा"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>

                    {/* Reprint slip */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const qr = await QRCode.toDataURL(
                            `MESS_TOKEN:${t.tokenNumber}:${t.amount}:${t.dietPreference}:${t.mealSlot}:${t.status}`,
                            { width: 250, margin: 1 }
                          );
                          setQrCodeDataUrl(qr);
                        } catch {}
                        setLatestIssuedToken(t);
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer"
                      title="टोकन स्लिप पहा / प्रिंट करा"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

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
              ))
            )}
          </div>
        </div>
      )}

      {/* Printable Digital Token Slip Modal */}
      {latestIssuedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400">
                {isThermalReceiptMode ? 'थर्मल POS प्रिंट स्लिप' : 'डिजिटल जेवण टोकन स्लिप'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsThermalReceiptMode(!isThermalReceiptMode)}
                  className="text-[10px] font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  {isThermalReceiptMode ? 'रंगीत मोड' : 'थर्मल मोड'}
                </button>
                <button
                  onClick={() => setLatestIssuedToken(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Token Printable Card */}
            <div
              id="token-print-slip"
              className={`p-5 rounded-2xl border-2 space-y-3 ${
                isThermalReceiptMode
                  ? 'bg-white text-black border-black font-mono'
                  : 'bg-[#fbf9f4] dark:bg-slate-850 border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  श्री बालाजी मेस (पुणे)
                </h3>
              </div>

              <div className="text-[10px] text-slate-500">
                २१ वर्षांची अखंड परंपरा • चालक: शंकर गिरी (९८२२३३८९७५)
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
                    ? language === 'en'
                      ? '🔴 Non-Veg'
                      : '🔴 नॉनव्हेज'
                    : language === 'en'
                    ? '🟢 Pure Veg'
                    : '🟢 शुद्ध शाकाहारी'}
                </span>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {latestIssuedToken.mealSlot === 'both'
                    ? language === 'en'
                      ? 'Both (Lunch+Dinner)'
                      : 'दोन्ही वेळ'
                    : latestIssuedToken.mealSlot === 'lunch'
                    ? language === 'en'
                      ? 'Lunch'
                      : 'दुपारचे जेवण'
                    : language === 'en'
                    ? 'Dinner'
                    : 'रात्रीचे जेवण'}
                </span>
              </div>

              {/* Token Details */}
              <div className="text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300 pt-1 text-left bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  {language === 'en' ? 'Title:' : 'तपशील:'} <strong>{latestIssuedToken.tokenName}</strong>
                </div>
                <div>
                  {language === 'en' ? 'Customer:' : 'ग्राहक:'} <strong>{latestIssuedToken.customerName}</strong>
                </div>
                {latestIssuedToken.addOns && latestIssuedToken.addOns.length > 0 && (
                  <div>
                    {language === 'en' ? 'Add-ons:' : 'ॲड-ऑन्स:'}{' '}
                    <strong className="text-amber-600">{latestIssuedToken.addOns.join(', ')}</strong>
                  </div>
                )}
                <div>
                  {language === 'en' ? 'Amount:' : 'रक्कम:'}{' '}
                  <strong className="text-emerald-600 font-bold">
                    ₹{latestIssuedToken.amount} ({latestIssuedToken.paymentMethod.toUpperCase()})
                  </strong>
                </div>
                <div>
                  {language === 'en' ? 'Date:' : 'तारीख:'}{' '}
                  <strong>{new Date(latestIssuedToken.issuedAt).toLocaleDateString('en-IN')}</strong>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img
                    src={qrCodeDataUrl}
                    alt="Token QR"
                    className="w-28 h-28 rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">
                    {language === 'en' ? 'Scan at kitchen counter' : 'किचन काउंटरवर स्कॅन करा'}
                  </span>
                </div>
              )}
            </div>

            {/* Print & Share Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppTokenLink(latestIssuedToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp स्लिप</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिंट स्लिप</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setLatestIssuedToken(null)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
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

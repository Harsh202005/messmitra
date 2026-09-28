'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mess, MessPricePlan } from '@messmitra/types';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { getStoredPlans, fetchServerPlans } from '../lib/pricePlanService';
import {
  Sparkles,
  UtensilsCrossed,
  Salad,
  Egg,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  ArrowRight,
  HeartHandshake,
  ChefHat,
  IndianRupee,
  Star,
  Award,
  ChevronRight,
  Store,
} from 'lucide-react';

interface PublicLandingPageProps {
  mess: Mess | null;
  onOpenLogin: (mode?: 'login' | 'register') => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ mess, onOpenLogin }) => {
  const { language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [plans, setPlans] = React.useState<MessPricePlan[]>(() => getStoredPlans());

  React.useEffect(() => {
    fetchServerPlans().then((serverPlans) => {
      setPlans(serverPlans);
    });

    const handlePlansUpdated = (e: any) => {
      setPlans(getStoredPlans());
    };
    window.addEventListener('messmitra_plans_updated', handlePlansUpdated);
    return () => window.removeEventListener('messmitra_plans_updated', handlePlansUpdated);
  }, []);

  const messName = mess?.name || 'श्री बालाजी मेस';
  const ownerName = mess?.ownerName || 'शंकर गिरी';
  const phone = mess?.contactNumber || '९८२२३३८९७५';
  const cleanPhone = phone.replace(/[^0-9]/g, '') || '9822338975';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* 1. TOP PUBLIC NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md bg-white p-0.5 shrink-0">
              <img src="/logo.jpeg" alt={messName} className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  {messName}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase font-mono">
                  २१ वर्षे
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-none">
                {mess?.tagline || 'चव हीच आमची ओळख • पुणे'}
              </p>
            </div>
          </div>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#menu" className="hover:text-brand-600 transition">
              {language === 'en' ? 'Weekly Menu' : 'आठवड्याचे मेनू'}
            </a>
            <a href="#plans" className="hover:text-brand-600 transition">
              {language === 'en' ? 'Price Plans' : 'मासिक दर पत्रक'}
            </a>
            <a href="#tokens" className="hover:text-brand-600 transition">
              {language === 'en' ? 'Single Meal Tokens' : 'सुटे जेवण टोकन्स'}
            </a>
            <a href="#contact" className="hover:text-brand-600 transition">
              {language === 'en' ? 'Contact & Hours' : 'पत्ता व संपर्क'}
            </a>
          </nav>

          {/* Right Action Controls: Lang / Theme / Login */}
          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              {language === 'mr' ? 'EN' : 'मराठी'}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Theme Toggle"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Login Action */}
            <button
              type="button"
              onClick={() => onOpenLogin('login')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Login' : 'लॉगिन करा'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SHOWCASE SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-slate-200 dark:border-slate-800">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-brand-500/15 via-amber-500/15 to-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          {/* Heritage Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>२१ वर्षांची अखंड परंपरा • चालविणारे: <strong>शंकर गिरी</strong></span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {language === 'en' ? (
              <>
                Authentic Home-Style Food & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-amber-600 to-rose-600">Pure Taste</span>
              </>
            ) : (
              <>
                घरगुती, स्वच्छ आणि <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-amber-600 to-rose-600">अस्सल चवीचे भोजन</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {language === 'en'
              ? 'Pune’s trusted daily mess with 100% pure veg lunch daily & Wednesday, Friday, Sunday night chicken/egg specials.'
              : 'पुण्यातील कोथरूड-कर्वे नगर परिसरातील अग्रगण्य मेस. रोज दुपारी १००% शुद्ध शाकाहारी जेवण आणि बुधवार, शुक्रवार, रविवारी रात्री स्पेशल चिकन व अंडी थाळी.'}
          </p>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-brand-600 via-amber-600 to-brand-700 hover:from-brand-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-brand-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'en' ? 'Join as New Member' : 'नवीन सभासद नोंदणी करा'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => onOpenLogin('login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-sm rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-brand-500" />
              <span>{language === 'en' ? 'Member / Staff / Owner Login' : 'मेस पोर्टल लॉगिन'}</span>
            </button>
          </div>

          {/* Trust Highlights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
              <Award className="w-5 h-5 text-amber-500 mb-1" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">२१+ वर्षे अखंड सेवा</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">विश्वास व दर्जाची खात्री</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
              <Salad className="w-5 h-5 text-emerald-500 mb-1" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">अमर्यादित चपात्या व भाजी</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">दुपारी १००% शाकाहारी</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
              <Egg className="w-5 h-5 text-rose-500 mb-1" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">३ रात्री नॉनव्हेज स्पेशल</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">बुध, शुक्र, रवि रात्री</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
              <ShieldCheck className="w-5 h-5 text-blue-500 mb-1" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">डिजिटल सुट्टी व बिल सवलत</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">पारदर्शक हिशोब व UPI</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WEEKLY MENU SHOWCASE */}
      <section id="menu" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {language === 'en' ? 'Weekly Menu Schedule' : 'आठवड्याचे मेनू व वेळापत्रक'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            श्री बालाजी मेस स्पेशल थाळी
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            रोज सकाळी ताजे अन्न तयार केले जाते. दुपारचे जेवण सर्वांसाठी पूर्णपणे शुद्ध शाकाहारी असते.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Lunch Menu Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-slate-900 p-6 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/60 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Salad className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    दुपारचे जेवण — १००% शुद्ध शाकाहारी
                  </h3>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                    आठवड्यातील सर्व ७ दिवस (सकाळी ११:०० ते दुपारी ३:००)
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                अमर्यादित
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>गरमागरम चपात्या / पोळ्या (अमर्यादित)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>२ ताज्या भाज्या (उदा. मटार-पनीर / शेवभाजी / पालेभाजी / डाळ-वांगी)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>घरगुती तुरीचे वरण / आमटी आणि इंद्रायणी भात</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>काकडी, टोमॅटो सॅलड, लिंबू, लोणचे आणि ताजे मसाला ताक</span>
              </li>
            </ul>
          </div>

          {/* Dinner Menu Card */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 dark:from-rose-950/40 dark:to-slate-900 p-6 rounded-3xl border-2 border-rose-300 dark:border-rose-700/60 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                  <Egg className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    रात्रीचे जेवण — मांसाहारी व शाकाहारी
                  </h3>
                  <span className="text-[11px] text-rose-800 dark:text-rose-300 font-bold">
                    संध्याकाळी ७:०० ते रात्री १०:३०
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black">
                स्पेशल
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>बुधवार, शुक्रवार, रविवार:</strong> स्पेशल चिकन सुक्का/रस्सा, अंडी थाळी, भाकरी</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>सोमवार, मंगळवार, गुरुवार, शनिवार:</strong> १००% शुद्ध शाकाहारी जेवण</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>शाकाहारी सदस्यांसाठी नॉनव्हेजच्या दिवशीही स्वतंत्र शुद्ध शाकाहारी थाळी उपलब्ध</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. PRICE PLANS & PACKAGES */}
      <section id="plans" className="py-12 sm:py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {language === 'en' ? 'Affordable Pricing' : 'पारदर्शक मासिक दर पत्रक'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              विद्यार्थी व नोकरदारांसाठी परवडणारे दर
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              सुट्टी घेतल्यास बिलातून रीतसर प्रति जेवण वजावट दिली जाते.
            </p>
          </div>

          {/* Dynamic Active Price Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans
              .filter((p) => p.isActive !== false)
              .map((plan, idx) => {
                let badgeStyle = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20';
                if (plan.tags?.some((t) => t.type === 'nonveg')) {
                  badgeStyle = 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20';
                } else if (plan.tags?.some((t) => t.type === 'token')) {
                  badgeStyle = 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/20';
                } else if (plan.id === 'plan-2meal-veg') {
                  badgeStyle = 'border-brand-400 dark:border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500 shadow-md';
                }

                const inclusions = plan.descriptionMr
                  ? plan.descriptionMr.split('.').filter((s) => s.trim().length > 0)
                  : plan.description.split('.').filter((s) => s.trim().length > 0);

                return (
                  <div
                    key={plan.id || idx}
                    className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${badgeStyle}`}
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase font-mono">
                        {plan.badge}
                      </span>
                      <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                        {language === 'mr' ? plan.nameMr || plan.name : plan.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {plan.planCategory === 'token_bundle'
                          ? `${plan.tokenCount || 10} जेवण कूपन पास`
                          : plan.mealsPerDay === 1
                          ? 'फक्त दुपार किंवा फक्त रात्र'
                          : 'दुपार + रात्र दोन्ही वेळ'}
                      </span>

                      <div className="pt-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                          ₹{plan.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{plan.priceUnit}</span>
                      </div>

                      <ul className="space-y-1.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                        {inclusions.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{f.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href="/register"
                      className="w-full py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl text-center shadow-sm transition hover:opacity-90 cursor-pointer block"
                    >
                      नोंदणी करा →
                    </a>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 5. CONTACT & LOCATION */}
      <section id="contact" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-750 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                पत्ता व संपर्क माहिती
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                श्री बालाजी मेस (पुणे)
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                चालक: <strong>श्री. शंकर गिरी</strong> • २१ वर्षांची अविरत परंपरा
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`tel:${cleanPhone}`}
                className="px-5 py-3 bg-white text-slate-900 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md hover:bg-slate-100 transition cursor-pointer"
              >
                <Phone className="w-4 h-4 text-brand-600" />
                <span>कॉल करा ({phone})</span>
              </a>

              <a
                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent('नमस्ते शंकर गिरी सर, मला श्री बालाजी मेस बद्दल माहिती हवी आहे.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md hover:bg-emerald-500 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp मेसेज</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-750 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <MapPin className="w-4 h-4" />
                <span>पत्ता / लोकेशन:</span>
              </div>
              <p className="text-slate-300">
                {mess?.area || 'कर्वे नगर / कोथरूड'}, {mess?.city || 'पुणे'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>मेसच्या वेळा:</span>
              </div>
              <p className="text-slate-300">
                दुपार: सकाळी ११:०० ते दुपारी ३:००<br />
                रात्र: संध्याकाळी ७:०० ते रात्री १०:३०
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <IndianRupee className="w-4 h-4" />
                <span>UPI पेमेंट आयडी:</span>
              </div>
              <p className="text-slate-300 font-mono">
                {mess?.upiId || '9822338975@upi'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          श्री बालाजी मेस — २१ वर्षांची अखंड परंपरा • चालक: <strong>शंकर गिरी ({phone})</strong> • MessMitra Platform
        </p>
      </footer>
    </div>
  );
};

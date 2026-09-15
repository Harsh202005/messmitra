'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessMitraApi } from '../../lib/api';
import { DietPreference, PlanType } from '@messmitra/types';
import {
  UserPlus,
  ChefHat,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Phone,
  Lock,
  User,
  ShieldCheck,
  UtensilsCrossed,
  Clock,
  Egg,
  Salad,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function RegisterPage() {
  const [registerRole, setRegisterRole] = useState<'member' | 'staff'>('member');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDiet, setRegDiet] = useState<DietPreference>('veg');
  const [regPlan, setRegPlan] = useState<PlanType>('both');
  const [regStaffRole, setRegStaffRole] = useState('मुख्य आचारी (Head Maharaj)');
  const [regSalary, setRegSalary] = useState(15000);
  const [regPassword, setRegPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Rate calculation
  const defaultRate = regDiet === 'nonveg' ? 3200 : 3000;
  const calculatedRate = regPlan === 'both' ? defaultRate : Math.round(defaultRate / 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await MessMitraApi.registerPendingMember({
        messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: regName.trim(),
        phone: regPhone.trim(),
        role: registerRole,
        dietPreference: registerRole === 'member' ? regDiet : undefined,
        planType: registerRole === 'member' ? regPlan : undefined,
        rate: registerRole === 'member' ? calculatedRate : undefined,
        staffRole: registerRole === 'staff' ? regStaffRole : undefined,
        salary: registerRole === 'staff' ? regSalary : undefined,
        password: regPassword.trim() || undefined,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'नोंदणी सबमिट करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-3 sm:p-6 text-white selection:bg-brand-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-amber-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-lg bg-slate-850/90 border border-slate-750 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-brand-500/50 shadow-xl bg-white p-0.5">
            <img
              src="/logo.jpeg"
              alt="श्री बालाजी मेस"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>२१ वर्षांची अखंड परंपरा • पुणे</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              श्री बालाजी मेस — नवीन सभासद नोंदणी
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Online Member & Staff Joining Portal
            </p>
          </div>
        </div>

        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-emerald-300">
                नोंदणी अर्ज यशस्वीरित्या सादर झाला! 🎉
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                तुमचा अर्ज मेस चालक <strong>श्री. शंकर गिरी (९८२२३३८९७५)</strong> यांच्याकडे मंजुरीसाठी पाठवण्यात आला आहे.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3.5 text-left text-xs space-y-1 font-mono border border-slate-800">
              <div className="text-slate-400">नोंदणी नाव: <span className="text-white font-bold">{regName}</span></div>
              <div className="text-slate-400">मोबाईल: <span className="text-white font-bold">{regPhone}</span></div>
              <div className="text-slate-400">
                प्रकार: <span className="text-emerald-400 font-bold">{registerRole === 'member' ? `सभासद (${regDiet.toUpperCase()} - ₹${calculatedRate}/महिना)` : `कर्मचारी (${regStaffRole})`}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>मुख्य पृष्ठावर जा (Go to Home)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Role Switcher */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                नोंदणी प्रकार निवडा (I am joining as):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterRole('member')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    registerRole === 'member'
                      ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>मेस सभासद (Member)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterRole('staff')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    registerRole === 'staff'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <ChefHat className="w-5 h-5" />
                  <span>मेस कर्मचारी (Staff)</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                पूर्ण नाव (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल देशमुख"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                मोबाईल नंबर (WhatsApp Number) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="उदा. 9890123456"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Member-specific fields */}
            {registerRole === 'member' && (
              <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                {/* Diet */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    आहार प्रकार (Diet Preference) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegDiet('veg')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                        regDiet === 'veg'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Salad className="w-4 h-4 text-emerald-400" />
                      <span>शुद्ध शाकाहारी (₹3,000)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegDiet('nonveg')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                        regDiet === 'nonveg'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Egg className="w-4 h-4 text-amber-400" />
                      <span>मांसाहारी / अंडी (₹3,200)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * मांसाहारी/अंडी विशेष जेवण फक्त बुध, शुक्र, रविवारी रात्री असते. दुपारचे जेवण १००% शाकाहारी असते.
                  </p>
                </div>

                {/* Plan */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    जेवणाची वेळ (Meal Plan) *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                    {[
                      { id: 'both', label: 'दोन्ही वेळ (Both)' },
                      { id: 'lunch', label: 'फक्त दुपार (Lunch)' },
                      { id: 'dinner', label: 'फक्त रात्र (Dinner)' },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setRegPlan(plan.id as PlanType)}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          regPlan === plan.id
                            ? 'bg-brand-600/30 border-brand-500 text-white font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Rate display */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400 font-medium">मासिक शुल्क (Monthly Fee):</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    ₹{calculatedRate.toLocaleString('en-IN')}/महिना
                  </span>
                </div>
              </div>
            )}

            {/* Staff-specific fields */}
            {registerRole === 'staff' && (
              <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    पद / काम (Role) *
                  </label>
                  <select
                    value={regStaffRole}
                    onChange={(e) => setRegStaffRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="मुख्य आचारी (Head Maharaj)">मुख्य आचारी (Head Maharaj)</option>
                    <option value="मदतनीस (Kitchen Helper)">मदतनीस (Kitchen Helper)</option>
                    <option value="पोळी मेकर (Roti Maker)">पोळी मेकर (Roti Maker)</option>
                    <option value="स्वच्छता कर्मचारी (Cleaner)">स्वच्छता कर्मचारी (Cleaner)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    अपेक्षित मासिक मानधन (Expected Salary in ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={regSalary}
                    onChange={(e) => setRegSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                पासवर्ड तयार करा (Set Password for Portal) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="किमान ४ अक्षरे / आकडे"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-brand-600 via-amber-600 to-amber-700 hover:from-brand-500 text-white font-bold rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>नोंदणी होत आहे...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>नोंदणी अर्ज सादर करा (Submit Registration)</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>मुख्य डॅशबोर्डवर परत जा (Back to Home)</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 mt-6 max-w-sm">
        श्री बालाजी मेस • चालक: <strong>शंकर गिरी (९८२२३३८९७५)</strong>
      </div>
    </main>
  );
}

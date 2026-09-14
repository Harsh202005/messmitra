'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { MessMitraApi } from '../lib/api';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ChefHat,
  User,
  Crown,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
  Clock,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { UserRole, DietPreference, PlanType } from '@messmitra/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, switchDemoRole } = useAuth();
  const { t } = useI18n();

  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [registerRole, setRegisterRole] = useState<'member' | 'staff'>('member');

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDiet, setRegDiet] = useState<DietPreference>('veg');
  const [regPlan, setRegPlan] = useState<PlanType>('both');
  const [regStaffRole, setRegStaffRole] = useState('मुख्य आचारी (Head Maharaj)');
  const [regSalary, setRegSalary] = useState(15000);
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login({ usernameOrEmail, password });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'लॉगिन अयशस्वी. कृपया आयडी आणि पासवर्ड तपासा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const rate = regDiet === 'veg' ? 3000 : 3200;
      await MessMitraApi.submitRegistration({
        messId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: regName,
        phone: regPhone,
        role: registerRole,
        dietPreference: registerRole === 'member' ? regDiet : undefined,
        planType: registerRole === 'member' ? regPlan : undefined,
        rate: registerRole === 'member' ? (regPlan === 'both' ? rate : Math.round(rate / 2)) : undefined,
        staffRole: registerRole === 'staff' ? regStaffRole : undefined,
        salary: registerRole === 'staff' ? regSalary : undefined,
        password: regPassword,
      });

      setRegSuccessMsg(
        `नोंदणी यशस्वी झाली! मेस चालक (शंकर गिरी - ९८२२३३८९७५) यांच्या मंजुरीनंतर तुमचे खाते सक्रिय होईल.`
      );
      setRegName('');
      setRegPhone('');
      setRegPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setUsernameOrEmail(demo.email);
    setPassword(demo.password);
    switchDemoRole(demo.role);
    onSuccess?.();
    onClose();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'staff':
        return <ChefHat className="w-4 h-4 text-emerald-500" />;
      case 'member':
      default:
        return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col">
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3" />

        {/* Header */}
        <div className="relative px-6 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-brand-500/40 shadow-md shrink-0 bg-white">
              <img src="/logo.jpeg" alt="श्री बालाजी मेस" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>श्री बालाजी मेस • {activeMode === 'login' ? 'लॉगिन' : 'नवीन नोंदणी'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                चालक: शंकर गिरी (९८२२३३८९७५)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="px-6 pt-4 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveMode('login');
                setErrorMsg(null);
                setRegSuccessMsg(null);
              }}
              className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'login'
                  ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>लॉगिन करा (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('register');
                setErrorMsg(null);
                setRegSuccessMsg(null);
              }}
              className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'register'
                  ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>नवीन नोंदणी (Register)</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Success Message Banner */}
          {regSuccessMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{regSuccessMsg}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                मंजुरीनंतर तुम्ही तुमच्या फोन नंबर आणि पासवर्डने लॉगिन करू शकाल.
              </p>
              <a
                href="https://wa.me/919822338975?text=Namaste%20Shankar%20Giri%20ji,%20I%20have%20submitted%20my%20registration%20on%20Shree%20Balaji%20Mess%20app.%20Please%20approve%20my%20account."
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>शंकर गिरी यांना WhatsApp करा (९८२२३३८९७५)</span>
              </a>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN MODE */}
          {activeMode === 'login' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Demo Persona Chips */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>१-क्लिक चाचणी खाती (Quick Demo Roles):</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_CREDENTIALS.map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      className="min-h-[56px] text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 border border-slate-200 dark:border-slate-700/80 transition shadow-sm flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                          {getRoleIcon(demo.role)}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {demo.title.split('(')[0]}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {demo.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 border ${demo.badgeColor}`}>
                        {demo.role.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">
                  किंवा आयडीने लॉगिन करा
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ईमेल किंवा मोबाइल नंबर *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="उदा. owner@balajimess.com किंवा 9822338975"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    पासवर्ड *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="पासवर्ड टाका"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'लॉगिन होत आहे...' : 'लॉगिन करा (Sign In)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER MODE */}
          {activeMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  नोंदणी प्रकार (I am registering as):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('member')}
                    className={`min-h-[44px] rounded-xl font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer text-xs ${
                      registerRole === 'member'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>मेस सभासद (Member)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('staff')}
                    className={`min-h-[44px] rounded-xl font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer text-xs ${
                      registerRole === 'staff'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>आचारी / कर्मचारी (Cook)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पूर्ण नाव *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. अमित जोशी"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  मोबाइल नंबर (WhatsApp) *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="उदा. 9822338975"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              {registerRole === 'member' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      आहार प्रकार *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegDiet('veg')}
                        className={`min-h-[44px] rounded-xl font-bold border transition text-xs ${
                          regDiet === 'veg'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        🟢 शाकाहारी (₹3,000)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegDiet('nonveg')}
                        className={`min-h-[44px] rounded-xl font-bold border transition text-xs ${
                          regDiet === 'nonveg'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        🔴 मांसाहारी (₹3,200)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      प्लॅन *
                    </label>
                    <select
                      value={regPlan}
                      onChange={(e) => setRegPlan(e.target.value as PlanType)}
                      className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="both">दोन्ही वेळ (दुपार + रात्र - ५६ जेवणे)</option>
                      <option value="lunch">फक्त दुपारचे जेवण (२८ जेवणे)</option>
                      <option value="dinner">फक्त रात्रीचे जेवण (२८ जेवणे)</option>
                    </select>
                  </div>
                </>
              )}

              {registerRole === 'staff' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      काम / पद *
                    </label>
                    <input
                      type="text"
                      required
                      value={regStaffRole}
                      onChange={(e) => setRegStaffRole(e.target.value)}
                      placeholder="उदा. मुख्य आचारी / मदतनीस"
                      className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      अपेक्षित मासिक मानधन (₹ Salary)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={regSalary}
                      onChange={(e) => setRegSalary(Number(e.target.value))}
                      className="w-full px-3 py-2.5 min-h-[44px] text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  लॉगिनसाठी पासवर्ड तयार करा *
                </label>
                <input
                  type="password"
                  required
                  placeholder="किमान ६ अक्षरी पासवर्ड"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'नोंदणी सुरू आहे...' : 'नोंदणी अर्ज पाठवा (Submit for Approval)'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

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
      // Reset registration form
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>श्री बालाजी मेस • {activeMode === 'login' ? 'लॉगिन' : 'नवीन नोंदणी'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                चालक: शंकर गिरी (९८२२३३८९७५)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveMode('login');
                setErrorMsg(null);
                setRegSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'login'
                  ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>लॉगिन करा (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('register');
                setErrorMsg(null);
                setRegSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'register'
                  ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>नवीन नोंदणी (Register)</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow transition"
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
            <div className="space-y-5 animate-fadeIn">
              {/* Quick Demo Persona Chips */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>१-क्लिक चाचणी खाती (Quick Demo Roles):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DEMO_CREDENTIALS.map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      className="group text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500/60 transition shadow-sm hover:shadow-md flex flex-col justify-between gap-1.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {getRoleIcon(demo.role)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demo.badgeColor}`}>
                          {demo.role.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                          {demo.title.split('(')[0]}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {demo.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  किंवा आयडी पासवर्डने लॉगिन करा (Or Login with ID)
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ईमेल किंवा युझरनेम (Email / Username ID) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="उदा. owner@balajimess.com किंवा rahul@messmitra.com"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    पासवर्ड (Password) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Demo: password123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    चाचणी पासवर्ड: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-300 font-mono font-bold">password123</code>
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'तपासत आहे...' : 'लॉगिन करा (Login)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SELF-REGISTRATION MODE */}
          {activeMode === 'register' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  तुम्ही कोण म्हणून नोंदणी करत आहात? (Register As) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('member')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      registerRole === 'member'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>👨‍🎓 सभासद (Member)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('staff')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      registerRole === 'staff'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>👨‍🍳 आचारी (Cook / Maharaj)</span>
                  </button>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    पूर्ण नाव (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. अनिकेत पवार"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    मोबाईल नंबर (Phone Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98901 12345"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Member Specific Fields */}
                {registerRole === 'member' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          आहार प्रकार (Diet) *
                        </label>
                        <select
                          value={regDiet}
                          onChange={(e) => setRegDiet(e.target.value as DietPreference)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                        >
                          <option value="veg">🟢 शाकाहारी (₹3,000 / 56 जेवण)</option>
                          <option value="nonveg">🔴 मांसाहारी (₹3,200 / 56 जेवण)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          प्लॅन (Plan Type) *
                        </label>
                        <select
                          value={regPlan}
                          onChange={(e) => setRegPlan(e.target.value as PlanType)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                        >
                          <option value="both">दोन्ही वेळ (दुपार + रात्र)</option>
                          <option value="lunch">फक्त दुपारचे जेवण</option>
                          <option value="dinner">फक्त रात्रीचे जेवण</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Staff Specific Fields */}
                {registerRole === 'staff' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          पद (Designation) *
                        </label>
                        <input
                          type="text"
                          required
                          value={regStaffRole}
                          onChange={(e) => setRegStaffRole(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          अपेक्षित मासिक वेतन (Salary) *
                        </label>
                        <input
                          type="number"
                          required
                          value={regSalary}
                          onChange={(e) => setRegSalary(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    पासवर्ड तयार करा (Create Password) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="किमान ६ अक्षरे/अंक"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-600/40 text-[11px] text-amber-800 dark:text-amber-200">
                  ⚠️ <strong>सूचना:</strong> नोंदणी दाखल केल्यानंतर मेस चालक (शंकर गिरी - ९८२२३३८९७५) यांच्या मंजुरीनंतरच ॲप वापरता येईल.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'नोंदवत आहे...' : 'नोंदणी दाखल करा (Submit Registration)'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

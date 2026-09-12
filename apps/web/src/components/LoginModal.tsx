'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../lib/auth';
import { useI18n } from '../lib/i18n';
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
} from 'lucide-react';
import { UserRole } from '@messmitra/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, switchDemoRole } = useAuth();
  const { t } = useI18n();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'staff':
        return <ChefHat className="w-4 h-4 text-emerald-400" />;
      case 'member':
      default:
        return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>रोल-बेस्ड लॉगिन (RBAC Login)</span>
              </h2>
              <p className="text-xs text-slate-400">
                आपल्या भूमिकेनुसार सुरक्षित प्रवेश (Owner / Member / Cook)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Demo Persona Chips */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>१-क्लिक चाचणी खाती (Quick Demo Roles):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className="group text-left p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-brand-500/60 transition shadow-sm hover:shadow-md flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-xl bg-slate-900 border border-slate-700">
                      {getRoleIcon(demo.role)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demo.badgeColor}`}>
                      {demo.role.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition">
                      {demo.title.split('(')[0]}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {demo.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              किंवा आयडी पासवर्डने लॉगिन करा (Or Login with ID)
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                चाचणी पासवर्ड: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-brand-300">password123</code>
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
      </div>
    </div>
  );
};

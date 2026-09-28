'use client';

import React, { useState } from 'react';
import { useI18n } from '../lib/i18n';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CloudDatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadAllData: () => Promise<void>;
}

export const CloudDatabaseSyncModal: React.FC<CloudDatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onReloadAllData,
}) => {
  const { language, t } = useI18n();

  const [supabaseUrl, setSupabaseUrl] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('messmitra_supabase_url') || '' : ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('messmitra_supabase_key') || '' : ''
  );
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        setConnectionStatus('failed');
        return;
      }
      // Test fetch to Supabase REST endpoint
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/mess?select=count`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (res.ok) {
        setConnectionStatus('success');
        localStorage.setItem('messmitra_supabase_url', supabaseUrl);
        localStorage.setItem('messmitra_supabase_key', supabaseAnonKey);
        await onReloadAllData();
      } else {
        setConnectionStatus('failed');
      }
    } catch {
      setConnectionStatus('failed');
    }
  };

  const copySqlSchema = () => {
    const sql = `-- ==============================================================================
-- MessMitra — Feature Tables & Constraint Alignment Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/usaksgxvhogqorijgowp/sql/new
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Align MEMBERS table columns & constraints
ALTER TABLE public.members ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE public.members ALTER COLUMN gender SET DEFAULT 'other';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS diet_preference VARCHAR(20) NOT NULL DEFAULT 'veg' CHECK (diet_preference IN ('veg', 'nonveg'));

-- 2. Align BILLING_CYCLES table
ALTER TABLE public.billing_cycles ADD COLUMN IF NOT EXISTS per_meal_rate NUMERIC(10, 4) NOT NULL DEFAULT 53.57;

-- 3. Align STAFF table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255), ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;

-- 4. Align EXPENSE CATEGORY constraints
ALTER TABLE public.expense_recurring DROP CONSTRAINT IF EXISTS expense_recurring_category_check;
ALTER TABLE public.expense_recurring ADD CONSTRAINT expense_recurring_category_check CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other'));

ALTER TABLE public.expense_oneoff DROP CONSTRAINT IF EXISTS expense_oneoff_category_check;
ALTER TABLE public.expense_oneoff ADD CONSTRAINT expense_oneoff_category_check CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other'));

-- 5. Align PENDING_REGISTRATIONS table
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id VARCHAR(100) PRIMARY KEY,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'staff')),
    diet_preference VARCHAR(20) DEFAULT 'veg',
    plan_type VARCHAR(20) DEFAULT 'both',
    rate NUMERIC(10, 2) DEFAULT 3000.00,
    staff_role VARCHAR(100),
    salary NUMERIC(10, 2),
    password VARCHAR(255),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CREATE STAFF_SALARY_PAYMENTS table
CREATE TABLE IF NOT EXISTS public.staff_salary_payments (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    staff_name VARCHAR(255) NOT NULL,
    month VARCHAR(7) NOT NULL,
    base_salary NUMERIC(10, 2) NOT NULL,
    advance_deductions NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    bonus_amount NUMERIC(10, 2) DEFAULT 0.00,
    net_paid NUMERIC(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('advance', 'salary_settlement', 'bonus', 'monthly_approval')),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
    paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    voucher_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CREATE STAFF_ATTENDANCE table
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'half_day', 'absent')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_staff_attendance_date UNIQUE (staff_id, date)
);

-- 8. CREATE MEAL_TOKENS table
CREATE TABLE IF NOT EXISTS public.meal_tokens (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    token_number VARCHAR(50) NOT NULL,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    plan_id VARCHAR(100),
    token_type VARCHAR(50) NOT NULL,
    token_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    diet_preference VARCHAR(20) DEFAULT 'veg',
    meal_slot VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (meal_slot IN ('lunch', 'dinner', 'both')),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash',
    status VARCHAR(20) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'expired')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CREATE MESS_PRICE_PLANS table
CREATE TABLE IF NOT EXISTS public.mess_price_plans (
    id VARCHAR(100) PRIMARY KEY,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    badge VARCHAR(100) NOT NULL,
    badge_color VARCHAR(30) DEFAULT 'purple',
    name VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    price_unit VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    description_mr TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    plan_category VARCHAR(50) NOT NULL CHECK (plan_category IN ('monthly', 'token_bundle', 'concession')),
    meals_per_day INT DEFAULT 2,
    token_count INT,
    validity_days INT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CREATE WALKIN_ORDERS table
CREATE TABLE IF NOT EXISTS public.walkin_orders (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number VARCHAR(50) NOT NULL,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'owner_pass')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(30),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CREATE MENU_CATALOG_ITEMS table
CREATE TABLE IF NOT EXISTS public.menu_catalog_items (
    id VARCHAR(100) PRIMARY KEY,
    mess_id UUID REFERENCES public.mess(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    diet VARCHAR(20) NOT NULL DEFAULT 'veg' CHECK (diet IN ('veg', 'nonveg')),
    category VARCHAR(30) NOT NULL DEFAULT 'thali' CHECK (category IN ('thali', 'parcel', 'extra')),
    is_parcel BOOLEAN NOT NULL DEFAULT false,
    icon VARCHAR(50) DEFAULT '🍛',
    badge VARCHAR(100),
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Enable RLS and create open policies
ALTER TABLE public.staff_salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_price_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access StaffSalaries') THEN
    CREATE POLICY "Public Full Access StaffSalaries" ON public.staff_salary_payments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access StaffAttendance') THEN
    CREATE POLICY "Public Full Access StaffAttendance" ON public.staff_attendance FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access MealTokens') THEN
    CREATE POLICY "Public Full Access MealTokens" ON public.meal_tokens FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access PricePlans') THEN
    CREATE POLICY "Public Full Access PricePlans" ON public.mess_price_plans FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access WalkInOrders') THEN
    CREATE POLICY "Public Full Access WalkInOrders" ON public.walkin_orders FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access MenuCatalog') THEN
    CREATE POLICY "Public Full Access MenuCatalog" ON public.menu_catalog_items FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Full Access PendingRegistrations') THEN
    CREATE POLICY "Public Full Access PendingRegistrations" ON public.pending_registrations FOR ALL USING (true);
  END IF;
END $$;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleLoadDemoData = async () => {
    setIsSyncing(true);
    try {
      localStorage.removeItem('messmitra_members');
      localStorage.removeItem('messmitra_leaves');
      localStorage.removeItem('messmitra_mess');
      localStorage.removeItem('messmitra_expenses_recurring');
      localStorage.removeItem('messmitra_expenses_oneoff');
      localStorage.removeItem('messmitra_staff');
      localStorage.removeItem('messmitra_payments');
      await onReloadAllData();
      setToast('पुणे मेसचा संपूर्ण डेमो डेटा लोड झाला! ✨');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-gradient-to-r from-brand-600 to-amber-600">
          <div className="w-12 h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg animate-bounce">
            {toast}
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-600 to-amber-600 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {language === 'en' ? 'Cloud Database & Sync' : 'क्लाउड डेटाबेस व सिंक'}
              </h3>
              <p className="text-xs text-white/80">
                {language === 'en'
                  ? 'Connect free cloud database or use offline mode'
                  : 'मोफत ऑनलाइन डेटाबेस जोडा किंवा लोकल ऑफलाइन मोड वापरा'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto">
          {/* Free Supabase Cloud Callout */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Free Supabase Database (500MB Free Forever)</span>
              </span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>{language === 'en' ? 'Sign Up' : 'खाते उघडा'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Create a free Supabase project to secure your data and enter the credentials below:'
                : 'तुमचा डेटा सुरक्षित ठेवण्यासाठी मोफत Supabase प्रोजेक्ट तयार करून खालील कळा प्रविष्ट करा:'}
            </p>

            <div className="space-y-2 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Anon / Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 text-white font-bold rounded-xl shadow transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>{language === 'en' ? 'Test Connection' : 'कनेक्शन तपासा'}</span>
              </button>

              <div>
                {connectionStatus === 'success' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'en' ? 'Connected ✅' : 'कनेक्ट झाले ✅'}</span>
                  </span>
                )}
                {connectionStatus === 'failed' && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{language === 'en' ? 'Not Connected' : 'कनेक्ट नाही'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isSyncing || !supabaseUrl || !supabaseAnonKey}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? language === 'en'
                    ? 'Syncing...'
                    : 'सिंक होत आहे...'
                  : language === 'en'
                  ? 'Save & Sync Data'
                  : 'डेटा सेव्ह व सिंक करा'}
              </span>
            </button>
          </div>

          {/* Quick Actions (Copy SQL Schema / Load Demo Dataset) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={copySqlSchema}
              className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition text-left cursor-pointer"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">
                  {language === 'en' ? 'Copy Supabase SQL' : 'Supabase SQL कॉपी करा'}
                </strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'en' ? '1-Click RLS Schema DDL' : '1-क्लिक RLS स्कीमा DDL'}
                </span>
              </div>
            </button>

            <button
              onClick={async () => {
                if (confirm('तुम्हाला खात्री आहे का? स्थानिक ब्राउझर व क्लाऊड डेटाबेसमधील सर्व जुना डेटा साफ केला जाईल.')) {
                  const { MessMitraApi } = await import('../lib/api');
                  await MessMitraApi.clearDemoData();
                  await onReloadAllData();
                  setToast(language === 'en' ? 'All database & storage wiped clean' : 'सर्व डेटाबेस व स्थानिक डेटा साफ झाला');
                  setTimeout(() => setToast(null), 3000);
                }
              }}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 p-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800 transition text-left cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <div>
                <strong className="block text-rose-800 dark:text-rose-200">
                  {language === 'en' ? 'Wipe All Demo Data' : 'सर्व डेटा साफ करा (Wipe)'}
                </strong>
                <span className="text-[10px] text-rose-600/80 dark:text-rose-400">
                  {language === 'en' ? 'Clean empty state' : 'क्लीन स्टेट सुरू करा'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'बंद करा'}
          </button>
        </div>
      </div>
    </div>
  );
};

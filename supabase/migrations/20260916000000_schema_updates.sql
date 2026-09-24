-- ==============================================================================
-- MessMitra — Schema Update Migration
-- Adds missing columns discovered during code audit
-- Run: supabase db push  OR paste into Supabase SQL Editor
-- ==============================================================================

-- ============================================================
-- 1. MESS TABLE — Add missing columns
-- ============================================================

-- Separate veg / nonveg rates (primary keys, male/female are legacy)
ALTER TABLE public.mess
  ADD COLUMN IF NOT EXISTS default_veg_rate NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
  ADD COLUMN IF NOT EXISTS default_nonveg_rate NUMERIC(10, 2) NOT NULL DEFAULT 3200.00;

-- Separate lunch & dinner cutoff times
ALTER TABLE public.mess
  ADD COLUMN IF NOT EXISTS lunch_cutoff_time TIME DEFAULT '09:00:00',
  ADD COLUMN IF NOT EXISTS dinner_cutoff_time TIME DEFAULT '18:00:00';

-- Owner contact info & branding
ALTER TABLE public.mess
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(500),
  ADD COLUMN IF NOT EXISTS established_years INT;

-- ============================================================
-- 2. MEMBERS TABLE — Add diet_preference column
-- ============================================================
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS diet_preference VARCHAR(10) NOT NULL DEFAULT 'veg'
    CHECK (diet_preference IN ('veg', 'nonveg'));

-- ============================================================
-- 3. EXPENSE_RECURRING TABLE — Add last_confirmed_month
-- ============================================================
ALTER TABLE public.expense_recurring
  ADD COLUMN IF NOT EXISTS last_confirmed_month VARCHAR(7); -- e.g. '2026-09'

-- ============================================================
-- 4. EXPAND CHECK CONSTRAINTS to include new expense categories
--    (packaging, utilities) that exist in the API but not the DB
-- ============================================================

-- Drop old constraint and recreate with full category list
ALTER TABLE public.expense_recurring
  DROP CONSTRAINT IF EXISTS expense_recurring_category_check;

ALTER TABLE public.expense_recurring
  ADD CONSTRAINT expense_recurring_category_check
    CHECK (category IN (
      'salary', 'rent', 'gas', 'groceries', 'dairy',
      'vegetables', 'maintenance', 'packaging', 'utilities', 'other'
    ));

ALTER TABLE public.expense_oneoff
  DROP CONSTRAINT IF EXISTS expense_oneoff_category_check;

ALTER TABLE public.expense_oneoff
  ADD CONSTRAINT expense_oneoff_category_check
    CHECK (category IN (
      'salary', 'rent', 'gas', 'groceries', 'dairy',
      'vegetables', 'maintenance', 'packaging', 'utilities', 'other'
    ));

-- ============================================================
-- 5. PROFILES TABLE — Make phone nullable
--    (setupMess no longer inserts a hardcoded phone)
-- ============================================================
ALTER TABLE public.profiles
  ALTER COLUMN phone DROP NOT NULL;

-- Set default '' for existing rows that might be empty
UPDATE public.profiles SET phone = '' WHERE phone IS NULL;

-- ============================================================
-- 6. BILLING_CYCLES TABLE — Add per_meal_rate column
--    (returned by the API but not stored in DB)
-- ============================================================
ALTER TABLE public.billing_cycles
  ADD COLUMN IF NOT EXISTS per_meal_rate NUMERIC(10, 4);

-- ============================================================
-- 7. INDEXES for new columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leave_mess_status ON public.leave_requests(mess_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(mess_id, status);

-- ============================================================
-- 8. TRIGGER — Auto-update updated_at on mess row changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mess_updated_at'
  ) THEN
    CREATE TRIGGER trg_mess_updated_at
      BEFORE UPDATE ON public.mess
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_members_updated_at'
  ) THEN
    CREATE TRIGGER trg_members_updated_at
      BEFORE UPDATE ON public.members
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

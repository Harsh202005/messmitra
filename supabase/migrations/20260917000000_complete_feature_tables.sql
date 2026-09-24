-- ==============================================================================
-- MessMitra — Feature Tables & Constraint Alignment Migration
-- Adds staff salary ledger, attendance, meal tokens, price plans, walkin POS orders,
-- and aligns all constraints without dropping existing tables.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Align MEMBERS table columns & constraints
ALTER TABLE public.members
  ALTER COLUMN gender DROP NOT NULL;

ALTER TABLE public.members
  ALTER COLUMN gender SET DEFAULT 'other';

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS diet_preference VARCHAR(20) NOT NULL DEFAULT 'veg'
    CHECK (diet_preference IN ('veg', 'nonveg'));

-- 2. Align BILLING_CYCLES table
ALTER TABLE public.billing_cycles
  ADD COLUMN IF NOT EXISTS per_meal_rate NUMERIC(10, 4) NOT NULL DEFAULT 53.57;

-- 3. Align STAFF table
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;

-- 4. Align EXPENSE CATEGORY constraints
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

-- 5. CREATE PENDING_REGISTRATIONS table if not exists
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id VARCHAR(100) PRIMARY KEY,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'staff')),
    diet_preference VARCHAR(20) DEFAULT 'veg',
    plan_type VARCHAR(20) DEFAULT 'both',
    rate NUMERIC(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    password VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255)
);

ALTER TABLE public.pending_registrations
  ADD COLUMN IF NOT EXISTS password VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);

-- 6. CREATE STAFF_SALARY_PAYMENTS table if not exists
CREATE TABLE IF NOT EXISTS public.staff_salary_payments (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- 7. CREATE STAFF_ATTENDANCE table if not exists
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'half_day', 'absent')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_staff_attendance_date UNIQUE (staff_id, date)
);

-- 8. CREATE MEAL_TOKENS table if not exists
CREATE TABLE IF NOT EXISTS public.meal_tokens (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- 9. CREATE MESS_PRICE_PLANS table if not exists
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

-- 10. CREATE WALKIN_ORDERS table if not exists
CREATE TABLE IF NOT EXISTS public.walkin_orders (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- 11. CREATE MENU_CATALOG_ITEMS table if not exists
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
END $$;

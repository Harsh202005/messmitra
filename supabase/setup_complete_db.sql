-- ==============================================================================
-- MessMitra (मेस मित्र) — COMPLETE 100% BULLETPROOF DATABASE SCRIPT
-- Shree Balaji Mess (श्री बालाजी मेस) — Production Ready Database Setup
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. CLEAN RESET (Ensures zero duplicate or constraint conflicts)
DROP TABLE IF EXISTS public.menu_catalog_items CASCADE;
DROP TABLE IF EXISTS public.walkin_orders CASCADE;
DROP TABLE IF EXISTS public.mess_price_plans CASCADE;
DROP TABLE IF EXISTS public.meal_tokens CASCADE;
DROP TABLE IF EXISTS public.staff_attendance CASCADE;
DROP TABLE IF EXISTS public.staff_salary_payments CASCADE;
DROP TABLE IF EXISTS public.pending_registrations CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.billing_cycles CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.expense_recurring CASCADE;
DROP TABLE IF EXISTS public.expense_oneoff CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.mess CASCADE;

-- 1. MESS TABLE (Tenant Table)
CREATE TABLE public.mess (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'श्री बालाजी मेस',
    area VARCHAR(255) NOT NULL DEFAULT 'कर्वे नगर / कोथरूड',
    city VARCHAR(255) NOT NULL DEFAULT 'पुणे',
    daily_cutoff_time TIME NOT NULL DEFAULT '18:00:00',
    lunch_cutoff_time TIME NOT NULL DEFAULT '09:00:00',
    dinner_cutoff_time TIME NOT NULL DEFAULT '18:00:00',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_name VARCHAR(255) NOT NULL DEFAULT 'शंकर गिरी',
    contact_number VARCHAR(30) NOT NULL DEFAULT '+91 98223 38975',
    upi_id VARCHAR(255) NOT NULL DEFAULT '9822338975@upi',
    default_male_rate NUMERIC(10, 2) NOT NULL DEFAULT 3200.00,
    default_female_rate NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    default_veg_rate NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    default_nonveg_rate NUMERIC(10, 2) NOT NULL DEFAULT 3200.00,
    tagline VARCHAR(255) DEFAULT 'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
    established_years INT DEFAULT 21,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID REFERENCES public.mess(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'member', 'staff')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MEMBERS TABLE
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    gender VARCHAR(10) DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
    diet_preference VARCHAR(20) NOT NULL DEFAULT 'veg' CHECK (diet_preference IN ('veg', 'nonveg')),
    rate NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (plan_type IN ('lunch', 'dinner', 'both')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LEAVE REQUESTS TABLE
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL DEFAULT 'auto_valid' CHECK (status IN ('auto_valid', 'pending_approval', 'approved', 'rejected')),
    is_late BOOLEAN NOT NULL DEFAULT false,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_leave_dates CHECK (end_date >= start_date)
);

-- 5. BILLING CYCLES TABLE
CREATE TABLE public.billing_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    base_meals INT NOT NULL DEFAULT 56,
    approved_leave_days NUMERIC(5, 1) NOT NULL DEFAULT 0,
    rate NUMERIC(10, 2) NOT NULL,
    per_meal_rate NUMERIC(10, 4) NOT NULL DEFAULT 53.57,
    amount_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_member_month UNIQUE (member_id, month)
);

-- 6. PAYMENTS TABLE
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    billing_cycle_id UUID NOT NULL REFERENCES public.billing_cycles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('upi_link', 'cash')),
    transaction_ref VARCHAR(255),
    is_adjustment BOOLEAN NOT NULL DEFAULT false,
    adjustment_note TEXT,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 7. RECURRING EXPENSES TABLE
CREATE TABLE public.expense_recurring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other')),
    payee_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
    next_due_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_confirmed_month VARCHAR(7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ONE-OFF DAILY EXPENSES TABLE
CREATE TABLE public.expense_oneoff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'packaging', 'utilities', 'other')),
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_by VARCHAR(255) NOT NULL DEFAULT 'शंकर गिरी',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STAFF TABLE
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    monthly_salary NUMERIC(10, 2) NOT NULL,
    phone VARCHAR(30),
    upi_id VARCHAR(255),
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. STAFF SALARY PAYMENTS & VOUCHERS TABLE
CREATE TABLE public.staff_salary_payments (
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

-- 11. STAFF ATTENDANCE TABLE
CREATE TABLE public.staff_attendance (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'half_day', 'absent')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_staff_attendance_date UNIQUE (staff_id, date)
);

-- 12. MEAL TOKENS TABLE
CREATE TABLE public.meal_tokens (
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

-- 13. MESS PRICE PLANS TABLE
CREATE TABLE public.mess_price_plans (
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

-- 14. POS WALKIN ORDERS TABLE
CREATE TABLE public.walkin_orders (
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

-- 15. MENU CATALOG ITEMS TABLE
CREATE TABLE public.menu_catalog_items (
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

-- 16. PENDING SELF-REGISTRATIONS TABLE (Member & Chef Self-Registration Queue)
CREATE TABLE public.pending_registrations (
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

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.mess ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_oneoff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_price_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Full Access Mess" ON public.mess FOR ALL USING (true);
CREATE POLICY "Public Full Access Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public Full Access Members" ON public.members FOR ALL USING (true);
CREATE POLICY "Public Full Access LeaveRequests" ON public.leave_requests FOR ALL USING (true);
CREATE POLICY "Public Full Access BillingCycles" ON public.billing_cycles FOR ALL USING (true);
CREATE POLICY "Public Full Access Payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Public Full Access ExpenseRecurring" ON public.expense_recurring FOR ALL USING (true);
CREATE POLICY "Public Full Access ExpenseOneoff" ON public.expense_oneoff FOR ALL USING (true);
CREATE POLICY "Public Full Access Staff" ON public.staff FOR ALL USING (true);
CREATE POLICY "Public Full Access StaffSalaries" ON public.staff_salary_payments FOR ALL USING (true);
CREATE POLICY "Public Full Access StaffAttendance" ON public.staff_attendance FOR ALL USING (true);
CREATE POLICY "Public Full Access MealTokens" ON public.meal_tokens FOR ALL USING (true);
CREATE POLICY "Public Full Access PricePlans" ON public.mess_price_plans FOR ALL USING (true);
CREATE POLICY "Public Full Access WalkInOrders" ON public.walkin_orders FOR ALL USING (true);
CREATE POLICY "Public Full Access MenuCatalog" ON public.menu_catalog_items FOR ALL USING (true);
CREATE POLICY "Public Full Access PendingRegistrations" ON public.pending_registrations FOR ALL USING (true);

-- 18. INDEXES FOR HIGH-SPEED LOOKUPS
CREATE INDEX IF NOT EXISTS idx_members_mess_status ON public.members(mess_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_mess_status ON public.leave_requests(mess_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_billing_month ON public.billing_cycles(mess_id, month);
CREATE INDEX IF NOT EXISTS idx_staff_salaries_month ON public.staff_salary_payments(mess_id, month);
CREATE INDEX IF NOT EXISTS idx_meal_tokens_status ON public.meal_tokens(mess_id, status);
CREATE INDEX IF NOT EXISTS idx_walkin_orders_mess ON public.walkin_orders(mess_id, created_at);

-- 19. TRIGGER — Auto-update updated_at on mess & members row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mess_updated_at') THEN
    CREATE TRIGGER trg_mess_updated_at BEFORE UPDATE ON public.mess FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_members_updated_at') THEN
    CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 20. SEED INITIAL MESS CONFIGURATION (Shree Balaji Mess — Shankar Giri)
INSERT INTO public.mess (
    id,
    name,
    area,
    city,
    daily_cutoff_time,
    lunch_cutoff_time,
    dinner_cutoff_time,
    owner_name,
    contact_number,
    upi_id,
    default_male_rate,
    default_female_rate,
    default_veg_rate,
    default_nonveg_rate,
    tagline,
    established_years
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'श्री बालाजी मेस',
    'कर्वे नगर / कोथरूड',
    'पुणे',
    '18:00:00',
    '09:00:00',
    '18:00:00',
    'शंकर गिरी',
    '+91 98223 38975',
    '9822338975@upi',
    3200.00,
    3000.00,
    3000.00,
    3200.00,
    'चव हीच आमची ओळख • २१ वर्षांची अखंड परंपरा',
    21
) ON CONFLICT (id) DO NOTHING;


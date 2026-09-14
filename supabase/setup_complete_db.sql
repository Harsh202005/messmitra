-- ==============================================================================
-- MessMitra (मेस मित्र) — COMPLETE 100% BULLETPROOF DATABASE SCRIPT
-- Shree Balaji Mess (श्री बालाजी मेस) — Production Ready Database Setup
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. CLEAN RESET (Ensures zero duplicate or constraint conflicts)
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
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MEMBERS TABLE
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
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
    category VARCHAR(50) NOT NULL CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'other')),
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
    category VARCHAR(50) NOT NULL CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'other')),
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
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PENDING SELF-REGISTRATIONS TABLE (Member & Chef Self-Registration Queue)
CREATE TABLE public.pending_registrations (
    id VARCHAR(50) PRIMARY KEY,
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'staff')),
    diet_preference VARCHAR(20) DEFAULT 'veg',
    plan_type VARCHAR(20) DEFAULT 'both',
    rate NUMERIC(10, 2) DEFAULT 3000.00,
    staff_role VARCHAR(100),
    salary NUMERIC(10, 2),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.mess ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_oneoff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Public Full Access PendingRegistrations" ON public.pending_registrations FOR ALL USING (true);

-- 12. SEED INITIAL DATA (Shree Balaji Mess — Shankar Giri)
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
);

INSERT INTO public.members (id, mess_id, name, phone, gender, diet_preference, rate, plan_type, join_date, status) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Rahul Deshmukh', '+91 98901 23456', 'male', 'nonveg', 3200.00, 'both', '2026-06-01', 'active'),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Priya Kulkarni', '+91 98902 34567', 'female', 'veg', 3000.00, 'both', '2026-07-15', 'active'),
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Amit Joshi', '+91 98903 45678', 'male', 'nonveg', 3200.00, 'both', '2026-08-01', 'active'),
('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Sneha Shinde', '+91 98904 56789', 'female', 'veg', 3000.00, 'both', '2026-08-10', 'active'),
('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Omkar Jadhav', '+91 98905 67890', 'male', 'veg', 1500.00, 'lunch', '2026-09-01', 'active'),
('66666666-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Tanvi Pawar', '+91 98906 78901', 'female', 'nonveg', 1600.00, 'dinner', '2026-09-05', 'active'),
('77777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Vikas Gaikwad', '+91 98907 89012', 'male', 'nonveg', 3200.00, 'both', '2026-05-10', 'inactive');

INSERT INTO public.staff (id, mess_id, name, role, monthly_salary, phone) VALUES
('aa111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mahadev Mama', 'Head Cook (महाराज)', 18000.00, '+91 97654 32101'),
('aa222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Santosh', 'Helper & Cleaning', 10000.00, '+91 97654 32102');

INSERT INTO public.expense_recurring (id, mess_id, category, payee_name, amount, frequency, next_due_date, is_active) VALUES
('ee111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'rent', 'मेस जागा भाडे (श्री कुलकर्णी)', 15000.00, 'monthly', '2026-10-01', true),
('ee222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'gas', 'HP कमर्शियल गॅस सिलिंडर (२ सिलिंडर)', 3600.00, 'monthly', '2026-09-28', true);

INSERT INTO public.expense_oneoff (id, mess_id, category, amount, date, note, created_by) VALUES
('cc111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'vegetables', 1450.00, '2026-09-02', 'ताजी भाजीपाला खरेदी (मंडी)', 'शंकर गिरी'),
('cc222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'dairy', 840.00, '2026-09-05', 'दूध, दही व पनीर', 'शंकर गिरी'),
('cc333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'groceries', 4200.00, '2026-09-08', 'कोलम तांदूळ व तूर डाळ कट्टा', 'शंकर गिरी');

INSERT INTO public.pending_registrations (id, mess_id, name, phone, role, diet_preference, plan_type, rate, status) VALUES
('reg-001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'अनिकेत पवार (Aniket Pawar)', '+91 98901 99887', 'member', 'veg', 'both', 3000.00, 'pending_approval');

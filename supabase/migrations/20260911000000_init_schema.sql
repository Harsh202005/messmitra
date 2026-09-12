-- ==============================================================================
-- MessMitra (मेस मित्र) — Multi-Tenant PostgreSQL Schema with Strict RLS & Realtime
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MESS (Tenant Table)
CREATE TABLE IF NOT EXISTS public.mess (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    daily_cutoff_time TIME NOT NULL DEFAULT '09:00:00',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upi_id VARCHAR(255) NOT NULL,
    default_male_rate NUMERIC(10, 2) NOT NULL DEFAULT 3200.00,
    default_female_rate NUMERIC(10, 2) NOT NULL DEFAULT 2800.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER PROFILES (Links auth.users to a Mess and Role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    mess_id UUID REFERENCES public.mess(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'member', 'staff')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MEMBERS (Lightweight Member Record managed by Mess Owner)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    rate NUMERIC(10, 2) NOT NULL,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (plan_type IN ('lunch', 'dinner', 'both')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LEAVE REQUESTS (Timestamped audit record for dispute resolution)
CREATE TABLE IF NOT EXISTS public.leave_requests (
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

-- 5. BILLING CYCLES (Monthly Ledger per Member)
CREATE TABLE IF NOT EXISTS public.billing_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- e.g. '2026-09'
    base_meals INT NOT NULL DEFAULT 56,
    approved_leave_days NUMERIC(5, 1) NOT NULL DEFAULT 0,
    rate NUMERIC(10, 2) NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_member_month UNIQUE (member_id, month)
);

-- 6. PAYMENTS (Immutable transaction log & adjustments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    billing_cycle_id UUID NOT NULL REFERENCES public.billing_cycles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('upi_link', 'cash')),
    transaction_ref VARCHAR(255),
    is_adjustment BOOLEAN NOT NULL DEFAULT false,
    adjustment_note TEXT,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. RECURRING EXPENSES (Salaries, Rent, Gas)
CREATE TABLE IF NOT EXISTS public.expense_recurring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'other')),
    payee_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
    next_due_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ONE-OFF EXPENSES (Daily market purchases, repairs)
CREATE TABLE IF NOT EXISTS public.expense_oneoff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('salary', 'rent', 'gas', 'groceries', 'dairy', 'vegetables', 'maintenance', 'other')),
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STAFF (Lightweight tagging for salary expenses)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    monthly_salary NUMERIC(10, 2) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_mess_owner ON public.mess(owner_id);
CREATE INDEX IF NOT EXISTS idx_members_mess ON public.members(mess_id);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_leave_mess_date ON public.leave_requests(mess_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_member ON public.leave_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_billing_mess_month ON public.billing_cycles(mess_id, month);
CREATE INDEX IF NOT EXISTS idx_payments_billing_cycle ON public.payments(billing_cycle_id);
CREATE INDEX IF NOT EXISTS idx_expense_oneoff_mess_date ON public.expense_oneoff(mess_id, date);

-- ==============================================================================
-- RLS HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_current_user_mess_id()
RETURNS UUID AS $$
    SELECT COALESCE(
        (SELECT id FROM public.mess WHERE owner_id = auth.uid() LIMIT 1),
        (SELECT mess_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_mess_owner(target_mess_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.mess
        WHERE id = target_mess_id AND owner_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES (MULTI-TENANCY ENFORCEMENT)
-- ==============================================================================
ALTER TABLE public.mess ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_oneoff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can create a mess" ON public.mess FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can view and update their own mess" ON public.mess FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Members can view their mess details" ON public.mess FOR SELECT USING (id = public.get_current_user_mess_id());

CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "Owners can view profiles in their mess" ON public.profiles FOR SELECT USING (mess_id = public.get_current_user_mess_id());

CREATE POLICY "Owners can manage members in their mess" ON public.members FOR ALL USING (public.is_mess_owner(mess_id));
CREATE POLICY "Members can view their own record" ON public.members FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can manage leave requests in their mess" ON public.leave_requests FOR ALL USING (public.is_mess_owner(mess_id));
CREATE POLICY "Members can submit and view their own leaves" ON public.leave_requests FOR ALL USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Owners can manage billing in their mess" ON public.billing_cycles FOR ALL USING (public.is_mess_owner(mess_id));
CREATE POLICY "Members can view their own billing cycles" ON public.billing_cycles FOR SELECT USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Owners can record and view payments in their mess" ON public.payments FOR ALL USING (public.is_mess_owner(mess_id));
CREATE POLICY "Members can view their own payments" ON public.payments FOR SELECT USING (billing_cycle_id IN (SELECT id FROM public.billing_cycles WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())));

CREATE POLICY "Owners can manage recurring expenses" ON public.expense_recurring FOR ALL USING (public.is_mess_owner(mess_id));
CREATE POLICY "Owners can manage one-off expenses" ON public.expense_oneoff FOR ALL USING (public.is_mess_owner(mess_id));
CREATE POLICY "Owners can manage staff" ON public.staff FOR ALL USING (public.is_mess_owner(mess_id));

-- ==============================================================================
-- REALTIME REPLICATION PUBLICATION (SUPABASE REALTIME FOR ALL TABLES)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mess;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.billing_cycles;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_recurring;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_oneoff;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
    END IF;
END $$;

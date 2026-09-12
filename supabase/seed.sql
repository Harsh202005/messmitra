-- ==============================================================================
-- MessMitra Seed Data — Balaji Executive Mess (Pune)
-- ==============================================================================

-- 1. Demo Mess
INSERT INTO public.mess (
    id,
    name,
    area,
    city,
    daily_cutoff_time,
    owner_id,
    upi_id,
    default_male_rate,
    default_female_rate
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Balaji Executive Dining & Mess',
    'Karve Nagar / Kothrud',
    'Pune',
    '09:00:00',
    '00000000-0000-0000-0000-000000000001',
    'balajimess@okhdfcbank',
    3200.00,
    2800.00
) ON CONFLICT (id) DO NOTHING;

-- 2. Owner Profile
INSERT INTO public.profiles (
    id,
    mess_id,
    role,
    full_name,
    phone
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'owner',
    'Ganesh Balaji Patil',
    '+91 98220 12345'
) ON CONFLICT (id) DO NOTHING;

-- 3. Initial Active & Inactive Members
INSERT INTO public.members (id, mess_id, name, phone, gender, rate, plan_type, join_date, status) VALUES
('m1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Rahul Deshmukh', '+91 98901 23456', 'male', 3200.00, 'both', '2026-06-01', 'active'),
('m2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Priya Kulkarni', '+91 98902 34567', 'female', 2800.00, 'both', '2026-07-15', 'active'),
('m3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Amit Joshi', '+91 98903 45678', 'male', 3200.00, 'both', '2026-08-01', 'active'),
('m4444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Sneha Shinde', '+91 98904 56789', 'female', 2800.00, 'both', '2026-08-10', 'active'),
('m5555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Omkar Jadhav', '+91 98905 67890', 'male', 1800.00, 'lunch', '2026-09-01', 'active'),
('m6666666-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Tanvi Pawar', '+91 98906 78901', 'female', 1600.00, 'dinner', '2026-09-05', 'active'),
('m7777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Vikas Gaikwad', '+91 98907 89012', 'male', 3200.00, 'both', '2026-05-10', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Staff
INSERT INTO public.staff (id, mess_id, name, role, monthly_salary, phone) VALUES
('s1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mahadev Mama', 'Head Cook (महाराज)', 18000.00, '+91 97654 32101'),
('s2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Santosh', 'Helper & Cleaning', 10000.00, '+91 97654 32102')
ON CONFLICT (id) DO NOTHING;

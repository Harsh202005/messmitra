-- ==============================================================================
-- MessMitra Seed Data — Shree Balaji Mess (श्री बालाजी मेस, Pune)
-- ==============================================================================

-- 0. Ensure foreign key flexibility for demo data
ALTER TABLE public.mess ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.mess DROP CONSTRAINT IF EXISTS mess_owner_id_fkey;
ALTER TABLE public.mess ADD CONSTRAINT mess_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 1. Demo Mess
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
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    area = EXCLUDED.area,
    city = EXCLUDED.city,
    daily_cutoff_time = EXCLUDED.daily_cutoff_time,
    lunch_cutoff_time = EXCLUDED.lunch_cutoff_time,
    dinner_cutoff_time = EXCLUDED.dinner_cutoff_time,
    owner_name = EXCLUDED.owner_name,
    contact_number = EXCLUDED.contact_number,
    upi_id = EXCLUDED.upi_id,
    default_veg_rate = EXCLUDED.default_veg_rate,
    default_nonveg_rate = EXCLUDED.default_nonveg_rate;

-- 2. Initial Active & Inactive Members (Using strictly valid hexadecimal UUIDs)
INSERT INTO public.members (id, mess_id, name, phone, gender, diet_preference, rate, plan_type, join_date, status) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Rahul Deshmukh', '+91 98901 23456', 'male', 'nonveg', 3200.00, 'both', '2026-06-01', 'active'),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Priya Kulkarni', '+91 98902 34567', 'female', 'veg', 3000.00, 'both', '2026-07-15', 'active'),
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Amit Joshi', '+91 98903 45678', 'male', 'nonveg', 3200.00, 'both', '2026-08-01', 'active'),
('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Sneha Shinde', '+91 98904 56789', 'female', 'veg', 3000.00, 'both', '2026-08-10', 'active'),
('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Omkar Jadhav', '+91 98905 67890', 'male', 'veg', 1500.00, 'lunch', '2026-09-01', 'active'),
('66666666-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Tanvi Pawar', '+91 98906 78901', 'female', 'nonveg', 1600.00, 'dinner', '2026-09-05', 'active'),
('77777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Vikas Gaikwad', '+91 98907 89012', 'male', 'nonveg', 3200.00, 'both', '2026-05-10', 'inactive')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    rate = EXCLUDED.rate,
    diet_preference = EXCLUDED.diet_preference;

-- 3. Sample Staff
INSERT INTO public.staff (id, mess_id, name, role, monthly_salary, phone) VALUES
('aa111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mahadev Mama', 'Head Cook (महाराज)', 18000.00, '+91 97654 32101'),
('aa222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Santosh', 'Helper & Cleaning', 10000.00, '+91 97654 32102')
ON CONFLICT (id) DO UPDATE SET monthly_salary = EXCLUDED.monthly_salary;

-- 4. Sample Recurring Expenses
INSERT INTO public.expense_recurring (id, mess_id, category, payee_name, amount, frequency, next_due_date, is_active) VALUES
('ee111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'rent', 'मेस जागा भाडे (श्री कुलकर्णी)', 15000.00, 'monthly', '2026-10-01', true),
('ee222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'gas', 'HP कमर्शियल गॅस सिलिंडर (२ सिलिंडर)', 3600.00, 'monthly', '2026-09-28', true)
ON CONFLICT (id) DO NOTHING;

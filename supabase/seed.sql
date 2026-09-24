-- ==============================================================================
-- MessMitra Seed Data — Shree Balaji Mess (श्री बालाजी मेस, Pune)
-- ==============================================================================

-- 0. Ensure foreign key flexibility
ALTER TABLE public.mess ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.mess DROP CONSTRAINT IF EXISTS mess_owner_id_fkey;
ALTER TABLE public.mess ADD CONSTRAINT mess_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 1. Initial Mess Setup
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


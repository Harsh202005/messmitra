-- Align pending_registrations table columns and status constraint
ALTER TABLE public.pending_registrations
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS staff_role VARCHAR(100),
  ADD COLUMN IF NOT EXISTS salary NUMERIC(10, 2);

ALTER TABLE public.pending_registrations
  DROP CONSTRAINT IF EXISTS pending_registrations_status_check;

ALTER TABLE public.pending_registrations
  ADD CONSTRAINT pending_registrations_status_check
    CHECK (status IN ('pending', 'pending_approval', 'approved', 'rejected'));

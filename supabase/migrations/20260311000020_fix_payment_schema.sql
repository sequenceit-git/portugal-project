-- ============================================================
--  020: Fix payment — add per_person_rate & fix booking RLS
-- ============================================================
--  Issues fixed:
--   1. Missing per_person_rate column → INSERT fails
--   2. anon SELECT policy too restrictive → .select("id")
--      after insert fails for "reserved" status bookings
-- ============================================================

-- 1. Add per_person_rate column to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS per_person_rate NUMERIC(10,2);

-- 2. Drop the restrictive anon select policy
DROP POLICY IF EXISTS "anon_select_own_pending_bookings" ON public.bookings;

-- 3. Create a broader anon select policy that covers both
--    pending/unpaid AND reserved bookings so the INSERT...RETURNING works
CREATE POLICY "anon_select_recent_bookings"
  ON public.bookings
  FOR SELECT
  TO anon
  USING (
    status IN ('pending', 'reserved')
    AND created_at > (NOW() - INTERVAL '1 hour')
  );

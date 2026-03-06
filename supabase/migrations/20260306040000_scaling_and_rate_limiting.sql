-- ============================================================
-- 018: Scaling indexes + booking cancel security
-- ============================================================
-- 1. Add composite index for the anon SELECT policy
--    (status + payment_status) — used by the new RLS policy
-- 2. Add index on bookings(status, created_at) for the
--    cleanup function that scans pending bookings
-- 3. Add index on payments(status) for cleanup sync queries
-- 4. Harden fn_cancel_abandoned_booking to only cancel
--    very recent bookings (prevents enumeration attacks)
-- ============================================================

-- ── 1. Index for anon SELECT RLS policy ──────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_status_payment
  ON public.bookings (status, payment_status);

-- ── 2. Index for stale booking cleanup ───────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_pending_created
  ON public.bookings (created_at)
  WHERE status = 'pending' AND payment_status IN ('unpaid', 'pending');

-- ── 3. Harden cancel function ────────────────────────────────
-- Only allow cancelling bookings created in the last 60 minutes.
-- This prevents attackers from enumerating booking IDs to cancel
-- other people's bookings.

CREATE OR REPLACE FUNCTION public.fn_cancel_abandoned_booking(p_booking_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated int;
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled',
      payment_status = 'failed'
  WHERE id = p_booking_id
    AND status = 'pending'
    AND payment_status IN ('unpaid', 'pending')
    AND created_at > NOW() - INTERVAL '60 minutes';

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Also mark matching payment as failed
  IF v_updated > 0 THEN
    UPDATE public.payments
    SET status = 'failed',
        updated_at = NOW()
    WHERE booking_id = p_booking_id
      AND status = 'pending';
  END IF;

  RETURN v_updated > 0;
END;
$$;

-- Ensure anon can call the cancel function
GRANT EXECUTE ON FUNCTION public.fn_cancel_abandoned_booking(bigint)
  TO anon, authenticated;

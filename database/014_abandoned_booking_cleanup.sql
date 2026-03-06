-- ============================================================
-- 014: Abandoned Booking Cleanup
-- ============================================================
-- Problem: When users start a booking but never pay (close
-- browser, abandon Stripe checkout), the pending booking sits
-- in the database forever, eating up tour capacity.
--
-- Solution:
-- 1. Stripe checkout sessions now expire after 30 minutes
--    (set in create-checkout Edge Function via expires_at).
-- 2. Cancel page (BookingCancel) now calls fn_cancel_abandoned_booking()
--    to immediately release the spot when user clicks "Cancel".
-- 3. pg_cron job runs every 5 minutes to auto-cancel any
--    pending bookings older than 30 minutes (catches users who
--    just close the browser without hitting cancel).
-- 4. Stripe webhook already handles checkout.session.expired
--    event as a safety net.
-- ============================================================

-- ── 1. RPC: Cancel an abandoned pending booking ─────────────
-- Called from the BookingCancel page when user clicks cancel on Stripe.
-- SECURITY DEFINER so anon clients can call it without UPDATE permission.
-- Only cancels if status = 'pending' AND payment_status in ('unpaid','pending').

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
    AND payment_status IN ('unpaid', 'pending');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_cancel_abandoned_booking(bigint)
  TO anon, authenticated;

-- ── 2. Scheduled cleanup: auto-cancel stale bookings ─────────
-- Catches bookings where the user closed the browser without
-- pressing cancel, and the Stripe webhook didn't fire (e.g.
-- booking was created but Stripe session was never started).

CREATE OR REPLACE FUNCTION public.fn_cleanup_stale_bookings()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled',
      payment_status = 'expired'
  WHERE status = 'pending'
    AND payment_status IN ('unpaid', 'pending')
    AND created_at < NOW() - INTERVAL '30 minutes';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count > 0 THEN
    RAISE LOG 'Cleaned up % stale unpaid bookings', v_count;
  END IF;

  RETURN v_count;
END;
$$;

-- ── 3. pg_cron job: run cleanup every 5 minutes ─────────────
-- Note: pg_cron must be enabled in Supabase Dashboard → Extensions
SELECT cron.schedule(
  'cleanup-stale-bookings',
  '*/5 * * * *',
  'SELECT public.fn_cleanup_stale_bookings();'
);

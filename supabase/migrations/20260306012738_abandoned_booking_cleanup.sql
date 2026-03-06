-- ============================================================
-- 014: Abandoned Booking Cleanup
-- ============================================================
-- 1. RPC to cancel abandoned pending bookings from cancel page
-- 2. Scheduled cleanup function for stale bookings (30 min)
-- 3. pg_cron job every 5 minutes
-- ============================================================

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

SELECT cron.schedule(
  'cleanup-stale-bookings',
  '*/5 * * * *',
  'SELECT public.fn_cleanup_stale_bookings();'
);

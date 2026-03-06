-- ============================================================
-- 015: Full Payment–Booking–Stripe Sync
-- ============================================================
-- Fixes sync gaps between bookings, payments, stripe.checkout_sessions,
-- and the Stripe webhook handler.
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. IMPROVED TRIGGER: stripe.checkout_sessions → bookings + payments
-- ══════════════════════════════════════════════════════════════
-- The old trigger didn't properly update booking.status on expiry
-- and didn't handle edge cases. This version:
--   • Sets both booking.status AND booking.payment_status
--   • Handles expired sessions correctly
--   • Won't downgrade a confirmed booking back to pending
--   • Updates payments.updated_at on changes

CREATE OR REPLACE FUNCTION public.fn_sync_stripe_checkout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id       bigint;
  v_pay_status       text;
  v_booking_status   text;
  v_current_bk_status text;
BEGIN
  -- Extract booking_id from metadata
  v_booking_id := (NEW.metadata->>'booking_id')::bigint;
  IF v_booking_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Map Stripe session state → our unified status
  IF NEW.payment_status = 'paid' THEN
    v_pay_status     := 'paid';
    v_booking_status := 'confirmed';
  ELSIF NEW.status = 'expired' THEN
    v_pay_status     := 'failed';
    v_booking_status := 'cancelled';
  ELSIF NEW.status = 'complete' AND NEW.payment_status = 'unpaid' THEN
    -- Complete but unpaid = abandoned / failed
    v_pay_status     := 'failed';
    v_booking_status := 'cancelled';
  ELSE
    v_pay_status     := 'pending';
    v_booking_status := 'pending';
  END IF;

  -- Guard: never revert a cancelled or confirmed booking back to pending.
  -- Stripe Sync Engine may re-sync "open/unpaid" sessions, but if we've
  -- already cancelled the booking locally, skip the entire sync.
  SELECT status INTO v_current_bk_status
  FROM public.bookings WHERE id = v_booking_id;

  IF v_current_bk_status IN ('cancelled', 'confirmed')
     AND v_booking_status = 'pending' THEN
    RETURN NEW;
  END IF;

  -- Upsert into public.payments
  INSERT INTO public.payments (
    booking_id, stripe_session_id, amount, currency,
    status, customer_email, customer_name, tour_name
  )
  VALUES (
    v_booking_id,
    NEW.id,
    (NEW.amount_total::numeric / 100),
    COALESCE(NEW.currency, 'eur'),
    v_pay_status,
    NEW.customer_email,
    NEW.metadata->>'customer_name',
    NEW.metadata->>'tour_name'
  )
  ON CONFLICT (stripe_session_id) DO UPDATE SET
    status         = EXCLUDED.status,
    amount         = EXCLUDED.amount,
    customer_email = EXCLUDED.customer_email,
    updated_at     = NOW();

  -- Update booking
  UPDATE public.bookings
  SET payment_status    = v_pay_status,
      status            = v_booking_status,
      stripe_session_id = NEW.id
  WHERE id = v_booking_id;

  RETURN NEW;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 2. IMPROVED CLEANUP: also sync payments table
-- ══════════════════════════════════════════════════════════════
-- When we cancel stale bookings, also mark their payments as expired.

CREATE OR REPLACE FUNCTION public.fn_cleanup_stale_bookings()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
  v_ids   bigint[];
BEGIN
  -- Find stale booking IDs
  SELECT array_agg(id) INTO v_ids
  FROM public.bookings
  WHERE status = 'pending'
    AND payment_status IN ('unpaid', 'pending')
    AND created_at < NOW() - INTERVAL '30 minutes';

  IF v_ids IS NULL OR array_length(v_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  -- Cancel the bookings
  UPDATE public.bookings
  SET status = 'cancelled',
      payment_status = 'expired'
  WHERE id = ANY(v_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also mark matching payments as expired
  UPDATE public.payments
  SET status = 'expired',
      updated_at = NOW()
  WHERE booking_id = ANY(v_ids)
    AND status IN ('pending');

  IF v_count > 0 THEN
    RAISE LOG 'Cleaned up % stale unpaid bookings', v_count;
  END IF;

  RETURN v_count;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 3. IMPROVED CANCEL RPC: also sync payments table
-- ══════════════════════════════════════════════════════════════

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

-- ══════════════════════════════════════════════════════════════
-- 4. ONE-TIME FIX: sync all existing out-of-sync records
-- ══════════════════════════════════════════════════════════════

-- Fix bookings that are cancelled but payments still show pending
UPDATE public.payments p
SET status = 'failed',
    updated_at = NOW()
FROM public.bookings b
WHERE p.booking_id = b.id
  AND b.status = 'cancelled'
  AND p.status = 'pending';

-- Fix bookings with payment_status still 'pending' when status is 'cancelled'
UPDATE public.bookings
SET payment_status = 'expired'
WHERE status = 'cancelled'
  AND payment_status IN ('pending', 'unpaid');

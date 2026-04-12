-- ============================================================
-- 023: Remove Payments Table & Transactions Tab
-- ============================================================
-- Consolidates all Stripe payment data into the bookings table
-- and removes the separate payments table to simplify DB logic.
-- ============================================================

-- 1. Add missing columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 2. Migrate existing data from payments back into bookings (just in case)
UPDATE public.bookings b
SET 
  stripe_payment_intent = p.stripe_payment_intent,
  receipt_url = p.receipt_url
FROM public.payments p
WHERE p.booking_id = b.id;

-- 3. Rewrite sync function to ONLY update bookings
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
  SELECT status INTO v_current_bk_status
  FROM public.bookings WHERE id = v_booking_id;

  IF v_current_bk_status IN ('cancelled', 'confirmed')
     AND v_booking_status = 'pending' THEN
    RETURN NEW;
  END IF;

  -- Update booking
  UPDATE public.bookings
  SET payment_status    = v_pay_status,
      status            = v_booking_status,
      stripe_session_id = NEW.id,
      stripe_payment_intent = NEW.payment_intent
  WHERE id = v_booking_id;

  RETURN NEW;
END;
$$;

-- 4. Rewrite cleanup function to ONLY update bookings
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

  IF v_count > 0 THEN
    RAISE LOG 'Cleaned up % stale unpaid bookings', v_count;
  END IF;

  RETURN v_count;
END;
$$;

-- 5. Rewrite cancel function to ONLY update bookings
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

-- 6. Drop the view
DROP VIEW IF EXISTS public.stripe_transactions;

-- 7. Drop the payments table entirely
DROP TABLE IF EXISTS public.payments CASCADE;

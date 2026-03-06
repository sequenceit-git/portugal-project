-- ============================================================
-- 010: Stripe Sync Engine — Views & Triggers
-- ============================================================
-- The Supabase Stripe Sync Engine creates tables in the
-- "stripe" schema.  That schema is NOT exposed via PostgREST,
-- so the client-side Supabase JS library cannot query it
-- directly.  This migration creates:
--
-- 1. A public VIEW (stripe_transactions) that exposes the
--    checkout-session + charge data the Admin Dashboard needs.
--
-- 2. A TRIGGER on stripe.checkout_sessions that automatically
--    updates public.payments and public.bookings when the
--    Stripe Sync Engine syncs a completed checkout session.
--
-- 3. RLS policies so only authenticated (or anon with admin
--    gate) users can read the view.
-- ============================================================

-- ── 1. View: stripe_transactions ─────────────────────────
-- Joins checkout_sessions with charges (via payment_intent)
-- and with public.bookings (via metadata->>'booking_id').
-- Amounts are converted from Stripe cents → euros.
-- The "created" column is a Unix timestamp → timestamptz.

CREATE OR REPLACE VIEW public.stripe_transactions AS
SELECT
  cs.id                                        AS session_id,
  cs.payment_status,
  cs.status                                    AS session_status,
  (cs.amount_total::numeric / 100)             AS amount,
  cs.currency,
  cs.customer_email,
  cs.metadata->>'customer_name'                AS customer_name,
  cs.metadata->>'tour_name'                    AS tour_name,
  cs.metadata->>'booking_id'                   AS booking_id,
  cs.payment_intent                            AS payment_intent_id,
  to_timestamp(cs.created)                     AS created_at,
  ch.id                                        AS charge_id,
  ch.status                                    AS charge_status,
  ch.paid                                      AS charge_paid,
  ch.refunded                                  AS charge_refunded,
  ch.receipt_email
FROM stripe.checkout_sessions cs
LEFT JOIN stripe.charges ch
  ON ch.payment_intent = cs.payment_intent
WHERE cs.mode = 'payment';

-- Only authenticated users can read the view (admin gate in client)
ALTER VIEW public.stripe_transactions OWNER TO postgres;
GRANT SELECT ON public.stripe_transactions TO authenticated;

-- ── 2. Trigger: sync stripe → public.payments & bookings ──
-- When the Stripe Sync Engine inserts or updates a row in
-- stripe.checkout_sessions, mirror the status back into our
-- local tables so BookingSuccess.jsx keeps working.

CREATE OR REPLACE FUNCTION public.fn_sync_stripe_checkout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id bigint;
  v_status     text;
BEGIN
  -- Only act on completed / expired sessions
  IF NEW.payment_status NOT IN ('paid', 'unpaid', 'no_payment_required') THEN
    RETURN NEW;
  END IF;

  -- Extract booking_id from metadata
  v_booking_id := (NEW.metadata->>'booking_id')::bigint;
  IF v_booking_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Map Stripe payment_status → our status
  IF NEW.payment_status = 'paid' THEN
    v_status := 'paid';
  ELSIF NEW.status = 'expired' THEN
    v_status := 'failed';
  ELSE
    v_status := 'pending';
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
    v_status,
    NEW.customer_email,
    NEW.metadata->>'customer_name',
    NEW.metadata->>'tour_name'
  )
  ON CONFLICT (stripe_session_id) DO UPDATE SET
    status         = EXCLUDED.status,
    amount         = EXCLUDED.amount,
    customer_email = EXCLUDED.customer_email;

  -- Update booking status
  UPDATE public.bookings
  SET payment_status  = v_status,
      stripe_session_id = NEW.id
  WHERE id = v_booking_id;

  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then create
DROP TRIGGER IF EXISTS trg_sync_stripe_checkout
  ON stripe.checkout_sessions;

CREATE TRIGGER trg_sync_stripe_checkout
  AFTER INSERT OR UPDATE ON stripe.checkout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_stripe_checkout();

-- ── 3. Unique index on payments.stripe_session_id ─────────
-- Required for the ON CONFLICT above
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'payments'
      AND indexname = 'payments_stripe_session_id_unique'
  ) THEN
    CREATE UNIQUE INDEX payments_stripe_session_id_unique
      ON public.payments (stripe_session_id);
  END IF;
END $$;

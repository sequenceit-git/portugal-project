-- ============================================================
-- 013: Fix stripe_transactions permissions + double booking
-- ============================================================
-- 1. Lock down stripe_transactions view (was UNRESTRICTED)
-- 2. Add unique index to prevent duplicate active bookings
-- 3. Add capacity check trigger to prevent overbooking
-- 4. Add fn_available_spots() for frontend slot checking
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. FIX STRIPE_TRANSACTIONS VIEW PERMISSIONS
-- ══════════════════════════════════════════════════════════════
-- Previously had INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES,
-- TRIGGER granted to anon and full access to authenticated.
-- Should be: SELECT only for authenticated, nothing for anon.

REVOKE ALL ON public.stripe_transactions FROM anon;
REVOKE ALL ON public.stripe_transactions FROM authenticated;
GRANT SELECT ON public.stripe_transactions TO authenticated;

-- ══════════════════════════════════════════════════════════════
-- 2. PREVENT DUPLICATE BOOKINGS
-- ══════════════════════════════════════════════════════════════
-- A unique partial index prevents the same person from booking
-- the same tour + date + time twice. Cancelled/failed bookings
-- are excluded so rebooking is still possible.

-- First, cancel older duplicate bookings (keep most recent)
UPDATE public.bookings
SET status = 'cancelled'
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY tour_id, booking_date, booking_time, email
             ORDER BY created_at DESC
           ) AS rn
    FROM public.bookings
    WHERE status NOT IN ('cancelled', 'failed')
  ) ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_duplicates
  ON public.bookings (tour_id, booking_date, booking_time, email)
  WHERE status NOT IN ('cancelled', 'failed');

-- ══════════════════════════════════════════════════════════════
-- 3. CAPACITY CHECK TRIGGER
-- ══════════════════════════════════════════════════════════════
-- Before every INSERT/UPDATE on bookings, verify that adding
-- total_guests does not exceed tours.people for that slot.

CREATE OR REPLACE FUNCTION public.fn_check_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_people  int;
  v_booked_guests int;
BEGIN
  -- Look up tour capacity
  SELECT people INTO v_max_people
    FROM public.tours WHERE id = NEW.tour_id;

  -- If tour not found or no limit set, allow
  IF v_max_people IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count already-booked guests for this slot (excluding self)
  SELECT COALESCE(SUM(total_guests), 0) INTO v_booked_guests
    FROM public.bookings
    WHERE tour_id     = NEW.tour_id
      AND booking_date = NEW.booking_date
      AND booking_time = NEW.booking_time
      AND status NOT IN ('cancelled', 'failed')
      AND id != COALESCE(NEW.id, 0);

  IF (v_booked_guests + NEW.total_guests) > v_max_people THEN
    RAISE EXCEPTION
      'Tour is fully booked for this time slot. Only % spots remaining.',
      (v_max_people - v_booked_guests);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_booking_capacity ON public.bookings;
CREATE TRIGGER trg_check_booking_capacity
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_check_booking_capacity();

-- ══════════════════════════════════════════════════════════════
-- 4. AVAILABLE SPOTS FUNCTION (for frontend)
-- ══════════════════════════════════════════════════════════════
-- Call from client: supabase.rpc('fn_available_spots', { ... })

CREATE OR REPLACE FUNCTION public.fn_available_spots(
  p_tour_id bigint,
  p_date    date,
  p_time    text
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max    int;
  v_booked int;
BEGIN
  SELECT people INTO v_max
    FROM public.tours WHERE id = p_tour_id;

  IF v_max IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(total_guests), 0) INTO v_booked
    FROM public.bookings
    WHERE tour_id     = p_tour_id
      AND booking_date = p_date
      AND booking_time = p_time
      AND status NOT IN ('cancelled', 'failed');

  RETURN GREATEST(v_max - v_booked, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_available_spots(bigint, date, text)
  TO anon, authenticated;

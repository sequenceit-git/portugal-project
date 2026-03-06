-- ============================================================
-- 016: Fix capacity check trigger — add SECURITY DEFINER
-- ============================================================
-- The fn_check_booking_capacity() trigger fires on INSERT into
-- bookings. It reads from both bookings and tours tables.
-- After 011_security_lockdown removed anon SELECT on bookings,
-- the trigger fails with RLS violation (42501) when an anon
-- user creates a booking, because the trigger runs in the
-- caller's security context and anon cannot read bookings.
--
-- Fix: add SECURITY DEFINER so the trigger executes as the
-- function owner (postgres), bypassing RLS for its queries.
-- ============================================================

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

-- ============================================================
--  019: Remove group size limits & add meeting_point to bookings
-- ============================================================
--  Changes:
--   1. Add meeting_point column to bookings table
--   2. Drop the capacity check trigger (no group size limit)
--   3. Replace fn_check_booking_capacity with a no-op
--   4. Replace fn_available_spots to always return 999 (unlimited)
--
--  Safe to run multiple times.
-- ============================================================

-- 1. Add meeting_point column to bookings
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS meeting_point TEXT;

-- 2. Drop the capacity check trigger on bookings
--    (it enforced tour.people as the max capacity per slot)
-- ============================================================
DROP TRIGGER IF EXISTS trg_check_booking_capacity ON public.bookings;

-- 3. Replace fn_check_booking_capacity with a pass-through
--    (no capacity enforcement — unlimited group size)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_check_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- No capacity limit enforced — unlimited group size
  RETURN NEW;
END;
$$;

-- 4. Replace fn_available_spots to always return a large number
--    (keeps the function signature intact for any callers)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_available_spots(
  p_tour_id bigint,
  p_date    date,
  p_time    text
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- No capacity limit — always report spots available
  RETURN 999;
END;
$$;

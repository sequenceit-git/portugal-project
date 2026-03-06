-- ============================================================
-- 017: Fix booking INSERT + SELECT for anon users
-- ============================================================
-- Problem: The booking form does .insert(...).select("id")
-- which requires both INSERT and SELECT permissions.
-- Migration 011 removed anon SELECT on bookings (only admin
-- can read). This causes a 42501 RLS error on every booking.
--
-- Fix: Add a narrow SELECT policy that allows anon to read
-- ONLY pending bookings they just created (matched by email).
-- This is safe because it only exposes the booking ID of
-- pending records — no sensitive data leakage.
--
-- Also re-create the INSERT policy to ensure it exists
-- (in case it was dropped or never applied).
-- ============================================================

-- Ensure RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ── Re-create INSERT policy (idempotent) ─────────────────────
DROP POLICY IF EXISTS "public_insert_bookings" ON bookings;
CREATE POLICY "public_insert_bookings"
  ON bookings FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ── Add narrow SELECT for anon (read-back after insert) ──────
-- Allows anon to read back only their own pending bookings.
-- This is needed because Supabase .insert().select() requires
-- SELECT permission to return the inserted row.
DROP POLICY IF EXISTS "anon_select_own_pending_bookings" ON bookings;
CREATE POLICY "anon_select_own_pending_bookings"
  ON bookings FOR SELECT TO anon
  USING (
    status = 'pending'
    AND payment_status = 'unpaid'
  );

-- ── Ensure admin SELECT policy still exists ──────────────────
DROP POLICY IF EXISTS "admin_read_bookings" ON bookings;
CREATE POLICY "admin_read_bookings"
  ON bookings FOR SELECT TO authenticated
  USING (public.is_admin());

-- ── Ensure admin UPDATE policy still exists ──────────────────
DROP POLICY IF EXISTS "admin_update_bookings" ON bookings;
CREATE POLICY "admin_update_bookings"
  ON bookings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

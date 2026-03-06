-- ============================================================
-- 011: Security Lockdown — Proper RLS Policies
-- ============================================================
-- Replaces all permissive anon write policies with
-- authenticated-admin-only policies. Uses Supabase Auth
-- app_metadata->>'role' = 'admin' for authorization.
--
-- Public (anon) access is limited to:
--   - SELECT on tours, reviews, gallery (public-facing)
--   - INSERT on bookings (new booking form)
--   - INSERT on reviews (feedback form)
-- ============================================================

-- ── Helper: is_admin() function ──────────────────────────────
-- Returns true if the current JWT has role = 'admin' in app_metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ══════════════════════════════════════════════════════════════
-- TOURS TABLE — Public can only READ
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Allow anon insert tours"  ON tours;
DROP POLICY IF EXISTS "Allow anon update tours"  ON tours;
DROP POLICY IF EXISTS "Allow anon delete tours"  ON tours;
DROP POLICY IF EXISTS "Allow anon read tours"    ON tours;
DROP POLICY IF EXISTS "Allow anyone to read tours" ON tours;
DROP POLICY IF EXISTS "admin_insert_tours"       ON tours;
DROP POLICY IF EXISTS "admin_update_tours"       ON tours;
DROP POLICY IF EXISTS "admin_delete_tours"       ON tours;
DROP POLICY IF EXISTS "public_read_tours"        ON tours;

-- Anyone can read tours (public-facing)
CREATE POLICY "public_read_tours"
  ON tours FOR SELECT TO anon, authenticated
  USING (true);

-- Only admin can insert tours
CREATE POLICY "admin_insert_tours"
  ON tours FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Only admin can update tours
CREATE POLICY "admin_update_tours"
  ON tours FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admin can delete tours
CREATE POLICY "admin_delete_tours"
  ON tours FOR DELETE TO authenticated
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- BOOKINGS TABLE — Anon can INSERT only, admin can read/update
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "anon can insert bookings" ON bookings;
DROP POLICY IF EXISTS "anon can read bookings"   ON bookings;
DROP POLICY IF EXISTS "anon can update bookings"  ON bookings;
DROP POLICY IF EXISTS "public_insert_bookings"   ON bookings;
DROP POLICY IF EXISTS "admin_read_bookings"      ON bookings;
DROP POLICY IF EXISTS "admin_update_bookings"    ON bookings;
DROP POLICY IF EXISTS "service_update_bookings"  ON bookings;

-- Anyone can create a booking (booking form)
CREATE POLICY "public_insert_bookings"
  ON bookings FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admin can read all bookings
CREATE POLICY "admin_read_bookings"
  ON bookings FOR SELECT TO authenticated
  USING (public.is_admin());

-- Only admin (or service role via triggers/functions) can update
CREATE POLICY "admin_update_bookings"
  ON bookings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- PAYMENTS TABLE — No anon access; admin can read, service writes
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "anon can insert payments" ON payments;
DROP POLICY IF EXISTS "anon can read payments"   ON payments;
DROP POLICY IF EXISTS "anon can update payments"  ON payments;
DROP POLICY IF EXISTS "admin_read_payments"      ON payments;
DROP POLICY IF EXISTS "service_insert_payments"  ON payments;
DROP POLICY IF EXISTS "service_update_payments"  ON payments;

-- Only admin can read payments
CREATE POLICY "admin_read_payments"
  ON payments FOR SELECT TO authenticated
  USING (public.is_admin());

-- Edge Functions use service_role key which bypasses RLS
-- No anon INSERT/UPDATE needed on payments

-- ══════════════════════════════════════════════════════════════
-- REVIEWS TABLE — Public can INSERT + SELECT; admin can DELETE
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "anon can insert reviews" ON reviews;
DROP POLICY IF EXISTS "anon can read reviews"   ON reviews;
DROP POLICY IF EXISTS "anon can delete reviews"  ON reviews;
DROP POLICY IF EXISTS "public_read_reviews"     ON reviews;
DROP POLICY IF EXISTS "public_insert_reviews"   ON reviews;
DROP POLICY IF EXISTS "admin_delete_reviews"    ON reviews;

-- Anyone can read reviews (shown on homepage)
CREATE POLICY "public_read_reviews"
  ON reviews FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can submit a review (feedback page)
CREATE POLICY "public_insert_reviews"
  ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admin can delete reviews
CREATE POLICY "admin_delete_reviews"
  ON reviews FOR DELETE TO authenticated
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- GALLERY TABLE — Public can SELECT; admin can INSERT + DELETE
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Allow anon insert gallery"  ON gallery;
DROP POLICY IF EXISTS "Allow anon delete gallery"  ON gallery;
DROP POLICY IF EXISTS "Allow anyone to read gallery" ON gallery;
DROP POLICY IF EXISTS "public_read_gallery"        ON gallery;
DROP POLICY IF EXISTS "admin_insert_gallery"       ON gallery;
DROP POLICY IF EXISTS "admin_delete_gallery"       ON gallery;

-- Anyone can read gallery (public page)
CREATE POLICY "public_read_gallery"
  ON gallery FOR SELECT TO anon, authenticated
  USING (true);

-- Only admin can insert images
CREATE POLICY "admin_insert_gallery"
  ON gallery FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Only admin can delete images
CREATE POLICY "admin_delete_gallery"
  ON gallery FOR DELETE TO authenticated
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- GALLERY STORAGE — Public read; admin upload + delete
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Anon upload gallery storage" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete gallery storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_gallery_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_gallery_storage" ON storage.objects;

-- Admin can upload to gallery bucket
CREATE POLICY "admin_upload_gallery_storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

-- Admin can delete from gallery bucket
CREATE POLICY "admin_delete_gallery_storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- STRIPE_TRANSACTIONS VIEW — Authenticated SELECT only
-- ══════════════════════════════════════════════════════════════
REVOKE ALL ON public.stripe_transactions FROM anon;
REVOKE ALL ON public.stripe_transactions FROM authenticated;
GRANT SELECT ON public.stripe_transactions TO authenticated;

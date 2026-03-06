-- ============================================================
-- 006 – Create reviews table + storage bucket setup notes
-- ============================================================
-- Run this in Supabase SQL Editor
--
-- ALSO: Before running, create a public storage bucket called
-- "reviews" in Supabase Dashboard → Storage → New bucket
-- (set Public bucket = ON so photos are publicly accessible)
-- ============================================================

-- 1. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT '',
  tour_name   TEXT NOT NULL DEFAULT '',
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  photo_url   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "anon can insert reviews" ON reviews;
DROP POLICY IF EXISTS "anon can read reviews"   ON reviews;

-- Allow any visitor to submit a review
CREATE POLICY "anon can insert reviews"
  ON reviews FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anyone to read reviews (shown on homepage)
CREATE POLICY "anon can read reviews"
  ON reviews FOR SELECT TO anon
  USING (true);

-- Optional: allow admin (anon with update rights) to delete reviews
CREATE POLICY "anon can delete reviews"
  ON reviews FOR DELETE TO anon
  USING (true);

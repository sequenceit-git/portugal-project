-- ============================================================
--  007_gallery_anon_policies.sql
--
--  1. Grants the anon role write access to the gallery TABLE
--     so the client-side Admin Dashboard (using the anon key)
--     can insert and delete gallery records.
--
--  2. Creates storage policies on the `gallery` bucket so the
--     anon role can upload, read, and delete files.
--
--  NOTE: The `gallery` storage bucket must be created manually
--  in the Supabase Dashboard → Storage → New Bucket
--  (Name: gallery, Public: ON)
-- ============================================================

-- ── Gallery TABLE policies ───────────────────────────────────

-- Drop the old authenticated-only write policies first
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery" ON gallery;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery"  ON gallery;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery"  ON gallery;

-- Grant anon role INSERT access
DO $$ BEGIN
  CREATE POLICY "Allow anon insert gallery"
    ON gallery FOR INSERT
    TO anon
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Grant anon role DELETE access
DO $$ BEGIN
  CREATE POLICY "Allow anon delete gallery"
    ON gallery FOR DELETE
    TO anon
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Gallery STORAGE bucket policies ─────────────────────────
-- Run these after creating the `gallery` bucket in the dashboard.

-- Allow anyone to view/download images (public bucket)
DO $$ BEGIN
  CREATE POLICY "Public read gallery storage"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anon to upload images
DO $$ BEGIN
  CREATE POLICY "Anon upload gallery storage"
    ON storage.objects FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anon to delete images
DO $$ BEGIN
  CREATE POLICY "Anon delete gallery storage"
    ON storage.objects FOR DELETE
    TO anon
    USING (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

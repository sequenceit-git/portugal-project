-- ============================================================
--  004_admin_write_policies.sql
--  Grants the anon role write access to the tours table so
--  the client-side Admin Dashboard (using the anon/public key)
--  can insert, update and delete tours.
--
--  NOTE: This is appropriate for a personal / owner-operated
--  project where the /admin route is protected by a password
--  gate in the frontend. If you later add Supabase Auth, you
--  can replace these with role-based policies.
-- ============================================================

-- Remove the authenticated-only write policies added earlier
-- (they are replaced by the broader anon policies below)
DROP POLICY IF EXISTS "Allow authenticated users to insert tours" ON tours;
DROP POLICY IF EXISTS "Allow authenticated users to update tours" ON tours;
DROP POLICY IF EXISTS "Allow authenticated users to delete tours" ON tours;

-- Grant the anon role the ability to insert, update, and delete
DO $$ BEGIN
  CREATE POLICY "Allow anon insert tours"
    ON tours FOR INSERT
    TO anon
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow anon update tours"
    ON tours FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow anon delete tours"
    ON tours FOR DELETE
    TO anon
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

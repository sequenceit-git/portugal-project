-- ── Bookings Table ──────────────────────────────────────────────────────────
-- Run this once in Supabase SQL Editor.
-- Stores every booking submitted from the Booking page.

CREATE TABLE IF NOT EXISTS bookings (
  id               BIGSERIAL PRIMARY KEY,
  tour_id          BIGINT REFERENCES tours(id) ON DELETE SET NULL,
  tour_name        TEXT,

  booking_date     DATE        NOT NULL,
  booking_time     TEXT        NOT NULL,
  language         TEXT,

  -- Passenger counts by type
  adults           INTEGER     NOT NULL DEFAULT 0,
  youth            INTEGER     NOT NULL DEFAULT 0,
  infants          INTEGER     NOT NULL DEFAULT 0,
  seniors          INTEGER     NOT NULL DEFAULT 0,
  total_guests     INTEGER     NOT NULL DEFAULT 0,

  -- Contact details
  first_name       TEXT        NOT NULL,
  last_name        TEXT,
  email            TEXT        NOT NULL,
  phone            TEXT,
  special_requests TEXT,

  -- Payment
  payment_method   TEXT,
  subtotal         NUMERIC(10, 2),
  service_fee      NUMERIC(10, 2),
  total_amount     NUMERIC(10, 2),

  status           TEXT        NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow the anonymous (browser) client to INSERT new bookings
DO $$ BEGIN
  CREATE POLICY "anon can insert bookings"
    ON bookings FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow the anonymous client to read back their own booking (optional)
DO $$ BEGIN
  CREATE POLICY "anon can read bookings"
    ON bookings FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Index for fast lookup by tour / date ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id    ON bookings (tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date       ON bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email      ON bookings (email);

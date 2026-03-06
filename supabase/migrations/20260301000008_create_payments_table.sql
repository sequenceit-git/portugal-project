-- ── Payments Table ───────────────────────────────────────────────────────────
-- Stores Stripe payment records linked to bookings.

CREATE TABLE IF NOT EXISTS payments (
  id                  BIGSERIAL PRIMARY KEY,
  booking_id          BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
  stripe_session_id   TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount              NUMERIC(10, 2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'eur',
  status              TEXT NOT NULL DEFAULT 'pending',  -- pending, paid, failed, refunded
  customer_email      TEXT,
  customer_name       TEXT,
  tour_name           TEXT,
  receipt_url         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Add Stripe columns to bookings ──────────────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon can insert payments"
    ON payments FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "anon can read payments"
    ON payments FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "anon can update payments"
    ON payments FOR UPDATE TO anon USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow anon to update bookings (for webhook status updates)
DO $$ BEGIN
  CREATE POLICY "anon can update bookings"
    ON bookings FOR UPDATE TO anon USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments (stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments (status);

-- Migration: Update tours table for per-person pricing tiers
-- Removes old price column, adds price_1_person to price_6_person

ALTER TABLE tours
  DROP COLUMN IF EXISTS price;

ALTER TABLE tours
  ADD COLUMN price_1_person NUMERIC(10,2),
  ADD COLUMN price_2_person NUMERIC(10,2),
  ADD COLUMN price_3_person NUMERIC(10,2),
  ADD COLUMN price_4_person NUMERIC(10,2),
  ADD COLUMN price_5_person NUMERIC(10,2),
  ADD COLUMN price_6_person NUMERIC(10,2);

-- For 6 or more people, always use price_6_person as the per-person rate.

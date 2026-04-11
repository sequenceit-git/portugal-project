-- Drop the unused passenger count columns from bookings
ALTER TABLE bookings
  DROP COLUMN IF EXISTS adults,
  DROP COLUMN IF EXISTS youth,
  DROP COLUMN IF EXISTS seniors,
  DROP COLUMN IF EXISTS infants;

-- Gallery Table Migration for Supabase
-- Run this SQL in your Supabase SQL Editor to create the gallery table

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  description TEXT,
  tour_id BIGINT REFERENCES tours(id) ON DELETE CASCADE,
  tour_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_tour_id ON gallery(tour_id);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_tour_name ON gallery(tour_name);

-- Enable RLS (Row Level Security)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy 1: Allow anonymous users to read gallery
CREATE POLICY "Allow public read access to gallery"
  ON gallery
  FOR SELECT
  USING (true);

-- Policy 2: Allow authenticated users to insert gallery items
CREATE POLICY "Allow authenticated users to insert gallery"
  ON gallery
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update their own entries
CREATE POLICY "Allow authenticated users to update gallery"
  ON gallery
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete their own entries
CREATE POLICY "Allow authenticated users to delete gallery"
  ON gallery
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert some sample data (optional)
-- INSERT INTO gallery (image_url, description, tour_name) VALUES
-- ('https://example.com/image1.jpg', 'Beautiful sunset in Alfama', 'Alfama Walking Tour'),
-- ('https://example.com/image2.jpg', 'Traditional Portuguese tiles', 'Historic Lisbon'),
-- ('https://example.com/image3.jpg', 'Local street market', 'Food Tour');

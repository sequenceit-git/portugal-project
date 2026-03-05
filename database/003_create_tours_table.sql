-- ============================================================
--  Tours Table — Supabase SQL
--  Run this in Supabase → SQL Editor
--
--  Safe to run multiple times:
--   • Creates the table if it does not exist
--   • Adds any missing columns via ALTER TABLE … IF NOT EXISTS
--   • Inserts tours only if not already present (no duplicates)
-- ============================================================


-- 1. Create the tours table (skipped if it already exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS tours (
  id               BIGSERIAL PRIMARY KEY,
  name             VARCHAR(255)  NOT NULL,
  subtitle         VARCHAR(255),
  category         VARCHAR(100)  NOT NULL DEFAULT 'Tuk-Tuk',
  badge            VARCHAR(100),
  badge_color      VARCHAR(50)   DEFAULT 'primary',
  duration         NUMERIC(4,1)  NOT NULL,
  people           INTEGER       DEFAULT 6,
  guide_language   VARCHAR(100)  DEFAULT 'English',
  meeting_point    TEXT,
  highlights       TEXT[]        DEFAULT '{}',
  gallery          TEXT[]        DEFAULT '{}',
  title_image      TEXT,
  details          TEXT,
  activity         VARCHAR(255),
  journey          TEXT,
  rating           NUMERIC(3,1)  DEFAULT 5.0,
  review_count     INTEGER       DEFAULT 0,
  price            NUMERIC(10,2),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 2. Add columns that may be missing on an older table version
-- ============================================================
ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS subtitle       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS badge          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS badge_color    VARCHAR(50)  DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS guide_language VARCHAR(100) DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS meeting_point  TEXT,
  ADD COLUMN IF NOT EXISTS highlights     TEXT[]       DEFAULT '{}';

-- 2. Indexes (safe to re-run)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tours_category   ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_duration   ON tours(duration);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at DESC);

-- 3. Row Level Security
--    Wrapped in DO blocks so re-running won't throw "already exists"
-- ============================================================
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read access to tours"
    ON tours FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users to insert tours"
    ON tours FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users to update tours"
    ON tours FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated users to delete tours"
    ON tours FOR DELETE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
--  5. Seed Data — Three Featured Tuk-Tuk Tours
--     INSERT … WHERE NOT EXISTS prevents duplicates on re-runs
-- ============================================================

-- Tour 1 ─ Alfama & the Viewpoints
INSERT INTO tours (
  name, subtitle, category, badge, badge_color,
  duration, people, guide_language, meeting_point,
  highlights, title_image, details, activity,
  rating, review_count, price
)
SELECT
  'Alfama & the Viewpoints',
  'Lisbon''s Hilltop Charm',
  'Tuk-Tuk', 'Most Popular', 'amber',
  1.5, 6, 'English', NULL,
  ARRAY['Miradouro da Graça','Portas do Sol','Santa Luzia','100% Electric Tuk-Tuk'],
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmJ0loxOxE6KguDCbXrfYNEtloyjyJ0f8AA6a8mZMoVgYuCDu_hAF8lsNXQFghXM1yRMAT_E4BMzBGfjJHu_0FanXFPSSiJQ3mfmp5iDt98pRZfyx9HLCsrTPDJFWFWjMhZXNElGq9sFescUztiViyCFrr0nZvZ5Ofvr34TxfiDUCmdR33PzU-JHg1_NlJmB281uglrb2-E__Tt9vc1uTRykcJQ246FnQCoLpNM4IoET6Ei4-Tb3pXBrT1F-F7AtlxGn_XX0uZfg',
  'Discover Alfama''s best viewpoints by tuk-tuk! Climb Lisbon''s legendary hills effortlessly without breaking a sweat. Visit Miradouro da Graça, Portas do Sol & Santa Luzia for breathtaking river & rooftop panoramas, and feel the living soul of the city''s oldest, most enchanting district. Perfect for photography lovers and first-time visitors. Book your scenic ride today!',
  'Sightseeing · History · Photography',
  5.0, 248, 35.00
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE name = 'Alfama & the Viewpoints');


-- Tour 2 ─ Belém & Alfama
INSERT INTO tours (
  name, subtitle, category, badge, badge_color,
  duration, people, guide_language, meeting_point,
  highlights, title_image, details, activity,
  rating, review_count, price
)
SELECT
  'Belém & Alfama',
  'The Complete Lisbon Experience',
  'Tuk-Tuk', 'Best Value', 'primary',
  3.0, 6, 'English',
  'Praça Dom Luís I nº41, 1200-109 Lisbon, Portugal',
  ARRAY['Jerónimos Monastery','Belém Tower','Pastéis de Belém','São Jorge Castle'],
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBMtTkinF52vD6ysJM6ukh79lxp7yX2RntuwrDkEgR8d9YkQuD-VkZ44X1o-L4JY3FMSDorjBe35U1Ymx8dDIbjifHcrEbHiU13GrOn9BODNaVsPzZWGVTW37NQN42bIuiWQFQl2b6xEJaWKhFqEqvZzUJ3xUHOcoGa6iMhNa8UhZrE-2qu3-qUg1npJxau7OqIYquzJySXxZazfhIGuMcme5k5A_R5Sa0y1iVyTbig2NAJAxd0MPED36ZMnxrXJu9v3azf-R28Wg',
  'Discover Belém & Alfama in 3 hours on one incredible eco-friendly tuk-tuk ride! Marvel at the UNESCO-listed Jerónimos Monastery and iconic Belém Tower, then taste the world-famous Pastéis de Belém. Dive into Alfama''s medieval alleys, stunning panoramic viewpoints, and the majestic São Jorge Castle. The ultimate Lisbon history & culture journey with a licensed local guide. Book now!',
  'History · Food & Culture · Architecture',
  4.9, 312, 55.00
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE name = 'Belém & Alfama');


-- Tour 3 ─ City Highlights
INSERT INTO tours (
  name, subtitle, category, badge, badge_color,
  duration, people, guide_language, meeting_point,
  highlights, title_image, details, activity,
  rating, review_count, price
)
SELECT
  'City Highlights Tuk-Tuk Tour',
  'with Licensed Guide',
  'Tuk-Tuk', 'Full City', 'dark',
  4.0, 6, 'English', NULL,
  ARRAY['LX Factory','Belém Tower','Praça do Comércio','Senhora do Monte','Monument to the Discoveries','Lisbon Cathedral'],
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxkbEw9gntthXpxIdiV1VNJF10jp5hX7p2EM6NIhndsMmNLn9XIoeg7QlaFduGVgXK6km9egiMAaRTLCga_TGkfax2A0Pox2dcM3P5BNfqY3nc7x5wNqB5fHR98aPJ8qnBPDwxa1bCUtOBPev9hV2azLajkKHoWBHMnePQaJSCeM9az5OJsYjUa6FuwLkKZxIaaPmtk7X2qKADpFDW_WZr5Mocl5FSXLMNiRu_F80C3xS_2SbAYu_AAB-xkXqCJj5mYqmH-mgeg',
  'The definitive Lisbon experience, all in one epic electric adventure! Explore LX Factory, UNESCO Jerónimos Monastery, the iconic Belém Tower, the Monument to the Discoveries, Lisbon Cathedral, the grand Praça do Comércio riviera, and Lisbon''s most breathtaking miradouros — all in four unforgettable hours with a licensed local guide who brings every story to life.',
  'Full City · Architecture · Landmarks',
  5.0, 189, 70.00
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE name = 'City Highlights Tuk-Tuk Tour');

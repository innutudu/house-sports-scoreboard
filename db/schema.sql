-- ==============================================================================
-- Inter-House Sports Meet Scoreboard - Supabase Database Schema
-- Paste this entire script into your Supabase SQL Editor and click "Run"
-- ==============================================================================

-- 1. Houses table (Britto, Campion, Kostka, Loyola)
CREATE TABLE IF NOT EXISTS houses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  hex TEXT NOT NULL DEFAULT '#2F8CDC'
);

-- 2. Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Track',
  division TEXT NOT NULL DEFAULT 'House wise Competition',
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed'))
);

-- 3. Results table (Aggregated scores per house per event)
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  house_id INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  UNIQUE (event_id, house_id)
);

-- 4. Event Podium (1st, 2nd, 3rd)
CREATE TABLE IF NOT EXISTS event_podium (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  house_id INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
  student_name TEXT NOT NULL,
  record TEXT,
  UNIQUE (event_id, position)
);

-- 5. Judge Entries (Individual student entries per event)
CREATE TABLE IF NOT EXISTS judge_entries (
  id TEXT PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  house_id INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  position INTEGER CHECK (position IN (1, 2, 3)),
  note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Instructions table
CREATE TABLE IF NOT EXISTS meet_instructions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Announcements table
CREATE TABLE IF NOT EXISTS meet_announcements (
  id SERIAL PRIMARY KEY,
  announcement TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

INSERT INTO houses (id, name, color, hex) VALUES
  (1, 'Britto', 'azure', '#2F8CDC'),
  (2, 'Campion', 'pink', '#F5A9CA'),
  (3, 'Kostka', 'lime', '#82CC1F'),
  (4, 'Loyola', 'maroon', '#9B1C3B')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  hex = EXCLUDED.hex;

INSERT INTO events (id, name, category, division, status) VALUES
  (1, '100 Meters', 'Track', 'House wise Competition', 'completed'),
  (2, '200 Meters', 'Track', 'House wise Competition', 'completed'),
  (3, '400 Meters', 'Track', 'House wise Competition', 'completed'),
  (4, '800 Meters', 'Track', 'House wise Competition', 'completed'),
  (5, '1500 Meters', 'Track', 'House wise Competition', 'live'),
  (6, 'Relay (4x100m)', 'Track', 'House wise Competition', 'upcoming'),
  (7, 'Javelin', 'Field - Throw', 'House wise Competition', 'completed'),
  (8, 'Shot-put', 'Field - Throw', 'House wise Competition', 'completed'),
  (9, 'Discus', 'Field - Throw', 'House wise Competition', 'completed'),
  (10, 'High Jump', 'Field - Jump', 'House wise Competition', 'upcoming'),
  (11, 'Long Jump', 'Field - Jump', 'House wise Competition', 'upcoming'),
  (12, 'Tug of War', 'Team', 'House wise Competition', 'upcoming')
ON CONFLICT (id) DO NOTHING;

-- Initial default scores
INSERT INTO results (event_id, house_id, points) VALUES
  (1, 1, 5), (1, 2, 3), (1, 3, 1), (1, 4, 0),
  (2, 2, 5), (2, 4, 3), (2, 1, 1), (2, 3, 0),
  (3, 4, 5), (3, 3, 3), (3, 2, 1), (3, 1, 0),
  (4, 3, 5), (4, 1, 3), (4, 4, 1), (4, 2, 0),
  (7, 1, 5), (7, 3, 3), (7, 2, 1), (7, 4, 0),
  (8, 4, 5), (8, 1, 3), (8, 3, 1), (8, 2, 0),
  (9, 2, 5), (9, 4, 3), (9, 1, 1), (9, 3, 0)
ON CONFLICT (event_id, house_id) DO NOTHING;

-- Initial instructions
INSERT INTO meet_instructions (id, title, content, category) VALUES
  ('general-conduct', 'General Conduct & Discipline', 'All athletes must report to the marshalling tent 15 minutes before their scheduled event. Proper house sports kit and running shoes are mandatory.', 'General'),
  ('points-system', 'Scoring & Points Allocation', '1st Place: 5 points\n2nd Place: 3 points\n3rd Place: 1 point\nAll disputes must be registered within 15 minutes of event completion with the Chief Referee.', 'Scoring'),
  ('track-rules', 'Track Events Regulations', 'Athletes in lane events must stay within assigned lanes. False starts will result in a warning; a second false start causes immediate disqualification.', 'Track Rules'),
  ('field-rules', 'Field Events Regulations', 'In Throws and Jumps, each participant is permitted 3 attempts. Best recorded attempt determines placement.', 'Field Rules')
ON CONFLICT (id) DO NOTHING;

INSERT INTO meet_announcements (id, announcement) VALUES
  (1, 'Welcome to the Annual Inter-House Sports Meet! Live synchronization is active across all devices.')
ON CONFLICT (id) DO UPDATE SET announcement = EXCLUDED.announcement;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Public access for school meet operations (judges enter scores, all view live)
-- ==============================================================================

ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_podium ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meet_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meet_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for houses" ON houses;
CREATE POLICY "Public access for houses" ON houses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for events" ON events;
CREATE POLICY "Public access for events" ON events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for results" ON results;
CREATE POLICY "Public access for results" ON results FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for event_podium" ON event_podium;
CREATE POLICY "Public access for event_podium" ON event_podium FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for judge_entries" ON judge_entries;
CREATE POLICY "Public access for judge_entries" ON judge_entries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for meet_instructions" ON meet_instructions;
CREATE POLICY "Public access for meet_instructions" ON meet_instructions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for meet_announcements" ON meet_announcements;
CREATE POLICY "Public access for meet_announcements" ON meet_announcements FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Realtime Subscriptions
-- Enables instant live WebSocket updates to all mobile phones and web browsers
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE results;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'judge_entries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE judge_entries;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'event_podium'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE event_podium;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'meet_instructions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE meet_instructions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'meet_announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE meet_announcements;
  END IF;
END $$;

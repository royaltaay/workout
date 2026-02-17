-- Dungym workout history schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Enable anonymous auth in the Supabase dashboard first:
--    Authentication → Settings → Enable Anonymous Sign-ins

-- 2. Create the workout_sessions table
CREATE TABLE workout_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date       TIMESTAMPTZ NOT NULL,
  day        TEXT NOT NULL CHECK (day IN ('Mon', 'Wed', 'Fri')),
  duration   INTEGER NOT NULL DEFAULT 0,
  exercises  JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Row Level Security — each user can only access their own sessions
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Index for fast lookups by user + day + date
CREATE INDEX idx_sessions_user_day_date
  ON workout_sessions (user_id, day, date DESC);

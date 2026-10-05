-- BrainForge V1.3 Migration
-- 002_v1_3_games_and_scoring.sql

-- 1. User Progress Table (Isolated gamification state)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_progress_user_id_unique UNIQUE (user_id)
);

-- 2. XP Ledger / Transactions Table (Audit trail with strict anti-duplication)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL UNIQUE, -- Crucial: ensures same attempt cannot be credited twice
  amount INTEGER NOT NULL CHECK (amount >= 0),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Challenge Attempts Table
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  version INTEGER NOT NULL DEFAULT 1,
  raw_score INTEGER NOT NULL CHECK (raw_score >= 0),
  max_score INTEGER NOT NULL CHECK (max_score >= 0),
  percentage INTEGER NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  is_correct BOOLEAN,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Public / Authenticated read on published challenges
CREATE POLICY "Allow public read on published challenges"
  ON challenges FOR SELECT
  USING (status = 'published');

-- User Progress: Users may only SELECT their own record
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Explicitly deny client direct INSERT/UPDATE/DELETE on user_progress
-- Only trusted backend / security definer functions can update XP/Level
CREATE POLICY "Deny client direct updates on user_progress"
  ON user_progress FOR UPDATE
  USING (false);

CREATE POLICY "Deny client direct inserts on user_progress"
  ON user_progress FOR INSERT
  WITH CHECK (false);

-- XP Transactions: Users may only SELECT their own records
CREATE POLICY "Users can view own xp transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Deny client direct inserts on xp_transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (false);

-- Challenge Attempts: Users can view their own attempts
CREATE POLICY "Users can view own attempts"
  ON challenge_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Atomic Stored Procedure: record_attempt_and_award_xp
-- Enforces atomicity across Attempt insertion, XP transaction ledger, and User Progress
CREATE OR REPLACE FUNCTION record_attempt_and_award_xp(
  p_attempt_id UUID,
  p_user_id UUID,
  p_challenge_id UUID,
  p_version INTEGER,
  p_raw_score INTEGER,
  p_max_score INTEGER,
  p_percentage INTEGER,
  p_duration_ms INTEGER,
  p_is_correct BOOLEAN,
  p_metrics JSONB,
  p_xp_earned INTEGER,
  p_new_total_xp INTEGER,
  p_new_level INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into challenge_attempts
  INSERT INTO challenge_attempts (
    id, user_id, challenge_id, version,
    raw_score, max_score, percentage,
    duration_ms, is_correct, metrics, xp_earned, created_at
  ) VALUES (
    p_attempt_id, p_user_id, p_challenge_id, p_version,
    p_raw_score, p_max_score, p_percentage,
    p_duration_ms, p_is_correct, p_metrics, p_xp_earned, NOW()
  );

  -- Record XP Transaction if XP > 0 (idempotent due to UNIQUE(attempt_id))
  IF p_xp_earned > 0 THEN
    INSERT INTO xp_transactions (
      id, user_id, attempt_id, amount, reason, created_at
    ) VALUES (
      uuid_generate_v4(), p_user_id, p_attempt_id, p_xp_earned, 'challenge_completed', NOW()
    );
  END IF;

  -- Upsert User Progress
  INSERT INTO user_progress (
    id, user_id, total_xp, current_level, created_at, updated_at
  ) VALUES (
    uuid_generate_v4(), p_user_id, p_new_total_xp, p_new_level, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = p_new_total_xp,
    current_level = p_new_level,
    updated_at = NOW();
END;
$$;

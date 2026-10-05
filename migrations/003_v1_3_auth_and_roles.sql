-- BrainForge V1.3 Migration
-- 003_v1_3_auth_and_roles.sql

-- 1. Add Role Column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 2. Password Reset Tokens Table (Secure token exchange with expiry)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS on password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all client direct queries on password_reset_tokens (Server/Security Definer only)
CREATE POLICY "Deny direct client access to password reset tokens"
  ON password_reset_tokens FOR ALL
  USING (false);

-- 4. Admin Role Policies
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_p
      WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin'
    )
  );

-- Admins can manage all challenges
CREATE POLICY "Admins can manage all challenges"
  ON challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_p
      WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin'
    )
  );

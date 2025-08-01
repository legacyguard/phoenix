-- Add privacy settings columns to user_profiles table

-- Add privacy_mode column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS privacy_mode TEXT DEFAULT 'hybrid' CHECK (privacy_mode IN ('hybrid', 'local_only'));

-- Add auto_delete_after column (in years, 0 means never)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS auto_delete_after INTEGER DEFAULT 0 CHECK (auto_delete_after >= 0);

-- Add AI feature toggles as JSONB
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS ai_feature_toggles JSONB DEFAULT '{
  "expirationIntelligence": true,
  "behavioralNudges": true,
  "relationshipDetection": true
}'::jsonb;

-- Add updated_at column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Update RLS policies to allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Add comment explaining the columns
COMMENT ON COLUMN user_profiles.privacy_mode IS 'Default document processing mode: hybrid or local_only';
COMMENT ON COLUMN user_profiles.auto_delete_after IS 'Number of years after which to auto-delete data (0 = never)';
COMMENT ON COLUMN user_profiles.ai_feature_toggles IS 'JSON object containing toggles for AI features';

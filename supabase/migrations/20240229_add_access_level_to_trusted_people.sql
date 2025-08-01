-- Add access level and communication tracking to trusted_people table

-- Add access_level column
ALTER TABLE trusted_people
ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'none' 
CHECK (access_level IN ('none', 'emergency_only', 'limited_info', 'full_access'));

-- Add last_communicated column
ALTER TABLE trusted_people
ADD COLUMN IF NOT EXISTS last_communicated TIMESTAMPTZ DEFAULT NOW();

-- Add emergency_protocol_enabled to user_profiles (if not exists from previous migration)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS emergency_protocol_enabled BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trusted_people_user_access 
ON trusted_people(user_id, access_level);

-- Update existing trusted people to have reasonable defaults
-- Set spouse/partner to full_access, others to limited_info
UPDATE trusted_people 
SET access_level = CASE 
  WHEN LOWER(relationship) IN ('spouse', 'partner', 'wife', 'husband') THEN 'full_access'
  WHEN LOWER(relationship) IN ('child', 'son', 'daughter', 'parent', 'mother', 'father') THEN 'limited_info'
  ELSE 'emergency_only'
END
WHERE access_level = 'none';

-- Add comment explaining the columns
COMMENT ON COLUMN trusted_people.access_level IS 'Access level for viewing user information: none, emergency_only, limited_info, full_access';
COMMENT ON COLUMN trusted_people.last_communicated IS 'Last time the user sent an update to this trusted person';

-- Create a function to check if emergency protocol is active
CREATE OR REPLACE FUNCTION check_emergency_access(
  p_user_id UUID,
  p_trusted_person_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_access_level TEXT;
  v_emergency_enabled BOOLEAN;
BEGIN
  -- Get the access level for this trusted person
  SELECT access_level INTO v_access_level
  FROM trusted_people
  WHERE id = p_trusted_person_id AND user_id = p_user_id;
  
  -- If full or limited access, always allow
  IF v_access_level IN ('full_access', 'limited_info') THEN
    RETURN TRUE;
  END IF;
  
  -- If no access, always deny
  IF v_access_level = 'none' OR v_access_level IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- For emergency_only, check if emergency protocol is enabled
  IF v_access_level = 'emergency_only' THEN
    SELECT emergency_protocol_enabled INTO v_emergency_enabled
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_emergency_enabled, FALSE);
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for trusted people to view documents based on access level
CREATE POLICY "Trusted people can view documents based on access level" 
ON documents
FOR SELECT 
USING (
  -- User can see their own documents
  auth.uid() = user_id 
  OR 
  -- Trusted person can see documents if they have appropriate access
  EXISTS (
    SELECT 1 
    FROM trusted_people tp
    WHERE tp.user_id = documents.user_id
    AND tp.email = auth.jwt()->>'email'
    AND check_emergency_access(documents.user_id, tp.id)
  )
);

-- Create a table to track emergency access requests
CREATE TABLE IF NOT EXISTS emergency_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES trusted_people(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES trusted_people(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for emergency access requests
CREATE INDEX idx_emergency_requests_status ON emergency_access_requests(user_id, status, expires_at);

-- RLS for emergency access requests
ALTER TABLE emergency_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their emergency requests" 
ON emergency_access_requests
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Trusted people can view requests they're involved in" 
ON emergency_access_requests
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM trusted_people tp
    WHERE tp.email = auth.jwt()->>'email'
    AND (tp.id = requester_id OR tp.id = approver_id)
  )
);

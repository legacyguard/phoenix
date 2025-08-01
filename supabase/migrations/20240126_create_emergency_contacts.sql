-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  priority_order INTEGER NOT NULL CHECK (priority_order BETWEEN 1 AND 3),
  relationship TEXT,
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, priority_order),
  UNIQUE(user_id, contact_id)
);

-- Add indexes for performance
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_contact_id ON emergency_contacts(contact_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(priority_order);

-- Create emergency access log table
CREATE TABLE IF NOT EXISTS emergency_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view_contacts', 'initiated_contact', 'confirmed_emergency')),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for emergency access logs
CREATE INDEX idx_emergency_access_logs_guardian_id ON emergency_access_logs(guardian_id);
CREATE INDEX idx_emergency_access_logs_user_id ON emergency_access_logs(user_id);
CREATE INDEX idx_emergency_access_logs_created_at ON emergency_access_logs(created_at);

-- Create function to validate emergency contact limits
CREATE OR REPLACE FUNCTION validate_emergency_contact_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already has 3 emergency contacts
  IF (SELECT COUNT(*) FROM emergency_contacts WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 emergency contacts allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce emergency contact limit
CREATE TRIGGER enforce_emergency_contact_limit
BEFORE INSERT ON emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION validate_emergency_contact_limit();

-- Create function to reorder emergency contacts
CREATE OR REPLACE FUNCTION reorder_emergency_contacts(
  p_user_id UUID,
  p_contact_ids UUID[]
) RETURNS VOID AS $$
DECLARE
  i INTEGER;
BEGIN
  -- Validate array length
  IF array_length(p_contact_ids, 1) > 3 THEN
    RAISE EXCEPTION 'Maximum of 3 emergency contacts allowed';
  END IF;

  -- Update priority orders
  FOR i IN 1..array_length(p_contact_ids, 1) LOOP
    UPDATE emergency_contacts
    SET priority_order = i,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND contact_id = p_contact_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to log emergency access
CREATE OR REPLACE FUNCTION log_emergency_access(
  p_guardian_id UUID,
  p_user_id UUID,
  p_access_type TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO emergency_access_logs (
    guardian_id,
    user_id,
    access_type,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_guardian_id,
    p_user_id,
    p_access_type,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;

  -- TODO: Trigger notification to emergency contacts here
  -- This would be handled by an edge function or backend service

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for emergency contacts with full contact details
CREATE OR REPLACE VIEW emergency_contacts_view AS
SELECT 
  ec.id,
  ec.user_id,
  ec.contact_id,
  ec.priority_order,
  ec.relationship,
  ec.last_contacted,
  ec.created_at,
  ec.updated_at,
  c.name AS contact_name,
  c.email AS contact_email,
  c.phone AS contact_phone,
  c.role AS contact_role,
  c.notes AS contact_notes
FROM emergency_contacts ec
JOIN contacts c ON ec.contact_id = c.id
WHERE c.deleted_at IS NULL
ORDER BY ec.priority_order;

-- RLS Policies for emergency_contacts
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own emergency contacts
CREATE POLICY "Users can view own emergency contacts"
ON emergency_contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
ON emergency_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
ON emergency_contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
ON emergency_contacts FOR DELETE
USING (auth.uid() = user_id);

-- Guardians can view emergency contacts of users they guard
CREATE POLICY "Guardians can view emergency contacts"
ON emergency_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    WHERE g.guardian_user_id = auth.uid()
      AND g.user_id = emergency_contacts.user_id
      AND g.status = 'accepted'
  )
);

-- RLS Policies for emergency_access_logs
ALTER TABLE emergency_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs of emergency access to their data
CREATE POLICY "Users can view own emergency access logs"
ON emergency_access_logs FOR SELECT
USING (auth.uid() = user_id);

-- Guardians can view their own access logs
CREATE POLICY "Guardians can view their access logs"
ON emergency_access_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM guardians g
    WHERE g.id = emergency_access_logs.guardian_id
      AND g.guardian_user_id = auth.uid()
  )
);

-- Add updated_at trigger for emergency_contacts
CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on the view
GRANT SELECT ON emergency_contacts_view TO authenticated;

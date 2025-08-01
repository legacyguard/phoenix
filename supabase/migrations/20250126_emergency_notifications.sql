-- Create notification_logs table to track all sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  recipient_emails TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for querying
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(type);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at);

-- Add notification preferences to emergency_contacts
ALTER TABLE emergency_contacts
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT jsonb_build_object(
  'email_enabled', true,
  'sms_enabled', false,
  'opt_out_reason', null,
  'last_preference_update', null
);

-- Add notification history to emergency_contacts
ALTER TABLE emergency_contacts
ADD COLUMN IF NOT EXISTS notification_history JSONB DEFAULT '[]'::jsonb;

-- RLS policies for notification_logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification logs
CREATE POLICY "Users can view own notification logs"
  ON notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert notification logs
CREATE POLICY "Service role can insert notification logs"
  ON notification_logs FOR INSERT
  WITH CHECK (true);

-- Function to update notification history when a notification is sent
CREATE OR REPLACE FUNCTION update_emergency_contact_notification_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Update notification history for each emergency contact that received a notification
  IF NEW.type = 'emergency_access' AND NEW.metadata->>'email_results' IS NOT NULL THEN
    UPDATE emergency_contacts ec
    SET notification_history = notification_history || jsonb_build_object(
      'type', 'emergency_access',
      'sent_at', NEW.created_at,
      'guardian_name', NEW.metadata->>'guardian_name',
      'emergency_notes', NEW.metadata->>'emergency_notes'
    )
    FROM contacts c
    WHERE ec.contact_id = c.id
      AND ec.user_id = NEW.user_id
      AND c.email = ANY(NEW.recipient_emails);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update notification history
CREATE TRIGGER update_emergency_contact_notification_history_trigger
  AFTER INSERT ON notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_emergency_contact_notification_history();

-- Function to check if contact wants notifications
CREATE OR REPLACE FUNCTION contact_wants_notifications(contact_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prefs JSONB;
BEGIN
  SELECT notification_preferences INTO prefs
  FROM emergency_contacts
  WHERE emergency_contacts.contact_id = contact_id
  LIMIT 1;
  
  RETURN COALESCE((prefs->>'email_enabled')::boolean, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences(
  p_contact_id UUID,
  p_user_id UUID,
  p_email_enabled BOOLEAN,
  p_sms_enabled BOOLEAN DEFAULT false,
  p_opt_out_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE emergency_contacts
  SET notification_preferences = jsonb_build_object(
    'email_enabled', p_email_enabled,
    'sms_enabled', p_sms_enabled,
    'opt_out_reason', p_opt_out_reason,
    'last_preference_update', NOW()
  )
  WHERE contact_id = p_contact_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION contact_wants_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION update_notification_preferences TO authenticated;

-- Create alerts table for document expiration tracking
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('expiring_90', 'expiring_30', 'expiring_7', 'expired')),
  alert_date TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  snooze_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_document_id ON alerts(document_id);
CREATE INDEX idx_alerts_alert_date ON alerts(alert_date);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_is_dismissed ON alerts(is_dismissed);

-- Add expiration status to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS expiration_status TEXT CHECK (expiration_status IN ('active', 'expiring_soon', 'expiring_later', 'expired'));

-- Create function to calculate expiration status
CREATE OR REPLACE FUNCTION calculate_expiration_status(renewal_date DATE)
RETURNS TEXT AS $$
BEGIN
  IF renewal_date IS NULL THEN
    RETURN 'active';
  ELSIF renewal_date < CURRENT_DATE THEN
    RETURN 'expired';
  ELSIF renewal_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    RETURN 'expiring_soon';
  ELSIF renewal_date <= CURRENT_DATE + INTERVAL '90 days' THEN
    RETURN 'expiring_later';
  ELSE
    RETURN 'active';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing documents with expiration status
UPDATE documents 
SET expiration_status = calculate_expiration_status(renewal_date);

-- Create trigger to update expiration_status automatically
CREATE OR REPLACE FUNCTION update_document_expiration_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expiration_status = calculate_expiration_status(NEW.renewal_date);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_expiration_status_trigger
BEFORE INSERT OR UPDATE OF renewal_date ON documents
FOR EACH ROW
EXECUTE FUNCTION update_document_expiration_status();

-- Create function to check document expirations and create alerts
CREATE OR REPLACE FUNCTION check_document_expirations()
RETURNS void AS $$
DECLARE
  doc RECORD;
  alert_type_val TEXT;
  existing_alert UUID;
BEGIN
  -- Loop through all documents with renewal dates
  FOR doc IN 
    SELECT d.id, d.user_id, d.renewal_date, d.name
    FROM documents d
    WHERE d.renewal_date IS NOT NULL
      AND d.deleted_at IS NULL
  LOOP
    -- Determine alert type based on expiration date
    IF doc.renewal_date < CURRENT_DATE THEN
      alert_type_val := 'expired';
    ELSIF doc.renewal_date <= CURRENT_DATE + INTERVAL '7 days' THEN
      alert_type_val := 'expiring_7';
    ELSIF doc.renewal_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      alert_type_val := 'expiring_30';
    ELSIF doc.renewal_date <= CURRENT_DATE + INTERVAL '90 days' THEN
      alert_type_val := 'expiring_90';
    ELSE
      CONTINUE; -- Skip if not within alert window
    END IF;

    -- Check if alert already exists
    SELECT id INTO existing_alert
    FROM alerts
    WHERE document_id = doc.id
      AND alert_type = alert_type_val
      AND is_dismissed = FALSE
      AND (snooze_until IS NULL OR snooze_until <= NOW());

    -- Create alert if it doesn't exist
    IF existing_alert IS NULL THEN
      INSERT INTO alerts (user_id, document_id, alert_type, alert_date)
      VALUES (doc.user_id, doc.id, alert_type_val, doc.renewal_date);
    END IF;
  END LOOP;

  -- Clean up old dismissed alerts (older than 6 months)
  DELETE FROM alerts
  WHERE is_dismissed = TRUE
    AND created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run daily (Note: This would be set up in your backend cron job)
-- For testing, you can run: SELECT check_document_expirations();

-- RLS Policies for alerts table
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
ON alerts FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own alerts (mark as read, dismiss, snooze)
CREATE POLICY "Users can update own alerts"
ON alerts FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert alerts (this would be used by service role)
CREATE POLICY "System can insert alerts"
ON alerts FOR INSERT
WITH CHECK (true);

-- Add updated_at trigger for alerts
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

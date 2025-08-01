-- Will backups table
CREATE TABLE will_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_path TEXT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Will validations table for legal compliance
CREATE TABLE will_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  validation_type VARCHAR(50) NOT NULL,
  is_valid BOOLEAN NOT NULL,
  issues JSONB,
  recommendations TEXT[],
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  related_id UUID,
  related_type VARCHAR(50),
  email_type VARCHAR(50) NOT NULL,
  recipient_email TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_will_backups_will_id ON will_backups(will_id);
CREATE INDEX idx_will_backups_user_id ON will_backups(user_id);
CREATE INDEX idx_will_backups_created_at ON will_backups(created_at);
CREATE INDEX idx_will_validations_will_id ON will_validations(will_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_related ON email_logs(related_id, related_type);

-- RLS Policies
ALTER TABLE will_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own backups
CREATE POLICY "Users can view own will backups" ON will_backups
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see validations for their own wills
CREATE POLICY "Users can view own will validations" ON will_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = will_validations.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );

-- Users can only see their own email logs
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to schedule automated backups
CREATE OR REPLACE FUNCTION schedule_will_backup() RETURNS void AS $$
BEGIN
  -- This function would be called by a scheduled job
  -- Implementation would trigger the backup service
  RAISE NOTICE 'Will backup scheduled';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job for daily backups (requires pg_cron extension)
-- SELECT cron.schedule('daily-will-backup', '0 2 * * *', 'SELECT schedule_will_backup()');

-- Add validation status to generated_wills if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'generated_wills' 
                AND column_name = 'validation_status') THEN
    ALTER TABLE generated_wills 
    ADD COLUMN validation_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (validation_status IN ('pending', 'passed', 'failed', 'needs_revision'));
  END IF;
END $$;

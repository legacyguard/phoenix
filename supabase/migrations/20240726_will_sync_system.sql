-- Will sync preferences table
CREATE TABLE will_sync_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (sync_frequency IN ('immediate', 'daily', 'weekly')),
  require_approval BOOLEAN DEFAULT false,
  sync_triggers JSONB DEFAULT '{
    "asset_added": true,
    "asset_removed": true,
    "asset_value_changed": true,
    "beneficiary_added": true,
    "beneficiary_removed": true,
    "guardian_changed": true,
    "executor_changed": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Will sync log table
CREATE TABLE will_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  changes_made JSONB NOT NULL,
  previous_version UUID REFERENCES generated_wills(id),
  new_version UUID REFERENCES generated_wills(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_applied')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Will versions table
CREATE TABLE will_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  changes_from_previous JSONB,
  created_by VARCHAR(20) CHECK (created_by IN ('user', 'system', 'auto_sync')),
  created_reason TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Will sync queue table for scheduled updates
CREATE TABLE will_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  will_id UUID REFERENCES generated_wills(id) ON DELETE CASCADE,
  trigger_events JSONB[] NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add version tracking to generated_wills
ALTER TABLE generated_wills 
ADD COLUMN current_version_id UUID REFERENCES will_versions(id),
ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending_sync', 'sync_failed'));

-- Indexes
CREATE INDEX idx_will_sync_log_user_id ON will_sync_log(user_id);
CREATE INDEX idx_will_sync_log_will_id ON will_sync_log(will_id);
CREATE INDEX idx_will_sync_log_status ON will_sync_log(status);
CREATE INDEX idx_will_versions_will_id ON will_versions(will_id);
CREATE INDEX idx_will_versions_is_current ON will_versions(is_current);
CREATE INDEX idx_will_sync_queue_user_id ON will_sync_queue(user_id);
CREATE INDEX idx_will_sync_queue_status ON will_sync_queue(status);
CREATE INDEX idx_will_sync_queue_scheduled_for ON will_sync_queue(scheduled_for);

-- Function to create a new will version
CREATE OR REPLACE FUNCTION create_will_version(
  p_will_id UUID,
  p_content JSONB,
  p_created_by VARCHAR(20),
  p_created_reason TEXT,
  p_changes JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM will_versions
  WHERE will_id = p_will_id;

  -- Set all existing versions to not current
  UPDATE will_versions
  SET is_current = false
  WHERE will_id = p_will_id;

  -- Insert new version
  INSERT INTO will_versions (
    will_id,
    version_number,
    content_snapshot,
    changes_from_previous,
    created_by,
    created_reason,
    is_current
  ) VALUES (
    p_will_id,
    v_version_number,
    p_content,
    p_changes,
    p_created_by,
    p_created_reason,
    true
  ) RETURNING id INTO v_version_id;

  -- Update will with current version
  UPDATE generated_wills
  SET current_version_id = v_version_id,
      will_content = p_content,
      updated_at = NOW()
  WHERE id = p_will_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for monitoring asset changes
CREATE OR REPLACE FUNCTION monitor_asset_changes() RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_will_id UUID;
  v_sync_enabled BOOLEAN;
  v_sync_triggers JSONB;
BEGIN
  -- Get user_id from the asset
  v_user_id := NEW.user_id;
  
  -- Check if user has auto-sync enabled
  SELECT auto_sync_enabled, sync_triggers INTO v_sync_enabled, v_sync_triggers
  FROM will_sync_preferences
  WHERE user_id = v_user_id;

  IF v_sync_enabled IS NULL OR NOT v_sync_enabled THEN
    RETURN NEW;
  END IF;

  -- Get active will for user
  SELECT id INTO v_will_id
  FROM generated_wills
  WHERE user_id = v_user_id 
  AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_will_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check trigger conditions and log sync event
  IF TG_OP = 'INSERT' AND (v_sync_triggers->>'asset_added')::boolean THEN
    INSERT INTO will_sync_queue (user_id, will_id, trigger_events, scheduled_for)
    VALUES (
      v_user_id, 
      v_will_id, 
      ARRAY[jsonb_build_object(
        'event', 'asset_added',
        'asset_id', NEW.id,
        'asset_name', NEW.name,
        'timestamp', NOW()
      )],
      CASE 
        WHEN (SELECT sync_frequency FROM will_sync_preferences WHERE user_id = v_user_id) = 'immediate' 
        THEN NOW()
        ELSE NOW() + INTERVAL '1 day'
      END
    );
  ELSIF TG_OP = 'DELETE' AND (v_sync_triggers->>'asset_removed')::boolean THEN
    INSERT INTO will_sync_queue (user_id, will_id, trigger_events, scheduled_for)
    VALUES (
      v_user_id, 
      v_will_id, 
      ARRAY[jsonb_build_object(
        'event', 'asset_removed',
        'asset_id', OLD.id,
        'asset_name', OLD.name,
        'timestamp', NOW()
      )],
      NOW()
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.value != OLD.value AND (v_sync_triggers->>'asset_value_changed')::boolean THEN
    INSERT INTO will_sync_queue (user_id, will_id, trigger_events, scheduled_for)
    VALUES (
      v_user_id, 
      v_will_id, 
      ARRAY[jsonb_build_object(
        'event', 'asset_value_changed',
        'asset_id', NEW.id,
        'asset_name', NEW.name,
        'old_value', OLD.value,
        'new_value', NEW.value,
        'timestamp', NOW()
      )],
      CASE 
        WHEN (SELECT sync_frequency FROM will_sync_preferences WHERE user_id = v_user_id) = 'immediate' 
        THEN NOW()
        ELSE NOW() + INTERVAL '1 day'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for monitoring changes
CREATE TRIGGER asset_change_monitor
AFTER INSERT OR UPDATE OR DELETE ON assets
FOR EACH ROW EXECUTE FUNCTION monitor_asset_changes();

-- Similar trigger functions would be created for:
-- - beneficiaries table
-- - guardians table
-- - executors table

-- RLS Policies
ALTER TABLE will_sync_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_sync_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sync preferences
CREATE POLICY "Users can manage own sync preferences" ON will_sync_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own sync logs
CREATE POLICY "Users can view own sync logs" ON will_sync_log
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see versions of their own wills
CREATE POLICY "Users can view own will versions" ON will_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_wills
      WHERE generated_wills.id = will_versions.will_id
      AND generated_wills.user_id = auth.uid()
    )
  );

-- Users can only see their own sync queue
CREATE POLICY "Users can view own sync queue" ON will_sync_queue
  FOR SELECT USING (auth.uid() = user_id);

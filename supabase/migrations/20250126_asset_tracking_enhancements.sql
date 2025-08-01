-- Add asset tracking enhancements
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('property', 'vehicle', 'financial', 'business', 'personal')),
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS acquisition_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_user_category ON assets(user_id, category);

-- Create asset_documents junction table
CREATE TABLE IF NOT EXISTS asset_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, document_id)
);

-- Create asset_beneficiaries table for beneficiary allocations per asset
CREATE TABLE IF NOT EXISTS asset_beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  allocation_percentage DECIMAL(5, 2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, beneficiary_id)
);

-- Create asset_timeline table for tracking asset history
CREATE TABLE IF NOT EXISTS asset_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'document_linked', 'document_unlinked', 'beneficiary_assigned', 'beneficiary_removed', 'value_updated')),
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_asset_documents_asset ON asset_documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_documents_document ON asset_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_asset_beneficiaries_asset ON asset_beneficiaries(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_beneficiaries_beneficiary ON asset_beneficiaries(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_asset_timeline_asset ON asset_timeline(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_timeline_created ON asset_timeline(created_at DESC);

-- Enable RLS
ALTER TABLE asset_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_timeline ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_documents
CREATE POLICY "Users can view their own asset documents"
  ON asset_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assets WHERE assets.id = asset_documents.asset_id AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own asset documents"
  ON asset_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM assets WHERE assets.id = asset_documents.asset_id AND assets.user_id = auth.uid()
  ));

-- RLS policies for asset_beneficiaries
CREATE POLICY "Users can view their own asset beneficiaries"
  ON asset_beneficiaries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assets WHERE assets.id = asset_beneficiaries.asset_id AND assets.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own asset beneficiaries"
  ON asset_beneficiaries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM assets WHERE assets.id = asset_beneficiaries.asset_id AND assets.user_id = auth.uid()
  ));

-- RLS policies for asset_timeline
CREATE POLICY "Users can view their own asset timeline"
  ON asset_timeline FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create timeline entries"
  ON asset_timeline FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Function to validate beneficiary allocations for an asset
CREATE OR REPLACE FUNCTION validate_asset_beneficiary_allocation()
RETURNS TRIGGER AS $$
DECLARE
  total_allocation DECIMAL(5, 2);
BEGIN
  -- Calculate total allocation for this asset
  SELECT COALESCE(SUM(allocation_percentage), 0) INTO total_allocation
  FROM asset_beneficiaries
  WHERE asset_id = NEW.asset_id
    AND (TG_OP = 'INSERT' OR id != NEW.id);
  
  -- Add the new/updated allocation
  total_allocation := total_allocation + NEW.allocation_percentage;
  
  -- Check if total exceeds 100%
  IF total_allocation > 100 THEN
    RAISE EXCEPTION 'Total beneficiary allocation for this asset would exceed 100%% (current: %%, adding: %%)', 
      total_allocation - NEW.allocation_percentage, NEW.allocation_percentage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for allocation validation
CREATE TRIGGER validate_asset_beneficiary_allocation_trigger
  BEFORE INSERT OR UPDATE ON asset_beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION validate_asset_beneficiary_allocation();

-- Function to log asset timeline events
CREATE OR REPLACE FUNCTION log_asset_event(
  p_asset_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO asset_timeline (asset_id, user_id, event_type, event_data)
  VALUES (p_asset_id, auth.uid(), p_event_type, p_event_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log asset creation
CREATE OR REPLACE FUNCTION log_asset_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_asset_event(NEW.id, 'created', jsonb_build_object(
    'name', NEW.name,
    'type', NEW.type,
    'category', NEW.category,
    'estimated_value', NEW.estimated_value
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_asset_creation_trigger
  AFTER INSERT ON assets
  FOR EACH ROW
  EXECUTE FUNCTION log_asset_creation();

-- Trigger to log asset updates
CREATE OR REPLACE FUNCTION log_asset_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if estimated_value changed
  IF OLD.estimated_value IS DISTINCT FROM NEW.estimated_value THEN
    PERFORM log_asset_event(NEW.id, 'value_updated', jsonb_build_object(
      'old_value', OLD.estimated_value,
      'new_value', NEW.estimated_value,
      'currency', NEW.currency
    ));
  END IF;
  
  -- Log general update
  PERFORM log_asset_event(NEW.id, 'updated', jsonb_build_object(
    'changed_fields', (
      SELECT jsonb_object_agg(key, value)
      FROM jsonb_each(to_jsonb(NEW))
      WHERE to_jsonb(OLD) -> key IS DISTINCT FROM value
    )
  ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_asset_update_trigger
  AFTER UPDATE ON assets
  FOR EACH ROW
  WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE FUNCTION log_asset_update();

-- Create view for asset summary with relationships
CREATE OR REPLACE VIEW asset_summary AS
SELECT 
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.category,
  a.estimated_value,
  a.currency,
  a.acquisition_date,
  a.notes,
  a.metadata,
  a.created_at,
  a.updated_at,
  COUNT(DISTINCT ad.document_id) AS document_count,
  COUNT(DISTINCT ab.beneficiary_id) AS beneficiary_count,
  COALESCE(SUM(ab.allocation_percentage), 0) AS total_allocation
FROM assets a
LEFT JOIN asset_documents ad ON a.id = ad.asset_id
LEFT JOIN asset_beneficiaries ab ON a.id = ab.asset_id
GROUP BY a.id;

-- Create function to get asset category statistics
CREATE OR REPLACE FUNCTION get_asset_statistics(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  count BIGINT,
  total_value DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.category,
    COUNT(*)::BIGINT,
    COALESCE(SUM(a.estimated_value), 0)::DECIMAL(15, 2)
  FROM assets a
  WHERE a.user_id = p_user_id
    AND a.category IS NOT NULL
  GROUP BY a.category
  
  UNION ALL
  
  SELECT 
    'uncategorized'::TEXT,
    COUNT(*)::BIGINT,
    COALESCE(SUM(a.estimated_value), 0)::DECIMAL(15, 2)
  FROM assets a
  WHERE a.user_id = p_user_id
    AND a.category IS NULL
  GROUP BY 'uncategorized'
  
  ORDER BY category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unassigned assets
CREATE OR REPLACE FUNCTION get_unassigned_assets(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  category TEXT,
  estimated_value DECIMAL(15, 2),
  total_allocation DECIMAL(5, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.type,
    a.category,
    a.estimated_value,
    COALESCE(SUM(ab.allocation_percentage), 0)::DECIMAL(5, 2) as total_allocation
  FROM assets a
  LEFT JOIN asset_beneficiaries ab ON a.id = ab.asset_id
  WHERE a.user_id = p_user_id
  GROUP BY a.id
  HAVING COALESCE(SUM(ab.allocation_percentage), 0) < 100
  ORDER BY a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_asset_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_asset_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_unassigned_assets TO authenticated;

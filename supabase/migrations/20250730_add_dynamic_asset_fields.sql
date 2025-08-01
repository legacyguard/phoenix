-- Add new columns for dynamic asset system
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS main_category TEXT CHECK (main_category IN (
  'Property', 
  'Finances', 
  'Vehicle', 
  'Digital Asset', 
  'Personal Item', 
  'Other'
)),
ADD COLUMN IF NOT EXISTS sub_type TEXT,
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- Create index for main_category and sub_type for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_main_category ON assets(main_category);
CREATE INDEX IF NOT EXISTS idx_assets_main_category_sub_type ON assets(main_category, sub_type);
CREATE INDEX IF NOT EXISTS idx_assets_details ON assets USING GIN (details);

-- Update existing assets to have a main_category based on their current category
UPDATE assets
SET main_category = 
  CASE 
    WHEN category = 'property' THEN 'Property'
    WHEN category = 'financial' THEN 'Finances'
    WHEN category = 'vehicle' THEN 'Vehicle'
    WHEN category = 'personal' THEN 'Personal Item'
    WHEN category = 'business' THEN 'Other'
    ELSE 'Other'
  END
WHERE main_category IS NULL;

-- Add sub_type constraints based on main_category
CREATE OR REPLACE FUNCTION validate_asset_sub_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate sub_type based on main_category
  IF NEW.main_category = 'Property' AND NEW.sub_type NOT IN (
    'Primary Residence',
    'Vacation Home',
    'Rental Property',
    'Land',
    'Commercial Property'
  ) THEN
    RAISE EXCEPTION 'Invalid sub_type for Property category';
  ELSIF NEW.main_category = 'Finances' AND NEW.sub_type NOT IN (
    'Bank Account',
    'Investment Portfolio',
    'Cryptocurrency Wallet',
    'Loan / Mortgage',
    'Insurance Policy',
    'Pension / Retirement Account'
  ) THEN
    RAISE EXCEPTION 'Invalid sub_type for Finances category';
  ELSIF NEW.main_category = 'Vehicle' AND NEW.sub_type NOT IN (
    'Car',
    'Motorcycle',
    'Boat',
    'RV / Camper',
    'Aircraft'
  ) THEN
    RAISE EXCEPTION 'Invalid sub_type for Vehicle category';
  ELSIF NEW.main_category = 'Digital Asset' AND NEW.sub_type NOT IN (
    'Online Account',
    'Software License',
    'Domain Name',
    'Digital Subscription',
    'Cryptocurrency',
    'NFT'
  ) THEN
    RAISE EXCEPTION 'Invalid sub_type for Digital Asset category';
  ELSIF NEW.main_category = 'Personal Item' AND NEW.sub_type NOT IN (
    'Jewelry',
    'Art / Collectibles',
    'Electronics',
    'Furniture',
    'Tools / Equipment',
    'Other Valuables'
  ) THEN
    RAISE EXCEPTION 'Invalid sub_type for Personal Item category';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sub_type validation
CREATE TRIGGER validate_asset_sub_type_trigger
  BEFORE INSERT OR UPDATE ON assets
  FOR EACH ROW
  WHEN (NEW.sub_type IS NOT NULL)
  EXECUTE FUNCTION validate_asset_sub_type();

-- Function to validate details JSON schema based on sub_type
CREATE OR REPLACE FUNCTION validate_asset_details()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate required fields in details based on sub_type
  IF NEW.sub_type = 'Bank Account' THEN
    IF NOT (NEW.details ? 'bank_name' AND NEW.details ? 'account_holder_name') THEN
      RAISE EXCEPTION 'Bank Account requires bank_name and account_holder_name in details';
    END IF;
  ELSIF NEW.sub_type = 'Cryptocurrency Wallet' THEN
    IF NOT (NEW.details ? 'wallet_name' AND NEW.details ? 'wallet_type') THEN
      RAISE EXCEPTION 'Cryptocurrency Wallet requires wallet_name and wallet_type in details';
    END IF;
  ELSIF NEW.sub_type = 'Investment Portfolio' THEN
    IF NOT (NEW.details ? 'broker_name' AND NEW.details ? 'account_number') THEN
      RAISE EXCEPTION 'Investment Portfolio requires broker_name and account_number in details';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for details validation
CREATE TRIGGER validate_asset_details_trigger
  BEFORE INSERT OR UPDATE ON assets
  FOR EACH ROW
  WHEN (NEW.details IS NOT NULL AND NEW.details != '{}'::jsonb)
  EXECUTE FUNCTION validate_asset_details();

-- Update the asset timeline to include main_category and sub_type changes
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
  
  -- Check if main_category or sub_type changed
  IF OLD.main_category IS DISTINCT FROM NEW.main_category OR OLD.sub_type IS DISTINCT FROM NEW.sub_type THEN
    PERFORM log_asset_event(NEW.id, 'category_updated', jsonb_build_object(
      'old_main_category', OLD.main_category,
      'new_main_category', NEW.main_category,
      'old_sub_type', OLD.sub_type,
      'new_sub_type', NEW.sub_type
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

-- Update asset summary view to include new fields
CREATE OR REPLACE VIEW asset_summary AS
SELECT 
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.category,
  a.main_category,
  a.sub_type,
  a.details,
  a.estimated_value,
  a.currency,
  a.acquisition_date,
  a.notes,
  a.metadata,
  a.created_at,
  a.updated_at,
  COUNT(DISTINCT ad.document_id) as document_count,
  COUNT(DISTINCT ab.beneficiary_id) as beneficiary_count,
  COALESCE(SUM(ab.allocation_percentage), 0) as total_allocation_percentage,
  json_agg(DISTINCT jsonb_build_object(
    'id', b.id,
    'name', b.name,
    'allocation', ab.allocation_percentage
  )) FILTER (WHERE b.id IS NOT NULL) as beneficiaries,
  json_agg(DISTINCT jsonb_build_object(
    'id', d.id,
    'name', d.name,
    'type', d.type
  )) FILTER (WHERE d.id IS NOT NULL) as documents
FROM assets a
LEFT JOIN asset_documents ad ON a.id = ad.asset_id
LEFT JOIN asset_beneficiaries ab ON a.id = ab.asset_id
LEFT JOIN beneficiaries b ON ab.beneficiary_id = b.id
LEFT JOIN documents d ON ad.document_id = d.id
GROUP BY 
  a.id, a.user_id, a.name, a.type, a.category, a.main_category, 
  a.sub_type, a.details, a.estimated_value, a.currency, 
  a.acquisition_date, a.notes, a.metadata, a.created_at, a.updated_at;

-- Add comment explaining the new structure
COMMENT ON COLUMN assets.main_category IS 'High-level category of the asset (Property, Finances, Vehicle, etc.)';
COMMENT ON COLUMN assets.sub_type IS 'Specific type within the main category (e.g., Bank Account under Finances)';
COMMENT ON COLUMN assets.details IS 'Dynamic JSON field storing type-specific details based on sub_type';

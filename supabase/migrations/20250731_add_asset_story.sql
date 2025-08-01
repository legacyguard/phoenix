-- Add asset_story column to assets table
-- This column allows users to attach personal stories and memories to their assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_story TEXT;

-- Add a comment to document the purpose
COMMENT ON COLUMN assets.asset_story IS 'Personal story or memory associated with the asset, explaining its significance and history for beneficiaries';

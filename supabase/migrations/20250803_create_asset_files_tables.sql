-- Create asset_files table for storing encrypted file metadata
CREATE TABLE IF NOT EXISTS asset_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT true,
    encryption_metadata JSONB,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    
    -- Indexes
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 104857600) -- 100MB max
);

-- Create indexes for efficient querying
CREATE INDEX idx_asset_files_asset_id ON asset_files(asset_id);
CREATE INDEX idx_asset_files_user_id ON asset_files(user_id);
CREATE INDEX idx_asset_files_tags ON asset_files USING GIN(tags);
CREATE INDEX idx_asset_files_category ON asset_files(category);
CREATE INDEX idx_asset_files_deleted_at ON asset_files(deleted_at) WHERE deleted_at IS NULL;

-- Create asset_shares table for tracking shared files
CREATE TABLE IF NOT EXISTS asset_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_file_id UUID NOT NULL REFERENCES asset_files(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email TEXT NOT NULL,
    share_path TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    
    -- Ensure shares expire
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create indexes for shares
CREATE INDEX idx_asset_shares_file_id ON asset_shares(asset_file_id);
CREATE INDEX idx_asset_shares_shared_by ON asset_shares(shared_by);
CREATE INDEX idx_asset_shares_email ON asset_shares(shared_with_email);
CREATE INDEX idx_asset_shares_expires ON asset_shares(expires_at) WHERE revoked_at IS NULL;

-- Enable Row Level Security
ALTER TABLE asset_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_files

-- Users can view their own files
CREATE POLICY "Users can view own asset files" ON asset_files
    FOR SELECT USING (auth.uid() = user_id);

-- Users can upload files for their assets
CREATE POLICY "Users can create asset files" ON asset_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update own asset files" ON asset_files
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own asset files" ON asset_files
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for asset_shares

-- Users can view shares they created
CREATE POLICY "Users can view own shares" ON asset_shares
    FOR SELECT USING (auth.uid() = shared_by);

-- Users can create shares for their files
CREATE POLICY "Users can create shares" ON asset_shares
    FOR INSERT WITH CHECK (
        auth.uid() = shared_by AND
        EXISTS (
            SELECT 1 FROM asset_files 
            WHERE id = asset_file_id AND user_id = auth.uid()
        )
    );

-- Users can revoke their shares
CREATE POLICY "Users can revoke own shares" ON asset_shares
    FOR UPDATE USING (auth.uid() = shared_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_asset_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_asset_files_updated_at_trigger
    BEFORE UPDATE ON asset_files
    FOR EACH ROW
    EXECUTE FUNCTION update_asset_files_updated_at();

-- Function to increment access count on shares
CREATE OR REPLACE FUNCTION increment_share_access_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.access_count = OLD.access_count + 1;
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired shares
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS void AS $$
BEGIN
    UPDATE asset_shares
    SET revoked_at = NOW()
    WHERE expires_at <= NOW()
    AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for asset files (to be run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('asset-files', 'asset-files', false);

-- Comment on tables
COMMENT ON TABLE asset_files IS 'Stores encrypted file metadata for assets';
COMMENT ON TABLE asset_shares IS 'Tracks shared access to asset files';
COMMENT ON COLUMN asset_files.encryption_metadata IS 'Stores IV, method, and other encryption details';
COMMENT ON COLUMN asset_shares.access_count IS 'Number of times the shared file has been accessed';

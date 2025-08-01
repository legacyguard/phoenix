-- Create shared_links table for managing shared content
CREATE TABLE shared_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('playbook_section', 'asset_summary', 'inheritance_allocation', 'document')),
    content_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    expires_at TIMESTAMPTZ,
    password_hash TEXT,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    
    CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create access logs table for tracking link usage
CREATE TABLE shared_link_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_link_id UUID NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    location JSONB,
    device_info JSONB
);

-- Create indexes
CREATE INDEX idx_shared_links_user_id ON shared_links(user_id);
CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_expires_at ON shared_links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_shared_links_content ON shared_links(content_type, content_id);
CREATE INDEX idx_access_logs_shared_link ON shared_link_access_logs(shared_link_id);
CREATE INDEX idx_access_logs_accessed_at ON shared_link_access_logs(accessed_at);

-- Enable RLS
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_link_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_links
CREATE POLICY "Users can view their own shared links" 
    ON shared_links FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shared links" 
    ON shared_links FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared links" 
    ON shared_links FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared links" 
    ON shared_links FOR DELETE 
    USING (auth.uid() = user_id);

-- Public access for shared links (when accessed via token)
CREATE POLICY "Public can view active shared links via token" 
    ON shared_links FOR SELECT 
    USING (
        revoked_at IS NULL 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_views IS NULL OR view_count < max_views)
    );

-- RLS Policies for access logs
CREATE POLICY "Users can view access logs for their shared links" 
    ON shared_link_access_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM shared_links 
            WHERE shared_links.id = shared_link_access_logs.shared_link_id 
            AND shared_links.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert access logs" 
    ON shared_link_access_logs FOR INSERT 
    WITH CHECK (true);

-- Function to generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_share_view_count(p_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE shared_links 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE token = p_token
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_views IS NULL OR view_count < max_views);
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log share access
CREATE OR REPLACE FUNCTION log_share_access(
    p_token TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referer TEXT DEFAULT NULL,
    p_location JSONB DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_shared_link_id UUID;
    v_log_id UUID;
BEGIN
    -- Get shared link id
    SELECT id INTO v_shared_link_id
    FROM shared_links
    WHERE token = p_token
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_views IS NULL OR view_count < max_views);
    
    IF v_shared_link_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Insert access log
    INSERT INTO shared_link_access_logs (
        shared_link_id,
        ip_address,
        user_agent,
        referer,
        location,
        device_info
    ) VALUES (
        v_shared_link_id,
        p_ip_address,
        p_user_agent,
        p_referer,
        p_location,
        p_device_info
    ) RETURNING id INTO v_log_id;
    
    -- Increment view count
    PERFORM increment_share_view_count(p_token);
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

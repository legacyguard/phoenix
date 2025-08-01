-- Create AccessLog table for tracking all user data access and actions
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    actor TEXT NOT NULL CHECK (actor IN ('USER', 'AI_SYSTEM', 'TRUSTED_PERSON', 'SYSTEM')),
    action TEXT NOT NULL,
    target_id TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX idx_access_logs_actor ON access_logs(actor);
CREATE INDEX idx_access_logs_action ON access_logs(action);
CREATE INDEX idx_access_logs_target_id ON access_logs(target_id);

-- Enable Row Level Security
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own access logs
CREATE POLICY "Users can view their own access logs" ON access_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow the system to insert access logs
CREATE POLICY "System can insert access logs" ON access_logs
    FOR INSERT WITH CHECK (true);

-- Comment on table and columns
COMMENT ON TABLE access_logs IS 'Audit log of all data access and user actions for transparency';
COMMENT ON COLUMN access_logs.actor IS 'Who performed the action: USER, AI_SYSTEM, TRUSTED_PERSON, or SYSTEM';
COMMENT ON COLUMN access_logs.action IS 'Description of the action performed';
COMMENT ON COLUMN access_logs.target_id IS 'ID of the resource that was accessed or modified';
COMMENT ON COLUMN access_logs.metadata IS 'Additional context about the action in JSON format';

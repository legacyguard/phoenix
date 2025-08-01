-- Create sensitive_vault table for storing encrypted sensitive information
CREATE TABLE IF NOT EXISTS sensitive_vault (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('bank_account', 'investment_account', 'insurance', 'digital_account', 'government_id', 'other')),
    encrypted_data JSONB NOT NULL, -- Stores encrypted passwords, account numbers, etc.
    task_associations TEXT[], -- Array of executor task IDs this information relates to
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional non-sensitive metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_sensitive_vault_user_id ON sensitive_vault(user_id);
CREATE INDEX idx_sensitive_vault_category ON sensitive_vault(category);
CREATE INDEX idx_sensitive_vault_task_associations ON sensitive_vault USING GIN(task_associations);

-- Enable Row Level Security
ALTER TABLE sensitive_vault ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to manage their own sensitive information
CREATE POLICY "Users can manage their own sensitive vault" ON sensitive_vault
    FOR ALL USING (auth.uid() = user_id);

-- Policy to allow executors to view sensitive information for deceased users
CREATE POLICY "Executors can view deceased user's sensitive vault" ON sensitive_vault
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN executor_tasks et ON et.deceased_user_id = p.id
            WHERE p.id = sensitive_vault.user_id
            AND p.is_deceased = true
            AND et.executor_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sensitive_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER sensitive_vault_updated_at
    BEFORE UPDATE ON sensitive_vault
    FOR EACH ROW
    EXECUTE FUNCTION update_sensitive_vault_updated_at();

-- Comment on table and columns
COMMENT ON TABLE sensitive_vault IS 'Stores encrypted sensitive information like passwords and account details';
COMMENT ON COLUMN sensitive_vault.encrypted_data IS 'Client-side encrypted JSON containing passwords, account numbers, etc.';
COMMENT ON COLUMN sensitive_vault.task_associations IS 'Array of executor task IDs that require this information';

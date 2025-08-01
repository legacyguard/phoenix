-- Create enum types for time capsule messages
CREATE TYPE message_type AS ENUM ('text', 'photo', 'video', 'audio');
CREATE TYPE unlock_condition AS ENUM ('date', 'after_passing');
CREATE TYPE capsule_status AS ENUM ('locked', 'unlocked', 'delivered');

-- Create time_capsule_messages table
CREATE TABLE IF NOT EXISTS time_capsule_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    text_content TEXT,
    attachment_url TEXT,
    attachment_metadata JSONB DEFAULT '{}',
    recipient_ids TEXT[] NOT NULL DEFAULT '{}',
    unlock_condition unlock_condition NOT NULL,
    unlock_date TIMESTAMPTZ,
    status capsule_status NOT NULL DEFAULT 'locked',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    delivered_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_unlock_date CHECK (
        (unlock_condition = 'date' AND unlock_date IS NOT NULL) OR
        (unlock_condition = 'after_passing' AND unlock_date IS NULL)
    ),
    CONSTRAINT valid_message_content CHECK (
        (message_type = 'text' AND text_content IS NOT NULL) OR
        (message_type IN ('photo', 'video', 'audio') AND attachment_url IS NOT NULL)
    )
);

-- Create indexes for efficient querying
CREATE INDEX idx_time_capsule_user_id ON time_capsule_messages(user_id);
CREATE INDEX idx_time_capsule_status ON time_capsule_messages(status);
CREATE INDEX idx_time_capsule_unlock_date ON time_capsule_messages(unlock_date) WHERE unlock_date IS NOT NULL;
CREATE INDEX idx_time_capsule_recipients ON time_capsule_messages USING GIN(recipient_ids);

-- Enable Row Level Security
ALTER TABLE time_capsule_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own time capsules
CREATE POLICY "Users can view own time capsules" ON time_capsule_messages
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own time capsules
CREATE POLICY "Users can create own time capsules" ON time_capsule_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own time capsules (only if still locked)
CREATE POLICY "Users can update own locked time capsules" ON time_capsule_messages
    FOR UPDATE USING (auth.uid() = user_id AND status = 'locked');

-- Policy: Users can delete their own time capsules (only if still locked)
CREATE POLICY "Users can delete own locked time capsules" ON time_capsule_messages
    FOR DELETE USING (auth.uid() = user_id AND status = 'locked');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_time_capsule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_time_capsule_updated_at_trigger
    BEFORE UPDATE ON time_capsule_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_time_capsule_updated_at();

-- Function to check and unlock time capsules based on date
CREATE OR REPLACE FUNCTION unlock_due_time_capsules()
RETURNS void AS $$
BEGIN
    UPDATE time_capsule_messages
    SET status = 'unlocked'
    WHERE status = 'locked'
    AND unlock_condition = 'date'
    AND unlock_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment on table and columns
COMMENT ON TABLE time_capsule_messages IS 'Stores time capsule messages that users create for future delivery to trusted people';
COMMENT ON COLUMN time_capsule_messages.message_type IS 'Type of message content: text, photo, video, or audio';
COMMENT ON COLUMN time_capsule_messages.recipient_ids IS 'Array of trusted_people IDs who can receive this message';
COMMENT ON COLUMN time_capsule_messages.unlock_condition IS 'Condition for unlocking: specific date or after user passing';
COMMENT ON COLUMN time_capsule_messages.status IS 'Current status: locked, unlocked, or delivered';

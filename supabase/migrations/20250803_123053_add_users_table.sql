-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username VARCHAR(100),
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- Add RLS Policies for Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profiles"
ON users
FOR ALL
USING (auth.uid() = id);

-- Generated Wills Table (Already existing)
-- Ensure proper RLS, indexes, and unique constraints

-- Time Capsule Messages Table (Already existing)
-- Ensure constraints, RLS, and indexes are set for security and performance

-- Notes: Verify each table has necessary indexes, relationships, and rights to Supabase roles.

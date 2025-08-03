-- ========================================
-- LegacyGuard Complete Database Setup
-- ========================================
-- Run this script in Supabase SQL Editor
-- This will create all necessary tables, relationships, and RLS policies

-- ========================================
-- 1. USER PROFILES TABLE
-- ========================================
-- Note: Supabase auth.users table is managed by Supabase Auth
-- We create a public.user_profiles table to store additional user data

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    date_of_birth DATE,
    phone_number TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    preferred_language VARCHAR(2) DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'premium')),
    
    -- Privacy settings
    privacy_mode TEXT DEFAULT 'hybrid' CHECK (privacy_mode IN ('hybrid', 'local_only')),
    auto_delete_after INTEGER DEFAULT 0 CHECK (auto_delete_after >= 0),
    ai_feature_toggles JSONB DEFAULT '{"expirationIntelligence": true, "behavioralNudges": true, "relationshipDetection": true}'::jsonb,
    
    -- Subscription and status
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    is_deceased BOOLEAN DEFAULT false,
    deceased_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Storage usage tracking
    storage_used_bytes BIGINT DEFAULT 0,
    document_count INTEGER DEFAULT 0,
    
    -- Settings and preferences
    settings JSONB DEFAULT '{}'::jsonb,
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_deceased ON public.user_profiles(is_deceased);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can manage all profiles
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========================================
-- 2. ENSURE ALL CORE TABLES EXIST
-- ========================================

-- Check and create generated_wills table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'generated_wills') THEN
        -- Create generated_wills table
        CREATE TABLE public.generated_wills (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            country_code VARCHAR(2) NOT NULL,
            will_content JSONB NOT NULL,
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'completed', 'revoked')),
            version INTEGER DEFAULT 1,
            pdf_url TEXT,
            handwriting_template_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Create indexes
        CREATE INDEX idx_generated_wills_user_id ON public.generated_wills(user_id);
        CREATE INDEX idx_generated_wills_status ON public.generated_wills(status);
        CREATE INDEX idx_generated_wills_created_at ON public.generated_wills(created_at DESC);
        CREATE INDEX idx_generated_wills_country_code ON public.generated_wills(country_code);
        
        -- Enable RLS
        ALTER TABLE public.generated_wills ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own wills" ON public.generated_wills
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can create own wills" ON public.generated_wills
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own draft wills" ON public.generated_wills
            FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');
    END IF;
END $$;

-- Check and create time_capsule_messages table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'time_capsule_messages') THEN
        -- Create enum types if they don't exist
        CREATE TYPE message_type AS ENUM ('text', 'photo', 'video', 'audio');
        CREATE TYPE unlock_condition AS ENUM ('date', 'after_passing');
        CREATE TYPE capsule_status AS ENUM ('locked', 'unlocked', 'delivered');
        
        -- Create time_capsule_messages table
        CREATE TABLE public.time_capsule_messages (
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
        
        -- Create indexes
        CREATE INDEX idx_time_capsule_user_id ON public.time_capsule_messages(user_id);
        CREATE INDEX idx_time_capsule_status ON public.time_capsule_messages(status);
        CREATE INDEX idx_time_capsule_unlock_date ON public.time_capsule_messages(unlock_date) WHERE unlock_date IS NOT NULL;
        CREATE INDEX idx_time_capsule_recipients ON public.time_capsule_messages USING GIN(recipient_ids);
        CREATE INDEX idx_time_capsule_created_at ON public.time_capsule_messages(created_at DESC);
        
        -- Enable RLS
        ALTER TABLE public.time_capsule_messages ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own time capsules" ON public.time_capsule_messages
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can create own time capsules" ON public.time_capsule_messages
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own locked time capsules" ON public.time_capsule_messages
            FOR UPDATE USING (auth.uid() = user_id AND status = 'locked');
        
        CREATE POLICY "Users can delete own locked time capsules" ON public.time_capsule_messages
            FOR DELETE USING (auth.uid() = user_id AND status = 'locked');
    END IF;
END $$;

-- ========================================
-- 3. CREATE TRIGGER FOR UPDATED_AT
-- ========================================
-- Create a generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to generated_wills if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'generated_wills') THEN
        DROP TRIGGER IF EXISTS update_generated_wills_updated_at ON public.generated_wills;
        CREATE TRIGGER update_generated_wills_updated_at
            BEFORE UPDATE ON public.generated_wills
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Apply trigger to time_capsule_messages if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'time_capsule_messages') THEN
        DROP TRIGGER IF EXISTS update_time_capsule_updated_at_trigger ON public.time_capsule_messages;
        CREATE TRIGGER update_time_capsule_updated_at_trigger
            BEFORE UPDATE ON public.time_capsule_messages
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- ========================================
-- 4. CREATE STORAGE BUCKETS
-- ========================================
-- Create storage buckets for documents and media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
    ('time-capsules', 'time-capsules', false, 52428800, ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf']),
    ('will-documents', 'will-documents', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 5. CREATE FUNCTION TO HANDLE NEW USER SIGNUP
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        user_id,
        full_name,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 6. CREATE VIEWS FOR EASIER QUERYING
-- ========================================

-- Create a view for active users with profile data
CREATE OR REPLACE VIEW public.active_users_view AS
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created_at,
    p.full_name,
    p.subscription_status,
    p.is_active,
    p.last_login_at,
    p.storage_used_bytes,
    p.document_count
FROM auth.users u
JOIN public.user_profiles p ON u.id = p.user_id
WHERE p.is_active = true AND p.is_deceased = false;

-- Grant access to authenticated users to view their own data
GRANT SELECT ON public.active_users_view TO authenticated;

-- ========================================
-- 7. CREATE HELPER FUNCTIONS
-- ========================================

-- Function to check if user has premium subscription
CREATE OR REPLACE FUNCTION public.is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.user_id = $1
        AND subscription_status IN ('premium', 'enterprise')
        AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's storage usage
CREATE OR REPLACE FUNCTION public.get_user_storage_info(user_id UUID)
RETURNS TABLE(
    storage_used_bytes BIGINT,
    document_count INTEGER,
    storage_limit_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.storage_used_bytes,
        p.document_count,
        CASE 
            WHEN p.subscription_status = 'free' THEN 104857600 -- 100 MB
            WHEN p.subscription_status = 'premium' THEN 1073741824 -- 1 GB
            WHEN p.subscription_status = 'enterprise' THEN 10737418240 -- 10 GB
        END as storage_limit_bytes
    FROM public.user_profiles p
    WHERE p.user_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_premium_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_storage_info TO authenticated;

-- ========================================
-- 8. ADD COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information beyond Supabase auth';
COMMENT ON COLUMN public.user_profiles.privacy_mode IS 'User privacy preference: hybrid or local_only processing';
COMMENT ON COLUMN public.user_profiles.auto_delete_after IS 'Years after which to auto-delete user data (0 = never)';
COMMENT ON COLUMN public.user_profiles.is_deceased IS 'Flag to mark if user has passed away to trigger legacy features';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current subscription tier: free, premium, or enterprise';

-- Add comments to generated_wills if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'generated_wills') THEN
        COMMENT ON TABLE public.generated_wills IS 'Stores user-generated wills with country-specific legal requirements';
        COMMENT ON COLUMN public.generated_wills.status IS 'Will status: draft, pending_signatures, completed, or revoked';
        COMMENT ON COLUMN public.generated_wills.will_content IS 'JSONB structure containing all will details';
    END IF;
END $$;

-- Add comments to time_capsule_messages if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'time_capsule_messages') THEN
        COMMENT ON TABLE public.time_capsule_messages IS 'Stores time capsule messages that users create for future delivery to trusted people';
        COMMENT ON COLUMN public.time_capsule_messages.message_type IS 'Type of message content: text, photo, video, or audio';
        COMMENT ON COLUMN public.time_capsule_messages.recipient_ids IS 'Array of trusted_people IDs who can receive this message';
        COMMENT ON COLUMN public.time_capsule_messages.unlock_condition IS 'Condition for unlocking: specific date or after user passing';
        COMMENT ON COLUMN public.time_capsule_messages.status IS 'Current status: locked, unlocked, or delivered';
    END IF;
END $$;

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================
-- Run these to verify the migration was successful

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    storage_count INTEGER;
BEGIN
    -- Check if all tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('user_profiles', 'generated_wills', 'time_capsule_messages');
    
    RAISE NOTICE 'Found % of 3 required tables', table_count;
    
    -- Check RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('user_profiles', 'generated_wills', 'time_capsule_messages');
    
    RAISE NOTICE 'Found % RLS policies', policy_count;
    
    -- Check functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('handle_new_user', 'is_premium_user', 'get_user_storage_info', 'update_updated_at_column');
    
    RAISE NOTICE 'Found % of 4 helper functions', function_count;
    
    -- Check storage buckets
    SELECT COUNT(*) INTO storage_count
    FROM storage.buckets
    WHERE id IN ('documents', 'time-capsules', 'will-documents');
    
    RAISE NOTICE 'Found % of 3 storage buckets', storage_count;
    
    -- Final status
    IF table_count = 3 AND function_count = 4 AND storage_count = 3 THEN
        RAISE NOTICE '✅ All database objects created successfully!';
    ELSE
        RAISE WARNING '⚠️  Some database objects may be missing. Please check the output above.';
    END IF;
END;
$$;

-- ========================================
-- 10. SAMPLE DATA (Optional - Remove in production)
-- ========================================
-- Uncomment below to insert sample data for testing

/*
-- Insert sample will requirements for testing
INSERT INTO public.will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements)
VALUES 
('US', 'United States', 2, false, false, '["identity", "revocation", "beneficiaries", "executor", "signature"]'::jsonb, 
 '{"title": "Last Will and Testament", "identity": "I, {name}, residing at {address}", "revocation": "I hereby revoke all previous wills and codicils."}}'::jsonb,
 'Requires signature in presence of 2 witnesses who must also sign'),
('UK', 'United Kingdom', 2, false, false, '["identity", "revocation", "beneficiaries", "executor", "signature"]'::jsonb,
 '{"title": "Last Will and Testament", "identity": "I {name} of {address}", "revocation": "I revoke all former wills and testamentary dispositions."}}'::jsonb,
 'Requires signature in presence of 2 witnesses who must also sign')
ON CONFLICT (country_code) DO NOTHING;
*/

-- End of setup script

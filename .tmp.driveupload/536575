-- ========================================
-- Database Setup Verification Script
-- ========================================
-- Run this in Supabase SQL Editor to verify your setup

-- 1. Check Tables
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as found,
    3 as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'generated_wills', 'time_capsule_messages');

-- 2. Check User Profiles Table Columns
SELECT 
    'User Profiles Columns' as check_type,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- 3. Check RLS Policies
SELECT 
    'RLS Policies' as check_type,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'generated_wills', 'time_capsule_messages')
ORDER BY tablename, policyname;

-- 4. Check Functions
SELECT 
    'Functions' as check_type,
    proname as function_name,
    prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('handle_new_user', 'is_premium_user', 'get_user_storage_info', 'update_updated_at_column');

-- 5. Check Storage Buckets
SELECT 
    'Storage Buckets' as check_type,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id IN ('documents', 'time-capsules', 'will-documents');

-- 6. Check Triggers
SELECT 
    'Triggers' as check_type,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%';

-- 7. Check if auth trigger exists
SELECT 
    'Auth Trigger' as check_type,
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND trigger_name = 'on_auth_user_created';

-- 8. Summary Report
SELECT 
    'SETUP SUMMARY' as report,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('user_profiles', 'generated_wills', 'time_capsule_messages')
        ) = 3 
        AND (
            SELECT COUNT(*) FROM storage.buckets
            WHERE id IN ('documents', 'time-capsules', 'will-documents')
        ) >= 3
        THEN '✅ Database setup appears complete!'
        ELSE '⚠️ Some components may be missing. Check individual results above.'
    END as status;

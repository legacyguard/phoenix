-- Quick verification of error logging deployment
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'error_logs'
        ) 
        THEN '✅ Table error_logs exists'
        ELSE '❌ Table error_logs NOT FOUND - Please run deployment script'
    END as table_status;

-- 2. Check table columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'error_logs'
ORDER BY ordinal_position;

-- 3. Check functions
SELECT 
    proname as function_name,
    pronargs as argument_count
FROM pg_proc 
WHERE proname IN ('log_error', 'check_critical_error_threshold')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Check RLS policies
SELECT 
    polname as policy_name,
    polcmd as command
FROM pg_policy
WHERE polrelid = 'public.error_logs'::regclass;

-- 5. Check if view exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.views 
            WHERE table_schema = 'public' 
            AND table_name = 'error_statistics'
        ) 
        THEN '✅ View error_statistics exists'
        ELSE '❌ View error_statistics NOT FOUND'
    END as view_status;

-- If everything is missing, you need to run the deployment script first!

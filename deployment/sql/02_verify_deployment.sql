-- Verification Queries for Error Logging System

-- 1. Check if error_logs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'error_logs'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'error_logs'
ORDER BY ordinal_position;

-- 3. Check if functions exist
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname IN ('log_error', 'check_critical_error_threshold');

-- 4. Check RLS policies
SELECT polname, polcmd, polroles::regrole[]
FROM pg_policy
WHERE polrelid = 'public.error_logs'::regclass;

-- 5. Test data (will be cleaned up)
INSERT INTO public.error_logs (
  error_level, 
  error_message, 
  error_context,
  page_url
) VALUES (
  'error', 
  'Deployment test error', 
  '{"test": true, "timestamp": "' || now() || '"}'::jsonb,
  '/deployment-test'
) RETURNING id;

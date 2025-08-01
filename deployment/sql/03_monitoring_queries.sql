-- Monitoring Queries for Error Logging System

-- Recent errors (last 24 hours)
SELECT 
  created_at,
  error_level,
  error_message,
  page_url,
  user_id
FROM error_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC 
LIMIT 50;

-- Error statistics by level
SELECT 
  error_level,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT page_url) as affected_pages
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_level
ORDER BY count DESC;

-- Top error messages
SELECT 
  error_message,
  COUNT(*) as occurrences,
  MAX(created_at) as last_seen
FROM error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_message
ORDER BY occurrences DESC
LIMIT 20;

-- Clean up test data
DELETE FROM error_logs 
WHERE error_context->>'test' = 'true';

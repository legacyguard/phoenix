# Error Logging System Deployment Guide

This guide provides step-by-step instructions for deploying the Supabase-based error logging system.

## Prerequisites

- [ ] Supabase project access with admin privileges
- [ ] Supabase CLI installed (optional, for Edge Function deployment)
- [ ] Resend account with API key
- [ ] Access to production environment

## 1. Deploy Database Migrations

### Step 1.1: Access Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 1.2: Run the Migration
1. Copy the contents of `supabase/migrations/20240726_create_error_logs_table.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute the migration

### Step 1.3: Verify Table Creation
Run this verification query:
```sql
-- Check if error_logs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'error_logs'
);

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'error_logs'
ORDER BY ordinal_position;

-- Check if functions exist
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname IN ('log_error', 'check_critical_error_threshold');

-- Check RLS policies
SELECT polname, polcmd, polroles::regrole[]
FROM pg_policy
WHERE polrelid = 'public.error_logs'::regclass;
```

### Step 1.4: Test Insert Permissions
```sql
-- Test as authenticated user (you'll need to use the Supabase client for this)
-- This is just to verify the structure
INSERT INTO public.error_logs (
  error_level, 
  error_message, 
  error_context,
  page_url
) VALUES (
  'error', 
  'Test error message', 
  '{"test": true}'::jsonb,
  '/test-page'
);

-- Check if insert was successful
SELECT * FROM public.error_logs ORDER BY created_at DESC LIMIT 1;

-- Clean up test data
DELETE FROM public.error_logs WHERE error_context->>'test' = 'true';
```

## 2. Deploy Supabase Edge Function

### Option A: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-critical-error-alert

# Set secrets
supabase secrets set RESEND_API_KEY=your-resend-api-key
supabase secrets set ERROR_ALERT_EMAIL=your-admin-email@domain.com
supabase secrets set RESEND_FROM_EMAIL=alerts@yourdomain.com
```

### Option B: Manual Upload via Dashboard

1. Navigate to **Edge Functions** in Supabase dashboard
2. Click **New Function**
3. Name it `send-critical-error-alert`
4. Copy the contents of `supabase/functions/send-critical-error-alert/index.ts`
5. Paste into the function editor
6. Click **Deploy**

### Set Environment Variables
In the function settings, add:
- `RESEND_API_KEY`: Your Resend API key
- `ERROR_ALERT_EMAIL`: Email to receive alerts
- `RESEND_FROM_EMAIL`: From email address (must be verified in Resend)

## 3. Test Error Logging System

### Step 3.1: Create Test Component
Create a temporary test component in your app:

```typescript
// src/components/test/ErrorTest.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useErrorTracking } from '@/utils/errorTracking';

export function ErrorTest() {
  const { logError, logWarning, logCritical } = useErrorTracking();

  const triggerError = () => {
    throw new Error('Test error from ErrorTest component');
  };

  const triggerAsyncError = async () => {
    await Promise.reject(new Error('Test async rejection'));
  };

  const triggerTrackedError = () => {
    logError('Manual test error', { 
      component: 'ErrorTest',
      action: 'button-click' 
    });
  };

  const triggerCriticalError = () => {
    logCritical('Test critical error', { 
      component: 'ErrorTest',
      severity: 'high' 
    });
  };

  const triggerMultipleCriticalErrors = () => {
    // Trigger multiple errors to test threshold
    for (let i = 0; i < 6; i++) {
      logCritical(`Critical error ${i + 1}`, { 
        component: 'ErrorTest',
        index: i 
      });
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Error Logging Test</h2>
      
      <div className="space-y-2">
        <Button onClick={triggerError} variant="destructive">
          Trigger Sync Error (ErrorBoundary)
        </Button>
        
        <Button onClick={triggerAsyncError} variant="destructive">
          Trigger Async Error
        </Button>
        
        <Button onClick={triggerTrackedError} variant="outline">
          Log Regular Error
        </Button>
        
        <Button onClick={triggerCriticalError} variant="outline">
          Log Critical Error
        </Button>
        
        <Button onClick={triggerMultipleCriticalErrors} variant="destructive">
          Trigger Alert (6 Critical Errors)
        </Button>
      </div>
    </div>
  );
}
```

### Step 3.2: Verify Error Logging
1. Add the test component to a page
2. Click each button to trigger different error types
3. Check Supabase dashboard → Table Editor → error_logs
4. Verify errors are being logged with correct data

### Step 3.3: Test Email Alerts
1. Click "Trigger Alert" button to generate multiple critical errors
2. Wait up to 1 minute for the email alert
3. Check your admin email for the alert
4. Verify email contains:
   - Error count
   - Recent error details
   - Links to dashboard

## 4. Configure Email Alerts

### Step 4.1: Adjust Error Threshold
Update the threshold in your `.env` file:
```env
CRITICAL_ERROR_THRESHOLD=10  # Adjust as needed
```

### Step 4.2: Update Database Function
If you need to change the threshold, update the function:
```sql
-- Update the check_critical_error_threshold function
CREATE OR REPLACE FUNCTION public.check_critical_error_threshold()
RETURNS TABLE(should_alert BOOLEAN, error_count INTEGER, time_window INTERVAL)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    threshold INTEGER;
    recent_errors INTEGER;
    window INTERVAL := INTERVAL '1 hour';
BEGIN
    -- Change this threshold value
    threshold := 10; -- New threshold
    
    SELECT COUNT(*) INTO recent_errors
    FROM public.error_logs
    WHERE error_level = 'critical'
    AND created_at > NOW() - window
    AND resolved_at IS NULL;
    
    RETURN QUERY
    SELECT 
        recent_errors >= threshold,
        recent_errors,
        window;
END;
$$;
```

### Step 4.3: Test Email Delivery
1. Ensure Resend domain is verified
2. Test with a lower threshold temporarily
3. Verify emails are not going to spam
4. Check email formatting on different clients

## 5. Production Verification

### Step 5.1: Pre-Deployment Checklist
- [ ] All environment variables set in production
- [ ] Database migrations applied to production
- [ ] Edge Functions deployed with correct secrets
- [ ] Email alerts tested with production email addresses
- [ ] Error threshold set appropriately for production load

### Step 5.2: Deploy to Production
```bash
# Build production bundle
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

### Step 5.3: Monitor First 24 Hours
1. **Check Error Logs Regularly**
   ```sql
   -- Recent errors
   SELECT * FROM error_logs 
   ORDER BY created_at DESC 
   LIMIT 50;
   
   -- Error statistics
   SELECT 
     error_level,
     COUNT(*) as count,
     COUNT(DISTINCT user_id) as affected_users
   FROM error_logs
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY error_level;
   ```

2. **Monitor Performance**
   ```sql
   -- Check query performance
   EXPLAIN ANALYZE
   SELECT * FROM error_logs
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

3. **Verify No False Positives**
   - Review all critical errors
   - Ensure legitimate errors only
   - Adjust threshold if needed

### Step 5.4: Create Monitoring Dashboard
Create a simple dashboard query:
```sql
-- Error summary view
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  error_level,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT page_url) as unique_pages,
  ARRAY_AGG(DISTINCT LEFT(error_message, 100)) as sample_errors
FROM error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), error_level
ORDER BY hour DESC;

-- Query the summary
SELECT * FROM error_summary WHERE error_count > 0;
```

## Troubleshooting

### Common Issues

1. **Errors not logging**
   - Check RLS policies
   - Verify user authentication
   - Check browser console for network errors

2. **Email alerts not sending**
   - Verify Resend API key
   - Check Edge Function logs
   - Ensure email addresses are correct

3. **Too many/few alerts**
   - Adjust threshold based on app usage
   - Consider time-based thresholds
   - Implement rate limiting

### Debug Queries
```sql
-- Check recent function calls
SELECT * FROM error_logs 
WHERE error_message LIKE '%alert sent%' 
ORDER BY created_at DESC;

-- Find unresolved critical errors
SELECT * FROM error_logs 
WHERE error_level = 'critical' 
AND resolved_at IS NULL 
ORDER BY created_at DESC;

-- User with most errors
SELECT 
  user_id,
  COUNT(*) as error_count,
  ARRAY_AGG(DISTINCT error_message) as errors
FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY user_id
ORDER BY error_count DESC
LIMIT 10;
```

## Maintenance

### Weekly Tasks
- Review error trends
- Clean up old resolved errors
- Update error thresholds if needed

### Monthly Tasks
```sql
-- Archive old errors (optional)
INSERT INTO error_logs_archive 
SELECT * FROM error_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM error_logs 
WHERE created_at < NOW() - INTERVAL '90 days'
AND resolved_at IS NOT NULL;
```

### Monitoring Best Practices
1. Set up weekly error summary emails
2. Create alerts for unusual error patterns
3. Regular review of error types and frequencies
4. Document common errors and solutions

## Success Criteria

Your error logging system is successfully deployed when:
- ✅ All errors are being logged to Supabase
- ✅ Critical errors trigger email alerts
- ✅ No performance impact on application
- ✅ Alerts are actionable and not too frequent
- ✅ Team can easily access and analyze error data

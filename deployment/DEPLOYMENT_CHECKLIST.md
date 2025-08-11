# Error Logging System Deployment Checklist

## Pre-Deployment

- [ ] Supabase project is accessible
- [ ] Resend account is set up with verified domain
- [ ] Environment variables are ready

## Database Deployment

1. [ ] Open Supabase SQL Editor
2. [ ] Run `deployment/sql/01_create_error_logs.sql`
3. [ ] Run `deployment/sql/02_verify_deployment.sql` and verify all checks pass
4. [ ] Note any errors and resolve them

## Edge Function Deployment

### Option A: Using Supabase CLI

```bash
# If not already linked
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy send-critical-error-alert

# Set secrets
supabase secrets set RESEND_API_KEY=your-key
supabase secrets set ERROR_ALERT_EMAIL=your-email
supabase secrets set RESEND_FROM_EMAIL=alerts@yourdomain.com
```

### Option B: Manual Dashboard Upload

1. [ ] Go to Edge Functions in Supabase Dashboard
2. [ ] Create new function: `send-critical-error-alert`
3. [ ] Copy content from `deployment/functions/send-critical-error-alert/index.ts`
4. [ ] Add environment variables from `.env.template`

## Application Testing

1. [ ] Start development server: `npm run dev`
2. [ ] Navigate to `/test-error` (or add the route)
3. [ ] Test each error type:
   - [ ] Sync Error (ErrorBoundary)
   - [ ] Async Error
   - [ ] Regular Error
   - [ ] Critical Error
   - [ ] Multiple Critical Errors (Alert Test)
4. [ ] Verify errors appear in Supabase `error_logs` table
5. [ ] Verify email alert is received for critical errors

## Production Deployment

1. [ ] Remove test routes and components
2. [ ] Update environment variables in production
3. [ ] Deploy application
4. [ ] Monitor `deployment/sql/03_monitoring_queries.sql` for 24 hours

## Post-Deployment

- [ ] Verify no false positive alerts
- [ ] Adjust error threshold if needed
- [ ] Document any custom error patterns
- [ ] Set up regular monitoring schedule

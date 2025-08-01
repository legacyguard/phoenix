#!/bin/bash

# Automated deployment script for error logging system
# This script helps automate the deployment of the error logging system

set -e

echo "🚀 LegacyGuard Error Logging System Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    if command -v supabase &> /dev/null; then
        print_status "Supabase CLI is installed"
        return 0
    else
        print_error "Supabase CLI is not installed"
        echo "Install it from: https://supabase.com/docs/guides/cli"
        return 1
    fi
}

# Generate SQL files for easy deployment
generate_sql_files() {
    echo ""
    echo "📄 Generating SQL deployment files..."
    
    # Create deployment directory
    mkdir -p deployment/sql
    
    # Copy migration file
    cp supabase/migrations/20240726_create_error_logs_table.sql deployment/sql/01_create_error_logs.sql
    
    # Create verification queries
    cat > deployment/sql/02_verify_deployment.sql << 'EOF'
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
EOF

    # Create monitoring queries
    cat > deployment/sql/03_monitoring_queries.sql << 'EOF'
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
EOF

    print_status "SQL files generated in deployment/sql/"
}

# Generate Edge Function deployment package
generate_edge_function() {
    echo ""
    echo "📦 Preparing Edge Function deployment..."
    
    mkdir -p deployment/functions
    
    # Copy the function
    cp -r supabase/functions/send-critical-error-alert deployment/functions/
    
    # Create environment template
    cat > deployment/functions/.env.template << 'EOF'
# Edge Function Environment Variables
# Copy this to Supabase Function Settings

RESEND_API_KEY=your-resend-api-key
ERROR_ALERT_EMAIL=admin@yourdomain.com
RESEND_FROM_EMAIL=alerts@yourdomain.com
CRITICAL_ERROR_THRESHOLD=5
EOF

    print_status "Edge Function prepared in deployment/functions/"
}

# Create test page for the application
create_test_page() {
    echo ""
    echo "🧪 Creating test page..."
    
    # Check if the test route exists, if not create it
    if [ ! -f "src/pages/TestError.tsx" ]; then
        cat > src/pages/TestError.tsx << 'EOF'
import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ErrorTest } from '@/components/test/ErrorTest';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function TestError() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Test Environment Only
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This page is for testing the error logging system. 
              Remove this route before deploying to production.
            </p>
          </div>
        </div>
      </Card>
      
      <ErrorBoundary>
        <ErrorTest />
      </ErrorBoundary>
    </div>
  );
}
EOF
        print_status "Test page created at src/pages/TestError.tsx"
        print_warning "Remember to add route /test-error to your router"
    else
        print_status "Test page already exists"
    fi
}

# Create deployment checklist
create_checklist() {
    echo ""
    echo "📋 Creating deployment checklist..."
    
    cat > deployment/DEPLOYMENT_CHECKLIST.md << 'EOF'
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
EOF

    print_status "Deployment checklist created"
}

# Main deployment process
main() {
    echo "Starting automated deployment preparation..."
    echo ""
    
    # Check prerequisites
    if ! check_supabase_cli; then
        print_warning "Continuing without Supabase CLI support"
    fi
    
    # Generate deployment files
    generate_sql_files
    generate_edge_function
    create_test_page
    create_checklist
    
    echo ""
    echo "✅ Deployment preparation complete!"
    echo ""
    echo "📍 Next Steps:"
    echo "1. Review files in the 'deployment' directory"
    echo "2. Follow the checklist in deployment/DEPLOYMENT_CHECKLIST.md"
    echo "3. Use the SQL files in order: 01, 02, 03"
    echo "4. Test using the /test-error route"
    echo ""
    echo "🔗 Quick Links:"
    echo "- SQL Files: deployment/sql/"
    echo "- Edge Function: deployment/functions/"
    echo "- Test Page: src/pages/TestError.tsx"
    echo "- Checklist: deployment/DEPLOYMENT_CHECKLIST.md"
    echo ""
    
    # Offer to open Supabase dashboard
    read -p "Would you like to open the Supabase dashboard? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "https://app.supabase.com"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "https://app.supabase.com"
        else
            echo "Please open https://app.supabase.com in your browser"
        fi
    fi
}

# Run the main function
main

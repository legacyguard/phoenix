# LegacyGuard Heritage Vault - Production Deployment Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring the production environment for LegacyGuard Heritage Vault. Follow these steps carefully to ensure a secure and properly configured deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Email Service (Resend) Setup](#email-service-resend-setup)
5. [Encryption Keys Management](#encryption-keys-management)
6. [Legal Validation Webhooks](#legal-validation-webhooks)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Security Checklist](#security-checklist)
9. [Deployment Process](#deployment-process)

## Prerequisites

- [ ] Supabase project created
- [ ] Resend account with verified domain
- [ ] SSL certificates for your domain
- [ ] Monitoring service accounts (Sentry, Datadog, etc.)
- [ ] Legal validation API access (for SK/CZ jurisdictions)
- [ ] Secure key management system (AWS Secrets Manager, HashiCorp Vault, etc.)

## Environment Variables Setup

### 1. Generate Encryption Keys

First, generate secure encryption keys using the provided script:

```bash
cd scripts
./generate-encryption-keys.sh
```

This will generate:
- Will backup encryption key
- Document encryption key
- Guardian data encryption key
- Webhook secret

**Important**: Store these keys in your secure key management system immediately.

### 2. Create Production Environment File

```bash
cp .env.production.example .env.production
```

### 3. Configure Environment Variables

Edit `.env.production` with your actual values:

#### Supabase Configuration
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Email Configuration
```env
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=notifications@yourdomain.com
RESEND_FROM_NAME=LegacyGuard Heritage Vault
```

## Supabase Configuration

### 1. Database Setup

Run the migration scripts in your Supabase project:

```sql
-- Run all migrations in the correct order
-- Check supabase/migrations folder
```

### 2. Storage Buckets

Create the following storage buckets in Supabase:

1. **documents** - For user documents
   - Public: No
   - File size limit: 50MB
   - Allowed MIME types: application/pdf, image/*

2. **wills** - For will documents
   - Public: No
   - File size limit: 10MB
   - Allowed MIME types: application/pdf

3. **avatars** - For user avatars
   - Public: Yes (with RLS)
   - File size limit: 5MB
   - Allowed MIME types: image/*

4. **backups** - For encrypted backups
   - Public: No
   - File size limit: 100MB

### 3. Row Level Security (RLS)

Ensure all tables have appropriate RLS policies:

```sql
-- Example for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Apply similar policies to all tables
```

### 4. Edge Functions

Deploy the Edge Functions for email notifications:

```bash
supabase functions deploy send-emergency-notification
```

## Email Service (Resend) Setup

### 1. Domain Verification

1. Add your domain to Resend
2. Configure DNS records:
   - SPF record
   - DKIM records
   - DMARC policy

### 2. API Key Configuration

1. Generate a production API key in Resend
2. Add to your environment variables:
   ```env
   RESEND_API_KEY=re_your_production_key
   ```

### 3. Email Templates

Configure email templates for:
- Guardian invitations
- Emergency access notifications
- Will completion confirmations
- Document expiration reminders

## Encryption Keys Management

### Best Practices

1. **Never commit keys to version control**
2. **Use a secure key management system**:
   - Vercel Environment Variables (encrypted at rest)
   - AWS Secrets Manager
   - HashiCorp Vault
   - Google Secret Manager

3. **Rotate keys regularly** (recommended: every 90 days)
4. **Implement key versioning**

### Example: Vercel Environment Variables

```bash
# Set environment variables in Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add RESEND_API_KEY production

# Or use the Vercel dashboard to add environment variables
```

## Legal Validation Webhooks

### 1. Webhook Endpoint Setup

Configure your webhook endpoints to receive legal validation callbacks:

```env
LEGAL_VALIDATION_WEBHOOK_URL=https://api.yourdomain.com/webhooks/legal-validation
LEGAL_VALIDATION_WEBHOOK_SECRET=your-webhook-secret
```

### 2. Webhook Security

Implement webhook signature verification:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### 3. Country-Specific Endpoints

Configure endpoints for each jurisdiction:

```env
# Slovakia
LEGAL_VALIDATION_SK_ENDPOINT=https://api.slovak-legal.gov.sk/v1/validate
LEGAL_VALIDATION_SK_API_KEY=your-slovak-api-key

# Czech Republic
LEGAL_VALIDATION_CZ_ENDPOINT=https://api.czech-legal.gov.cz/v1/validate
LEGAL_VALIDATION_CZ_API_KEY=your-czech-api-key
```

## Monitoring and Logging

### 1. Sentry Setup

1. Create a Sentry project
2. Configure DSN:
   ```env
   SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
   SENTRY_ENVIRONMENT=production
   ```

3. Initialize in your app:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.SENTRY_ENVIRONMENT,
     tracesSampleRate: 0.1,
   });
   ```

### 2. Application Monitoring

Configure monitoring for:
- Error rates
- Performance metrics
- User sessions
- API response times
- Database query performance

### 3. Alerting Rules

Set up alerts for:
- [ ] Error rate > 1%
- [ ] API response time > 2s
- [ ] Failed login attempts > 10/minute
- [ ] Storage usage > 80%
- [ ] Database connections > 80% of pool

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Encryption keys stored securely
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### Database Security

- [ ] RLS policies applied to all tables
- [ ] Service role key secured
- [ ] Database backups configured
- [ ] Connection pool limits set
- [ ] Statement timeout configured

### Application Security

- [ ] Authentication properly configured
- [ ] Session management secure
- [ ] Password policy enforced
- [ ] 2FA available for users
- [ ] Audit logging enabled

## Deployment Process

### 1. Build Process

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Output will be in dist/ folder
```

### 2. Environment Variable Configuration

Vercel automatically injects environment variables during build and runtime:

1. **Using Vercel CLI:**
   ```bash
   # Add environment variables
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   
   # Pull environment variables locally
   vercel env pull .env.production.local
   ```

2. **Using Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add each variable with appropriate scopes (Production/Preview/Development)
   - Vercel automatically redeploys when environment variables change

### 3. Deployment to Vercel

#### Automatic Deployment
Vercel automatically deploys when you push to your connected Git repository:
- Production: Pushes to `main` branch
- Preview: Pushes to other branches

#### Manual Deployment
```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

#### Vercel Configuration
The `vercel.json` file in the project root configures:
- URL rewrites for single-page application
- Cron jobs for scheduled tasks

### 4. Post-Deployment Verification

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] File uploads functional
- [ ] Email notifications sending
- [ ] Monitoring data flowing
- [ ] No console errors in production

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CORS_ALLOWED_ORIGINS includes your domain
   - Check Supabase CORS settings

2. **Authentication Failures**
   - Verify Supabase keys are correct
   - Check JWT expiration settings

3. **Email Not Sending**
   - Verify Resend API key
   - Check domain verification status
   - Review email logs in Resend dashboard

4. **File Upload Issues**
   - Check storage bucket policies
   - Verify file size limits
   - Confirm MIME type restrictions

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs and monitoring dashboards
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Rotate encryption keys
- **Annually**: Review and update security policies

### Backup Strategy

1. **Database**: Daily automated backups with 30-day retention
2. **Files**: Weekly backups of storage buckets
3. **Configuration**: Version control for all configuration files
4. **Disaster Recovery**: Document and test recovery procedures

## Support

For deployment support:
- Technical Documentation: [docs.legacyguard.com](https://docs.legacyguard.com)
- Support Email: support@legacyguard.com
- Emergency Contact: +1-XXX-XXX-XXXX

---

**Remember**: Security is not a one-time setup but an ongoing process. Regularly review and update your security measures.

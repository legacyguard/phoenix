# LegacyGuard Will System - Deployment Checklist

## Pre-Deployment

### 1. Environment Setup
- [ ] All environment variables configured in production
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `RESEND_API_KEY`
  - [ ] `SKRIBBLE_API_KEY`
  - [ ] `SKRIBBLE_ACCOUNT_ID`
  - [ ] `SKRIBBLE_WEBHOOK_SECRET`
  - [ ] `WILL_ENCRYPTION_KEY`
  - [ ] `SENTRY_DSN`
  - [ ] AWS credentials for backups

### 2. Database Setup
- [ ] Production Supabase instance created
- [ ] All migrations applied successfully
  ```bash
  npm run migrate:prod
  ```
- [ ] Row-level security policies verified
- [ ] Database backups configured
- [ ] Connection pooling optimized

### 3. Third-Party Services
- [ ] Clerk authentication configured
  - [ ] OAuth providers enabled
  - [ ] MFA settings configured
  - [ ] Webhook endpoints registered
- [ ] Skribble e-signature account setup
  - [ ] API credentials obtained
  - [ ] Webhook URL registered
  - [ ] Test signature completed
- [ ] Resend email service configured
  - [ ] Domain verified
  - [ ] Templates created
  - [ ] Rate limits understood
- [ ] Sentry error tracking setup
  - [ ] Project created
  - [ ] Alerts configured
  - [ ] Team notifications enabled

### 4. Security Review
- [ ] SSL certificates installed and valid
- [ ] Security headers configured
  - [ ] Content Security Policy
  - [ ] HSTS enabled
  - [ ] X-Frame-Options set
- [ ] API rate limiting enabled
- [ ] Input validation tested
- [ ] SQL injection prevention verified
- [ ] XSS protection confirmed
- [ ] CSRF tokens implemented
- [ ] Encryption keys rotated
- [ ] Secrets management reviewed

### 5. Legal Compliance
- [ ] GDPR compliance verified
  - [ ] Privacy policy updated
  - [ ] Data retention policies implemented
  - [ ] User data export functionality
  - [ ] Right to deletion implemented
- [ ] Terms of service reviewed
- [ ] Will templates legally reviewed
- [ ] Jurisdiction-specific requirements confirmed
- [ ] E-signature legality verified per country

## Deployment Process

### 1. Build & Test
- [ ] Run full test suite
  ```bash
  npm test
  ```
- [ ] Build production bundle
  ```bash
  npm run build
  ```
- [ ] Run security audit
  ```bash
  npm audit
  ```
- [ ] Verify bundle size
- [ ] Test production build locally

### 2. Infrastructure
- [ ] Docker images built and tagged
- [ ] Container registry accessible
- [ ] Load balancer configured
- [ ] Auto-scaling policies set
- [ ] Health checks configured
- [ ] Monitoring dashboards created
- [ ] Log aggregation setup

### 3. Deployment
- [ ] Database migrations run
- [ ] Environment variables verified
- [ ] Deploy to staging environment
- [ ] Smoke tests on staging
- [ ] Deploy to production
- [ ] Verify deployment success
- [ ] Update DNS if needed

## Post-Deployment

### 1. Verification
- [ ] All API endpoints responding
  ```bash
  curl https://app.legacyguard.com/api/health
  ```
- [ ] Authentication flow working
- [ ] Will generation functional
- [ ] PDF generation verified
- [ ] E-signature process tested
- [ ] Email notifications sending
- [ ] Error tracking active

### 2. Monitoring
- [ ] Application metrics visible
- [ ] Error rates acceptable
- [ ] Performance metrics within SLA
- [ ] Database queries optimized
- [ ] No security alerts
- [ ] Backup jobs running

### 3. Documentation
- [ ] API documentation updated
- [ ] Runbook created
- [ ] Incident response plan documented
- [ ] Team access granted
- [ ] Support documentation ready
- [ ] User guides published

### 4. Communication
- [ ] Team notified of deployment
- [ ] Support team briefed
- [ ] Status page updated
- [ ] Release notes published
- [ ] Customer communication sent (if needed)

## Rollback Plan

### If Issues Arise:
1. [ ] Identify issue severity
2. [ ] Check rollback criteria
3. [ ] Execute rollback if needed:
   ```bash
   docker pull ghcr.io/legacyguard/phoenix:previous-version
   docker-compose down
   docker-compose up -d
   ```
4. [ ] Verify rollback success
5. [ ] Notify stakeholders
6. [ ] Post-mortem scheduled

## Sign-Off

- [ ] Technical Lead: _________________ Date: _______
- [ ] Security Review: ________________ Date: _______
- [ ] Legal Review: ___________________ Date: _______
- [ ] Product Owner: __________________ Date: _______

## Notes

_Add any deployment-specific notes here_

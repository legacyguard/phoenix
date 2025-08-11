# Vercel Deployment Guide for LegacyGuard

## Prerequisites

1. Vercel account
2. Clerk account with configured application
3. Supabase project

## Environment Variables

Set these in your Vercel project settings:

### Required Variables

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-domain.vercel.app
VITE_IS_PRODUCTION=true
```

### Optional Variables

```
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_SENTRY_DSN=your_sentry_dsn
```

## Clerk Configuration

1. In your Clerk Dashboard:
   - Go to your application settings
   - Add your Vercel domain to **Allowed redirect URLs**:
     - `https://your-domain.vercel.app/*`
     - `https://your-domain.vercel.app/dashboard`
     - `https://your-domain.vercel.app/login`
2. Configure OAuth redirect URLs:
   - Google OAuth: `https://your-domain.vercel.app/dashboard`
   - Other providers: Same pattern

3. Update **Sign-in URL** to: `https://your-domain.vercel.app/login`
4. Update **After sign-in URL** to: `https://your-domain.vercel.app/dashboard`
5. Update **After sign-up URL** to: `https://your-domain.vercel.app/dashboard`

## Deployment Steps

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

## Troubleshooting

### 404 Error After Login

This usually means:

1. Clerk redirect URLs are not configured properly
2. The SPA routing is not working (check vercel.json)
3. Environment variables are missing

### Authentication Loop

Check:

1. VITE_CLERK_PUBLISHABLE_KEY is correct
2. Domain is added to Clerk allowed URLs
3. Cookies are enabled in browser

## Testing

After deployment:

1. Clear browser cache and cookies
2. Test login flow
3. Check console for errors
4. Verify all routes work correctly

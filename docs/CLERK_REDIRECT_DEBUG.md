# Clerk Redirect Debugging Guide

## Current Configuration

1. **Clerk Dashboard Settings** (https://dashboard.clerk.com)
   - Navigate to your application settings
   - Go to "Paths" section
   - Ensure these are set:
     - **Sign-in URL**: `/login`
     - **Sign-up URL**: `/register`
     - **After sign-in path**: `/dashboard`
     - **After sign-up path**: `/dashboard`

2. **Allowed Redirect URLs**
   - Add these URLs to "Redirect URLs" in Clerk Dashboard:
     ```
     https://legacyguard-heritage-vault.vercel.app/dashboard
     https://legacyguard-heritage-vault.vercel.app/*
     http://localhost:8080/dashboard
     http://localhost:8080/*
     ```

3. **OAuth Redirect URLs** (for Google SSO)
   - In Clerk Dashboard > Configure > SSO Connections > Google
   - Ensure the OAuth redirect URL includes your Vercel domain

## Debug Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for any Clerk-related errors
   - Check Network tab for failed redirects

2. **Verify Environment Variables on Vercel**
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

3. **Test Redirect Flow**
   - Clear browser cookies/cache
   - Try direct navigation to `/dashboard` when logged in
   - Check if redirect URL contains any query parameters

## Common Issues

1. **404 After SSO Login**
   - Usually caused by missing redirect URL in Clerk allowed URLs
   - Or incorrect afterSignInUrl configuration

2. **Redirect Loop**
   - Check if SignedIn/SignedOut components are properly configured
   - Verify MainLayout is not causing redirects

3. **Missing Routes**
   - Ensure all routes are defined before the catch-all route
   - Check that nested routes are properly structured

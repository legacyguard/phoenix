# Security Measures for Password Wall

## Overview

The application implements multiple layers of security to ensure that the password wall is always the first screen users see, preventing unauthorized access to the dashboard content.

## Security Implementations

### 1. Password Wall Authentication

- **No Persistence**: Authentication state is not stored in localStorage or sessionStorage
- **Session-Only**: Authentication is valid only for the current browser session
- **Always Required**: Password wall is shown on every page load/refresh
- **Password**: `legacy1guard`

### 2. Anti-Crawling Measures

#### robots.txt
```
User-agent: *
Disallow: /
```
- Prevents all web crawlers from indexing the site
- Blocks search engines from discovering and caching pages

#### Meta Tags
- `noindex`: Prevents search engines from indexing pages
- `nofollow`: Prevents following links
- `noarchive`: Prevents archiving/caching
- `nosnippet`: Prevents displaying snippets in search results
- `noimageindex`: Prevents indexing of images

### 3. Security Headers

#### HTTP Security Headers
- `X-Frame-Options: DENY` - Prevents iframe embedding
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restricts permissions

#### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.legacyguard.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self' https://api.clerk.com https://*.supabase.co wss://*.supabase.co;
frame-src 'self' https://clerk.legacyguard.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

### 4. Authentication Data Clearing

#### Immediate Clearing
- Script in HTML head clears authentication data before React loads
- Removes all potential auth-related localStorage/sessionStorage keys

#### Runtime Clearing
- Security utility clears authentication data on app initialization
- Validates security configuration on startup

### 5. Development vs Production

#### Development
- Security headers enabled in Vite dev server
- Console logging for debugging
- Authentication data clearing for testing

#### Production
- Security headers enforced via Vercel configuration
- Console logging disabled
- Strict CSP enforcement

## Usage

### For Users
1. Navigate to the application URL
2. Password wall will always be the first screen
3. Enter password: `legacy1guard`
4. Access the dashboard
5. Click logout button to return to password wall

### For Developers
1. Run `npm run dev` for development
2. Security measures are automatically applied
3. Test password wall functionality
4. Verify no authentication persistence

## Security Benefits

1. **Prevents Bot Access**: Crawlers cannot access dashboard content
2. **No Persistent Auth**: Users must enter password on every visit
3. **Frame Protection**: Cannot be embedded in iframes
4. **XSS Protection**: Prevents cross-site scripting attacks
5. **Content Isolation**: Strict CSP prevents unauthorized resource loading

## Monitoring

- Check browser developer tools for security headers
- Verify robots.txt is accessible at `/robots.txt`
- Test password wall functionality after browser restart
- Monitor for any authentication persistence issues

## Deployment

The security measures are automatically applied when deploying to Vercel:
- `vercel.json` configures production security headers
- `robots.txt` prevents crawling
- Meta tags are included in HTML
- CSP is enforced in production 
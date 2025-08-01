import { NextRequest, NextResponse } from 'next/server';

export function withSecurityHeaders(handler: (req: NextRequest, ...args: Array<Record<string, unknown>>) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: Array<Record<string, unknown>>) => {
    const response = await handler(req, ...args);
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.legacyguard.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.clerk.com https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://clerk.legacyguard.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
    
    return response;
  };
}

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const { windowMs, max, message = 'Too many requests' } = options;

  return async (req: NextRequest) => {
    const identifier = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'anonymous';
    
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      store[identifier].count++;
    }

    // Clean up old entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });

    if (store[identifier].count > max) {
      return NextResponse.json(
        { error: message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((store[identifier].resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(store[identifier].resetTime).toISOString()
          }
        }
      );
    }

    return null; // Continue to handler
  };
}

// Pre-configured rate limiters
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 auth attempts per window
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20 // 20 uploads per hour
});

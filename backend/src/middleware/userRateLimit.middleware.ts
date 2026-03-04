import rateLimit from 'express-rate-limit';

/**
 * Per-user rate limiting middleware.
 * Uses the authenticated user's ID as the key (falls back to IP for unauthenticated requests).
 * This provides per-user fairness — one user can't consume the entire global quota.
 */
export const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // per user: 1000 requests per 15 minutes
  keyGenerator: (req: any) => {
    return req.user?.userId || req.ip;
  },
  message: {
    success: false,
    message: 'Too many requests from this user, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

/**
 * Stricter rate limit for authentication endpoints to prevent brute-force.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes per IP
  keyGenerator: (req: any) => req.ip,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import rateLimit from 'express-rate-limit';

// Strict limit for auth routes — prevents brute force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per IP per window
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,     // return RateLimit headers in response
  legacyHeaders: false,
});

// General limit for all other API routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
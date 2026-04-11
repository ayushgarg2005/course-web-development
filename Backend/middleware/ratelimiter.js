import rateLimit from 'express-rate-limit';

// Strict limit for auth routes — prevents brute force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Increased from 10 to 100 for development
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,     // return RateLimit headers in response
  legacyHeaders: false,
});

// General limit for all other API routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                 // Increased from 100 to 1000 for development
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
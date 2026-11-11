const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Create rate limiter
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs: windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute default
        max: max || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests default
        message: {
            success: false,
            error: message || 'Too many requests, please try again later.'
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                error: message || 'Too many requests, please try again later.',
                retryAfter: Math.ceil(windowMs / 1000) // seconds
            });
        }
    });
};

// Default rate limiter for chat endpoints
const chatRateLimiter = createRateLimiter(
    60000, // 1 minute
    10, // 10 requests per minute
    'Too many chat requests. Please wait before sending more messages.'
);

// Stricter rate limiter for authentication endpoints
const authRateLimiter = createRateLimiter(
    15 * 60000, // 15 minutes
    5, // 5 requests per 15 minutes
    'Too many authentication attempts. Please try again later.'
);

// General API rate limiter
const generalRateLimiter = createRateLimiter(
    60000, // 1 minute
    30, // 30 requests per minute
    'Too many requests. Please slow down.'
);

module.exports = {
    createRateLimiter,
    chatRateLimiter,
    authRateLimiter,
    generalRateLimiter
};

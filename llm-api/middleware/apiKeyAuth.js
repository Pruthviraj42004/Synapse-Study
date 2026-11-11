const logger = require('../utils/logger');
const User = require('../models/User');

/**
 * API Key Authentication Middleware
 * Validates the API key from the x-api-key header
 */
const apiKeyAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            logger.warn('API request without API key');
            return res.status(401).json({
                success: false,
                error: 'API key is required. Please provide x-api-key header.'
            });
        }

        // Check if API key exists in environment variables (for simple setup)
        const envApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];

        if (envApiKeys.includes(apiKey)) {
            req.apiKeySource = 'env';
            return next();
        }

        // Check if API key exists in database (for user-specific keys)
        const user = await User.findOne({ apiKey, isActive: true });

        if (user) {
            req.user = user;
            req.apiKeySource = 'user';
            return next();
        }

        logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 10)}...`);
        return res.status(403).json({
            success: false,
            error: 'Invalid API key'
        });

    } catch (error) {
        logger.error('API key authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
};

module.exports = apiKeyAuth;

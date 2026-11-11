const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Validates JWT token from Authorization header
 */
const jwtAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Please provide Bearer token in Authorization header.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.userId);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found or inactive'
                });
            }

            req.user = user;
            req.userId = user._id;
            next();

        } catch (jwtError) {
            logger.warn('Invalid JWT token:', jwtError.message);
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

    } catch (error) {
        logger.error('JWT authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
};

module.exports = jwtAuth;

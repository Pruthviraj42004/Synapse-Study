const logger = require('../utils/logger');

/**
 * Request logger middleware
 * Logs all incoming requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        apiKeySource: req.apiKeySource || 'none'
    });

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });

    next();
};

module.exports = requestLogger;

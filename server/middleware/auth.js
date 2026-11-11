const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token and attaches user to request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError('No authentication token, access denied', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id and make sure token is still valid
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token', 401));
    } else if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Token expired', 401));
    }
    next(new ApiError('Authentication failed', 401));
  }
};

module.exports = auth;
module.exports.protect = auth;
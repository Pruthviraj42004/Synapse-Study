const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const jwtAuth = require('../middleware/jwtAuth');
const { authRateLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post('/register', authRateLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post('/login', authRateLimiter, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Protected (JWT)
 */
router.get('/profile', jwtAuth, getProfile);

module.exports = router;

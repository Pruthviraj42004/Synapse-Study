const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// REGISTER ROUTE
router.post(
  '/register',
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required'),

    body('email')
      .isEmail()
      .withMessage('Valid email required'),

    body('college')
      .notEmpty()
      .withMessage('College is required'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res, next) => {
    try {
      await authController.register(req, res, next);
    } catch (err) {
      console.error("REGISTER ROUTE ERROR:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Registration failed"
      });
    }
  }
);


// LOGIN ROUTE
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required')
  ],
  async (req, res, next) => {
    try {
      await authController.login(req, res, next);
    } catch (err) {
      console.error("LOGIN ROUTE ERROR:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Login failed"
      });
    }
  }
);

// GET CURRENT USER
router.get('/me', protect, authController.getMe);

// UPDATE PROFILE
router.put(
  '/profile',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional(),
    body('interests').optional().isArray(),
    body('avatar').optional()
  ],
  authController.updateProfile
);

// CHANGE PASSWORD
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  authController.changePassword
);

// LOGOUT
router.post('/logout', protect, authController.logout);

// UPDATE PREFERENCES
router.put('/preferences', protect, authController.updatePreferences);

// UPDATE STATS
router.put('/stats', protect, authController.updateStats);

module.exports = router;
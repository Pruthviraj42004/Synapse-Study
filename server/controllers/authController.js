const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Generate JWT Token with role and verification status
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      isVerified: user.isVerified
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError('Validation failed', 400, errors.array()));
  }

  const { name, email, college, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError('User already exists with this email', 400));
  }

  // Validate role - only allow student or teacher during registration
  const allowedRoles = ['student', 'teacher'];
  const userRole = role && allowedRoles.includes(role) ? role : 'student';

  // Create user
  const user = await User.create({
    name,
    email,
    college,
    password,
    role: userRole,
    // Teachers start unverified, students are auto-verified
    isVerified: userRole === 'student' ? true : false,
  });

  // Generate token
  const token = generateToken(user);

  // Remove password from response
  user.password = undefined;

  // Include verification message for teachers
  const message = userRole === 'teacher'
    ? 'Teacher account created. Awaiting admin verification before you can post content.'
    : 'User registered successfully';

  res.status(201).json({
    success: true,
    message,
    data: {
      user,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError('Validation failed', 400, errors.array()));
  }

  const { email, password } = req.body;

  console.log(`Login attempt for email: ${email}`);

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User not found with email:', email);
    return next(new ApiError('Invalid credentials', 401));
  }

  console.log('User found:', user.email, user._id);

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  console.log('Password check result:', isPasswordCorrect);

  if (!isPasswordCorrect) {
    console.log('Password verification failed');
    return next(new ApiError('Invalid credentials', 401));
  }

  console.log('Login successful for user:', user.email);

  // Update last active
  await user.updateLastActive();

  // Generate token
  const token = generateToken(user);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('joinedRooms.room', 'name subject');

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError('Validation failed', 400, errors.array()));
  }

  const { name, bio, interests, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      bio,
      interests,
      avatar,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError('Validation failed', 400, errors.array()));
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return next(new ApiError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  // In a more complex setup, you might invalidate the token here
  // For now, we'll just send a success response
  // The client should remove the token from localStorage

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res, next) => {
  const { preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { preferences },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      user,
    },
  });
});

// @desc    Update user stats
// @route   PUT /api/auth/stats
// @access  Private
const updateStats = asyncHandler(async (req, res, next) => {
  const { stats } = req.body;

  if (!stats) {
    return next(new ApiError('Stats object is required', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { stats },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Stats updated successfully',
    data: {
      user,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  updatePreferences,
  updateStats,
};
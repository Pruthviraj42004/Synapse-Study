/**
 * Admin Routes
 * Admin-only features: teacher verification, user management
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');
const User = require('../models/User');

/**
 * @route   GET /api/admin/pending-teachers
 * @desc    Get list of unverified teachers
 * @access  Admin only
 */
router.get('/pending-teachers', auth, requireAdmin, async (req, res) => {
    try {
        const pendingTeachers = await User.find({
            role: 'teacher',
            isVerified: false
        }).select('name email college createdAt');

        res.json({
            success: true,
            count: pendingTeachers.length,
            data: pendingTeachers
        });
    } catch (error) {
        console.error('Error fetching pending teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending teachers'
        });
    }
});

/**
 * @route   GET /api/admin/teachers
 * @desc    Get all teachers (verified and unverified)
 * @access  Admin only
 */
router.get('/teachers', auth, requireAdmin, async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('name email college isVerified createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: teachers.length,
            data: teachers
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers'
        });
    }
});

/**
 * @route   PUT /api/admin/verify-teacher/:userId
 * @desc    Verify a teacher account
 * @access  Admin only
 */
router.put('/verify-teacher/:userId', auth, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({
                success: false,
                message: 'User is not a teacher'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Teacher is already verified'
            });
        }

        user.isVerified = true;
        await user.save();

        res.json({
            success: true,
            message: `Teacher ${user.name} has been verified`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: true
            }
        });
    } catch (error) {
        console.error('Error verifying teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify teacher'
        });
    }
});

/**
 * @route   PUT /api/admin/revoke-teacher/:userId
 * @desc    Revoke teacher verification
 * @access  Admin only
 */
router.put('/revoke-teacher/:userId', auth, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({
                success: false,
                message: 'User is not a teacher'
            });
        }

        user.isVerified = false;
        await user.save();

        res.json({
            success: true,
            message: `Teacher ${user.name} verification has been revoked`,
            data: {
                id: user._id,
                name: user.name,
                isVerified: false
            }
        });
    } catch (error) {
        console.error('Error revoking teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke teacher verification'
        });
    }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Admin only
 */
router.get('/stats', auth, requireAdmin, async (req, res) => {
    try {
        const [
            totalStudents,
            totalTeachers,
            pendingTeachers,
            verifiedTeachers
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'teacher' }),
            User.countDocuments({ role: 'teacher', isVerified: false }),
            User.countDocuments({ role: 'teacher', isVerified: true })
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                totalTeachers,
                pendingTeachers,
                verifiedTeachers
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

module.exports = router;

const auth = require('./auth');

/**
 * Middleware to require admin role
 * Protects routes that should only be accessible by admins
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required. You do not have permission to access this resource.'
        });
    }

    next();
};

/**
 * Middleware to require verified teacher
 * Teachers must be verified by admin before they can post content
 */
const requireVerifiedTeacher = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Admin can also perform teacher actions
    if (req.user.role === 'admin') {
        return next();
    }

    if (req.user.role !== 'teacher') {
        return res.status(403).json({
            success: false,
            message: 'Teacher access required'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Your teacher account is pending verification. Please wait for admin approval.'
        });
    }

    next();
};

/**
 * Middleware to require student role only
 * Blocks teachers from student-only features
 */
const requireStudent = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    if (req.user.role === 'teacher') {
        return res.status(403).json({
            success: false,
            message: 'This feature is only available to students'
        });
    }

    if (req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Student access required'
        });
    }

    next();
};

/**
 * Middleware to require teacher or admin role
 * Useful for routes that both teachers and admins should access
 */
const requireTeacherOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        return res.status(403).json({
            success: false,
            message: 'Teacher or Admin access required'
        });
    }

    next();
};

/**
 * Middleware factory to check if user has one of the specified roles
 * @param {Array<string>} allowedRoles - Array of allowed roles (e.g., ['admin', 'teacher'])
 * @returns {Function} Express middleware function
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware to check if user is accessing their own resource or is an admin
 * @param {string} userIdField - Field name in req.params or req.body that contains the user ID
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const resourceUserId = req.params[userIdField] || req.body[userIdField];

        // Allow if user is admin or owns the resource
        if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this resource'
        });
    };
};

module.exports = {
    requireAdmin,
    requireVerifiedTeacher,
    requireStudent,
    requireTeacherOrAdmin,
    checkRole,
    requireOwnershipOrAdmin
};

const express = require('express');
const router = express.Router();
const {
    createNewsletter,
    getAllNewsletters,
    getNewsletterById,
    updateNewsletter,
    deleteNewsletter,
    getRecentAnnouncements,
    getPinnedNewsletters
} = require('../controllers/newsletterController');

const auth = require('../middleware/auth');
const { requireAdmin, requireVerifiedTeacher } = require('../middleware/roleMiddleware');

// Public routes (accessible to authenticated users)
router.get('/recent', auth, getRecentAnnouncements);
router.get('/pinned', auth, getPinnedNewsletters);
router.get('/', auth, getAllNewsletters);
router.get('/:id', auth, getNewsletterById);

// Verified teacher or admin can create newsletters
router.post('/', auth, requireVerifiedTeacher, createNewsletter);

// Admin-only for update and delete
router.put('/:id', auth, requireAdmin, updateNewsletter);
router.delete('/:id', auth, requireAdmin, deleteNewsletter);

module.exports = router;

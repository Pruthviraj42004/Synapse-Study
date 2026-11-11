const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireVerifiedTeacher } = require('../middleware/roleMiddleware');
const {
    uploadResource,
    getAllResources,
    getResourceById,
    deleteResource,
    trackDownload,
    getPopularResources,
    getRecentResources,
    getMyResources,
    analyzeResourceById,
    getResourceInsights
} = require('../controllers/resourceController');
const { extractResourceContent } = require('../controllers/contentExtractionController');

// Public routes (no auth required) - anyone can view resources
router.get('/', getAllResources);
router.get('/popular', getPopularResources);
router.get('/recent', getRecentResources);
router.get('/:id', getResourceById);
router.get('/:id/content', extractResourceContent); // Extract document text

// AI Analysis routes (auth required)
router.post('/:id/analyze', auth, analyzeResourceById); // Trigger AI analysis
router.get('/:id/insights', auth, getResourceInsights); // Get analysis results

// Upload resources - ONLY verified teachers and admin
router.post('/', auth, requireVerifiedTeacher, uploadResource);

// Delete - Owner or admin only (checked in controller)
router.delete('/:id', auth, deleteResource);

// Download tracking - any authenticated user
router.post('/:id/download', auth, trackDownload);
router.get('/user/my-uploads', auth, getMyResources);

module.exports = router;

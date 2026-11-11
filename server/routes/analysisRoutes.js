const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Analyze document
router.post('/:resourceId/analyze', analysisController.analyzeDocument);

// Get insights
router.get('/:resourceId/insights', analysisController.getInsights);

// Regenerate analysis
router.post('/:resourceId/regenerate', analysisController.regenerateAnalysis);

// Check status
router.get('/:resourceId/status', analysisController.getAnalysisStatus);

module.exports = router;

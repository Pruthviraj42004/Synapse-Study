const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Preferences
router.route('/preferences')
    .get(matchingController.getPreferences)
    .post(matchingController.savePreferences);

// Find peers
router.post('/find-peers', matchingController.findPeers);

// Match actions
router.post('/accept/:matchId', matchingController.acceptMatch);
router.post('/reject/:matchId', matchingController.rejectMatch);

// History
router.get('/history', matchingController.getMatchHistory);

module.exports = router;

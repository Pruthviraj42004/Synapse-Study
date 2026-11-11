const express = require('express');
const auth = require('../middleware/auth');
const {
  getProgrammingSession,
  updateCode,
  executeCode
} = require('../controllers/programming/studyRoomProgrammingController');

const router = express.Router({ mergeParams: true });

// Study room programming routes
// Base path when mounted: /api/study-rooms/:roomId/programming

// Get programming session for study room
router.get('/', auth, getProgrammingSession);

// Update code in programming session
router.put('/', auth, updateCode);

// Execute code in programming session
router.post('/execute', auth, executeCode);

module.exports = router;
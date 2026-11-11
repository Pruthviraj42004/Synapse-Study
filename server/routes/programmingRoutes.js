const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const programmingController = require('../controllers/programmingController');

/**
 * @route   POST /api/programming/execute
 * @desc    Execute code
 * @access  Private
 */
router.post('/execute', auth, programmingController.executeCode);

/**
 * @route   GET /api/programming/sessions
 * @desc    Get all code sessions for user
 * @access  Private
 */
router.get('/sessions', auth, programmingController.getSessions);

/**
 * @route   POST /api/programming/sessions
 * @desc    Create a new code session
 * @access  Private
 */
router.post('/sessions', auth, programmingController.createSession);

/**
 * @route   GET /api/programming/sessions/:id
 * @desc    Get a code session by ID
 * @access  Private
 */
router.get('/sessions/:id', auth, programmingController.getSessionById);

/**
 * @route   PUT /api/programming/sessions/:id
 * @desc    Update a code session
 * @access  Private
 */
router.put('/sessions/:id', auth, programmingController.updateSession);

/**
 * @route   DELETE /api/programming/sessions/:id
 * @desc    Delete a code session
 * @access  Private
 */
router.delete('/sessions/:id', auth, programmingController.deleteSession);

/**
 * @route   GET /api/programming/challenges
 * @desc    Get all challenges for the user's college
 * @access  Private
 */
router.get('/challenges', auth, programmingController.getChallenges);

/**
 * @route   POST /api/programming/challenges
 * @desc    Create a new challenge
 * @access  Private
 */
router.post('/challenges', auth, programmingController.createChallenge);

/**
 * @route   GET /api/programming/challenges/:id
 * @desc    Get a challenge by ID
 * @access  Private
 */
router.get('/challenges/:id', auth, programmingController.getChallengeById);

/**
 * @route   PUT /api/programming/challenges/:id
 * @desc    Update a challenge
 * @access  Private
 */
router.put('/challenges/:id', auth, programmingController.updateChallenge);

/**
 * @route   DELETE /api/programming/challenges/:id
 * @desc    Delete a challenge
 * @access  Private
 */
router.delete('/challenges/:id', auth, programmingController.deleteChallenge);

/**
 * @route   GET /api/programming/tutorials
 * @desc    Get all tutorials
 * @access  Private
 */
router.get('/tutorials', auth, programmingController.getTutorials);

/**
 * @route   GET /api/programming/tutorials/:slug
 * @desc    Get a tutorial by slug
 * @access  Private
 */
router.get('/tutorials/:slug', auth, programmingController.getTutorialBySlug);

/**
 * @route   GET /api/programming/sessions/room/:roomId
 * @desc    Get a code session for a study room
 * @access  Private
 */
router.get('/sessions/room/:roomId', auth, programmingController.getSessionByRoomId);

/**
 * @route   GET /api/programming/languages
 * @desc    Get available programming languages
 * @access  Private
 */
router.get('/languages', auth, programmingController.getLanguages);

/**
 * @route   GET /api/programming/health
 * @desc    Check execution service health
 * @access  Public
 */
router.get('/health', programmingController.getExecutionHealth);

/**
 * @route   POST /api/programming/stop
 * @desc    Stop code execution
 * @access  Private
 */
router.post('/stop', auth, programmingController.stopExecution);

/**
 * @route   GET /api/programming/templates
 * @desc    Get code templates
 * @access  Private
 */
router.get('/templates', auth, programmingController.getCodeTemplates);

/**
 * @route   POST /api/programming/snippets
 * @desc    Save code snippet
 * @access  Private
 */
router.post('/snippets', auth, programmingController.saveSnippet);

/**
 * @route   PUT /api/programming/sessions/:sessionId/share
 * @desc    Share a code session
 * @access  Private
 */
router.put('/sessions/:sessionId/share', auth, programmingController.shareSession);

module.exports = router;

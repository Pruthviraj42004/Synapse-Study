const express = require('express');
const router = express.Router();
const { getHistory, getConversation, deleteConversation } = require('../controllers/historyController');
const jwtAuth = require('../middleware/jwtAuth');
const { generalRateLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /api/history
 * @desc    Get all chat history for user
 * @access  Protected (JWT)
 * @query   page, limit
 */
router.get('/', jwtAuth, generalRateLimiter, getHistory);

/**
 * @route   GET /api/history/:id
 * @desc    Get specific conversation by conversation ID
 * @access  Protected (JWT)
 */
router.get('/:id', jwtAuth, generalRateLimiter, getConversation);

/**
 * @route   DELETE /api/history/:id
 * @desc    Delete a conversation
 * @access  Protected (JWT)
 */
router.delete('/:id', jwtAuth, generalRateLimiter, deleteConversation);

module.exports = router;

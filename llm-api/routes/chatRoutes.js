const express = require('express');
const router = express.Router();
const { chat, getModels } = require('../controllers/chatController');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const { chatRateLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/chat
 * @desc    Send chat message and get streaming response
 * @access  Protected (API Key)
 * @body    { model: string, messages: [{role, content}], conversationId?: string, stream?: boolean }
 */
router.post('/chat', apiKeyAuth, chatRateLimiter, chat);

/**
 * @route   GET /api/chat/models
 * @desc    Get available LLM models
 * @access  Protected (API Key)
 */
router.get('/chat/models', apiKeyAuth, getModels);

module.exports = router;

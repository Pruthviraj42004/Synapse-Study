const llmService = require('../utils/llmService');
const ChatHistory = require('../models/ChatHistory');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Chat controller - handles chat requests with streaming
 */
const chat = async (req, res) => {
    try {
        const { model, messages, conversationId, stream = true } = req.body;

        // Validation
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Messages array is required and must not be empty'
            });
        }

        // Validate message format
        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                return res.status(400).json({
                    success: false,
                    error: 'Each message must have role and content fields'
                });
            }
            if (!['system', 'user', 'assistant'].includes(msg.role)) {
                return res.status(400).json({
                    success: false,
                    error: 'Message role must be system, user, or assistant'
                });
            }
        }

        const conversationUuid = conversationId || uuidv4();

        // Handle streaming response
        if (stream) {
            // Set headers for Server-Sent Events
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in nginx

            let fullResponse = '';

            try {
                // Stream the response
                for await (const chunk of llmService.streamChat(messages, model)) {
                    fullResponse += chunk;

                    // Send SSE formatted data
                    res.write(`data: ${JSON.stringify({
                        chunk,
                        conversationId: conversationUuid
                    })}\n\n`);
                }

                // Send completion signal
                res.write(`data: ${JSON.stringify({
                    done: true,
                    conversationId: conversationUuid
                })}\n\n`);

                // Save to chat history if user is authenticated
                if (req.user) {
                    await saveChatHistory(req.user._id, conversationUuid, model, messages, fullResponse);
                }

                res.end();

            } catch (streamError) {
                logger.error('Streaming error:', streamError);
                res.write(`data: ${JSON.stringify({
                    error: streamError.message
                })}\n\n`);
                res.end();
            }

        } else {
            // Handle non-streaming response
            const reply = await llmService.getCompletion(messages, model);

            // Save to chat history if user is authenticated
            if (req.user) {
                await saveChatHistory(req.user._id, conversationUuid, model, messages, reply);
            }

            res.json({
                success: true,
                reply,
                conversationId: conversationUuid,
                model: model || llmService.defaultModel
            });
        }

    } catch (error) {
        logger.error('Chat controller error:', error);

        if (res.headersSent) {
            res.end();
        } else {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to process chat request'
            });
        }
    }
};

/**
 * Get available models
 */
const getModels = (req, res) => {
    try {
        const models = llmService.getAvailableModels();
        res.json({
            success: true,
            provider: llmService.provider,
            models
        });
    } catch (error) {
        logger.error('Get models error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve models'
        });
    }
};

/**
 * Helper function to save chat history
 */
const saveChatHistory = async (userId, conversationId, model, messages, assistantResponse) => {
    try {
        // Find existing conversation or create new one
        let chatHistory = await ChatHistory.findOne({ conversationId });

        const assistantMessage = {
            role: 'assistant',
            content: assistantResponse,
            timestamp: new Date()
        };

        if (chatHistory) {
            // Append new messages to existing conversation
            chatHistory.messages.push(...messages.map(m => ({
                ...m,
                timestamp: new Date()
            })));
            chatHistory.messages.push(assistantMessage);
            await chatHistory.save();
        } else {
            // Create new conversation
            chatHistory = await ChatHistory.create({
                userId,
                conversationId,
                model: model || llmService.defaultModel,
                messages: [
                    ...messages.map(m => ({
                        ...m,
                        timestamp: new Date()
                    })),
                    assistantMessage
                ]
            });
        }

        logger.info(`Chat history saved for conversation: ${conversationId}`);
    } catch (error) {
        logger.error('Failed to save chat history:', error);
        // Don't throw - chat history is optional
    }
};

module.exports = {
    chat,
    getModels
};

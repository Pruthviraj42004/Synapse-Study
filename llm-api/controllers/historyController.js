const ChatHistory = require('../models/ChatHistory');
const logger = require('../utils/logger');

/**
 * Get all chat history for the authenticated user
 */
const getHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const history = await ChatHistory.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await ChatHistory.countDocuments({ userId: req.userId });

        res.json({
            success: true,
            data: history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        logger.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve chat history'
        });
    }
};

/**
 * Get specific conversation by ID
 */
const getConversation = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await ChatHistory.findOne({
            conversationId: id,
            userId: req.userId
        }).select('-__v');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        res.json({
            success: true,
            data: conversation
        });

    } catch (error) {
        logger.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversation'
        });
    }
};

/**
 * Delete a conversation
 */
const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await ChatHistory.findOneAndDelete({
            conversationId: id,
            userId: req.userId
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        logger.info(`Conversation deleted: ${id}`);

        res.json({
            success: true,
            message: 'Conversation deleted successfully'
        });

    } catch (error) {
        logger.error('Delete conversation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete conversation'
        });
    }
};

module.exports = {
    getHistory,
    getConversation,
    deleteConversation
};

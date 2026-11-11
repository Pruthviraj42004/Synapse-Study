/**
 * Video Controller
 * 
 * Handles Daily.co video room creation and management
 */

const { createDailyRoom, getDailyRoom, createMeetingToken, deleteDailyRoom } = require('../services/video/dailyService');

/**
 * Create or get video room for a study session
 * POST /api/video/create-room
 */
exports.createVideoRoom = async (req, res) => {
    try {
        const { roomId, options = {} } = req.body;
        const user = req.user; // From auth middleware

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            });
        }

        // Create or get existing room
        const roomData = await createDailyRoom(roomId, options);

        // Create meeting token for this user
        const token = await createMeetingToken(roomId, {
            userId: user._id.toString(),
            userName: user.name,
            role: user.role || 'student'
        });

        // Create response data
        const responseData = {
            roomUrl: roomData.roomUrl,
            roomName: roomData.roomName,
            expiresAt: roomData.expiresAt,
            provider: roomData.provider,
            isMock: roomData.isMock || false
        };

        // Only include token if it was successfully created
        // If token is null (no API key), omit it to allow anonymous joins
        if (token) {
            responseData.token = token;
        }

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('❌ Create video room error:', error.message);
        console.error('Error details:', error.response?.data || error);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create video room',
            details: error.response?.data || null
        });
    }
};

/**
 * Get existing video room data
 * GET /api/video/room/:roomId
 */
exports.getVideoRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const roomData = await getDailyRoom(roomId);

        res.status(200).json({
            success: true,
            data: roomData
        });

    } catch (error) {
        console.error('Get video room error:', error);
        res.status(404).json({
            success: false,
            message: 'Video room not found'
        });
    }
};

/**
 * Delete video room
 * DELETE /api/video/room/:roomId
 */
exports.deleteVideoRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        await deleteDailyRoom(roomId);

        res.status(200).json({
            success: true,
            message: 'Video room deleted successfully'
        });

    } catch (error) {
        console.error('Delete video room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete video room'
        });
    }
};

/**
 * Create meeting token for a user
 * POST /api/video/token
 */
exports.createToken = async (req, res) => {
    try {
        const { roomId } = req.body;
        const user = req.user;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            });
        }

        const token = await createMeetingToken(roomId, {
            userId: user._id.toString(),
            userName: user.name,
            role: user.role || 'student'
        });

        res.status(200).json({
            success: true,
            data: { token }
        });

    } catch (error) {
        console.error('Create token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create meeting token'
        });
    }
};

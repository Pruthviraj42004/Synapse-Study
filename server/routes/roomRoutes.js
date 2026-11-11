/**
 * Unified Room Routes
 * Handles room creation, joining, state management, and LiveKit integration
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roleMiddleware');
const roomManager = require('../services/roomManager');
const StudyRoom = require('../models/StudyRoom');

/**
 * Generate a unique invite code for private rooms
 */
const generateInviteCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * @route   POST /api/rooms/create
 * @desc    Create a new unified room (DB + LiveKit)
 * @access  Private - Students only
 */
router.post('/create', protect, requireStudent, async (req, res) => {
    try {
        const { name, description, subject, category, maxParticipants, isPrivate, settings } = req.body;

        // Validation
        if (!name || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Name and subject are required'
            });
        }

        // Generate invite code for private rooms
        const inviteCode = isPrivate ? generateInviteCode() : null;

        // Create room through manager
        const room = await roomManager.createRoom({
            name,
            description,
            subject,
            category: category || 'Other',
            college: req.user.college || 'Not specified',
            maxParticipants: maxParticipants || 20,
            isPrivate: isPrivate || false,
            inviteCode,
            settings: settings || {
                allowChat: true,
                allowWhiteboard: true,
                allowVideoCall: true,
                allowFileSharing: true,
                allowProgramming: true
            }
        }, req.user._id);

        // Populate creator info
        await room.populate('creator', 'name email avatar college');

        res.status(201).json({
            success: true,
            data: room,
            inviteLink: isPrivate ? `/study-room/${room._id}?invite=${inviteCode}` : null,
            message: 'Room created successfully'
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create room',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/rooms/:roomId/join
 * @desc    Join a room and get LiveKit token
 * @access  Private - Students only
 */
router.post('/:roomId/join', protect, requireStudent, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { inviteCode } = req.body;

        // Fetch room to check privacy
        const room = await StudyRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Validate invite code for private rooms
        if (room.isPrivate) {
            if (!inviteCode) {
                return res.status(403).json({
                    success: false,
                    message: 'This is a private room. An invite code is required to join.'
                });
            }
            if (room.inviteCode !== inviteCode) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid invite code. Please check your invite link.'
                });
            }
        }

        const result = await roomManager.joinRoom(
            roomId,
            req.user._id,
            req.user.name
        );

        // Emit socket event
        if (req.io) {
            req.io.to(`room_${roomId}`).emit('user_joined', {
                userId: req.user._id,
                userName: req.user.name,
                userAvatar: req.user.avatar
            });
        }

        res.json({
            success: true,
            data: {
                room: result.room,
                livekitToken: result.livekitToken,
                livekitUrl: result.livekitUrl,
                state: result.state
            },
            message: 'Joined room successfully'
        });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to join room'
        });
    }
});

/**
 * @route   GET /api/rooms/:roomId
 * @desc    Get room details and state
 * @access  Private - Students only
 */
router.get('/:roomId', protect, requireStudent, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { invite } = req.query;

        const room = await StudyRoom.findById(roomId)
            .populate('creator', 'name email avatar college')
            .populate('participants.user', 'name email avatar');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check private room access
        if (room.isPrivate) {
            const isParticipant = room.participants.some(p =>
                p.user._id.toString() === req.user._id.toString()
            );
            const isCreator = room.creator._id.toString() === req.user._id.toString();

            if (!isParticipant && !isCreator) {
                if (!invite || room.inviteCode !== invite) {
                    return res.status(403).json({
                        success: false,
                        message: 'This is a private room. Valid invite code required.',
                        requiresInvite: true
                    });
                }
            }
        }

        res.json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get room details'
        });
    }
});

/**
 * @route   DELETE /api/rooms/:roomId/leave
 * @desc    Leave a room
 * @access  Private - Students only
 */
router.delete('/:roomId/leave', protect, requireStudent, async (req, res) => {
    try {
        const { roomId } = req.params;

        await roomManager.leaveRoom(roomId, req.user._id);

        // Emit socket event
        if (req.io) {
            req.io.to(`room_${roomId}`).emit('user_left', {
                userId: req.user._id,
                userName: req.user.name
            });
        }

        res.json({
            success: true,
            message: 'Left room successfully'
        });
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave room'
        });
    }
});

/**
 * @route   GET /api/rooms/:roomId/state
 * @desc    Get full room state (chat, code, whiteboard)
 * @access  Private - Students only
 */
router.get('/:roomId/state', protect, requireStudent, async (req, res) => {
    try {
        const { roomId } = req.params;

        const state = await roomManager.getRoomState(roomId);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            data: state
        });
    } catch (error) {
        console.error('Error getting room state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get room state'
        });
    }
});

/**
 * @route   POST /api/rooms/:roomId/heartbeat
 * @desc    Update participant heartbeat
 * @access  Private - Students only
 */
router.post('/:roomId/heartbeat', protect, requireStudent, async (req, res) => {
    try {
        const { roomId } = req.params;

        roomManager.updateHeartbeat(roomId, req.user._id);

        res.json({
            success: true,
            message: 'Heartbeat updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update heartbeat'
        });
    }
});

/**
 * @route   GET /api/rooms/:roomId/invite-link
 * @desc    Get or regenerate invite link for private room
 * @access  Private - Room creator only
 */
router.get('/:roomId/invite-link', protect, requireStudent, async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await StudyRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Only creator can get invite link
        if (room.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the room creator can access the invite link'
            });
        }

        if (!room.isPrivate) {
            return res.json({
                success: true,
                data: {
                    isPrivate: false,
                    link: `/study-room/${roomId}`
                }
            });
        }

        res.json({
            success: true,
            data: {
                isPrivate: true,
                inviteCode: room.inviteCode,
                link: `/study-room/${roomId}?invite=${room.inviteCode}`
            }
        });
    } catch (error) {
        console.error('Error getting invite link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invite link'
        });
    }
});

/**
 * @route   GET /api/rooms/stats/active
 * @desc    Get statistics about active rooms
 * @access  Private (Admin)
 */
router.get('/stats/active', protect, async (req, res) => {
    try {
        const stats = roomManager.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics'
        });
    }
});

module.exports = router;

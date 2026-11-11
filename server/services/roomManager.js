/**
 * Room Manager Service
 * Unified management of room state, participants, and lifecycle
 */

const livekitService = require('./livekitService');
const StudyRoom = require('../models/StudyRoom');

class RoomManager {
    constructor() {
        // In-memory state for active rooms (can be replaced with Redis)
        this.activeRooms = new Map();
        this.participantHeartbeats = new Map();
    }

    /**
     * Create a new unified room (DB + LiveKit)
     */
    async createRoom(roomData, creatorId) {
        try {
            // Create database room
            const dbRoom = new StudyRoom({
                ...roomData,
                creator: creatorId,
                participants: [{
                    user: creatorId,
                    role: 'owner',
                    joinedAt: new Date()
                }],
                livekit: {
                    roomName: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    isActive: false,
                    lastActivity: new Date(),
                    participants: []
                },
                state: {
                    chat: { messages: [], messageCount: 0 },
                    code: { content: '', language: 'javascript', yDocVersion: 0 },
                    whiteboard: { elements: [], yDocVersion: 0 }
                }
            });

            await dbRoom.save();

            // Create LiveKit room if configured
            if (livekitService.isConfigured()) {
                try {
                    await livekitService.createRoom(dbRoom.livekit.roomName, {
                        metadata: {
                            studyRoomId: dbRoom._id.toString(),
                            subject: dbRoom.subject,
                            createdAt: new Date().toISOString()
                        }
                    });

                    dbRoom.livekit.isActive = true;
                    await dbRoom.save();
                } catch (error) {
                    console.error('Error creating LiveKit room:', error);
                    // Continue anyway - room can function without LiveKit
                }
            }

            // Add to active rooms cache
            this.activeRooms.set(dbRoom._id.toString(), {
                roomId: dbRoom._id.toString(),
                livekitRoom: dbRoom.livekit.roomName,
                participants: new Set([creatorId.toString()]),
                lastActivity: new Date()
            });

            console.log(`✅ Room created: ${dbRoom.name} (${dbRoom._id})`);
            return dbRoom;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    /**
     * Join a room and get LiveKit token
     */
    async joinRoom(roomId, userId, userName) {
        try {
            const room = await StudyRoom.findById(roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            // Add user to participants if not already present
            if (!room.isParticipant(userId)) {
                room.addParticipant(userId);
                await room.save();
            }

            // Update in-memory state
            let activeRoom = this.activeRooms.get(roomId);
            if (!activeRoom) {
                activeRoom = {
                    roomId,
                    livekitRoom: room.livekit.roomName,
                    participants: new Set(),
                    lastActivity: new Date()
                };
                this.activeRooms.set(roomId, activeRoom);
            }

            activeRoom.participants.add(userId.toString());
            activeRoom.lastActivity = new Date();

            // Update room activity
            room.stats.lastActivity = new Date();
            await room.save();

            // Generate LiveKit token
            let livekitToken = null;
            if (livekitService.isConfigured()) {
                try {
                    // Create unique identity per session
                    const sessionId = Date.now().toString(36);
                    const participantIdentity = `${userId.toString()}_${sessionId}`;

                    livekitToken = await livekitService.generateToken(
                        room.livekit.roomName,
                        participantIdentity,
                        userName,
                        { canPublish: true, canSubscribe: true, canPublishData: true }
                    );

                    // Add to LiveKit participants
                    if (!room.livekit.participants.some(p => p.userId.toString() === userId.toString())) {
                        room.livekit.participants.push({
                            userId,
                            joinedAt: new Date(),
                            isAudioEnabled: false,
                            isVideoEnabled: false
                        });
                        await room.save();
                    }
                } catch (error) {
                    console.error('Error generating LiveKit token:', error);
                }
            }

            // Start heartbeat
            this.updateHeartbeat(roomId, userId);

            console.log(`👤 User ${userName} joined room ${room.name}`);

            return {
                room,
                livekitToken,
                livekitUrl: livekitService.isConfigured() ? livekitService.serverUrl : null,
                state: room.state
            };
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    /**
     * Leave a room
     */
    async leaveRoom(roomId, userId) {
        try {
            const room = await StudyRoom.findById(roomId);
            if (!room) {
                return;
            }

            // Update in-memory state
            const activeRoom = this.activeRooms.get(roomId);
            if (activeRoom) {
                activeRoom.participants.delete(userId.toString());

                // If room is now empty, schedule cleanup
                if (activeRoom.participants.size === 0) {
                    activeRoom.lastActivity = new Date();
                }
            }

            // Remove from LiveKit participants
            room.livekit.participants = room.livekit.participants.filter(
                p => p.userId.toString() !== userId.toString()
            );

            // Remove heartbeat
            const heartbeatKey = `${roomId}_${userId}`;
            this.participantHeartbeats.delete(heartbeatKey);

            await room.save();

            console.log(`👋 User left room ${room.name}`);
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    /**
     * Update room state (chat, code, whiteboard)
     */
    async updateRoomState(roomId, stateType, stateData) {
        try {
            const room = await StudyRoom.findById(roomId);
            if (!room) {
                return null;
            }

            // Update specific state
            if (stateType === 'chat') {
                room.state.chat = { ...room.state.chat, ...stateData };
            } else if (stateType === 'code') {
                room.state.code = { ...room.state.code, ...stateData };
            } else if (stateType === 'whiteboard') {
                room.state.whiteboard = { ...room.state.whiteboard, ...stateData };
            }

            room.lastSyncedAt = new Date();
            room.stats.lastActivity = new Date();
            await room.save();

            // Update active room
            const activeRoom = this.activeRooms.get(roomId);
            if (activeRoom) {
                activeRoom.lastActivity = new Date();
            }

            return room.state;
        } catch (error) {
            console.error('Error updating room state:', error);
            return null;
        }
    }

    /**
     * Get full room state
     */
    async getRoomState(roomId) {
        try {
            const room = await StudyRoom.findById(roomId)
                .populate('creator', 'name email avatar')
                .populate('participants.user', 'name email avatar');

            if (!room) {
                return null;
            }

            return {
                room: room.toJSON(),
                state: room.state,
                activeParticipants: this.getActiveParticipants(roomId)
            };
        } catch (error) {
            console.error('Error getting room state:', error);
            return null;
        }
    }

    /**
     * Get active participants for a room
     */
    getActiveParticipants(roomId) {
        const activeRoom = this.activeRooms.get(roomId);
        return activeRoom ? Array.from(activeRoom.participants) : [];
    }

    /**
     * Update heartbeat for a participant
     */
    updateHeartbeat(roomId, userId) {
        const key = `${roomId}_${userId}`;
        this.participantHeartbeats.set(key, new Date());
    }

    /**
     * Check for inactive rooms and cleanup
     */
    async cleanupInactiveRooms() {
        const now = new Date();
        const inactivityThreshold = 30 * 60 * 1000; // 30 minutes

        for (const [roomId, activeRoom] of this.activeRooms.entries()) {
            const timeSinceActivity = now - activeRoom.lastActivity;

            // Room is empty and inactive
            if (activeRoom.participants.size === 0 && timeSinceActivity > inactivityThreshold) {
                console.log(`🧹 Cleaning up inactive room: ${roomId}`);

                try {
                    // Close LiveKit room
                    if (livekitService.isConfigured()) {
                        await livekitService.deleteRoom(activeRoom.livekitRoom);
                    }

                    // Update database
                    const room = await StudyRoom.findById(roomId);
                    if (room) {
                        room.livekit.isActive = false;
                        room.status = 'ended';
                        await room.save();
                    }

                    // Remove from active rooms
                    this.activeRooms.delete(roomId);
                } catch (error) {
                    console.error(`Error cleaning up room ${roomId}:`, error);
                }
            }
        }
    }

    /**
     * Delete rooms that have been inactive for more than specified hours
     * @param {number} hoursInactive - Hours of inactivity before deletion (default 24)
     * @returns {number} - Number of rooms deleted
     */
    async deleteOldInactiveRooms(hoursInactive = 24) {
        try {
            const threshold = new Date();
            threshold.setHours(threshold.getHours() - hoursInactive);

            // Find rooms where lastActivity is older than threshold
            const oldRooms = await StudyRoom.find({
                'stats.lastActivity': { $lt: threshold },
                status: { $ne: 'archived' } // Don't delete already archived rooms
            });

            let deletedCount = 0;

            for (const room of oldRooms) {
                try {
                    console.log(`🗑️  Deleting old room: ${room.name} (last activity: ${room.stats.lastActivity})`);

                    // Delete LiveKit room if it exists
                    if (livekitService.isConfigured() && room.livekit?.roomName) {
                        await livekitService.deleteRoom(room.livekit.roomName);
                    }

                    // Remove from active rooms cache
                    this.activeRooms.delete(room._id.toString());

                    // Delete from database
                    await StudyRoom.findByIdAndDelete(room._id);
                    deletedCount++;

                } catch (error) {
                    console.error(`Error deleting room ${room._id}:`, error);
                }
            }

            return deletedCount;
        } catch (error) {
            console.error('Error in deleteOldInactiveRooms:', error);
            return 0;
        }
    }

    /**
     * Get statistics about active rooms
     */
    getStats() {
        return {
            totalActiveRooms: this.activeRooms.size,
            totalParticipants: Array.from(this.activeRooms.values())
                .reduce((sum, room) => sum + room.participants.size, 0),
            rooms: Array.from(this.activeRooms.entries()).map(([roomId, room]) => ({
                roomId,
                participantCount: room.participants.size,
                lastActivity: room.lastActivity
            }))
        };
    }
}

// Singleton instance
const roomManager = new RoomManager();

module.exports = roomManager;

/**
 * LiveKit Service
 * Handles LiveKit room creation, token generation, and participant management
 */

const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const { LIVEKIT_CONFIG } = require('../config/livekit');

class LiveKitService {
    constructor() {
        this.apiKey = LIVEKIT_CONFIG.apiKey;
        this.apiSecret = LIVEKIT_CONFIG.apiSecret;
        this.serverUrl = LIVEKIT_CONFIG.url;

        // Initialize Room Service Client
        if (this.apiKey && this.apiSecret) {
            this.roomService = new RoomServiceClient(
                this.serverUrl,
                this.apiKey,
                this.apiSecret
            );
        }
    }

    /**
     * Generate access token for a user to join a LiveKit room
     * Token includes: room, roomJoin: true, identity (sub), and ttl >= 1 hour
     */
    async generateToken(roomName, participantIdentity, participantName, options = {}) {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('LiveKit credentials not configured');
        }

        // Ensure TTL is at least 1 hour (3600 seconds)
        const ttl = Math.max(options.ttl || LIVEKIT_CONFIG.tokenTTL, 3600);

        const at = new AccessToken(this.apiKey, this.apiSecret, {
            identity: participantIdentity,
            name: participantName,
            ttl: ttl,
        });

        // Grant permissions - this creates the video grant with room and roomJoin
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: options.canPublish !== false,
            canSubscribe: options.canSubscribe !== false,
            canPublishData: options.canPublishData !== false,
        });

        // toJwt() returns a Promise in newer SDK versions
        const token = await at.toJwt();
        return token;
    }

    /**
     * Create a LiveKit room
     */
    async createRoom(roomName, options = {}) {
        try {
            if (!this.roomService) {
                throw new Error('LiveKit not initialized');
            }

            const room = await this.roomService.createRoom({
                name: roomName,
                emptyTimeout: options.emptyTimeout || LIVEKIT_CONFIG.roomDefaults.emptyTimeout,
                maxParticipants: options.maxParticipants || LIVEKIT_CONFIG.roomDefaults.maxParticipants,
                metadata: JSON.stringify(options.metadata || {}),
            });

            console.log(`✅ LiveKit room created: ${roomName}`);
            return room;
        } catch (error) {
            // Room might already exist
            if (error.message?.includes('already exists')) {
                console.log(`ℹ️  LiveKit room already exists: ${roomName}`);
                return await this.getRoom(roomName);
            }
            console.error('Error creating LiveKit room:', error);
            throw error;
        }
    }

    /**
     * Get room details
     */
    async getRoom(roomName) {
        try {
            if (!this.roomService) {
                return null;
            }

            const rooms = await this.roomService.listRooms([roomName]);
            return rooms.length > 0 ? rooms[0] : null;
        } catch (error) {
            console.error('Error getting room:', error);
            return null;
        }
    }

    /**
     * List all participants in a room
     */
    async listParticipants(roomName) {
        try {
            if (!this.roomService) {
                return [];
            }

            const participants = await this.roomService.listParticipants(roomName);
            return participants;
        } catch (error) {
            console.error('Error listing participants:', error);
            return [];
        }
    }

    /**
     * Delete/close a LiveKit room
     */
    async deleteRoom(roomName) {
        try {
            if (!this.roomService) {
                return false;
            }

            await this.roomService.deleteRoom(roomName);
            console.log(`🗑️  LiveKit room deleted: ${roomName}`);
            return true;
        } catch (error) {
            console.error('Error deleting room:', error);
            return false;
        }
    }

    /**
     * Remove a participant from a room
     */
    async removeParticipant(roomName, participantIdentity) {
        try {
            if (!this.roomService) {
                return false;
            }

            await this.roomService.removeParticipant(roomName, participantIdentity);
            console.log(`👤 Participant removed: ${participantIdentity} from ${roomName}`);
            return true;
        } catch (error) {
            console.error('Error removing participant:', error);
            return false;
        }
    }

    /**
     * Update room metadata
     */
    async updateRoomMetadata(roomName, metadata) {
        try {
            if (!this.roomService) {
                return false;
            }

            await this.roomService.updateRoomMetadata(roomName, JSON.stringify(metadata));
            return true;
        } catch (error) {
            console.error('Error updating room metadata:', error);
            return false;
        }
    }

    /**
     * List all active rooms
     */
    async listRooms() {
        try {
            if (!this.roomService) {
                return [];
            }

            const rooms = await this.roomService.listRooms();
            return rooms;
        } catch (error) {
            console.error('Error listing rooms:', error);
            return [];
        }
    }

    /**
     * Check if LiveKit is properly configured
     */
    isConfigured() {
        return !!(this.apiKey && this.apiSecret && this.roomService);
    }
}

// Singleton instance
const livekitService = new LiveKitService();

module.exports = livekitService;

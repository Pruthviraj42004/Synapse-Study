/**
 * Daily.co Video Service
 * 
 * Handles creation of Daily.co video rooms and meeting tokens
 * Requires Daily.co API key in environment
 */

const axios = require('axios');

const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || '';
const DAILY_API_URL = 'https://api.daily.co/v1';

// Room expiration time (24 hours)
const ROOM_EXPIRATION = 24 * 60 * 60; // seconds

/**
 * Create a Daily.co room for a study session
 * @param {string} roomId - Study room identifier
 * @param {object} options - Room configuration options
 * @returns {Promise<object>} - Room data including URL and token
 */
async function createDailyRoom(roomId, options = {}) {
    if (!DAILY_API_KEY) {
        console.warn('⚠️  DAILY_API_KEY not set - using mock data');
        return createMockRoom(roomId);
    }

    try {
        const roomName = `study-sphere-${roomId}`;
        const expiryTime = Math.floor(Date.now() / 1000) + ROOM_EXPIRATION;

        const response = await axios.post(
            `${DAILY_API_URL}/rooms`,
            {
                name: roomName,
                properties: {
                    enable_chat: true,
                    enable_screenshare: true,
                    // enable_recording removed - not supported on free plan
                    enable_knocking: false,
                    start_video_off: options.startVideoOff !== false,
                    start_audio_off: options.startAudioOff !== false,
                    max_participants: options.maxParticipants || 20,
                    exp: expiryTime,
                    eject_at_room_exp: true,
                    ...options.properties
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${DAILY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`✅ Created Daily.co room: ${roomName}`);

        return {
            roomUrl: response.data.url,
            roomName: response.data.name,
            expiresAt: new Date(expiryTime * 1000),
            provider: 'daily',
            config: response.data
        };

    } catch (error) {
        // Room might already exist - check error message
        const errorInfo = error.response?.data?.info || '';
        if (errorInfo.includes('already exists')) {
            console.log(`📌 Daily.co room already exists: study-sphere-${roomId}`);
            return getDailyRoom(roomId);
        }

        console.error('❌ Failed to create Daily.co room:', error.response?.data || error.message);
        throw new Error('Failed to create video room');
    }
}

/**
 * Get existing Daily.co room data
 * @param {string} roomId - Study room identifier
 * @returns {Promise<object>} - Room data
 */
async function getDailyRoom(roomId) {
    if (!DAILY_API_KEY) {
        return createMockRoom(roomId);
    }

    try {
        const roomName = `study-sphere-${roomId}`;

        const response = await axios.get(
            `${DAILY_API_URL}/rooms/${roomName}`,
            {
                headers: {
                    'Authorization': `Bearer ${DAILY_API_KEY}`
                }
            }
        );

        return {
            roomUrl: response.data.url,
            roomName: response.data.name,
            expiresAt: new Date(response.data.config.exp * 1000),
            provider: 'daily',
            config: response.data
        };

    } catch (error) {
        console.error('Failed to get Daily.co room:', error.response?.data || error.message);
        throw new Error('Video room not found');
    }
}

/**
 * Create a meeting token for a specific user
 * @param {string} roomId - Study room identifier
 * @param {object} userData - User data (userId, userName, role)
 * @returns {Promise<string>} - Meeting token
 */
async function createMeetingToken(roomId, userData) {
    if (!DAILY_API_KEY) {
        console.warn('⚠️  DAILY_API_KEY not set - skipping token creation');
        return null;
    }

    try {
        const roomName = `study-sphere-${roomId}`;
        const expiryTime = Math.floor(Date.now() / 1000) + ROOM_EXPIRATION;

        const response = await axios.post(
            `${DAILY_API_URL}/meeting-tokens`,
            {
                properties: {
                    room_name: roomName,
                    user_name: userData.userName,
                    user_id: userData.userId,
                    is_owner: userData.role === 'moderator' || userData.role === 'tutor',
                    enable_screenshare: true,
                    // enable_recording removed - not supported on free plan
                    exp: expiryTime
                    // Note: Custom metadata not supported in meeting tokens
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${DAILY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`🎫 Created meeting token for user: ${userData.userName}`);

        return response.data.token;

    } catch (error) {
        console.error('Failed to create meeting token:', error.response?.data || error.message);
        throw new Error('Failed to create meeting token');
    }
}

/**
 * Delete a Daily.co room
 * @param {string} roomId - Study room identifier
 * @returns {Promise<void>}
 */
async function deleteDailyRoom(roomId) {
    if (!DAILY_API_KEY) {
        console.warn('⚠️  DAILY_API_KEY not set - skipping room deletion');
        return;
    }

    try {
        const roomName = `study-sphere-${roomId}`;

        await axios.delete(
            `${DAILY_API_URL}/rooms/${roomName}`,
            {
                headers: {
                    'Authorization': `Bearer ${DAILY_API_KEY}`
                }
            }
        );

        console.log(`🗑️  Deleted Daily.co room: ${roomName}`);

    } catch (error) {
        console.error('Failed to delete Daily.co room:', error.response?.data || error.message);
        // Don't throw - deletion is non-critical
    }
}

/**
 * Create mock room data for development without Daily.co API key
 * @param {string} roomId - Study room identifier
 * @returns {object} - Mock room data
 */
function createMockRoom(roomId) {
    const roomName = `study-sphere-${roomId}`;
    const mockDomain = DAILY_DOMAIN || 'study-sphere.daily.co';

    return {
        roomUrl: `https://${mockDomain}/${roomName}`,
        roomName: roomName,
        expiresAt: new Date(Date.now() + ROOM_EXPIRATION * 1000),
        provider: 'daily',
        isMock: true,
        config: {
            url: `https://${mockDomain}/${roomName}`,
            name: roomName,
            properties: {
                enable_chat: true,
                enable_screenshare: true,
                max_participants: 20
            }
        }
    };
}

module.exports = {
    createDailyRoom,
    getDailyRoom,
    createMeetingToken,
    deleteDailyRoom
};

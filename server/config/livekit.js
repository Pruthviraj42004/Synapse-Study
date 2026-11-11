/**
 * LiveKit Configuration
 * Handles LiveKit server connection and settings
 */

require('dotenv').config();

const LIVEKIT_CONFIG = {
    // LiveKit server URL (Cloud or self-hosted)
    url: process.env.LIVEKIT_URL || 'wss://your-livekit-server.livekit.cloud',

    // API credentials
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || '',

    // Room settings
    roomDefaults: {
        emptyTimeout: 300, // 5 minutes - close room after being empty
        maxParticipants: 50,
        audioCodec: 'opus',
        videoCodec: 'vp8',
    },

    // Token settings
    tokenTTL: 3600, // 1 hour

    // Cleanup settings
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    inactivityThreshold: 30 * 60 * 1000, // 30 minutes
};

// Validation
const validateConfig = () => {
    if (!LIVEKIT_CONFIG.apiKey || !LIVEKIT_CONFIG.apiSecret) {
        console.warn('⚠️  LiveKit credentials not set. Please configure LIVEKIT_API_KEY and LIVEKIT_API_SECRET');
        return false;
    }
    return true;
};

module.exports = {
    LIVEKIT_CONFIG,
    validateConfig,
};

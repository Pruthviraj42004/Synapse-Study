/**
 * Feature Flags Configuration
 * 
 * Controls rollout of new collaborative features
 */

export const FEATURES = {
    // Use CodeMirror 6 instead of Monaco
    USE_CODEMIRROR: process.env.REACT_APP_USE_CODEMIRROR === 'true' || false,

    // Use Daily.co instead of Jitsi
    USE_DAILY_VIDEO: process.env.REACT_APP_USE_DAILY_VIDEO === 'true' || false,

    // Enable unified presence system
    USE_UNIFIED_PRESENCE: process.env.REACT_APP_USE_UNIFIED_PRESENCE === 'true' || false,

    // Y-WebSocket server URL
    YJS_SERVER_URL: process.env.REACT_APP_YJS_SERVER_URL || 'ws://localhost:1234',

    // Debug mode
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true' || false
};

/**
 * Get feature flag value
 */
export const isFeatureEnabled = (featureName) => {
    return FEATURES[featureName] || false;
};

/**
 * Log feature flags (for debugging)
 */
export const logFeatureFlags = () => {
    if (FEATURES.DEBUG_MODE) {
        console.log('📋 Feature Flags:', FEATURES);
    }
};

export default FEATURES;

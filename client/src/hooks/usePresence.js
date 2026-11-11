/**
 * usePresence Hook
 * 
 * Manages unified presence across Y.js awareness and Daily.co video
 * Y.js awareness is the canonical source of truth
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Presence user schema
 * @typedef {Object} PresenceUser
 * @property {string} userId - Internal user ID
 * @property {string} userName - Display name
 * @property {string} userColor - User color for cursors/badges
 * @property {string} role - User role (student/tutor/moderator)
 * @property {number} cursorPosition - Editor cursor position
 * @property {Object} selection - Editor selection range
 * @property {string} videoId - Daily participant session ID
 * @property {boolean} audioEnabled - Microphone status
 * @property {boolean} videoEnabled - Camera status
 * @property {number} lastActive - Last activity timestamp
 * @property {boolean} isTyping - Typing indicator
 * @property {string} currentTool - Active tool (editor/whiteboard/chat)
 */

export const usePresence = (provider, userId, userName, role = 'student') => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [localPresence, setLocalPresence] = useState({
        userId,
        userName,
        role,
        audioEnabled: false,
        videoEnabled: false,
        isTyping: false,
        currentTool: null,
        lastActive: Date.now()
    });

    /**
     * Initialize awareness if provider exists
     */
    useEffect(() => {
        if (!provider?.awareness) return;

        const awareness = provider.awareness;

        // Set initial local state
        awareness.setLocalStateField('user', {
            userId,
            userName,
            role,
            audioEnabled: false,
            videoEnabled: false,
            isTyping: false,
            currentTool: null,
            lastActive: Date.now()
        });

        // Listen for awareness changes
        const handleAwarenessChange = ({ added, updated, removed }) => {
            const states = Array.from(awareness.getStates().entries());

            const users = states
                .filter(([clientId]) => clientId !== awareness.clientID)
                .map(([clientId, state]) => ({
                    clientId,
                    ...(state.user || {})
                }))
                .filter(user => user.userId); // Only include valid users

            setActiveUsers(users);
        };

        awareness.on('change', handleAwarenessChange);

        // Cleanup
        return () => {
            awareness.off('change', handleAwarenessChange);
        };
    }, [provider, userId, userName, role]);

    /**
     * Update local presence
     */
    const updatePresence = useCallback((updates) => {
        if (!provider?.awareness) return;

        const newPresence = {
            ...localPresence,
            ...updates,
            lastActive: Date.now()
        };

        setLocalPresence(newPresence);
        provider.awareness.setLocalStateField('user', newPresence);
    }, [provider, localPresence]);

    /**
     * Update video status (from Daily.co events)
     */
    const updateVideoStatus = useCallback((videoId, audioEnabled, videoEnabled) => {
        updatePresence({
            videoId,
            audioEnabled,
            videoEnabled
        });
    }, [updatePresence]);

    /**
     * Update cursor position (from editor)
     */
    const updateCursor = useCallback((cursorPosition, selection) => {
        updatePresence({
            cursorPosition,
            selection
        });
    }, [updatePresence]);

    /**
     * Update typing status (from chat/editor)
     */
    const updateTyping = useCallback((isTyping) => {
        updatePresence({ isTyping });
    }, [updatePresence]);

    /**
     * Update current tool (editor/whiteboard/chat)
     */
    const updateCurrentTool = useCallback((currentTool) => {
        updatePresence({ currentTool });
    }, [updatePresence]);

    /**
     * Leave presence (cleanup)
     */
    const leave = useCallback(() => {
        if (provider?.awareness) {
            provider.awareness.setLocalState(null);
        }
    }, [provider]);

    return {
        activeUsers,
        localPresence,
        updatePresence,
        updateVideoStatus,
        updateCursor,
        updateTyping,
        updateCurrentTool,
        leave
    };
};

export default usePresence;

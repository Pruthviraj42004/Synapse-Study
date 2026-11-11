/**
 * useRoomState Hook
 * Manages unified room state and synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';
import { API_BASE_URL } from '../config/constants';

// API_BASE_URL already includes /api from env variable (http://localhost:5000/api)
const API_URL = API_BASE_URL;

const useRoomState = (roomId) => {
    const [room, setRoom] = useState(null);
    const [state, setState] = useState({
        chat: { messages: [], messageCount: 0 },
        code: { content: '', language: 'javascript', yDocVersion: 0 },
        whiteboard: { elements: [], yDocVersion: 0 },
    });
    const [livekitToken, setLivekitToken] = useState(null);
    const [livekitUrl, setLivekitUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Join room and get initial state
    const joinRoom = useCallback(async () => {
        if (!roomId) return;

        try {
            setLoading(true);
            setError(null);

            const headers = getAuthHeaders();
            const url = `${API_URL}/study-rooms/${roomId}/join`;
            console.log('[useRoomState] Joining room with URL:', url);
            console.log('[useRoomState] Headers:', headers);
            console.log('[useRoomState] Token exists:', !!localStorage.getItem('token'));

            // Call study room join endpoint
            const response = await axios.post(url, {}, { headers });

            // Study room API returns the room object directly
            const roomData = response.data;
            if (roomData && roomData._id) {
                setRoom(roomData);
                // Initialize state from room data if available
                if (roomData.state) {
                    setState(roomData.state);
                }
                // LiveKit data from the response
                if (roomData.livekitToken) {
                    setLivekitToken(roomData.livekitToken);
                    setLivekitUrl(roomData.livekitUrl);
                    console.log('🎤 LiveKit token received');
                }

                console.log('✅ Joined room:', roomData.name);
            }
        } catch (err) {
            console.error('Error joining room:', err);
            setError(err.response?.data?.message || 'Failed to join room');
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        if (!roomId) return;

        try {
            await axios.post(`${API_URL}/study-rooms/${roomId}/leave`, {}, {
                headers: getAuthHeaders()
            });
            console.log('👋 Left room');
        } catch (err) {
            console.error('Error leaving room:', err);
        }
    }, [roomId]);

    // Listen for state updates via WebSocket
    useEffect(() => {
        if (!roomId) return;

        const socket = socketService.getSocket();
        if (!socket) return;

        // Listen for state sync events
        const handleStateSync = (data) => {
            console.log('🔄 State sync received:', data);
            if (data.stateType && data.stateData) {
                setStatePart(data.stateType, data.stateData);
            }
        };

        socket.on('room:state_sync', handleStateSync);

        return () => {
            socket.off('room:state_sync', handleStateSync);
        };
    }, [roomId]);

    // Join room on mount
    useEffect(() => {
        joinRoom();

        return () => {
            leaveRoom();
        };
    }, [roomId, joinRoom, leaveRoom]);

    // Helper to update specific state part
    const setStatePart = useCallback((stateType, stateData) => {
        setState((prevState) => ({
            ...prevState,
            [stateType]: { ...prevState[stateType], ...stateData },
        }));
    }, []);

    return {
        room,
        state,
        livekitToken,
        livekitUrl,
        loading,
        error,
        joinRoom,
        leaveRoom,
        setStatePart,
    };
};

export default useRoomState;

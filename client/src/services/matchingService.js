import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Matching Service
 * API client for peer matching endpoints
 */

/**
 * Save or update student matching preferences
 */
export const savePreferences = async (preferences) => {
    const response = await axios.post(
        `${API_URL}/matching/preferences`,
        preferences,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get user's matching preferences
 */
export const getPreferences = async () => {
    const response = await axios.get(
        `${API_URL}/matching/preferences`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Find AI-matched study peers
 */
export const findPeers = async (limit = 5) => {
    const response = await axios.post(
        `${API_URL}/matching/find-peers`,
        { limit },
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Accept a match recommendation
 */
export const acceptMatch = async (matchId) => {
    const response = await axios.post(
        `${API_URL}/matching/accept/${matchId}`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Reject a match recommendation
 */
export const rejectMatch = async (matchId) => {
    const response = await axios.post(
        `${API_URL}/matching/reject/${matchId}`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get match history
 */
export const getMatchHistory = async () => {
    const response = await axios.get(
        `${API_URL}/matching/history`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

const matchingService = {
    savePreferences,
    getPreferences,
    findPeers,
    acceptMatch,
    rejectMatch,
    getMatchHistory
};

export default matchingService;

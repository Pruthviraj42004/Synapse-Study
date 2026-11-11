import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Analysis Service
 * API client for document analysis endpoints
 */

/**
 * Trigger AI analysis of a document
 */
export const analyzeDocument = async (resourceId) => {
    const response = await axios.post(
        `${API_URL}/resources/${resourceId}/analyze`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get analysis insights for a document
 */
export const getInsights = async (resourceId) => {
    const response = await axios.get(
        `${API_URL}/resources/${resourceId}/insights`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Regenerate analysis or specific sections
 */
export const regenerateAnalysis = async (resourceId, section = 'all') => {
    const response = await axios.post(
        `${API_URL}/resources/${resourceId}/analyze`,
        { section },
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Check analysis status
 */
export const getAnalysisStatus = async (resourceId) => {
    const response = await axios.get(
        `${API_URL}/resources/${resourceId}/insights`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export default {
    analyzeDocument,
    getInsights,
    regenerateAnalysis,
    getAnalysisStatus
};

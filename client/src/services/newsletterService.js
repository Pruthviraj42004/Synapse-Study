import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Newsletter Service
 * Handles all newsletter/announcement related API calls
 */
const newsletterService = {
    // Get all newsletters with filters and pagination
    getAllNewsletters: async (params = {}) => {
        try {
            const {
                category,
                type,
                status,
                search,
                page = 1,
                limit = 10,
                sort = '-publishedAt'
            } = params;

            const queryParams = new URLSearchParams();
            if (category) queryParams.append('category', category);
            if (type) queryParams.append('type', type);
            if (status) queryParams.append('status', status);
            if (search) queryParams.append('search', search);
            queryParams.append('page', page);
            queryParams.append('limit', limit);
            queryParams.append('sort', sort);

            const response = await axios.get(
                `${API_URL}/newsletters?${queryParams.toString()}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching newsletters:', error);
            throw error.response?.data || error;
        }
    },

    // Get single newsletter by ID
    getNewsletterById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/newsletters/${id}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching newsletter:', error);
            throw error.response?.data || error;
        }
    },

    // Get recent announcements (for dashboard widget)
    getRecentAnnouncements: async (limit = 5) => {
        try {
            const response = await axios.get(
                `${API_URL}/newsletters/recent?limit=${limit}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching recent announcements:', error);
            throw error.response?.data || error;
        }
    },

    // Get pinned newsletters
    getPinnedNewsletters: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/newsletters/pinned`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching pinned newsletters:', error);
            throw error.response?.data || error;
        }
    },

    // Create newsletter (admin only)
    createNewsletter: async (newsletterData) => {
        try {
            const response = await axios.post(
                `${API_URL}/newsletters`,
                newsletterData,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating newsletter:', error);
            throw error.response?.data || error;
        }
    },

    // Update newsletter (admin only)
    updateNewsletter: async (id, newsletterData) => {
        try {
            const response = await axios.put(
                `${API_URL}/newsletters/${id}`,
                newsletterData,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating newsletter:', error);
            throw error.response?.data || error;
        }
    },

    // Delete newsletter (admin only)
    deleteNewsletter: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/newsletters/${id}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting newsletter:', error);
            throw error.response?.data || error;
        }
    }
};

export default newsletterService;

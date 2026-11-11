import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Resource Service  
 * Handles all study resource related API calls
 */
const resourceService = {
    // Get all resources with filters and pagination
    getAllResources: async (params = {}) => {
        try {
            const {
                subject,
                semester,
                department,
                type,
                tags,
                search,
                page = 1,
                limit = 12,
                sort = '-createdAt'
            } = params;

            const queryParams = new URLSearchParams();
            if (subject) queryParams.append('subject', subject);
            if (semester) queryParams.append('semester', semester);
            if (department) queryParams.append('department', department);
            if (type) queryParams.append('type', type);
            if (tags) queryParams.append('tags', tags);
            if (search) queryParams.append('search', search);
            queryParams.append('page', page);
            queryParams.append('limit', limit);
            queryParams.append('sort', sort);

            const response = await axios.get(
                `${API_URL}/resources?${queryParams.toString()}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching resources:', error);
            throw error.response?.data || error;
        }
    },

    // Get single resource by ID
    getResourceById: async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}/resources/${id}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching resource:', error);
            throw error.response?.data || error;
        }
    },

    // Get popular resources
    getPopularResources: async (limit = 10) => {
        try {
            const response = await axios.get(
                `${API_URL}/resources/popular?limit=${limit}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching popular resources:', error);
            throw error.response?.data || error;
        }
    },

    // Get recent resources
    getRecentResources: async (limit = 10) => {
        try {
            const response = await axios.get(
                `${API_URL}/resources/recent?limit=${limit}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching recent resources:', error);
            throw error.response?.data || error;
        }
    },

    // Get user's uploaded resources
    getMyResources: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/resources/my-uploads`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching user resources:', error);
            throw error.response?.data || error;
        }
    },

    // Upload new resource
    uploadResource: async (resourceData) => {
        try {
            const response = await axios.post(
                `${API_URL}/resources`,
                resourceData,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading resource:', error);
            throw error.response?.data || error;
        }
    },

    // Delete resource
    deleteResource: async (id) => {
        try {
            const response = await axios.delete(
                `${API_URL}/resources/${id}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting resource:', error);
            throw error.response?.data || error;
        }
    },

    // Track download
    trackDownload: async (id) => {
        try {
            const response = await axios.post(
                `${API_URL}/resources/${id}/download`,
                {},
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error tracking download:', error);
            throw error.response?.data || error;
        }
    },

    // Upload file to server
    uploadFile: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_URL}/upload`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data.file;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
};

export default resourceService;

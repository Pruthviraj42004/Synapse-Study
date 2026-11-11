import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Programming API service
const programmingService = {
  // Execute code
  executeCode: async (code, language) => {
    try {
      const response = await api.post('/programming/execute', { code, language });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to execute code' };
    }
  },

  // Code Sessions
  getSessions: async () => {
    try {
      const response = await api.get('/programming/sessions');
      return response.data.sessions;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch sessions' };
    }
  },

  getSessionById: async (sessionId) => {
    try {
      const response = await api.get(`/programming/sessions/${sessionId}`);
      return response.data.session;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch session' };
    }
  },

  createSession: async (sessionData) => {
    try {
      const response = await api.post('/programming/sessions', sessionData);
      return response.data.session;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create session' };
    }
  },

  updateSession: async (sessionId, data) => {
    try {
      const response = await api.put(`/programming/sessions/${sessionId}`, data);
      return response.data.session;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update session' };
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/programming/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete session' };
    }
  },

  // Challenges
  getChallenges: async (filters = {}) => {
    try {
      const { difficulty, category, search } = filters;
      const queryParams = new URLSearchParams();

      if (difficulty) queryParams.append('difficulty', difficulty);
      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const queryString = queryParams.toString();
      const url = `/programming/challenges${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data.challenges;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch challenges' };
    }
  },

  getChallengeById: async (challengeId) => {
    try {
      const response = await api.get(`/programming/challenges/${challengeId}`);
      return response.data.challenge;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch challenge' };
    }
  },

  createChallenge: async (challengeData) => {
    try {
      const response = await api.post('/programming/challenges', challengeData);
      return response.data.challenge;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create challenge' };
    }
  },

  updateChallenge: async (challengeId, data) => {
    try {
      const response = await api.put(`/programming/challenges/${challengeId}`, data);
      return response.data.challenge;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update challenge' };
    }
  },

  deleteChallenge: async (challengeId) => {
    try {
      const response = await api.delete(`/programming/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete challenge' };
    }
  },

  // Tutorials
  getTutorials: async (filters = {}) => {
    try {
      const { difficulty, category, search } = filters;
      const queryParams = new URLSearchParams();

      if (difficulty) queryParams.append('difficulty', difficulty);
      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const queryString = queryParams.toString();
      const url = `/programming/tutorials${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data.tutorials;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tutorials' };
    }
  },

  getTutorialBySlug: async (slug) => {
    try {
      const response = await api.get(`/programming/tutorials/${slug}`);
      return response.data.tutorial;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tutorial' };
    }
  }
};

export default programmingService;
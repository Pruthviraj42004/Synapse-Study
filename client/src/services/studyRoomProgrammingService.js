import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const studyRoomProgrammingAPI = axios.create({
  baseURL: `${API_URL}/study-rooms`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
studyRoomProgrammingAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get the current programming session for a study room
export const getProgrammingSession = async (roomId) => {
  try {
    const response = await studyRoomProgrammingAPI.get(`/${roomId}/programming`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update code in the programming session
export const updateCode = async (roomId, code, language) => {
  try {
    const response = await studyRoomProgrammingAPI.put(`/${roomId}/programming`, {
      code, language
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Execute code in the programming session
export const executeCode = async (roomId, code, language) => {
  try {
    const response = await studyRoomProgrammingAPI.post(`/${roomId}/programming/execute`, {
      code, language
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const studyRoomProgrammingService = {
  getProgrammingSession,
  updateCode,
  executeCode
};

export default studyRoomProgrammingService;
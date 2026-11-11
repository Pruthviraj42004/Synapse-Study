import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const studyRoomAPI = axios.create({
  baseURL: `${API_URL}/study-rooms`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
studyRoomAPI.interceptors.request.use(
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

// Get all public study rooms
export const getStudyRooms = async (params = {}) => {
  try {
    const response = await studyRoomAPI.get('/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's study rooms (created + joined)
export const getUserStudyRooms = async () => {
  try {
    const response = await studyRoomAPI.get('/my-rooms');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new study room
export const createStudyRoom = async (roomData) => {
  try {
    const response = await studyRoomAPI.post('/', roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get a specific study room
export const getStudyRoom = async (roomId) => {
  try {
    const response = await studyRoomAPI.get(`/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Join a study room
export const joinStudyRoom = async (roomId) => {
  try {
    const response = await studyRoomAPI.post(`/${roomId}/join`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Leave a study room
export const leaveStudyRoom = async (roomId) => {
  try {
    const response = await studyRoomAPI.post(`/${roomId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update a study room
export const updateStudyRoom = async (roomId, roomData) => {
  try {
    const response = await studyRoomAPI.put(`/${roomId}`, roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a study room
export const deleteStudyRoom = async (roomId) => {
  try {
    const response = await studyRoomAPI.delete(`/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const studyRoomService = {
  getStudyRooms,
  getUserStudyRooms,
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  updateStudyRoom,
  deleteStudyRoom,
};

export default studyRoomService;
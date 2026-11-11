import axios from 'axios';
import { getToken } from '../../utils/auth';

// Root API (without chat suffix) so we can safely compose paths
const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CHAT_PREFIX = '/chat';

// Axios instance with auth interceptor
const api = axios.create({
  baseURL: API_ROOT,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class ChatService {
  // Chat
  async sendMessage(message, sessionId, context = {}) {
    const response = await api.post(`${CHAT_PREFIX}/chat`, {
      message,
      sessionId,
      context
    });
    return response.data;
  }

  async getChatSessions(page = 1, limit = 20) {
    const response = await api.get(`${CHAT_PREFIX}/sessions`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getSessionMessages(sessionId, limit = 50) {
    const response = await api.get(`${CHAT_PREFIX}/sessions/${sessionId}/messages`, {
      params: { limit }
    });
    return response.data;
  }

  async createSession(title) {
    const response = await api.post(`${CHAT_PREFIX}/sessions`, { title });
    return response.data;
  }

  async updateSession(sessionId, updates) {
    const response = await api.put(`${CHAT_PREFIX}/sessions/${sessionId}`, updates);
    return response.data;
  }

  async deleteSession(sessionId) {
    const response = await api.delete(`${CHAT_PREFIX}/sessions/${sessionId}`);
    return response.data;
  }

  async provideFeedback(messageId, feedback) {
    const response = await api.post(`${CHAT_PREFIX}/messages/${messageId}/feedback`, feedback);
    return response.data;
  }

  // Code Analysis
  async analyzeCode(code, language, question) {
    const response = await api.post(`${CHAT_PREFIX}/analyze-code`, {
      code,
      language,
      question
    });
    return response.data;
  }

  // Quiz
  async generateQuiz(topic, difficulty = 'medium', numberOfQuestions = 5) {
    const response = await api.post(`${CHAT_PREFIX}/generate-quiz`, {
      topic,
      difficulty,
      numberOfQuestions
    });
    return response.data;
  }

  async getQuizzes(filters = {}) {
    const response = await api.get(`${CHAT_PREFIX}/quizzes`, { params: filters });
    return response.data;
  }

  async getQuizById(quizId) {
    const response = await api.get(`${CHAT_PREFIX}/quizzes/${quizId}`);
    return response.data;
  }

  async submitQuizAttempt(quizId, answers, timeTaken) {
    const response = await api.post(`${CHAT_PREFIX}/quizzes/${quizId}/attempt`, {
      answers,
      timeTaken
    });
    return response.data;
  }

  async getQuizResults(quizId) {
    const response = await api.get(`${CHAT_PREFIX}/quizzes/${quizId}/results`);
    return response.data;
  }

  async deleteQuiz(quizId) {
    const response = await api.delete(`${CHAT_PREFIX}/quizzes/${quizId}`);
    return response.data;
  }

  // Roadmap
  async generateRoadmap(topic, level = 'beginner', duration = '3 months') {
    const response = await api.post(`${CHAT_PREFIX}/generate-roadmap`, {
      topic,
      level,
      duration
    });
    return response.data;
  }

  async getRoadmaps(filters = {}) {
    const response = await api.get(`${CHAT_PREFIX}/roadmaps`, { params: filters });
    return response.data;
  }

  async getRoadmapById(roadmapId) {
    const response = await api.get(`${CHAT_PREFIX}/roadmaps/${roadmapId}`);
    return response.data;
  }

  async updateRoadmap(roadmapId, updates) {
    const response = await api.put(`${CHAT_PREFIX}/roadmaps/${roadmapId}`, updates);
    return response.data;
  }

  async updateRoadmapProgress(roadmapId, progressData) {
    const response = await api.put(`${CHAT_PREFIX}/roadmaps/${roadmapId}/progress`, progressData);
    return response.data;
  }

  async forkRoadmap(roadmapId) {
    const response = await api.post(`${CHAT_PREFIX}/roadmaps/${roadmapId}/fork`);
    return response.data;
  }

  async deleteRoadmap(roadmapId) {
    const response = await api.delete(`${CHAT_PREFIX}/roadmaps/${roadmapId}`);
    return response.data;
  }

  // Q&A
  async askQuestion(question, context) {
    const response = await api.post(`${CHAT_PREFIX}/ask`, { question, context });
    return response.data;
  }

  // Summarization
  async summarizeText(text, maxLength = 150) {
    const response = await api.post(`${CHAT_PREFIX}/summarize`, { text, maxLength });
    return response.data;
  }
}

const chatService = new ChatService();
export default chatService;

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const chatController = require('../../controllers/chat/chatController');

// Chat endpoints
router.post('/chat', auth, chatController.sendMessage);
router.get('/sessions', auth, chatController.getChatSessions);
router.get('/sessions/:sessionId/messages', auth, chatController.getSessionMessages);
router.post('/sessions', auth, chatController.createSession);
router.put('/sessions/:sessionId', auth, chatController.updateSession);
router.delete('/sessions/:sessionId', auth, chatController.deleteSession);
router.post('/messages/:messageId/feedback', auth, chatController.provideFeedback);

// Code analysis
router.post('/analyze-code', auth, chatController.analyzeCode);

// Quiz generation and management
router.post('/generate-quiz', auth, chatController.generateQuiz);
router.get('/quizzes', auth, chatController.getQuizzes);
router.get('/quizzes/:quizId', auth, chatController.getQuizById);
router.post('/quizzes/:quizId/attempt', auth, chatController.submitQuizAttempt);
router.get('/quizzes/:quizId/results', auth, chatController.getQuizResults);
router.delete('/quizzes/:quizId', auth, chatController.deleteQuiz);

// Roadmap generation and management
router.post('/generate-roadmap', auth, chatController.generateRoadmap);
router.get('/roadmaps', auth, chatController.getRoadmaps);
router.get('/roadmaps/:roadmapId', auth, chatController.getRoadmapById);
router.put('/roadmaps/:roadmapId', auth, chatController.updateRoadmap);
router.put('/roadmaps/:roadmapId/progress', auth, chatController.updateRoadmapProgress);
router.post('/roadmaps/:roadmapId/fork', auth, chatController.forkRoadmap);
router.delete('/roadmaps/:roadmapId', auth, chatController.deleteRoadmap);

// Q&A
router.post('/ask', auth, chatController.askQuestion);

// Summarization
router.post('/summarize', auth, chatController.summarizeText);

module.exports = router;

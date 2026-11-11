/**
 * RAG Knowledge Routes
 * API routes for the College Knowledge Assistant (RAG)
 * 
 * This is a COMPLETELY SEPARATE feature from the existing chatbot.
 */

const express = require('express');
const router = express.Router();
const ragKnowledgeController = require('../controllers/ragKnowledgeController');

/**
 * POST /api/rag-knowledge/query
 * Process a knowledge query using RAG
 * 
 * Body: { question: string }
 * Response: { success: boolean, answer: string, retrievedCount: number }
 */
router.post('/query', ragKnowledgeController.queryKnowledge);

/**
 * GET /api/rag-knowledge/status
 * Get knowledge base status
 * 
 * Response: { success: boolean, status: { ready: boolean, documentCount: number, ... } }
 */
router.get('/status', ragKnowledgeController.getStatus);

module.exports = router;

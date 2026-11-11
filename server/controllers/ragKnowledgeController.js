/**
 * RAG Knowledge Controller
 * Handles API requests for the College Knowledge Assistant (RAG)
 * 
 * This is a COMPLETELY SEPARATE feature from the existing chatbot.
 */

const ragKnowledgeService = require('../services/ragKnowledgeService');

// Try to import LLM service for response generation
let llmService = null;
try {
    // Try to use the existing LLM service pattern
    const OpenAI = require('openai');

    // Check for API keys
    if (process.env.OPENAI_API_KEY) {
        llmService = {
            client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
            model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
            async getCompletion(messages) {
                const response = await this.client.chat.completions.create({
                    model: this.model,
                    messages,
                    temperature: 0.3, // Lower temperature for factual responses
                    max_tokens: 1024
                });
                return response.choices[0].message.content;
            }
        };
        console.log('[RAGKnowledge] Using OpenAI for LLM responses');
    } else if (process.env.GROQ_API_KEY) {
        llmService = {
            client: new OpenAI({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: 'https://api.groq.com/openai/v1'
            }),
            model: process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
            async getCompletion(messages) {
                const response = await this.client.chat.completions.create({
                    model: this.model,
                    messages,
                    temperature: 0.3,
                    max_tokens: 1024
                });
                return response.choices[0].message.content;
            }
        };
        console.log('[RAGKnowledge] Using Groq for LLM responses');
    } else {
        console.log('[RAGKnowledge] No LLM API key found. Will return raw context.');
    }
} catch (error) {
    console.log('[RAGKnowledge] LLM service not available, using context-only mode:', error.message);
}

/**
 * Process a knowledge query
 * POST /api/rag-knowledge/query
 */
const queryKnowledge = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Question is required and must be a string'
            });
        }

        if (question.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Question must be at least 3 characters long'
            });
        }

        console.log(`[RAGKnowledge] Processing query: "${question}"`);

        const result = await ragKnowledgeService.processQuery(question, llmService);

        res.json({
            success: result.success,
            answer: result.answer,
            retrievedCount: result.retrievedCount || 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[RAGKnowledge] Query error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your question. Please try again.'
        });
    }
};

/**
 * Get knowledge base status
 * GET /api/rag-knowledge/status
 */
const getStatus = async (req, res) => {
    try {
        // Initialize if not already done
        await ragKnowledgeService.initializeKnowledgeStore();

        const status = ragKnowledgeService.getStatus();

        res.json({
            success: true,
            status: {
                ready: status.initialized,
                documentCount: status.documentCount,
                vocabularySize: status.vocabularySize,
                llmAvailable: llmService !== null
            }
        });

    } catch (error) {
        console.error('[RAGKnowledge] Status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get knowledge base status'
        });
    }
};

module.exports = {
    queryKnowledge,
    getStatus
};

/**
 * RAG Knowledge Service (Frontend)
 * Handles API calls to the College Knowledge Assistant (RAG) backend
 * 
 * This is a COMPLETELY SEPARATE feature from the existing chatbot.
 */

import axios from 'axios';

// Get API base URL - note: REACT_APP_API_URL includes /api
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Query the RAG knowledge base
 * @param {string} question - The question to ask
 * @returns {Promise<{success: boolean, answer: string, retrievedCount: number}>}
 */
export const queryKnowledge = async (question) => {
    try {
        const response = await axios.post(
            `${API_URL}/rag-knowledge/query`,
            { question },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout for LLM responses
            }
        );

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.error || 'Failed to get response');
        }
    } catch (error) {
        console.error('[RAGKnowledge] Query error:', error);

        if (error.response) {
            throw new Error(error.response.data?.error || 'Server error');
        } else if (error.request) {
            throw new Error('Unable to reach the server. Please check your connection.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

/**
 * Get the status of the RAG knowledge base
 * @returns {Promise<{success: boolean, status: {ready: boolean, documentCount: number, ...}}>}
 */
export const getStatus = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/rag-knowledge/status`,
            {
                timeout: 10000,
            }
        );

        return response.data;
    } catch (error) {
        console.error('[RAGKnowledge] Status check error:', error);
        return {
            success: false,
            status: {
                ready: false,
                documentCount: 0,
                llmAvailable: false,
            },
        };
    }
};

const Resource = require('../../models/Resource');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const PdfReader = require('pdfreader').PdfReader;
const mammoth = require('mammoth');

/**
 * Document Analysis Service
 * Analyzes study materials using LLM to extract structured academic insights
 */

const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:3001/api/chat';
const LLM_API_KEY = process.env.LLM_API_KEY || 'test-api-key-123';

/**
 * Analyze a resource document
 * @param {String} resourceId - Resource MongoDB ID
 * @returns {Object} - Analysis results
 */
exports.analyzeDocument = async (resourceId) => {
    try {
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            throw new Error('Resource not found');
        }

        // Update status
        if (!resource.aiAnalysis) {
            resource.aiAnalysis = {};
        }
        resource.aiAnalysis.analysisStatus = 'analyzing';
        await resource.save();

        // Extract text from document
        const documentText = await extractText(resource);

        if (!documentText || documentText.trim().length < 100) {
            throw new Error('Could not extract sufficient text from document');
        }

        // Call LLM for analysis
        const analysis = await callLLMForAnalysis(documentText);

        // Save analysis results
        resource.aiAnalysis = {
            ...analysis,
            analyzedAt: new Date(),
            analysisStatus: 'completed',
            error: null
        };
        await resource.save();

        return resource.aiAnalysis;
    } catch (error) {
        console.error('Document analysis error:', error);

        // Update error status
        const resource = await Resource.findById(resourceId);
        if (resource) {
            if (!resource.aiAnalysis) {
                resource.aiAnalysis = {};
            }
            resource.aiAnalysis.analysisStatus = 'failed';
            resource.aiAnalysis.error = error.message;
            await resource.save();
        }

        throw error;
    }
};

/**
 * Extract text from PDF or DOCX file
 */
async function extractText(resource) {
    const filePath = resource.fileUrl.replace('/uploads/', '');
    const fullPath = path.join(__dirname, '../../uploads', filePath);

    const fileType = resource.fileType.toLowerCase();

    if (fileType === 'pdf' || fileType === 'application/pdf') {
        return await extractPdfText(fullPath);
    } else if (fileType === 'docx' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await extractDocxText(fullPath);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }
}

/**
 * Extract text from PDF
 */
function extractPdfText(filePath) {
    return new Promise((resolve, reject) => {
        const textItems = [];

        new PdfReader().parseFileItems(filePath, (err, item) => {
            if (err) {
                reject(err);
            } else if (!item) {
                // End of file
                const text = textItems.join(' ');
                resolve(text);
            } else if (item.text) {
                textItems.push(item.text);
            }
        });
    });
}

/**
 * Extract text from DOCX
 */
async function extractDocxText(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

/**
 * Call LLM API for document analysis
 */
async function callLLMForAnalysis(documentText) {
    // Truncate if too long (keep first 8000 chars for context)
    const textToAnalyze = documentText.length > 8000
        ? documentText.substring(0, 8000) + '...[truncated]'
        : documentText;

    const prompt = `You are Study Sphere's Academic AI Engine.

Your task is to analyze a student's uploaded study material and produce structured academic insights.
You MUST return output ONLY in valid JSON following the exact schema below.
Do NOT include any text outside the JSON.

JSON Schema (fill all fields):
{
  "subject": "",
  "main_topic": "",
  "subtopics": [],
  "prerequisites": [],
  "summary": "",
  "flashcards": [
    {"q": "", "a": ""},
    {"q": "", "a": ""}
  ],
  "expected_questions": [],
  "concept_nodes": [],
  "probable_syllabus_mapping": {
    "unit": "",
    "chapter": "",
    "why": ""
  },
  "difficulty": 0,
  "recommendations": []
}

Rules:
- Summary must be concise (max 10 lines).
- Generate 5–10 high-quality flashcards.
- Generate 5–8 expected exam questions.
- Concept nodes are key ideas useful for linking documents.
- Syllabus mapping must be your best guess based on typical engineering/college syllabi.
- Difficulty is a number from 1–10.
- Recommendations should help a student prepare for exams.
- If input is incomplete, infer logically.

Now analyze the following study material and return the JSON:

${textToAnalyze}`;

    try {
        const response = await axios.post(
            LLM_API_URL,
            {
                messages: [
                    {
                        role: 'system',
                        content: 'You are an academic AI that analyzes study materials. Always respond with valid JSON only, no additional text.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': LLM_API_KEY
                },
                timeout: 60000 // 60 second timeout for large documents
            }
        );

        // Parse LLM response
        let responseText = response.data.response || response.data.message || JSON.stringify(response.data);

        // Clean response to extract JSON
        responseText = responseText.trim();

        // Try to find JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            responseText = jsonMatch[0];
        }

        const analysis = JSON.parse(responseText);

        // Validate required fields
        const requiredFields = ['subject', 'main_topic', 'summary', 'flashcards', 'expected_questions'];
        for (const field of requiredFields) {
            if (!analysis[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Ensure arrays
        analysis.subtopics = analysis.subtopics || [];
        analysis.prerequisites = analysis.prerequisites || [];
        analysis.concept_nodes = analysis.concept_nodes || [];
        analysis.recommendations = analysis.recommendations || [];
        analysis.expected_questions = analysis.expected_questions || [];
        analysis.flashcards = analysis.flashcards || [];

        // Ensure difficulty is within range
        if (typeof analysis.difficulty !== 'number' || analysis.difficulty < 1 || analysis.difficulty > 10) {
            analysis.difficulty = 5; // Default to medium
        }

        return analysis;
    } catch (error) {
        console.error('LLM analysis error:', error.message);
        throw new Error(`Failed to analyze document: ${error.message}`);
    }
}

/**
 * Get analysis results for a resource
 */
exports.getAnalysis = async (resourceId) => {
    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new Error('Resource not found');
    }

    if (!resource.aiAnalysis || resource.aiAnalysis.analysisStatus === 'not_started') {
        return null;
    }

    return resource.aiAnalysis;
};

/**
 * Regenerate flashcards only
 */
exports.regenerateFlashcards = async (resourceId) => {
    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new Error('Resource not found');
    }

    if (!resource.aiAnalysis || !resource.aiAnalysis.main_topic) {
        throw new Error('Document must be analyzed first');
    }

    // Extract text and regenerate
    const documentText = await extractText(resource);
    const analysis = await callLLMForAnalysis(documentText);

    // Update only flashcards
    resource.aiAnalysis.flashcards = analysis.flashcards;
    await resource.save();

    return resource.aiAnalysis;
};

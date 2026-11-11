/**
 * Resource Analysis Service
 * 
 * Handles AI-powered document analysis using Groq LLM
 * - Extracts text from PDF/DOCX files
 * - Generates structured academic insights
 * - Stores analysis results in database
 */

const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

/**
 * Extract text from PDF file
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

/**
 * Extract text from DOCX file
 * @param {string} filePath - Absolute path to DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from DOCX');
    }
}

/**
 * Extract text from document based on file type
 * @param {string} filePath - Absolute path to document
 * @param {string} fileType - File extension (pdf, docx, etc.)
 * @returns {Promise<string>} - Extracted text
 */
async function extractText(filePath, fileType) {
    const ext = fileType.toLowerCase().replace('.', '');

    switch (ext) {
        case 'pdf':
            return await extractTextFromPDF(filePath);
        case 'docx':
        case 'doc':
            return await extractTextFromDOCX(filePath);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

/**
 * Generate analysis prompt for LLM
 * @param {string} text - Document text content
 * @param {object} metadata - Resource metadata (title, subject, etc.)
 * @returns {string} - Formatted prompt
 */
function generateAnalysisPrompt(text, metadata) {
    // Truncate text if too long (Groq has token limits)
    const maxLength = 15000; // ~4000 tokens
    const truncatedText = text.length > maxLength
        ? text.substring(0, maxLength) + '...[TRUNCATED]'
        : text;

    return `You are an expert academic analyst. Analyze the following study material and provide structured insights in JSON format.

**Document Metadata:**
- Title: ${metadata.title}
- Subject: ${metadata.subject || 'Unknown'}
- Type: ${metadata.type}

**Document Content:**
${truncatedText}

**Required Output (JSON only, no markdown):**
{
  "subject": "refined subject name",
  "main_topic": "primary topic of this document",
  "subtopics": ["list", "of", "5-10", "subtopics"],
  "prerequisites": ["concepts", "students", "should", "know"],
  "summary": "2-3 sentence academic summary",
  "flashcards": [
    {"q": "Question about key concept", "a": "Clear, concise answer"},
    ... (5-10 flashcards total)
  ],
  "expected_questions": [
    "Expected exam question 1",
    "Expected exam question 2",
    ... (5-8 questions total)
  ],
  "concept_nodes": ["key", "concept", "1", "concept", "2", ... (5-15 nodes)],
  "related_topics": ["topic1", "topic2", "topic3"],
  "ideal_study_group_type": "one of: Technical Problem Solving, Conceptual Discussion, Project-Based, Exam Prep, Mixed",
  "recommended_tools": ["tool1", "tool2", "tool3"],
  "difficulty": 1-10 (integer),
  "confidence_score": 0.0-1.0 (how confident you are in this analysis)
}

Return ONLY the JSON object, no additional text.`;
}

/**
 * Analyze document using Groq LLM
 * @param {string} text - Document text
 * @param {object} metadata - Resource metadata
 * @returns {Promise<object>} - Structured analysis results
 */
async function analyzeWithLLM(text, metadata) {
    if (!groq) {
        throw new Error('Groq API not configured. Please set GROQ_API_KEY in .env');
    }

    try {
        const prompt = generateAnalysisPrompt(text, metadata);

        console.log('📊 Sending document to Groq for analysis...');

        const completion = await groq.chat.completions.create({
            messages: [{
                role: 'user',
                content: prompt
            }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3, // Lower temperature for more consistent output
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('No response from LLM');
        }

        // Parse JSON response
        const analysis = JSON.parse(response);

        // Add timestamp
        analysis.analyzedAt = new Date();

        console.log('✅ Document analysis completed');
        console.log(`  - Confidence: ${analysis.confidence_score}`);
        console.log(`  - Difficulty: ${analysis.difficulty}/10`);
        console.log(`  - Flashcards: ${analysis.flashcards?.length || 0}`);

        return analysis;

    } catch (error) {
        console.error('❌ LLM analysis error:', error);

        if (error.message?.includes('JSON')) {
            throw new Error('Failed to parse LLM response as JSON');
        }

        throw new Error(`LLM analysis failed: ${error.message}`);
    }
}

/**
 * Analyze a resource document
 * @param {object} resource - Resource model instance
 * @returns {Promise<object>} - Analysis results
 */
async function analyzeResource(resource) {
    try {
        console.log(`\n🔍 Analyzing resource: ${resource.title}`);

        // Validate file exists
        const filePath = path.join(__dirname, '..', resource.fileUrl);

        try {
            await fs.access(filePath);
        } catch {
            throw new Error('Resource file not found');
        }

        // Extract text
        console.log('📄 Extracting text from document...');
        const text = await extractText(filePath, resource.fileType);

        if (!text || text.trim().length < 100) {
            throw new Error('Insufficient text content extracted from document');
        }

        console.log(`  - Extracted ${text.length} characters`);

        // Analyze with LLM
        const analysis = await analyzeWithLLM(text, {
            title: resource.title,
            subject: resource.subject,
            type: resource.type
        });

        // Validate required fields
        const requiredFields = ['subject', 'main_topic', 'summary', 'difficulty'];
        for (const field of requiredFields) {
            if (!analysis[field]) {
                console.warn(`⚠️ Missing required field: ${field}`);
            }
        }

        return analysis;

    } catch (error) {
        console.error(`❌ Resource analysis failed: ${error.message}`);
        throw error;
    }
}

/**
 * Get mock analysis for testing (when Groq API is not available)
 * @param {object} resource - Resource model instance
 * @returns {object} - Mock analysis data
 */
function getMockAnalysis(resource) {
    return {
        subject: resource.subject || 'Computer Science',
        main_topic: resource.title,
        subtopics: ['Introduction', 'Core Concepts', 'Advanced Topics', 'Applications'],
        prerequisites: ['Basic understanding of the subject', 'Mathematical foundations'],
        summary: `This document covers fundamental concepts in ${resource.subject || 'the topic'} with practical examples and theoretical foundations.`,
        flashcards: [
            { q: 'What is the main topic?', a: resource.title },
            { q: 'Why is this important?', a: 'Essential for understanding core concepts' }
        ],
        expected_questions: [
            `Explain the key concepts in ${resource.title}`,
            'What are the practical applications?'
        ],
        concept_nodes: ['Introduction', 'Theory', 'Practice', 'Applications'],
        related_topics: [resource.subject],
        ideal_study_group_type: 'Conceptual Discussion',
        recommended_tools: ['Textbooks', 'Online Resources', 'Practice Problems'],
        difficulty: 5,
        confidence_score: 0.5,
        analyzedAt: new Date()
    };
}

module.exports = {
    extractText,
    analyzeResource,
    getMockAnalysis
};

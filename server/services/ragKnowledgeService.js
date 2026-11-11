/**
 * RAG Knowledge Service
 * Handles CSV-based retrieval-augmented generation for college-specific questions
 * 
 * This is a COMPLETELY SEPARATE feature from the existing chatbot.
 * Uses simple TF-IDF similarity for retrieval without external dependencies.
 */

const fs = require('fs');
const path = require('path');

// Path to CSV dataset
const CSV_PATH = path.join(__dirname, '../../dataset_rag.csv');

// In-memory knowledge store
let knowledgeStore = {
    initialized: false,
    documents: [],
    vocabulary: new Map(),
    idfScores: new Map()
};

/**
 * Tokenize text into lowercase words
 */
const tokenize = (text) => {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1);
};

/**
 * Compute TF (term frequency) for a document
 */
const computeTF = (tokens) => {
    const tf = new Map();
    tokens.forEach(token => {
        tf.set(token, (tf.get(token) || 0) + 1);
    });
    // Normalize by document length
    tokens.forEach(token => {
        tf.set(token, tf.get(token) / tokens.length);
    });
    return tf;
};

/**
 * Compute cosine similarity between two TF-IDF vectors
 */
const cosineSimilarity = (vec1, vec2, idfScores) => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    // Get all unique terms
    const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

    allTerms.forEach(term => {
        const idf = idfScores.get(term) || 1;
        const v1 = (vec1.get(term) || 0) * idf;
        const v2 = (vec2.get(term) || 0) * idf;
        dotProduct += v1 * v2;
        norm1 += v1 * v1;
        norm2 += v2 * v2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

/**
 * Parse CSV content into structured documents
 */
const parseCSV = (content) => {
    const documents = [];
    const lines = content.split('\n');

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Create document from line
        const doc = createDocumentFromLine(line, i);
        if (doc) {
            documents.push(doc);
        }
    }

    return documents;
};

/**
 * Create a structured document from a CSV line
 */
const createDocumentFromLine = (line, lineNumber) => {
    // Basic parsing - split by category indicators
    let category = 'GENERAL';
    let content = line;

    // Detect category from line content
    if (line.includes('TIMETABLE')) {
        category = 'TIMETABLE';
    } else if (line.includes('EVENT')) {
        category = 'EVENT';
    } else if (line.includes('FACULTY')) {
        category = 'FACULTY';
    } else if (line.includes('FACILITY')) {
        category = 'FACILITY';
    } else if (line.includes('SERVICE')) {
        category = 'SERVICE';
    } else if (line.includes('NEWSLETTER')) {
        category = 'NEWSLETTER';
    } else if (line.includes('EXAM')) {
        category = 'EXAM';
    } else if (line.includes('SYLLABUS')) {
        category = 'SYLLABUS';
    } else if (line.includes('COLLEGE_INFO')) {
        category = 'COLLEGE_INFO';
    }

    // Clean up content - remove extra quotes and formatting
    content = line.replace(/["]+/g, ' ').replace(/,+/g, ', ').trim();

    // Create human-readable text based on category
    const readableContent = createReadableContent(content, category);

    return {
        id: `doc_${lineNumber}`,
        category,
        rawContent: content,
        content: readableContent,
        tokens: tokenize(readableContent),
        tfVector: null // Will be computed after all docs loaded
    };
};

/**
 * Create human-readable content from raw CSV data
 */
const createReadableContent = (rawContent, category) => {
    // Extract key information based on patterns in the data
    let readable = rawContent;

    // Clean up common patterns
    readable = readable.replace(/\r/g, '');

    // Add context based on category
    switch (category) {
        case 'TIMETABLE':
            readable = `Timetable information: ${readable}`;
            break;
        case 'EVENT':
            readable = `Event information: ${readable}`;
            break;
        case 'FACULTY':
            readable = `Faculty availability: ${readable}`;
            break;
        case 'FACILITY':
            readable = `Facility information: ${readable}`;
            break;
        case 'SERVICE':
            readable = `Service information: ${readable}`;
            break;
        case 'NEWSLETTER':
            readable = `Newsletter/Notice: ${readable}`;
            break;
        case 'EXAM':
            readable = `Exam schedule: ${readable}`;
            break;
        case 'SYLLABUS':
            readable = `Syllabus information: ${readable}`;
            break;
        case 'COLLEGE_INFO':
            readable = `College information: ${readable}`;
            break;
    }

    return readable;
};

/**
 * Initialize the knowledge store from CSV
 */
const initializeKnowledgeStore = async () => {
    if (knowledgeStore.initialized) {
        console.log('[RAGKnowledge] Knowledge store already initialized');
        return true;
    }

    try {
        console.log('[RAGKnowledge] Loading CSV dataset from:', CSV_PATH);

        if (!fs.existsSync(CSV_PATH)) {
            console.error('[RAGKnowledge] CSV file not found:', CSV_PATH);
            return false;
        }

        const content = fs.readFileSync(CSV_PATH, 'utf-8');
        knowledgeStore.documents = parseCSV(content);

        console.log(`[RAGKnowledge] Parsed ${knowledgeStore.documents.length} documents`);

        // Build vocabulary and compute IDF scores
        const docCount = knowledgeStore.documents.length;
        const termDocCount = new Map();

        // Count how many documents each term appears in
        knowledgeStore.documents.forEach(doc => {
            const uniqueTerms = new Set(doc.tokens);
            uniqueTerms.forEach(term => {
                termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
            });
        });

        // Compute IDF scores
        termDocCount.forEach((count, term) => {
            const idf = Math.log(docCount / (1 + count)) + 1;
            knowledgeStore.idfScores.set(term, idf);
            knowledgeStore.vocabulary.set(term, true);
        });

        // Compute TF vectors for all documents
        knowledgeStore.documents.forEach(doc => {
            doc.tfVector = computeTF(doc.tokens);
        });

        knowledgeStore.initialized = true;
        console.log(`[RAGKnowledge] Knowledge store initialized with ${knowledgeStore.vocabulary.size} unique terms`);

        return true;
    } catch (error) {
        console.error('[RAGKnowledge] Error initializing knowledge store:', error);
        return false;
    }
};

/**
 * Retrieve top-k relevant documents for a query
 */
const retrieveDocuments = (query, topK = 5) => {
    if (!knowledgeStore.initialized) {
        console.error('[RAGKnowledge] Knowledge store not initialized');
        return [];
    }

    const queryTokens = tokenize(query);
    const queryTF = computeTF(queryTokens);

    // Compute similarity scores
    const scores = knowledgeStore.documents.map(doc => ({
        document: doc,
        score: cosineSimilarity(queryTF, doc.tfVector, knowledgeStore.idfScores)
    }));

    // Sort by score descending and take top-k
    scores.sort((a, b) => b.score - a.score);

    // Filter out zero-score documents and take top-k
    const results = scores
        .filter(s => s.score > 0)
        .slice(0, topK);

    console.log(`[RAGKnowledge] Retrieved ${results.length} documents for query: "${query}"`);
    results.forEach((r, i) => {
        console.log(`  ${i + 1}. Score: ${r.score.toFixed(4)} | Category: ${r.document.category}`);
    });

    return results;
};

/**
 * Build context string from retrieved documents
 */
const buildContext = (retrievedDocs) => {
    if (retrievedDocs.length === 0) {
        return null;
    }

    const contextParts = retrievedDocs.map((r, i) => {
        return `[${r.document.category}] ${r.document.content}`;
    });

    return contextParts.join('\n\n');
};

/**
 * Generate RAG system prompt
 */
const getRAGSystemPrompt = () => {
    return `You are a College Knowledge Assistant. Your ONLY job is to answer questions based on the official college data provided to you.

STRICT RULES:
1. Answer ONLY using information from the RETRIEVED CONTEXT provided below.
2. If the answer is not found in the context, respond with: "This information is not available in the college database."
3. DO NOT make up information or use general knowledge.
4. DO NOT guess or assume anything not explicitly stated in the context.
5. Be concise and helpful.
6. If asked about dates, times, events, faculty, facilities - ONLY use the exact data provided.

When answering:
- For timetables: mention the day, period, time, subject, topic, and faculty name if available.
- For events: mention the event name, date, time, and venue.
- For faculty: mention availability days and times, cabin number, and email if available.
- For facilities: mention the location and timings.`;
};

/**
 * Process a RAG query
 */
const processQuery = async (question, llmService = null) => {
    // Ensure knowledge store is initialized
    const initialized = await initializeKnowledgeStore();
    if (!initialized) {
        return {
            success: false,
            answer: 'The college knowledge database could not be loaded. Please try again later.',
            context: null
        };
    }

    // Retrieve relevant documents
    const retrieved = retrieveDocuments(question, 5);
    const context = buildContext(retrieved);

    // If no relevant documents found
    if (!context) {
        return {
            success: true,
            answer: 'This information is not available in the college database.',
            context: null,
            retrievedCount: 0
        };
    }

    // If LLM service is provided, generate response
    if (llmService) {
        try {
            const messages = [
                {
                    role: 'system',
                    content: getRAGSystemPrompt()
                },
                {
                    role: 'user',
                    content: `RETRIEVED CONTEXT:\n${context}\n\n---\n\nUSER QUESTION: ${question}`
                }
            ];

            const answer = await llmService.getCompletion(messages);

            return {
                success: true,
                answer,
                context,
                retrievedCount: retrieved.length
            };
        } catch (error) {
            console.error('[RAGKnowledge] LLM error:', error);
            return {
                success: false,
                answer: 'There was an error generating a response. Please try again.',
                context,
                retrievedCount: retrieved.length
            };
        }
    }

    // If no LLM, return context summary
    return {
        success: true,
        answer: `Based on the college database, here is the relevant information:\n\n${context}`,
        context,
        retrievedCount: retrieved.length
    };
};

/**
 * Get knowledge store status
 */
const getStatus = () => {
    return {
        initialized: knowledgeStore.initialized,
        documentCount: knowledgeStore.documents.length,
        vocabularySize: knowledgeStore.vocabulary.size
    };
};

module.exports = {
    initializeKnowledgeStore,
    processQuery,
    retrieveDocuments,
    buildContext,
    getStatus,
    getRAGSystemPrompt
};

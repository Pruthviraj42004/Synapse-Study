/**
 * Groq AI Service
 * Direct integration with Groq API for intelligent AI responses
 */

const OpenAI = require('openai');

/**
 * Groq Chat Client - Uses OpenAI SDK with Groq endpoint
 */
class GroqChatClient {
  constructor() {
    // Groq API configuration using OpenAI SDK
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      console.warn('⚠️  GROQ_API_KEY not set! AI responses will use fallback mode.');
      this.client = null;
      this.defaultModel = 'mock';
    } else {
      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      this.defaultModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      console.log('✅ Groq AI initialized with model:', this.defaultModel);
    }

    // Available models
    this.models = {
      fast: 'llama-3.3-70b-versatile',
      smart: 'llama-3.1-70b-versatile',
      coding: 'llama-3.3-70b-versatile',
      creative: 'mixtral-8x7b-32768'
    };
  }

  /**
   * Core function to call Groq API
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - Additional options (model, temperature, etc.)
   * @returns {String} - AI response
   */
  async chatCompletion(messages, options = {}) {
    if (!this.client) {
      throw new Error('Groq API not configured. Please set GROQ_API_KEY in .env');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        stream: false
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Groq API error:', error.message);

      // Enhanced error handling
      if (error.status === 401 || error.status === 403) {
        throw new Error('Groq API authentication failed. Check your API key.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      } else if (error.status === 500) {
        throw new Error('Groq API server error. Please try again later.');
      }

      throw error;
    }
  }

  /**
   * Chat with the AI assistant
   */
  async chat(message, conversationHistory = [], context = {}) {
    try {
      // Build messages array
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(context)
        }
      ];

      // Add conversation history (last 6 messages)
      const recentHistory = conversationHistory.slice(-6);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      // Call Groq API
      const response = await this.chatCompletion(messages, {
        model: this.models.fast
      });

      return {
        success: true,
        message: response.trim(),
        model: this.models.fast
      };
    } catch (error) {
      console.error('Chat error:', error.message);
      // Fallback to rule-based response
      const fallback = this.getRuleBasedFallback(message, context);
      return {
        success: true,
        message: fallback,
        model: 'rule-based'
      };
    }
  }

  /**
   * Analyze code and provide insights
   */
  async analyzeCode(code, language, question) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert code analyzer. Provide clear, actionable insights about code quality, potential bugs, and improvements.'
        },
        {
          role: 'user',
          content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nQuestion: ${question}\n\nPlease analyze this code and provide detailed insights.`
        }
      ];

      const analysis = await this.chatCompletion(messages, {
        model: this.models.coding
      });

      return {
        success: true,
        analysis: analysis,
        model: this.models.coding
      };
    } catch (error) {
      console.error('Code analysis error:', error.message);
      return this.handleError(error, 'code analysis');
    }
  }

  /**
   * Generate quiz questions based on topic
   */
  async generateQuiz(topic, difficulty = 'medium', numberOfQuestions = 5) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a quiz generator. Create high-quality multiple choice questions with exactly 4 options each.'
        },
        {
          role: 'user',
          content: `Generate a ${difficulty} difficulty quiz about "${topic}" with exactly ${numberOfQuestions} multiple choice questions.

Format EACH question EXACTLY like this:
Q: [question text]
A) [first option]
B) [second option]
C) [third option]
D) [fourth option]
Correct: [A/B/C/D]

Generate the quiz now:`
        }
      ];

      const rawQuiz = await this.chatCompletion(messages, {
        model: this.models.smart
      });

      const questions = this.parseQuizQuestions(rawQuiz);

      return {
        success: true,
        quiz: {
          topic,
          difficulty,
          questions
        },
        model: this.models.smart
      };
    } catch (error) {
      console.error('Quiz generation error:', error.message);
      return this.handleError(error, 'quiz generation');
    }
  }

  /**
   * Generate learning roadmap
   */
  async generateRoadmap(topic, level = 'beginner', duration = '3 months') {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a learning path expert. Create comprehensive, realistic roadmaps for learning new technologies.'
        },
        {
          role: 'user',
          content: `Create a detailed learning roadmap for "${topic}" at ${level} level over ${duration}. 

Include:
1. **Prerequisites** (what to know before starting)
2. **Week-by-week breakdown** (specific topics/milestones)
3. **Key concepts to master**
4. **Recommended resources** (books, courses, docs)
5. **Practice projects** (hands-on practice ideas)
6. **Milestones** (checkpoints to measure progress)

Make it practical and actionable.`
        }
      ];

      const roadmapContent = await this.chatCompletion(messages, {
        model: this.models.smart
      });

      return {
        success: true,
        roadmap: {
          topic,
          level,
          duration,
          content: roadmapContent,
          structure: this.parseRoadmap(roadmapContent)
        },
        model: this.models.smart
      };
    } catch (error) {
      console.error('Roadmap generation error:', error.message);
      return this.handleError(error, 'roadmap generation');
    }
  }

  /**
   * Answer specific questions with context
   */
  async answerQuestion(question, context = '') {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful programming tutor. Provide clear, accurate answers to programming questions.'
        },
        {
          role: 'user',
          content: context
            ? `Question: ${question}\n\nContext: ${context}\n\nPlease provide a clear answer.`
            : `Question: ${question}\n\nPlease provide a clear answer.`
        }
      ];

      const answer = await this.chatCompletion(messages, {
        model: this.models.smart
      });

      return {
        success: true,
        answer: answer.trim(),
        model: this.models.smart
      };
    } catch (error) {
      console.error('Question answering error:', error.message);
      return this.handleError(error, 'question answering');
    }
  }

  /**
   * Summarize text or code
   */
  async summarize(text, maxLength = 150) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a text summarizer. Create concise, accurate summaries.'
        },
        {
          role: 'user',
          content: `Summarize the following text in under ${maxLength} characters:\n\n${text}`
        }
      ];

      const summary = await this.chatCompletion(messages, {
        model: this.models.fast
      });

      return {
        success: true,
        summary: summary.trim(),
        model: this.models.fast
      };
    } catch (error) {
      console.error('Summarization error:', error.message);
      return this.handleError(error, 'summarization');
    }
  }

  /**
   * Build system prompt based on context
   */
  buildSystemPrompt(context = {}) {
    // If there's resource/document content, prioritize it
    if (context.type === 'resource' && context.documentContent) {
      return `You are an intelligent AI tutor analyzing a specific study resource.

**CRITICAL: You have been provided with the ACTUAL DOCUMENT CONTENT below. Your responses MUST be based on THIS SPECIFIC DOCUMENT, not general knowledge.**

**Document Information:**
- Title: ${context.resourceTitle || 'Study Resource'}
- Subject: ${context.resourceSubject || 'Unknown'}
- Resource ID: ${context.resourceId || 'Unknown'}

**FULL DOCUMENT CONTENT:**
${context.documentContent}

**YOUR ROLE:**
1. Answer questions specifically about THIS document
2. Explain concepts, code, or content from THIS document
3. Help students understand the material in THIS document
4. If asked about something not in the document, politely mention that and provide general help

**IMPORTANT:**
- Always reference the actual content from the document above
- Be specific and cite parts of the document in your explanations
- If the document contains code, explain how it works step by step
- If it's theoretical content, break it down clearly
- Do NOT make up information - only use what's in the document

Now help the student understand this document!`;
    }

    // If there's editor context (programming)
    if (context.type === 'editor' && context.editorContext) {
      const { code, language, hasSelection } = context.editorContext;
      const codeContext = hasSelection
        ? `The user has selected code in ${language}:\n\`\`\`${language}\n${code}\n\`\`\``
        : `The user is working with ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;

      return `You are a helpful programming assistant for college students. You can help with coding, debugging, explaining concepts, and learning.

${codeContext}

Provide clear, educational responses that help students learn.`;
    }

    // Default system prompt
    return `You are an intelligent AI study assistant for college students. You help with:
- Programming and coding questions
- Explaining concepts clearly
- Study material analysis
- Quiz and exam preparation
- Learning roadmaps

Be helpful, educational, and encouraging. Provide clear explanations and examples.`;
  }

  /**
   * Parse quiz questions from generated text
   */
  parseQuizQuestions(text) {
    const questions = [];
    const questionBlocks = text.split(/Q\d*:/i).filter(q => q.trim());

    for (const block of questionBlocks) {
      const lines = block.split('\n').filter(l => l.trim());
      if (lines.length < 5) continue;

      const question = lines[0].trim();
      const options = [];
      let correctAnswer = '';

      for (const line of lines) {
        if (/^[A-D][).:]/.test(line.trim())) {
          const option = line.trim().substring(2).trim();
          options.push(option);
        } else if (/correct:/i.test(line)) {
          correctAnswer = line.match(/[A-D]/i)?.[0]?.toUpperCase() || '';
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer: correctAnswer.charCodeAt(0) - 65 // Convert A-D to 0-3
        });
      }
    }

    // If parsing failed, create fallback question
    if (questions.length === 0) {
      questions.push({
        question: 'The AI generated content in an unexpected format. Please try again.',
        options: ['Try again', 'Adjust the topic', 'Change difficulty', 'Contact support'],
        correctAnswer: 0
      });
    }

    return questions;
  }

  /**
   * Parse roadmap into structured format
   */
  parseRoadmap(content) {
    const structure = {
      prerequisites: [],
      phases: [],
      milestones: []
    };

    const sections = content.split('\n\n');

    for (const section of sections) {
      const lower = section.toLowerCase();
      if (lower.includes('prerequisite')) {
        structure.prerequisites = section
          .split('\n')
          .slice(1)
          .filter(l => l.trim())
          .map(l => l.replace(/^[-*•]\s*/, '').trim());
      } else if (lower.includes('week') || lower.includes('phase')) {
        structure.phases.push(section);
      } else if (lower.includes('milestone')) {
        structure.milestones = section
          .split('\n')
          .slice(1)
          .filter(l => l.trim())
          .map(l => l.replace(/^[-*•]\s*/, '').trim());
      }
    }

    return structure;
  }

  /**
   * Simple rule-based fallback when AI fails
   */
  getRuleBasedFallback(message, context) {
    const lowerMsg = message.toLowerCase();

    if (/(hi|hello|hey|greetings)/i.test(lowerMsg)) {
      return "Hello! I'm your AI programming assistant. I can help you with:\n\n• Code analysis and debugging\n• Generating quizzes on programming topics\n• Creating learning roadmaps\n• Answering programming questions\n\nWhat would you like help with today?";
    }

    if (/(help|what can you do|capabilities)/i.test(lowerMsg)) {
      return "I can assist you with:\n\n📝 Code Analysis - Review and explain your code\n🎯 Quiz Generation - Create practice questions on any topic\n🗺️ Roadmaps - Design learning paths for technologies\n❓ Q&A - Answer programming questions\n\nJust ask me anything or use the quick action buttons!";
    }

    if (/(code|debug|error|bug|fix)/i.test(lowerMsg) && context?.code) {
      return `I can see you're working with ${context.language} code. Here are some general debugging tips:\n\n1. Check for syntax errors\n2. Verify variable names and types\n3. Add console.log statements to trace execution\n4. Check your logic flow\n\nFeel free to share specific error messages for more targeted help!`;
    }

    if (/(thank|thanks|appreciate)/i.test(lowerMsg)) {
      return "You're welcome! Feel free to ask if you need anything else. Happy coding! 🚀";
    }

    const defaults = [
      "I'm here to help with your programming questions! Could you provide more details about what you'd like to know?",
      "I'd be happy to assist! What specific aspect of programming are you working on?",
      "Let me help you with that. Could you elaborate a bit more on your question?",
      "I'm your programming assistant! What would you like to learn or build today?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  /**
   * Handle API errors gracefully
   */
  handleError(error, operation) {
    let message = `Failed to perform ${operation}.`;

    if (error.message.includes('Rate limit')) {
      message = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message.includes('authentication')) {
      message = 'Groq API authentication failed. Please check your API key.';
    } else if (error.message.includes('timeout')) {
      message = 'Request timeout. Please try again.';
    } else if (!this.client) {
      message = 'Groq API not configured. Please set GROQ_API_KEY in your environment.';
    }

    return {
      success: false,
      error: message,
      details: error.message
    };
  }
}

module.exports = new GroqChatClient();

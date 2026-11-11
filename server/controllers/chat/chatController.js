const { ChatMessage, ChatSession } = require('../../models/chat/ChatMessage');
const Quiz = require('../../models/chat/Quiz');
const Roadmap = require('../../models/chat/Roadmap');
const groqService = require('../../services/chat/huggingFaceService'); // Using Groq AI now (file kept same name for compatibility)
const { v4: uuidv4 } = require('uuid');

/**
 * Send a chat message to AI
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create or get session
    let session = await ChatSession.findOne({ sessionId, user: userId });
    if (!session) {
      session = await ChatSession.create({
        user: userId,
        sessionId: sessionId || uuidv4(),
        title: message.substring(0, 50)
      });
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      user: userId,
      sessionId: session.sessionId,
      role: 'user',
      content: message,
      context
    });

    // Get conversation history
    const history = await ChatMessage.find({
      sessionId: session.sessionId,
      user: userId
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // Get AI response
    const startTime = Date.now();
    const aiResponse = await groqService.chat(message, history, context);
    const processingTime = Date.now() - startTime;

    // Always get a response now (real AI or rule-based fallback)
    const assistantMessage = await ChatMessage.create({
      user: req.user.id,
      sessionId: session.sessionId,
      role: 'assistant',
      content: aiResponse.message,
      metadata: {
        model: aiResponse.model || 'groq',
        processingTime,
        fallback: aiResponse.model === 'rule-based'
      }
    });

    // Update session
    session.lastMessage = aiResponse.message.substring(0, 100);
    session.messagesCount += 2;
    await session.save();

    res.json({
      success: true,
      message: aiResponse.message, // Send just the content string, not the full DB object
      sessionId: session.sessionId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
};

/**
 * Get chat sessions for user
 */
exports.getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const sessions = await ChatSession.find({ user: userId, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await ChatSession.countDocuments({ user: userId, isActive: true });

    res.json({
      success: true,
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
};

/**
 * Get messages for a session
 */
exports.getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      sessionId,
      user: userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = await ChatMessage.find({
      sessionId,
      user: userId
    })
      .sort({ createdAt: 1 })
      .lean();

    // Transform messages to simple format for frontend
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

/**
 * Create a new chat session
 */
exports.createSession = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    const session = await ChatSession.create({
      user: userId,
      sessionId: uuidv4(),
      title: title || 'New Chat'
    });

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

/**
 * Update session
 */
exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, tags } = req.body;
    const userId = req.user.id;

    const session = await ChatSession.findOneAndUpdate(
      { sessionId, user: userId },
      { title, tags },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

/**
 * Delete session
 */
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    await ChatSession.findOneAndUpdate(
      { sessionId, user: userId },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Session deleted'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

/**
 * Provide feedback on a message
 */
exports.provideFeedback = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { helpful, rating } = req.body;
    const userId = req.user.id;

    const message = await ChatMessage.findOneAndUpdate(
      { _id: messageId, user: userId },
      {
        'feedback.helpful': helpful,
        'feedback.rating': rating
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({ error: 'Failed to provide feedback' });
  }
};

/**
 * Analyze code
 */
exports.analyzeCode = async (req, res) => {
  try {
    const { code, language, question } = req.body;
    const userId = req.user.id;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await groqService.analyzeCode(
      code,
      language,
      question || 'Analyze this code and provide insights'
    );

    res.json(result);
  } catch (error) {
    console.error('Analyze code error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};

/**
 * Generate quiz
 */
exports.generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = 'medium', numberOfQuestions = 5 } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await groqService.generateQuiz(topic, difficulty, numberOfQuestions);

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Save quiz to database
    const quiz = await Quiz.create({
      creator: userId,
      title: `${topic} Quiz`,
      topic,
      difficulty,
      questions: result.quiz.questions,
      generatedBy: 'ai',
      aiModel: result.model
    });

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

/**
 * Get quizzes
 */
exports.getQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, difficulty, limit = 20, page = 1 } = req.query;

    const query = {
      $or: [
        { creator: userId },
        { isPublic: true }
      ]
    };

    if (topic) query.topic = new RegExp(topic, 'i');
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      quizzes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

/**
 * Get quiz by ID
 */
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findOne({
      _id: quizId,
      $or: [
        { creator: userId },
        { isPublic: true }
      ]
    }).populate('creator', 'name email');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};

/**
 * Submit quiz attempt
 */
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question.correctAnswer === answer;

      if (isCorrect) correctAnswers++;

      detailedAnswers.push({
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect
      });
    });

    const totalQuestions = quiz.questions.length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Add attempt to quiz
    quiz.attempts.push({
      user: userId,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      answers: detailedAnswers
    });

    quiz.updateStatistics();
    await quiz.save();

    res.json({
      success: true,
      result: {
        score,
        correctAnswers,
        totalQuestions,
        passed: score >= 60,
        detailedAnswers
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
};

/**
 * Get quiz results
 */
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const userAttempts = quiz.attempts.filter(
      attempt => attempt.user.toString() === userId
    );

    res.json({
      success: true,
      attempts: userAttempts,
      statistics: quiz.statistics
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Failed to get quiz results' });
  }
};

/**
 * Delete quiz
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findOneAndDelete({ _id: quizId, creator: userId });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Quiz deleted'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

/**
 * Generate roadmap
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const { topic, level = 'beginner', duration = '3 months' } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await groqService.generateRoadmap(topic, level, duration);

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Parse duration
    const durationMatch = duration.match(/(\d+)\s*(day|week|month)s?/i);
    const durationValue = durationMatch ? parseInt(durationMatch[1]) : 3;
    const durationUnit = durationMatch ? durationMatch[2].toLowerCase() + 's' : 'months';

    // Create phases from structured content
    const phases = result.roadmap.structure.phases.map((phase, index) => ({
      title: `Phase ${index + 1}`,
      description: phase,
      order: index,
      milestones: []
    }));

    // Save roadmap
    const roadmap = await Roadmap.create({
      creator: userId,
      title: `${topic} Learning Path`,
      topic,
      level,
      duration: {
        value: durationValue,
        unit: durationUnit
      },
      description: result.roadmap.content,
      prerequisites: result.roadmap.structure.prerequisites.map(p => ({
        title: p,
        completed: false
      })),
      phases,
      generatedBy: 'ai',
      aiModel: result.model
    });

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
};

/**
 * Get roadmaps
 */
exports.getRoadmaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, level, limit = 20, page = 1 } = req.query;

    const query = {
      $or: [
        { creator: userId },
        { isPublic: true }
      ]
    };

    if (topic) query.topic = new RegExp(topic, 'i');
    if (level) query.level = level;

    const roadmaps = await Roadmap.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Roadmap.countDocuments(query);

    res.json({
      success: true,
      roadmaps,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: 'Failed to get roadmaps' });
  }
};

/**
 * Get roadmap by ID
 */
exports.getRoadmapById = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      $or: [
        { creator: userId },
        { isPublic: true }
      ]
    }).populate('creator', 'name email');

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
};

/**
 * Update roadmap
 */
exports.updateRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, creator: userId },
      updates,
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found or unauthorized' });
    }

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Update roadmap error:', error);
    res.status(500).json({ error: 'Failed to update roadmap' });
  }
};

/**
 * Update roadmap progress
 */
exports.updateRoadmapProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { phaseIndex, milestoneIndex, taskIndex, completed } = req.body;
    const userId = req.user.id;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, creator: userId });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found or unauthorized' });
    }

    // Update specific item
    if (taskIndex !== undefined) {
      roadmap.phases[phaseIndex].milestones[milestoneIndex].tasks[taskIndex].completed = completed;
      if (completed) {
        roadmap.phases[phaseIndex].milestones[milestoneIndex].tasks[taskIndex].completedAt = new Date();
      }
    } else if (milestoneIndex !== undefined) {
      roadmap.phases[phaseIndex].milestones[milestoneIndex].completed = completed;
      if (completed) {
        roadmap.phases[phaseIndex].milestones[milestoneIndex].completedAt = new Date();
      }
    } else if (phaseIndex !== undefined) {
      roadmap.phases[phaseIndex].completed = completed;
    }

    roadmap.updateProgress();
    await roadmap.save();

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

/**
 * Fork roadmap
 */
exports.forkRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    const originalRoadmap = await Roadmap.findById(roadmapId);
    if (!originalRoadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Create a copy
    const forkedRoadmap = await Roadmap.create({
      ...originalRoadmap.toObject(),
      _id: undefined,
      creator: userId,
      title: `${originalRoadmap.title} (Fork)`,
      createdAt: undefined,
      updatedAt: undefined,
      isPublic: false,
      forks: [],
      followers: [],
      likes: []
    });

    // Update original roadmap
    originalRoadmap.forks.push({
      user: userId,
      roadmapId: forkedRoadmap._id
    });
    await originalRoadmap.save();

    res.json({
      success: true,
      roadmap: forkedRoadmap
    });
  } catch (error) {
    console.error('Fork roadmap error:', error);
    res.status(500).json({ error: 'Failed to fork roadmap' });
  }
};

/**
 * Delete roadmap
 */
exports.deleteRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    const roadmap = await Roadmap.findOneAndDelete({ _id: roadmapId, creator: userId });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Roadmap deleted'
    });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
};

/**
 * Ask a question
 */
exports.askQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await groqService.answerQuestion(question, context);

    res.json(result);
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

/**
 * Summarize text
 */
exports.summarizeText = async (req, res) => {
  try {
    const { text, maxLength = 150 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await groqService.summarize(text, maxLength);

    res.json(result);
  } catch (error) {
    console.error('Summarize text error:', error);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
};

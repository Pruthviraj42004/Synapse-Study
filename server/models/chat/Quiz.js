const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: String,
    points: {
      type: Number,
      default: 1
    }
  }],
  timeLimit: {
    type: Number, // in seconds
    default: null
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'ai'
  },
  aiModel: String,
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeTaken: Number, // in seconds
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean
    }],
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ creator: 1, createdAt: -1 });
quizSchema.index({ topic: 1, difficulty: 1 });
quizSchema.index({ isPublic: 1, createdAt: -1 });
quizSchema.index({ tags: 1 });

// Update statistics after each attempt
quizSchema.methods.updateStatistics = function() {
  if (this.attempts.length === 0) return;

  const totalAttempts = this.attempts.length;
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const passedAttempts = this.attempts.filter(attempt => attempt.score >= 60).length;

  this.statistics.totalAttempts = totalAttempts;
  this.statistics.averageScore = totalScore / totalAttempts;
  this.statistics.passRate = (passedAttempts / totalAttempts) * 100;
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;

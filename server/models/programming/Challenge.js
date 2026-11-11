const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 1
  }
});

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  language: {
    type: String,
    required: true
  },
  templateCode: {
    type: String,
    required: true
  },
  solutionCode: {
    type: String,
    required: true
  },
  testCases: [TestCaseSchema],
  timeLimit: {
    type: Number, // in milliseconds
    default: 5000
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256
  },
  category: {
    type: String,
    enum: ['algorithms', 'data-structures', 'fundamentals', 'math', 'object-oriented', 'strings', 'databases', 'web'],
    required: true
  },
  tags: [{
    type: String
  }],
  college: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field
ChallengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
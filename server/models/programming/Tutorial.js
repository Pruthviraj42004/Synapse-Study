const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'code', 'image', 'video', 'quiz'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javascript' // For code blocks
  },
  order: {
    type: Number,
    required: true
  }
});

const QuizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // Index of the correct option
    required: true
  },
  explanation: {
    type: String
  },
  points: {
    type: Number,
    default: 1
  }
});

const TutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  language: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  contentBlocks: [ContentBlockSchema],
  quiz: [QuizQuestionSchema],
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  prerequisites: [{
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
  isPublished: {
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
TutorialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for tutorial URL
TutorialSchema.virtual('url').get(function() {
  return `/programming/tutorials/${this.slug}`;
});

// Create a slug from the title
TutorialSchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Tutorial', TutorialSchema);
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  context: {
    code: String,
    language: String,
    currentPage: String,
    editorContent: String,
    additionalData: mongoose.Schema.Types.Mixed
  },
  metadata: {
    model: String,
    tokens: Number,
    processingTime: Number
  },
  feedback: {
    helpful: { type: Boolean, default: null },
    rating: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messagesCount: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  summary: String
}, {
  timestamps: true
});

// Indexes for better query performance
chatMessageSchema.index({ user: 1, sessionId: 1, createdAt: -1 });
chatSessionSchema.index({ user: 1, isActive: 1, updatedAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = { ChatMessage, ChatSession };

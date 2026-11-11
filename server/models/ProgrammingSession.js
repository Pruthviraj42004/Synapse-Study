const mongoose = require('mongoose');

const programmingSessionSchema = new mongoose.Schema({
  studyRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Session'
  },
  language: {
    type: String,
    required: true,
    default: 'javascript'
  },
  code: {
    type: String,
    default: ''
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  executionResults: [{
    output: String,
    error: String,
    executedAt: {
      type: Date,
      default: Date.now
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
programmingSessionSchema.index({ studyRoom: 1, createdAt: -1 });

module.exports = mongoose.model('ProgrammingSession', programmingSessionSchema);
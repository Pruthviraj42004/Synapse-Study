const mongoose = require('mongoose');

const CodeFileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    default: 'javascript'
  },
  content: {
    type: String,
    default: ''
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

const CodeSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true
  },
  college: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  files: [CodeFileSchema],
  activeFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeFile'
  },
  settings: {
    language: {
      type: String,
      default: 'javascript'
    },
    theme: {
      type: String,
      default: 'light'
    },
    fontSize: {
      type: Number,
      default: 14
    },
    tabSize: {
      type: Number,
      default: 2
    }
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

// Add middleware to update the updatedAt field
CodeSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for session URL
CodeSessionSchema.virtual('url').get(function() {
  return `/programming/sessions/${this._id}`;
});

module.exports = mongoose.model('CodeSession', CodeSessionSchema);
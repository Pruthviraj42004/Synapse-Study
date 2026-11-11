const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A session title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      enum: [
        'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 
        'go', 'rust', 'php', 'ruby', 'html', 'css', 'sql'
      ],
      default: 'javascript'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    tags: [String],
    lastExecuted: {
      type: Date
    },
    executionHistory: [
      {
        timestamp: {
          type: Date,
          default: Date.now
        },
        output: String,
        error: String,
        executionTime: Number,
        memoryUsage: Number
      }
    ],
    settings: {
      fontSize: {
        type: Number,
        default: 14
      },
      tabSize: {
        type: Number,
        default: 2
      },
      theme: {
        type: String,
        default: 'vs-dark'
      },
      autoSave: {
        type: Boolean,
        default: true
      },
      wordWrap: {
        type: String,
        enum: ['off', 'on', 'wordWrapColumn', 'bounded'],
        default: 'off'
      }
    },
    isTemplate: {
      type: Boolean,
      default: false
    },
    isSnippet: {
      type: Boolean,
      default: false
    },
    createdFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    }
  },
  {
    timestamps: true
  }
);

// Add a virtual property for truncated code preview
sessionSchema.virtual('codePreview').get(function() {
  if (!this.code) return '';
  return this.code.length > 100 
    ? this.code.substring(0, 100) + '...' 
    : this.code;
});

// Make sure virtuals are included when converting to JSON
sessionSchema.set('toJSON', { virtuals: true });
sessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Session', sessionSchema);
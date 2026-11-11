const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required']
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    starterCode: {
      type: String,
      default: ''
    },
    solutionCode: {
      type: String
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'c', 'cpp', 'csharp', 'ruby', 'go'],
      default: 'javascript'
    },
    testCases: [testCaseSchema],
    tags: [String],
    hints: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    completedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        completedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Add a virtual property for completion stats
challengeSchema.virtual('stats').get(function() {
  return {
    totalCompletions: this.completedBy.length
  };
});

// Make sure virtuals are included when converting to JSON
challengeSchema.set('toJSON', { virtuals: true });
challengeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Challenge', challengeSchema);
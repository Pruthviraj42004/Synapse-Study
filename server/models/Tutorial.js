const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tutorial title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    content: {
      type: String,
      required: [true, 'Tutorial content is required']
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'c', 'cpp', 'csharp', 'ruby', 'go'],
      default: 'javascript'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    order: {
      type: Number,
      default: 0
    },
    sampleCode: {
      type: String
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Add a virtual property for content preview
tutorialSchema.virtual('contentPreview').get(function() {
  if (!this.content) return '';
  
  // Remove HTML tags for preview
  const textOnly = this.content.replace(/<[^>]*>?/gm, '');
  
  return textOnly.length > 200 
    ? textOnly.substring(0, 200) + '...' 
    : textOnly;
});

// Create slug from title before saving
tutorialSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Make sure virtuals are included when converting to JSON
tutorialSchema.set('toJSON', { virtuals: true });
tutorialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tutorial', tutorialSchema);
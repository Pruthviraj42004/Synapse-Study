const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
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
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'months'
    }
  },
  description: String,
  prerequisites: [{
    title: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  phases: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: {
      value: Number,
      unit: String
    },
    order: Number,
    milestones: [{
      title: String,
      description: String,
      resources: [{
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['video', 'article', 'book', 'course', 'documentation', 'other']
        }
      }],
      tasks: [{
        title: String,
        description: String,
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }],
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  skills: [{
    name: String,
    category: String,
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  resources: [{
    title: String,
    url: String,
    type: String,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    difficulty: String,
    estimatedTime: String,
    technologies: [String],
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    repositoryUrl: String
  }],
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
  progress: {
    completedPhases: {
      type: Number,
      default: 0
    },
    completedMilestones: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalPhases: {
      type: Number,
      default: 0
    },
    totalMilestones: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    startedAt: Date,
    lastUpdated: Date
  },
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  forks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
roadmapSchema.index({ creator: 1, createdAt: -1 });
roadmapSchema.index({ topic: 1, level: 1 });
roadmapSchema.index({ isPublic: 1, createdAt: -1 });
roadmapSchema.index({ tags: 1 });

// Calculate total counts when roadmap is created/updated
roadmapSchema.pre('save', function(next) {
  if (this.isModified('phases')) {
    this.progress.totalPhases = this.phases.length;
    this.progress.totalMilestones = this.phases.reduce((sum, phase) => 
      sum + (phase.milestones?.length || 0), 0);
    this.progress.totalTasks = this.phases.reduce((sum, phase) => 
      sum + phase.milestones.reduce((taskSum, milestone) => 
        taskSum + (milestone.tasks?.length || 0), 0), 0);
  }
  next();
});

// Update progress
roadmapSchema.methods.updateProgress = function() {
  this.progress.completedPhases = this.phases.filter(p => p.completed).length;
  this.progress.completedMilestones = this.phases.reduce((sum, phase) => 
    sum + phase.milestones.filter(m => m.completed).length, 0);
  this.progress.completedTasks = this.phases.reduce((sum, phase) => 
    sum + phase.milestones.reduce((taskSum, milestone) => 
      taskSum + milestone.tasks.filter(t => t.completed).length, 0), 0);
  
  const totalItems = this.progress.totalPhases + this.progress.totalMilestones + this.progress.totalTasks;
  const completedItems = this.progress.completedPhases + this.progress.completedMilestones + this.progress.completedTasks;
  
  this.progress.percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  this.progress.lastUpdated = new Date();
  
  if (!this.progress.startedAt && completedItems > 0) {
    this.progress.startedAt = new Date();
  }
};

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;

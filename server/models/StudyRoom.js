const mongoose = require('mongoose');

const studyRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Math', 'Science', 'History', 'Literature', 'Programming', 'Languages', 'Arts', 'Other'],
    default: 'Other'
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['owner', 'moderator', 'participant'],
      default: 'participant'
    }
  }],
  maxParticipants: {
    type: Number,
    default: 20,
    min: 2,
    max: 100
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    default: null,
    index: true
  },
  password: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  schedule: {
    startTime: {
      type: Date,
      default: null
    },
    endTime: {
      type: Date,
      default: null
    },
    recurring: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    }
  },
  resources: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['link', 'file', 'video', 'document'],
      default: 'link'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowWhiteboard: {
      type: Boolean,
      default: true
    },
    allowVideoCall: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowProgramming: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    muteParticipants: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'scheduled', 'ended', 'archived'],
    default: 'active'
  },
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  // LiveKit integration
  livekit: {
    roomName: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sid: {
        type: String,
        default: null
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      isAudioEnabled: {
        type: Boolean,
        default: false
      },
      isVideoEnabled: {
        type: Boolean,
        default: false
      }
    }]
  },
  // Unified room state for real-time features
  state: {
    chat: {
      messages: {
        type: Array,
        default: []
      },
      messageCount: {
        type: Number,
        default: 0
      }
    },
    code: {
      content: {
        type: String,
        default: ''
      },
      language: {
        type: String,
        default: 'javascript'
      },
      yDocVersion: {
        type: Number,
        default: 0
      }
    },
    whiteboard: {
      elements: {
        type: Array,
        default: []
      },
      yDocVersion: {
        type: Number,
        default: 0
      }
    }
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studyRoomSchema.index({ subject: 1, category: 1 });
studyRoomSchema.index({ creator: 1 });
studyRoomSchema.index({ 'participants.user': 1 });
studyRoomSchema.index({ status: 1 });
studyRoomSchema.index({ createdAt: -1 });

// Virtual for participant count
studyRoomSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

// Virtual for available slots
studyRoomSchema.virtual('availableSlots').get(function () {
  return this.maxParticipants - this.participants.length;
});

// Method to check if user is participant
studyRoomSchema.methods.isParticipant = function (userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to get participant role
studyRoomSchema.methods.getParticipantRole = function (userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  return participant ? participant.role : null;
};

// Method to add participant
studyRoomSchema.methods.addParticipant = function (userId, role = 'participant') {
  if (!this.isParticipant(userId) && this.participants.length < this.maxParticipants) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
    this.stats.totalParticipants = Math.max(this.stats.totalParticipants, this.participants.length);
    return true;
  }
  return false;
};

// Method to remove participant
studyRoomSchema.methods.removeParticipant = function (userId) {
  const index = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (index > -1) {
    this.participants.splice(index, 1);
    return true;
  }
  return false;
};

// Method to update last activity
studyRoomSchema.methods.updateActivity = function () {
  this.stats.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

studyRoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
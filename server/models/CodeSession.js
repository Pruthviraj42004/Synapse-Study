const mongoose = require('mongoose');

const CodeSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studyRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyRoom'
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['owner', 'editor', 'viewer'],
          default: 'editor'
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isPublic: {
      type: Boolean,
      default: false
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    lastExecution: {
      timestamp: {
        type: Date
      },
      result: {
        type: String
      },
      error: {
        type: String
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  {
    timestamps: true
  }
);

// Add a virtual for session URL
CodeSessionSchema.virtual('url').get(function () {
  return `/api/programming/sessions/${this._id}`;
});

// Method to check if user is a collaborator
CodeSessionSchema.methods.isCollaborator = function (userId) {
  return this.collaborators.some((c) => c.user.toString() === userId.toString());
};

// Method to get collaborator role
CodeSessionSchema.methods.getCollaboratorRole = function (userId) {
  const collaborator = this.collaborators.find(
    (c) => c.user.toString() === userId.toString()
  );
  return collaborator ? collaborator.role : null;
};

// Method to add collaborator
CodeSessionSchema.methods.addCollaborator = function (userId, role = 'editor') {
  if (!this.isCollaborator(userId)) {
    this.collaborators.push({
      user: userId,
      role: role,
      addedAt: new Date()
    });
    return true;
  }
  return false;
};

// Method to update collaborator role
CodeSessionSchema.methods.updateCollaboratorRole = function (userId, newRole) {
  const collaborator = this.collaborators.find(
    (c) => c.user.toString() === userId.toString()
  );
  if (collaborator) {
    collaborator.role = newRole;
    return true;
  }
  return false;
};

// Method to remove collaborator
CodeSessionSchema.methods.removeCollaborator = function (userId) {
  const initialLength = this.collaborators.length;
  this.collaborators = this.collaborators.filter(
    (c) => c.user.toString() !== userId.toString()
  );
  return this.collaborators.length !== initialLength;
};

// Set toJSON and toObject options
CodeSessionSchema.set('toJSON', { virtuals: true });
CodeSessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CodeSession', CodeSessionSchema);
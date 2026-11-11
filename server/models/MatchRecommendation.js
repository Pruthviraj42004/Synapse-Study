const mongoose = require('mongoose');

/**
 * MatchRecommendation Schema
 * Stores AI-generated peer matching recommendations
 */
const matchRecommendationSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // AI-Generated Match Data
    compatibilityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    matchReasoning: {
        type: String,
        required: true
    },
    commonSubjects: [{
        type: String
    }],
    commonTopics: [{
        type: String
    }],
    complementaryStrengths: [{
        type: String
    }],
    // Match Status
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    },
    acceptedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    // Associated Study Room (if created)
    studyRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyRoom'
    },
    // Expiration
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
}, {
    timestamps: true
});

// Methods
matchRecommendationSchema.methods.accept = function () {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    return this.save();
};

matchRecommendationSchema.methods.reject = function () {
    this.status = 'rejected';
    this.rejectedAt = new Date();
    return this.save();
};

matchRecommendationSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

// Auto-expire old recommendations
matchRecommendationSchema.pre('save', function (next) {
    if (this.isExpired() && this.status === 'pending') {
        this.status = 'expired';
    }
    next();
});

// Indexes
matchRecommendationSchema.index({ requesterId: 1, status: 1 });
matchRecommendationSchema.index({ matchedUserId: 1 });
matchRecommendationSchema.index({ expiresAt: 1 });
matchRecommendationSchema.index({ compatibilityScore: -1 });

module.exports = mongoose.model('MatchRecommendation', matchRecommendationSchema);

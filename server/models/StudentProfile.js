const mongoose = require('mongoose');

/**
 * StudentProfile Schema
 * Stores student academic preferences and matching criteria for AI peer-matching
 */
const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Academic Information
    subjects: [{
        type: String,
        trim: true
    }],
    weakAreas: [{
        type: String,
        trim: true
    }],
    strengths: [{
        type: String,
        trim: true
    }],
    academicYear: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other'],
        required: true
    },
    department: {
        type: String,
        trim: true,
        required: true
    },
    // Current Focus
    currentTopics: [{
        type: String,
        trim: true
    }],
    studyGoals: {
        type: String,
        maxlength: [500, 'Study goals cannot exceed 500 characters'],
        trim: true
    },
    // Preferences
    preferredStudyTime: [{
        type: String,
        enum: ['Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-3 PM)', 'Evening (3-6 PM)', 'Night (6-9 PM)', 'Late Night (9 PM-12 AM)', 'Flexible']
    }],
    learningStyle: {
        type: String,
        enum: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic', 'Mixed'],
        default: 'Mixed'
    },
    collaborationPreference: {
        type: String,
        enum: ['Small Groups (2-3)', 'Medium Groups (4-6)', 'Large Groups (7+)', 'No Preference'],
        default: 'No Preference'
    },
    // Matching Settings
    openToMatching: {
        type: Boolean,
        default: true
    },
    maxMatchDistance: {
        type: String,
        enum: ['Same College Only', 'Same City', 'Same State', 'Anywhere'],
        default: 'Anywhere'
    },
    // Metadata
    profileCompleteness: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate profile completeness
studentProfileSchema.methods.calculateCompleteness = function () {
    let score = 0;
    const fields = [
        'subjects', 'weakAreas', 'strengths', 'academicYear',
        'department', 'currentTopics', 'studyGoals',
        'preferredStudyTime', 'learningStyle'
    ];

    fields.forEach(field => {
        if (Array.isArray(this[field])) {
            if (this[field].length > 0) score += (100 / fields.length);
        } else if (this[field]) {
            score += (100 / fields.length);
        }
    });

    this.profileCompleteness = Math.round(score);
    return this.profileCompleteness;
};

// Update lastUpdated timestamp
studentProfileSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    this.calculateCompleteness();
    next();
});

// Indexes for efficient querying
studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ subjects: 1 });
studentProfileSchema.index({ academicYear: 1, department: 1 });
studentProfileSchema.index({ openToMatching: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

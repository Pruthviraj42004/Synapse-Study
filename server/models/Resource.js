const mongoose = require('mongoose');

/**
 * Resource Schema
 * Stores study materials: notes, labs, PPTs, question papers
 * Integrated with vector DB for AI-powered search and Q&A
 */
const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    department: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['Notes', 'QuestionPaper', 'Lab', 'PPT', 'Reference', 'Other'],
        required: [true, 'Resource type is required']
    },
    // File information
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    fileSize: {
        type: Number // in bytes
    },
    fileType: {
        type: String, // PDF, DOC, PPT, etc.
    },
    // Metadata for search and filtering
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Analytics
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    // Vector DB integration for AI chatbot
    vectorEmbedded: {
        type: Boolean,
        default: false
    },
    vectorDocId: {
        type: String,
        default: null
    },
    embeddingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    // AI Analysis Results (Smart Resource Intelligence)
    aiAnalysis: {
        subject: String,
        main_topic: String,
        subtopics: [String],
        prerequisites: [String],
        summary: String,
        flashcards: [{
            q: String,
            a: String
        }],
        expected_questions: [String],
        concept_nodes: [String],
        probable_syllabus_mapping: {
            unit: String,
            chapter: String,
            why: String
        },
        difficulty: {
            type: Number,
            min: 1,
            max: 10
        },
        recommendations: [String],
        related_topics: [String],
        ideal_study_group_type: String,
        recommended_tools: [String],
        confidence_score: {
            type: Number,
            min: 0,
            max: 1
        },
        analyzedAt: Date,
        analysisStatus: {
            type: String,
            enum: ['not_started', 'analyzing', 'completed', 'failed'],
            default: 'not_started'
        },
        error: String
    },
    // Moderation
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approve for now, can add moderation later
    },
    rejectionReason: String
}, {
    timestamps: true
});

// Indexes for faster queries
resourceSchema.index({ subject: 1, semester: 1 });
resourceSchema.index({ type: 1, status: 1 });
resourceSchema.index({ uploader: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ title: 'text', description: 'text', subject: 'text' });

// Method to increment downloads
resourceSchema.methods.incrementDownloads = function () {
    this.downloads += 1;
    return this.save({ validateBeforeSave: false });
};

// Method to increment views
resourceSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save({ validateBeforeSave: false });
};

// Static method to get popular resources
resourceSchema.statics.getPopular = function (limit = 10) {
    return this.find({ status: 'approved' })
        .sort({ downloads: -1, views: -1 })
        .limit(limit)
        .populate('uploader', 'name avatar');
};

// Static method to get recent resources
resourceSchema.statics.getRecent = function (limit = 10) {
    return this.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('uploader', 'name avatar');
};

// Static method to search by semester and subject
resourceSchema.statics.findBySemesterAndSubject = function (semester, subject) {
    return this.find({
        semester,
        subject: new RegExp(subject, 'i'),
        status: 'approved'
    }).populate('uploader', 'name avatar');
};

module.exports = mongoose.model('Resource', resourceSchema);

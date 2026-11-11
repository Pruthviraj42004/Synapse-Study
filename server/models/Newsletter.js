const mongoose = require('mongoose');

/**
 * Newsletter Schema
 * Stores college newsletters and announcements
 * Admins can create/edit, students can view
 * Content is indexed in vector DB for AI chatbot queries
 */
const newsletterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Newsletter title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Newsletter content is required']
    },
    type: {
        type: String,
        enum: ['Newsletter', 'Announcement'],
        default: 'Announcement'
    },
    category: {
        type: String,
        enum: ['General', 'Department', 'Placement', 'Event', 'Academic'],
        default: 'General',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [{
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
            enum: ['PDF', 'Image', 'Link', 'Document'],
            required: true
        },
        size: Number // in bytes
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    // Vector DB integration fields
    vectorEmbedded: {
        type: Boolean,
        default: false
    },
    vectorDocId: {
        type: String,
        default: null
    },
    // For targeting specific audiences
    targetAudience: {
        department: [String], // Empty array means all departments
        semester: [Number],   // Empty array means all semesters
        batch: [String]       // Empty array means all batches
    }
}, {
    timestamps: true
});

// Index for faster queries
newsletterSchema.index({ status: 1, publishedAt: -1 });
newsletterSchema.index({ category: 1, status: 1 });
newsletterSchema.index({ isPinned: 1, publishedAt: -1 });
newsletterSchema.index({ title: 'text', description: 'text', content: 'text' });

// Auto-set publishedAt when status changes to published
newsletterSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Method to increment views
newsletterSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save({ validateBeforeSave: false });
};

// Static method to get recent announcements
newsletterSchema.statics.getRecentAnnouncements = function (limit = 5) {
    return this.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .populate('author', 'name email avatar')
        .select('title description category publishedAt type');
};

// Static method to get pinned items
newsletterSchema.statics.getPinned = function () {
    return this.find({ status: 'published', isPinned: true })
        .sort({ publishedAt: -1 })
        .populate('author', 'name email avatar');
};

module.exports = mongoose.model('Newsletter', newsletterSchema);

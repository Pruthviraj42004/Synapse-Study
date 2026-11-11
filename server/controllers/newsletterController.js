const Newsletter = require('../models/Newsletter');

/**
 * @desc    Create new newsletter/announcement
 * @route   POST /api/newsletters
 * @access  Admin only
 */
exports.createNewsletter = async (req, res) => {
    try {
        const {
            title,
            description,
            content,
            type,
            category,
            attachments,
            isPinned,
            status,
            targetAudience
        } = req.body;

        const newsletter = await Newsletter.create({
            title,
            description,
            content,
            type,
            category,
            author: req.user._id,
            attachments: attachments || [],
            isPinned: isPinned || false,
            status: status || 'draft',
            targetAudience: targetAudience || { department: [], semester: [], batch: [] }
        });

        // TODO: If status is 'published', trigger vector DB embedding
        // await vectorService.embedNewsletter(newsletter);

        await newsletter.populate('author', 'name email avatar');

        res.status(201).json({
            success: true,
            message: 'Newsletter created successfully',
            data: newsletter
        });
    } catch (error) {
        console.error('Error creating newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create newsletter',
            error: error.message
        });
    }
};

/**
 * @desc    Get all newsletters with filtering, pagination, and search
 * @route   GET /api/newsletters
 * @access  Public (students can view published ones)
 */
exports.getAllNewsletters = async (req, res) => {
    try {
        const {
            category,
            type,
            status,
            search,
            page = 1,
            limit = 10,
            sort = '-publishedAt'
        } = req.query;

        // Build query
        const query = {};

        // Non-admin users can only see published newsletters
        if (req.user?.role !== 'admin') {
            query.status = 'published';
        } else if (status) {
            query.status = status;
        }

        if (category) query.category = category;
        if (type) query.type = type;

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const newsletters = await Newsletter.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'name email avatar')
            .select('-content'); // Don't send full content in list view

        const total = await Newsletter.countDocuments(query);

        res.status(200).json({
            success: true,
            count: newsletters.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: newsletters
        });
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newsletters',
            error: error.message
        });
    }
};

/**
 * @desc    Get single newsletter by ID
 * @route   GET /api/newsletters/:id
 * @access  Public (for published) / Admin (for all)
 */
exports.getNewsletterById = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id)
            .populate('author', 'name email avatar role');

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // Check if user can access this newsletter
        if (newsletter.status !== 'published' && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'This newsletter is not published yet'
            });
        }

        // Increment views (don't await to respond faster)
        newsletter.incrementViews().catch(err => console.error('Error incrementing views:', err));

        res.status(200).json({
            success: true,
            data: newsletter
        });
    } catch (error) {
        console.error('Error fetching newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newsletter',
            error: error.message
        });
    }
};

/**
 * @desc    Update newsletter
 * @route   PUT /api/newsletters/:id
 * @access  Admin only
 */
exports.updateNewsletter = async (req, res) => {
    try {
        const {
            title,
            description,
            content,
            type,
            category,
            attachments,
            isPinned,
            status,
            targetAudience
        } = req.body;

        let newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // Update fields
        if (title) newsletter.title = title;
        if (description) newsletter.description = description;
        if (content) newsletter.content = content;
        if (type) newsletter.type = type;
        if (category) newsletter.category = category;
        if (attachments) newsletter.attachments = attachments;
        if (typeof isPinned !== 'undefined') newsletter.isPinned = isPinned;
        if (targetAudience) newsletter.targetAudience = targetAudience;

        // Handle status change
        const statusChanged = status && status !== newsletter.status;
        if (status) newsletter.status = status;

        await newsletter.save();
        await newsletter.populate('author', 'name email avatar');

        // TODO: If status changed to 'published', trigger vector DB embedding
        // if (statusChanged && status === 'published') {
        //   await vectorService.embedNewsletter(newsletter);
        // }

        res.status(200).json({
            success: true,
            message: 'Newsletter updated successfully',
            data: newsletter
        });
    } catch (error) {
        console.error('Error updating newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update newsletter',
            error: error.message
        });
    }
};

/**
 * @desc    Delete newsletter
 * @route   DELETE /api/newsletters/:id
 * @access  Admin only
 */
exports.deleteNewsletter = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // TODO: Remove from vector DB if it was embedded
        // if (newsletter.vectorEmbedded && newsletter.vectorDocId) {
        //   await vectorService.deleteDocument(newsletter.vectorDocId);
        // }

        await newsletter.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Newsletter deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete newsletter',
            error: error.message
        });
    }
};

/**
 * @desc    Get recent announcements for dashboard widget
 * @route   GET /api/newsletters/recent
 * @access  Public
 */
exports.getRecentAnnouncements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const announcements = await Newsletter.getRecentAnnouncements(limit);

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        console.error('Error fetching recent announcements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent announcements',
            error: error.message
        });
    }
};

/**
 * @desc    Get pinned newsletters/announcements
 * @route   GET /api/newsletters/pinned
 * @access  Public
 */
exports.getPinnedNewsletters = async (req, res) => {
    try {
        const pinned = await Newsletter.getPinned();

        res.status(200).json({
            success: true,
            count: pinned.length,
            data: pinned
        });
    } catch (error) {
        console.error('Error fetching pinned newsletters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pinned newsletters',
            error: error.message
        });
    }
};

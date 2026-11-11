const Resource = require('../models/Resource');
const vectorService = require('../services/vectorService');
const { analyzeResource } = require('../services/resourceAnalysisService');

/**
 * @desc    Upload new resource
 * @route   POST /api/resources
 * @access  Private (authenticated users)
 */
exports.uploadResource = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            semester,
            department,
            type,
            fileUrl,
            fileName,
            fileSize,
            fileType,
            tags
        } = req.body;

        const resource = await Resource.create({
            title,
            description,
            subject,
            semester,
            department,
            type,
            fileUrl,
            fileName,
            fileSize,
            fileType,
            tags: tags || [],
            uploader: req.user._id
        });

        await resource.populate('uploader', 'name email avatar');

        // TODO: Trigger async vector DB embedding
        // Queue this for background processing
        // processResourceEmbedding(resource._id);

        res.status(201).json({
            success: true,
            message: 'Resource uploaded successfully',
            data: resource
        });
    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload resource',
            error: error.message
        });
    }
};

/**
 * @desc    Get all resources with filtering and pagination
 * @route   GET /api/resources
 * @access  Private
 */
exports.getAllResources = async (req, res) => {
    try {
        const {
            subject,
            semester,
            department,
            type,
            search,
            tags,
            page = 1,
            limit = 12,
            sort = '-createdAt'
        } = req.query;

        // Build query
        const query = { status: 'approved' };

        if (subject) query.subject = new RegExp(subject, 'i');
        if (semester) query.semester = parseInt(semester);
        if (department) query.department = new RegExp(department, 'i');
        if (type) query.type = type;
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const resources = await Resource.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('uploader', 'name avatar');

        const total = await Resource.countDocuments(query);

        res.status(200).json({
            success: true,
            count: resources.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: resources
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources',
            error: error.message
        });
    }
};

/**
 * @desc    Get single resource by ID
 * @route   GET /api/resources/:id
 * @access  Private
 */
exports.getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id)
            .populate('uploader', 'name email avatar');

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }

        // Increment view count
        resource.views += 1;
        await resource.save();

        res.json({
            success: true,
            resource: resource  // Changed from 'data' to 'resource'
        });
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get resource'
        });
    }
};

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private (owner or admin)
 */
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Check if user is owner or admin
        if (resource.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this resource'
            });
        }

        // Delete from vector DB if embedded
        if (resource.vectorEmbedded && resource.vectorDocId) {
            try {
                await vectorService.deleteDocument(resource.vectorDocId);
            } catch (err) {
                console.error('Error deleting from vector DB:', err);
            }
        }

        await resource.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resource',
            error: error.message
        });
    }
};

/**
 * @desc    Track resource download
 * @route   POST /api/resources/:id/download
 * @access  Private
 */
exports.trackDownload = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        await resource.incrementDownloads();

        res.status(200).json({
            success: true,
            message: 'Download tracked',
            fileUrl: resource.fileUrl
        });
    } catch (error) {
        console.error('Error tracking download:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track download',
            error: error.message
        });
    }
};

/**
 * @desc    Get popular resources
 * @route   GET /api/resources/popular
 * @access  Private
 */
exports.getPopularResources = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const resources = await Resource.getPopular(limit);

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error('Error fetching popular resources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular resources',
            error: error.message
        });
    }
};

/**
 * @desc    Get recent resources
 * @route   GET /api/resources/recent
 * @access  Private
 */
exports.getRecentResources = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const resources = await Resource.getRecent(limit);

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error('Error fetching recent resources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent resources',
            error: error.message
        });
    }
};

/**
 * @desc    Get user's uploaded resources
 * @route   GET /api/resources/my-uploads
 * @access  Private
 */
exports.getMyResources = async (req, res) => {
    try {
        const resources = await Resource.find({ uploader: req.user._id })
            .sort({ createdAt: -1 })
            .populate('uploader', 'name avatar');

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error('Error fetching user resources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your resources',
            error: error.message
        });
    }
};

/**
 * @desc    Analyze resource with AI
 * @route   POST /api/resources/:id/analyze
 * @access  Private
 */
exports.analyzeResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find resource
        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Check if already analyzed
        if (resource.aiAnalysis?.analysisStatus === 'completed') {
            return res.status(200).json({
                success: true,
                message: 'Resource already analyzed',
                data: resource.aiAnalysis
            });
        }

        // Check if analysis is in progress
        if (resource.aiAnalysis?.analysisStatus === 'analyzing') {
            return res.status(202).json({
                success: false,
                message: 'Analysis already in progress'
            });
        }

        // Update status to analyzing
        resource.aiAnalysis = resource.aiAnalysis || {};
        resource.aiAnalysis.analysisStatus = 'analyzing';
        await resource.save();

        // Perform analysis (async)
        analyzeResource(resource)
            .then(async (analysis) => {
                // Update resource with analysis results
                resource.aiAnalysis = {
                    ...analysis,
                    analysisStatus: 'completed'
                };
                await resource.save();
                console.log(`✅ Analysis completed for resource: ${resource.title}`);
            })
            .catch(async (error) => {
                // Update status to failed
                resource.aiAnalysis.analysisStatus = 'failed';
                resource.aiAnalysis.error = error.message;
                await resource.save();
                console.error(`❌ Analysis failed for resource: ${resource.title}`, error);
            });

        // Return immediately with accepted status
        res.status(202).json({
            success: true,
            message: 'Analysis started. Check back in a moment.',
            data: {
                resourceId: resource._id,
                status: 'analyzing'
            }
        });

    } catch (error) {
        console.error('Error analyzing resource:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start analysis',
            error: error.message
        });
    }
};

/**
 * @desc    Get resource AI insights
 * @route   GET /api/resources/:id/insights
 * @access  Private
 */
exports.getResourceInsights = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id)
            .select('title subject type aiAnalysis')
            .lean();

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Check if analysis exists
        if (!resource.aiAnalysis || resource.aiAnalysis.analysisStatus === 'not_started') {
            return res.status(404).json({
                success: false,
                message: 'No analysis available. Please analyze the resource first.',
                data: {
                    status: 'not_started'
                }
            });
        }

        // Check if analysis is in progress
        if (resource.aiAnalysis.analysisStatus === 'analyzing') {
            return res.status(202).json({
                success: false,
                message: 'Analysis in progress. Please check back shortly.',
                data: {
                    status: 'analyzing'
                }
            });
        }

        // Check if analysis failed
        if (resource.aiAnalysis.analysisStatus === 'failed') {
            return res.status(500).json({
                success: false,
                message: 'Analysis failed',
                data: {
                    status: 'failed',
                    error: resource.aiAnalysis.error
                }
            });
        }

        // Return successful analysis
        res.status(200).json({
            success: true,
            data: {
                resourceInfo: {
                    id: resource._id,
                    title: resource.title,
                    subject: resource.subject,
                    type: resource.type
                },
                insights: resource.aiAnalysis
            }
        });

    } catch (error) {
        console.error('Error fetching resource insights:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch insights',
            error: error.message
        });
    }
};

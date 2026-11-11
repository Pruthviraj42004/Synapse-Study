const documentAnalysisService = require('../services/analysis/documentAnalysisService');
const Resource = require('../models/Resource');

/**
 * @desc    Analyze a document with AI
 * @route   POST /api/analysis/:resourceId/analyze
 * @access  Private
 */
exports.analyzeDocument = async (req, res) => {
    try {
        const { resourceId } = req.params;

        // Check if resource exists and user has access
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Check if already analyzing
        if (resource.aiAnalysis && resource.aiAnalysis.analysisStatus === 'analyzing') {
            return res.status(400).json({
                success: false,
                message: 'Analysis already in progress'
            });
        }

        // Start analysis (async - don't wait)
        documentAnalysisService.analyzeDocument(resourceId)
            .then(() => console.log(`Analysis completed for resource ${resourceId}`))
            .catch(err => console.error(`Analysis failed for resource ${resourceId}:`, err));

        res.status(202).json({
            success: true,
            message: 'Analysis started. This may take 10-30 seconds.',
            data: {
                resourceId,
                status: 'analyzing'
            }
        });
    } catch (error) {
        console.error('Analyze document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start analysis',
            error: error.message
        });
    }
};

/**
 * @desc    Get analysis results (insights)
 * @route   GET /api/analysis/:resourceId/insights
 * @access  Private
 */
exports.getInsights = async (req, res) => {
    try {
        const { resourceId } = req.params;

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        if (!resource.aiAnalysis || resource.aiAnalysis.analysisStatus === 'not_started') {
            return res.status(404).json({
                success: false,
                message: 'No analysis found. Please analyze the document first.'
            });
        }

        res.status(200).json({
            success: true,
            data: resource.aiAnalysis
        });
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get insights',
            error: error.message
        });
    }
};

/**
 * @desc    Regenerate analysis or specific sections
 * @route   POST /api/analysis/:resourceId/regenerate
 * @access  Private
 */
exports.regenerateAnalysis = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const { section } = req.body; // 'flashcards', 'all', etc.

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        if (section === 'flashcards') {
            const analysis = await documentAnalysisService.regenerateFlashcards(resourceId);

            return res.status(200).json({
                success: true,
                message: 'Flashcards regenerated successfully',
                data: analysis
            });
        } else {
            // Regenerate entire analysis
            documentAnalysisService.analyzeDocument(resourceId)
                .then(() => console.log(`Re-analysis completed for resource ${resourceId}`))
                .catch(err => console.error(`Re-analysis failed for resource ${resourceId}:`, err));

            return res.status(202).json({
                success: true,
                message: 'Re-analysis started. This may take 10-30 seconds.'
            });
        }
    } catch (error) {
        console.error('Regenerate analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate analysis',
            error: error.message
        });
    }
};

/**
 * @desc    Check analysis status
 * @route   GET /api/analysis/:resourceId/status
 * @access  Private
 */
exports.getAnalysisStatus = async (req, res) => {
    try {
        const { resourceId } = req.params;

        const resource = await Resource.findById(resourceId).select('aiAnalysis');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        const status = resource.aiAnalysis
            ? resource.aiAnalysis.analysisStatus
            : 'not_started';

        res.status(200).json({
            success: true,
            data: {
                status,
                hasAnalysis: status === 'completed',
                error: resource.aiAnalysis?.error || null
            }
        });
    } catch (error) {
        console.error('Get analysis status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analysis status',
            error: error.message
        });
    }
};

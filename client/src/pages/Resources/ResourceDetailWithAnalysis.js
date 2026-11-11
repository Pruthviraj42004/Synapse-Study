import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Psychology as AIIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import resourceService from '../../services/resourceService';
import analysisService from '../../services/analysisService';
import ResourceInsights from '../../components/Resources/ResourceInsights';

const ResourceDetailWithAnalysis = () => {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        loadResource();
        loadAnalysis();
    }, [id]);

    const loadResource = async () => {
        try {
            setLoading(true);
            const response = await resourceService.getResourceById(id);
            setResource(response.resource);
        } catch (error) {
            console.error('Error loading resource:', error);
            toast.error('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalysis = async () => {
        try {
            const response = await analysisService.getInsights(id);
            if (response.data) {
                setAnalysis(response.data);
            }
        } catch (error) {
            // Analysis not found - that's okay
            if (error.response?.status !== 404) {
                console.error('Error loading analysis:', error);
            }
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            await analysisService.analyzeDocument(id);
            toast.success('Analysis started! This may take 10-30 seconds.');

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const statusResponse = await analysisService.getAnalysisStatus(id);

                    if (statusResponse.data.status === 'completed') {
                        clearInterval(pollInterval);
                        const insightsResponse = await analysisService.getInsights(id);
                        setAnalysis(insightsResponse.data);
                        toast.success('Analysis completed!');
                        setAnalyzing(false);
                        setActiveTab(1); // Switch to insights tab
                    } else if (statusResponse.data.status === 'failed') {
                        clearInterval(pollInterval);
                        toast.error('Analysis failed. Please try again.');
                        setAnalyzing(false);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 3000); // Poll every 3 seconds

            // Stop polling after 2 minutes
            setTimeout(() => {
                clearInterval(pollInterval);
                if (analyzing) {
                    setAnalyzing(false);
                    toast.error('Analysis timed out. Please try again.');
                }
            }, 120000);
        } catch (error) {
            console.error('Error starting analysis:', error);
            toast.error('Failed to start analysis');
            setAnalyzing(false);
        }
    };

    const handleRegenerate = async (section) => {
        try {
            toast.loading(`Regenerating ${section}...`);
            await analysisService.regenerateAnalysis(id, section);

            // Wait a bit then reload
            setTimeout(async () => {
                const response = await analysisService.getInsights(id);
                setAnalysis(response.data);
                toast.dismiss();
                toast.success(`${section} regenerated!`);
            }, 5000);
        } catch (error) {
            console.error('Error regenerating:', error);
            toast.error('Failed to regenerate');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!resource) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Resource not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {resource.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip label={resource.subject} color="primary" />
                            <Chip label={resource.type} variant="outlined" />
                            {resource.semester && <Chip label={`Sem ${resource.semester}`} variant="outlined" />}
                        </Box>
                        {resource.description && (
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {resource.description}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        href={resource.fileUrl}
                        target="_blank"
                    >
                        Download
                    </Button>
                </Box>

                {/* Metadata */}
                <Typography variant="caption" color="text.secondary">
                    Uploaded by {resource.uploader?.name} • {new Date(resource.createdAt).toLocaleDateString()}
                    • {resource.views} views • {resource.downloads} downloads
                </Typography>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Details" />
                    <Tab
                        label="AI Insights"
                        icon={analysis ? <AIIcon color="success" /> : <AIIcon />}
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {/* Content */}
            {activeTab === 0 ? (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        File Information
                    </Typography>
                    <Typography variant="body2" paragraph>
                        <strong>File Name:</strong> {resource.fileName}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        <strong>File Size:</strong> {(resource.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Typography variant="body2" paragraph>
                        <strong>File Type:</strong> {resource.fileType}
                    </Typography>

                    {resource.tags && resource.tags.length > 0 && (
                        <>
                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                Tags
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {resource.tags.map((tag, index) => (
                                    <Chip key={index} label={tag} size="small" />
                                ))}
                            </Box>
                        </>
                    )}
                </Paper>
            ) : (
                <Box>
                    {!analysis && !analyzing ? (
                        <Paper sx={{ p: 6, textAlign: 'center' }}>
                            <AIIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                AI Analysis Not Available
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Get AI-powered insights including flashcards, exam questions, summaries, and study recommendations
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AIIcon />}
                                onClick={handleAnalyze}
                                color="secondary"
                            >
                                Analyze with AI
                            </Button>
                        </Paper>
                    ) : analyzing ? (
                        <Paper sx={{ p: 6, textAlign: 'center' }}>
                            <CircularProgress size={60} sx={{ mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Analyzing Document...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This may take 10-30 seconds. We're extracting text and generating insights.
                            </Typography>
                        </Paper>
                    ) : (
                        <ResourceInsights
                            analysis={analysis}
                            onRegenerate={handleRegenerate}
                            loading={analyzing}
                        />
                    )}
                </Box>
            )}
        </Container>
    );
};

export default ResourceDetailWithAnalysis;

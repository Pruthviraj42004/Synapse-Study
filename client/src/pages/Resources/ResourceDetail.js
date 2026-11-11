import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Person as PersonIcon,
    CalendarToday as DateIcon,
    Folder as FolderIcon,
    School as SchoolIcon,
    Label as TagIcon,
    SmartToy as AIIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ResourceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResource();
    }, [id]);

    const fetchResource = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getResourceById(id);
            setResource(data.resource);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load resource');
            toast.error('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            await resourceService.trackDownload(resource._id);

            const filename = resource.fileUrl.split('/').pop();
            const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${filename}`;
            window.open(fileUrl, '_blank');

            toast.success('Download started!');

            // Update download count locally
            setResource(prev => ({ ...prev, downloads: prev.downloads + 1 }));
        } catch (error) {
            toast.error('Failed to download file');
            console.error('Download error:', error);
        }
    };

    const handleAskAI = async () => {
        try {
            toast.loading('Loading document content...', { id: 'loading-doc' });

            // Fetch document content
            const response = await fetch(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/resources/${resource._id}/content`);
            const data = await response.json();

            toast.dismiss('loading-doc');

            if (!data.success) {
                toast.error('Could not extract document content');
                return;
            }

            // Prepare context with document content
            const contextMessage = `I'm asking about this study resource:

**Title:** ${resource.title}
**Subject:** ${resource.subject}
**Description:** ${resource.description || 'No description'}

**Document Content (excerpt):**
${data.content}

Now, my question is:`;

            // Open chatbot with document context
            const event = new CustomEvent('openChatbot', {
                detail: {
                    context: {
                        type: 'resource',
                        resourceId: resource._id,
                        resourceTitle: resource.title,
                        resourceSubject: resource.subject,
                        documentContent: data.content
                    },
                    initialMessage: contextMessage
                }
            });
            window.dispatchEvent(event);

            toast.success('Opening AI chatbot with document content...', { icon: '🤖' });
        } catch (error) {
            toast.error('Failed to load document content');
            console.error('Error:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const getTypeColor = (type) => {
        const colors = {
            'Notes': 'primary',
            'QuestionPaper': 'secondary',
            'Lab': 'success',
            'PPT': 'warning',
            'Reference': 'info',
            'Other': 'default'
        };
        return colors[type] || 'default';
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !resource) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Resource not found'}
                </Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/resources')}>
                    Back to Resources
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Back Button */}
            <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/resources')}
                sx={{ mb: 3 }}
            >
                Back to Resources
            </Button>

            {/* Resource Header */}
            <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {resource.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip
                                label={resource.type}
                                color={getTypeColor(resource.type)}
                                size="small"
                            />
                            {resource.status && (
                                <Chip
                                    label={resource.status}
                                    color={resource.status === 'approved' ? 'success' : 'warning'}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Description */}
                {resource.description && (
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {resource.description}
                    </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Metadata */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Subject & Semester */}
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {resource.subject && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FolderIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    <strong>Subject:</strong> {resource.subject}
                                </Typography>
                            </Box>
                        )}
                        {resource.semester && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    <strong>Semester:</strong> {resource.semester}
                                </Typography>
                            </Box>
                        )}
                        {resource.department && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    <strong>Department:</strong> {resource.department}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Uploader & Date */}
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                                <strong>Uploaded by:</strong> {resource.uploader?.name || 'Unknown'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DateIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                                <strong>Uploaded:</strong>{' '}
                                {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                            </Typography>
                        </Box>
                    </Box>

                    {/* File Info */}
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Typography variant="body2">
                            <strong>File:</strong> {resource.fileName}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Size:</strong> {formatFileSize(resource.fileSize)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Downloads:</strong> {resource.downloads || 0}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Views:</strong> {resource.views || 0}
                        </Typography>
                    </Box>

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TagIcon fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight="bold">Tags:</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {resource.tags.map((tag, idx) => (
                                    <Chip key={idx} label={tag} size="small" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        size="large"
                    >
                        Download
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<AIIcon />}
                        onClick={handleAskAI}
                        size="large"
                    >
                        Ask AI
                    </Button>
                </Box>
            </Paper>

            {/* Additional Info */}
            <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    About this Resource
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    This study resource has been uploaded by a fellow student to help the community.
                    Please use it responsibly and respect intellectual property rights.
                </Typography>
                {resource.status === 'pending' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        This resource is pending approval by administrators.
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default ResourceDetail;

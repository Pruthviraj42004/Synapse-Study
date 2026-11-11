import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Pagination,
    CircularProgress,
    InputAdornment,
    Alert,
    IconButton,
    Fab
} from '@mui/material';
import {
    Search as SearchIcon,
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    Visibility as ViewsIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Description as FileIcon,
    Chat as AskAIIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';

const Resources = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filters, setFilters] = useState({
        subject: '',
        semester: '',
        type: '',
        search: ''
    });

    const resourceTypes = ['Notes', 'QuestionPaper', 'Lab', 'PPT', 'Reference', 'Other'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        loadResources();
    }, [page, filters]);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await resourceService.getAllResources({
                ...filters,
                page,
                limit: 12
            });
            setResources(response.data);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError(err.message || 'Failed to load resources');
            console.error('Error loading resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1);
            loadResources();
        }
    };

    const handleDownload = async (resource) => {
        try {
            // Track download
            await resourceService.trackDownload(resource._id);

            // Extract filename from fileUrl (e.g., /uploads/filename.pdf -> filename.pdf)
            const filename = resource.fileUrl.split('/').pop();

            // Open file in new tab using the server URL
            const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${filename}`;
            window.open(fileUrl, '_blank');

            toast.success('Download started!');
        } catch (error) {
            toast.error('Failed to download file');
            console.error('Download error:', error);
        }
    };

    const handleDelete = async (resource) => {
        if (!window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
            return;
        }

        try {
            await resourceService.deleteResource(resource._id);
            toast.success('Resource deleted successfully');
            loadResources(); // Reload the list
        } catch (error) {
            toast.error(error.message || 'Failed to delete resource');
            console.error('Delete error:', error);
        }
    };

    const handleAskAI = async (resource) => {
        try {
            toast.loading('Loading document content...', { id: 'loading-doc' });

            // Fetch document content from server
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/resources/${resource._id}/content`);
            const data = await response.json();

            toast.dismiss('loading-doc');

            if (!data.success) {
                // Show specific error message
                toast.error(data.error || 'Could not extract document content', {
                    duration: 6000
                });
                return;
            }

            // Trigger chatbot with document content stored in context
            const event = new CustomEvent('openChatbot', {
                detail: {
                    context: {
                        type: 'resource',
                        resourceId: resource._id,
                        resourceTitle: resource.title,
                        resourceSubject: resource.subject,
                        documentContent: data.content // Store document content in context
                    }
                }
            });
            window.dispatchEvent(event);

            toast.success('AI ready to answer questions about this document!', { icon: '🤖' });
        } catch (error) {
            toast.error('Failed to load document content');
            console.error('Error fetching content:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(2)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    const getTypeColor = (type) => {
        const colors = {
            Notes: 'primary',
            QuestionPaper: 'success',
            Lab: 'info',
            PPT: 'warning',
            Reference: 'secondary',
            Other: 'default'
        };
        return colors[type] || 'default';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Study Resources & Notes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Access study materials uploaded by students and faculty
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => navigate('/resources/upload')}
                >
                    Upload Resource
                </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Search resources..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            onKeyPress={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            label="Subject"
                            value={filters.subject}
                            onChange={(e) => handleFilterChange('subject', e.target.value)}
                            placeholder="e.g., Mathematics"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Semester</InputLabel>
                            <Select
                                value={filters.semester}
                                label="Semester"
                                onChange={(e) => handleFilterChange('semester', e.target.value)}
                            >
                                <MenuItem value="">All Semesters</MenuItem>
                                {semesters.map((sem) => (
                                    <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.type}
                                label="Type"
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <MenuItem value="">All Types</MenuItem>
                                {resourceTypes.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : resources.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No resources found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Try adjusting your filters or be the first to upload!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => navigate('/resources/upload')}
                    >
                        Upload Resource
                    </Button>
                </Box>
            ) : (
                <>
                    {/* Resources Grid */}
                    <Grid container spacing={3}>
                        {resources.map((resource) => (
                            <Grid item xs={12} sm={6} md={4} key={resource._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip
                                                label={resource.type}
                                                size="small"
                                                color={getTypeColor(resource.type)}
                                            />
                                            {resource.semester && (
                                                <Chip
                                                    label={`Sem ${resource.semester}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                            {resource.title}
                                        </Typography>

                                        <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 500 }}>
                                            {resource.subject}
                                        </Typography>

                                        {resource.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {resource.description}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <DownloadIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {resource.downloads}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ViewsIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {resource.views}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PersonIcon fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary">
                                                {resource.uploader?.name || 'Anonymous'}
                                            </Typography>
                                        </Box>

                                        {resource.tags && resource.tags.length > 0 && (
                                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {resource.tags.slice(0, 3).map((tag, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={tag}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/resources/${resource._id}`)}
                                        >
                                            View Details
                                        </Button>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleAskAI(resource)}
                                                title="Ask AI about this resource"
                                            >
                                                <AskAIIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleDownload(resource)}
                                                title="Download"
                                            >
                                                <DownloadIcon fontSize="small" />
                                            </IconButton>
                                            {user && resource.uploader?._id === user.id && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(resource)}
                                                    title="Delete"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Floating Upload Button (mobile) */}
            <Fab
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', md: 'none' }
                }}
                onClick={() => navigate('/resources/upload')}
            >
                <UploadIcon />
            </Fab>
        </Container>
    );
};

export default Resources;

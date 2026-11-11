import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
    Breadcrumbs,
    Link as MuiLink,
} from '@mui/material';
import {
    Announcement as AnnouncementIcon,
    Send as SendIcon,
    ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import newsletterService from '../../services/newsletterService';

const CreateNewsletter = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: 'General',
        type: 'Announcement',
        isPinned: false,
        department: '',
    });

    const categories = ['General', 'Department', 'Placement', 'Event', 'Academic'];
    const types = ['Newsletter', 'Announcement'];

    const handleChange = (field) => (event) => {
        const value = field === 'isPinned' ? event.target.checked : event.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await newsletterService.createNewsletter({
                ...formData,
                status: 'published', // Published immediately so students can see it
                publishedAt: new Date().toISOString(),
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/newsletters');
            }, 1500);
        } catch (err) {
            console.error('Error creating newsletter:', err);
            setError(err.message || 'Failed to create newsletter. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Check if user is authorized (teacher or admin)
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    You don't have permission to create newsletters. Only teachers and admins can post newsletters.
                </Alert>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/newsletters')}
                    sx={{ mt: 2 }}
                >
                    Back to Newsletters
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <MuiLink component={Link} to="/newsletters" color="inherit" underline="hover">
                    Newsletters
                </MuiLink>
                <Typography color="text.primary">Create New</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AnnouncementIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Create Newsletter
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Post a new announcement or newsletter for students
                    </Typography>
                </Box>
            </Box>

            {/* Success Message */}
            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Newsletter created successfully! Redirecting...
                </Alert>
            )}

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Form */}
            <Paper sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Title */}
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={handleChange('title')}
                            required
                            fullWidth
                            placeholder="Enter newsletter title..."
                        />

                        {/* Description */}
                        <TextField
                            label="Short Description"
                            value={formData.description}
                            onChange={handleChange('description')}
                            fullWidth
                            placeholder="Brief description (shown in preview)..."
                            multiline
                            rows={2}
                        />

                        {/* Content */}
                        <TextField
                            label="Content"
                            value={formData.content}
                            onChange={handleChange('content')}
                            required
                            fullWidth
                            multiline
                            rows={8}
                            placeholder="Write your newsletter content here..."
                        />

                        {/* Category and Type */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Category"
                                    onChange={handleChange('category')}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Type"
                                    onChange={handleChange('type')}
                                >
                                    {types.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Department (optional) */}
                        {formData.category === 'Department' && (
                            <TextField
                                label="Department"
                                value={formData.department}
                                onChange={handleChange('department')}
                                fullWidth
                                placeholder="e.g., Computer Science, Electronics..."
                            />
                        )}

                        {/* Pinned Toggle */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isPinned}
                                    onChange={handleChange('isPinned')}
                                    color="warning"
                                />
                            }
                            label="Pin this newsletter (appears at top)"
                        />

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/newsletters')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                disabled={loading || success}
                                sx={{
                                    background: 'linear-gradient(45deg, #9c27b0 30%, #1976d2 90%)',
                                }}
                            >
                                {loading ? 'Publishing...' : 'Publish Newsletter'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateNewsletter;

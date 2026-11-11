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
    IconButton,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Announcement as AnnouncementIcon,
    TrendingUp as PinnedIcon,
    CalendarToday as DateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import newsletterService from '../../services/newsletterService';

const Newsletters = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        search: ''
    });

    const categories = ['General', 'Department', 'Placement', 'Event', 'Academic'];
    const types = ['Newsletter', 'Announcement'];

    useEffect(() => {
        loadNewsletters();
    }, [page, filters]);

    const loadNewsletters = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await newsletterService.getAllNewsletters({
                ...filters,
                page,
                limit: 12
            });
            setNewsletters(response.data);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError(err.message || 'Failed to load newsletters');
            console.error('Error loading newsletters:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Reset to first page when filter changes
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1);
            loadNewsletters();
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            General: 'default',
            Department: 'primary',
            Placement: 'success',
            Event: 'secondary',
            Academic: 'info'
        };
        return colors[category] || 'default';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        College News & Announcements
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Stay updated with the latest college news, events, and announcements
                    </Typography>
                </Box>
                {user?.role === 'admin' && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/admin/newsletters')}
                    >
                        Manage Newsletters
                    </Button>
                )}
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search newsletters..."
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
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filters.category}
                                label="Category"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.type}
                                label="Type"
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <MenuItem value="">All Types</MenuItem>
                                {types.map((type) => (
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
            ) : newsletters.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <AnnouncementIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No newsletters found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Newsletters Grid */}
                    <Grid container spacing={3}>
                        {newsletters.map((newsletter) => (
                            <Grid item xs={12} sm={6} md={4} key={newsletter._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                    onClick={() => navigate(`/newsletters/${newsletter._id}`)}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip
                                                label={newsletter.category}
                                                size="small"
                                                color={getCategoryColor(newsletter.category)}
                                            />
                                            <Chip
                                                label={newsletter.type}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {newsletter.isPinned && (
                                                <Chip
                                                    icon={<PinnedIcon />}
                                                    label="Pinned"
                                                    size="small"
                                                    color="warning"
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                            {newsletter.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {newsletter.description}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DateIcon fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(newsletter.publishedAt)}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions>
                                        <Button size="small" color="primary">
                                            Read More
                                        </Button>
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
        </Container>
    );
};

export default Newsletters;

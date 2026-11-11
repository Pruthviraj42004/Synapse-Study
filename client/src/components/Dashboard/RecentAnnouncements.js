import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Chip,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import {
    Announcement as AnnouncementIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import newsletterService from '../../services/newsletterService';

/**
 * Recent Announcements Widget
 * Displays latest 5 announcements on dashboard
 */
const RecentAnnouncements = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await newsletterService.getRecentAnnouncements(5);
            setAnnouncements(response.data);
        } catch (err) {
            setError('Failed to load announcements');
            console.error('Error loading announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        const now = new Date();
        const announcementDate = new Date(date);
        const diffTime = Math.abs(now - announcementDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return announcementDate.toLocaleDateString('en-US', {
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
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnnouncementIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                        Recent Announcements
                    </Typography>
                </Box>
                <Button
                    size="small"
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate('/newsletters')}
                >
                    View All
                </Button>
            </Box>

            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : announcements.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        No recent announcements
                    </Typography>
                </Box>
            ) : (
                <List disablePadding>
                    {announcements.map((announcement, index) => (
                        <ListItem
                            key={announcement._id}
                            disablePadding
                            divider={index < announcements.length - 1}
                        >
                            <ListItemButton
                                onClick={() => navigate(`/newsletters/${announcement._id}`)}
                                sx={{ py: 1.5 }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    flex: '1 1 auto'
                                                }}
                                            >
                                                {announcement.title}
                                            </Typography>
                                            <Chip
                                                label={announcement.category}
                                                size="small"
                                                color={getCategoryColor(announcement.category)}
                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    flex: 1
                                                }}
                                            >
                                                {announcement.description}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 1, flexShrink: 0 }}
                                            >
                                                {formatDate(announcement.publishedAt)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default RecentAnnouncements;

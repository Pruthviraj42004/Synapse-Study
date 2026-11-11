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
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    CalendarToday as DateIcon,
    Person as AuthorIcon,
    Attachment as AttachmentIcon,
    Download as DownloadIcon,
    Visibility as ViewsIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import newsletterService from '../../services/newsletterService';

const NewsletterDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [newsletter, setNewsletter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadNewsletter();
    }, [id]);

    const loadNewsletter = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await newsletterService.getNewsletterById(id);
            setNewsletter(response.data);
        } catch (err) {
            setError(err.message || 'Failed to load newsletter');
            console.error('Error loading newsletter:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const getFileIcon = (type) => {
        return <AttachmentIcon />;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !newsletter) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Newsletter not found'}
                </Alert>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/newsletters')}
                >
                    Back to Newsletters
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Back Button */}
            <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/newsletters')}
                sx={{ mb: 3 }}
            >
                Back to Newsletters
            </Button>

            {/* Newsletter Content */}
            <Paper elevation={2} sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={newsletter.category}
                            color={getCategoryColor(newsletter.category)}
                        />
                        <Chip
                            label={newsletter.type}
                            variant="outlined"
                        />
                    </Box>

                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {newsletter.title}
                    </Typography>

                    <Typography variant="h6" color="text.secondary" paragraph>
                        {newsletter.description}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Metadata */}
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AuthorIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                            By {newsletter.author?.name || 'Admin'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(newsletter.publishedAt)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ViewsIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {newsletter.views} views
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Content */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.8
                        }}
                    >
                        {newsletter.content}
                    </Typography>
                </Box>

                {/* Attachments */}
                {newsletter.attachments && newsletter.attachments.length > 0 && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Attachments
                            </Typography>
                            <List>
                                {newsletter.attachments.map((attachment, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        }
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                    >
                                        <ListItemIcon>
                                            {getFileIcon(attachment.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={attachment.name}
                                            secondary={`${attachment.type} ${attachment.size ? `• ${(attachment.size / 1024).toFixed(2)} KB` : ''}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default NewsletterDetail;

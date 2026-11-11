/**
 * Teacher Dashboard - Simple UI for Teachers
 * Teachers can ONLY: Add Resources and Post Newsletters
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Container, Box, Paper, Typography, Grid, Button, Alert, Chip,
    Card, CardContent, CardActions, Divider,
} from '@mui/material';
import {
    School, Announcement, Upload, CheckCircle, HourglassEmpty,
    Warning,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const isVerified = user?.isVerified;

    return (
        <>
            <Helmet>
                <title>Teacher Dashboard - StudySphere</title>
            </Helmet>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" sx={{
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}>
                        Welcome, {user?.name}
                        <Chip
                            icon={isVerified ? <CheckCircle /> : <HourglassEmpty />}
                            label={isVerified ? 'Verified Teacher' : 'Pending Verification'}
                            color={isVerified ? 'success' : 'warning'}
                            size="small"
                        />
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        Teacher Portal - Contribute educational content for students
                    </Typography>
                </Box>

                {/* Verification Status Alert */}
                {!isVerified && (
                    <Alert
                        severity="warning"
                        icon={<Warning />}
                        sx={{ mb: 4 }}
                    >
                        <strong>Account Pending Verification</strong>
                        <br />
                        Your teacher account is awaiting admin approval. Once verified, you will be able to upload resources and post newsletters.
                    </Alert>
                )}

                {/* Action Cards */}
                <Grid container spacing={4}>
                    {/* Upload Resource Card */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                            border: '1px solid rgba(25, 118, 210, 0.2)',
                        }}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <School sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom fontWeight={600}>
                                    Upload Study Resource
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Share PDFs, notes, presentations, and other educational materials with students.
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ textAlign: 'left', pl: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        ✓ Upload PDFs and documents<br />
                                        ✓ Add descriptions and tags<br />
                                        ✓ AI-powered content analysis<br />
                                        ✓ Track student downloads
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ p: 3, pt: 0 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<Upload />}
                                    disabled={!isVerified}
                                    onClick={() => navigate('/resources/upload')}
                                    sx={{ py: 1.5 }}
                                >
                                    {isVerified ? 'Upload Resource' : 'Verification Required'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    {/* Post Newsletter Card */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)',
                            border: '1px solid rgba(156, 39, 176, 0.2)',
                        }}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <Announcement sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom fontWeight={600}>
                                    Post Newsletter
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Create announcements, updates, and important notices for students.
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ textAlign: 'left', pl: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        ✓ Write announcements<br />
                                        ✓ Pin important notices<br />
                                        ✓ Add images and links<br />
                                        ✓ Schedule publications
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ p: 3, pt: 0 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    color="secondary"
                                    startIcon={<Announcement />}
                                    disabled={!isVerified}
                                    onClick={() => navigate('/newsletters/create')}
                                    sx={{ py: 1.5 }}
                                >
                                    {isVerified ? 'Post Newsletter' : 'Verification Required'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>

                {/* Info Section */}
                <Paper sx={{ mt: 4, p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                    <Typography variant="h6" gutterBottom>
                        📚 About Teacher Portal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        As a teacher, you can contribute educational content to help students learn.
                        Your role is focused on content creation - study rooms and collaboration
                        features are designed for student-to-student learning.
                    </Typography>
                </Paper>
            </Container>
        </>
    );
};

export default TeacherDashboard;

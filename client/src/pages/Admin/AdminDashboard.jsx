/**
 * Admin Dashboard - Manage Teachers and Platform
 * Only accessible by admin users
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Paper, Typography, Grid, Button, Alert, Chip,
    Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, IconButton, Tooltip,
    Divider, Stack,
} from '@mui/material';
import {
    AdminPanelSettings, CheckCircle, Cancel, Person, School,
    Announcement, HourglassEmpty, Refresh,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Check if user is admin
    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            toast.error('Admin access required');
        }
    }, [user, navigate]);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, teachersRes, statsRes] = await Promise.all([
                api.get('/admin/pending-teachers'),
                api.get('/admin/teachers'),
                api.get('/admin/stats'),
            ]);
            setPendingTeachers(pendingRes.data.data || []);
            setAllTeachers(teachersRes.data.data || []);
            setStats(statsRes.data.data || null);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    // Verify teacher
    const handleVerify = async (teacherId) => {
        setActionLoading(teacherId);
        try {
            await api.put(`/admin/verify-teacher/${teacherId}`);
            toast.success('Teacher verified successfully!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify teacher');
        } finally {
            setActionLoading(null);
        }
    };

    // Revoke teacher
    const handleRevoke = async (teacherId) => {
        setActionLoading(teacherId);
        try {
            await api.put(`/admin/revoke-teacher/${teacherId}`);
            toast.success('Teacher verification revoked');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to revoke teacher');
        } finally {
            setActionLoading(null);
        }
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Admin Dashboard - StudySphere</title>
            </Helmet>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main' }} />
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Manage teachers, verify accounts, and monitor platform
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchData}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Stats Cards */}
                {stats && (
                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1))' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Person sx={{ fontSize: 40, color: 'primary.main' }} />
                                    <Typography variant="h4" fontWeight={700}>{stats.totalStudents}</Typography>
                                    <Typography variant="body2" color="text.secondary">Students</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.1))' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <School sx={{ fontSize: 40, color: 'secondary.main' }} />
                                    <Typography variant="h4" fontWeight={700}>{stats.totalTeachers}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Teachers</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                                    <Typography variant="h4" fontWeight={700}>{stats.verifiedTeachers}</Typography>
                                    <Typography variant="body2" color="text.secondary">Verified</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1))' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <HourglassEmpty sx={{ fontSize: 40, color: 'warning.main' }} />
                                    <Typography variant="h4" fontWeight={700}>{stats.pendingTeachers}</Typography>
                                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Pending Teachers Section */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                        <HourglassEmpty color="warning" />
                        Pending Teacher Verifications ({pendingTeachers.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : pendingTeachers.length === 0 ? (
                        <Alert severity="info">No pending teacher verifications</Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>College</TableCell>
                                        <TableCell>Registered</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingTeachers.map((teacher) => (
                                        <TableRow key={teacher._id}>
                                            <TableCell>{teacher.name}</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>{teacher.college}</TableCell>
                                            <TableCell>
                                                {new Date(teacher.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="Verify Teacher">
                                                        <IconButton
                                                            color="success"
                                                            onClick={() => handleVerify(teacher._id)}
                                                            disabled={actionLoading === teacher._id}
                                                        >
                                                            {actionLoading === teacher._id ? (
                                                                <CircularProgress size={24} />
                                                            ) : (
                                                                <CheckCircle />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton
                                                            color="error"
                                                            disabled={actionLoading === teacher._id}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* All Teachers Section */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                        <School color="secondary" />
                        All Teachers ({allTeachers.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : allTeachers.length === 0 ? (
                        <Alert severity="info">No teachers registered yet</Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>College</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allTeachers.map((teacher) => (
                                        <TableRow key={teacher._id}>
                                            <TableCell>{teacher.name}</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>{teacher.college}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={teacher.isVerified ? <CheckCircle /> : <HourglassEmpty />}
                                                    label={teacher.isVerified ? 'Verified' : 'Pending'}
                                                    color={teacher.isVerified ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {teacher.isVerified ? (
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRevoke(teacher._id)}
                                                        disabled={actionLoading === teacher._id}
                                                    >
                                                        Revoke
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleVerify(teacher._id)}
                                                        disabled={actionLoading === teacher._id}
                                                    >
                                                        Verify
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>
        </>
    );
};

export default AdminDashboard;

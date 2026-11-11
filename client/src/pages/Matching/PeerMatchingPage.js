import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import {
    PersonSearch as SearchIcon,
    Settings as SettingsIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import PreferencesForm from '../../components/Matching/PreferencesForm';
import MatchCard from '../../components/Matching/MatchCard';
import matchingService from '../../services/matchingService';

const PeerMatchingPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [preferences, setPreferences] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const response = await matchingService.getPreferences();
            setPreferences(response.data);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error loading preferences:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async (formData) => {
        try {
            setSaving(true);
            const response = await matchingService.savePreferences(formData);
            setPreferences(response.data);
            toast.success('Preferences saved successfully!');
            setActiveTab(1); // Switch to matches tab
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleFindPeers = async () => {
        try {
            setLoading(true);
            const response = await matchingService.findPeers(10);
            setMatches(response.data);

            if (response.data.length === 0) {
                toast.error('No matches found. Try updating your preferences!');
            } else {
                toast.success(`Found ${response.data.length} potential study partners!`);
            }
        } catch (error) {
            console.error('Error finding peers:', error);
            toast.error(error.response?.data?.message || 'Failed to find peers');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptMatch = async (matchId) => {
        try {
            setActionLoading(true);
            const response = await matchingService.acceptMatch(matchId);
            toast.success('Match accepted! Redirecting to study room...');

            // Remove accepted match from list
            setMatches(prev => prev.filter(m => m._id !== matchId));

            // Redirect to the auto-created room if available
            if (response.data?.room?._id) {
                setTimeout(() => {
                    window.location.href = `/study-room/${response.data.room._id}`;
                }, 1500);
            }
        } catch (error) {
            console.error('Error accepting match:', error);
            toast.error('Failed to accept match');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectMatch = async (matchId) => {
        try {
            setActionLoading(true);
            await matchingService.rejectMatch(matchId);
            toast.success('Match rejected');

            // Remove rejected match from list
            setMatches(prev => prev.filter(m => m._id !== matchId));
        } catch (error) {
            console.error('Error rejecting match:', error);
            toast.error('Failed to reject match');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🤝 Find Study Partners
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    AI-powered matching to find the perfect study partners based on your academic goals
                </Typography>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab icon={<SettingsIcon />} label="Preferences" />
                    <Tab icon={<SearchIcon />} label="Find Matches" disabled={!preferences} />
                </Tabs>
            </Paper>

            {/* Preferences Tab */}
            {activeTab === 0 && (
                <Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <PreferencesForm
                            initialData={preferences}
                            onSave={handleSavePreferences}
                            loading={saving}
                        />
                    )}
                </Box>
            )}

            {/* Matches Tab */}
            {activeTab === 1 && (
                <Box>
                    {/* Actions */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {matches.length > 0 ? `${matches.length} Potential Matches` : 'No Matches Yet'}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                            onClick={handleFindPeers}
                            disabled={loading}
                        >
                            {loading ? 'Finding Matches...' : 'Find Study Partners'}
                        </Button>
                    </Box>

                    {/* Profile Completeness Reminder */}
                    {preferences && preferences.profileCompleteness < 70 && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Your profile is {preferences.profileCompleteness}% complete.
                            Complete your preferences for better matches!
                        </Alert>
                    )}

                    {/* Matches Grid */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : matches.length > 0 ? (
                        <Grid container spacing={3}>
                            {matches.map((match) => (
                                <Grid item xs={12} md={6} lg={4} key={match._id}>
                                    <MatchCard
                                        match={match}
                                        onAccept={handleAcceptMatch}
                                        onReject={handleRejectMatch}
                                        loading={actionLoading}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Paper sx={{ p: 8, textAlign: 'center' }}>
                            <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No Matches Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Click "Find Study Partners" above to get AI-powered match recommendations
                            </Typography>
                            <Button variant="contained" onClick={handleFindPeers}>
                                Find Study Partners
                            </Button>
                        </Paper>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default PeerMatchingPage;

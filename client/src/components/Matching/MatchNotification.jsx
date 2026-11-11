/**
 * MatchNotification Component
 * Listens for match_accepted socket events and shows notifications
 * to the matched user when someone accepts a peer match
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    Box,
    Typography,
    Button,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Handshake as MatchIcon,
    MeetingRoom as RoomIcon,
} from '@mui/icons-material';
import socketService from '../../services/socketService';

// Separate dialog component for match notification
const MatchAcceptedDialog = ({ open, match, room, onClose, onJoinRoom }) => {
    if (!match || !room) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                <MatchIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Study Match Accepted! 🎉
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
                <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar
                        src={match.matchedUserId?.avatar}
                        sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                    >
                        {match.matchedUserId?.name?.charAt(0) || 'U'}
                    </Avatar>
                </Box>
                <Typography variant="h6" gutterBottom>
                    {match.matchedUserId?.name || 'Your match'} accepted your study match!
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    A study room "{room.name}" has been created for both of you.
                </Typography>
                {match.compatibilityScore && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        Compatibility Score: {match.compatibilityScore}%
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Later
                </Button>
                <Button
                    onClick={onJoinRoom}
                    variant="contained"
                    color="primary"
                    startIcon={<RoomIcon />}
                    sx={{
                        background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                    }}
                >
                    Join Study Room
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const MatchNotification = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [matchData, setMatchData] = React.useState(null);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Initialize socket connection if not already connected
        socketService.initializeSocket(user._id || user.id);
        const socket = socketService.getSocket();

        if (!socket) {
            console.log('[MatchNotification] Socket not available');
            return;
        }

        // Listen for match_accepted events
        const handleMatchAccepted = (data) => {
            console.log('[MatchNotification] Match accepted:', data);

            // Show toast notification
            toast.success(data.message || 'Your study match was accepted!', {
                duration: 6000,
                icon: '🎉',
            });

            // Store data and show dialog
            setMatchData(data);
            setDialogOpen(true);
        };

        socket.on('match_accepted', handleMatchAccepted);

        console.log('[MatchNotification] Listening for match_accepted events');

        return () => {
            socket.off('match_accepted', handleMatchAccepted);
        };
    }, [isAuthenticated, user]);

    const handleJoinRoom = () => {
        if (matchData?.room?._id) {
            setDialogOpen(false);
            navigate(`/study-room/${matchData.room._id}`);
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    return (
        <MatchAcceptedDialog
            open={dialogOpen}
            match={matchData?.match}
            room={matchData?.room}
            onClose={handleClose}
            onJoinRoom={handleJoinRoom}
        />
    );
};

export default MatchNotification;

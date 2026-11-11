/**
 * Audio & Video Controls Component
 * Mute/unmute, camera on/off, screen share, and connection status controls
 */

import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Chip, CircularProgress } from '@mui/material';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
    ScreenShare,
    StopScreenShare,
    PhoneDisabled,
    WifiOff,
} from '@mui/icons-material';
import { useLiveKit } from './LiveKitAudioProvider';
import { toast } from 'react-hot-toast';

const AudioControls = ({ compact = false }) => {
    const {
        isConnected,
        isConnecting,
        isMuted,
        isCameraOff,
        toggleMute,
        toggleCamera,
        disconnect,
        participants,
        error,
        room
    } = useLiveKit();

    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Screen sharing toggle
    const toggleScreenShare = useCallback(async () => {
        if (!room?.localParticipant) {
            toast.error('Not connected to room');
            return;
        }

        try {
            if (isScreenSharing) {
                await room.localParticipant.setScreenShareEnabled(false);
                setIsScreenSharing(false);
                toast.success('Screen sharing stopped');
            } else {
                await room.localParticipant.setScreenShareEnabled(true);
                setIsScreenSharing(true);
                toast.success('Screen sharing started');
            }
        } catch (err) {
            console.error('Screen share error:', err);
            // User may have cancelled the screen picker
            if (!err.message?.includes('cancelled') && !err.message?.includes('denied')) {
                toast.error('Failed to toggle screen share');
            }
        }
    }, [room, isScreenSharing]);

    if (error) {
        return (
            <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title={`Audio Error: ${error}`}>
                    <Chip
                        icon={<WifiOff />}
                        label="Audio Unavailable"
                        color="error"
                        size="small"
                    />
                </Tooltip>
            </Box>
        );
    }

    if (isConnecting) {
        return (
            <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} />
                {!compact && <Chip label="Connecting..." size="small" />}
            </Box>
        );
    }

    if (!isConnected) {
        return (
            <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Audio Disconnected">
                    <Chip
                        icon={<WifiOff />}
                        label={compact ? "" : "Audio Off"}
                        color="default"
                        size="small"
                    />
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box display="flex" alignItems="center" gap={1}>
            {/* Participant count */}
            {!compact && (
                <Chip
                    label={`${participants.length} in call`}
                    size="small"
                    color="success"
                    sx={{
                        background: 'linear-gradient(45deg, #00f0ff 30%, #00ff88 90%)',
                        color: '#000',
                        fontWeight: 600,
                    }}
                />
            )}

            {/* Mute/Unmute Button */}
            <Tooltip title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}>
                <IconButton
                    onClick={toggleMute}
                    size={compact ? 'small' : 'medium'}
                    sx={{
                        bgcolor: isMuted ? 'error.main' : 'primary.main',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: isMuted ? 'error.dark' : 'primary.dark',
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </IconButton>
            </Tooltip>

            {/* Camera Toggle Button */}
            <Tooltip title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}>
                <IconButton
                    onClick={toggleCamera}
                    size={compact ? 'small' : 'medium'}
                    sx={{
                        bgcolor: isCameraOff ? 'grey.600' : 'primary.main',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: isCameraOff ? 'grey.700' : 'primary.dark',
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    {isCameraOff ? <VideocamOff /> : <Videocam />}
                </IconButton>
            </Tooltip>

            {/* Screen Share Button */}
            <Tooltip title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
                <IconButton
                    onClick={toggleScreenShare}
                    size={compact ? 'small' : 'medium'}
                    sx={{
                        bgcolor: isScreenSharing ? 'secondary.main' : 'grey.700',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: isScreenSharing ? 'secondary.dark' : 'grey.600',
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>
            </Tooltip>

            {/* Disconnect Button */}
            {!compact && (
                <Tooltip title="Leave Call">
                    <IconButton
                        onClick={disconnect}
                        size="small"
                        sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'error.dark',
                            },
                        }}
                    >
                        <PhoneDisabled />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default AudioControls;

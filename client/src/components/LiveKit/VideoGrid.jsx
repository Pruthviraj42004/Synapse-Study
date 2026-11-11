/**
 * VideoGrid Component
 * Displays local and remote video feeds from LiveKit participants
 * Supports camera and screen sharing with maximize functionality
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Paper, Chip, IconButton, Tooltip, Dialog,
    DialogContent, DialogTitle
} from '@mui/material';
import {
    Videocam, VideocamOff, ScreenShare, StopScreenShare,
    Close, ZoomOutMap
} from '@mui/icons-material';
import { useLiveKit } from './LiveKitAudioProvider';
import { RoomEvent, Track } from 'livekit-client';

const VideoGrid = () => {
    const { room, isCameraOff, isConnected } = useLiveKit();
    // Store tracks instead of elements so we can attach fresh elements when needed
    const [remoteVideos, setRemoteVideos] = useState([]); // Array of { participantId, track, name }
    const [screenShares, setScreenShares] = useState([]); // Array of { participantId, track, name }
    const localVideoRef = useRef(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [maximizedVideo, setMaximizedVideo] = useState(null); // { track, name, isScreenShare }

    // Get base user ID from participant identity
    const getBaseUserId = useCallback((identity) => {
        if (!identity) return identity;
        const parts = identity.split('_');
        return parts.length > 1 ? parts[0] : identity;
    }, []);

    // Subscribe to room video tracks directly
    useEffect(() => {
        if (!room) return;

        const handleTrackSubscribed = (track, publication, participant) => {
            // Skip local participant
            if (participant.identity === room.localParticipant?.identity) return;

            if (track.kind === Track.Kind.Video) {
                const source = publication.source;
                const participantId = participant.identity;
                const baseUserId = getBaseUserId(participantId);

                console.log('📹 Video subscribed:', { participantId, source });

                if (source === Track.Source.ScreenShare) {
                    setScreenShares(prev => {
                        const filtered = prev.filter(v => v.participantId !== participantId);
                        return [...filtered, {
                            participantId,
                            track, // Store the track, not element
                            name: participant.name || baseUserId
                        }];
                    });
                } else {
                    setRemoteVideos(prev => {
                        const filtered = prev.filter(v => getBaseUserId(v.participantId) !== baseUserId);
                        return [...filtered, {
                            participantId,
                            track, // Store the track, not element
                            name: participant.name || baseUserId
                        }];
                    });
                }
            }
        };

        const handleTrackUnsubscribed = (track, publication, participant) => {
            if (track.kind === Track.Kind.Video) {
                const source = publication.source;
                const participantId = participant.identity;
                console.log('📹 Video unsubscribed:', { participantId, source });

                if (source === Track.Source.ScreenShare) {
                    setScreenShares(prev => prev.filter(v => v.participantId !== participantId));
                } else {
                    setRemoteVideos(prev => prev.filter(v => v.participantId !== participantId));
                }
            }
        };

        const handleParticipantDisconnected = (participant) => {
            const participantId = participant.identity;
            console.log('👋 Participant disconnected:', participantId);
            setRemoteVideos(prev => prev.filter(v => v.participantId !== participantId));
            setScreenShares(prev => prev.filter(v => v.participantId !== participantId));
        };

        room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

        // Process existing remote participants
        room.remoteParticipants.forEach((participant) => {
            participant.videoTrackPublications.forEach((publication) => {
                if (publication.track && publication.isSubscribed) {
                    handleTrackSubscribed(publication.track, publication, participant);
                }
            });
        });

        return () => {
            room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
            room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
            room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        };
    }, [room, getBaseUserId]);

    // Attach local video when camera is turned on
    useEffect(() => {
        if (!room?.localParticipant || isCameraOff) {
            setLocalVideoTrack(null);
            return;
        }

        const videoPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (videoPublication?.track) {
            setLocalVideoTrack(videoPublication.track);
        }
    }, [room, isCameraOff]);

    // Attach local video track to video element
    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            const element = localVideoTrack.attach();
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.objectFit = 'cover';
            element.style.borderRadius = '8px';
            element.muted = true;
            localVideoRef.current.appendChild(element);

            return () => {
                localVideoTrack.detach().forEach(el => el.remove());
            };
        }
    }, [localVideoTrack]);

    // Clear videos when disconnecting
    useEffect(() => {
        if (!isConnected) {
            setRemoteVideos([]);
            setScreenShares([]);
            setMaximizedVideo(null);
        }
    }, [isConnected]);

    // Screen sharing functions
    const startScreenShare = async () => {
        if (!room) return;
        try {
            await room.localParticipant.setScreenShareEnabled(true);
            setIsScreenSharing(true);
        } catch (err) {
            if (!err.message?.includes('cancelled')) {
                console.error('Failed to start screen share:', err);
            }
        }
    };

    const stopScreenShare = async () => {
        if (!room) return;
        try {
            await room.localParticipant.setScreenShareEnabled(false);
            setIsScreenSharing(false);
        } catch (err) {
            console.error('Failed to stop screen share:', err);
        }
    };

    // Maximize video handler
    const handleMaximize = (videoData) => {
        setMaximizedVideo(videoData);
    };

    const hasVideos = !isCameraOff || remoteVideos.length > 0 || screenShares.length > 0;
    const totalVideos = (isCameraOff ? 0 : 1) + remoteVideos.length;

    if (!isConnected) {
        return null;
    }

    return (
        <>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Video
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
                            <IconButton
                                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                                color={isScreenSharing ? 'error' : 'primary'}
                                size="small"
                                sx={{
                                    bgcolor: isScreenSharing ? 'rgba(244, 67, 54, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                                    '&:hover': {
                                        bgcolor: isScreenSharing ? 'rgba(244, 67, 54, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                                    }
                                }}
                            >
                                {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                            </IconButton>
                        </Tooltip>
                        <Chip
                            icon={<Videocam />}
                            label={`${totalVideos + screenShares.length} feed${(totalVideos + screenShares.length) !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                background: 'linear-gradient(45deg, #00f0ff 30%, #00ff88 90%)',
                                color: '#000',
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                </Box>

                {/* Screen Sharing Active Notice */}
                {isScreenSharing && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 1.5,
                            bgcolor: 'rgba(156, 39, 176, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(156, 39, 176, 0.3)',
                        }}
                    >
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScreenShare fontSize="small" color="secondary" />
                            <span><strong>You are sharing your screen</strong> - Others can see it. To avoid mirror effect, share a specific window instead of entire screen.</span>
                        </Typography>
                    </Box>
                )}

                {/* Screen Shares from others */}
                {screenShares.length > 0 && (
                    <Box mb={2}>
                        <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                            🖥️ Screen Shares
                        </Typography>
                        {screenShares.map(({ participantId, track, name }) => (
                            <VideoTile
                                key={`screen-${participantId}`}
                                track={track}
                                name={name}
                                isScreenShare={true}
                                onMaximize={() => handleMaximize({ track, name, isScreenShare: true })}
                            />
                        ))}
                    </Box>
                )}

                {/* Video Grid */}
                {hasVideos ? (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: totalVideos > 1 ? 'repeat(2, 1fr)' : '1fr',
                            gap: 1,
                            maxHeight: 400,
                        }}
                    >
                        {/* Local Video */}
                        {!isCameraOff && (
                            <Box
                                sx={{
                                    position: 'relative',
                                    aspectRatio: '16/9',
                                    bgcolor: 'grey.900',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid rgba(0, 240, 255, 0.3)',
                                }}
                            >
                                <Box ref={localVideoRef} sx={{ width: '100%', height: '100%' }} />
                                <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 8,
                                        bgcolor: 'rgba(0, 240, 255, 0.8)',
                                        color: '#000',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        )}

                        {/* Remote Videos */}
                        {remoteVideos.map(({ participantId, track, name }) => (
                            <VideoTile
                                key={`video-${participantId}`}
                                track={track}
                                name={name}
                                isScreenShare={false}
                                onMaximize={() => handleMaximize({ track, name, isScreenShare: false })}
                            />
                        ))}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 3,
                            color: 'text.secondary',
                        }}
                    >
                        <VideocamOff sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2">No active video feeds</Typography>
                        <Typography variant="caption" color="text.disabled">
                            Turn on camera or share screen
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Maximized Video Dialog */}
            <Dialog
                open={!!maximizedVideo}
                onClose={() => setMaximizedVideo(null)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#000',
                        maxHeight: '90vh',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'rgba(0,0,0,0.9)',
                    color: 'white',
                }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        {maximizedVideo?.isScreenShare ? <ScreenShare /> : <Videocam />}
                        <Typography>{maximizedVideo?.name}</Typography>
                    </Box>
                    <IconButton onClick={() => setMaximizedVideo(null)} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center' }}>
                    {maximizedVideo && (
                        <MaximizedVideo track={maximizedVideo.track} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

// Video Tile Component - attaches track to a fresh element
const VideoTile = ({ track, name, isScreenShare, onMaximize }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !track) return;

        // Attach track to create a fresh video element
        const videoElement = track.attach();
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = isScreenShare ? 'contain' : 'cover';
        videoElement.style.borderRadius = '8px';
        videoElement.style.background = '#000';

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(videoElement);

        return () => {
            // Detach this specific element when unmounting
            track.detach(videoElement);
            videoElement.remove();
        };
    }, [track, isScreenShare]);

    const displayName = name?.split('_')[0] || name || 'Participant';

    return (
        <Box
            sx={{
                position: 'relative',
                aspectRatio: '16/9',
                bgcolor: 'grey.900',
                borderRadius: 2,
                overflow: 'hidden',
                border: isScreenShare ? '2px solid' : 'none',
                borderColor: 'primary.main',
                mb: isScreenShare ? 1 : 0,
            }}
        >
            <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
            <Chip
                label={displayName}
                size="small"
                sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                }}
            />
            <IconButton
                onClick={onMaximize}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
            >
                <ZoomOutMap fontSize="small" />
            </IconButton>
        </Box>
    );
};

// Maximized Video Component
const MaximizedVideo = ({ track }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !track) return;

        const videoElement = track.attach();
        videoElement.style.width = '100%';
        videoElement.style.height = 'auto';
        videoElement.style.maxHeight = '80vh';
        videoElement.style.objectFit = 'contain';

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(videoElement);

        return () => {
            track.detach(videoElement);
            videoElement.remove();
        };
    }, [track]);

    return <Box ref={containerRef} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
};

export default VideoGrid;

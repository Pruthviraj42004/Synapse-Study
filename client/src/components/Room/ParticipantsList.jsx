/**
 * Enhanced Participants List
 * Shows active participants with LiveKit audio status
 */

import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    Paper,
    Badge,
} from '@mui/material';
import {
    Mic,
    MicOff,
    VolumeUp,
    Person,
} from '@mui/icons-material';
import { useLiveKit } from '../LiveKit/LiveKitAudioProvider';

const ParticipantsList = ({ room }) => {
    const { participants: liveKitParticipants, isConnected } = useLiveKit();

    // Combine database participants with LiveKit status
    const enrichedParticipants = room?.participants?.map((participant) => {
        const liveKitStatus = liveKitParticipants.find(
            (lp) => lp.identity === (participant.user?._id || participant._id)?.toString()
        );

        return {
            ...participant,
            liveKitStatus: liveKitStatus || null,
            isInCall: !!liveKitStatus,
        };
    }) || [];

    return (
        <Paper
            sx={{
                p: 2,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Person sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Participants
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    {isConnected && liveKitParticipants.length > 0 && (
                        <Chip
                            label={`${liveKitParticipants.length} online`}
                            size="small"
                            icon={<VolumeUp />}
                            sx={{
                                background: 'linear-gradient(45deg, #00f0ff 30%, #00ff88 90%)',
                                color: '#000',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#000' }
                            }}
                        />
                    )}
                    <Chip
                        label={`${enrichedParticipants.length} in room`}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
                    />
                </Box>
            </Box>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {/* Creator */}
                {room?.creator && (
                    <ListItem
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(156, 39, 176, 0.15) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateX(4px)',
                            },
                        }}
                    >
                        <ListItemAvatar>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    liveKitParticipants.find(
                                        (lp) => lp.identity === room.creator._id?.toString()
                                    ) ? (
                                        liveKitParticipants.find(
                                            (lp) => lp.identity === room.creator._id?.toString()
                                        )?.isMuted ? (
                                            <MicOff sx={{ fontSize: 14, color: '#ff6b6b', bgcolor: '#1a1a1a', borderRadius: '50%', p: 0.3 }} />
                                        ) : (
                                            <Mic sx={{ fontSize: 14, color: '#00ff88', bgcolor: '#1a1a1a', borderRadius: '50%', p: 0.3 }} />
                                        )
                                    ) : null
                                }
                            >
                                <Avatar
                                    sx={{
                                        background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                                        fontWeight: 700,
                                    }}
                                >
                                    {room.creator.name?.charAt(0)}
                                </Avatar>
                            </Badge>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {room.creator.name}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    Room Creator · {room.creator.college || 'No college'}
                                </Typography>
                            }
                        />
                        <Chip
                            label="👑 Creator"
                            size="small"
                            sx={{
                                background: 'linear-gradient(45deg, #ffd700 30%, #ff8c00 90%)',
                                color: '#000',
                                fontWeight: 600,
                            }}
                        />
                    </ListItem>
                )}

                {/* Other Participants */}
                {enrichedParticipants
                    .filter((p) => (p.user?._id || p._id) !== room?.creator?._id)
                    .map((participant) => {
                        const userId = participant.user?._id || participant._id;
                        const userName = participant.user?.name || participant.name;
                        const userCollege = participant.user?.college || participant.college;

                        return (
                            <ListItem
                                key={userId}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    bgcolor: participant.isInCall ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${participant.isInCall ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateX(4px)',
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                            participant.liveKitStatus ? (
                                                participant.liveKitStatus.isMuted ? (
                                                    <MicOff sx={{ fontSize: 14, color: '#ff6b6b', bgcolor: '#1a1a1a', borderRadius: '50%', p: 0.3 }} />
                                                ) : (
                                                    <Mic sx={{ fontSize: 14, color: '#00ff88', bgcolor: '#1a1a1a', borderRadius: '50%', p: 0.3 }} />
                                                )
                                            ) : null
                                        }
                                    >
                                        <Avatar sx={{ bgcolor: 'grey.700' }}>
                                            {userName?.charAt(0)}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {userName}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {userCollege || 'No college'}
                                        </Typography>
                                    }
                                />
                                {participant.isInCall && (
                                    <Chip
                                        label="🎤 In call"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(0, 240, 255, 0.2)',
                                            color: '#00f0ff',
                                            borderColor: '#00f0ff',
                                            border: '1px solid',
                                            fontWeight: 500,
                                        }}
                                    />
                                )}
                            </ListItem>
                        );
                    })}
            </List>

            {enrichedParticipants.length < room?.maxParticipants && (
                <Box
                    mt={2}
                    p={2}
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 2,
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        🪑 {room?.maxParticipants - enrichedParticipants.length} spots available
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default ParticipantsList;

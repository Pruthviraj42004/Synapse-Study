/**
 * ParticipantsList Component
 * 
 * Displays active participants with unified presence from Y.js awareness
 * Shows mic/camera status, role badges, and activity indicators
 */

import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Chip,
    Tooltip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Badge
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import DrawIcon from '@mui/icons-material/Draw';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import './ParticipantsList.css';

const ParticipantsList = ({
    participants = [],
    localUser,
    compact = false,
    darkMode = true
}) => {
    /**
     * Get role icon
     */
    const getRoleIcon = (role) => {
        switch (role) {
            case 'tutor':
                return <SchoolIcon fontSize="small" />;
            case 'moderator':
                return <SupervisorAccountIcon fontSize="small" />;
            default:
                return null;
        }
    };

    /**
     * Get role color
     */
    const getRoleColor = (role) => {
        switch (role) {
            case 'tutor':
                return 'primary';
            case 'moderator':
                return 'secondary';
            default:
                return 'default';
        }
    };

    /**
     * Get current tool icon
     */
    const getToolIcon = (tool) => {
        switch (tool) {
            case 'editor':
                return <CodeIcon fontSize="small" />;
            case 'chat':
                return <ChatIcon fontSize="small" />;
            case 'whiteboard':
                return <DrawIcon fontSize="small" />;
            default:
                return null;
        }
    };

    /**
     * Format last active time
     */
    const formatLastActive = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 10) return 'Just now';
        if (seconds < 60) return `${seconds}s ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    /**
     * Get user initials for avatar
     */
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const allParticipants = localUser ? [localUser, ...participants] : participants;

    return (
        <Paper
            elevation={2}
            sx={{
                p: compact ? 1 : 2,
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant={compact ? "subtitle2" : "h6"} fontWeight="600">
                    Participants
                </Typography>
                <Chip
                    label={allParticipants.length}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            </Box>

            {/* Participants list */}
            <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                {allParticipants.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            No other participants yet
                        </Typography>
                    </Box>
                ) : (
                    allParticipants.map((participant, index) => {
                        const isLocal = participant.clientId === localUser?.clientId;

                        return (
                            <ListItem
                                key={participant.clientId || participant.userId || index}
                                sx={{
                                    px: compact ? 1 : 2,
                                    py: 1,
                                    borderRadius: 1,
                                    mb: 0.5,
                                    backgroundColor: isLocal ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                            participant.audioEnabled || participant.videoEnabled ? (
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#4caf50',
                                                        border: '2px solid',
                                                        borderColor: darkMode ? '#1e1e1e' : '#ffffff'
                                                    }}
                                                />
                                            ) : null
                                        }
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: participant.userColor || '#757575',
                                                width: compact ? 32 : 40,
                                                height: compact ? 32 : 40,
                                                fontSize: compact ? '0.875rem' : '1rem'
                                            }}
                                        >
                                            {getInitials(participant.userName || 'Unknown')}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                            <Typography
                                                variant={compact ? "body2" : "body1"}
                                                fontWeight={isLocal ? 600 : 400}
                                            >
                                                {participant.userName || 'Unknown'}
                                                {isLocal && ' (You)'}
                                            </Typography>

                                            {/* Role badge */}
                                            {participant.role && participant.role !== 'student' && (
                                                <Chip
                                                    icon={getRoleIcon(participant.role)}
                                                    label={participant.role}
                                                    size="small"
                                                    color={getRoleColor(participant.role)}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            {/* Audio/Video status */}
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title={participant.audioEnabled ? "Mic on" : "Mic off"}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            color: participant.audioEnabled ? 'success.main' : 'text.disabled'
                                                        }}
                                                    >
                                                        {participant.audioEnabled ? (
                                                            <MicIcon sx={{ fontSize: 14 }} />
                                                        ) : (
                                                            <MicOffIcon sx={{ fontSize: 14 }} />
                                                        )}
                                                    </Box>
                                                </Tooltip>

                                                <Tooltip title={participant.videoEnabled ? "Camera on" : "Camera off"}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            color: participant.videoEnabled ? 'success.main' : 'text.disabled'
                                                        }}
                                                    >
                                                        {participant.videoEnabled ? (
                                                            <VideocamIcon sx={{ fontSize: 14 }} />
                                                        ) : (
                                                            <VideocamOffIcon sx={{ fontSize: 14 }} />
                                                        )}
                                                    </Box>
                                                </Tooltip>
                                            </Box>

                                            {/* Current tool */}
                                            {participant.currentTool && (
                                                <Tooltip title={`Using ${participant.currentTool}`}>
                                                    <Box sx={{ display: 'flex', color: 'text.secondary' }}>
                                                        {getToolIcon(participant.currentTool)}
                                                    </Box>
                                                </Tooltip>
                                            )}

                                            {/* Typing indicator */}
                                            {participant.isTyping && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: 'italic' }}
                                                >
                                                    typing...
                                                </Typography>
                                            )}

                                            {/* Last active */}
                                            {!compact && participant.lastActive && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatLastActive(participant.lastActive)}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                        );
                    })
                )}
            </List>
        </Paper>
    );
};

export default ParticipantsList;

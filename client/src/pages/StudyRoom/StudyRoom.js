import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Draw as WhiteboardIcon,
  AttachFile as FileIcon,
  Home as HomeIcon,
  Code as CodeIcon,
  ExitToApp as ExitIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import socketService from '../../services/socketService';
import useRoomState from '../../hooks/useRoomState';
import LiveKitAudioProvider from '../../components/LiveKit/LiveKitAudioProvider';
import AudioControls from '../../components/LiveKit/AudioControls';
import VideoGrid from '../../components/LiveKit/VideoGrid';
import ParticipantsList from '../../components/Room/ParticipantsList';
import Chat from '../../components/Chat/Chat';
import FileSharing from '../../components/FileSharing/FileSharing';
import StudyRoomProgrammingModern from '../../components/Programming/StudyRoomProgrammingModern';
import { FEATURES } from '../../config/features';


const StudyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Use unified room state hook
  const { room, state, livekitToken, livekitUrl, loading, error } = useRoomState(roomId);

  const [activeTab, setActiveTab] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    if (roomId && user?.id) {
      console.log('[StudyRoom] Initializing socket for room:', roomId);
      socketService.initializeSocket(user.id);

      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        socketService.joinRoom(roomId);
      }
    }
  }, [roomId, user?.id]);

  const handleLeaveRoom = async () => {
    try {
      // Leave room will be handled by useRoomState cleanup
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleWhiteboard = () => {
    navigate(`/whiteboard/${roomId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box>
        <Alert severity="error">
          {error || 'Study room not found or you don\'t have access to this room.'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const isCreator = room.creator._id === user.id;

  return (
    <>
      <Helmet>
        <title>{room.name} - StudySphere</title>
      </Helmet>

      {/* LiveKit Audio Provider - Always Active */}
      <LiveKitAudioProvider
        roomId={roomId}
        token={livekitToken}
        serverUrl={livekitUrl}
      >
        <Box>
          {/* Room Header */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(156, 39, 176, 0.08) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flexGrow={1}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #00f0ff, #9c27b0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  {room.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom sx={{ opacity: 0.8 }}>
                  {room.description || 'No description provided'}
                </Typography>
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  <Chip
                    label={room.subject}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={room.isPrivate ? '🔒 Private' : '🌐 Public'}
                    variant="outlined"
                    sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                  <Chip
                    label={`👥 ${room.participants.length}/${room.maxParticipants} participants`}
                    variant="outlined"
                    sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                  {room.college && (
                    <Chip
                      label={`🎓 ${room.college}`}
                      variant="outlined"
                      sx={{ borderColor: 'rgba(156, 39, 176, 0.5)' }}
                    />
                  )}
                </Box>
              </Box>

              {/* Audio Controls & Actions */}
              <Box display="flex" gap={1} alignItems="center">
                <AudioControls />
                {isCreator && (
                  <IconButton
                    onClick={() => navigate(`/study-room/${roomId}/settings`)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                )}
                <IconButton
                  onClick={handleLeaveRoom}
                  sx={{
                    bgcolor: 'rgba(244, 67, 54, 0.2)',
                    color: 'error.main',
                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.3)' },
                  }}
                >
                  <ExitIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* Main Content Area */}
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 0,
                  minHeight: 600,
                  display: 'flex',
                  flexDirection: 'column'
                }}
                className="glass-card-enhanced"
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                  <Tab icon={<HomeIcon />} label="Home" />
                  {room.settings.allowChat && <Tab icon={<ChatIcon />} label="Chat" />}
                  {room.settings.allowProgramming && <Tab icon={<CodeIcon />} label="Code" />}
                  {room.settings.allowWhiteboard && <Tab icon={<WhiteboardIcon />} label="Whiteboard" />}
                  {room.settings.allowFileSharing && <Tab icon={<FileIcon />} label="Files" />}
                </Tabs>

                <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                  {/* Home Tab */}
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Welcome to {room.name}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        This study room was created for students from {room.college || 'all colleges'} to collaborate on {room.subject}.
                      </Typography>

                      <Alert severity="info" sx={{ mb: 3 }}>
                        🎤 Audio is always on! You can talk while using any feature. Use the microphone button in the header to mute/unmute.
                      </Alert>

                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Available Features
                      </Typography>

                      <Grid container spacing={2}>
                        {room.settings.allowChat && (
                          <Grid item xs={12} sm={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<ChatIcon />}
                              size="large"
                              sx={{ height: 60 }}
                              color="secondary"
                              onClick={() => setActiveTab(1)}
                            >
                              Open Chat
                            </Button>
                          </Grid>
                        )}

                        {room.settings.allowProgramming && (
                          <Grid item xs={12} sm={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<CodeIcon />}
                              size="large"
                              sx={{ height: 60 }}
                              color="info"
                              onClick={() => setActiveTab(2)}
                            >
                              Collaborative Code
                            </Button>
                          </Grid>
                        )}

                        {room.settings.allowWhiteboard && (
                          <Grid item xs={12} sm={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<WhiteboardIcon />}
                              size="large"
                              sx={{ height: 60 }}
                              color="success"
                              onClick={handleWhiteboard}
                            >
                              Whiteboard
                            </Button>
                          </Grid>
                        )}

                        {room.settings.allowFileSharing && (
                          <Grid item xs={12} sm={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<FileIcon />}
                              size="large"
                              sx={{ height: 60 }}
                              color="warning"
                              onClick={() => setActiveTab(4)}
                            >
                              Share Files
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Chat Tab */}
                  {activeTab === 1 && room.settings.allowChat && (
                    <Box sx={{ height: '100%' }}>
                      <Chat roomId={roomId} />
                    </Box>
                  )}

                  {/* Programming Tab */}
                  {activeTab === 2 && room.settings.allowProgramming && (
                    FEATURES.USE_CODEMIRROR ? (
                      <StudyRoomProgrammingModern roomId={roomId} />
                    ) : (
                      <Alert severity="info">
                        Programming editor loading...
                      </Alert>
                    )
                  )}

                  {/* Whiteboard Tab */}
                  {activeTab === 3 && room.settings.allowWhiteboard && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <WhiteboardIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Collaborative Whiteboard
                      </Typography>
                      <Typography variant="body1" paragraph textAlign="center">
                        Draw diagrams, visualize concepts, and brainstorm ideas together in real-time.
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<WhiteboardIcon />}
                        onClick={handleWhiteboard}
                      >
                        Open Whiteboard
                      </Button>
                    </Box>
                  )}

                  {/* Files Tab */}
                  {activeTab === 4 && room.settings.allowFileSharing && (
                    <FileSharing roomId={roomId} />
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Participants Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Video Grid - Shows when any participant has video */}
              <VideoGrid />
              <ParticipantsList room={room} />
            </Grid>
          </Grid>
        </Box>
      </LiveKitAudioProvider>
    </>
  );
};

export default StudyRoom;
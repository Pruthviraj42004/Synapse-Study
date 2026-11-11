import React, { useState, useEffect, useCallback } from 'react';
import AnimatedButton from '../../components/AnimatedButton';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  VideoCall as VideoCallIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import studyRoomService from '../../services/studyRoomService';
import { setLoading, setError } from '../../redux/slices/studyRoomSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.studyRoom);

  // State hooks for dialog, room creation, tabs, and rooms
  const [tabValue, setTabValue] = useState(0);
  const [userRooms, setUserRooms] = useState({ createdRooms: [], joinedRooms: [] });
  const [publicRooms, setPublicRooms] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    subject: '',
    maxParticipants: 10,
    isPrivate: false,
    settings: {
      allowChat: true,
      allowWhiteboard: true,
      allowFileSharing: true,
      allowVideoCall: true
    }
  });

  const subjects = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'English',
    'Other'
  ];

  const loadDashboardData = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      // Load user's rooms
      const userRoomsData = await studyRoomService.getUserStudyRooms();
      setUserRooms(userRoomsData);

      // Load public rooms
      const publicRoomsData = await studyRoomService.getStudyRooms({ limit: 6 });
      setPublicRooms(publicRoomsData.rooms || []);

      dispatch(setError(null));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      dispatch(setError(error.message || 'Failed to load dashboard data'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateRoom = async () => {
    try {
      setCreateLoading(true);
      const createdRoom = await studyRoomService.createStudyRoom(newRoom);

      // Update user's created rooms
      setUserRooms(prev => ({
        ...prev,
        createdRooms: [createdRoom, ...prev.createdRooms]
      }));

      setOpenCreateDialog(false);
      setNewRoom({
        name: '',
        description: '',
        subject: '',
        maxParticipants: 10,
        isPrivate: false,
        settings: {
          allowChat: true,
          allowWhiteboard: true,
          allowFileSharing: true,
          allowVideoCall: true
        }
      });
    } catch (error) {
      console.error('Error creating room:', error);
      dispatch(setError(error.message || 'Failed to create room'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await studyRoomService.joinStudyRoom(roomId);
      navigate(`/study-room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      dispatch(setError(error.message || 'Failed to join room'));
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await studyRoomService.leaveStudyRoom(roomId);
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error leaving room:', error);
      dispatch(setError(error.message || 'Failed to leave room'));
    }
  };

  const RoomCard = ({ room, isCreator = false, isJoined = false }) => (
    <Card
      className="glass-card-enhanced hover-lift"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #00f0ff, #7c3aed, #bd00ff)',
          backgroundSize: '200% 100%',
          animation: 'gradient-flow 3s ease infinite'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 0 }}
          >
            {room.name}
          </Typography>
          <Chip
            label={room.subject}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #00f0ff22, #7c3aed22)',
              border: '1px solid',
              borderColor: 'primary.main',
              fontWeight: 'bold'
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {room.description || 'No description provided'}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {room.participants?.length || 0}/{room.maxParticipants} participants
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Avatar sx={{ width: 24, height: 24 }}>
            {room.creator?.name?.charAt(0)}
          </Avatar>
          <Typography variant="body2">
            Created by {room.creator?.name}
          </Typography>
        </Box>

        {room.participants && room.participants.length > 0 && (
          <Box mb={2}>
            <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
              {room.participants.map((participant) => (
                <Avatar
                  key={participant.user?._id || participant._id}
                  sx={{ width: 24, height: 24 }}
                  title={participant.user?.name || participant.name}
                >
                  {(participant.user?.name || participant.name)?.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        )}
      </CardContent>

      <CardActions>
        {isCreator ? (
          <Box display="flex" gap={1} width="100%">
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate(`/study-room/${room._id}`)}
              startIcon={<VideoCallIcon />}
            >
              Enter Room
            </Button>
            <IconButton
              size="small"
              onClick={() => navigate(`/study-room/${room._id}/settings`)}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        ) : isJoined ? (
          <Box display="flex" gap={1} width="100%">
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate(`/study-room/${room._id}`)}
              startIcon={<VideoCallIcon />}
            >
              Enter Room
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleLeaveRoom(room._id)}
              startIcon={<ExitIcon />}
            >
              Leave
            </Button>
          </Box>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={() => handleJoinRoom(room._id)}
            startIcon={<PeopleIcon />}
          >
            Join Room
          </Button>
        )}
      </CardActions>
    </Card>
  );

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Dashboard - StudySphere</title>
      </Helmet>

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box className="fade-in-up">
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 1
              }}
            >
              <span className="animated-gradient-text">Welcome back</span>, {user?.name}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Ready to continue your learning journey?
            </Typography>
          </Box>

          <Fab
            color="primary"
            aria-label="create study room"
            onClick={() => setOpenCreateDialog(true)}
            className="glow-pulse float"
            sx={{
              width: 64,
              height: 64,
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)'
            }}
          >
            <AddIcon sx={{ fontSize: 32 }} />
          </Fab>
        </Box>

        {/* User Info and Stats Section */}
        <Grid container spacing={3} mb={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={4}>
            <Card
              className="glass-card-enhanced fade-in-up"
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(124,58,237,0.05) 100%)'
              }}
            >
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      position: 'relative',
                      mb: 2
                    }}
                  >
                    <Avatar
                      className="scale-in"
                      sx={{
                        width: 90,
                        height: 90,
                        background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(0, 240, 255, 0.3)'
                      }}
                    >
                      {user?.name?.charAt(0)}
                    </Avatar>
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>
                  <Chip
                    icon={<SchoolIcon />}
                    label={user?.college || 'Not specified'}
                    sx={{
                      mt: 1,
                      background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(124,58,237,0.1))',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      fontWeight: 'bold'
                    }}
                  />
                  <Divider sx={{ width: '100%', my: 3 }} />
                  <Box width="100%">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Member since
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {new Date(user?.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* Study Rooms Stat */}
              <Grid item xs={6} sm={6}>
                <Card
                  className="hover-lift"
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover::after': {
                      opacity: 1
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontWeight: 'medium' }}>
                          Study Rooms
                        </Typography>
                        <Typography variant="h3" className="scale-in" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {(user?.stats?.studyRooms || 0) + (userRooms.createdRooms?.length || 0)}
                        </Typography>
                      </Box>
                      <Avatar
                        className="float"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                      >
                        <PeopleIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Programming Sessions Stat */}
              <Grid item xs={6} sm={6}>
                <Card
                  className="hover-lift"
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover::after': {
                      opacity: 1
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontWeight: 'medium' }}>
                          Code Sessions
                        </Typography>
                        <Typography variant="h3" className="scale-in" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {user?.stats?.programmingSessions || 0}
                        </Typography>
                      </Box>
                      <Avatar
                        className="float"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                      >
                        <CodeIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Study Hours Stat */}
              <Grid item xs={6} sm={6}>
                <Card
                  className="hover-lift"
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover::after': {
                      opacity: 1
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontWeight: 'medium' }}>
                          Study Hours
                        </Typography>
                        <Typography variant="h3" className="scale-in" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {Math.round((user?.stats?.totalStudyHours || 0) * 10) / 10}
                        </Typography>
                      </Box>
                      <Avatar
                        className="float"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                      >
                        <TimerIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Code Problems Stat */}
              <Grid item xs={6} sm={6}>
                <Card
                  className="hover-lift"
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover::after': {
                      opacity: 1
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontWeight: 'medium' }}>
                          Problems Solved
                        </Typography>
                        <Typography variant="h3" className="scale-in" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {user?.stats?.codeProblems || 0}
                        </Typography>
                      </Box>
                      <Avatar
                        className="float"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                      >
                        <TrophyIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <TrendingUpIcon color="primary" />
            <Box flexGrow={1}>
              <Typography variant="subtitle1" fontWeight="medium">
                Keep the momentum going!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You've been active in {userRooms.createdRooms?.length + userRooms.joinedRooms?.length || 0} study rooms this month
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create New Room
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(setError(null))}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="My Rooms" />
          <Tab label="Discover Rooms" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Created Rooms */}
          <Typography variant="h5" gutterBottom>
            Your Study Rooms ({userRooms.createdRooms?.length || 0})
          </Typography>

          {loading ? (
            <Grid container spacing={3} mb={4}>
              {[1, 2, 3].map((n) => (
                <Grid item xs={12} sm={6} md={4} key={n}>
                  <Skeleton variant="rectangular" height={200} />
                </Grid>
              ))}
            </Grid>
          ) : userRooms.createdRooms?.length > 0 ? (
            <Grid container spacing={3} mb={4}>
              {userRooms.createdRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room._id}>
                  <RoomCard room={room} isCreator={true} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4} mb={4}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No study rooms created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Create your first study room to start collaborating!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create Study Room
              </Button>
            </Box>
          )}

          {/* Joined Rooms */}
          <Typography variant="h5" gutterBottom>
            Joined Rooms ({userRooms.joinedRooms?.length || 0})
          </Typography>

          {userRooms.joinedRooms?.length > 0 ? (
            <Grid container spacing={3}>
              {userRooms.joinedRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room._id}>
                  <RoomCard room={room} isJoined={true} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No joined rooms yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore public rooms and join interesting study groups!
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Discover Public Study Rooms
          </Typography>

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Grid item xs={12} sm={6} md={4} key={n}>
                  <Skeleton variant="rectangular" height={200} />
                </Grid>
              ))}
            </Grid>
          ) : publicRooms.length > 0 ? (
            <Grid container spacing={3}>
              {publicRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room._id}>
                  <RoomCard room={room} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No public rooms available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to create a public study room!
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Create Room Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Study Room</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Room Name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Description"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={newRoom.subject}
                  label="Subject"
                  onChange={(e) => setNewRoom({ ...newRoom, subject: e.target.value })}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Maximum Participants"
                type="number"
                value={newRoom.maxParticipants}
                onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: parseInt(e.target.value) })}
                margin="normal"
                inputProps={{ min: 2, max: 50 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                  />
                }
                label="Private Room"
                sx={{ mt: 2 }}
              />

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Room Features
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={newRoom.settings.allowChat}
                    onChange={(e) => setNewRoom({
                      ...newRoom,
                      settings: { ...newRoom.settings, allowChat: e.target.checked }
                    })}
                  />
                }
                label="Allow Chat"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newRoom.settings.allowWhiteboard}
                    onChange={(e) => setNewRoom({
                      ...newRoom,
                      settings: { ...newRoom.settings, allowWhiteboard: e.target.checked }
                    })}
                  />
                }
                label="Allow Whiteboard"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newRoom.settings.allowFileSharing}
                    onChange={(e) => setNewRoom({
                      ...newRoom,
                      settings: { ...newRoom.settings, allowFileSharing: e.target.checked }
                    })}
                  />
                }
                label="Allow File Sharing"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newRoom.settings.allowVideoCall}
                    onChange={(e) => setNewRoom({
                      ...newRoom,
                      settings: { ...newRoom.settings, allowVideoCall: e.target.checked }
                    })}
                  />
                }
                label="Allow Video Calls"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <AnimatedButton
              onClick={handleCreateRoom}
              variant="contained"
              cybertheme="cyan"
              disabled={!newRoom.name || !newRoom.subject || createLoading}
            >
              {createLoading ? 'Creating...' : 'Create Room'}
            </AnimatedButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Dashboard;
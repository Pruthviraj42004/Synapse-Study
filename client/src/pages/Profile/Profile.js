import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Typography, 
  Box, 
  Avatar, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Divider,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Container,
  IconButton,
  Badge,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  PhotoCamera as CameraIcon,
  Code as CodeIcon,
  Group as GroupIcon,
  Book as BookIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { updateProfile, getCurrentUser, changePassword, updateStats } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    college: '',
    avatar: '',
    phone: '',
    location: '',
    skills: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  // User statistics
  const [stats, setStats] = useState({
    studyRooms: 0,
    programmingSessions: 0,
    codeProblems: 0,
    totalStudyHours: 0
  });

  useEffect(() => {
    // If no user data, fetch it
    if (!user) {
      dispatch(getCurrentUser());
    } else {
      // Update profile data with user data
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        college: user.college || '',
        avatar: user.avatar || '',
        phone: user.phone || '',
        location: user.location || '',
        skills: user.skills?.join(', ') || '',
      });
      
      // Also update the achievements and activity data if available
      if (user.achievements) {
        // Update achievements
      }
      
      if (user.recentActivity) {
        // Update recent activity
      }
      
      if (user.stats) {
        setStats({
          studyRooms: user.stats.studyRooms || 0,
          programmingSessions: user.stats.programmingSessions || 0,
          codeProblems: user.stats.codeProblems || 0,
          totalStudyHours: user.stats.totalStudyHours || 0
        });
      }
    }
  }, [user, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert comma-separated skills to array
    const formattedData = {
      ...profileData,
      skills: profileData.skills ? profileData.skills.split(',').map(skill => skill.trim()) : []
    };
    
    try {
      await dispatch(updateProfile(formattedData)).unwrap();
      // Success notification is shown by the updateProfile action via toast
      setEditMode(false);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing again
    if (passwordError) {
      setPasswordError('');
    }
  };
  
  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      // Dispatch the action to change password
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      handleClosePasswordDialog();
      // Toast message is shown by the action
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    }
  };
  
  // Update user stats
  const handleUpdateStats = async (newStats) => {
    try {
      await dispatch(updateStats(newStats)).unwrap();
      setStats(newStats);
    } catch (error) {
      // Error is handled by the action
    }
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
  };

  const handleViewProgramming = () => {
    navigate('/programming');
  };

  const handleViewStudyRooms = () => {
    navigate('/study-rooms');
  };

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Information Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton sx={{ bgcolor: 'primary.main', color: 'white', width: 32, height: 32 }}>
                    <CameraIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                }
              >
                <Avatar
                  src={user.avatar || 'https://via.placeholder.com/150'}
                  alt={user.name}
                  sx={{ width: 120, height: 120, mb: 2, boxShadow: 3 }}
                />
              </Badge>
              <Typography variant="h5" gutterBottom>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" align="center">{user.bio || 'No bio available'}</Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {user.skills && user.skills.map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              {user.college && (
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="College" 
                    secondary={user.college} 
                  />
                </ListItem>
              )}
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email} 
                />
              </ListItem>
              
              {user.phone && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={user.phone} 
                  />
                </ListItem>
              )}
              
              {user.location && (
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={user.location} 
                  />
                </ListItem>
              )}
            </List>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                fullWidth
              >
                Edit Profile
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => setPasswordDialogOpen(true)}
                fullWidth
              >
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          {editMode ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Edit Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="name"
                      label="Full Name"
                      value={profileData.name}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="email"
                      label="Email"
                      value={profileData.email}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="college"
                      label="College"
                      value={profileData.college}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="phone"
                      label="Phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="location"
                      label="Location"
                      value={profileData.location}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="skills"
                      label="Skills (comma separated)"
                      value={profileData.skills}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      helperText="Enter skills separated by commas: JavaScript, React, Python"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="bio"
                      label="Bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Your Activity
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardHeader title="Programming Activity" />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CodeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {stats.programmingSessions} Code Sessions
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        onClick={handleViewProgramming}
                      >
                        Go to Programming
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardHeader title="Study Rooms" />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <GroupIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {stats.studyRooms} Study Rooms
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary"
                        fullWidth
                        onClick={handleViewStudyRooms}
                      >
                        View Study Rooms
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Learning Progress" 
                      avatar={<BookIcon color="primary" />}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                            <Typography variant="h6" color="primary">
                              {stats.codeProblems}
                            </Typography>
                            <Typography variant="body2">Code Problems Solved</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                            <Typography variant="h6" color="primary">
                              {stats.totalStudyHours}
                            </Typography>
                            <Typography variant="body2">Total Study Hours</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={() => handleUpdateStats({
                              studyRooms: stats.studyRooms + 1,
                              programmingSessions: stats.programmingSessions + 1,
                              codeProblems: stats.codeProblems + 5,
                              totalStudyHours: stats.totalStudyHours + 2
                            })}
                          >
                            Update Progress (+)
                          </Button>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
                        Track your learning progress and achievements
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                        {['JavaScript', 'Python', 'Java', 'React'].map((skill, i) => {
                          const progress = Math.floor(Math.random() * 100);
                          return (
                            <Box key={i} sx={{ width: '100%', mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">{skill}</Typography>
                                <Typography variant="body2">{progress}%</Typography>
                              </Box>
                              <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                                <Box 
                                  sx={{ 
                                    width: `${progress}%`, 
                                    bgcolor: progress < 30 ? 'error.main' : progress < 70 ? 'warning.main' : 'success.main',
                                    height: 10
                                  }} 
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Achievements" 
                      avatar={<StarIcon color="primary" />}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        {[
                          { title: "First Study Room", description: "Created your first study room", date: "2023-09-01" },
                          { title: "Code Master", description: "Completed 50 programming challenges", date: "2023-10-15" },
                          { title: "Team Player", description: "Collaborated in 10 study rooms", date: "2023-11-20" }
                        ].map((achievement, i) => (
                          <Grid item xs={12} key={i}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                {i + 1}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1">{achievement.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{achievement.description}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Earned on {new Date(achievement.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            To change your password, please enter your current password and then your new password twice.
          </DialogContentText>
          
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
          />
          
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            helperText="Password must be at least 8 characters"
          />
          
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            error={!!passwordError}
            helperText={passwordError || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
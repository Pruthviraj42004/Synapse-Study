import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences, changePassword } from '../../redux/slices/authSlice';
import {
  Typography,
  Box,
  Container,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  VpnKey as PasswordIcon,
  ColorLens as ThemeIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    fontScale: parseFloat(localStorage.getItem('fontScale') || '1'),
    colorTheme: localStorage.getItem('colorTheme') || 'blue',
    animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
    compactMode: localStorage.getItem('compactMode') === 'true',
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newMessages: true,
    studyRoomUpdates: true,
    newChallenges: true,
    programmingFeatures: true,
    soundEnabled: true,
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareProfile: true,
    publicCode: false,
    showActivity: true,
    showCollege: true,
  });
  
  // Language settings
  const [languageSettings, setLanguageSettings] = useState({
    language: 'english',
    codeEditor: 'javascript',
  });
  
  // Session management
  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Chrome / Windows',
      location: 'New York, US',
      lastActive: '2025-09-24T10:30:00',
      current: true,
    },
    {
      id: '2',
      device: 'Mobile / iOS',
      location: 'Boston, US',
      lastActive: '2025-09-23T18:45:00',
      current: false,
    },
  ]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Handle save theme settings
  const handleSaveThemeSettings = () => {
    // Save to localStorage for persistence
    localStorage.setItem('darkMode', themeSettings.darkMode);
    localStorage.setItem('fontScale', themeSettings.fontScale);
    localStorage.setItem('colorTheme', themeSettings.colorTheme);
    localStorage.setItem('animationsEnabled', themeSettings.animationsEnabled);
    localStorage.setItem('compactMode', themeSettings.compactMode);
    
    // Save to backend via Redux
    dispatch(updatePreferences({
      theme: {
        darkMode: themeSettings.darkMode,
        fontScale: themeSettings.fontScale,
        colorTheme: themeSettings.colorTheme,
        animationsEnabled: themeSettings.animationsEnabled,
        compactMode: themeSettings.compactMode
      }
    }));
    
    setNotification({
      open: true,
      message: 'Theme settings saved successfully! Changes will take effect after reload.',
      severity: 'success'
    });
  };
  
  // Handle save notification settings
  const handleSaveNotificationSettings = () => {
    // Save to backend via Redux
    dispatch(updatePreferences({
      notifications: {
        ...notificationSettings
      }
    }));
    
    setNotification({
      open: true,
      message: 'Notification settings updated successfully!',
      severity: 'success'
    });
  };
  
  // Handle save privacy settings
  const handleSavePrivacySettings = () => {
    // Save to backend via Redux
    dispatch(updatePreferences({
      privacy: {
        ...privacySettings
      }
    }));
    
    setNotification({
      open: true,
      message: 'Privacy settings updated successfully!',
      severity: 'success'
    });
  };
  
  // Handle save language settings
  const handleSaveLanguageSettings = () => {
    // Save to backend via Redux
    dispatch(updatePreferences({
      language: {
        ...languageSettings
      }
    }));
    
    setNotification({
      open: true,
      message: 'Language settings updated successfully!',
      severity: 'success'
    });
  };
  
  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit password change
  const handleSubmitPasswordChange = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      // Dispatch the changePassword action
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      // Reset form and close dialog
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      setShowPasswordDialog(false);
      
      setNotification({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
    } catch (error) {
      setPasswordError(error || "Failed to change password");
    }
  };
  
  // Handle session revoke
  const handleRevokeSession = (sessionId) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
    
    setNotification({
      open: true,
      message: 'Session revoked successfully!',
      severity: 'success'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your account settings and preferences
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Theme" icon={<ThemeIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Privacy" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Language & Editor" icon={<LanguageIcon />} iconPosition="start" />
          <Tab label="Sessions" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {/* Theme Settings Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Appearance Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Customize the look and feel of the application
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Theme Mode
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <LightModeIcon sx={{ mr: 1 }} />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={themeSettings.darkMode}
                            onChange={(e) => setThemeSettings({
                              ...themeSettings,
                              darkMode: e.target.checked
                            })}
                          />
                        }
                        label="Dark Mode"
                      />
                      <DarkModeIcon sx={{ ml: 1 }} />
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Font Size
                    </Typography>
                    <Box sx={{ width: '100%', mt: 2, mb: 3 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                          <Slider
                            value={themeSettings.fontScale}
                            min={0.8}
                            max={1.4}
                            step={0.1}
                            marks={[
                              { value: 0.8, label: 'S' },
                              { value: 1, label: 'M' },
                              { value: 1.2, label: 'L' },
                              { value: 1.4, label: 'XL' },
                            ]}
                            onChange={(_, value) => setThemeSettings({
                              ...themeSettings,
                              fontScale: value
                            })}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Color Theme
                    </Typography>
                    <FormControl fullWidth margin="normal">
                      <Select
                        value={themeSettings.colorTheme}
                        onChange={(e) => setThemeSettings({
                          ...themeSettings,
                          colorTheme: e.target.value
                        })}
                      >
                        <MenuItem value="blue">Blue (Default)</MenuItem>
                        <MenuItem value="purple">Purple</MenuItem>
                        <MenuItem value="green">Green</MenuItem>
                        <MenuItem value="orange">Orange</MenuItem>
                        <MenuItem value="pink">Pink</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Additional Settings
                    </Typography>
                    
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Enable Animations" 
                          secondary="Smoother transitions between pages and elements"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={themeSettings.animationsEnabled}
                            onChange={(e) => setThemeSettings({
                              ...themeSettings,
                              animationsEnabled: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Compact Mode" 
                          secondary="Reduce spacing between elements"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={themeSettings.compactMode}
                            onChange={(e) => setThemeSettings({
                              ...themeSettings,
                              compactMode: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveThemeSettings}
                  >
                    Save Theme Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {/* Notifications Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Control how and when you receive notifications
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Email Notifications" 
                          secondary="Receive notifications via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="New Messages" 
                          secondary="Notifications for new messages"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notificationSettings.newMessages}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              newMessages: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Study Room Updates" 
                          secondary="Notifications for study room activities"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notificationSettings.studyRoomUpdates}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              studyRoomUpdates: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="New Challenges" 
                          secondary="Notifications for new programming challenges"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notificationSettings.newChallenges}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              newChallenges: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Programming Features" 
                          secondary="Updates about new programming features"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notificationSettings.programmingFeatures}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              programmingFeatures: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Sound Notifications" 
                          secondary="Play sounds for important notifications"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={notificationSettings.soundEnabled}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              soundEnabled: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveNotificationSettings}
                  >
                    Save Notification Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {/* Privacy Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Privacy & Security
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your privacy settings and account security
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Privacy Settings
                    </Typography>
                    
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Public Profile" 
                          secondary="Allow other users to see your profile"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={privacySettings.shareProfile}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              shareProfile: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Public Code" 
                          secondary="Make your code sessions public by default"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={privacySettings.publicCode}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              publicCode: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Activity Status" 
                          secondary="Show when you're active"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={privacySettings.showActivity}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              showActivity: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="Show College" 
                          secondary="Display your college information"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={privacySettings.showCollege}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              showCollege: e.target.checked
                            })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSavePrivacySettings}
                  >
                    Save Privacy Settings
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Security Settings
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<PasswordIcon />}
                        onClick={() => setShowPasswordDialog(true)}
                        fullWidth
                      >
                        Change Password
                      </Button>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        color="error"
                        fullWidth
                      >
                        Delete Account
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        This action is permanent and cannot be undone
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Language & Editor Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Language & Editor Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Customize language and code editor preferences
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Application Language
                    </Typography>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={languageSettings.language}
                        label="Language"
                        onChange={(e) => setLanguageSettings({
                          ...languageSettings,
                          language: e.target.value
                        })}
                      >
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="spanish">Spanish</MenuItem>
                        <MenuItem value="french">French</MenuItem>
                        <MenuItem value="german">German</MenuItem>
                        <MenuItem value="chinese">Chinese</MenuItem>
                        <MenuItem value="japanese">Japanese</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Code Editor Settings
                    </Typography>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Default Programming Language</InputLabel>
                      <Select
                        value={languageSettings.codeEditor}
                        label="Default Programming Language"
                        onChange={(e) => setLanguageSettings({
                          ...languageSettings,
                          codeEditor: e.target.value
                        })}
                      >
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="python">Python</MenuItem>
                        <MenuItem value="java">Java</MenuItem>
                        <MenuItem value="cpp">C++</MenuItem>
                        <MenuItem value="csharp">C#</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveLanguageSettings}
                  >
                    Save Language Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {/* Sessions Tab */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your active login sessions
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <List>
                      {sessions.map((session) => (
                        <React.Fragment key={session.id}>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <>
                                  {session.device} {session.current && <Chip size="small" label="Current" color="primary" />}
                                </>
                              } 
                              secondary={`${session.location} • Last active: ${new Date(session.lastActive).toLocaleString()}`}
                            />
                            <ListItemSecondaryAction>
                              {!session.current && (
                                <IconButton 
                                  edge="end" 
                                  aria-label="revoke" 
                                  onClick={() => handleRevokeSession(session.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </ListItemSecondaryAction>
                          </ListItem>
                          {session.id !== sessions[sessions.length - 1].id && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => {
                      setSessions(sessions.filter(session => session.current));
                      setNotification({
                        open: true,
                        message: 'All other sessions have been revoked!',
                        severity: 'success'
                      });
                    }}
                  >
                    Revoke All Other Sessions
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => {
        setShowPasswordDialog(false);
        setPasswordError('');
      }}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your current password and a new password to update your credentials.
          </DialogContentText>
          <TextField
            margin="normal"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="normal"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="normal"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowPasswordDialog(false);
            setPasswordError('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleSubmitPasswordChange} variant="contained" disabled={
            !passwordData.currentPassword || 
            !passwordData.newPassword || 
            !passwordData.confirmPassword
          }>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
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
    </Container>
  );
};

export default Settings;
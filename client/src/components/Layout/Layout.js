import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Announcement as AnnouncementIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  AutoAwesome as SmartDrawIcon,
  Mic as VoiceIcon,
} from '@mui/icons-material';
import { logoutUser } from '../../redux/slices/authSlice';
import FloatingChatbot from '../Chat/FloatingChatbot/FloatingChatbot';

const DRAWER_WIDTH = 240;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notification.notifications);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  // Different menu items for each role
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const studentMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Study Rooms', icon: <GroupIcon />, path: '/study-rooms' },
    { text: 'News & Announcements', icon: <AnnouncementIcon />, path: '/newsletters' },
    { text: 'Study Resources', icon: <SchoolIcon />, path: '/resources' },
    { text: 'Programming', icon: <CodeIcon />, path: '/programming-playground' },
    { divider: true },
    { text: 'Smart Draw', icon: <SmartDrawIcon sx={{ color: '#9c27b0' }} />, path: '/smart-draw' },
    { text: 'J.A.R.V.I.S.', icon: <VoiceIcon sx={{ color: '#00f0ff' }} />, path: '/jarvis' },
    { text: 'College Knowledge (RAG)', icon: <SchoolIcon sx={{ color: '#4caf50' }} />, path: '/rag-knowledge' },
    { divider: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const teacherMenuItems = [
    { text: 'Teacher Dashboard', icon: <DashboardIcon />, path: '/teacher-dashboard' },
    { divider: true },
    { text: 'Upload Resource', icon: <SchoolIcon sx={{ color: '#1976d2' }} />, path: '/resources/upload' },
    { text: 'Post Newsletter', icon: <AnnouncementIcon sx={{ color: '#9c27b0' }} />, path: '/newsletters/create' },
    { divider: true },
    { text: 'View Resources', icon: <SchoolIcon />, path: '/resources' },
    { text: 'View Newsletters', icon: <AnnouncementIcon />, path: '/newsletters' },
    { divider: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <DashboardIcon sx={{ color: '#f44336' }} />, path: '/admin-dashboard' },
    { divider: true },
    { text: 'Verify Teachers', icon: <GroupIcon sx={{ color: '#ff9800' }} />, path: '/admin-dashboard' },
    { divider: true },
    { text: 'Study Rooms', icon: <GroupIcon />, path: '/study-rooms' },
    { text: 'Newsletters', icon: <AnnouncementIcon />, path: '/newsletters' },
    { text: 'Resources', icon: <SchoolIcon />, path: '/resources' },
    { divider: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const menuItems = isAdmin ? adminMenuItems : isTeacher ? teacherMenuItems : studentMenuItems;

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, rgba(0,240,255,0.03) 0%, rgba(124,58,237,0.03) 100%)' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 3 }}>
        <Typography
          variant="h5"
          component="div"
          noWrap
          className="animated-gradient-text"
          sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          StudySphere
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.2)' }} />
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 2, borderColor: 'rgba(0, 240, 255, 0.1)' }} />
          ) : (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(124,58,237,0.15))',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(124,58,237,0.2))',
                    }
                  },
                  '&:hover': {
                    background: 'rgba(0,240,255,0.08)',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 'bold' : 'medium',
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          background: 'rgba(22, 22, 29, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'StudySphere'}
          </Typography>

          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{
              '&:hover': {
                background: 'rgba(0, 240, 255, 0.1)'
              }
            }}
          >
            <Badge
              badgeContent={unreadNotifications}
              sx={{
                '& .MuiBadge-badge': {
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  boxShadow: unreadNotifications > 0 ? '0 0 16px rgba(240, 147, 251, 0.6)' : 'none',
                  animation: unreadNotifications > 0 ? 'pulse-glow-anim 2s ease-in-out infinite' : 'none'
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Button
            color="inherit"
            onClick={handleMenuOpen}
            startIcon={
              <Avatar
                alt={user?.name}
                src={user?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            }
            sx={{
              ml: 1,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(0, 240, 255, 0.1)'
              }
            }}
          >
            {isMobile ? '' : user?.name}
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>

      {/* Global AI Assistant - available across protected pages */}
      <FloatingChatbot />

      {/* User Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            maxHeight: '300px',
            width: '350px',
          },
        }}
      >
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography variant="subtitle1">Notifications</Typography>
        </MenuItem>
        <Divider />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleNotificationMenuClose}
              sx={{
                whiteSpace: 'normal',
                bgcolor: notification.read ? 'transparent' : 'action.hover'
              }}
            >
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
                primaryTypographyProps={{ variant: 'body2', fontWeight: notification.read ? 'normal' : 'bold' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem>
            <ListItemText
              primary="No notifications"
              primaryTypographyProps={{ variant: 'body2', textAlign: 'center' }}
            />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Layout;
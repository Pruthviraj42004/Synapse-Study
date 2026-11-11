import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import studyRoomService from '../../services/studyRoomService';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Container,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  People,
  AccessTime,
  School,
  Subject,
  Lock,
  Public,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { bangaloreColleges } from '../../data/colleges';

const categories = [
  'All',
  'Math',
  'Science',
  'History',
  'Literature',
  'Programming',
  'Languages',
  'Arts',
  'Other'
];

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Room name must be at least 2 characters')
    .max(100, 'Room name cannot exceed 100 characters')
    .required('Room name is required'),
  subject: Yup.string()
    .required('Subject is required'),
  category: Yup.string()
    .required('Category is required'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters'),
  maxParticipants: Yup.number()
    .min(2, 'Minimum 2 participants required')
    .max(100, 'Maximum 100 participants allowed')
    .required('Maximum participants is required'),
  isPrivate: Yup.boolean(),
  password: Yup.string()
    .when('isPrivate', {
      is: true,
      then: (schema) => schema.required('Password is required for private rooms'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const StudyRooms = () => {
  const { user } = useSelector((state) => state.auth);
  const [studyRooms, setStudyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch study rooms from API
  useEffect(() => {
    const fetchStudyRooms = async () => {
      setLoading(true);
      try {
        const response = await studyRoomService.getStudyRooms();
        setStudyRooms(response.rooms || []);
      } catch (err) {
        console.error('Error fetching study rooms:', err);
        setError('Failed to load study rooms');
      } finally {
        setLoading(false);
      }
    };

    if (user?.college) {
      fetchStudyRooms();
    }
  }, [user?.college]);

  const formik = useFormik({
    initialValues: {
      name: '',
      subject: '',
      category: '',
      description: '',
      maxParticipants: 20,
      isPrivate: false,
      password: '',
      settings: {
        allowVideoCall: true,
        allowChat: true,
        allowWhiteboard: true,
        allowFileSharing: true
      }
    },
    validationSchema,
    onSubmit: async (values) => {
      setCreateLoading(true);
      try {
        // Add college to the room data
        const roomData = {
          ...values,
          college: user.college,
        };

        // Call the API to create the room
        const newRoom = await studyRoomService.createStudyRoom(roomData);
        // Make sure creator is properly set for the new room
        if (!newRoom.creator) {
          newRoom.creator = { name: user.name || "You" };
        }

        // Add to the list of rooms
        setStudyRooms(prev => [newRoom, ...prev]);
        setCreateDialogOpen(false);
        formik.resetForm();
      } catch (err) {
        console.error('Error creating study room:', err);
        setError('Failed to create study room');
      } finally {
        setCreateLoading(false);
      }
    },
  });

  const filteredRooms = studyRooms.filter(room => {
    // Skip invalid rooms
    if (!room || typeof room !== 'object') {
      console.warn('Invalid room object:', room);
      return false;
    }

    // Check if essential room properties exist to avoid runtime errors
    if (!room.name || !room.subject) {
      console.warn('Room with missing essential properties found:', room);
      return false;
    }

    // Safety check for search operations
    try {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description ? room.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
      const matchesCategory = categoryFilter === 'All' || room.category === categoryFilter;
      return matchesSearch && matchesCategory;
    } catch (err) {
      console.error('Error filtering room:', err, room);
      return false;
    }
  });

  const getCollegeName = (collegeValue) => {
    const college = bangaloreColleges.find(c => c.value === collegeValue);
    return college ? college.label : collegeValue;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Study Rooms - StudySphere</title>
        <meta name="description" content="Browse and join study rooms from your college" />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Study Rooms
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Showing groups from {getCollegeName(user?.college)}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Search and Filter */}
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Search study rooms..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 300, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={() => window.location.href = '/peer-matching'}
              color="secondary"
            >
              Find Study Partners
            </Button>
          </Box>
        </Box>

        {/* Study Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <Box textAlign="center" py={8}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No study rooms found from your college
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Be the first to create a study room for {getCollegeName(user?.college)}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Study Room
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Room Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" component="h3" noWrap>
                        {room.name}
                      </Typography>
                      {room.isPrivate ? (
                        <Lock fontSize="small" color="action" />
                      ) : (
                        <Public fontSize="small" color="action" />
                      )}
                    </Box>

                    {/* Subject and Category */}
                    <Box mb={2}>
                      <Chip
                        label={room.subject}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                        icon={<Subject />}
                      />
                      <Chip
                        label={room.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {room.description}
                    </Typography>

                    {/* Creator */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        {room.creator && room.creator.name ? room.creator.name.charAt(0) : "?"}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        Created by {room.creator && room.creator.name ? room.creator.name : "Unknown"}
                      </Typography>
                    </Box>

                    {/* Participants */}
                    <Box display="flex" alignItems="center" mb={1}>
                      <People fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {room.participants.length}/{room.maxParticipants} participants
                      </Typography>
                    </Box>

                    {/* Created Date */}
                    <Box display="flex" alignItems="center">
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(room.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={room.participants.length >= room.maxParticipants}
                      onClick={async () => {
                        try {
                          await studyRoomService.joinStudyRoom(room._id);
                          // Navigate to the room
                          window.location.href = `/study-room/${room._id}`;
                        } catch (err) {
                          console.error('Error joining room:', err);
                          setError('Failed to join study room');
                        }
                      }}
                    >
                      {room.participants.length >= room.maxParticipants ? 'Full' : 'Join Room'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Room FAB */}
        <Fab
          color="primary"
          aria-label="create study room"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <Add />
        </Fab>

        {/* Create Room Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Study Room</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Room Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
                autoFocus
              />

              <TextField
                fullWidth
                id="subject"
                name="subject"
                label="Subject"
                value={formik.values.subject}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
                margin="normal"
              />

              <FormControl
                fullWidth
                margin="normal"
                error={formik.touched.category && Boolean(formik.errors.category)}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  id="category"
                  name="category"
                  value={formik.values.category}
                  label="Category"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {categories.slice(1).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText>{formik.errors.category}</FormHelperText>
                )}
              </FormControl>

              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                margin="normal"
              />

              <TextField
                fullWidth
                id="maxParticipants"
                name="maxParticipants"
                label="Maximum Participants"
                type="number"
                value={formik.values.maxParticipants}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.maxParticipants && Boolean(formik.errors.maxParticipants)}
                helperText={formik.touched.maxParticipants && formik.errors.maxParticipants}
                margin="normal"
                inputProps={{ min: 2, max: 100 }}
              />

              {formik.values.isPrivate && (
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Room Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  margin="normal"
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button
              onClick={formik.handleSubmit}
              variant="contained"
              disabled={createLoading}
            >
              {createLoading ? <CircularProgress size={20} /> : 'Create Room'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default StudyRooms;
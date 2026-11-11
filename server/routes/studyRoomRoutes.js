const express = require('express');
const auth = require('../middleware/auth');
const {
  getStudyRooms,
  getUserStudyRooms,
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  updateStudyRoom,
  deleteStudyRoom
} = require('../controllers/studyRoomController');
const studyRoomProgrammingRoutes = require('./studyRoomProgrammingRoutes');

const router = express.Router();

// Get all public study rooms
router.get('/', auth, getStudyRooms);

// Get user's study rooms (created + joined)
router.get('/my-rooms', auth, getUserStudyRooms);

// Create a new study room
router.post('/', auth, createStudyRoom);

// Get a specific study room
router.get('/:id', auth, getStudyRoom);

// Join a study room
router.post('/:id/join', auth, joinStudyRoom);

// Leave a study room
router.post('/:id/leave', auth, leaveStudyRoom);

// Update a study room
router.put('/:id', auth, updateStudyRoom);

// Delete a study room
router.delete('/:id', auth, deleteStudyRoom);

// Programming routes - Note that we use :roomId instead of :id to match our controller
router.use('/:roomId/programming', studyRoomProgrammingRoutes);

module.exports = router;
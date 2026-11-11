const StudyRoom = require('../models/StudyRoom');
const User = require('../models/User');
const livekitService = require('../services/livekitService');

// Get all study rooms (filtered by user's college)
const getStudyRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subject = '' } = req.query;

    // Get user's college to filter rooms
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const query = {
      $and: [
        { college: user.college }, // Filter by user's college
        search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        } : {},
        subject ? { subject: { $regex: subject, $options: 'i' } } : {},
        { isPrivate: false } // Only show public rooms in general listing
      ]
    };

    const rooms = await StudyRoom.find(query)
      .populate('creator', 'name email avatar college')
      .populate('participants.user', 'name email avatar college')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudyRoom.countDocuments(query);

    res.json({
      rooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting study rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's study rooms (created + joined)
const getUserStudyRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get rooms created by user
    const createdRooms = await StudyRoom.find({ creator: userId })
      .populate('creator', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ createdAt: -1 });

    // Get rooms where user is a participant
    const joinedRooms = await StudyRoom.find({
      'participants.user': userId,
      creator: { $ne: userId } // Exclude rooms created by user
    })
      .populate('creator', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ 'stats.lastActivity': -1 });

    res.json({
      createdRooms,
      joinedRooms,
      totalRooms: createdRooms.length + joinedRooms.length
    });
  } catch (error) {
    console.error('Error getting user study rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new study room
const createStudyRoom = async (req, res) => {
  try {
    const { name, description, subject, category, maxParticipants, isPrivate, password, settings } = req.body;

    // Validate required fields
    if (!name || !subject) {
      return res.status(400).json({ message: 'Name and subject are required' });
    }

    // Get user's college
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const studyRoom = new StudyRoom({
      name,
      description,
      subject,
      category: category || 'Other',
      college: user.college, // Set college from user
      creator: req.user.id,
      participants: [{
        user: req.user.id,
        role: 'owner',
        joinedAt: new Date()
      }],
      maxParticipants: maxParticipants || 20,
      isPrivate: isPrivate || false,
      password: isPrivate && password ? password : null,
      settings: {
        allowChat: settings?.allowChat !== false,
        allowWhiteboard: settings?.allowWhiteboard !== false,
        allowFileSharing: settings?.allowFileSharing !== false,
        allowVideoCall: settings?.allowVideoCall !== false,
        requireApproval: settings?.requireApproval || false,
        muteParticipants: settings?.muteParticipants || false,
        ...settings
      }
    });

    await studyRoom.save();
    await studyRoom.populate('creator', 'name email avatar');
    await studyRoom.populate('participants.user', 'name email avatar');

    res.status(201).json(studyRoom);
  } catch (error) {
    console.error('Error creating study room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific study room
const getStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await StudyRoom.findById(id)
      .populate('creator', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    if (!room) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Check if user has access to the room
    const isParticipant = room.participants.some(p => p.user._id.toString() === req.user.id);
    const isCreator = room.creator._id.toString() === req.user.id;

    if (room.isPrivate && !isParticipant && !isCreator) {
      return res.status(403).json({ message: 'Access denied to private room' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error getting study room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join a study room
const joinStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const room = await StudyRoom.findById(id);

    if (!room) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ message: 'Study room is full' });
    }

    // Get user info for LiveKit
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a participant
    const isExistingParticipant = room.participants.some(p => p.user.toString() === userId);

    if (!isExistingParticipant) {
      room.participants.push({
        user: userId,
        role: 'participant',
        joinedAt: new Date()
      });
    }

    room.stats.lastActivity = new Date();
    await room.save();

    await room.populate('creator', 'name email avatar');
    await room.populate('participants.user', 'name email avatar');

    // Generate LiveKit token if LiveKit is configured
    let livekitToken = null;
    let livekitUrl = null;

    if (livekitService.isConfigured()) {
      try {
        // Use room ID as the LiveKit room name
        const livekitRoomName = `study_room_${id}`;

        // Create unique identity per session to allow same user on multiple devices
        // Format: {userId}_{timestamp} - ensures uniqueness while keeping user identifiable
        const sessionId = Date.now().toString(36);
        const participantIdentity = `${userId}_${sessionId}`;

        livekitToken = await livekitService.generateToken(
          livekitRoomName,
          participantIdentity,
          user.name,
          { canPublish: true, canSubscribe: true, canPublishData: true }
        );
        livekitUrl = livekitService.serverUrl;

        console.log(`🎤 Generated LiveKit token for user ${user.name} (${participantIdentity}) in room ${room.name}`);
      } catch (error) {
        console.error('Error generating LiveKit token:', error);
        // Continue without LiveKit - audio will be unavailable
      }
    }

    // Return enhanced response with room data and LiveKit info
    res.json({
      ...room.toJSON(),
      livekitToken,
      livekitUrl
    });
  } catch (error) {
    console.error('Error joining study room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave a study room
const leaveStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const room = await StudyRoom.findById(id);

    if (!room) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Creator cannot leave their own room, they need to delete it
    if (room.creator.toString() === userId) {
      return res.status(400).json({ message: 'Creator cannot leave room. Delete the room instead.' });
    }

    // Remove user from participants
    room.participants = room.participants.filter(p => p.user.toString() !== userId);
    room.stats.lastActivity = new Date();
    await room.save();

    res.json({ message: 'Left study room successfully' });
  } catch (error) {
    console.error('Error leaving study room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update study room
const updateStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subject, maxParticipants, isPrivate, settings } = req.body;

    const room = await StudyRoom.findById(id);

    if (!room) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Only creator can update the room
    if (room.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can update the room' });
    }

    // Update fields
    if (name) room.name = name;
    if (description !== undefined) room.description = description;
    if (subject) room.subject = subject;
    if (maxParticipants) room.maxParticipants = maxParticipants;
    if (isPrivate !== undefined) room.isPrivate = isPrivate;
    if (settings) room.settings = { ...room.settings, ...settings };

    room.stats.lastActivity = new Date();
    await room.save();

    await room.populate('creator', 'name email avatar');
    await room.populate('participants.user', 'name email avatar');

    res.json(room);
  } catch (error) {
    console.error('Error updating study room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete study room
const deleteStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await StudyRoom.findById(id);

    if (!room) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    // Only creator can delete the room
    if (room.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can delete the room' });
    }

    await StudyRoom.findByIdAndDelete(id);

    res.json({ message: 'Study room deleted successfully' });
  } catch (error) {
    console.error('Error deleting study room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudyRooms,
  getUserStudyRooms,
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  updateStudyRoom,
  deleteStudyRoom
};
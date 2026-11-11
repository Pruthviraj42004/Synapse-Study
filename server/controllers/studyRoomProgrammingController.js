const ProgrammingSession = require('../models/ProgrammingSession');
const StudyRoom = require('../models/StudyRoom');
const User = require('../models/User');
const codeExecutionService = require('../services/codeExecutionService');

/**
 * @desc    Get programming session for study room
 * @route   GET /api/study-rooms/:roomId/programming
 * @access  Private (study room participants)
 */
exports.getProgrammingSession = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Check if user is participant of study room
    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    if (!studyRoom.isParticipant(userId) && studyRoom.creator.toString() !== userId) {
      return res.status(403).json({ message: 'You are not a participant of this study room' });
    }

    // Check if programming is allowed in the room
    if (!studyRoom.settings.allowProgramming) {
      return res.status(403).json({ message: 'Programming feature is disabled in this room' });
    }

    // Find or create programming session for this room
    let session = await ProgrammingSession.findOne({ studyRoom: roomId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('lastEditedBy', 'name');

    if (!session) {
      // Create a new session if none exists
      session = await ProgrammingSession.create({
        studyRoom: roomId,
        title: `${studyRoom.name} - Programming Session`,
        language: 'javascript',
        code: '// Welcome to collaborative programming!\nconsole.log("Hello, world!");',
        lastEditedBy: userId
      });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error('Error getting programming session:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update programming session code
 * @route   PUT /api/study-rooms/:roomId/programming
 * @access  Private (study room participants)
 */
exports.updateCode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    // Validate input
    if (code === undefined) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // Check if user is participant of study room
    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      return res.status(404).json({ message: 'Study room not found' });
    }

    if (!studyRoom.isParticipant(userId) && studyRoom.creator.toString() !== userId) {
      return res.status(403).json({ message: 'You are not a participant of this study room' });
    }

    // Check if programming is allowed in the room
    if (!studyRoom.settings.allowProgramming) {
      return res.status(403).json({ message: 'Programming feature is disabled in this room' });
    }

    // Find or create programming session for this room
    let session = await ProgrammingSession.findOne({ studyRoom: roomId, isActive: true })
      .sort({ createdAt: -1 });

    if (!session) {
      // Create a new session if none exists
      session = await ProgrammingSession.create({
        studyRoom: roomId,
        title: `${studyRoom.name} - Programming Session`,
        language: language || 'javascript',
        code,
        lastEditedBy: userId
      });
    } else {
      // Update existing session
      session.code = code;
      if (language) {
        session.language = language;
      }
      session.lastEditedBy = userId;
      await session.save();
    }

    return res.status(200).json({ message: 'Code updated successfully', session });
  } catch (error) {
    console.error('Error updating programming code:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Execute programming session code
 * @route   POST /api/study-rooms/:roomId/programming/execute
 * @access  Private (study room participants)
 */
exports.executeCode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    console.log('=== CODE EXECUTION REQUEST ===');
    console.log('Room ID:', roomId);
    console.log('User ID:', userId);
    console.log('Language:', language);
    console.log('Code:', code);

    // Validate input
    if (!code) {
      console.log('ERROR: No code provided');
      return res.status(400).json({ message: 'Code is required' });
    }

    if (!language) {
      console.log('ERROR: No language provided');
      return res.status(400).json({ message: 'Language is required' });
    }

    // Check if user is participant of study room
    const studyRoom = await StudyRoom.findById(roomId);
    if (!studyRoom) {
      console.log('ERROR: Study room not found');
      return res.status(404).json({ message: 'Study room not found' });
    }

    if (!studyRoom.isParticipant(userId) && studyRoom.creator.toString() !== userId.toString()) {
      console.log('ERROR: User not authorized');
      return res.status(403).json({ message: 'You are not a participant of this study room' });
    }

    // Check if programming is allowed in the room
    if (!studyRoom.settings.allowProgramming) {
      console.log('ERROR: Programming disabled in room');
      return res.status(403).json({ message: 'Programming feature is disabled in this room' });
    }

    console.log('Executing code...');
    // Execute code
    const result = await codeExecutionService.executeCode(code, language);
    console.log('Execution result:', result);

    // Find programming session for this room
    let session = await ProgrammingSession.findOne({ studyRoom: roomId, isActive: true })
      .sort({ createdAt: -1 });

    if (session) {
      // Add execution result to session
      session.executionResults.unshift({
        output: result.output,
        error: result.error,
        executedAt: new Date(),
        executedBy: userId
      });

      // Limit to the last 10 execution results
      if (session.executionResults.length > 10) {
        session.executionResults = session.executionResults.slice(0, 10);
      }

      await session.save();
    }

    console.log('Sending response:', {
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      success: !result.error
    });

    return res.status(200).json({
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
      success: !result.error
    });
  } catch (error) {
    console.error('ERROR executing code:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      success: false
    });
  }
};
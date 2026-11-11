const ProgrammingSession = require('../../models/ProgrammingSession');
const StudyRoom = require('../../models/StudyRoom');
const User = require('../../models/User');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const codeExecutor = require('../../utils/codeExecutor');

/**
 * @desc    Get or create programming session for a study room
 * @route   GET /api/study-rooms/:roomId/programming
 * @access  Private
 */
exports.getProgrammingSession = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // Check if room exists
  const room = await StudyRoom.findById(roomId);
  if (!room) {
    throw new ApiError('Study room not found', 404);
  }

  // Check if user is participant
  const isParticipant = room.isParticipant(req.user.id) || room.creator._id.toString() === req.user.id;
  if (!isParticipant) {
    throw new ApiError('You must be a participant to access programming sessions', 403);
  }

  // Check if programming is enabled for this room
  if (!room.settings.allowProgramming) {
    throw new ApiError('Programming feature is disabled for this room', 403);
  }

  // Find existing session or create new one
  let session = await ProgrammingSession.findOne({ studyRoom: roomId }).sort({ updatedAt: -1 });

  if (!session) {
    // Create new session with default code
    session = await ProgrammingSession.create({
      studyRoom: roomId,
      title: `${room.name} - Code Session`,
      language: 'javascript',
      code: '// Write your code here\nconsole.log("Hello, StudySphere!");',
      lastEditedBy: req.user.id
    });
  }

  // Populate user information
  session = await session.populate('lastEditedBy', 'name avatar');
  if (session.executionResults && session.executionResults.length > 0) {
    session = await session.populate('executionResults.executedBy', 'name avatar');
  }

  res.json(session);
});

/**
 * @desc    Update code in programming session
 * @route   PUT /api/study-rooms/:roomId/programming
 * @access  Private
 */
exports.updateCode = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { code, language } = req.body;

  if (!code && !language) {
    throw new ApiError('No updates provided', 400);
  }

  // Check if room exists
  const room = await StudyRoom.findById(roomId);
  if (!room) {
    throw new ApiError('Study room not found', 404);
  }

  // Check if user is participant
  const isParticipant = room.isParticipant(req.user.id) || room.creator._id.toString() === req.user.id;
  if (!isParticipant) {
    throw new ApiError('You must be a participant to update code', 403);
  }

  // Check if programming is enabled for this room
  if (!room.settings.allowProgramming) {
    throw new ApiError('Programming feature is disabled for this room', 403);
  }

  // Find the session or create one if it doesn't exist
  let session = await ProgrammingSession.findOne({ studyRoom: roomId }).sort({ updatedAt: -1 });

  if (!session) {
    session = await ProgrammingSession.create({
      studyRoom: roomId,
      title: `${room.name} - Code Session`,
      language: language || 'javascript',
      code: code || '// Write your code here',
      lastEditedBy: req.user.id
    });
  } else {
    // Update existing session
    if (code) session.code = code;
    if (language) session.language = language;
    session.lastEditedBy = req.user.id;
    await session.save();
  }

  // Return updated session
  session = await session.populate('lastEditedBy', 'name avatar');

  res.json(session);
});

/**
 * @desc    Execute code in programming session
 * @route   POST /api/study-rooms/:roomId/programming/execute
 * @access  Private
 */
exports.executeCode = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // Check if room exists
  const room = await StudyRoom.findById(roomId);
  if (!room) {
    throw new ApiError('Study room not found', 404);
  }

  // Check if user is participant
  const isParticipant = room.isParticipant(req.user.id) || room.creator._id.toString() === req.user.id;
  if (!isParticipant) {
    throw new ApiError('You must be a participant to execute code', 403);
  }

  // Check if programming is enabled for this room
  if (!room.settings.allowProgramming) {
    throw new ApiError('Programming feature is disabled for this room', 403);
  }

  // Find the session
  const session = await ProgrammingSession.findOne({ studyRoom: roomId }).sort({ updatedAt: -1 });

  if (!session) {
    throw new ApiError('No programming session found', 404);
  }

  try {
    // Get code and language from request body (current editor content)
    // If not provided, fall back to session code
    const codeToExecute = req.body.code || session.code;
    const languageToExecute = req.body.language || session.language;

    // Use real code execution service with Docker/VM2
    const result = await codeExecutor.executeCode(
      codeToExecute,
      languageToExecute,
      '' // no input for study room execution
    );

    // Store the execution result
    session.executionResults.unshift({
      output: result.success ? result.output : null,
      error: result.success ? null : result.error,
      executedAt: new Date(),
      executedBy: req.user.id
    });

    // Limit execution history to 10 items
    if (session.executionResults.length > 10) {
      session.executionResults = session.executionResults.slice(0, 10);
    }

    await session.save();

    // Return the result
    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
      executedBy: {
        id: req.user.id,
        name: req.user.name
      },
      executedAt: new Date()
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during code execution',
      output: null
    });
  }
});
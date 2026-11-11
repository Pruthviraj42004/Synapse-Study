const StudentProfile = require('../models/StudentProfile');
const aiMatchingService = require('../services/matching/aiMatchingService');

/**
 * @desc    Save/Update student matching preferences
 * @route   POST /api/matching/preferences
 * @access  Private
 */
exports.savePreferences = async (req, res) => {
    try {
        const {
            subjects,
            weakAreas,
            strengths,
            academicYear,
            department,
            currentTopics,
            studyGoals,
            preferredStudyTime,
            learningStyle,
            collaborationPreference,
            openToMatching,
            maxMatchDistance
        } = req.body;

        let profile = await StudentProfile.findOne({ userId: req.user._id });

        if (profile) {
            // Update existing profile
            profile.subjects = subjects || profile.subjects;
            profile.weakAreas = weakAreas || profile.weakAreas;
            profile.strengths = strengths || profile.strengths;
            profile.academicYear = academicYear || profile.academicYear;
            profile.department = department || profile.department;
            profile.currentTopics = currentTopics || profile.currentTopics;
            profile.studyGoals = studyGoals || profile.studyGoals;
            profile.preferredStudyTime = preferredStudyTime || profile.preferredStudyTime;
            profile.learningStyle = learningStyle || profile.learningStyle;
            profile.collaborationPreference = collaborationPreference || profile.collaborationPreference;
            profile.openToMatching = openToMatching !== undefined ? openToMatching : profile.openToMatching;
            profile.maxMatchDistance = maxMatchDistance || profile.maxMatchDistance;

            await profile.save();
        } else {
            // Create new profile
            profile = await StudentProfile.create({
                userId: req.user._id,
                subjects,
                weakAreas,
                strengths,
                academicYear,
                department,
                currentTopics,
                studyGoals,
                preferredStudyTime,
                learningStyle,
                collaborationPreference,
                openToMatching,
                maxMatchDistance
            });
        }

        res.status(200).json({
            success: true,
            message: 'Preferences saved successfully',
            data: profile
        });
    } catch (error) {
        console.error('Save preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save preferences',
            error: error.message
        });
    }
};

/**
 * @desc    Get user's matching preferences
 * @route   GET /api/matching/preferences
 * @access  Private
 */
exports.getPreferences = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Preferences not found. Please complete your profile first.'
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get preferences',
            error: error.message
        });
    }
};

/**
 * @desc    Find AI-matched study peers
 * @route   POST /api/matching/find-peers
 * @access  Private
 */
exports.findPeers = async (req, res) => {
    try {
        const { limit = 5 } = req.body;

        const matches = await aiMatchingService.findMatches(req.user._id, limit);

        res.status(200).json({
            success: true,
            count: matches.length,
            message: matches.length > 0
                ? 'Found compatible study partners'
                : 'No matches found. Update your profile or try again later.',
            data: matches
        });
    } catch (error) {
        console.error('Find peers error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to find study partners',
            error: error.message
        });
    }
};

/**
 * @desc    Accept a match recommendation
 * @route   POST /api/matching/accept/:matchId
 * @access  Private
 */
exports.acceptMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const roomManager = require('../services/roomManager');
        const livekitService = require('../services/livekitService');

        const match = await aiMatchingService.acceptMatch(matchId, req.user._id);
        await match.populate('matchedUserId', 'name email avatar college');

        // Auto-create a study room for this match
        const matchedUser = match.matchedUserId;
        const roomName = `Study Session: ${req.user.name} & ${matchedUser.name}`;

        // Determine common subjects
        const currentUserProfile = await require('../models/StudentProfile').findOne({ userId: req.user._id });
        const matchedUserProfile = await require('../models/StudentProfile').findOne({ userId: matchedUser._id });

        const commonSubjects = currentUserProfile?.subjects?.filter(
            s => matchedUserProfile?.subjects?.includes(s)
        ) || [];
        const subject = commonSubjects[0] || 'General';

        // Create unified room
        const room = await roomManager.createRoom({
            name: roomName,
            description: `Matched study session based on ${match.matchScore}% compatibility`,
            subject: subject,
            category: 'Other',
            college: req.user.college || 'All Colleges',
            maxParticipants: 2,
            isPrivate: true,
            settings: {
                allowChat: true,
                allowWhiteboard: true,
                allowVideoCall: true,
                allowFileSharing: true,
                allowProgramming: true
            }
        }, req.user._id);

        // Add matched user to participants
        room.addParticipant(matchedUser._id, 'participant');
        await room.save();

        // Generate LiveKit tokens for both users (unique per room, not reused)
        let tokens = {};
        if (livekitService.isConfigured()) {
            tokens = {
                currentUser: await livekitService.generateToken(
                    room.livekit.roomName,
                    req.user._id.toString(),
                    req.user.name
                ),
                matchedUser: await livekitService.generateToken(
                    room.livekit.roomName,
                    matchedUser._id.toString(),
                    matchedUser.name
                )
            };
        }

        // Notify matched user via socket
        if (req.io) {
            req.io.to(`user_${matchedUser._id}`).emit('match_accepted', {
                match: match,
                room: room,
                livekitToken: tokens.matchedUser,
                livekitUrl: livekitService.serverUrl,
                message: `${req.user.name} accepted your match! Join your study room.`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Match accepted! Study room created.',
            data: {
                match,
                room,
                livekitToken: tokens.currentUser,
                livekitUrl: livekitService.serverUrl
            }
        });
    } catch (error) {
        console.error('Accept match error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to accept match',
            error: error.message
        });
    }
};

/**
 * @desc    Reject a match recommendation
 * @route   POST /api/matching/reject/:matchId
 * @access  Private
 */
exports.rejectMatch = async (req, res) => {
    try {
        const { matchId } = req.params;

        const match = await aiMatchingService.rejectMatch(matchId, req.user._id);

        res.status(200).json({
            success: true,
            message: 'Match rejected',
            data: match
        });
    } catch (error) {
        console.error('Reject match error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject match',
            error: error.message
        });
    }
};

/**
 * @desc    Get match history
 * @route   GET /api/matching/history
 * @access  Private
 */
exports.getMatchHistory = async (req, res) => {
    try {
        const matches = await aiMatchingService.getMatchHistory(req.user._id);

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
        });
    } catch (error) {
        console.error('Get match history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get match history',
            error: error.message
        });
    }
};

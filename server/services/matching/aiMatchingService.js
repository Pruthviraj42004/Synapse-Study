const StudentProfile = require('../../models/StudentProfile');
const MatchRecommendation = require('../../models/MatchRecommendation');
const User = require('../../models/User');
const axios = require('axios');

/**
 * AI Matching Service
 * Uses LLM to intelligently match students based on academic profiles
 */

const LLM_API_URL = process.env.LLM_API_URL || 'http://localhost:3001/api/chat';
const LLM_API_KEY = process.env.LLM_API_KEY || 'test-api-key-123';

/**
 * Find compatible study partners for a user
 * @param {String} userId - User ID requesting matches
 * @param {Number} limit - Maximum number of matches to return
 * @returns {Array} - Array of match recommendations
 */
exports.findMatches = async (userId, limit = 5) => {
    try {
        // Get requester's profile
        const requesterProfile = await StudentProfile.findOne({ userId }).populate('userId', 'name email college');

        if (!requesterProfile) {
            throw new Error('Student profile not found. Please complete your profile first.');
        }

        if (!requesterProfile.openToMatching) {
            throw new Error('Your profile is not open to matching. Enable it in preferences.');
        }

        // Find potential matches
        const potentialMatches = await StudentProfile.find({
            userId: { $ne: userId }, // Exclude self
            openToMatching: true,
            profileCompleteness: { $gte: 50 } // At least 50% complete
        }).populate('userId', 'name email college avatar bio');

        if (potentialMatches.length === 0) {
            return [];
        }

        // Prepare data for LLM
        const requesterData = {
            name: requesterProfile.userId.name,
            subjects: requesterProfile.subjects,
            weakAreas: requesterProfile.weakAreas,
            strengths: requesterProfile.strengths,
            academicYear: requesterProfile.academicYear,
            department: requesterProfile.department,
            currentTopics: requesterProfile.currentTopics,
            studyGoals: requesterProfile.studyGoals,
            preferredStudyTime: requesterProfile.preferredStudyTime,
            learningStyle: requesterProfile.learningStyle
        };

        const candidatesData = potentialMatches.slice(0, 20).map(profile => ({
            id: profile.userId._id.toString(),
            name: profile.userId.name,
            subjects: profile.subjects,
            weakAreas: profile.weakAreas,
            strengths: profile.strengths,
            academicYear: profile.academicYear,
            department: profile.department,
            currentTopics: profile.currentTopics,
            studyGoals: profile.studyGoals,
            preferredStudyTime: profile.preferredStudyTime,
            learningStyle: profile.learningStyle,
            college: profile.userId.college
        }));

        // Call LLM for intelligent matching
        const matches = await callLLMForMatching(requesterData, candidatesData, limit);

        // Save match recommendations to database
        const savedMatches = [];
        for (const match of matches) {
            const existingMatch = await MatchRecommendation.findOne({
                requesterId: userId,
                matchedUserId: match.userId,
                status: 'pending'
            });

            if (!existingMatch) {
                const recommendation = await MatchRecommendation.create({
                    requesterId: userId,
                    matchedUserId: match.userId,
                    compatibilityScore: match.compatibilityScore,
                    matchReasoning: match.reasoning,
                    commonSubjects: match.commonSubjects || [],
                    commonTopics: match.commonTopics || [],
                    complementaryStrengths: match.complementaryStrengths || []
                });

                await recommendation.populate('matchedUserId', 'name email avatar college bio');
                savedMatches.push(recommendation);
            }
        }

        return savedMatches;
    } catch (error) {
        console.error('Error in findMatches:', error);
        throw error;
    }
};

/**
 * Call LLM API to get intelligent match recommendations
 */
async function callLLMForMatching(requester, candidates, limit) {
    const prompt = `You are an AI study partner matching system for students.

Your task is to analyze a student's profile and match them with the most compatible study partners from a list of candidates.

REQUESTER PROFILE:
${JSON.stringify(requester, null, 2)}

CANDIDATE PROFILES:
${JSON.stringify(candidates, null, 2)}

MATCHING CRITERIA:
1. Subject overlap (same subjects or complementary weak areas/strengths)
2. Academic year and department compatibility
3. Study time alignment
4. Learning style compatibility
5. Current topic overlap
6. Study goal alignment

OUTPUT FORMAT (strict JSON only):
{
  "matches": [
    {
      "userId": "candidate_id",
      "compatibilityScore": 85,
      "reasoning": "Brief explanation of why this is a good match",
      "commonSubjects": ["Subject1", "Subject2"],
      "commonTopics": ["Topic1", "Topic2"],
      "complementaryStrengths": ["Strength1", "Strength2"]
    }
  ]
}

Return the top ${limit} best matches, ranked by compatibility score (0-100).
Output ONLY valid JSON. Do NOT include any text outside the JSON.`;

    try {
        const response = await axios.post(
            LLM_API_URL,
            {
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI that matches students for collaborative learning. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': LLM_API_KEY
                },
                timeout: 30000
            }
        );

        // Parse LLM response
        let responseText = response.data.response || response.data.message || JSON.stringify(response.data);

        // Clean response to extract JSON
        responseText = responseText.trim();

        // Try to find JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            responseText = jsonMatch[0];
        }

        const result = JSON.parse(responseText);

        if (!result.matches || !Array.isArray(result.matches)) {
            throw new Error('Invalid LLM response format');
        }

        return result.matches.slice(0, limit);
    } catch (error) {
        console.error('LLM matching error:', error.message);

        // Fallback: Simple rule-based matching
        console.log('Using fallback matching algorithm');
        return fallbackMatching(requester, candidates, limit);
    }
}

/**
 * Fallback matching algorithm if LLM fails
 */
function fallbackMatching(requester, candidates, limit) {
    const scored = candidates.map(candidate => {
        let score = 0;

        // Subject overlap
        const commonSubjects = requester.subjects.filter(s =>
            candidate.subjects.includes(s)
        );
        score += commonSubjects.length * 15;

        // Weak area / strength complementarity
        const helpfulStrengths = candidate.strengths.filter(s =>
            requester.weakAreas.includes(s)
        );
        score += helpfulStrengths.length * 20;

        // Academic year match
        if (requester.academicYear === candidate.academicYear) score += 15;

        // Department match
        if (requester.department === candidate.department) score += 10;

        // Study time overlap
        const commonTimes = requester.preferredStudyTime.filter(t =>
            candidate.preferredStudyTime.includes(t)
        );
        score += commonTimes.length * 10;

        // Learning style compatibility
        if (requester.learningStyle === candidate.learningStyle ||
            candidate.learningStyle === 'Mixed') {
            score += 10;
        }

        return {
            userId: candidate.id,
            compatibilityScore: Math.min(score, 100),
            reasoning: `Match based on ${commonSubjects.length} common subjects, compatible study times, and ${helpfulStrengths.length > 0 ? 'complementary strengths' : 'similar academic focus'}.`,
            commonSubjects,
            commonTopics: [],
            complementaryStrengths: helpfulStrengths
        };
    });

    return scored
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, limit);
}

/**
 * Get user's match history
 */
exports.getMatchHistory = async (userId) => {
    const matches = await MatchRecommendation.find({ requesterId: userId })
        .populate('matchedUserId', 'name email avatar college')
        .populate('studyRoomId', 'name')
        .sort({ createdAt: -1 });

    return matches;
};

/**
 * Accept a match recommendation
 */
exports.acceptMatch = async (matchId, userId) => {
    const match = await MatchRecommendation.findOne({
        _id: matchId,
        requesterId: userId
    });

    if (!match) {
        throw new Error('Match recommendation not found');
    }

    if (match.status !== 'pending') {
        throw new Error('Match has already been processed');
    }

    await match.accept();
    return match;
};

/**
 * Reject a match recommendation
 */
exports.rejectMatch = async (matchId, userId) => {
    const match = await MatchRecommendation.findOne({
        _id: matchId,
        requesterId: userId
    });

    if (!match) {
        throw new Error('Match recommendation not found');
    }

    if (match.status !== 'pending') {
        throw new Error('Match has already been processed');
    }

    await match.reject();
    return match;
};

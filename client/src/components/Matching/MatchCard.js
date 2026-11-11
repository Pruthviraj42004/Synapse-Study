import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Avatar,
    Box,
    Chip,
    LinearProgress,
    Button,
    Tooltip
} from '@mui/material';
import {
    CheckCircle as AcceptIcon,
    Cancel as RejectIcon,
    School as SchoolIcon,
    EmojiObjects as IdeaIcon
} from '@mui/icons-material';

const MatchCard = ({ match, onAccept, onReject, loading }) => {
    const { matchedUserId, compatibilityScore, matchReasoning, commonSubjects, complementaryStrengths } = match;

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'primary';
        return 'warning';
    };

    return (
        <Card
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                {/* Profile Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        src={matchedUserId?.avatar}
                        alt={matchedUserId?.name}
                        sx={{ width: 64, height: 64, mr: 2 }}
                    >
                        {matchedUserId?.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {matchedUserId?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SchoolIcon fontSize="small" />
                            {matchedUserId?.college}
                        </Typography>
                    </Box>
                </Box>

                {/* Compatibility Score */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Compatibility Score
                        </Typography>
                        <Typography variant="h6" color={`${getScoreColor(compatibilityScore)}.main`}>
                            {compatibilityScore}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={compatibilityScore}
                        color={getScoreColor(compatibilityScore)}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                {/* AI Reasoning */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <IdeaIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" color="primary">
                            Why this match?
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {matchReasoning}
                    </Typography>
                </Box>

                {/* Common Subjects */}
                {commonSubjects && commonSubjects.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Common Subjects
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {commonSubjects.map((subject, index) => (
                                <Chip
                                    key={index}
                                    label={subject}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Complementary Strengths */}
                {complementaryStrengths && complementaryStrengths.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Can Help You With
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {complementaryStrengths.map((strength, index) => (
                                <Chip
                                    key={index}
                                    label={strength}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
                <Tooltip title="Reject this match">
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => onReject(match._id)}
                        disabled={loading}
                    >
                        Pass
                    </Button>
                </Tooltip>
                <Tooltip title="Accept and create study room">
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<AcceptIcon />}
                        onClick={() => onAccept(match._id)}
                        disabled={loading}
                    >
                        Connect
                    </Button>
                </Tooltip>
            </CardActions>
        </Card>
    );
};

export default MatchCard;

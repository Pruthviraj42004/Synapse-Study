import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Rating,
    Button,
    Grid,
    Alert
} from '@mui/material';
import {
    AutoStories as SummaryIcon,
    Quiz as QuizIcon,
    Psychology as ConceptIcon,
    Recommend as RecommendIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import FlashcardViewer from './FlashcardViewer';

const ResourceInsights = ({ analysis, onRegenerate, loading }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!analysis) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No AI analysis available for this resource yet.
                </Typography>
            </Paper>
        );
    }

    const {
        subject,
        main_topic,
        subtopics,
        prerequisites,
        summary,
        flashcards,
        expected_questions,
        concept_nodes,
        probable_syllabus_mapping,
        difficulty,
        recommendations,
        related_topics,
        ideal_study_group_type,
        recommended_tools,
        confidence_score
    } = analysis;

    return (
        <Box>
            {/* Header Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Chip label={subject} color="primary" sx={{ mb: 1 }} />
                        <Typography variant="h5" gutterBottom>
                            {main_topic}
                        </Typography>
                        {probable_syllabus_mapping && (
                            <Typography variant="body2" color="text.secondary">
                                {probable_syllabus_mapping.unit} • {probable_syllabus_mapping.chapter}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Difficulty Level
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { md: 'flex-end' }, gap: 1 }}>
                            <Rating value={difficulty} max={10} readOnly />
                            <Typography variant="body2" color="text.secondary">
                                {difficulty}/10
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<SummaryIcon />} label="Overview" />
                    <Tab icon={<QuizIcon />} label={`Flashcards (${flashcards?.length || 0})`} />
                    <Tab icon={<QuizIcon />} label={`Exam Prep (${expected_questions?.length || 0})`} />
                    <Tab icon={<ConceptIcon />} label="Concepts" />
                    <Tab icon={<RecommendIcon />} label="Study Guide" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            <Paper sx={{ p: 3 }}>
                {/* Overview Tab */}
                {activeTab === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            📚 Summary
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                            {summary}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        {subtopics && subtopics.length > 0 && (
                            <>
                                <Typography variant="h6" gutterBottom>
                                    📑 Subtopics Covered
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    {subtopics.map((topic, index) => (
                                        <Chip key={index} label={topic} variant="outlined" />
                                    ))}
                                </Box>
                            </>
                        )}

                        {prerequisites && prerequisites.length > 0 && (
                            <>
                                <Typography variant="h6" gutterBottom>
                                    📋 Prerequisites
                                </Typography>
                                <List>
                                    {prerequisites.map((prereq, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={prereq} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Box>
                )}

                {/* Flashcards Tab */}
                {activeTab === 1 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                🎴 Flashcards
                            </Typography>
                            <Button
                                startIcon={<RefreshIcon />}
                                onClick={() => onRegenerate && onRegenerate('flashcards')}
                                disabled={loading}
                                size="small"
                            >
                                Regenerate
                            </Button>
                        </Box>
                        <FlashcardViewer flashcards={flashcards} />
                    </Box>
                )}

                {/* Exam Prep Tab */}
                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            📝 Expected Exam Questions
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Practice these questions to prepare for your exams
                        </Alert>
                        <List>
                            {expected_questions && expected_questions.map((question, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Typography variant="subtitle2" color="primary">
                                                        Q{index + 1}.
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {question}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < expected_questions.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                )}

                {/* Concepts Tab */}
                {activeTab === 3 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            🧠 Key Concepts
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            These are the main concepts and ideas in this document
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {concept_nodes && concept_nodes.map((concept, index) => (
                                <Chip
                                    key={index}
                                    label={concept}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontSize: '1rem', p: 2 }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Study Guide Tab */}
                {activeTab === 4 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            💡 Study Recommendations
                        </Typography>
                        <List>
                            {recommendations && recommendations.map((rec, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Typography variant="subtitle2" color="success.main">
                                                        ✓
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {rec}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < recommendations.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>

                        {probable_syllabus_mapping && probable_syllabus_mapping.why && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    🎓 Syllabus Context
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                                    <Typography variant="body2">
                                        {probable_syllabus_mapping.why}
                                    </Typography>
                                </Paper>
                            </>
                        )}

                        {/* Related Topics */}
                        {related_topics && related_topics.length > 0 && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    🔗 Related Topics
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {related_topics.map((topic, index) => (
                                        <Chip key={index} label={topic} color="primary" />
                                    ))}
                                </Box>
                            </>
                        )}

                        {/* Recommended Tools */}
                        {recommended_tools && recommended_tools.length > 0 && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    🛠️ Recommended Tools
                                </Typography>
                                <Grid container spacing={2}>
                                    {recommended_tools.map((tool, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Typography variant="body2">{tool}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}

                        {/* Study Group Type */}
                        {ideal_study_group_type && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    👥 Ideal Study Group
                                </Typography>
                                <Alert severity="info">
                                    <Typography variant="body2">
                                        <strong>{ideal_study_group_type}</strong> - This type of study group is recommended for this material.
                                    </Typography>
                                </Alert>
                            </>
                        )}

                        {/* Confidence Score */}
                        {confidence_score !== undefined && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    🎯 Analysis Confidence
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Rating
                                        value={confidence_score * 5}
                                        max={5}
                                        precision={0.1}
                                        readOnly
                                        size="large"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {(confidence_score * 100).toFixed(0)}% confidence
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ResourceInsights;

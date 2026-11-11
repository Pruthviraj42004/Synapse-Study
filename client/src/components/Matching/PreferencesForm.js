import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Grid
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
    'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems',
    'Computer Networks', 'Web Development', 'Machine Learning',
    'Software Engineering', 'Digital Electronics', 'Microprocessors'
];

const STUDY_TIMES = [
    'Early Morning (6-9 AM)',
    'Morning (9-12 PM)',
    'Afternoon (12-3 PM)',
    'Evening (3-6 PM)',
    'Night (6-9 PM)',
    'Late Night (9 PM-12 AM)',
    'Flexible'
];

const PreferencesForm = ({ initialData, onSave, loading }) => {
    const [formData, setFormData] = useState({
        subjects: initialData?.subjects || [],
        weakAreas: initialData?.weakAreas || [],
        strengths: initialData?.strengths || [],
        academicYear: initialData?.academicYear || '',
        department: initialData?.department || '',
        currentTopics: initialData?.currentTopics || [],
        studyGoals: initialData?.studyGoals || '',
        preferredStudyTime: initialData?.preferredStudyTime || [],
        learningStyle: initialData?.learningStyle || 'Mixed',
        collaborationPreference: initialData?.collaborationPreference || 'No Preference',
        openToMatching: initialData?.openToMatching !== undefined ? initialData.openToMatching : true
    });

    const [currentTopic, setCurrentTopic] = useState('');
    const [weakArea, setWeakArea] = useState('');
    const [strength, setStrength] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddItem = (field, value, setValue) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
            setValue('');
        }
    };

    const handleRemoveItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
                📝 Your Study Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tell us about your academic goals and preferences to find perfect study partners
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Academic Year */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Academic Year</InputLabel>
                            <Select
                                value={formData.academicYear}
                                onChange={(e) => handleChange('academicYear', e.target.value)}
                                label="Academic Year"
                            >
                                <MenuItem value="1st Year">1st Year</MenuItem>
                                <MenuItem value="2nd Year">2nd Year</MenuItem>
                                <MenuItem value="3rd Year">3rd Year</MenuItem>
                                <MenuItem value="4th Year">4th Year</MenuItem>
                                <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Department */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            label="Department"
                            value={formData.department}
                            onChange={(e) => handleChange('department', e.target.value)}
                            placeholder="e.g., Computer Science & Engineering"
                        />
                    </Grid>

                    {/* Subjects */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Subjects of Interest</InputLabel>
                            <Select
                                multiple
                                value={formData.subjects}
                                onChange={(e) => handleChange('subjects', e.target.value)}
                                input={<OutlinedInput label="Subjects of Interest" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {SUBJECTS.map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Weak Areas */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Weak Areas (Topics you need help with)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={weakArea}
                                onChange={(e) => setWeakArea(e.target.value)}
                                placeholder="Add a weak area"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddItem('weakAreas', weakArea, setWeakArea);
                                    }
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => handleAddItem('weakAreas', weakArea, setWeakArea)}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.weakAreas.map((area, index) => (
                                <Chip
                                    key={index}
                                    label={area}
                                    onDelete={() => handleRemoveItem('weakAreas', index)}
                                    color="error"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Strengths */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Strengths (Topics you can help others with)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={strength}
                                onChange={(e) => setStrength(e.target.value)}
                                placeholder="Add a strength"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddItem('strengths', strength, setStrength);
                                    }
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => handleAddItem('strengths', strength, setStrength)}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.strengths.map((str, index) => (
                                <Chip
                                    key={index}
                                    label={str}
                                    onDelete={() => handleRemoveItem('strengths', index)}
                                    color="success"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Current Topics */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Currently Studying
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={currentTopic}
                                onChange={(e) => setCurrentTopic(e.target.value)}
                                placeholder="Add a topic you're currently studying"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddItem('currentTopics', currentTopic, setCurrentTopic);
                                    }
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => handleAddItem('currentTopics', currentTopic, setCurrentTopic)}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.currentTopics.map((topic, index) => (
                                <Chip
                                    key={index}
                                    label={topic}
                                    onDelete={() => handleRemoveItem('currentTopics', index)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Study Goals */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Study Goals"
                            value={formData.studyGoals}
                            onChange={(e) => handleChange('studyGoals', e.target.value)}
                            placeholder="Describe your study goals (e.g., preparing for exams, learning new topics, completing assignments)"
                        />
                    </Grid>

                    {/* Preferred Study Time */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Preferred Study Time</InputLabel>
                            <Select
                                multiple
                                value={formData.preferredStudyTime}
                                onChange={(e) => handleChange('preferredStudyTime', e.target.value)}
                                input={<OutlinedInput label="Preferred Study Time" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {STUDY_TIMES.map((time) => (
                                    <MenuItem key={time} value={time}>
                                        {time}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Learning Style */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Learning Style</InputLabel>
                            <Select
                                value={formData.learningStyle}
                                onChange={(e) => handleChange('learningStyle', e.target.value)}
                                label="Learning Style"
                            >
                                <MenuItem value="Visual">Visual (Diagrams, Videos)</MenuItem>
                                <MenuItem value="Auditory">Auditory (Discussions, Lectures)</MenuItem>
                                <MenuItem value="Reading/Writing">Reading/Writing (Notes, Articles)</MenuItem>
                                <MenuItem value="Kinesthetic">Kinesthetic (Hands-on, Practice)</MenuItem>
                                <MenuItem value="Mixed">Mixed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Collaboration Preference */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Group Size Preference</InputLabel>
                            <Select
                                value={formData.collaborationPreference}
                                onChange={(e) => handleChange('collaborationPreference', e.target.value)}
                                label="Group Size Preference"
                            >
                                <MenuItem value="Small Groups (2-3)">Small Groups (2-3)</MenuItem>
                                <MenuItem value="Medium Groups (4-6)">Medium Groups (4-6)</MenuItem>
                                <MenuItem value="Large Groups (7+)">Large Groups (7+)</MenuItem>
                                <MenuItem value="No Preference">No Preference</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default PreferencesForm;

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Grid,
    Chip,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    CloudUpload as UploadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';

const UploadResource = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        semester: '',
        department: '',
        type: 'Notes',
        tags: [],
        fileUrl: '',
        fileName: '',
        fileSize: 0,
        fileType: ''
    });
    const [tagInput, setTagInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const resourceTypes = ['Notes', 'QuestionPaper', 'Lab', 'PPT', 'Reference', 'Other'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        try {
            setUploadingFile(true);
            setSelectedFile(file);

            // Upload file to cloud storage
            const fileData = await resourceService.uploadFile(file);

            setFormData(prev => ({
                ...prev,
                fileUrl: fileData.url,
                fileName: fileData.fileName,
                fileSize: fileData.fileSize,
                fileType: fileData.fileType
            }));

            toast.success('File uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload file');
            console.error('File upload error:', error);
        } finally {
            setUploadingFile(false);
        }
    };

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        if (formData.tags.includes(tagInput.trim().toLowerCase())) return;

        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, tagInput.trim().toLowerCase()]
        }));
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.subject || !formData.fileUrl) {
            toast.error('Please fill in all required fields and upload a file');
            return;
        }

        try {
            setLoading(true);
            await resourceService.uploadResource(formData);
            toast.success('Resource uploaded successfully!');
            navigate('/resources');
        } catch (error) {
            toast.error(error.message || 'Failed to upload resource');
            console.error('Upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/resources')}
                sx={{ mb: 3 }}
            >
                Back to Resources
            </Button>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Upload Study Resource
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Share your notes, study materials, and resources with fellow students
            </Typography>

            {/* Form */}
            <Paper elevation={2} sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Title */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g., Data Structures Class Notes - Unit 3"
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Brief description of the resource..."
                            />
                        </Grid>

                        {/* Subject & Semester */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Subject"
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                                placeholder="e.g., Data Structures"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Semester</InputLabel>
                                <Select
                                    value={formData.semester}
                                    label="Semester"
                                    onChange={(e) => handleChange('semester', e.target.value)}
                                >
                                    <MenuItem value="">Not Specified</MenuItem>
                                    {semesters.map((sem) => (
                                        <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Department & Type */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Department"
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                placeholder="e.g., Computer Science"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Resource Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Resource Type"
                                    onChange={(e) => handleChange('type', e.target.value)}
                                >
                                    {resourceTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Tags */}
                        <Grid item xs={12}>
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    placeholder="Add tags and press Enter (e.g., algorithms, sorting)"
                                    helperText="Press Enter to add tags"
                                />
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {formData.tags.map((tag, idx) => (
                                        <Chip
                                            key={idx}
                                            label={tag}
                                            onDelete={() => handleRemoveTag(tag)}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>

                        {/* File Upload */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'action.hover'
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                    disabled={uploadingFile}
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%' }}>
                                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body1" gutterBottom>
                                        {uploadingFile ? 'Uploading...' : selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        PDF, DOC, DOCX, PPT, PPTX, TXT (Max 50MB)
                                    </Typography>
                                    {uploadingFile && <CircularProgress size={24} sx={{ mt: 2 }} />}
                                </label>
                            </Box>
                            {!formData.fileUrl && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Note: File upload to cloud storage is pending configuration. Currently using placeholder URLs.
                                </Alert>
                            )}
                        </Grid>

                        {/* Submit */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/resources')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    disabled={loading || uploadingFile || !formData.fileUrl}
                                >
                                    {loading ? 'Uploading...' : 'Upload Resource'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default UploadResource;

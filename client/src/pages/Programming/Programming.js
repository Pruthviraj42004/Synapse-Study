import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Slider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  MoreVert as MoreIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  FileCopy as DuplicateIcon,
  Add as AddIcon,
  Code as CodeIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import MonacoEditor from '../../components/Programming/CodeEditor/MonacoEditor';
import ExecutionPanel from '../../components/Programming/CodeExecution/ExecutionPanel';
import CodeExecutionService from '../../services/codeExecutionService';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';

const Programming = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessionId } = useParams();
  const { user } = useSelector(state => state.auth);
  
  // Editor states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [sessionTitle, setSessionTitle] = useState('Untitled Session');
  const [isEdited, setIsEdited] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [splitOrientation, setSplitOrientation] = useState('vertical');
  
  // Execution states
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  
  // UI states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Settings
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    theme: 'vs-dark',
    autoSave: false,
  });
  
  // Session history
  const [sessions, setSessions] = useState([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  
  // Fetch session or start new one
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      // Start with template code for the selected language
      setCode(getDefaultCode(language));
      setSessionTitle('Untitled Session');
      setIsEdited(false);
    }
    
    // Fetch user sessions for history
    fetchUserSessions();
    
    // Check execution service health
    checkServiceHealth();
  }, [sessionId]);
  
  // Get service health status
  const [serviceHealth, setServiceHealth] = useState({
    docker: { healthy: false, message: 'Checking...' },
    vm2Fallback: false,
    supportedLanguages: []
  });
  
  const checkServiceHealth = async () => {
    try {
      const health = await CodeExecutionService.getServiceStatus();
      setServiceHealth(health);
    } catch (err) {
      console.error('Health check error:', err);
    }
  };
  
  const fetchSession = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/programming/sessions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const session = response.data;
      setCode(session.code);
      setLanguage(session.language);
      setSessionTitle(session.title);
      setIsEdited(false);
    } catch (error) {
      console.error('Error fetching session:', error);
      showSnackbar('Failed to load session. Please try again.', 'error');
    }
  };
  
  const fetchUserSessions = async () => {
    setIsSessionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/programming/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsSessionsLoading(false);
    }
  };
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setIsEdited(true);
  };
  
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (!isEdited && !sessionId) {
      setCode(getDefaultCode(newLanguage));
    }
  };
  
  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput(null);
    setError(null);
    setExecutionTime(null);
    setMemoryUsage(null);
    
    try {
      const result = await CodeExecutionService.executeCode(
        code,
        language,
        inputValue,
        sessionId
      );
      
      if (result.success) {
        setOutput(result.output || 'Code executed successfully (no output)');
        setError(null);
      } else {
        setOutput(result.output);
        setError(result.error || 'Execution failed');
      }
      
      setExecutionTime(result.executionTime);
      setMemoryUsage(result.memoryUsage);
    } catch (err) {
      console.error('Execution error:', err);
      setError('Failed to execute code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (sessionId) {
        // Update existing session
        response = await axios.put(
          `${API_BASE_URL}/api/programming/sessions/${sessionId}`,
          {
            title: sessionTitle,
            code,
            language
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        showSnackbar('Session updated successfully!', 'success');
      } else {
        // Create new session
        response = await axios.post(
          `${API_BASE_URL}/api/programming/sessions`,
          {
            title: sessionTitle,
            code,
            language
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        // Redirect to the new session page
        navigate(`/programming/${response.data._id}`);
        showSnackbar('Session created successfully!', 'success');
      }
      
      setIsEdited(false);
      setSaveDialogOpen(false);
      
      // Refresh sessions list
      fetchUserSessions();
      
    } catch (error) {
      console.error('Error saving session:', error);
      showSnackbar('Failed to save session. Please try again.', 'error');
    }
  };
  
  const handleShareSession = async () => {
    if (!sessionId) {
      showSnackbar('Please save the session before sharing', 'warning');
      setSaveDialogOpen(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/programming/sessions/${sessionId}/share`,
        {
          isPublic
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setShareDialogOpen(false);
      showSnackbar('Sharing settings updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      showSnackbar('Failed to update sharing settings', 'error');
    }
  };
  
  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const fileExtension = getFileExtension(language);
    const file = new Blob([code], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(file);
    element.download = `${sessionTitle.replace(/\s+/g, '_')}.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showSnackbar('Code downloaded successfully!', 'success');
  };
  
  const handleUploadCode = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setIsEdited(true);
      
      // Try to determine language from file extension
      const fileName = file.name;
      const extension = fileName.split('.').pop().toLowerCase();
      const detectedLanguage = getLanguageFromExtension(extension);
      
      if (detectedLanguage && detectedLanguage !== language) {
        setLanguage(detectedLanguage);
      }
      
      // Set session title from filename (without extension)
      const newTitle = fileName.replace(/\.[^/.]+$/, "");
      setSessionTitle(newTitle);
    };
    
    reader.readAsText(file);
    
    // Reset the input value so the same file can be uploaded again
    event.target.value = null;
    
    showSnackbar('Code uploaded successfully!', 'success');
  };
  
  const getDefaultCode = (lang) => {
    // This would be replaced with the default templates from the API
    const templates = {
      javascript: '// JavaScript code\nconsole.log("Hello, world!");',
      python: '# Python code\nprint("Hello, world!")',
      java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, world!");\n  }\n}',
      // Add more language templates as needed
    };
    
    return templates[lang] || '// Start coding here';
  };
  
  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      html: 'html',
      css: 'css',
      sql: 'sql',
    };
    
    return extensions[lang] || 'txt';
  };
  
  const getLanguageFromExtension = (extension) => {
    const mapping = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
    };
    
    return mapping[extension] || null;
  };
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleClearOutput = () => {
    setOutput(null);
    setError(null);
    setExecutionTime(null);
    setMemoryUsage(null);
  };
  
  const handleNewSession = () => {
    navigate('/programming');
    setCode(getDefaultCode('javascript'));
    setLanguage('javascript');
    setSessionTitle('Untitled Session');
    setIsEdited(false);
    setOutput(null);
    setError(null);
  };
  
  const handleDuplicateSession = async () => {
    if (!sessionId) {
      showSnackbar('Cannot duplicate an unsaved session', 'warning');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/programming/sessions`,
        {
          title: `${sessionTitle} (Copy)`,
          code,
          language
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      navigate(`/programming/${response.data._id}`);
      showSnackbar('Session duplicated successfully!', 'success');
      
      // Refresh sessions list
      fetchUserSessions();
      
    } catch (error) {
      console.error('Error duplicating session:', error);
      showSnackbar('Failed to duplicate session', 'error');
    }
  };
  
  const handleToggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenSession = (id) => {
    navigate(`/programming/${id}`);
  };
  
  const handleToggleSplitOrientation = () => {
    setSplitOrientation(splitOrientation === 'vertical' ? 'horizontal' : 'vertical');
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1, 
          mb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon color="primary" />
          <Typography variant="h6" noWrap sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {sessionTitle}{isEdited && ' *'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={language.toUpperCase()} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
            {sessionId && <Chip 
              label={isPublic ? 'Public' : 'Private'} 
              size="small" 
              color={isPublic ? 'success' : 'default'} 
              variant="outlined" 
            />}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RunIcon />} 
            onClick={handleRunCode}
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
          >
            Save
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ShareIcon />} 
            onClick={() => setShareDialogOpen(true)} 
          >
            Share
          </Button>
          
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Tab Navigation */}
      <Paper elevation={1} sx={{ mb: 1 }}>
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Code Editor" />
          <Tab label="Sessions" />
          <Tab label="Templates" />
        </Tabs>
      </Paper>
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Code Editor Tab */}
        {tabValue === 0 && (
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              height: '100%', 
              flexDirection: splitOrientation === 'vertical' ? 'row' : 'column'
            }}
          >
            {/* Editor Panel */}
            <Grid item xs={splitOrientation === 'vertical' ? 7 : 12} sm={splitOrientation === 'vertical' ? 7 : 12} sx={{ height: splitOrientation === 'vertical' ? '100%' : '60%' }}>
              <Box sx={{ height: '100%' }}>
                <MonacoEditor
                  onRun={handleRunCode}
                  onSave={() => setSaveDialogOpen(true)}
                  initialLanguage={language}
                  initialCode={code}
                  onCodeChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  height="100%"
                  collaborativeMode={true}
                  roomId={sessionId || `temp-session-${user?._id || 'guest'}`}
                  userId={user?._id || 'guest'}
                />
              </Box>
            </Grid>
            
            {/* Output Panel */}
            <Grid item xs={splitOrientation === 'vertical' ? 5 : 12} sm={splitOrientation === 'vertical' ? 5 : 12} sx={{ height: splitOrientation === 'vertical' ? '100%' : '40%' }}>
              <ExecutionPanel 
                output={output}
                isLoading={isLoading}
                error={error}
                onClear={handleClearOutput}
                language={language}
                executionTime={executionTime}
                memoryUsage={memoryUsage}
                onStop={() => {}}
                onRerun={handleRunCode}
                isFullscreen={fullScreen}
                onToggleFullscreen={handleToggleFullScreen}
                onSaveOutput={handleDownloadCode}
              />
            </Grid>
          </Grid>
        )}
        
        {/* Sessions Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">My Sessions</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleNewSession}
              >
                New Session
              </Button>
            </Box>
            
            {isSessionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : sessions.length > 0 ? (
              <Grid container spacing={2}>
                {sessions.map((session) => (
                  <Grid item xs={12} sm={6} md={4} key={session._id}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => handleOpenSession(session._id)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" noWrap>{session.title}</Typography>
                        <Chip 
                          label={session.language.toUpperCase()} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: 'monospace'
                      }}>
                        {session.codePreview || '// Empty session'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.isPublic ? 'Public' : 'Private'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You don't have any saved sessions yet.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleNewSession}
                >
                  Create Your First Session
                </Button>
              </Paper>
            )}
          </Box>
        )}
        
        {/* Templates Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Code Templates
            </Typography>
            
            <Grid container spacing={2}>
              {['javascript', 'python', 'java', 'cpp', 'csharp', 'html'].map((lang) => (
                <Grid item xs={12} sm={6} md={4} key={lang}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => {
                      setLanguage(lang);
                      setCode(getDefaultCode(lang));
                      setTabValue(0);
                      setSessionTitle(`${lang.charAt(0).toUpperCase() + lang.slice(1)} Session`);
                    }}
                  >
                    <Typography variant="h6">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start coding with a template
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label="Starter" size="small" />
                      <Chip label="Template" size="small" variant="outlined" />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            type="text"
            fullWidth
            variant="outlined"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveSession} 
            variant="contained" 
            disabled={!sessionTitle.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Session</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isPublic} 
                  onChange={(e) => setIsPublic(e.target.checked)} 
                />
              }
              label="Make session public"
            />
            <Typography variant="body2" color="text.secondary">
              Anyone with the link can view this session {isPublic ? '(currently public)' : '(currently private)'}
            </Typography>
          </Box>
          
          {sessionId && (
            <TextField
              margin="dense"
              label="Share Link"
              type="text"
              fullWidth
              variant="outlined"
              value={`${window.location.origin}/programming/shared/${sessionId}`}
              InputProps={{ readOnly: true }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleShareSession} 
            variant="contained"
            disabled={!sessionId}
          >
            Update Sharing Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); handleNewSession(); }}>
          <AddIcon sx={{ mr: 1 }} fontSize="small" />
          New Session
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); handleDuplicateSession(); }}>
          <DuplicateIcon sx={{ mr: 1 }} fontSize="small" />
          Duplicate Session
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); handleDownloadCode(); }}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download Code
        </MenuItem>
        <MenuItem component="label">
          <UploadIcon sx={{ mr: 1 }} fontSize="small" />
          Upload Code
          <input
            type="file"
            hidden
            onChange={handleUploadCode}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); handleToggleSplitOrientation(); }}>
          <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
          Toggle Layout
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setSettingsDialogOpen(true); }}>
          <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
          Editor Settings
        </MenuItem>
      </Menu>
      
      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editor Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Editor Appearance
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Font Size: {editorSettings.fontSize}px
            </Typography>
            <Slider
              value={editorSettings.fontSize}
              min={10}
              max={24}
              step={1}
              onChange={(e, newValue) => setEditorSettings({ ...editorSettings, fontSize: newValue })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Tab Size: {editorSettings.tabSize}
            </Typography>
            <Slider
              value={editorSettings.tabSize}
              min={2}
              max={8}
              step={1}
              onChange={(e, newValue) => setEditorSettings({ ...editorSettings, tabSize: newValue })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={editorSettings.theme === 'vs-dark'} 
                  onChange={(e) => setEditorSettings({ 
                    ...editorSettings, 
                    theme: e.target.checked ? 'vs-dark' : 'light' 
                  })} 
                />
              }
              label="Dark Theme"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Editor Features
          </Typography>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={editorSettings.wordWrap} 
                  onChange={(e) => setEditorSettings({ ...editorSettings, wordWrap: e.target.checked })} 
                />
              }
              label="Word Wrap"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={editorSettings.minimap} 
                  onChange={(e) => setEditorSettings({ ...editorSettings, minimap: e.target.checked })} 
                />
              }
              label="Show Minimap"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={editorSettings.autoSave} 
                  onChange={(e) => setEditorSettings({ ...editorSettings, autoSave: e.target.checked })} 
                />
              }
              label="Auto Save"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Apply settings to editor
              setSettingsDialogOpen(false);
              // Settings would be applied through the MonacoEditor component
            }} 
            variant="contained"
          >
            Apply Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Service Health Alert */}
      {!serviceHealth.docker.healthy && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16, 
            zIndex: 9999, 
            maxWidth: 400,
            boxShadow: 3
          }}
          onClose={() => {}}
        >
          <Typography variant="body2" gutterBottom>
            Docker execution service is not available. JavaScript execution will use fallback mode.
          </Typography>
          <Typography variant="caption">
            {serviceHealth.docker.message}
          </Typography>
        </Alert>
      )}
      
      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Programming;
/**
 * Modern Study Room Programming Component
 * 
 * Upgraded to use CodeMirror 6 + Y.js collaborative editor
 * Falls back to Monaco if feature flag disabled
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Paper, Typography, Grid, Chip, CircularProgress, IconButton, Tooltip,
    Divider, Menu, MenuItem, Button, Select, FormControl, InputLabel, Snackbar
} from '@mui/material';
import {
    Code as CodeIcon, PlayArrow as RunIcon, Save as SaveIcon, MoreVert as MoreIcon,
    DarkMode, LightMode, ViewAgenda as LayoutIcon, Download as DownloadIcon,
    ContentCopy
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import MonacoEditor from './CodeEditor/MonacoEditor';
import CollaborativeEditor from '../Editor/CollaborativeEditor';
import ExecutionPanel from './CodeExecution/ExecutionPanel';
import socketService from '../../services/socketService';
import studyRoomProgrammingService from '../../services/studyRoomProgrammingService';
import { FEATURES } from '../../config/features';

const StudyRoomProgrammingModern = ({ roomId }) => {
    const { user } = useSelector(state => state.auth);
    const [code, setCode] = useState('// Write your code here\\nconsole.log(\"Hello!\");');
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('vs-dark');
    const [layoutMode, setLayoutMode] = useState('horizontal');
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);
    const [memoryUsage, setMemoryUsage] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [menuAnchor, setMenuAnchor] = useState(null);
    const codeUpdateTimeoutRef = useRef(null);
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        const init = async () => {
            if (!roomId || !user) return;

            // Only use socket for Monaco editor (not needed for Y.js)
            if (!FEATURES.USE_CODEMIRROR) {
                const socket = socketService.getSocket();
                if (!socket?.connected) {
                    await socketService.initializeSocket(user.id);
                }
                socketService.emit('join_study_room_programming', { roomId });
            }

            try {
                const session = await studyRoomProgrammingService.getProgrammingSession(roomId);
                if (session?.code) { isRemoteUpdate.current = true; setCode(session.code); }
                if (session?.language) setLanguage(session.language);
            } catch (err) {
                console.log('Could not load existing session:', err);
            }
            setIsInitialized(true);
        };
        init();

        return () => {
            if (!FEATURES.USE_CODEMIRROR) {
                const socket = socketService.getSocket();
                if (socket && roomId) socketService.emit('leave_study_room_programming', { roomId });
            }
            if (codeUpdateTimeoutRef.current) clearTimeout(codeUpdateTimeoutRef.current);
        };
    }, [roomId, user]);

    // Socket listeners (only for Monaco)
    useEffect(() => {
        if (FEATURES.USE_CODEMIRROR) return; // Y.js handles sync

        const socket = socketService.getSocket();
        if (!socket || !isInitialized) return;
        const onJoin = (d) => { if (d.userId !== user.id) setCollaborators(p => p.find(c => c.userId === d.userId) ? p : [...p, d]); };
        const onLeave = (d) => setCollaborators(p => p.filter(c => c.userId !== d.userId));
        const onCode = (d) => { if (d.userId !== user.id) { isRemoteUpdate.current = true; setCode(d.code); if (d.language !== language) setLanguage(d.language); } };
        socketService.on('user_joined_programming', onJoin);
        socketService.on('user_left_programming', onLeave);
        socketService.on('study_room_code_changed', onCode);
        return () => {
            socketService.off('user_joined_programming');
            socketService.off('user_left_programming');
            socketService.off('study_room_code_changed');
        };
    }, [isInitialized, user.id, language]);

    const handleCodeChange = useCallback((newCode) => {
        if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
        setCode(newCode);

        // Only emit socket events for Monaco
        if (!FEATURES.USE_CODEMIRROR) {
            if (codeUpdateTimeoutRef.current) clearTimeout(codeUpdateTimeoutRef.current);
            codeUpdateTimeoutRef.current = setTimeout(() => {
                const socket = socketService.getSocket();
                if (socket && roomId) socketService.emit('code_change_study_room', { roomId, code: newCode, language });
            }, 500);
        }
    }, [roomId, language]);

    const handleSave = async (codeToSave) => {
        const finalCode = codeToSave || code;
        try {
            await studyRoomProgrammingService.updateCode(roomId, finalCode, language);
            setSnackbar({ open: true, message: 'Saved!' });
        } catch (err) {
            console.error('Save error:', err);
            setSnackbar({ open: true, message: 'Save failed' });
        }
    };

    const handleRun = async () => {
        if (!code.trim()) { setSnackbar({ open: true, message: 'Write code first' }); return; }
        setIsRunning(true); setOutput(null); setError(null);

        console.log('=== EXECUTING CODE ===');
        console.log('Room ID:', roomId);
        console.log('Code:', code);
        console.log('Language:', language);

        try {
            if (!FEATURES.USE_CODEMIRROR) {
                const socket = socketService.getSocket();
                if (socket && roomId) socketService.emit('execute_code_study_room', { roomId, code, language });
            }

            const result = await studyRoomProgrammingService.executeCode(roomId, code, language);

            console.log('Response:', result);
            console.log('Output:', result.output);
            console.log('Error:', result.error);

            setOutput(result.output || 'Success');
            setError(result.error);
            setExecutionTime(result.executionTime);
            setMemoryUsage(result.memoryUsage);

            if (!result.error) setSnackbar({ open: true, message: 'Executed!' });
        } catch (err) {
            console.error('Execution error:', err);
            setError(err.message || 'Failed');
            setSnackbar({ open: true, message: 'Failed' });
        }
        finally { setIsRunning(false); }
    };

    if (!isInitialized) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box>;

    const gs = layoutMode === 'horizontal' ? { xs: 12, md: 6 } : { xs: 12 };

    return (
        <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 1.5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CodeIcon color="primary" /><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {FEATURES.USE_CODEMIRROR ? 'Collaborative Programming (CodeMirror)' : 'Collaborative Programming'}
                        </Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Language</InputLabel>
                        <Select value={language} label="Language" onChange={(e) => {
                            setLanguage(e.target.value);
                            if (!FEATURES.USE_CODEMIRROR) {
                                const socket = socketService.getSocket();
                                if (socket && roomId) socketService.emit('code_change_study_room', { roomId, code, language: e.target.value });
                            }
                        }} native>
                            <option value="javascript">JavaScript</option><option value="python">Python</option><option value="cpp">C++</option><option value="c">C</option>
                        </Select>
                    </FormControl>
                    {collaborators.length > 0 && <Chip label={`${collaborators.length + 1} active`} size="small" color="success" variant="outlined" />}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button variant="contained" color="primary" startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <RunIcon />}
                        onClick={handleRun} disabled={isRunning} size="medium">{isRunning ? 'Running...' : 'Run'}</Button>
                    <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => handleSave()} size="medium">Save</Button>
                    <Divider orientation="vertical" flexItem />
                    <Tooltip title="Toggle layout"><IconButton size="small" onClick={() => setLayoutMode(p => p === 'horizontal' ? 'vertical' : 'horizontal')}><LayoutIcon /></IconButton></Tooltip>
                    {!FEATURES.USE_CODEMIRROR && (
                        <Tooltip title="Toggle theme"><IconButton size="small" onClick={() => setTheme(p => p === 'light' ? 'vs-dark' : 'light')}>{theme === 'light' ? <DarkMode /> : <LightMode />}</IconButton></Tooltip>
                    )}
                    <Tooltip title="Copy"><IconButton size="small" onClick={() => { navigator.clipboard.writeText(code); setSnackbar({ open: true, message: 'Copied!' }); }}><ContentCopy /></IconButton></Tooltip>
                    <Tooltip title="Download"><IconButton size="small" onClick={() => {
                        const ext = { javascript: 'js', python: 'py', cpp: 'cpp', c: 'c' }[language] || 'txt';
                        const blob = new Blob([code], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `code.${ext}`; a.click(); URL.revokeObjectURL(url);
                    }}><DownloadIcon /></IconButton></Tooltip>
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreIcon /></IconButton>
                </Box>
            </Paper>
            <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)', flexDirection: layoutMode === 'vertical' ? 'column' : 'row', overflow: 'hidden' }}>
                <Grid item {...gs} sx={{ height: layoutMode === 'horizontal' ? '100%' : '50%' }}>
                    <Box sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        {FEATURES.USE_CODEMIRROR ? (
                            <CollaborativeEditor
                                roomId={`programming-${roomId}`}
                                userId={user.id}
                                userName={user.name}
                                language={language}
                                serverUrl={FEATURES.YJS_SERVER_URL}
                                onChange={handleCodeChange}
                                onSave={handleSave}
                                darkMode={true}
                            />
                        ) : (
                            <MonacoEditor initialCode={code} initialLanguage={language} onCodeChange={handleCodeChange}
                                onRun={handleRun} theme={theme} height="100%" showToolbar={false} />
                        )}
                    </Box>
                </Grid>
                <Grid item {...gs} sx={{ height: layoutMode === 'horizontal' ? '100%' : '50%' }}>
                    <ExecutionPanel output={output} isLoading={isRunning} error={error} language={language}
                        executionTime={executionTime} memoryUsage={memoryUsage} onClear={() => { setOutput(null); setError(null); }} onRerun={handleRun} />
                </Grid>
            </Grid>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={() => { setMenuAnchor(null); setOutput(null); setError(null); setExecutionTime(null); setMemoryUsage(null); }}>
                    Clear Output
                </MenuItem>
                <MenuItem onClick={() => { setMenuAnchor(null); setCode('// Write your code here\\nconsole.log(\"Hello!\");'); }}>
                    Reset Code
                </MenuItem>
            </Menu>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </Box>
    );
};

export default StudyRoomProgrammingModern;

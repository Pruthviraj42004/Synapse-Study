/**
 * CollaborativeEditor Component
 * 
 * CodeMirror 6 editor with Y.js CRDT-based collaboration
 * Features: Multi-user cursors, awareness, auto-save, language support
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { WebsocketProvider } from 'y-websocket';
import {
    Box,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    Typography,
    Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import './CollaborativeEditor.css';

// Language mode mapping
const LANGUAGE_MODES = {
    javascript: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
    c: cpp()
};

// User colors for cursors
const USER_COLORS = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
    '#fd79a8', '#fdcb6e', '#00b894', '#e17055', '#a29bfe'
];

const CollaborativeEditor = ({
    roomId,
    userId,
    userName = 'Anonymous',
    userColor,
    language = 'javascript',
    serverUrl = process.env.REACT_APP_YJS_SERVER_URL || 'ws://localhost:1234',
    onChange,
    onSave,
    onFocus,
    onAwarenessChange,
    darkMode = true,
    readOnly = false
}) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);
    const providerRef = useRef(null);
    const ydocRef = useRef(null);
    const autoSaveTimerRef = useRef(null);

    const [status, setStatus] = useState('connecting'); // connecting, synced, error
    const [activeUsers, setActiveUsers] = useState([]);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved

    /**
     * Initialize CodeMirror editor with Y.js binding
     */
    useEffect(() => {
        if (!editorRef.current || !roomId) return;

        // Create Y.Doc and WebSocket provider
        const ydoc = new Y.Doc();
        const ytext = ydoc.getText('codemirror');

        const provider = new WebsocketProvider(
            serverUrl,
            roomId,
            ydoc,
            {
                params: {
                    token: localStorage.getItem('token') || ''
                }
            }
        );

        ydocRef.current = ydoc;
        providerRef.current = provider;

        // Set user awareness
        const assignedColor = userColor || USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
        provider.awareness.setLocalStateField('user', {
            name: userName,
            color: assignedColor,
            userId: userId
        });

        // Provider status handlers
        provider.on('status', (event) => {
            setStatus(event.status); // 'connecting', 'connected', 'disconnected'
            console.log('Y.js provider status:', event.status);
        });

        provider.on('sync', (isSynced) => {
            if (isSynced) {
                setStatus('synced');
                console.log('✅ Editor synced with server');
            }
        });

        // Track active users
        const awarenessUpdateHandler = ({ added, updated, removed }) => {
            const states = Array.from(provider.awareness.getStates().entries());
            const users = states
                .filter(([clientId, _]) => clientId !== provider.awareness.clientID)
                .map(([clientId, state]) => ({
                    clientId,
                    ...state.user
                }));

            setActiveUsers(users);

            if (onAwarenessChange) {
                onAwarenessChange(users);
            }
        };

        provider.awareness.on('change', awarenessUpdateHandler);

        // Get language mode
        const languageMode = LANGUAGE_MODES[language] || javascript();

        // Create editor state
        const state = EditorState.create({
            doc: ytext.toString(),
            extensions: [
                basicSetup,
                languageMode,
                darkMode ? oneDark : [],
                yCollab(ytext, provider.awareness),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged && onChange) {
                        const code = update.state.doc.toString();
                        onChange(code);

                        // Trigger auto-save
                        if (autoSaveTimerRef.current) {
                            clearTimeout(autoSaveTimerRef.current);
                        }
                        autoSaveTimerRef.current = setTimeout(() => {
                            handleAutoSave(code);
                        }, 30000); // Auto-save after 30 seconds of inactivity
                    }

                    if (update.focusChanged && update.view.hasFocus && onFocus) {
                        onFocus();
                    }
                }),
                EditorView.editable.of(!readOnly),
                EditorView.theme({
                    '&': { height: '100%', fontSize: '14px' },
                    '.cm-scroller': { overflow: 'auto' },
                    '.cm-content': { minHeight: '300px' }
                })
            ]
        });

        // Create editor view
        const view = new EditorView({
            state,
            parent: editorRef.current
        });

        viewRef.current = view;

        // Cleanup
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            provider.awareness.off('change', awarenessUpdateHandler);
            view.destroy();
            provider.destroy();
            ydoc.destroy();
        };
    }, [roomId, userId, userName, userColor, language, serverUrl, readOnly, darkMode]);

    /**
     * Auto-save handler
     */
    const handleAutoSave = useCallback(async (code) => {
        if (!code || !onSave) return;

        try {
            setSaveStatus('saving');
            await onSave(code);
            setLastSaved(new Date());
            setSaveStatus('saved');

            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Auto-save failed:', error);
            setSaveStatus('idle');
        }
    }, [onSave]);

    /**
     * Manual save handler
     */
    const handleManualSave = useCallback(async () => {
        if (!viewRef.current || !onSave) return;

        const code = viewRef.current.state.doc.toString();

        try {
            setSaveStatus('saving');
            await onSave(code);
            setLastSaved(new Date());
            setSaveStatus('saved');

            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Manual save failed:', error);
            setSaveStatus('idle');
        }
    }, [onSave]);

    /**
     * Get current code
     */
    const getCode = useCallback(() => {
        if (!viewRef.current) return '';
        return viewRef.current.state.doc.toString();
    }, []);

    /**
     * Set code programmatically
     */
    const setCode = useCallback((code) => {
        if (!viewRef.current || !ydocRef.current) return;

        const ytext = ydocRef.current.getText('codemirror');
        ytext.delete(0, ytext.length);
        ytext.insert(0, code);
    }, []);

    // Expose methods via ref
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.getCode = getCode;
            editorRef.current.setCode = setCode;
            editorRef.current.save = handleManualSave;
        }
    }, [getCode, setCode, handleManualSave]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Connection status */}
                    <Tooltip title={`Status: ${status}`}>
                        <Chip
                            size="small"
                            icon={
                                status === 'synced' ? <CheckCircleIcon /> :
                                    status === 'error' ? <CloudOffIcon /> :
                                        null
                            }
                            label={
                                status === 'synced' ? 'Synced' :
                                    status === 'connecting' ? 'Connecting...' :
                                        status === 'error' ? 'Disconnected' :
                                            'Unknown'
                            }
                            color={
                                status === 'synced' ? 'success' :
                                    status === 'error' ? 'error' :
                                        'default'
                            }
                            variant="outlined"
                        />
                    </Tooltip>

                    {/* Active users */}
                    {activeUsers.length > 0 && (
                        <Tooltip title={`${activeUsers.length} active user(s): ${activeUsers.map(u => u.name).join(', ')}`}>
                            <Chip
                                size="small"
                                label={`${activeUsers.length} active`}
                                variant="outlined"
                            />
                        </Tooltip>
                    )}

                    {/* Language badge */}
                    <Chip
                        size="small"
                        label={language.toUpperCase()}
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Save status */}
                    {saveStatus !== 'idle' && (
                        <Typography variant="caption" color="text.secondary">
                            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                        </Typography>
                    )}

                    {/* Manual save button */}
                    {onSave && (
                        <Tooltip title="Save now (Auto-saves every 30s)">
                            <IconButton
                                size="small"
                                onClick={handleManualSave}
                                disabled={saveStatus === 'saving'}
                                color={saveStatus === 'saved' ? 'success' : 'default'}
                            >
                                <SaveIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {/* Connection error alert */}
            {status === 'error' && (
                <Alert severity="warning" sx={{ m: 1 }}>
                    Lost connection to collaboration server. Reconnecting...
                </Alert>
            )}

            {/* Editor container */}
            <Box
                ref={editorRef}
                sx={{
                    flex: 1,
                    overflow: 'hidden',
                    '& .cm-editor': {
                        height: '100%'
                    }
                }}
            />

            {/* Active user cursors legend */}
            {activeUsers.length > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 0.5,
                        px: 1,
                        borderTop: 1,
                        borderColor: 'divider',
                        backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Editing:
                    </Typography>
                    {activeUsers.map((user) => (
                        <Chip
                            key={user.clientId}
                            size="small"
                            label={user.name}
                            sx={{
                                backgroundColor: user.color + '20',
                                borderColor: user.color,
                                borderWidth: 1,
                                borderStyle: 'solid',
                                color: user.color,
                                fontWeight: 500,
                                fontSize: '11px'
                            }}
                        />
                    ))}
                </Paper>
            )}
        </Box>
    );
};

export default CollaborativeEditor;

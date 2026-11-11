/**
 * J.A.R.V.I.S. Voice Assistant Component
 * Hands-free voice-to-code using Web Speech API
 * Independent from Smart Draw and Whiteboard
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Mic,
    MicOff,
    Code,
    ContentCopy,
    Check,
    ExpandMore,
    History,
    VolumeUp,
    Info,
    AutoAwesome,
    RecordVoiceOver,
    Psychology,
} from '@mui/icons-material';
import { parseCommand, getSuggestions } from './commandParser';
import { generateCodeFromIntent, getCommandCategories } from './codeTemplates';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Check for Web Speech API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

const JarvisVoiceAssistant = ({ onCodeGenerated }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [status, setStatus] = useState('idle'); // idle, listening, processing, success, error
    const [generatedCode, setGeneratedCode] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (!isSpeechSupported) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setStatus('listening');
            setError(null);
        };

        recognition.onend = () => {
            if (isListening) {
                // Restart if still supposed to be listening
                try {
                    recognition.start();
                } catch (e) {
                    setIsListening(false);
                    setStatus('idle');
                }
            } else {
                setStatus('idle');
            }
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            setInterimTranscript(interim);

            if (final) {
                setTranscript(prev => prev + ' ' + final);
                processCommand(final.trim());
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.');
            } else if (event.error !== 'no-speech') {
                setError(`Speech recognition error: ${event.error}`);
            }
            setStatus('error');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, [isListening]);

    // Process voice command
    const processCommand = useCallback(async (command) => {
        if (!command) return;

        setIsProcessing(true);
        setStatus('processing');

        // Artificial delay for "J.A.R.V.I.S. processing" effect
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

        // Parse the command
        const parsed = parseCommand(command);

        if (parsed) {
            // Generate code from intent
            const code = generateCodeFromIntent(parsed);

            if (code) {
                setGeneratedCode(code);
                setStatus('success');

                // Add to history
                setCommandHistory(prev => [{
                    command,
                    intent: parsed.intent,
                    code,
                    timestamp: new Date().toISOString(),
                    confidence: parsed.confidence
                }, ...prev.slice(0, 9)]);

                // Emit event for external listeners
                if (onCodeGenerated) {
                    onCodeGenerated(code);
                }

                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('jarvis-code-gen', {
                    detail: { code, command, intent: parsed }
                }));
            }
        } else {
            setError(`Command not recognized: "${command}"`);
            setStatus('error');
        }

        setIsProcessing(false);
    }, [onCodeGenerated]);

    // Toggle listening
    const toggleListening = () => {
        if (!isSpeechSupported) {
            setError('Speech recognition is not supported in your browser. Try Chrome or Edge.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            try {
                recognitionRef.current?.stop();
            } catch (e) {
                // Ignore
            }
            setStatus('idle');
        } else {
            setIsListening(true);
            setTranscript('');
            setInterimTranscript('');
            setError(null);
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error('Failed to start recognition:', e);
                setIsListening(false);
            }
        }
    };

    // Copy code to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Get status color
    const getStatusColor = () => {
        switch (status) {
            case 'listening': return '#00f0ff';
            case 'processing': return '#9c27b0';
            case 'success': return '#4caf50';
            case 'error': return '#f44336';
            default: return 'grey';
        }
    };

    // Get status text
    const getStatusText = () => {
        switch (status) {
            case 'listening': return 'Listening...';
            case 'processing': return 'J.A.R.V.I.S. Processing...';
            case 'success': return 'Command Executed';
            case 'error': return 'Error';
            default: return 'Ready';
        }
    };

    const commandCategories = getCommandCategories();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Psychology sx={{ color: '#00f0ff' }} />
                        J.A.R.V.I.S. Voice Assistant
                    </Typography>
                    <Chip
                        label="Experimental"
                        size="small"
                        color="info"
                        variant="outlined"
                    />
                </Box>
                <Chip
                    icon={<VolumeUp />}
                    label={getStatusText()}
                    size="small"
                    sx={{
                        bgcolor: `${getStatusColor()}22`,
                        color: getStatusColor(),
                        border: `1px solid ${getStatusColor()}`,
                    }}
                />
            </Box>

            {/* Browser Support Warning */}
            {!isSpeechSupported && (
                <Alert severity="warning">
                    Speech recognition is not supported in your browser. Please use Chrome or Edge for the best experience.
                </Alert>
            )}

            {/* Error Alert */}
            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Main Content */}
            <Box display="flex" gap={2} flex={1} minHeight={0}>
                {/* Control Panel */}
                <Paper
                    sx={{
                        width: 350,
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Microphone Button */}
                    <Box display="flex" justifyContent="center" mb={3}>
                        <Tooltip title={isListening ? 'Stop Listening' : 'Start Listening'}>
                            <IconButton
                                onClick={toggleListening}
                                disabled={!isSpeechSupported}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: isListening ? 'error.main' : 'primary.main',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isListening
                                        ? '0 0 30px rgba(244, 67, 54, 0.5)'
                                        : '0 0 20px rgba(25, 118, 210, 0.3)',
                                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                    '@keyframes pulse': {
                                        '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.5)' },
                                        '70%': { boxShadow: '0 0 0 20px rgba(244, 67, 54, 0)' },
                                        '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                                    },
                                    '&:hover': {
                                        bgcolor: isListening ? 'error.dark' : 'primary.dark',
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            >
                                {isListening ? <MicOff sx={{ fontSize: 48 }} /> : <Mic sx={{ fontSize: 48 }} />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
                        {isListening ? 'Speak a command...' : 'Click to start listening'}
                    </Typography>

                    {/* Live Transcript */}
                    <Paper
                        sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.3)',
                            minHeight: 80,
                            maxHeight: 120,
                            overflow: 'auto',
                        }}
                    >
                        <Typography variant="caption" color="primary" display="block" mb={1}>
                            <RecordVoiceOver sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            Live Transcript
                        </Typography>
                        <Typography variant="body2">
                            {transcript || interimTranscript || (
                                <span style={{ opacity: 0.5 }}>Your words will appear here...</span>
                            )}
                            {interimTranscript && (
                                <span style={{ opacity: 0.5 }}>{interimTranscript}</span>
                            )}
                        </Typography>
                    </Paper>

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                            <CircularProgress size={20} color="secondary" />
                            <Typography variant="body2" color="secondary">
                                J.A.R.V.I.S. processing...
                            </Typography>
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Command Examples */}
                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info sx={{ fontSize: 18 }} />
                        Example Commands
                    </Typography>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {commandCategories.map((cat, idx) => (
                            <Accordion
                                key={idx}
                                sx={{
                                    bgcolor: 'transparent',
                                    '&:before': { display: 'none' },
                                }}
                                disableGutters
                            >
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="body2">{cat.category}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0 }}>
                                    {cat.examples.map((ex, i) => (
                                        <Typography
                                            key={i}
                                            variant="caption"
                                            display="block"
                                            sx={{
                                                py: 0.5,
                                                color: 'text.secondary',
                                                cursor: 'pointer',
                                                '&:hover': { color: 'primary.main' }
                                            }}
                                            onClick={() => processCommand(ex)}
                                        >
                                            "{ex}"
                                        </Typography>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Paper>

                {/* Code Output Section */}
                <Paper
                    sx={{
                        flex: 1,
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Code />
                            Generated Code
                        </Typography>
                        {generatedCode && (
                            <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
                                <IconButton
                                    onClick={copyToClipboard}
                                    color={copied ? 'success' : 'default'}
                                >
                                    {copied ? <Check /> : <ContentCopy />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Generated Code Display */}
                    <Box sx={{ flex: 1, overflow: 'auto', mb: 2, borderRadius: 1 }}>
                        {generatedCode ? (
                            <SyntaxHighlighter
                                language="javascript"
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    height: '100%',
                                }}
                            >
                                {generatedCode}
                            </SyntaxHighlighter>
                        ) : (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                    textAlign: 'center',
                                    p: 3,
                                }}
                            >
                                <Box>
                                    <AutoAwesome sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                    <Typography>
                                        Speak a command and watch J.A.R.V.I.S. generate code for you!
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Command History */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History sx={{ fontSize: 18 }} />
                            Recent Commands
                        </Typography>
                        <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                            {commandHistory.length > 0 ? (
                                <List dense>
                                    {commandHistory.slice(0, 5).map((item, idx) => (
                                        <ListItem
                                            key={idx}
                                            sx={{
                                                cursor: 'pointer',
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                            onClick={() => setGeneratedCode(item.code)}
                                        >
                                            <ListItemIcon>
                                                <Chip
                                                    label={item.intent.replace(/_/g, ' ')}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.command}
                                                secondary={new Date(item.timestamp).toLocaleTimeString()}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    No commands yet. Start speaking!
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default JarvisVoiceAssistant;

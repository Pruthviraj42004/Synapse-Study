import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Fade,
    Card,
    CardContent,
} from '@mui/material';
import {
    Send as SendIcon,
    School as SchoolIcon,
    QuestionAnswer as QAIcon,
} from '@mui/icons-material';
import { queryKnowledge, getStatus } from '../../services/ragKnowledgeService';

// Message component
const RAGChatMessage = ({ message, isUser }) => (
    <Fade in timeout={300}>
        <Box
            sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                mb: 2,
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: isUser
                        ? 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(124,58,237,0.15))'
                        : 'background.paper',
                    background: isUser
                        ? 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(124,58,237,0.15))'
                        : 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(76,175,80,0.05))',
                    borderLeft: isUser ? 'none' : '4px solid #4caf50',
                    borderRight: isUser ? '4px solid #00f0ff' : 'none',
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {message.content}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.6,
                        textAlign: isUser ? 'right' : 'left',
                    }}
                >
                    {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
            </Paper>
        </Box>
    </Fade>
);

// Example questions
const EXAMPLE_QUESTIONS = [
    "What event is on 25th February?",
    "What period is 5th sem CSE A at 10:00 on Monday?",
    "When is Dr. Suresh available?",
    "What are the library timings?",
    "When is the mid semester exam?",
    "What services does the placement cell offer?",
];

const RAGKnowledgePage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await getStatus();
                setStatus(result.status);
            } catch (err) {
                console.error('Failed to check RAG status:', err);
            }
        };
        checkStatus();
    }, []);

    // Handle sending a message
    const handleSend = async (questionText = null) => {
        const question = questionText || input.trim();
        if (!question) return;

        setError(null);

        // Add user message
        const userMessage = {
            id: Date.now(),
            content: question,
            isUser: true,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const result = await queryKnowledge(question);

            // Add assistant response
            const assistantMessage = {
                id: Date.now() + 1,
                content: result.answer,
                isUser: false,
                timestamp: new Date().toISOString(),
                retrievedCount: result.retrievedCount,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            setError(err.message || 'Failed to get response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(76,175,80,0.05))',
                    borderLeft: '4px solid #4caf50',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            🏫 College Knowledge Assistant (RAG)
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                            Answers are based on official college data • Ask about timetables, events, faculty, facilities & more
                        </Typography>
                    </Box>
                </Box>
                {status && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            size="small"
                            label={status.ready ? '✅ Knowledge Base Ready' : '⏳ Loading...'}
                            color={status.ready ? 'success' : 'warning'}
                        />
                        <Chip
                            size="small"
                            label={`${status.documentCount || 0} documents`}
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label={status.llmAvailable ? 'AI-Enhanced' : 'Basic Mode'}
                            color={status.llmAvailable ? 'primary' : 'default'}
                            variant="outlined"
                        />
                    </Box>
                )}
            </Paper>

            {/* Chat Area */}
            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid rgba(76,175,80,0.2)',
                }}
            >
                {/* Messages */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2,
                        bgcolor: 'background.default',
                    }}
                >
                    {messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <QAIcon sx={{ fontSize: 60, color: 'rgba(76,175,80,0.3)', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
                                Ask me anything about the college!
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, opacity: 0.5 }}>
                                I can help you with timetables, events, faculty availability, facilities, and more.
                            </Typography>

                            {/* Example Questions */}
                            <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.7 }}>
                                Try asking:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {EXAMPLE_QUESTIONS.map((q, i) => (
                                    <Chip
                                        key={i}
                                        label={q}
                                        onClick={() => handleSend(q)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'rgba(76,175,80,0.1)',
                                                borderColor: '#4caf50',
                                            },
                                        }}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <RAGChatMessage key={msg.id} message={msg} isUser={msg.isUser} />
                            ))}
                            {loading && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                                    <CircularProgress size={20} sx={{ color: '#4caf50' }} />
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                        Searching college database...
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2, mt: 0 }}>
                        {error}
                    </Alert>
                )}

                {/* Input Area */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: '1px solid rgba(76,175,80,0.2)',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            placeholder="Ask a question about the college..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': {
                                        borderColor: '#4caf50',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4caf50',
                                    },
                                },
                            }}
                        />
                        <IconButton
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#43a047',
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'rgba(76,175,80,0.3)',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            {/* Disclaimer */}
            <Card sx={{ mt: 2, bgcolor: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.2)' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        ⚠️ <strong>Note:</strong> Answers are based on the official college database only.
                        If information is not available, the assistant will let you know.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RAGKnowledgePage;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  Fab,
  Collapse,
  Alert,
  Badge
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Send as SendIcon,
  Code as CodeIcon,
  Quiz as QuizIcon,
  Map as RoadmapIcon,
  HelpOutline as QuestionIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ContentCopy as CopyIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import chatService from '../../../services/chat/chatService';
import './FloatingChatbot.css';
import editorContextService from '../../../services/editorContextService';

const FloatingChatbot = ({ editorRef, onCodeAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentMode, setCurrentMode] = useState('chat'); // chat, quiz, roadmap, code-analysis
  const [unreadCount, setUnreadCount] = useState(0);
  const [includeEditorContext, setIncludeEditorContext] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [documentContext, setDocumentContext] = useState(null); // Store resource document context

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    // Create or restore session
    const savedSessionId = localStorage.getItem('aiChatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadSession(savedSessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem('aiChatSessionId', newSessionId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1);
      }
    } else if (isOpen) {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Listen for custom event to open chatbot with resource context
  useEffect(() => {
    const handleOpenChatbot = (event) => {
      const { context, initialMessage } = event.detail;

      // If opening with resource context, start a fresh session
      if (context?.type === 'resource') {
        // Clear existing messages for a fresh start
        setMessages([]);

        // Create new session ID for this document
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        localStorage.setItem('aiChatSessionId', newSessionId);

        // Hide welcome message
        setShowWelcome(false);

        // Store document context
        setDocumentContext(context);

        // Send initial greeting about the resource
        const greetingMessage = {
          role: 'assistant',
          content: `I've loaded the document: **${context.resourceTitle}** (${context.resourceSubject}).\n\nI can now answer questions about this specific document. What would you like to know?`,
          timestamp: new Date()
        };
        setMessages([greetingMessage]);
      }

      // Open chatbot
      setIsOpen(true);
      setIsMinimized(false);

      // If there's an initial message, send it
      if (initialMessage) {
        // Small delay to ensure chatbot is open and state is updated
        setTimeout(() => {
          sendMessage(initialMessage, currentMode);
        }, 500);
      }
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, [currentMode]);

  const loadSession = async (sessionId) => {
    try {
      const response = await chatService.getSessionMessages(sessionId);
      if (response.success && response.messages) {
        // Ensure messages are in correct format (safety check)
        const formattedMessages = response.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || msg.createdAt || new Date()
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      // If loading fails, clear the session and start fresh
      localStorage.removeItem('aiChatSessionId');
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem('aiChatSessionId', newSessionId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDragStart = (e) => {
    if (isFullscreen) return;
    setIsDragging(true);
    const rect = chatContainerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging || isFullscreen) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep within window bounds
    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 600;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, isFullscreen, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset, handleDragMove, handleDragEnd]);

  const getEditorContext = () => {
    const editorInstance = editorRef?.current || editorContextService.getEditor();
    if (editorInstance) {
      try {
        const model = editorInstance.getModel();
        const selection = editorInstance.getSelection();
        const selectedText = selection ? model.getValueInRange(selection) : '';
        const fullCode = model.getValue();
        const language = model.getLanguageId();

        return {
          code: selectedText || fullCode,
          language: language,
          hasSelection: !!selectedText,
          editorContent: fullCode
        };
      } catch (error) {
        console.error('Error getting editor context:', error);
      }
    }
    return null;
  };

  const sendMessage = async (messageText = inputMessage, mode = currentMode) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      // Get editor context if enabled
      let editorContext = null;
      if (includeEditorContext && !documentContext) {
        editorContext = getEditorContext();
      }

      // Build context - prioritize document content if available
      const context = documentContext
        ? {
          type: 'resource',
          resourceId: documentContext.resourceId,
          resourceTitle: documentContext.resourceTitle,
          resourceSubject: documentContext.resourceSubject,
          documentContent: documentContext.documentContent
        }
        : editorContext
          ? {
            type: 'editor',
            editorContext
          }
          : {};

      const response = await chatService.sendMessage(messageText, sessionId, context);

      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setCurrentMode(action);
    const context = getEditorContext();

    let prompt = '';
    switch (action) {
      case 'code-analysis':
        if (!context?.code) {
          prompt = 'Please open a file in the editor first, then I can analyze your code.';
        } else {
          prompt = `Analyze this ${context.language} code and provide insights:\n\n${context.code.substring(0, 500)}${context.code.length > 500 ? '...' : ''}`;
        }
        break;
      case 'quiz':
        prompt = 'I can generate a quiz for you. What topic would you like to be quizzed on?';
        break;
      case 'roadmap':
        prompt = 'I can create a learning roadmap for you. What technology or skill would you like to learn?';
        break;
      case 'help':
        prompt = 'How can I help you today? You can ask me to:\n\n• Analyze your code\n• Generate quizzes\n• Create learning roadmaps\n• Answer programming questions\n• Explain concepts\n• Debug code\n\nWhat would you like to do?';
        break;
      default:
        return;
    }

    if (prompt) {
      sendMessage(prompt, action);
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleFeedback = async (messageId, helpful) => {
    try {
      await chatService.provideFeedback(messageId, { helpful });
      setMessages(prev => prev.map(msg =>
        msg._id === messageId
          ? { ...msg, feedback: { helpful } }
          : msg
      ));
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem('aiChatSessionId', newSessionId);
    setShowWelcome(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) {
    return (
      <Tooltip title="AI Assistant" placement="left">
        <Fab
          color="primary"
          aria-label="ai-assistant"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: (theme) => theme.zIndex.modal + 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => setIsOpen(true)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <AIIcon sx={{ fontSize: 32 }} />
          </Badge>
        </Fab>
      </Tooltip>
    );
  }

  const chatStyle = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999
  } : {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: 400,
    height: isMinimized ? 60 : 600,
    zIndex: 9998
  };

  return (
    <Paper
      ref={chatContainerRef}
      elevation={8}
      sx={{
        ...chatStyle,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isFullscreen ? 0 : 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
      }}
      className="floating-chatbot"
    >
      {/* Header */}
      <Box
        ref={dragRef}
        onMouseDown={handleDragStart}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: isFullscreen ? 'default' : 'move',
          userSelect: 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
            <BotIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {isLoading ? 'Thinking...' : 'Ready to help'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Tooltip title="Fullscreen">
            <IconButton size="small" sx={{ color: 'white' }} onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Minimize">
            <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsMinimized(!isMinimized)}>
              <MinimizeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small" sx={{ color: 'white' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={!isMinimized} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {/* Quick Actions */}
        <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: '1px solid #e0e0e0' }}>
          <Chip
            icon={<CodeIcon />}
            label="Analyze Code"
            size="small"
            onClick={() => handleQuickAction('code-analysis')}
            color={currentMode === 'code-analysis' ? 'primary' : 'default'}
          />
          <Chip
            icon={<QuizIcon />}
            label="Quiz"
            size="small"
            onClick={() => handleQuickAction('quiz')}
            color={currentMode === 'quiz' ? 'primary' : 'default'}
          />
          <Chip
            icon={<RoadmapIcon />}
            label="Roadmap"
            size="small"
            onClick={() => handleQuickAction('roadmap')}
            color={currentMode === 'roadmap' ? 'primary' : 'default'}
          />
          <Chip
            icon={<QuestionIcon />}
            label="Help"
            size="small"
            onClick={() => handleQuickAction('help')}
          />
        </Box>

        {/* Welcome Message */}
        {showWelcome && messages.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                👋 Hello! I'm your AI coding assistant
              </Typography>
              <Typography variant="caption">
                I can help you with code analysis, generate quizzes, create learning roadmaps, and answer your questions. Try selecting some code and asking me about it!
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minHeight: 0,
            maxHeight: isFullscreen ? 'calc(100vh - 250px)' : '400px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
              )}

              <Box sx={{ maxWidth: '75%' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: message.role === 'user' ? '#667eea' : message.error ? '#ffebee' : '#f5f5f5',
                    color: message.role === 'user' ? 'white' : message.error ? 'text.primary' : '#000000',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
                </Paper>

                {message.role === 'assistant' && !message.error && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => handleCopyMessage(message.content)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Helpful">
                      <IconButton
                        size="small"
                        color={message.feedback?.helpful === true ? 'primary' : 'default'}
                        onClick={() => handleFeedback(message._id, true)}
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Not helpful">
                      <IconButton
                        size="small"
                        color={message.feedback?.helpful === false ? 'error' : 'default'}
                        onClick={() => handleFeedback(message._id, false)}
                      >
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: '#764ba2', width: 32, height: 32 }}>
                  U
                </Avatar>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                <BotIcon fontSize="small" />
              </Avatar>
              <Paper elevation={1} sx={{ p: 1.5, bgcolor: '#f5f5f5' }}>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Thinking...
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'white' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything..."
            variant="outlined"
            size="small"
            disabled={isLoading}
            sx={{
              '& .MuiInputBase-input': {
                color: '#000000'
              }
            }}
          />
          <Tooltip title={includeEditorContext ? 'Including editor context' : 'Click to include editor context'}>
            <IconButton
              color={includeEditorContext ? 'primary' : 'default'}
              onClick={() => setIncludeEditorContext(v => !v)}
              aria-pressed={includeEditorContext}
              sx={{
                border: includeEditorContext ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid rgba(0,0,0,0.12)'
              }}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              minWidth: 'auto',
              px: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Collapse>

      {/* More Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { clearChat(); setAnchorEl(null); }}>
          <ListItemIcon>
            <ClearIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear Chat</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { /* TODO: Show history */ setAnchorEl(null); }}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chat History</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { /* TODO: Show settings */ setAnchorEl(null); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default FloatingChatbot;

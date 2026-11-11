import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Send, InsertEmoticon, AttachFile } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import socketService from '../../services/socketService';
import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';

const Chat = ({ roomId }) => {
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Handle incoming message
  const handleNewMessage = useCallback((msgData) => {
    // Transform server message format to client format
    const formattedMessage = {
      id: msgData._id || Date.now(),
      sender: {
        id: msgData.sender._id,
        name: msgData.sender.name,
        avatar: msgData.sender.avatar
      },
      text: msgData.content,
      timestamp: msgData.timestamp
    };

    // Don't add duplicate messages
    setMessages(prevMessages => {
      if (prevMessages.some(m => m.id === formattedMessage.id)) {
        return prevMessages;
      }
      return [...prevMessages, formattedMessage];
    });
  }, []);

  // Handle user typing status
  const handleUserTyping = useCallback(({ userId, userName }) => {
    if (userId !== user.id) {
      setTypingUsers(prev => {
        if (!prev.some(u => u.id === userId)) {
          return [...prev, { id: userId, name: userName }];
        }
        return prev;
      });
    }
  }, [user.id]);

  // Handle user stopped typing
  const handleUserStoppedTyping = useCallback(({ userId }) => {
    setTypingUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  // Initialize socket connection
  useEffect(() => {
    // Join the chat room
    socketService.joinRoom(roomId);

    // Listen for new messages
    socketService.onNewMessage(handleNewMessage);

    // Listen for typing indicators
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);

    // Load previous messages from server
    const loadMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/messages/${roomId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          const formattedMessages = response.data.messages.map(msg => ({
            id: msg._id,
            sender: {
              id: msg.sender._id,
              name: msg.sender.name,
              avatar: msg.sender.avatar
            },
            text: msg.content,
            timestamp: msg.timestamp
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // If error, start with empty messages
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Cleanup on unmount
    return () => {
      socketService.offNewMessage();
      socketService.leaveRoom(roomId);
    };
  }, [roomId, handleNewMessage, handleUserTyping, handleUserStoppedTyping]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator logic
  useEffect(() => {
    let typingTimer;

    if (isTyping) {
      // Emit typing event
      socketService.startTyping(roomId);

      // Clear typing after 3 seconds of inactivity
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(roomId);
      }, 3000);
    }

    return () => {
      clearTimeout(typingTimer);
    };
  }, [isTyping, roomId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send to socket - server expects plain text message
    socketService.sendMessage(roomId, message.trim(), 'text');

    // Reset typing state
    setIsTyping(false);
    socketService.stopTyping(roomId);

    // Clear input
    setMessage('');
  };

  // Handle message typing
  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    // Set typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    } else if (e.target.value.trim() === '') {
      setIsTyping(false);
      socketService.stopTyping(roomId);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Chat Room</Typography>
        <Typography variant="body2" color="text.secondary">
          {messages.length} messages
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 2,
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg) => {
          const isMine = msg.sender.id === user.id;

          return (
            <Box
              key={msg.id}
              alignSelf={isMine ? 'flex-end' : 'flex-start'}
              sx={{
                maxWidth: '70%',
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start'
              }}
            >
              {!isMine && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
                  {msg.sender.name}
                </Typography>
              )}

              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isMine ? 'primary.main' : 'background.paper',
                  color: isMine ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography variant="body1">
                  {msg.text}
                </Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mr: isMine ? 1 : 0, ml: isMine ? 0 : 1 }}>
                {formatTime(msg.timestamp)}
              </Typography>
            </Box>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Box sx={{ p: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing...`
                : `${typingUsers.map(u => u.name).join(', ')} are typing...`}
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <form onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small">
              <InsertEmoticon />
            </IconButton>
            <IconButton size="small">
              <AttachFile />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Type a message..."
              variant="outlined"
              value={message}
              onChange={handleMessageChange}
              size="small"
              sx={{ mx: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!message.trim()}
              endIcon={<Send />}
            >
              Send
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default Chat;
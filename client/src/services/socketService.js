import { io } from 'socket.io-client';

// Store on window instead of module level to prevent sharing across tabs/windows
const getSocketInstance = () => window.__socketInstance || null;
const setSocketInstance = (sock) => { window.__socketInstance = sock; };

// Track rooms we should be in across reconnects (sticky membership)
const desiredRooms = new Set();

// Track if listeners are bound (per window)
const getListenersBound = () => window.__socketListenersBound || false;
const setListenersBound = (val) => { window.__socketListenersBound = val; };

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const initializeSocket = (userId, options = {}) => {
  const { force = false } = options;
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No token found for socket connection');
    return;
  }

  let socket = getSocketInstance();

  // Check if socket exists but token has changed (different user logged in)
  if (getSocketInstance() && socket.io.opts.auth.token !== token) {
    console.log('[SocketService] Token changed - forcing socket recreation for new user');
    try { socket.removeAllListeners(); } catch (_) { }
    socket.disconnect();
    setSocketInstance(null);
    setListenersBound(false);
    socket = null;
  }

  // If we already have a socket and not forcing, reuse it
  if (getSocketInstance() && !force) {
    if (!socket.connected) {
      console.log('[SocketService] Existing socket found. Connecting...');
      socket.connect();
    } else {
      console.log('[SocketService] Socket already connected. Reusing instance:', socket.id);
    }
    return socket;
  }

  // If forcing and socket exists, cleanly disconnect before recreating
  if (force && socket) {
    try { socket.removeAllListeners(); } catch (_) { }
    socket.disconnect();
    setSocketInstance(null);
    setListenersBound(false);
    socket = null;
  }

  // Create new socket instance
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });
    setSocketInstance(socket);
  }

  if (!getListenersBound()) {
    setListenersBound(true);

    getSocketInstance()?.on('connect', () => {
      console.log('Connected to server with socket ID:', socket.id);
      // Re-join all desired rooms after any (re)connect
      if (desiredRooms.size > 0) {
        console.log('[SocketService] Rejoining desired rooms on connect:', Array.from(desiredRooms));
        desiredRooms.forEach((roomId) => {
          // Use the ack-capable joinRoom so we know it succeeded
          joinRoom(roomId);
        });
      }
    });

    getSocketInstance()?.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    getSocketInstance()?.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  return getSocketInstance();
};

export const disconnectSocket = () => {
  const socket = getSocketInstance();
  if (getSocketInstance()) {
    socket.disconnect();
    setSocketInstance(null);
    setListenersBound(false); // Reset listeners bound status
  }
};

// Debug helper to check socket status
export const getSocketStatus = () => {
  return {
    exists: !!getSocketInstance(),
    connected: getSocketInstance()?.connected || false,
    id: getSocketInstance()?.id || 'N/A'
  };
};

// Room management
export const joinRoom = (roomId) => {
  // Remember that we want to be in this room across reconnects
  desiredRooms.add(roomId);
  const socket = getSocketInstance();
  if (socket && socket.connected) {
    console.log('[SocketService] Joining room:', roomId);
    let acked = false;
    socket.emit('join_room', roomId, (res) => {
      acked = true;
      console.log('[SocketService] join_room ack:', res);
    });
    // Fallback retry if no ack within 1s
    setTimeout(() => {
      const retrySocket = getSocketInstance();
      if (!acked && retrySocket && retrySocket.connected) {
        console.warn('[SocketService] join_room not acked, retrying:', roomId);
        retrySocket.emit('join_room', roomId, (res) => {
          console.log('[SocketService] join_room ack (retry):', res);
        });
      }
    }, 1000);
  } else if (socket) {
    // If socket exists but not connected, wait for connection
    console.log('[SocketService] Socket not connected yet, waiting...');
    socket.once('connect', () => {
      console.log('[SocketService] Connected! Now joining room:', roomId);
      const connectedSocket = getSocketInstance();
      connectedSocket?.emit('join_room', roomId, (res) => {
        console.log('[SocketService] join_room ack (post-connect):', res);
      });
    });
  } else {
    console.error('[SocketService] Socket not initialized. Cannot join room:', roomId);
  }
};

export const leaveRoom = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('leave_room', roomId);
  }
};

// Explicitly stop tracking a room and leave it (used when navigating away)
export const untrackAndLeaveRoom = (roomId) => {
  desiredRooms.delete(roomId);
  leaveRoom(roomId);
};

// Message handling
export const sendMessage = (roomId, message, type = 'text') => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('send_message', { roomId, message, type });
  }
};

export const onNewMessage = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('new_message', callback);
  }
};

export const offNewMessage = () => {
  if (getSocketInstance()) {
    getSocketInstance()?.off('new_message');
  }
};

// Typing indicators
export const startTyping = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('typing_start', { roomId });
  }
};

export const stopTyping = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('typing_stop', { roomId });
  }
};

export const onUserTyping = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_typing', callback);
  }
};

export const onUserStoppedTyping = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_stopped_typing', callback);
  }
};

// Whiteboard events
export const sendWhiteboardUpdate = (roomId, drawingData) => {
  if (getSocketInstance() && getSocketInstance().connected) {
    console.log('[SocketService] Sending whiteboard update to room:', roomId, 'Socket connected:', getSocketInstance().connected, 'Socket ID:', getSocketInstance().id);
    getSocketInstance()?.emit('whiteboard_update', { roomId, drawingData });
  } else {
    console.error('[SocketService] Cannot send whiteboard update - socket not connected');
  }
};

export const onWhiteboardUpdate = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('whiteboard_update', callback);
  }
};

export const offWhiteboardUpdate = () => {
  if (getSocketInstance()) {
    getSocketInstance()?.off('whiteboard_update');
  }
};

// Code collaboration events
export const joinCodeSession = (sessionId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('join_code_session', sessionId);
  }
};

export const leaveCodeSession = (sessionId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('leave_code_session', sessionId);
  }
};

export const sendCodeUpdate = (sessionId, fileId, content, language, cursorPosition = null) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('code_update', {
      sessionId,
      fileId,
      content,
      language,
      cursorPosition
    });
  }
};

export const executeCodeRequest = (sessionId, code, language) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('execute_code_request', { sessionId, code, language });
  }
};

export const sendExecutionResult = (sessionId, result, error = null) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('execute_code_result', { sessionId, result, error });
  }
};

export const onCodeUpdated = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('code_updated', callback);
  }
};

export const offCodeUpdated = () => {
  if (getSocketInstance()) {
    getSocketInstance()?.off('code_updated');
  }
};

export const onUserJoinedSession = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_joined_session', callback);
  }
};

export const onUserLeftSession = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_left_session', callback);
  }
};

export const onCodeExecutionStarted = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('code_execution_started', callback);
  }
};

export const onCodeExecutionCompleted = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('code_execution_completed', callback);
  }
};

// Cursor tracking
export const sendCursorUpdate = (roomId, position) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('cursor_update', { roomId, position });
  }
};

export const onCursorUpdate = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('cursor_update', callback);
  }
};

// User presence
export const onUserJoined = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_joined', callback);
  }
};

export const onUserLeft = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_left', callback);
  }
};

export const onUserStatusChanged = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('user_status_changed', callback);
  }
};

// File sharing
export const shareFile = (roomId, fileData) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('file_shared', { roomId, file: fileData });
  }
};

export const deleteFile = (roomId, fileId, fileName) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('file_deleted', { roomId, fileId, fileName });
  }
};

export const shareNote = (roomId, noteData) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('note_shared', { roomId, note: noteData });
  }
};

export const updateNote = (roomId, noteData) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('note_updated', { roomId, note: noteData });
  }
};

export const onNewFile = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('file_shared', callback);
  }
};

export const onFileDeleted = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('file_deleted', callback);
  }
};

export const onNoteShared = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('note_shared', callback);
  }
};

export const onNoteUpdated = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('note_updated', callback);
  }
};

// Video call events
export const startVideoCall = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('video_call_start', { roomId });
  }
};

export const endVideoCall = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('video_call_end', { roomId });
  }
};

export const onVideoCallStarted = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('video_call_started', callback);
  }
};

export const onVideoCallEnded = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('video_call_ended', callback);
  }
};

// Screen sharing
export const startScreenShare = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('screen_share_start', { roomId });
  }
};

export const stopScreenShare = (roomId) => {
  if (getSocketInstance()) {
    getSocketInstance()?.emit('screen_share_stop', { roomId });
  }
};

export const onScreenShareStarted = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('screen_share_started', callback);
  }
};

export const onScreenShareStopped = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('screen_share_stopped', callback);
  }
};

// Error handling
export const onError = (callback) => {
  if (getSocketInstance()) {
    getSocketInstance()?.on('error', callback);
  }
};

// Clean up event listeners
export const removeAllListeners = () => {
  if (getSocketInstance()) {
    getSocketInstance()?.removeAllListeners();
  }
};

const socketService = {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  onNewMessage,
  offNewMessage,
  startTyping,
  stopTyping,
  onUserTyping,
  onUserStoppedTyping,
  sendWhiteboardUpdate,
  onWhiteboardUpdate,
  offWhiteboardUpdate,
  sendCursorUpdate,
  onCursorUpdate,
  onUserJoined,
  onUserLeft,
  onUserStatusChanged,
  getSocketStatus,
  shareFile,
  deleteFile,
  shareNote,
  updateNote,
  onNewFile,
  onFileDeleted,
  onNoteShared,
  onNoteUpdated,
  startVideoCall,
  endVideoCall,
  onVideoCallStarted,
  onVideoCallEnded,
  startScreenShare,
  stopScreenShare,
  onScreenShareStarted,
  onScreenShareStopped,
  // Code collaboration
  joinCodeSession,
  leaveCodeSession,
  sendCodeUpdate,
  executeCodeRequest,
  sendExecutionResult,
  onCodeUpdated,
  offCodeUpdated,
  onUserJoinedSession,
  onUserLeftSession,
  onCodeExecutionStarted,
  onCodeExecutionCompleted,
  // Error and event handling
  onError,
  removeAllListeners,
  on: (event, callback) => getSocketInstance()?.on(event, callback),
  off: (event) => getSocketInstance()?.off(event),
  emit: (event, data) => getSocketInstance()?.emit(event, data)
};

export default socketService;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const socketHandler = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.user._id}`);

    // Handle study room programming
    socket.on('join_study_room_programming', (data) => {
      const { roomId } = data;
      socket.join(`programming_room_${roomId}`);

      // Notify others in the programming session
      socket.to(`programming_room_${roomId}`).emit('user_joined_programming', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date()
      });

      console.log(`User ${socket.user.name} joined programming in room ${roomId}`);
    });

    socket.on('leave_study_room_programming', (data) => {
      const { roomId } = data;
      socket.leave(`programming_room_${roomId}`);

      // Notify others in the programming session
      socket.to(`programming_room_${roomId}`).emit('user_left_programming', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date()
      });

      console.log(`User ${socket.user.name} left programming in room ${roomId}`);
    });

    socket.on('code_change_study_room', (data) => {
      const { roomId, code, language } = data;

      // Broadcast code changes to others in the programming session
      socket.to(`programming_room_${roomId}`).emit('study_room_code_changed', {
        userId: socket.user._id,
        userName: socket.user.name,
        code,
        language,
        timestamp: new Date()
      });
    });

    socket.on('execute_code_study_room', (data) => {
      const { roomId, code, language } = data;

      // Broadcast code execution to others in the programming session
      socket.to(`programming_room_${roomId}`).emit('study_room_code_executed', {
        userId: socket.user._id,
        userName: socket.user.name,
        success: true,
        timestamp: new Date()
      });
    });

    // Handle joining study rooms
    socket.on('join_room', async (roomId, ack) => {
      try {
        socket.join(`room_${roomId}`);

        const roomSize = io.sockets.adapter.rooms.get(`room_${roomId}`)?.size || 0;
        console.log(`[Room] User ${socket.user.name} (${socket.id}) joined room_${roomId}`);
        console.log(`[Room] Room room_${roomId} now has ${roomSize} members`);

        // Get all socket IDs in the room
        const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(`room_${roomId}`) || []);
        console.log(`[Room] Sockets in room_${roomId}:`, socketsInRoom);

        // Get existing files from database and send to joining user
        const StudyRoom = require('../models/StudyRoom');
        const room = await StudyRoom.findById(roomId).populate('resources.addedBy', 'name avatar');
        if (room && room.resources && room.resources.length > 0) {
          // Send existing files to the user who just joined
          socket.emit('existing_files', {
            files: room.resources.map(resource => ({
              fileName: resource.name,
              fileUrl: resource.url,
              type: resource.type,
              sharedBy: resource.addedBy ? {
                _id: resource.addedBy._id,
                name: resource.addedBy.name,
                avatar: resource.addedBy.avatar
              } : null,
              sharedAt: resource.addedAt
            }))
          });
        }

        // Notify others in the room
        socket.to(`room_${roomId}`).emit('user_joined', {
          userId: socket.user._id,
          userName: socket.user.name,
          userAvatar: socket.user.avatar
        });

        console.log(`User ${socket.user.name} joined room ${roomId}`);
        // Acknowledge join back to caller
        if (typeof ack === 'function') {
          ack({ ok: true, roomId, roomSize, socketsInRoom });
        }
      } catch (error) {
        console.error('[Room] Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
        if (typeof ack === 'function') {
          ack({ ok: false, error: 'join_failed' });
        }
      }
    });

    // Handle leaving study rooms
    socket.on('leave_room', (roomId) => {
      socket.leave(`room_${roomId}`);

      // Notify others in the room
      socket.to(`room_${roomId}`).emit('user_left', {
        userId: socket.user._id,
        userName: socket.user.name
      });

      console.log(`User ${socket.user.name} left room ${roomId}`);
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        const { roomId, message, type = 'text' } = data;

        // Save message to database
        const newMessage = new Message({
          content: message,
          sender: socket.user._id,
          room: roomId,
          type
        });

        await newMessage.save();

        // Populate sender info
        await newMessage.populate('sender', 'name email avatar');

        const messageData = {
          _id: newMessage._id.toString(),
          sender: {
            _id: newMessage.sender._id,
            name: newMessage.sender.name,
            avatar: newMessage.sender.avatar
          },
          content: newMessage.content,
          type: newMessage.type,
          timestamp: newMessage.createdAt,
          roomId: newMessage.room
        };

        // Broadcast message to all users in the room (including sender for confirmation)
        io.to(`room_${roomId}`).emit('new_message', messageData);

        console.log(`Message sent in room ${roomId} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle whiteboard updates
    socket.on('whiteboard_update', (data) => {
      const { roomId, drawingData } = data;

      console.log(`[Whiteboard] Received update from ${socket.user.name} (${socket.id}) in room ${roomId}`);
      console.log(`[Whiteboard] Tool: ${drawingData.tool}, Points: ${drawingData.points?.length}`);
      const roomName = `room_${roomId}`;
      const currentSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
      console.log(`[Whiteboard] Room ${roomName} has ${currentSize} members`);

      // Self-heal: if sender isn't in the room yet, join them to ensure future broadcasts reach peers
      if (!socket.rooms.has(roomName)) {
        console.warn(`[Whiteboard] Socket ${socket.id} not in ${roomName}. Auto-joining now.`);
        socket.join(roomName);
        const newSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        console.log(`[Whiteboard] After auto-join, ${roomName} has ${newSize} members`);
      }

      // Broadcast whiteboard update to all users in the room except sender
      socket.to(roomName).emit('whiteboard_update', {
        drawingData,
        userId: socket.user._id
      });

      console.log(`[Whiteboard] Broadcasted update to ${roomName}`);
    });

    // Handle code editor updates for real-time collaboration
    socket.on('code_update', (data) => {
      const { sessionId, fileId, content, language, cursorPosition } = data;

      // Broadcast code update to all users in the session
      socket.to(`session_${sessionId}`).emit('code_updated', {
        userId: socket.user._id,
        userName: socket.user.name,
        fileId,
        content,
        language,
        cursorPosition,
        timestamp: new Date()
      });
    });

    // Handle joining code sessions
    socket.on('join_code_session', (sessionId) => {
      socket.join(`session_${sessionId}`);

      // Notify others in the session
      socket.to(`session_${sessionId}`).emit('user_joined_session', {
        userId: socket.user._id,
        userName: socket.user.name,
        userAvatar: socket.user.avatar,
        timestamp: new Date()
      });

      console.log(`User ${socket.user.name} joined code session ${sessionId}`);
    });

    // Handle leaving code sessions
    socket.on('leave_code_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);

      // Notify others in the session
      socket.to(`session_${sessionId}`).emit('user_left_session', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date()
      });

      console.log(`User ${socket.user.name} left code session ${sessionId}`);
    });

    // Handle code execution requests
    socket.on('execute_code_request', (data) => {
      const { sessionId, code, language, userId } = data;

      // Notify others that code is being executed
      socket.to(`session_${sessionId}`).emit('code_execution_started', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date()
      });
    });

    // Handle code execution results
    socket.on('execute_code_result', (data) => {
      const { sessionId, result, error } = data;

      // Broadcast execution result to all users in the session
      socket.to(`session_${sessionId}`).emit('code_execution_completed', {
        userId: socket.user._id,
        userName: socket.user.name,
        result,
        error,
        timestamp: new Date()
      });
    });

    // Handle cursor position updates
    socket.on('cursor_update', (data) => {
      const { roomId, position } = data;

      socket.to(`room_${roomId}`).emit('cursor_update', {
        userId: socket.user._id,
        userName: socket.user.name,
        position
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('user_stopped_typing', {
        userId: socket.user._id
      });
    });

    // Handle file sharing
    socket.on('file_shared', async (data) => {
      const { roomId, file } = data; // Frontend sends 'file', not 'fileData'

      try {
        // Save file to database
        const StudyRoom = require('../models/StudyRoom');
        const room = await StudyRoom.findById(roomId);

        if (room && file) {
          room.resources.push({
            name: file.fileName || file.name,
            url: file.fileUrl || file.url,
            type: 'file',
            addedBy: socket.user._id,
            addedAt: new Date()
          });
          await room.save();
        }

        // Broadcast to others in real-time
        socket.to(`room_${roomId}`).emit('new_file', {
          ...file,
          sharedBy: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          sharedAt: new Date()
        });
      } catch (error) {
        console.error('Error saving shared file:', error);
      }
    });

    // Handle video call signals
    socket.on('video_call_start', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('video_call_started', {
        initiator: {
          _id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    socket.on('video_call_end', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('video_call_ended', {
        endedBy: {
          _id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    // Handle screen sharing
    socket.on('screen_share_start', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('screen_share_started', {
        userId: socket.user._id,
        userName: socket.user.name
      });
    });

    socket.on('screen_share_stop', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('screen_share_stopped', {
        userId: socket.user._id
      });
    });

    // Handle user status updates
    socket.on('status_update', (data) => {
      const { status } = data; // online, away, busy, offline

      // Update user status and broadcast to all connected users
      socket.broadcast.emit('user_status_changed', {
        userId: socket.user._id,
        status
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);

      // Notify all rooms that user has disconnected
      socket.broadcast.emit('user_disconnected', {
        userId: socket.user._id,
        userName: socket.user.name
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
};

module.exports = socketHandler;
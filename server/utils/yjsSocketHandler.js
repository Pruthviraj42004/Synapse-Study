const Y = require('yjs');
const { setupWSConnection } = require('y-socket.io/dist/server');

/**
 * Yjs Socket Handler for Server-Side Document Synchronization
 * 
 * This module handles Yjs document synchronization over Socket.IO
 * Features:
 * - Real-time document sync across multiple clients
 * - Automatic conflict resolution using CRDT
 * - Persistence support (can be extended with database storage)
 * - Room-based document isolation
 */

// Store Y.Doc instances for each room/session
const documents = new Map();

/**
 * Get or create a Y.Doc for a given room
 * @param {string} roomId - The room/session identifier
 * @returns {Y.Doc} - Yjs document instance
 */
function getYDoc(roomId) {
  if (!documents.has(roomId)) {
    console.log(`[YjsSocketHandler] Creating new Y.Doc for room: ${roomId}`);
    const doc = new Y.Doc();
    documents.set(roomId, doc);
    
    // Optional: Add persistence here
    // Example: Load document from database
    // doc.on('update', (update) => {
    //   // Save updates to database
    //   saveUpdateToDatabase(roomId, update);
    // });
  }
  
  return documents.get(roomId);
}

/**
 * Clean up documents for inactive rooms
 * @param {string} roomId 
 */
function cleanupYDoc(roomId) {
  if (documents.has(roomId)) {
    console.log(`[YjsSocketHandler] Cleaning up Y.Doc for room: ${roomId}`);
    const doc = documents.get(roomId);
    doc.destroy();
    documents.delete(roomId);
  }
}

/**
 * Setup Yjs socket handling
 * @param {SocketIO.Server} io - Socket.IO server instance
 */
function setupYjsSocketHandler(io) {
  console.log('[YjsSocketHandler] Setting up Yjs socket handler');

  io.on('connection', (socket) => {
    console.log(`[YjsSocketHandler] Client connected: ${socket.id}`);

    // Handle y-socket.io connection
    socket.on('yjs-connection-init', (data) => {
      const { roomId } = data || {};
      
      if (!roomId) {
        console.error('[YjsSocketHandler] No roomId provided for yjs connection');
        return;
      }

      console.log(`[YjsSocketHandler] Initializing Yjs for room: ${roomId}, client: ${socket.id}`);

      // Join the socket to the room
      socket.join(roomId);

      // Get or create the Y.Doc for this room
      const doc = getYDoc(roomId);

      // Setup WebSocket connection for Yjs
      setupWSConnection(socket, doc, roomId);

      // Track active connections per room
      socket.on('disconnect', () => {
        console.log(`[YjsSocketHandler] Client disconnected from room ${roomId}: ${socket.id}`);
        
        // Optional: Cleanup document if no more clients in room
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
        if (!socketsInRoom || socketsInRoom.size === 0) {
          // Optionally cleanup after some delay to allow reconnections
          setTimeout(() => {
            const roomCheck = io.sockets.adapter.rooms.get(roomId);
            if (!roomCheck || roomCheck.size === 0) {
              // Save final state before cleanup if persistence is enabled
              // cleanupYDoc(roomId);
            }
          }, 30000); // 30 seconds delay
        }
      });
    });

    // Handle awareness updates (cursor positions, user presence)
    socket.on('awareness-update', (data) => {
      const { roomId, awarenessUpdate } = data;
      
      if (!roomId) return;

      // Broadcast awareness update to all clients in the room except sender
      socket.to(roomId).emit('awareness-update', {
        clientId: socket.id,
        update: awarenessUpdate
      });
    });

    // Handle explicit room join for collaboration
    socket.on('join_collaboration_room', (data) => {
      const { roomId, userId, userName } = data;
      
      if (!roomId) {
        socket.emit('collaboration_error', { message: 'Room ID is required' });
        return;
      }

      console.log(`[YjsSocketHandler] User ${userName} (${userId}) joined collaboration room: ${roomId}`);
      
      socket.join(`collab_${roomId}`);
      
      // Get the Y.Doc for this room to ensure it exists
      getYDoc(roomId);
      
      // Notify others in the room
      socket.to(`collab_${roomId}`).emit('user_joined_collaboration', {
        userId,
        userName,
        socketId: socket.id,
        timestamp: Date.now()
      });

      // Send room info back to the joining user
      const socketsInRoom = io.sockets.adapter.rooms.get(`collab_${roomId}`);
      const activeUsers = socketsInRoom ? socketsInRoom.size : 1;
      
      socket.emit('collaboration_joined', {
        roomId,
        activeUsers,
        timestamp: Date.now()
      });
    });

    // Handle explicit room leave
    socket.on('leave_collaboration_room', (data) => {
      const { roomId, userId, userName } = data;
      
      if (!roomId) return;

      console.log(`[YjsSocketHandler] User ${userName} (${userId}) left collaboration room: ${roomId}`);
      
      socket.leave(`collab_${roomId}`);
      
      // Notify others in the room
      socket.to(`collab_${roomId}`).emit('user_left_collaboration', {
        userId,
        userName,
        socketId: socket.id,
        timestamp: Date.now()
      });
    });

    // Handle cursor position updates
    socket.on('cursor_update', (data) => {
      const { roomId, position, selection, userId, userName, color } = data;
      
      if (!roomId) return;

      // Broadcast cursor position to all clients in the room except sender
      socket.to(`collab_${roomId}`).emit('remote_cursor_update', {
        userId,
        userName,
        color,
        position,
        selection,
        socketId: socket.id,
        timestamp: Date.now()
      });
    });
  });

  return {
    getYDoc,
    cleanupYDoc,
    documents
  };
}

module.exports = {
  setupYjsSocketHandler,
  getYDoc,
  cleanupYDoc
};

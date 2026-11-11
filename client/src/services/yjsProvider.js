import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';

/**
 * Yjs Provider Service
 * Manages collaborative editing sessions using Yjs CRDT and Socket.IO
 * 
 * Features:
 * - Real-time document synchronization across multiple clients
 * - Cursor awareness and presence tracking
 * - Automatic conflict resolution using CRDT (Conflict-free Replicated Data Types)
 * - Persistent connection management
 */

class YjsProviderService {
  constructor() {
    this.providers = new Map(); // Map of sessionId -> provider instance
    this.documents = new Map();  // Map of sessionId -> Y.Doc instance
    this.awareness = new Map();  // Map of sessionId -> awareness instance
  }

  /**
   * Initialize a collaborative session
   * @param {string} sessionId - Unique session identifier
   * @param {object} user - Current user information {id, name, color}
   * @param {string} serverUrl - Socket.IO server URL (default: from env or localhost)
   * @returns {object} - { doc, provider, awareness }
   */
  initSession(sessionId, user, serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000') {
    // Check if session already exists
    if (this.providers.has(sessionId)) {
      console.log(`[YjsProvider] Session ${sessionId} already exists, returning existing instance`);
      return {
        doc: this.documents.get(sessionId),
        provider: this.providers.get(sessionId),
        awareness: this.awareness.get(sessionId)
      };
    }

    console.log(`[YjsProvider] Initializing new session: ${sessionId} for user: ${user.name}`);

    // Create a new Yjs document
    const doc = new Y.Doc();

    // Create Socket.IO provider for real-time sync
    const provider = new SocketIOProvider(
      serverUrl,
      sessionId,
      doc,
      {
        autoConnect: true,
        // Reconnection settings
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        // Additional options
        transports: ['websocket', 'polling'],
        path: '/socket.io'
      }
    );

    // Get awareness instance for cursor tracking
    const awareness = provider.awareness;

    // Set local user state for awareness
    awareness.setLocalStateField('user', {
      id: user.id,
      name: user.name,
      color: user.color || this.generateColor(user.id),
      timestamp: Date.now()
    });

    // Store instances
    this.documents.set(sessionId, doc);
    this.providers.set(sessionId, provider);
    this.awareness.set(sessionId, awareness);

    // Set up event listeners
    this.setupEventListeners(sessionId, provider, awareness);

    return { doc, provider, awareness };
  }

  /**
   * Set up event listeners for provider and awareness
   */
  setupEventListeners(sessionId, provider, awareness) {
    // Provider events
    provider.on('status', ({ status }) => {
      console.log(`[YjsProvider] Session ${sessionId} status: ${status}`);
    });

    provider.on('sync', (isSynced) => {
      console.log(`[YjsProvider] Session ${sessionId} sync status: ${isSynced}`);
    });

    provider.on('connection-error', (error) => {
      console.error(`[YjsProvider] Session ${sessionId} connection error:`, error);
    });

    // Awareness events
    awareness.on('change', ({ added, updated, removed }) => {
      console.log(`[YjsProvider] Awareness change in session ${sessionId}:`, {
        added: added.length,
        updated: updated.length,
        removed: removed.length
      });
    });
  }

  /**
   * Update user cursor position and selection
   * @param {string} sessionId 
   * @param {object} cursor - { position, selection }
   */
  updateCursor(sessionId, cursor) {
    const awareness = this.awareness.get(sessionId);
    if (awareness) {
      awareness.setLocalStateField('cursor', {
        ...cursor,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get all active users in a session
   * @param {string} sessionId 
   * @returns {Array} - Array of user objects
   */
  getActiveUsers(sessionId) {
    const awareness = this.awareness.get(sessionId);
    if (!awareness) return [];

    const users = [];
    awareness.getStates().forEach((state, clientId) => {
      if (state.user) {
        users.push({
          clientId,
          ...state.user,
          cursor: state.cursor
        });
      }
    });

    return users;
  }

  /**
   * Disconnect and destroy a session
   * @param {string} sessionId 
   */
  destroySession(sessionId) {
    console.log(`[YjsProvider] Destroying session: ${sessionId}`);

    const provider = this.providers.get(sessionId);
    if (provider) {
      provider.destroy();
      this.providers.delete(sessionId);
    }

    const doc = this.documents.get(sessionId);
    if (doc) {
      doc.destroy();
      this.documents.delete(sessionId);
    }

    this.awareness.delete(sessionId);
  }

  /**
   * Generate a consistent color for a user based on their ID
   * @param {string} userId 
   * @returns {string} - Hex color code
   */
  generateColor(userId) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
      '#FF8B94', '#AED9E0', '#B4A7D6', '#FFD93D', '#6BCF7F'
    ];

    // Use userId to generate consistent color index
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Check if a session exists
   * @param {string} sessionId 
   * @returns {boolean}
   */
  hasSession(sessionId) {
    return this.providers.has(sessionId);
  }

  /**
   * Get provider instance for a session
   * @param {string} sessionId 
   * @returns {SocketIOProvider|null}
   */
  getProvider(sessionId) {
    return this.providers.get(sessionId) || null;
  }

  /**
   * Get document instance for a session
   * @param {string} sessionId 
   * @returns {Y.Doc|null}
   */
  getDocument(sessionId) {
    return this.documents.get(sessionId) || null;
  }

  /**
   * Get awareness instance for a session
   * @param {string} sessionId 
   * @returns {Awareness|null}
   */
  getAwareness(sessionId) {
    return this.awareness.get(sessionId) || null;
  }

  /**
   * Cleanup all sessions (call on app unmount)
   */
  destroyAll() {
    console.log(`[YjsProvider] Destroying all sessions`);
    this.providers.forEach((provider, sessionId) => {
      this.destroySession(sessionId);
    });
  }
}

// Export singleton instance
export const yjsProviderService = new YjsProviderService();

// Export class for testing
export default YjsProviderService;

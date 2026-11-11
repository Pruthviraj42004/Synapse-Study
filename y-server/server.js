/**
 * Y-WebSocket Server for Study Sphere
 * 
 * Provides real-time collaborative editing using CRDT (Y.js)
 * Supports room isolation, persistence, and authentication
 */

require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');
const Y = require('yjs');
const { createPersistence } = require('./persistence');

const PORT = process.env.PORT || 1234;
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';

// Store for active Y documents (roomId -> Y.Doc)
const docs = new Map();

// Persistence layer
let persistence = null;

/**
 * Initialize persistence if enabled
 */
async function initPersistence() {
    if (process.env.ENABLE_PERSISTENCE === 'true') {
        try {
            persistence = await createPersistence();
            console.log('✅ Persistence layer initialized');
        } catch (error) {
            console.error('⚠️  Persistence initialization failed:', error.message);
            console.error('   Continuing without persistence...');
        }
    }
}

/**
 * Authenticate WebSocket connection
 * @param {string} token - JWT token from query string
 * @returns {object|null} - Decoded token or null if invalid
 */
function authenticateConnection(token) {
    if (!REQUIRE_AUTH) {
        return { authenticated: true, userId: 'anonymous' };
    }

    if (!token) {
        return null;
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { authenticated: true, ...decoded };
    } catch (error) {
        console.error('Authentication failed:', error.message);
        return null;
    }
}

/**
 * Get or create Y.Doc for a room
 * @param {string} roomId - Room identifier
 * @returns {Y.Doc} - Y.js document
 */
async function getYDoc(roomId) {
    if (docs.has(roomId)) {
        return docs.get(roomId);
    }

    const doc = new Y.Doc();
    docs.set(roomId, doc);

    // Load persisted state if available
    if (persistence) {
        try {
            const snapshot = await persistence.loadSnapshot(roomId);
            if (snapshot) {
                const update = Buffer.from(snapshot, 'base64');
                Y.applyUpdate(doc, update);
                console.log(`📂 Loaded snapshot for room: ${roomId}`);
            }
        } catch (error) {
            console.error(`Error loading snapshot for ${roomId}:`, error.message);
        }
    }

    // Set up periodic snapshot saves
    if (persistence) {
        const interval = parseInt(process.env.SNAPSHOT_INTERVAL) || 60000;
        const saveInterval = setInterval(async () => {
            try {
                await saveSnapshot(roomId, doc);
            } catch (error) {
                console.error(`Snapshot save error for ${roomId}:`, error.message);
            }
        }, interval);

        // Clean up interval when document is destroyed
        doc.on('destroy', () => {
            clearInterval(saveInterval);
        });
    }

    return doc;
}

/**
 * Save document snapshot to persistence
 * @param {string} roomId - Room identifier
 * @param {Y.Doc} doc - Y.js document
 */
async function saveSnapshot(roomId, doc) {
    if (!persistence) return;

    const state = Y.encodeStateAsUpdate(doc);
    const snapshot = Buffer.from(state).toString('base64');
    await persistence.saveSnapshot(roomId, snapshot);
    console.log(`💾 Snapshot saved for room: ${roomId}`);
}

/**
 * Clean up inactive rooms
 */
function cleanupInactiveRooms() {
    const timeout = 1000 * 60 * 60; // 1 hour

    setInterval(() => {
        const now = Date.now();
        docs.forEach((doc, roomId) => {
            const conns = doc.conns;
            if (!conns || conns.size === 0) {
                const lastActivity = doc._lastActivity || doc._created || 0;
                if (now - lastActivity > timeout) {
                    console.log(`🧹 Cleaning up inactive room: ${roomId}`);
                    doc.destroy();
                    docs.delete(roomId);
                }
            } else {
                doc._lastActivity = now;
            }
        });
    }, 60000); // Check every minute
}

/**
 * Start the WebSocket server
 */
async function startServer() {
    await initPersistence();

    const server = http.createServer((req, res) => {
        // Health check endpoint
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                activeRooms: docs.size,
                persistence: !!persistence,
                timestamp: new Date().toISOString()
            }));
            return;
        }

        // Metrics endpoint
        if (req.url === '/metrics') {
            const metrics = {
                activeRooms: docs.size,
                rooms: Array.from(docs.keys()),
                persistence: !!persistence,
                uptime: process.uptime()
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(metrics));
            return;
        }

        res.writeHead(404);
        res.end('Not found');
    });

    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        // Extract room ID from URL path (y-websocket sends as /{roomId})
        // Or from query parameter for backwards compatibility
        const url = new URL(req.url, `http://${req.headers.host}`);

        // y-websocket library sends room name as the URL path (e.g., /programming-roomid)
        let roomId = url.pathname.slice(1); // Remove leading /

        // Fallback to query parameter if path is empty
        if (!roomId || roomId === '') {
            roomId = url.searchParams.get('room');
        }

        const token = url.searchParams.get('token');

        // Validate room ID
        if (!roomId) {
            console.log('❌ Connection rejected: Missing room parameter');
            ws.close(4000, 'Missing room parameter');
            return;
        }

        // Authenticate if required
        const auth = authenticateConnection(token);
        if (!auth) {
            ws.close(4001, 'Authentication failed');
            return;
        }

        console.log(`🔌 Client connected to room: ${roomId} (user: ${auth.userId || 'anonymous'})`);

        try {
            // Get or create Y.Doc for this room
            const doc = await getYDoc(roomId);

            // Track creation time if new
            if (!doc._created) {
                doc._created = Date.now();
            }

            // Set up WebSocket connection with y-websocket utilities
            setupWSConnection(ws, req, {
                docName: roomId,
                gc: true
            });

            ws.on('close', () => {
                console.log(`🔌 Client disconnected from room: ${roomId}`);
            });

        } catch (error) {
            console.error(`Error setting up connection for room ${roomId}:`, error);
            ws.close(4002, 'Internal server error');
        }
    });

    // Start cleanup task
    cleanupInactiveRooms();

    server.listen(PORT, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 Y-WebSocket Server for Study Sphere');
        console.log('='.repeat(60));
        console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
        console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
        console.log(`🔐 Authentication: ${REQUIRE_AUTH ? 'ENABLED' : 'DISABLED'}`);
        console.log(`💾 Persistence: ${persistence ? 'ENABLED' : 'DISABLED'}`);
        console.log('='.repeat(60) + '\n');
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');

    // Save all active documents
    if (persistence) {
        const savePromises = Array.from(docs.entries()).map(([roomId, doc]) =>
            saveSnapshot(roomId, doc).catch(err =>
                console.error(`Failed to save ${roomId}:`, err)
            )
        );
        await Promise.all(savePromises);
    }

    process.exit(0);
});

// Start the server
startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

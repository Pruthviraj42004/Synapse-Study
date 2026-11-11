const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Create app
const app = express();
const httpServer = createServer(app);

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

// ------------------------
// ALLOWED ORIGINS
// ------------------------
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
      process.env.CLIENT_URL,     // Render static frontend
      "https://majorprojectfinal-dy9q.onrender.com",
    ]
    : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
    ];

console.log("Allowed origins:", allowedOrigins);

// ------------------------
// SOCKET.IO CORS
// ------------------------
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// ------------------------
// SECURITY / MIDDLEWARE
// ------------------------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  })
);

// API CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());
app.use(hpp());
app.use(compression());



// ------------------------
// MONGO DB
// ------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ------------------------
// SOCKET.IO HANDLERS
// ------------------------
const socketHandler = require("./utils/socketHandler");
const { setupYjsSocketHandler } = require("./utils/yjsSocketHandler");

// Initialize socket handlers for real-time features
socketHandler(io);
setupYjsSocketHandler(io);

console.log("✅ Socket.IO handlers initialized");

// ------------------------
// LIVEKIT \u0026 ROOM MANAGER
// ------------------------
const livekitService = require("./services/livekitService");
const roomCleanupWorker = require("./workers/roomCleanup");

if (livekitService.isConfigured()) {
  console.log("✅ LiveKit initialized");
  // Start room cleanup worker
  roomCleanupWorker.start();
} else {
  console.warn("⚠️  LiveKit not configured - audio/video features will be disabled");
  console.warn("⚠️  Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET to enable");
}

// attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ------------------------
// ROUTES
// ------------------------
// Load route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studyRoomRoutes = require('./routes/studyRoomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes'); // Keep existing route
const whiteboardRoutes = require('./routes/whiteboardRoutes'); // Keep existing route
const programmingRoutes = require('./routes/programmingRoutes');
const chatRoutes = require('./routes/chat/chatRoutes'); // Keep existing route
const studyRoomProgrammingRoutes = require('./routes/studyRoomProgrammingRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const roomRoutes = require('./routes/roomRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ragKnowledgeRoutes = require('./routes/ragKnowledgeRoutes');

// Handle OPTIONS requests for all routes (CORS preflight)
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/whiteboard', whiteboardRoutes);
app.use('/api/programming', programmingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/study-room-programming', studyRoomProgrammingRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/rooms', roomRoutes); // Unified room routes
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/rag-knowledge', ragKnowledgeRoutes); // RAG Knowledge Assistant (separate feature)

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ------------------------
// GLOBAL ERROR HANDLER
// ------------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
    errors: err.errors || null,
  });
});

// ------------------------
// START SERVER
// ------------------------
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV}`)
);

module.exports = app;
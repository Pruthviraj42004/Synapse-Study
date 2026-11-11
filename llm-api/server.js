require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const chatRoutes = require('./routes/chatRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'LLM API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Custom LLM API',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /api/chat',
            models: 'GET /api/chat/models',
            health: 'GET /health'
        },
        note: 'Running in MOCK mode - no MongoDB required'
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Skip database connection for mock mode
        logger.info('Running in mock mode - database not required');

        // Start listening
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`LLM Provider: ${process.env.LLM_PROVIDER || 'mock'}`);
            console.log(`\n🚀 Server ready at http://localhost:${PORT}`);
            console.log(`📚 API Documentation at http://localhost:${PORT}`);
            console.log(`🔧 Running in MOCK mode - no database required\n`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
});

startServer();

# Custom LLM API

A production-grade LLM API built with Node.js and Express, featuring streaming responses, authentication, rate limiting, and chat history management. Similar to ChatGPT/Groq APIs.

## ✨ Features

### Core Features
- **Streaming Responses**: Real-time Server-Sent Events (SSE) for chat streaming
- **API Key Authentication**: Secure access with API keys
- **Rate Limiting**: Configurable rate limits per endpoint
- **Request/Response Logging**: Comprehensive Winston-based logging
- **Error Handling**: Consistent error responses across all endpoints
- **Multiple LLM Providers**: Support for OpenAI, Groq, or mock responses

### Optional Extensions
- **User Authentication**: JWT-based user registration and login
- **Chat History**: Automatic conversation storage and retrieval
- **Multiple Models**: Support for various LLM models

## 📁 Project Structure

```
llm-api/
├── server.js                 # Main entry point
├── package.json             # Dependencies
├── .env.example            # Environment variables template
├── config/
│   ├── database.js         # MongoDB connection
│   └── models.js           # LLM models configuration
├── controllers/
│   ├── chatController.js   # Chat logic with streaming
│   ├── authController.js   # User authentication
│   └── historyController.js # Chat history management
├── middleware/
│   ├── apiKeyAuth.js       # API key validation
│   ├── jwtAuth.js          # JWT token validation
│   ├── rateLimiter.js      # Rate limiting
│   ├── logger.js           # Request logging
│   └── errorHandler.js     # Error handling
├── models/
│   ├── User.js             # User schema
│   └── ChatHistory.js      # Chat history schema
├── routes/
│   ├── chatRoutes.js       # Chat endpoints
│   ├── authRoutes.js       # Auth endpoints
│   └── historyRoutes.js    # History endpoints
├── utils/
│   ├── logger.js           # Winston logger setup
│   └── llmService.js       # LLM provider interface
├── test/
│   └── test-streaming.js   # Streaming test script
└── logs/                   # Log files (auto-generated)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or MongoDB Atlas)
- OpenAI API key or Groq API key (optional, uses mock by default)

### Step 1: Installation

```bash
# Navigate to the project directory
cd llm-api

# Install dependencies
npm install
```

### Step 2: Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
```

**Minimum required .env configuration:**

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/llm-api
API_KEYS=test-api-key-123
JWT_SECRET=your-secret-key-change-this
LLM_PROVIDER=mock
```

**For OpenAI:**

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
```

**For Groq:**

```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your-groq-key-here
GROQ_DEFAULT_MODEL=mixtral-8x7b-32768
```

### Step 3: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Step 4: Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Methods
1. **API Key**: Use `x-api-key` header for chat endpoints
2. **JWT Token**: Use `Authorization: Bearer <token>` for protected endpoints

---

### Endpoints

#### **1. Chat - POST /api/chat**

Send messages and receive streaming responses.

**Headers:**
```
x-api-key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "stream": true,
  "conversationId": "optional-conversation-id"
}
```

**Streaming Response (SSE):**
```
data: {"chunk":"Hello","conversationId":"uuid"}

data: {"chunk":"! I'm","conversationId":"uuid"}

data: {"chunk":" doing well","conversationId":"uuid"}

data: {"done":true,"conversationId":"uuid"}
```

**Non-Streaming Response (stream: false):**
```json
{
  "success": true,
  "reply": "Hello! I'm doing well, thank you for asking.",
  "conversationId": "uuid",
  "model": "gpt-3.5-turbo"
}
```

---

#### **2. Get Models - GET /api/chat/models**

Get available LLM models.

**Headers:**
```
x-api-key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "provider": "openai",
  "models": [
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k"
  ]
}
```

---

#### **3. Register - POST /api/auth/register**

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "apiKey": "llm_generated-api-key"
  }
}
```

---

#### **4. Login - POST /api/auth/login**

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "apiKey": "llm_generated-api-key"
  }
}
```

---

#### **5. Get Profile - GET /api/auth/profile**

Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "apiKey": "llm_generated-api-key",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### **6. Get History - GET /api/history**

Get all chat conversations (paginated).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "uuid",
      "model": "gpt-3.5-turbo",
      "messages": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

#### **7. Get Conversation - GET /api/history/:id**

Get specific conversation by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Hi there!",
        "timestamp": "2024-01-01T00:00:01.000Z"
      }
    ]
  }
}
```

---

#### **8. Delete Conversation - DELETE /api/history/:id**

Delete a conversation.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

#### **9. Health Check - GET /health**

Check server status.

**Response:**
```json
{
  "success": true,
  "message": "LLM API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

## 🧪 Testing

### Test Streaming Endpoint

```bash
npm test
```

This runs the test script that:
1. Registers a new user
2. Sends a chat message
3. Receives and displays the streaming response

### Manual Testing with cURL

**Chat with streaming:**
```bash
curl -N -H "x-api-key: test-api-key-123" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}' \
  http://localhost:3000/api/chat
```

**Register user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔧 Configuration

### Rate Limiting

Edit `.env`:
```env
RATE_LIMIT_WINDOW_MS=60000        # 1 minute
RATE_LIMIT_MAX_REQUESTS=10        # 10 requests per window
```

### Logging

Edit `.env`:
```env
LOG_LEVEL=info    # Options: error, warn, info, debug
```

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🔐 Security Best Practices

1. **Change default secrets**: Update `JWT_SECRET` and `API_KEYS` in production
2. **Use HTTPS**: Deploy behind a reverse proxy with SSL
3. **Secure database**: Use strong MongoDB credentials
4. **Environment variables**: Never commit `.env` file
5. **Rate limiting**: Adjust based on your needs
6. **API key rotation**: Regularly update API keys

## 🚢 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/llm-api
JWT_SECRET=use-a-strong-random-secret-here
API_KEYS=production-key-1,production-key-2
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
LOG_LEVEL=warn
```

### Deploy to Services

**Heroku:**
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

**Railway/Render:**
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically

## 📊 Monitoring

Check logs in real-time:
```bash
tail -f logs/combined.log
```

Monitor errors:
```bash
tail -f logs/error.log
```

## 🤝 Support

For issues or questions:
1. Check the logs in `logs/combined.log`
2. Verify environment variables
3. Ensure MongoDB is running
4. Check API key validity

## 📝 License

MIT License - feel free to use this project for any purpose.

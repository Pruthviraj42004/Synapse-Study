# Quick Start Guide - Run on Localhost

## 🚀 Step-by-Step Setup

### Step 1: Setup LLM API Server (Port 3000)

```bash
# Navigate to LLM API directory
cd /Users/prathikvn/Downloads/majorprojectfinal-main/llm-api

# Install dependencies
npm install

# Create .env file manually
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/llm-api
API_KEYS=test-api-key-123,dev-key-456
JWT_SECRET=my-secret-jwt-key-for-testing
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
LLM_PROVIDER=mock
LOG_LEVEL=info
EOF

# Start the LLM API server
npm start
```

Server will run at: **http://localhost:3000**

---

### Step 2: Configure Your Main Application

```bash
# In a NEW terminal, navigate to your main project
cd /Users/prathikvn/Downloads/majorprojectfinal-main/majorprojectfinal

# Add these to your .env file (or create if doesn't exist)
echo "CUSTOM_API_URL=http://localhost:3000/api/chat" >> .env
echo "CUSTOM_API_KEY=test-api-key-123" >> .env
```

---

### Step 3: Start Your Main Application

```bash
# Make sure you're in the majorprojectfinal directory
cd /Users/prathikvn/Downloads/majorprojectfinal-main/majorprojectfinal

# Start the server (if separate server folder)
cd server && npm start

# In another terminal, start the client
cd ../client && npm start
```

---

## ✅ Verify Everything Works

### Test 1: Check LLM API is Running
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "success": true,
  "message": "LLM API is running",
  "timestamp": "...",
  "uptime": 123
}
```

### Test 2: Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key-123" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

Should return:
```json
{
  "success": true,
  "reply": "Mock response to: \"Hello!\". This is a test response.",
  "conversationId": "...",
  "model": "mock-model"
}
```

---

## 🎯 Quick Commands (Copy & Paste)

### Terminal 1 - Start LLM API:
```bash
cd /Users/prathikvn/Downloads/majorprojectfinal-main/llm-api && npm install && npm start
```

### Terminal 2 - Start Main Server:
```bash
cd /Users/prathikvn/Downloads/majorprojectfinal-main/majorprojectfinal/server && npm start
```

### Terminal 3 - Start Client:
```bash
cd /Users/prathikvn/Downloads/majorprojectfinal-main/majorprojectfinal/client && npm start
```

---

## 🔧 Troubleshooting

### MongoDB Not Running?
The mock LLM provider doesn't need MongoDB. If you see MongoDB errors, you can either:
1. Install and start MongoDB: `brew install mongodb-community && brew services start mongodb-community`
2. Or comment out database connection in `server.js`

### Port Already in Use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in llm-api/.env
PORT=3001
```

### Missing Dependencies?
```bash
cd llm-api && npm install axios dotenv express express-rate-limit winston mongoose jsonwebtoken bcryptjs cors uuid
```

---

## 📝 What You'll See

1. **LLM API Server** (Terminal 1):
   ```
   🚀 Server ready at http://localhost:3000
   📚 API Documentation at http://localhost:3000
   ```

2. **Main Application** will now use the local LLM API instead of Groq!

3. **Test the Chat Feature** in your app - it will call `localhost:3000/api/chat`

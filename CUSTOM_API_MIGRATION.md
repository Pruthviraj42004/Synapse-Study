# Custom API Migration - Configuration Guide

## ✅ What Changed

All Groq API calls have been **completely replaced** with your custom API endpoint.

### Before (Groq):
```javascript
const groqService = require('groq-sdk');
const response = await groq.chat.completions.create({...});
```

### After (Custom API):
```javascript
const customClient = require('./services/chat/huggingFaceService');
const response = await customClient.chatClient(messages, options, stream);
```

---

## 🔧 Environment Configuration

Add these variables to your `.env` file:

```env
# Custom LLM API Configuration
CUSTOM_API_URL=https://mydomain.com/api/chat
CUSTOM_API_KEY=your-api-key-here

# Remove these (no longer needed):
# GROQ_API_KEY=...
```

**Replace:**
- `https://mydomain.com/api/chat` with your actual API URL
- `your-api-key-here` with your actual API key

---

## 📦 Dependencies

### Install Required Packages

```bash
npm install axios node-fetch
```

### Remove Old Dependencies (Optional)

```bash
npm uninstall groq-sdk
```

---

## 🚀 API Endpoint Requirements

Your custom API must accept requests in this format:

### Request Format
```http
POST https://mydomain.com/api/chat
Content-Type: application/json
x-api-key: your-api-key

{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant" },
    { "role": "user", "content": "Hello!" }
  ],
  "stream": false
}
```

### Response Format (Non-Streaming)
```json
{
  "reply": "Hello! How can I help you today?"
}
```

OR

```json
{
  "message": "Hello! How can I help you today?"
}
```

### Response Format (Streaming - SSE)
```
data: {"chunk":"Hello","conversationId":"uuid"}

data: {"chunk":"! How","conversationId":"uuid"}

data: {"done":true,"conversationId":"uuid"}
```

---

## 🎯 Features Implemented

### ✅ Single Reusable Function
- `chatClient(messages, options, stream)` - Handles all API calls

### ✅ Streaming Support
- Server-Sent Events (SSE) for real-time responses
- Automatic parsing and assembly

### ✅ Error Handling
- Authentication errors (401, 403)
- Rate limiting (429)
- Server errors (500)
- Timeout handling

### ✅ API Key Security
- Headers: `x-api-key: YOUR_API_KEY`
- Environment variable configuration

### ✅ No Groq Dependencies
- **Zero** imports from `groq-sdk`
- **Zero** calls to `groq.chat.completions.create()`
- All Groq references removed

---

## 📝 Updated Methods

All these methods now use the custom API:

| Method | Purpose | Endpoint |
|--------|---------|----------|
| `chat()` | General chat | Custom API |
| `analyzeCode()` | Code analysis | Custom API |
| `generateQuiz()` | Quiz generation | Custom API |
| `generateRoadmap()` | Learning roadmaps | Custom API |
| `answerQuestion()` | Q&A | Custom API |
| `summarize()` | Text summarization | Custom API |

---

## 🧪 Testing

### 1. Verify Environment Variables

```bash
node -e "console.log(process.env.CUSTOM_API_URL, process.env.CUSTOM_API_KEY)"
```

### 2. Test the Service

```javascript
const customClient = require('./server/services/chat/huggingFaceService');

// Test non-streaming
const messages = [
  { role: 'user', content: 'Hello!' }
];

customClient.chatClient(messages, {}, false)
  .then(reply => console.log('Reply:', reply))
  .catch(err => console.error('Error:', err));
```

### 3. Test from Controller

Your existing controllers should work without modification since the interface remains the same.

---

## 🔍 Code Changes Summary

### Files Modified

1. **`/server/services/chat/huggingFaceService.js`**
   - Replaced `callGroq()` with `chatClient()`
   - Removed Groq SDK imports
   - Added axios/fetch for HTTP requests
   - Updated all method implementations

2. **`/majorprojectfinal/server/services/chat/huggingFaceService.js`**
   - Same changes as above (duplicate file)

### Controllers (No Changes Required)

Controllers continue to work without modification:

```javascript
// This still works!
const groqService = require('../../services/chat/huggingFaceService');
const result = await groqService.chat(message, history, context);
```

---

## ⚙️ Configuration Options

### Change API URL
```javascript
// In huggingFaceService.js constructor:
this.apiUrl = 'https://your-custom-domain.com/api/chat';
```

### Change Default Model
```javascript
this.models = {
  fast: 'gpt-3.5-turbo',      // Change these
  smart: 'gpt-4',              // to match your
  coding: 'gpt-4',             // API's available
  creative: 'gpt-3.5-turbo'    // models
};
```

### Adjust Timeout
```javascript
// In chatClient() method:
const response = await axios.post(this.apiUrl, requestBody, {
  headers,
  timeout: 120000  // Change timeout (milliseconds)
});
```

---

## 🚨 Troubleshooting

### Error: "Custom API key not configured"
**Solution:** Set `CUSTOM_API_KEY` in your `.env` file

### Error: "API authentication failed"
**Solution:** Verify your API key is correct and has proper permissions

### Error: "Rate limit exceeded"
**Solution:** Wait a moment and retry, or increase rate limits on your API

### Error: "Invalid response format"
**Solution:** Ensure your API returns `{ reply: "..." }` or `{ message: "..." }`

---

## 📞 Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify API endpoint is accessible
3. Test API with curl/Postman first
4. Ensure response format matches expected structure

---

## ✨ Summary

**All Groq API calls have been successfully replaced with your custom API!**

- ✅ Reusable `chatClient()` function
- ✅ Fetch/Axios based requests
- ✅ Streaming & non-streaming support
- ✅ Proper headers & API key usage
- ✅ **ZERO** Groq dependencies

Your project is now fully migrated to use your custom LLM API endpoint.

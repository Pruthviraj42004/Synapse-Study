# LiveKit Integration Setup Guide

## 🎯 Overview
This guide will help you set up LiveKit for audio/video communication in Study Sphere.

## 📋 Prerequisites
- Node.js 16+ installed
- MongoDB running
- Study Sphere codebase

## 🚀 Quick Setup (5 minutes)

### Step 1: Get LiveKit Account (Free)

1. Visit https://livekit.io
2. Click "Get Started Free"
3. Create an account (GitHub login available)
4. Create a new project
5. Copy your credentials:
   - **LiveKit URL**: `wss://your-project.livekit.cloud`
   - **API Key**: Shown in dashboard
   - **API Secret**: Shown in dashboard

### Step 2: Configure Environment Variables

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your LiveKit credentials:
   ```env
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=APIxxxxxxxxxxx
   LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Start the Server

```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm run dev
```

You should see:
```
✅ LiveKit initialized
✅ Room cleanup worker started
```

### Step 4: Test the Integration

1. Start the client:
   ```bash
   cd client
   npm start
   ```

2. Create or join a study room
3. You should see:
   - Microphone icon in the header
   - "Connected to audio" message
   - Participant count with audio status

## 🎤 How It Works

### Always-On Audio
- Audio connects automatically when you join a room
- Stays connected while you switch between Chat, Code, Whiteboard
- No popups, no redirects - everything in one tab

### Participant View
- See who's in the room
- Audio status indicators (🎤 muted/unmuted)
- Real-time join/leave notifications

### Room Lifecycle
- Rooms auto-cleanup after 30 minutes of inactivity
- LiveKit rooms close when empty
- State persists in MongoDB

## 🔧 Advanced Configuration

### Self-Hosted LiveKit (Optional)

If you want to host your own LiveKit server:

1. Follow LiveKit's deployment guide: https://docs.livekit.io/deploy
2. Update your `.env`:
   ```env
   LIVEKIT_URL=wss://your-domain.com
   LIVEKIT_API_KEY=your_key
   LIVEKIT_API_SECRET=your_secret
   ```

### Room Settings

Edit `server/config/livekit.js` to customize:
- `emptyTimeout`: How long before empty rooms close (default: 5 minutes)
- `maxParticipants`: Maximum participants per room (default: 50)
- `cleanupInterval`: How often to check for inactive rooms (default: 5 minutes)

## 🐛 Troubleshooting

### "LiveKit not configured" Warning

**Problem**: Server shows warning about missing LiveKit credentials

**Solution**:
1. Verify `.env` file exists in `server/` directory
2. Check that variables are set:
   ```bash
   echo $LIVEKIT_API_KEY
   ```
3. Restart the server

### Audio Not Connecting

**Problem**: Users can't connect to audio

**Possible causes**:
1. **Browser permissions**: Allow microphone access
2. **Invalid credentials**: Check API key/secret in LiveKit dashboard
3. **Network issues**: Check firewall allows WebRTC

**Debug steps**:
```javascript
// In browser console
localStorage.debug = 'livekit:*'
// Reload page and check console
```

### Participants Not Showing

**Problem**: Can't see other participants

**Solution**:
1. Check Socket.IO connection (Network tab)
2. Verify both users joined the same room
3. Check browser console for errors

## 📊 Monitoring

### Check Active Rooms

```bash
curl http://localhost:5000/api/rooms/stats/active
```

### LiveKit Dashboard

Visit your LiveKit cloud dashboard to see:
- Active rooms
- Participant count
- Bandwidth usage
- Connection quality

## 🔒 Security Best Practices

1. **Never commit `.env`**: Already in `.gitignore`
2. **Rotate keys regularly**: In production, rotate API keys monthly
3. **Use HTTPS**: In production, always use HTTPS
4. **Token expiration**: Tokens expire after 1 hour (configurable)

## 🎓 Next Steps

- ✅ LiveKit audio working
- 📹 Add video (optional) - Update `canPublish` in token generation
- 📱 Test on mobile devices
- 🚀 Deploy to production

## 📚 Resources

- LiveKit Documentation: https://docs.livekit.io
- React SDK: https://docs.livekit.io/client-sdk-js/react
- Study Sphere Repo: Your repository

## 💬 Support

If you encounter issues:
1. Check LiveKit status: https://status.livekit.io
2. Review console logs (backend & frontend)
3. Check LiveKit dashboard for room status

---

**Ready to go!** Your audio communication is now powered by LiveKit 🎉

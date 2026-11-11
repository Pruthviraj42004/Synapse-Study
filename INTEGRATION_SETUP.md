# Quick Setup Guide - Study Sphere Modernization

## ✅ What Was Done

I've integrated the new components into your existing study rooms:

### 1. Video Call Tab - Daily.co Integration
- **Old**: Jitsi opens in a popup window
- **New**: Daily.co video embedded directly in the Video Call tab
- **File**: `client/src/components/StudyRoom/VideoCallTab.jsx`

### 2. Programming Tab - CodeMirror Collaborative Editor
- **Old**: Monaco editor with socket.io sync
- **New**: CodeMirror 6 + Y.js CRDT collaborative editing
- **File**: `client/src/components/Programming/StudyRoomProgrammingModern.js`

### 3. Feature Flags
- Both features are **disabled by default** (safe!)
- You can enable them via environment variables
- **File**: `client/src/config/features.js`

---

## 🚀 To Enable New Features:

### Step 1: Install Frontend Dependencies

```bash
cd client
npm install codemirror @codemirror/lang-javascript @codemirror/lang-python @codemirror/lang-java @codemirror/lang-cpp @codemirror/theme-one-dark yjs y-codemirror.next y-websocket @daily-co/daily-js
```

### Step 2: Start Y-WebSocket Server (for CodeMirror)

```bash
cd y-server
npm install
npm start
```

This server should be running on `ws://localhost:1234`

### Step 3: Enable Features in Frontend

Create or update `client/.env`:

```bash
# To enable Daily.co video (replaces Jitsi)
REACT_APP_USE_DAILY_VIDEO=true

# To enable CodeMirror collaborative editor (replaces Monaco)
REACT_APP_USE_CODEMIRROR=true

# Y-WebSocket server URL
REACT_APP_YJS_SERVER_URL=ws://localhost:1234
```

### Step 4: Get Daily.co API Key (Optional but Recommended)

1. Sign up at https://dashboard.daily.co
2. Get your API key from the Developers tab
3. Add to `server/.env`:

```bash
DAILY_API_KEY=your_api_key_here
DAILY_DOMAIN=your-domain.daily.co
```

**Without API key**: Video will work in mock mode (good for testing UI)

### Step 5: Restart Frontend

```bash
cd client
npm start
```

---

## 🎯 How to Test

### Test Video Integration:

1. Go to any study room
2. Click the **Video Call** tab
3. If `REACT_APP_USE_DAILY_VIDEO=true`:
   - Video shows **embedded** in the tab
   - Click "Join Video" to enable camera/mic
4. If `REACT_APP_USE_DAILY_VIDEO=false`:
   - Redirects to Jitsi popup (old behavior)

### Test Collaborative Editor:

1. Go to any study room
2. Click the **Programming** tab
3. If `REACT_APP_USE_CODEMIRROR=true`:
   - See "Collaborative Programming (CodeMirror)" header
   - Multi-user cursors with colors
   - Real-time sync via Y.js
4. If `REACT_APP_USE_CODEMIRROR=false`:
   - Old Monaco editor (socket.io sync)

### Test with 2 Users:

1. Open study room in 2 browser windows (different users or incognito)
2. Both join the Programming tab
3. Type in one window - see updates in the other **instantly**
4. See colored cursors with usernames

---

## 🔄 Current State:

**Right Now** (without changing .env):
- ✅ Backend ready (video routes loaded)
- ✅ Components created & integrated
- ⚠️ Features **DISABLED** (safe default)
- ✅ Old Jitsi & Monaco still work

**After Enabling** (setting env vars):
- ✅ Daily.co embedded video replaces Jitsi popup
- ✅ CodeMirror replaces Monaco
- ✅ Real-time CRDT collaboration
- ✅ Instant rollback by changing env vars

---

## 🐛 Troubleshooting

### "CollaborativeEditor not found"
- Run: `npm install` in `client/` directory
- Make sure all dependencies installed

### "Cannot connect to Y-WebSocket server"
- Start Y-server: `cd y-server && npm start`
- Check it's running: `curl http://localhost:1234/health`

### "Video room creation failed"
- Daily.co API key not set (works in mock mode)
- Or backend not running

### Video Permission Denied
- Browser blocked camera/mic
- Click site settings and allow permissions
- Requires HTTPS in production

---

## 📋 Next Steps:

**Immediate** (to test right now):
```bash
# 1. Install frontend dependencies
cd client && npm install codemirror @codemirror/lang-javascript @codemirror/lang-python @codemirror/lang-java @codemirror/lang-cpp @codemirror/theme-one-dark yjs y-codemirror.next y-websocket @daily-co/daily-js

# 2. Start Y-server
cd ../y-server && npm install && npm start

# 3. In another terminal, enable features
cd ../client
echo "REACT_APP_USE_DAILY_VIDEO=true" >> .env
echo "REACT_APP_USE_CODEMIRROR=true" >> .env
echo "REACT_APP_YJS_SERVER_URL=ws://localhost:1234" >> .env

# 4. Restart frontend
npm start
```

**Production**:
- Deploy Y-WebSocket server to cloud
- Get Daily.co API key
- Update env vars with production URLs

---

## 🎉 Summary

You now have:
- ✅ Embedded Daily.co video (no more popups!)
- ✅ Real-time collaborative coding (CodeMirror + Y.js)
- ✅ Feature flags for safe rollout
- ✅ Zero breaking changes (old features still work)

**Test it out!** Enable the features and see the difference 🚀

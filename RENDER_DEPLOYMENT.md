# Render Deployment Guide

## ✅ Pre-Deployment Checklist

### Code Changes (Ready to Deploy)
- ✅ Code execution works with VM2 (JavaScript only)
- ✅ File sharing syncs in real-time  
- ✅ Resource delete functionality added
- ✅ All uploads removed from `/server/uploads`
- ✅ Using Groq API for AI features

### Important Notes
- **Docker disabled** - Only JavaScript code execution works (via VM2)
- **No file uploads** - Use Cloudinary for persistent storage
- **MongoDB** - Use MongoDB Atlas connection string

---

## Environment Variables for Render

### Required Variables

```bash
# Server Port
PORT=5000

# MongoDB (USE MONGODB ATLAS)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study_sphere

# JWT Secret (Generate new one for production)
JWT_SECRET=your_production_jwt_secret_here

# Client URL (Your Render frontend URL)
CLIENT_URL=https://your-app.onrender.com

# Groq API
GROQ_API_KEY=your_groq_api_key

# Cloudinary (For file uploads in production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Node Environment
NODE_ENV=production
```

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "fix: code execution, file sync, and resource management"
git push origin main
```

### 2. Render Backend Setup
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New+ → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `study-sphere-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Add Environment Variables** (see above)

### 3. Render Frontend Setup
1. Click **New+ → Static Site**
2. Connect same repository
3. Configure:
   - **Name**: `study-sphere-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Environment Variables**:
     ```bash
     REACT_APP_API_URL=https://study-sphere-backend.onrender.com/api
     REACT_APP_SOCKET_URL=https://study-sphere-backend.onrender.com
     ```

---

## Known Limitations on Render

### ❌ Docker Not Available
**Issue**: Render free tier doesn't support Docker  
**Solution**: Code execution only works for JavaScript via VM2

**User Impact**:
- ✅ JavaScript code works
- ❌ Python, Java, C++ won't execute
- 💡 Show message: "Only JavaScript supported in production"

###  ❌ Ephemeral File System
**Issue**: Uploaded files get deleted on restart  
**Solution**: Use Cloudinary for file storage

**Implementation**: Already configured in `server/config/cloudinary.js`

---

## Post-Deployment Verification

### Test These Features:
1. ✅ User login/registration
2. ✅ Study room creation
3. ✅ Real-time chat
4. ✅ Whiteboard collaboration
5. ✅ JavaScript code execution
6. ✅ File sharing in rooms
7. ✅ Resource upload/delete
8. ✅ AI chatbot (Groq)

### Check Logs:
```bash
# In Render dashboard
Logs → View recent logs
```

Look for:
- `✅ MongoDB connected successfully`
- `✅ Groq AI initialized`
- `🚀 Server running on port 5000`

---

## Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB Atlas whitelist (allow all IPs: `0.0.0.0/0`)
- Check connection string format
- Ensure database user has read/write permissions

### CORS Errors  
- Add Render frontend URL to `CLIENT_URL` env variable
- Backend automatically allows this origin

### Socket.IO Not Connecting
- Frontend `REACT_APP_SOCKET_URL` must match backend URL
- Use `https://` not `http://` in production

---

## Optional: Custom Domain

1. Render → Settings → Custom Domain
2. Add your domain
3. Update DNS records as shown
4. Update `CLIENT_URL` environment variable

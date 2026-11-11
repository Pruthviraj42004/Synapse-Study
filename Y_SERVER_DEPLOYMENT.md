# Deploy Y.js Server to Render

Complete guide for deploying the collaborative coding Y.js server.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Main API Server │────▶│    MongoDB      │
│  (Static Site)  │     │   (Web Service)  │     │   (Database)    │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │ WebSocket (wss://)
         ▼
┌─────────────────┐
│  Y.js Server    │  ◀── NEW SERVICE
│  (Web Service)  │
└─────────────────┘
```

## Step 1: Create Y.js Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Select your GitHub repository: `majorprojectfinal`
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `studysphere-yjs` |
| **Root Directory** | `y-server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter for production) |

## Step 2: Set Environment Variables

In the Y.js service settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | Leave empty | Render auto-assigns |
| `REQUIRE_AUTH` | `false` | Set `true` for JWT auth |
| `JWT_SECRET` | (same as main server) | Only if auth enabled |
| `ENABLE_PERSISTENCE` | `false` | Optional Redis |
| `NODE_ENV` | `production` | Production mode |

## Step 3: Update Client Environment

After Y.js service deploys, copy its URL (e.g., `https://studysphere-yjs.onrender.com`)

Update your **client** service environment variables on Render:

```env
REACT_APP_YJS_SERVER_URL=wss://studysphere-yjs.onrender.com
```

> **Important:** Use `wss://` (secure WebSocket) NOT `ws://`

## Step 4: Redeploy Client

After updating the environment variable, trigger a redeploy of your client service.

## Verification

1. Open your deployed app
2. Create/join a study room
3. Go to the **CODE** tab
4. Check that status shows **"Synced"** (not "Unknown")
5. Open in two browsers and verify code syncs

## Troubleshooting

### Status shows "Unknown" or "Connecting..."
- Verify `REACT_APP_YJS_SERVER_URL` uses `wss://` not `ws://`
- Check Y.js service logs on Render for errors
- Ensure Y.js service is running (not sleeping)

### WebSocket connection refused
- Render free tier services sleep after 15min of inactivity
- First connection may take 30-60 seconds to wake up
- Consider upgrading to Starter plan for always-on

### CORS errors
- Y.js uses pure WebSocket, not HTTP - CORS shouldn't apply
- Check browser console for actual error message

## Optional: Enable Redis Persistence

To persist code across server restarts:

1. Create a Redis instance on Render (or use Redis Cloud)
2. Add to Y.js service environment:
   ```
   ENABLE_PERSISTENCE=true
   REDIS_URL=redis://username:password@host:port
   ```

## Health Check Endpoints

The Y.js server provides these endpoints:

- **Health:** `https://studysphere-yjs.onrender.com/health`
- **Metrics:** `https://studysphere-yjs.onrender.com/metrics`

Use the health endpoint to verify the service is running.

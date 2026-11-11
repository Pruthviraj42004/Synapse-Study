# Fix Frontend Build Errors

## Issue
- `next is not a function` error in console
- 404 errors from `/api/auth/login1` (old routes)
- Errors persist after hard refresh

## Root Cause
**Build cache corruption** - Old JavaScript bundles cached in browser and/or webpack build cache

---

## Solution

### Step 1: Clear Frontend Build Cache
```bash
cd client
rm -rf node_modules/.cache .cache build
npm start
```

### Step 2: Clear Browser Cache
- **Chrome/Edge**: Cmd+Shift+Delete → Clear cached images and files
- **Or**: Open DevTools → Network tab → Check "Disable cache"

### Step 3: Restart Dev Servers

**Kill all processes:**
```bash
# Press Ctrl+C in both terminal windows
```

**Restart backend:**
```bash
cd server
npm run dev
```

**Restart frontend:**
```bash
cd client
npm start
```

---

## Alternative: Complete Clean Build

If errors persist:

```bash
# Backend
cd server
rm -rf node_modules
npm install
npm run dev

# Frontend (in new terminal)
cd client
rm -rf node_modules build .cache
npm install
npm start
```

---

## Why This Happens

1. **Webpack Dev Server** caches compiled modules
2. **Browser** caches old JavaScript bundles
3. **Code changes** don't reflect until cache cleared

**Prevention**: Keep DevTools open with "Disable cache" checked during development

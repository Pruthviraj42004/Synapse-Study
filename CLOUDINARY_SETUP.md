# Cloudinary Setup Guide for Study Sphere

## What is Cloudinary?
Cloudinary is a cloud-based file storage service that solves Render's ephemeral filesystem problem. Files uploaded to Cloudinary persist permanently, even after server restarts.

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a **FREE account** (no credit card required)
3. Verify your email

## Step 2: Get Your Credentials

1. After login, you'll see your **Dashboard**
2. Find the **Account Details** section
3. You'll see:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to see it)

## Step 3: Add to Local Environment

1. Open `/server/.env` file
2. Add these lines (replace with your actual values):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Step 4: Add to Render (Production)

1. Go to https://dashboard.render.com
2. Select your **server service** (majorproject-server)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add these THREE variables:

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | (your cloud name) |
| `CLOUDINARY_API_KEY` | (your API key) |
| `CLOUDINARY_API_SECRET` | (your API secret) |

6. Click **Save Changes**
7. Render will automatically redeploy

## Features

### ✅ What Works Now:
- **Persistent Storage:** Files survive server restarts
- **Global CDN:** Fast file delivery worldwide
- **Automatic Optimization:** Images auto-optimized
- **25GB Free:** Generous free tier
- **All File Types:** PDF, DOCX, TXT, PPT, images

### ✅ What's Fixed:
- ❌ 404 errors on file downloads → ✅ Works
- ❌ AI can't read documents → ✅ Works
- ❌ Files deleted on restart → ✅ Persists

## Testing

### Local Test:
1. Start server: `npm start`
2. Upload a PDF to Study Resources
3. Click "Ask AI" → Should work!
4. Download file → Should work!

### Production Test:
1. After Render deployment completes
2. Upload a PDF
3. Restart service (Settings → Manual Deploy → Clear build cache & deploy)
4. File should still be accessible!

## Free Tier Limits

- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25,000/month
- **More than enough for your project!**

## Troubleshooting

### "Invalid API credentials"
- Check that you copied credentials correctly
- No extra spaces in `.env` file
- Restart server after adding credentials

### "Upload failed"
- Check file size (max 50MB)
- Check file type (PDF, DOCX, TXT, PPT allowed)
- Check internet connection

### Files still 404
- Make sure you pushed code to GitHub
- Make sure Render redeployed
- Check Render logs for errors

## Support

Cloudinary Docs: https://cloudinary.com/documentation
Cloudinary Support: https://support.cloudinary.com

---

**You're all set!** Files will now persist on Cloudinary cloud storage! 🎉

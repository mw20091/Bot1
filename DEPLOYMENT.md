# WhatsApp Bot Dashboard - Deployment Guide

## Quick Deploy to Railway (5 minutes)

### Prerequisites
- GitHub account (repo is already there)
- Railway account (sign up at railway.app)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click **Sign up** (use GitHub login for quick setup)
3. Authorize Railway to access your GitHub repos

### Step 2: Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Find and click on `Bot1` repository
4. Confirm deployment

### Step 3: Add PostgreSQL
1. In your Railway project, click **+ Add**
2. Search for **PostgreSQL**
3. Click to add it
4. Railway automatically creates `DATABASE_URL` env var

### Step 4: Add Redis
1. Click **+ Add** again
2. Search for **Redis**
3. Click to add it
4. Railway automatically creates `REDIS_URL` env var

### Step 5: Configure Backend Service
1. Click on the **Node.js** service (should auto-detect from `/backend`)
2. Go to **Settings** tab
3. Set environment variables:
   ```
   JWT_SECRET=your-secure-random-string-here
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
4. Set **Start Command**: `npm start`
5. Click **Deploy**
6. Get your backend URL from the **Deployments** tab (looks like `https://bot1-backend-prod.railway.app`)

### Step 6: Deploy Frontend on Vercel
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import GitHub repo `Bot1`
4. Set **Root Directory**: `./frontend`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
   ```
6. Click **Deploy**
7. Get your frontend URL (looks like `https://bot1-frontend.vercel.app`)

### Step 7: Update Backend CORS
1. Go back to Railway
2. Click on Node.js service → **Variables**
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. Redeploy backend

### You're Live!
- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-railway-backend.railway.app
- **Database**: PostgreSQL on Railway (hidden)
- **Cache**: Redis on Railway (hidden)

---

## Alternative: Deploy Entirely on Railway

If you prefer everything on one platform:

1. Create Railway project
2. Add the GitHub repo
3. Add PostgreSQL service
4. Add Redis service
5. Create separate services for:
   - Backend (from `/backend` directory)
   - Frontend (from `/frontend` directory, build command: `npm run build`, start: `npm start`)
6. Link env vars
7. Deploy both services

**Result**: Everything runs on Railway (easier to manage, but uses Railway credits faster)

---

## Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited free deployments
- ✅ 1 TB bandwidth/month
- ✅ 50 serverless function invocations/day
- ✅ Custom domain included

### Railway (Backend + Database)
- ✅ $5/month free credit
- ✅ That's enough for this app (~$2-3/month actual usage)
- After free credit expires, you pay-as-you-go (~$0.50/GB RAM/month)

### Redis on Railway
- Included in free tier

### PostgreSQL on Railway
- Included in free tier (5 GB storage included)

---

## After Deployment

### Test the App
1. Go to your frontend URL
2. Create an account
3. Log in
4. Create a new WhatsApp session
5. Scan the QR code with WhatsApp
6. Start testing!

### Monitor Logs

**Railway Logs**:
1. Click on service
2. Go to **Logs** tab
3. Watch real-time logs

**Vercel Logs**:
1. Go to https://vercel.com
2. Click project
3. Go to **Deployments** → **Runtime Logs**

### Common Issues

**"Cannot connect to database"**
- Check that PostgreSQL service is running in Railway
- Check `DATABASE_URL` is set in env vars
- Restart service

**"Frontend can't reach backend"**
- Check `NEXT_PUBLIC_API_URL` matches your Railway backend URL
- Check backend CORS includes frontend URL
- Check backend is running (check Railway logs)

**"WhatsApp QR won't appear"**
- Check Redis is running
- Refresh frontend page
- Check browser console for errors
- Restart backend service

---

## Custom Domain (Optional)

### For Frontend (Vercel)
1. Vercel → Project Settings → Domains
2. Add your domain (e.g., `myapp.com`)
3. Follow DNS instructions

### For Backend (Railway)
1. Railway → Service Settings → Domains
2. Add domain
3. Railway generates SSL certificate automatically

---

## Scaling Later

When you need to scale:
- Upgrade Railway plan
- Add more PostgreSQL replicas
- Enable Redis clustering
- Add CDN for frontend (Vercel auto-includes Cloudflare)

For now, the free tier handles multiple users just fine!

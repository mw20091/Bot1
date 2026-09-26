# WhatsApp Bot Dashboard

A multi-user platform for managing and testing linked WhatsApp bot sessions.

## Features

- User registration and login with JWT authentication
- Create and manage multiple WhatsApp sessions per user
- Real-time chat syncing from linked WhatsApp accounts
- Send messages from the dashboard
- QR code-based WhatsApp session linking
- Per-session bot automation settings
- Session persistence with PostgreSQL

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/mw20091/Bot1.git
cd Bot1

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Set Up PostgreSQL

```bash
# Create database
creatdb whatsapp_bot

# (The app will auto-create tables on first run)
```

### 3. Set Up Redis

```bash
# Start Redis (if not already running)
redis-server
```

### 4. Create `.env` Files

**backend/.env**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/whatsapp_bot
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Run Local

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Access the app at `http://localhost:3000`

---

## Free Deployment Options

### **Option 1: Railway.app (Recommended - Easiest)**

#### Deploy Backend

1. Go to [Railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Connect your GitHub account and select this repo
4. Railway will auto-detect the backend at `/backend`
5. Add PostgreSQL plugin:
   - Click **Add Service** → **PostgreSQL**
   - Railway auto-links the `DATABASE_URL` env var
6. Add Redis plugin:
   - Click **Add Service** → **Redis**
   - Railway auto-links the `REDIS_URL` env var
7. Add env vars:
   - `JWT_SECRET`: Generate a random string
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Railway assigns automatically)
8. Deploy → Get your backend URL (e.g., `https://bot1-backend-prod.railway.app`)

#### Deploy Frontend

1. In the same Railway project, click **New Service** → **GitHub**
2. Select the same repo, but specify the frontend directory
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add env var:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL from above
6. Deploy → Get your frontend URL

**Cost**: Railway offers $5/month free credits (enough for this app)

---

### **Option 2: Vercel (Frontend) + Railway (Backend)**

#### Deploy Backend on Railway

(Follow Option 1 steps above)

#### Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import the GitHub repo
4. Set **Root Directory**: `frontend`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
6. Deploy

**Cost**: Free tier (Vercel + Railway)

---

### **Option 3: Render.com (Full Stack)**

#### Deploy Backend

1. Go to [Render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect GitHub repo
4. Set **Root Directory**: `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add PostgreSQL service (Render offers free tier)
8. Link `DATABASE_URL` env var
9. Add Redis service
10. Link `REDIS_URL` env var
11. Deploy

#### Deploy Frontend

1. Click **New** → **Static Site**
2. Connect same GitHub repo
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm run build`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Backend URL from above
6. Deploy

**Cost**: Render free tier includes PostgreSQL (limited)

---

### **Option 4: Heroku (Legacy - Paid Now, Not Recommended)**

Heroku removed free tier in Nov 2022. Use Railway or Render instead.

---

## Production Checklist

- [ ] Set strong `JWT_SECRET` (generate: `openssl rand -hex 32`)
- [ ] Enable HTTPS in production (auto with Vercel/Railway/Render)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS origin to match frontend domain
- [ ] Use strong database password
- [ ] Monitor logs for errors
- [ ] Set up email for password recovery (optional future feature)

---

## Troubleshooting

### Backend won't connect to database

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Frontend can't reach backend

- Check `NEXT_PUBLIC_API_URL` matches deployed backend URL
- Check CORS origin in backend `.env` `FRONTEND_URL`
- Check backend logs

### WhatsApp session won't scan QR

- Ensure Redis is running
- Check browser console for errors
- Restart backend and refresh frontend

### Free tier limitations

- **Railway**: $5/month free, then pay-as-you-go (~$10/month for small app)
- **Vercel**: Unlimited free frontend deployments
- **Render**: Free tier has limited PostgreSQL (1 GB)

---

## Architecture

```
Frontend (Next.js) → Backend (Express.js) → PostgreSQL (database)
                                         ↓
                                      Redis (cache)
                                         ↓
                                 Baileys (WhatsApp)
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Sessions
- `POST /api/session/create` - Create new WhatsApp session
- `GET /api/session/list` - List user's sessions
- `GET /api/session/:id/status` - Get QR code and connection status

### Chat
- `GET /api/session/:id/chats` - Get all chats for session
- `GET /api/session/:id/:jid/messages` - Get messages from chat
- `POST /api/chat/send` - Send message

---

## Next Steps

1. Deploy on Railway (easiest)
2. Test with real WhatsApp account
3. Add bot automation features
4. Scale to multiple users

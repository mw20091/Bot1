# Render Deployment Configuration

## Backend Service

**Build Command:**
```bash
bash build.sh
```

**Start Command:**
```bash
bash start.sh
```

**Environment Variables:**
```
NODE_ENV=production
JWT_SECRET=your-secure-secret-key-here
PORT=3000
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**PostgreSQL:**
Render auto-creates `DATABASE_URL` env var when you add PostgreSQL service.

**Redis:**
Render auto-creates `REDIS_URL` env var when you add Redis service.

## Frontend Service

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Start Command:**
```bash
cd frontend && npm start
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

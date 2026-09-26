# Deployment Guide

## Local development

1. Start PostgreSQL and Redis.
2. Fill backend `.env` file.
3. Install backend dependencies: `cd backend && npm install`
4. Install frontend dependencies: `cd frontend && npm install`
5. Start backend: `cd backend && npm run dev`
6. Start frontend: `cd frontend && npm run dev`

## Production deploy

### Frontend
- Deploy `frontend` to Vercel.
- Add `NEXT_PUBLIC_API_URL` environment variable.

### Backend
- Deploy `backend` to Railway or Render.
- Use PostgreSQL and Redis managed services.

### Database
- Use Supabase or Neon Postgres.
- Run schema migration if needed.

### Reverse proxy optional
- Use Nginx + Cloudflare for public hosting.

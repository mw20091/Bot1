# WhatsApp Bot Testing Platform

A personal WhatsApp bot testing dashboard for linked sessions.

Features:
- QR session login
- Chat import and overview
- Message sending from browser
- Auto-read and auto-reaction settings
- Typing and response controls
- PostgreSQL + Redis support
- Docker-ready setup

## Stack
- Backend: Node.js + Express + Baileys
- Frontend: Next.js + React
- Database: PostgreSQL
- Cache: Redis

## Getting started

1. Copy backend `.env.example` and fill in values.
2. Start PostgreSQL and Redis.
3. Run backend:
   npm install
   npm run dev
4. Run frontend:
   cd frontend && npm install && npm run dev

## Deployment
- Frontend: Vercel
- Backend: Railway or Render
- Database: Supabase / Neon
- Redis: Upstash / Redis Cloud

## Notes
This app is intended for a session you personally control and for testing/development use.

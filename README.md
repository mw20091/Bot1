# WhatsApp Bot - Personal Testing & Educational

A personal WhatsApp bot for educational testing with:
- QR code login to connect your WhatsApp
- Import chat history after linking
- Send messages from web dashboard to WhatsApp
- Auto-reactions to messages
- Auto-read messages
- Auto-like status updates
- Typing indicators
- Message logging and management

## Features

✅ QR Code Authentication (Baileys)
✅ Chat Import & History
✅ Web Dashboard
✅ Send Messages from Dashboard
✅ Auto-Reactions
✅ Auto-Read Receipts
✅ Status Auto-Like
✅ Typing Indicators
✅ Message Database
✅ Offline Support

## Tech Stack

- **Frontend**: Next.js + React + TailwindCSS
- **Backend**: Node.js + Express
- **Bot Engine**: Baileys (WhatsApp Web)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Queue**: Bull (Job Queue)
- **Deployment**: Docker + Railway/Render + Vercel

## Project Structure

```
bot1/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Baileys integration
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, logging
│   │   ├── queue/          # Bull job queue
│   │   └── index.js        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
├── frontend/                # Next.js Dashboard
│   ├── app/
│   │   ├── page.tsx        # Home
│   │   ├── dashboard/      # Main dashboard
│   │   ├── login/          # QR login
│   │   ├── chats/          # Chat view
│   │   └── settings/       # Bot settings
│   ├── components/
│   ├── styles/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Local dev setup
└── docs/
    ├── SETUP.md            # Installation guide
    ├── DEPLOYMENT.md       # Deploy to production
    └── API.md              # API documentation
```

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional)

### Installation

```bash
# Clone and setup
git clone <repo>
cd bot1

# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Deployment

- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Supabase PostgreSQL
- **Redis**: Upstash or Redis Cloud

See `docs/DEPLOYMENT.md` for step-by-step guide.

## Usage

1. Open `http://localhost:3000`
2. Scan QR code to connect WhatsApp
3. Wait for chat import
4. Send messages from dashboard
5. Enable auto-features in settings

## Environment Variables

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BOT_WEBHOOK_SECRET=your-secret
PORT=5000
NODE_ENV=development
```

## License

Personal/Educational Use Only

---

**Next**: Create backend files with `npm run generate:backend`

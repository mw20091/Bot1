# API Overview

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

## Session
- `POST /api/session/create`
- `GET /api/session/:sessionId/qr`
- `GET /api/session/:sessionId/status`
- `POST /api/session/:sessionId/disconnect`

## Messages
- `POST /api/message/send`
- `POST /api/message/read`
- `POST /api/message/react`
- `POST /api/message/typing`

## Chats
- `GET /api/chat/:sessionId`
- `GET /api/chat/:sessionId/:jid/messages`

## Settings
- `GET /api/settings/:sessionId`
- `POST /api/settings/:sessionId`

## Bot
- `GET /api/bot/status/:sessionId`
- `POST /api/bot/test/:sessionId`

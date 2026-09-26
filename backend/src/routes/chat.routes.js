import express from 'express';
import { verifyToken } from './auth.routes.js';
import { chats, messages } from '../services/whatsapp.service.js';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/:sessionId', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.sessionId;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    res.json({ chats: chats(sessionId) });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId/:jid/messages', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.sessionId;
    const jid = decodeURIComponent(req.params.jid);
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    res.json({ messages: messages(sessionId, jid) });
  } catch (error) {
    next(error);
  }
});

export default router;

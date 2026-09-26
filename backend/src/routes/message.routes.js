import express from 'express';
import { verifyToken } from './auth.routes.js';
import { sendText, readMessages, react, typing } from '../services/whatsapp.service.js';
import { query } from '../config/database.js';

const router = express.Router();

router.post('/send', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { sessionId, jid, text } = req.body;
    if (!sessionId || !jid || !text) return res.status(400).json({ error: 'sessionId, jid, text required' });

    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    await sendText(sessionId, jid, text);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/read', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { sessionId, jid, messageIds } = req.body;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    await readMessages(sessionId, jid, messageIds || []);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/react', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { sessionId, jid, messageId, emoji } = req.body;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    await react(sessionId, jid, messageId, emoji || '👍');
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/typing', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { sessionId, jid, enabled } = req.body;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    await typing(sessionId, jid, enabled !== false);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { query } from '../config/database.js';
import { sendTextMessage, markMessageAsRead, addReaction, setTypingIndicator } from '../services/whatsapp.service.js';

const router = express.Router();

router.post('/send', async (req, res, next) => {
  try {
    const { sessionId, jid, text } = req.body;
    await sendTextMessage(sessionId, jid, text);
    await query('INSERT INTO message_queue (session_id, receiver_jid, message_text, status, created_at) VALUES ($1, $2, $3, $4, NOW())', [sessionId, jid, text, 'sent']);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/read', async (req, res, next) => {
  try {
    const { sessionId, jid, ids } = req.body;
    const result = await markMessageAsRead(sessionId, jid, ids || []);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/react', async (req, res, next) => {
  try {
    const { sessionId, jid, messageId, emoji } = req.body;
    const result = await addReaction(sessionId, jid, messageId, emoji || '👍');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/typing', async (req, res, next) => {
  try {
    const { sessionId, jid, enabled } = req.body;
    const result = await setTypingIndicator(sessionId, jid, enabled ?? true);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

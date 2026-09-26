import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/status/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const rows = await query('SELECT * FROM bot_settings WHERE session_id = $1', [sessionId]);
    res.json({ bot: rows.rows[0] || null });
  } catch (error) {
    next(error);
  }
});

router.post('/test/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { action, jid, messageId, emoji } = req.body;

    await query('INSERT INTO activity_logs (session_id, action, action_type, details, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW())', [
      sessionId,
      action || 'test_action',
      'bot',
      JSON.stringify({ jid, messageId, emoji }),
      'queued'
    ]);

    res.json({ ok: true, action });
  } catch (error) {
    next(error);
  }
});

export default router;

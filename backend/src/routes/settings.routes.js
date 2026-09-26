import express from 'express';
import { query } from '../config/database.js';
import { verifyToken } from './auth.routes.js';

const router = express.Router();

router.get('/:sessionId', verifyToken, async (req, res, next) => {
  try {
    const session = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.userId]);
    if (!session.rows[0]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const settings = await query('SELECT * FROM bot_settings WHERE session_id = $1', [req.params.sessionId]);
    res.json({ settings: settings.rows[0] || null });
  } catch (error) {
    next(error);
  }
});

router.put('/:sessionId', verifyToken, async (req, res, next) => {
  try {
    const session = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.userId]);
    if (!session.rows[0]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const payload = req.body;
    const result = await query(
      `INSERT INTO bot_settings (session_id, auto_read, auto_reactions, auto_typing, reaction_emojis, typing_delay_ms)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id)
       DO UPDATE SET
         auto_read = EXCLUDED.auto_read,
         auto_reactions = EXCLUDED.auto_reactions,
         auto_typing = EXCLUDED.auto_typing,
         reaction_emojis = EXCLUDED.reaction_emojis,
         typing_delay_ms = EXCLUDED.typing_delay_ms
       RETURNING *`,
      [
        req.params.sessionId,
        payload.auto_read ?? true,
        payload.auto_reactions ?? false,
        payload.auto_typing ?? true,
        payload.reaction_emojis || '👍,😂,❤️,😮',
        payload.typing_delay_ms || 1000
      ]
    );

    res.json({ settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;

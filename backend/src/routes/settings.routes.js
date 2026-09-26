import express from 'express';
import { verifyToken } from './auth.routes.js';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/:sessionId', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.sessionId;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    const result = await query('SELECT * FROM bot_settings WHERE session_id = $1', [sessionId]);
    res.json({ settings: result.rows[0] || null });
  } catch (error) {
    next(error);
  }
});

router.put('/:sessionId', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.sessionId;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    const s = req.body;
    const result = await query(
      `INSERT INTO bot_settings (session_id, auto_read, auto_reactions, auto_typing, reaction_emojis, typing_delay_ms)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE SET
         auto_read = EXCLUDED.auto_read,
         auto_reactions = EXCLUDED.auto_reactions,
         auto_typing = EXCLUDED.auto_typing,
         reaction_emojis = EXCLUDED.reaction_emojis,
         typing_delay_ms = EXCLUDED.typing_delay_ms
       RETURNING *`,
      [sessionId, s.auto_read ?? true, s.auto_reactions ?? false, s.auto_typing ?? true, s.reaction_emojis || '👍,😂,❤️,😮', s.typing_delay_ms || 1000]
    );
    res.json({ settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;

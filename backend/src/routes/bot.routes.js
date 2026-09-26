import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await query('SELECT * FROM bot_settings WHERE session_id = $1', [sessionId]);
    res.json({ settings: result.rows[0] || null });
  } catch (error) {
    next(error);
  }
});

router.post('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const settings = req.body;

    const result = await query(
      `INSERT INTO bot_settings (session_id, auto_read, auto_reactions, auto_status_like, auto_typing, reaction_emojis, typing_delay_ms, auto_reply_enabled, auto_reply_template, excluded_chats)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (session_id) DO UPDATE SET
         auto_read = EXCLUDED.auto_read,
         auto_reactions = EXCLUDED.auto_reactions,
         auto_status_like = EXCLUDED.auto_status_like,
         auto_typing = EXCLUDED.auto_typing,
         reaction_emojis = EXCLUDED.reaction_emojis,
         typing_delay_ms = EXCLUDED.typing_delay_ms,
         auto_reply_enabled = EXCLUDED.auto_reply_enabled,
         auto_reply_template = EXCLUDED.auto_reply_template,
         excluded_chats = EXCLUDED.excluded_chats,
         updated_at = NOW() RETURNING *`,
      [
        sessionId,
        settings.auto_read ?? true,
        settings.auto_reactions ?? true,
        settings.auto_status_like ?? true,
        settings.auto_typing ?? true,
        settings.reaction_emojis || '👍😂❤️😮😢',
        settings.typing_delay_ms ?? 1000,
        settings.auto_reply_enabled ?? false,
        settings.auto_reply_template || '',
        JSON.stringify(settings.excluded_chats || []),
      ]
    );

    res.json({ settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;

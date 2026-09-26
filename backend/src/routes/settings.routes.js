import express from 'express';
import { query } from '../config/database.js';
const router = express.Router();
router.get('/:id', async (req, res, next) => { try { const result = await query('SELECT * FROM bot_settings WHERE session_id=$1', [req.params.id]); res.json({ settings: result.rows[0] || null }); } catch (e) { next(e); } });
router.put('/:id', async (req, res, next) => { try { const s = req.body; const result = await query(`INSERT INTO bot_settings (session_id, auto_read, auto_reactions, auto_typing, reaction_emojis, typing_delay_ms) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (session_id) DO UPDATE SET auto_read=EXCLUDED.auto_read, auto_reactions=EXCLUDED.auto_reactions, auto_typing=EXCLUDED.auto_typing, reaction_emojis=EXCLUDED.reaction_emojis, typing_delay_ms=EXCLUDED.typing_delay_ms RETURNING *`, [req.params.id, s.auto_read ?? true, s.auto_reactions ?? false, s.auto_typing ?? true, s.reaction_emojis || '👍,😂,❤️', s.typing_delay_ms || 1000]); res.json({ settings: result.rows[0] }); } catch (e) { next(e); } });
export default router;

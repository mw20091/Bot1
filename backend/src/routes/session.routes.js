import express from 'express';
import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
import { verifyToken } from './auth.routes.js';
import { connectSession, status, disconnect } from '../services/whatsapp.service.js';

const router = express.Router();

router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const id = randomUUID();
    await query(
      'INSERT INTO sessions (id, user_id, session_name, status) VALUES ($1, $2, $3, $4)',
      [id, userId, name, 'connecting']
    );

    await connectSession(id);
    res.status(201).json({ session: { id, name, status: 'connecting' } });
  } catch (error) {
    next(error);
  }
});

router.get('/list', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await query(
      'SELECT id, session_name as name, status, whatsapp_jid, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ sessions: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/status', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.id;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    const s = status(sessionId);
    res.json(s);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/disconnect', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionId = req.params.id;
    const sessionRes = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    if (!sessionRes.rows[0]) return res.status(404).json({ error: 'Session not found' });

    await disconnect(sessionId);
    await query('UPDATE sessions SET status = $1 WHERE id = $2', ['disconnected', sessionId]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;

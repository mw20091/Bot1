import express from 'express';
import { query } from '../config/database.js';
import { verifyToken } from './auth.routes.js';
import { connectSession, status, disconnectSession } from '../services/whatsapp.service.js';

const router = express.Router();

router.post('/create', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    const result = await query(
      'INSERT INTO sessions (user_id, session_name, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, 'connecting']
    );

    const session = result.rows[0];
    await connectSession(session.id);

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

router.get('/list', verifyToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, session_name AS name, status, whatsapp_jid, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ sessions: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/status', verifyToken, async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const result = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, req.userId]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(status(sessionId));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/disconnect', verifyToken, async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const result = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, req.userId]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await disconnectSession(sessionId);
    await query('UPDATE sessions SET status = $1 WHERE id = $2', ['disconnected', sessionId]);

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;

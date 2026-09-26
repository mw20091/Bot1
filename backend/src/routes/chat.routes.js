import express from 'express';
import { query } from '../config/database.js';
import { connectSession, getConnectionStatus, disconnectSession, getQRForSession } from '../services/whatsapp.service.js';

const router = express.Router();

router.post('/create', async (req, res, next) => {
  try {
    const { userId, sessionName } = req.body;
    const result = await query(
      'INSERT INTO sessions (user_id, session_name, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, sessionName || 'Test Session', 'pending']
    );

    const session = result.rows[0];
    await connectSession(session.id);

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId/status', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const status = await getConnectionStatus(sessionId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId/qr', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const qr = await getQRForSession(sessionId);
    res.json(qr);
  } catch (error) {
    next(error);
  }
});

router.post('/:sessionId/disconnect', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await disconnectSession(sessionId);
    await query('UPDATE sessions SET status = $1, is_active = false WHERE id = $2', ['disconnected', sessionId]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;

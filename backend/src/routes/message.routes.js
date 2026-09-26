import express from 'express';
import { query } from '../config/database.js';
import { verifyToken } from './auth.routes.js';

const router = express.Router();

router.get('/:sessionId', verifyToken, async (req, res, next) => {
  try {
    const messages = await query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY timestamp DESC LIMIT 100',
      [req.params.sessionId]
    );

    res.json({ messages: messages.rows });
  } catch (error) {
    next(error);
  }
});

export default router;

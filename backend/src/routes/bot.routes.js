import express from 'express';
import { query } from '../config/database.js';
import { verifyToken } from './auth.routes.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const sessions = await query('SELECT id, session_name AS name, status FROM sessions WHERE user_id = $1', [req.userId]);
    const settings = await query('SELECT * FROM bot_settings');

    res.json({
      totalSessions: sessions.rows.length,
      activeSessions: sessions.rows.filter((s) => s.status === 'connected').length,
      botSettings: settings.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { query } from '../config/database.js';
import { fetchChats } from '../services/whatsapp.service.js';

const router = express.Router();

router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const chats = await fetchChats(sessionId);
    res.json({ chats });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId/:jid/messages', async (req, res, next) => {
  try {
    const { sessionId, jid } = req.params;
    const { fetchChatMessages } = await import('../services/whatsapp.service.js');
    const messages = await fetchChatMessages(sessionId, jid);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

export default router;

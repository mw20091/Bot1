import express from 'express';
import { chats, messages } from '../services/whatsapp.service.js';
const router = express.Router();
router.get('/:id', (req, res) => res.json({ chats: chats(req.params.id) }));
router.get('/:id/:jid/messages', (req, res) => res.json({ messages: messages(req.params.id, decodeURIComponent(req.params.jid)) }));
export default router;

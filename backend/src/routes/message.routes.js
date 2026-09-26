import express from 'express';
import { sendText, readMessages, react, typing } from '../services/whatsapp.service.js';
const router = express.Router();
router.post('/send', async (req, res, next) => { try { const { sessionId, jid, text } = req.body; if (!sessionId || !jid || !text) return res.status(400).json({ error: 'sessionId, jid and text are required' }); await sendText(sessionId, jid, text); res.json({ ok: true }); } catch (e) { next(e); } });
router.post('/read', async (req, res, next) => { try { await readMessages(req.body.sessionId, req.body.jid, req.body.messageIds || []); res.json({ ok: true }); } catch (e) { next(e); } });
router.post('/react', async (req, res, next) => { try { await react(req.body.sessionId, req.body.jid, req.body.messageId, req.body.emoji || '👍'); res.json({ ok: true }); } catch (e) { next(e); } });
router.post('/typing', async (req, res, next) => { try { await typing(req.body.sessionId, req.body.jid, req.body.enabled !== false); res.json({ ok: true }); } catch (e) { next(e); } });
export default router;

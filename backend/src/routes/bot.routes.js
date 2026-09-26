import express from 'express';
const router = express.Router();
router.get('/status/:id', (_req, res) => res.json({ ok: true }));
export default router;

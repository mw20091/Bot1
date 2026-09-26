import express from 'express';
const router = express.Router();
router.get('/status/:id', (_req, res) => res.json({ enabled: false, note: 'Configure test actions per session through /api/settings/:id' }));
export default router;

import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(410).json({
    error: 'Deprecated route. Use /api/public/beats or /api/owner/beats.'
  });
});

export default router;

import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Use /api/health for health checks.'
  });
});

export default router;

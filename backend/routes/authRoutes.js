import { Router } from 'express';
import { z } from 'zod';
import { loginOwner, logoutOwner, getMe } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { requireOwnerAuth } from '../middleware/auth.js';

const router = Router();

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

router.post('/login', validateBody(LoginSchema), loginOwner);
router.post('/logout', requireOwnerAuth, logoutOwner);
router.get('/me', requireOwnerAuth, getMe);

export default router;

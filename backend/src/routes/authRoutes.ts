import { Router } from 'express';
import {
  registerCustomer,
  login,
  getMe,
  registerSchema,
  loginSchema,
} from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), registerCustomer);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), login);
router.get('/me', requireAuth, getMe);

export default router;

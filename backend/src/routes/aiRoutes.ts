import { Router } from 'express';
import {
  getAiRecommendations,
  chatWithAiAssistant,
  aiPlanSchema,
} from '../controllers/aiController';
import { validateRequest } from '../middleware/validate';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/recommendations', aiLimiter, validateRequest({ body: aiPlanSchema }), getAiRecommendations);
router.post('/chat', aiLimiter, chatWithAiAssistant);

export default router;

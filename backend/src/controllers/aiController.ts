import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { planCelebrationWithAi } from '../services/recommendationService';
import { generateAssistantReply } from '../services/geminiService';
import prisma from '../config/db';

export const aiPlanSchema = z.object({
  eventType: z.string().min(2, 'Event type is required'),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1').default(30),
  budget: z.number().positive('Budget must be positive').default(50000),
  city: z.string().default('Delhi NCR'),
  date: z.string().optional(),
  themeOrStyle: z.string().optional(),
  requiredServices: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
});

export const getAiRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = req.body;
    const recommendations = await planCelebrationWithAi(input);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
};

export const chatWithAiAssistant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, error: 'A user message string is required' });
      return;
    }

    // Grounding platform context: count available categories, packages, cities
    const [packageCount, categoryCount] = await Promise.all([
      prisma.eventPackage.count({ where: { isActive: true } }),
      prisma.serviceCategory.count({ where: { isActive: true } }),
    ]);

    const platformContext = `
Platform: Eve Planner (Celebration & Event Marketplace)
Covered Cities: Delhi NCR, Mumbai, Bangalore, Jaipur, Goa
Available Pre-Built Packages: ${packageCount} active curated packages
Categories: ${categoryCount} verified categories including Venues, Banquets, Catering, Photography, Decor, Cakes, Entertainment
Booking Flow: Browse package -> customize add-ons -> submit request -> vendor confirms within 2-4 hours -> review transparent invoice -> secure reservation.
Cancellation Policy: 100% refund up to 72 hours before celebration date.
`;

    const assistantResult = await generateAssistantReply({
      userMessage: message,
      conversationHistory: history,
      platformContext,
    });

    res.json({
      success: true,
      data: assistantResult,
    });
  } catch (err) {
    next(err);
  }
};

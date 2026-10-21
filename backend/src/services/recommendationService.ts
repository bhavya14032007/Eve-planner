import prisma from '../config/db';
import {
  generateCelebrationRecommendations,
  AiRecommendationResult,
  RecommendationContext,
} from './geminiService';

export interface PlanCelebrationInput {
  eventType: string;
  guestCount: number;
  budget: number;
  city: string;
  date?: string;
  themeOrStyle?: string;
  requiredServices?: string[];
  specialRequirements?: string;
}

export const planCelebrationWithAi = async (
  input: PlanCelebrationInput
): Promise<AiRecommendationResult> => {
  // 1. Retrieve active packages and their services from the database
  const packages = await prisma.eventPackage.findMany({
    where: {
      isActive: true,
    },
    include: {
      packageServices: {
        include: {
          listing: {
            include: {
              category: true,
            },
          },
        },
      },
      addons: true,
    },
  });

  if (!packages || packages.length === 0) {
    throw new Error('No active event packages available in the database.');
  }

  // 2. Score and rank packages based on hybrid weighting
  // Weights: EventType match (35%), Budget fit (25%), Guest capacity (20%), Popularity & services (20%)
  const scoredPackages = packages.map((pkg) => {
    let score = 0;

    // A. Event Type Match (35 points)
    const normalizedInputType = input.eventType.toLowerCase().trim();
    const normalizedPkgType = pkg.eventType.toLowerCase().trim();
    if (normalizedPkgType.includes(normalizedInputType) || normalizedInputType.includes(normalizedPkgType)) {
      score += 35;
    } else if (
      (normalizedInputType.includes('party') && normalizedPkgType.includes('birthday')) ||
      (normalizedInputType.includes('reception') && normalizedPkgType.includes('wedding')) ||
      (normalizedInputType.includes('dinner') && normalizedPkgType.includes('anniversary'))
    ) {
      score += 28;
    } else {
      score += 10; // baseline affinity
    }

    // B. Budget Fit (25 points)
    if (input.budget > 0) {
      const priceDiff = Math.abs(pkg.basePrice - input.budget);
      const ratio = priceDiff / input.budget;
      if (pkg.basePrice <= input.budget) {
        // Fits comfortably under budget
        score += Math.max(15, 25 - ratio * 15);
      } else {
        // Over budget: penalty proportional to excess
        score += Math.max(0, 25 - ratio * 35);
      }
    } else {
      score += 20;
    }

    // C. Guest Capacity Fit (20 points)
    if (input.guestCount > 0) {
      const capDiff = pkg.guestCapacity - input.guestCount;
      if (capDiff >= 0 && capDiff <= 25) {
        score += 20; // Perfect capacity fit
      } else if (capDiff > 25) {
        score += 15; // Generous capacity
      } else {
        // Under capacity: slight penalty
        score += Math.max(5, 20 - Math.abs(capDiff) * 0.4);
      }
    } else {
      score += 15;
    }

    // D. Popularity & Service Breadth (20 points)
    if (pkg.isPopular) score += 10;
    score += Math.min(10, pkg.packageServices.length * 2.5);

    // Parse inclusions and exclusions safely
    let inclusions: string[] = [];
    let exclusions: string[] = [];
    try {
      inclusions = JSON.parse(pkg.inclusions);
    } catch {
      inclusions = [pkg.inclusions];
    }
    try {
      exclusions = JSON.parse(pkg.exclusions);
    } catch {
      exclusions = [pkg.exclusions];
    }

    const matchedServices = pkg.packageServices.map((ps) => ({
      category: ps.listing.category.name,
      listingTitle: ps.listing.title,
      startingPrice: ps.listing.startingPrice,
    }));

    return {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      basePrice: pkg.basePrice,
      guestCapacity: pkg.guestCapacity,
      description: pkg.description,
      inclusions,
      exclusions,
      suitabilityScore: Math.min(99, Math.max(50, score)),
      matchedServices,
    };
  });

  // Sort descending by suitability score
  scoredPackages.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // 3. Build context for Gemini AI
  const context: RecommendationContext = {
    eventType: input.eventType,
    guestCount: input.guestCount,
    budget: input.budget,
    city: input.city,
    themeOrStyle: input.themeOrStyle,
    requiredServices: input.requiredServices,
    specialRequirements: input.specialRequirements,
    matchedPackages: scoredPackages,
  };

  // 4. Generate AI recommendations grounded in real database records
  return await generateCelebrationRecommendations(context);
};

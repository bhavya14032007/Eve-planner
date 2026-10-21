import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let genAI: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

export interface RecommendationContext {
  eventType: string;
  guestCount: number;
  budget: number;
  city: string;
  themeOrStyle?: string;
  requiredServices?: string[];
  specialRequirements?: string;
  matchedPackages: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    guestCapacity: number;
    description: string;
    inclusions: string[];
    exclusions: string[];
    suitabilityScore: number;
    matchedServices: Array<{
      category: string;
      listingTitle: string;
      startingPrice: number;
    }>;
  }>;
}

export interface AiRecommendationResult {
  topRecommendations: Array<{
    packageId: string;
    packageName: string;
    actualPrice: number;
    guestCapacity: number;
    matchScore: number;
    inclusions: string[];
    exclusions: string[];
    matchExplanation: string;
    customizationSuggestions: string[];
    whyItFitsBudget: string;
  }>;
  celebrationTips: string[];
  suggestedTimeline: string[];
  isFallback: boolean;
}

/**
 * Generate AI-enhanced celebration recommendation based strictly on database-grounded packages
 */
export const generateCelebrationRecommendations = async (
  context: RecommendationContext
): Promise<AiRecommendationResult> => {
  // If no Gemini key or client initialization failed, use database heuristic fallback
  if (!genAI || !env.GEMINI_API_KEY) {
    return generateDatabaseFallbackRecommendations(context, 'Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: {
        temperature: 0.2, // Low temperature for factual precision
        maxOutputTokens: 1500,
      },
    });

    const prompt = `You are Eve Planner's expert Celebration and Event Architect.
You must analyze the user's celebration request and provide detailed explanations for the provided REAL database packages.

CRITICAL INSTRUCTIONS:
1. ONLY reference and explain the packages provided below.
2. DO NOT invent prices, vendors, or services.
3. For each package, explain why it matches their event type (${context.eventType}), guest count (${context.guestCount}), budget (₹${context.budget}), and city (${context.city}).
4. Provide practical customization tips and a recommended planning timeline.

USER CELEBRATION DETAILS:
- Event Type: ${context.eventType}
- Guests: ${context.guestCount}
- Target Budget: ₹${context.budget}
- City: ${context.city}
- Preferred Style/Theme: ${context.themeOrStyle || 'Not specified (classic elegant)'}
- Required Services: ${context.requiredServices?.join(', ') || 'Full coordination'}
- Special Requirements: ${context.specialRequirements || 'None specified'}

AVAILABLE VERIFIED DATABASE PACKAGES (Ranked by suitability score):
${JSON.stringify(
  context.matchedPackages.slice(0, 3).map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    basePrice: pkg.basePrice,
    guestCapacity: pkg.guestCapacity,
    suitabilityScore: pkg.suitabilityScore,
    description: pkg.description,
    inclusions: pkg.inclusions,
    exclusions: pkg.exclusions,
    servicesIncluded: pkg.matchedServices,
  })),
  null,
  2
)}

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "recommendations": [
    {
      "packageId": "string (MUST match an exact package id from the list above)",
      "matchExplanation": "2-3 sentences explaining exactly why this package suits their celebration and theme",
      "customizationSuggestions": ["tip 1", "tip 2"],
      "whyItFitsBudget": "Analysis of price vs budget"
    }
  ],
  "celebrationTips": ["practical advice for this event type", "..."],
  "suggestedTimeline": ["30 days before: ...", "2 weeks before: ...", "Event day: ..."]
}`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 8000)
    );

    const apiCallPromise = model.generateContent(prompt);
    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    const responseText = result.response.text();

    // Clean JSON response
    const cleanedText = responseText
      .replace(/^```json/gm, '')
      .replace(/^```/gm, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Merge AI explanations with guaranteed database records to prevent hallucination
    const topRecommendations = context.matchedPackages.slice(0, 3).map((pkg) => {
      const aiNote = parsed.recommendations?.find((r: any) => r.packageId === pkg.id);
      return {
        packageId: pkg.id,
        packageName: pkg.name,
        actualPrice: pkg.basePrice,
        guestCapacity: pkg.guestCapacity,
        matchScore: Math.round(pkg.suitabilityScore),
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        matchExplanation:
          aiNote?.matchExplanation ||
          `${pkg.name} is a high-affinity package tailored for ${context.eventType} gatherings in ${context.city}.`,
        customizationSuggestions: aiNote?.customizationSuggestions || [
          'Add custom floral stage accents',
          'Include photography extension for guest arrivals',
        ],
        whyItFitsBudget:
          aiNote?.whyItFitsBudget ||
          `At ₹${pkg.basePrice.toLocaleString()}, this represents ${Math.round(
            (pkg.basePrice / (context.budget || pkg.basePrice)) * 100
          )}% of your target budget.`,
      };
    });

    return {
      topRecommendations,
      celebrationTips: parsed.celebrationTips || [
        'Finalize guest RSVPs at least 10 days before the celebration.',
        'Coordinate venue load-in times with your decorator and sound engineer.',
        'Prepare a timeline schedule for speeches, cake cutting, and dining.',
      ],
      suggestedTimeline: parsed.suggestedTimeline || [
        '3-4 Weeks Out: Confirm vendor requests and package customizations.',
        '1-2 Weeks Out: Finalize catering menu and dietary count.',
        '2 Days Out: Reconfirm schedule with photographers and coordinators.',
        'Event Day: Relax and let Eve Planner verified vendors execute seamlessly.',
      ],
      isFallback: false,
    };
  } catch (err: any) {
    console.warn('[Gemini AI Warning]: Falling back to database heuristics:', err?.message || err);
    return generateDatabaseFallbackRecommendations(context, err?.message);
  }
};

/**
 * Intelligent Database-grounded heuristic fallback when Gemini API is unavailable or unconfigured
 */
export const generateDatabaseFallbackRecommendations = (
  context: RecommendationContext,
  _reason?: string
): AiRecommendationResult => {
  const topPackages = context.matchedPackages.slice(0, 3);

  const topRecommendations = topPackages.map((pkg) => {
    const budgetPct = Math.round((pkg.basePrice / (context.budget || pkg.basePrice)) * 100);
    const capacityFit =
      pkg.guestCapacity >= context.guestCount
        ? `Comfortably accommodates your ${context.guestCount} guests (capacity: ${pkg.guestCapacity}).`
        : `Designed for ${pkg.guestCapacity} guests; can be scaled up with add-ons.`;

    return {
      packageId: pkg.id,
      packageName: pkg.name,
      actualPrice: pkg.basePrice,
      guestCapacity: pkg.guestCapacity,
      matchScore: Math.round(pkg.suitabilityScore),
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      matchExplanation: `${pkg.name} directly aligns with your ${context.eventType} celebration in ${context.city}. ${capacityFit}`,
      customizationSuggestions: [
        'Add customized welcoming decor and photo-booth backdrop',
        'Upgrade cake flavor or add gourmet mocktail station',
        'Extend photographer coverage hours',
      ],
      whyItFitsBudget:
        pkg.basePrice <= context.budget
          ? `Fits within your budget at ₹${pkg.basePrice.toLocaleString()} (${budgetPct}% of ₹${context.budget.toLocaleString()}).`
          : `Priced at ₹${pkg.basePrice.toLocaleString()}, offering comprehensive premium inclusions.`,
    };
  });

  return {
    topRecommendations,
    celebrationTips: [
      `Review vendor portfolio images and ratings before finalizing your ${context.eventType} reservation.`,
      'Confirm special dietary requirements (pure veg/jain options) early with catering.',
      'Check venue noise curfew and sound guidelines for evening celebrations.',
    ],
    suggestedTimeline: [
      'Step 1: Submit your preferred package reservation request on Eve Planner.',
      'Step 2: Connected vendors confirm date availability within 2-4 hours.',
      'Step 3: Review breakdown, customize add-ons, and secure with confidence.',
    ],
    isFallback: true,
  };
};

/**
 * AI Support & Assistant Chatbot grounded in platform policies and database knowledge
 */
export const generateAssistantReply = async (params: {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  platformContext: string;
}): Promise<{ reply: string; suggestedActions?: string[]; isFallback: boolean }> => {
  if (!genAI || !env.GEMINI_API_KEY) {
    return generateFallbackAssistantReply(params.userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    });

    const systemPrompt = `You are Eve, the warm, professional, and knowledgeable celebration concierge for Eve Planner.
Your purpose:
1. Help users plan birthdays, anniversaries, proposals, weddings, baby showers, and corporate celebrations.
2. Explain how packages, vendor bookings, pricing, and cancellations work.
3. Guide users to relevant pages (/explore-services, /packages, /ai-planner, /register-with-us, /my-bookings).
4. NEVER claim an action has been finalized or booked without backend confirmation.
5. Keep answers concise, polite, helpful, and formatted with bullet points where appropriate.

PLATFORM CONTEXT:
${params.platformContext}

CONVERSATION HISTORY:
${params.conversationHistory.slice(-5).map((m) => `${m.role}: ${m.content}`).join('\n')}

USER MESSAGE: ${params.userMessage}`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI Assistant timeout')), 7000)
    );

    const apiCallPromise = model.generateContent(systemPrompt);
    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    const replyText = result.response.text().trim();

    return {
      reply: replyText,
      suggestedActions: [
        'Explore Curated Packages',
        'Use AI Celebration Planner',
        'Browse Local Vendors',
      ],
      isFallback: false,
    };
  } catch (err: any) {
    console.warn('[Gemini Assistant Warning]: Falling back to smart keyword rule engine:', err?.message || err);
    return generateFallbackAssistantReply(params.userMessage);
  }
};

/**
 * Intelligent Keyword & Intent Fallback for Chatbot
 */
const generateFallbackAssistantReply = (
  userMessage: string
): { reply: string; suggestedActions?: string[]; isFallback: boolean } => {
  const msg = userMessage.toLowerCase();

  if (msg.includes('package') || msg.includes('combo') || msg.includes('pricing') || msg.includes('cost')) {
    return {
      reply:
        'Eve Planner offers curated all-in-one packages for Birthdays, Anniversaries, Proposals, Weddings, Baby Showers, and Corporate events. Each package includes verified venue/decor, photography, and catering options with real-time price customization. You can explore all options on our Packages page!',
      suggestedActions: ['View Packages', 'Try AI Planner', 'Contact Support'],
      isFallback: true,
    };
  }

  if (msg.includes('book') || msg.includes('how to') || msg.includes('reserve')) {
    return {
      reply:
        'Booking on Eve Planner is easy and secure:\n1. Choose a pre-built package or browse individual services.\n2. Select your event date, time, location, and guest count.\n3. Add any custom add-ons (like special decor or live music).\n4. Submit your request for vendor confirmation with explicit transparent pricing!',
      suggestedActions: ['Explore Services', 'View My Bookings'],
      isFallback: true,
    };
  }

  if (msg.includes('vendor') || msg.includes('register') || msg.includes('join') || msg.includes('partner')) {
    return {
      reply:
        'Are you an event venue owner, caterer, decorator, DJ, or photographer? You can grow your business with Eve Planner! Head to our "Register With Us" portal to submit your profile and portfolio for admin approval.',
      suggestedActions: ['Register as Vendor', 'Vendor Benefits'],
      isFallback: true,
    };
  }

  if (msg.includes('cancel') || msg.includes('refund') || msg.includes('policy')) {
    return {
      reply:
        'Our transparent celebration booking policy allows free cancellation up to 72 hours before the event date for pending and standard bookings. For custom or multi-vendor packages, specific vendor timelines apply as detailed in your booking summary.',
      suggestedActions: ['My Bookings', 'Open Support Ticket'],
      isFallback: true,
    };
  }

  return {
    reply:
      'Hello! I am your Eve Planner assistant. I can help you find verified banquet halls, caterers, photographers, and decorators, or guide you through our popular celebration packages. What kind of event are you planning today?',
    suggestedActions: ['Plan Birthday', 'Plan Wedding / Engagement', 'Explore Packages'],
    isFallback: true,
  };
};

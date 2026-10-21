export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
  customerProfile?: {
    city?: string;
    address?: string;
    preferredBudget?: number;
  };
  vendorProfile?: VendorProfile;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl?: string;
  _count?: { listings: number };
}

export interface ServiceImage {
  id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ServiceListing {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  startingPrice: number;
  priceUnit: string;
  maxGuests?: number;
  city: string;
  location: string;
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  vendor: {
    businessName: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    city?: string;
    phone?: string;
    email?: string;
  };
  category: {
    name: string;
    slug: string;
    icon: string;
  };
  images: ServiceImage[];
  availabilities?: Array<{ date: string; isAvailable: boolean }>;
  reviews?: Review[];
}

export interface PackageAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxQuantity: number;
}

export interface EventPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  eventType: string;
  basePrice: number;
  guestCapacity: number;
  durationHours: number;
  inclusions: string[];
  exclusions: string[];
  isPopular: boolean;
  isActive: boolean;
  imageUrl?: string;
  addons: PackageAddon[];
  packageServices?: Array<{
    listing: ServiceListing;
  }>;
}

export interface EventBooking {
  id: string;
  bookingNumber: string;
  customerId: string;
  packageId?: string;
  package?: {
    name: string;
    imageUrl?: string;
    basePrice: number;
  };
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  guestCount: number;
  specialRequirements?: string;
  baseAmount: number;
  addonsAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  cancellationReason?: string;
  selectedAddonsJson?: string;
  createdAt: string;
  services?: Array<{
    listing: { title: string; startingPrice: number };
    vendor: { businessName: string; phone?: string; email?: string };
  }>;
  vendorRequests?: Array<{
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    vendor: { businessName: string };
  }>;
  payments?: Array<{
    id: string;
    transactionId: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  categoryId?: string;
  description: string;
  address: string;
  city: string;
  serviceArea?: string;
  phone: string;
  email: string;
  websiteUrl?: string;
  instagramUrl?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  adminNotes?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  vendorReply?: string;
  createdAt: string;
  customer: {
    fullName: string;
    avatarUrl?: string;
  };
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

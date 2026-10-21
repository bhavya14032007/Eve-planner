import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface CreateBookingInput {
  customerId: string;
  packageId?: string;
  eventType: string;
  eventDate: string; // ISO date string or YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  guestCount: number;
  specialRequirements?: string;
  selectedAddons?: Array<{
    addonId: string;
    quantity: number;
  }>;
  selectedListingIds?: string[]; // Custom service listings if booking individually or augmenting
}

export interface BookingPriceCalculation {
  baseAmount: number;
  addonsAmount: number;
  taxAmount: number;
  totalAmount: number;
  breakdown: {
    packageName?: string;
    packagePrice?: number;
    addons: Array<{ name: string; price: number; quantity: number; subtotal: number }>;
    individualServices: Array<{ title: string; price: number }>;
    taxRate: number;
  };
}

/**
 * Server-side verified price calculation to prevent price tampering
 */
export const calculateBookingPrice = async (
  input: Pick<CreateBookingInput, 'packageId' | 'selectedAddons' | 'selectedListingIds'>
): Promise<BookingPriceCalculation> => {
  let baseAmount = 0;
  let addonsAmount = 0;
  let packageName: string | undefined;
  let packagePrice: number | undefined;
  const addonsBreakdown: Array<{ name: string; price: number; quantity: number; subtotal: number }> = [];
  const individualServicesBreakdown: Array<{ title: string; price: number }> = [];

  // 1. If package selected, fetch verified price from database
  if (input.packageId) {
    const pkg = await prisma.eventPackage.findUnique({
      where: { id: input.packageId },
      include: { addons: true },
    });
    if (!pkg) {
      throw new NotFoundError('Selected celebration package does not exist');
    }
    baseAmount += pkg.basePrice;
    packageName = pkg.name;
    packagePrice = pkg.basePrice;

    // Validate selected addons against package addons in DB
    if (input.selectedAddons && input.selectedAddons.length > 0) {
      for (const selAddon of input.selectedAddons) {
        const foundAddon = pkg.addons.find((a) => a.id === selAddon.addonId);
        if (foundAddon) {
          const qty = Math.min(Math.max(1, selAddon.quantity), foundAddon.maxQuantity);
          const subtotal = foundAddon.price * qty;
          addonsAmount += subtotal;
          addonsBreakdown.push({
            name: foundAddon.name,
            price: foundAddon.price,
            quantity: qty,
            subtotal,
          });
        }
      }
    }
  }

  // 2. If custom listings selected, fetch and calculate verified prices
  if (input.selectedListingIds && input.selectedListingIds.length > 0) {
    const listings = await prisma.serviceListing.findMany({
      where: {
        id: { in: input.selectedListingIds },
        isActive: true,
      },
    });

    for (const listing of listings) {
      baseAmount += listing.startingPrice;
      individualServicesBreakdown.push({
        title: listing.title,
        price: listing.startingPrice,
      });
    }
  }

  if (baseAmount <= 0) {
    throw new BadRequestError('Booking must include at least one package or service listing');
  }

  // 5% platform GST / service tax
  const taxRate = 0.05;
  const taxAmount = Math.round((baseAmount + addonsAmount) * taxRate);
  const totalAmount = baseAmount + addonsAmount + taxAmount;

  return {
    baseAmount,
    addonsAmount,
    taxAmount,
    totalAmount,
    breakdown: {
      packageName,
      packagePrice,
      addons: addonsBreakdown,
      individualServices: individualServicesBreakdown,
      taxRate,
    },
  };
};

/**
 * Create celebration booking using an atomic database transaction
 */
export const createBooking = async (input: CreateBookingInput) => {
  // Validate customer
  const customer = await prisma.user.findUnique({
    where: { id: input.customerId },
  });
  if (!customer) {
    throw new NotFoundError('Customer user not found');
  }

  // Server-side calculated price
  const pricing = await calculateBookingPrice({
    packageId: input.packageId,
    selectedAddons: input.selectedAddons,
    selectedListingIds: input.selectedListingIds,
  });

  // Unique booking reference
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingNumber = `EVE-${new Date().getFullYear()}-${randomSuffix}`;

  // Find all listings to attach to this booking
  const listingIdsToLink: string[] = [];
  if (input.packageId) {
    const pkgServices = await prisma.packageService.findMany({
      where: { packageId: input.packageId },
      select: { listingId: true },
    });
    listingIdsToLink.push(...pkgServices.map((ps) => ps.listingId));
  }
  if (input.selectedListingIds) {
    listingIdsToLink.push(...input.selectedListingIds);
  }

  // Fetch full details of listings with their vendors
  const listingsWithVendors = await prisma.serviceListing.findMany({
    where: { id: { in: Array.from(new Set(listingIdsToLink)) } },
    include: { vendor: true },
  });

  // Execute atomic transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Create main EventBooking record
    const booking = await tx.eventBooking.create({
      data: {
        bookingNumber,
        customerId: input.customerId,
        packageId: input.packageId || null,
        eventType: input.eventType,
        eventDate: new Date(input.eventDate),
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        city: input.city,
        guestCount: input.guestCount,
        specialRequirements: input.specialRequirements || null,
        baseAmount: pricing.baseAmount,
        addonsAmount: pricing.addonsAmount,
        taxAmount: pricing.taxAmount,
        totalAmount: pricing.totalAmount,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        selectedAddonsJson: JSON.stringify(pricing.breakdown.addons),
      },
    });

    // 2. Create BookingService and VendorBookingRequest records for each vendor
    for (const listing of listingsWithVendors) {
      await tx.bookingService.create({
        data: {
          bookingId: booking.id,
          listingId: listing.id,
          vendorId: listing.vendorId,
          price: listing.startingPrice,
          status: 'PENDING',
        },
      });

      // Avoid duplicate vendor requests for the same vendor/listing
      await tx.vendorBookingRequest.create({
        data: {
          bookingId: booking.id,
          vendorId: listing.vendorId,
          listingId: listing.id,
          status: 'PENDING',
          notes: `Event: ${input.eventType} for ${input.guestCount} guests on ${new Date(
            input.eventDate
          ).toLocaleDateString()}`,
        },
      });
    }

    return booking;
  });
};

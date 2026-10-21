import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';

export const vendorRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  businessName: z.string().min(2),
  categorySlug: z.string().min(2),
  description: z.string().min(10),
  address: z.string().min(3),
  city: z.string().min(2),
  serviceArea: z.string().optional(),
  startingPrice: z.number().positive(),
  priceUnit: z.string().default('per event'),
  websiteUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  portfolioImages: z.array(z.string()).optional(),
});

export const registerVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      businessName,
      categorySlug,
      description,
      address,
      city,
      serviceArea,
      startingPrice,
      priceUnit,
      websiteUrl,
      instagramUrl,
      portfolioImages = [],
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Find category
    const category = await prisma.serviceCategory.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      throw new BadRequestError('Invalid service category');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Create user and vendor profile atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          phone,
          role: 'VENDOR',
        },
      });

      const vendor = await tx.vendorProfile.create({
        data: {
          userId: newUser.id,
          businessName,
          slug,
          categoryId: category.id,
          description,
          address,
          city,
          serviceArea: serviceArea || city,
          phone,
          email,
          websiteUrl: websiteUrl || null,
          instagramUrl: instagramUrl || null,
          status: 'PENDING_REVIEW', // Admin approval required
          isVerified: false,
        },
      });

      // Create an initial draft service listing
      const listingSlug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-services-${Math.floor(
        100 + Math.random() * 900
      )}`;

      const listing = await tx.serviceListing.create({
        data: {
          vendorId: vendor.id,
          categoryId: category.id,
          title: `${businessName} — Core Experience`,
          slug: listingSlug,
          description,
          startingPrice,
          priceUnit,
          city,
          location: address,
          inclusions: JSON.stringify(['Dedicated event manager', 'Initial consultation', 'Standard setup & tear-down']),
          exclusions: JSON.stringify(['Outstation travel unless pre-arranged', 'Third-party permit charges']),
          isActive: false, // Inactive until vendor is approved
        },
      });

      if (portfolioImages.length > 0) {
        for (let i = 0; i < portfolioImages.length; i++) {
          await tx.serviceImage.create({
            data: {
              listingId: listing.id,
              imageUrl: portfolioImages[i],
              isPrimary: i === 0,
              sortOrder: i,
            },
          });
        }
      }

      return newUser;
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'VENDOR', fullName: user.fullName },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message:
        'Vendor registration submitted successfully! Your account is currently under review by our admin team.',
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName, role: 'VENDOR' },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      throw new ForbiddenError('Vendor access only');
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        category: true,
        documents: true,
        listings: {
          include: {
            images: true,
            _count: { select: { bookingServices: true } },
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundError('Vendor profile not found');
    }

    res.json({
      success: true,
      data: vendor,
    });
  } catch (err) {
    next(err);
  }
};

export const getVendorRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      throw new ForbiddenError('Vendor access only');
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    const requests = await prisma.vendorBookingRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            customer: {
              select: { fullName: true, phone: true, email: true },
            },
          },
        },
        listing: {
          select: { title: true, startingPrice: true, priceUnit: true },
        },
      },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

export const respondToBookingRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      throw new ForbiddenError('Vendor access only');
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      throw new BadRequestError('Status must be either ACCEPTED or DECLINED');
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!vendor) throw new NotFoundError('Vendor not found');

    const request = await prisma.vendorBookingRequest.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!request || request.vendorId !== vendor.id) {
      throw new NotFoundError('Booking request not found for your vendor account');
    }

    const updated = await prisma.vendorBookingRequest.update({
      where: { id },
      data: {
        status,
        notes: notes || null,
        respondedAt: new Date(),
      },
    });

    // If accepted and all requests for this booking are accepted, we can mark booking confirmed
    if (status === 'ACCEPTED') {
      const allRequests = await prisma.vendorBookingRequest.findMany({
        where: { bookingId: request.bookingId },
      });
      const allAccepted = allRequests.every((r) => r.id === id || r.status === 'ACCEPTED');
      if (allAccepted) {
        await prisma.eventBooking.update({
          where: { id: request.bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    res.json({
      success: true,
      message: `Booking request ${status.toLowerCase()} successfully`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      throw new ForbiddenError('Vendor access only');
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!vendor) throw new NotFoundError('Vendor not found');

    if (vendor.status !== 'APPROVED') {
      throw new ForbiddenError('Your vendor profile must be approved by admin before publishing listings.');
    }

    const {
      title,
      categoryId,
      description,
      startingPrice,
      priceUnit,
      maxGuests,
      location,
      city,
      inclusions = [],
      exclusions = [],
      imageUrls = [],
    } = req.body;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;

    const listing = await prisma.serviceListing.create({
      data: {
        vendorId: vendor.id,
        categoryId: categoryId || vendor.categoryId!,
        title,
        slug,
        description,
        startingPrice: parseFloat(startingPrice),
        priceUnit: priceUnit || 'per event',
        maxGuests: maxGuests ? parseInt(maxGuests, 10) : null,
        city: city || vendor.city,
        location: location || vendor.address,
        inclusions: JSON.stringify(inclusions),
        exclusions: JSON.stringify(exclusions),
        isActive: true,
        images: {
          create: imageUrls.map((url: string, idx: number) => ({
            imageUrl: url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Service listing created successfully',
      data: listing,
    });
  } catch (err) {
    next(err);
  }
};

export const getVendorAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      throw new ForbiddenError('Vendor access only');
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!vendor) throw new NotFoundError('Vendor not found');

    const [totalRequests, acceptedRequests, activeListings, totalServices] = await Promise.all([
      prisma.vendorBookingRequest.count({ where: { vendorId: vendor.id } }),
      prisma.vendorBookingRequest.count({ where: { vendorId: vendor.id, status: 'ACCEPTED' } }),
      prisma.serviceListing.count({ where: { vendorId: vendor.id, isActive: true } }),
      prisma.bookingService.findMany({
        where: { vendorId: vendor.id },
        select: { price: true },
      }),
    ]);

    const estimatedRevenue = totalServices.reduce((sum, s) => sum + s.price, 0);

    res.json({
      success: true,
      data: {
        totalRequests,
        acceptedRequests,
        acceptanceRate: totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 100,
        activeListings,
        estimatedRevenue,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        status: vendor.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

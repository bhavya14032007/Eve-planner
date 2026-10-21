import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedServices = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const featured = await prisma.serviceListing.findMany({
      where: { isActive: true, isFeatured: true },
      take: 6,
      include: {
        vendor: {
          select: { businessName: true, rating: true, reviewCount: true, isVerified: true },
        },
        category: {
          select: { name: true, slug: true, icon: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    const formatted = featured.map((item) => ({
      ...item,
      inclusions: tryParseJson(item.inclusions),
      exclusions: tryParseJson(item.exclusions),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const skip = (page - 1) * limit;

    const {
      city,
      category,
      minPrice,
      maxPrice,
      minGuests,
      search,
      sortBy = 'rating',
    } = req.query;

    const where: any = {
      isActive: true,
      vendor: {
        status: 'APPROVED',
      },
    };

    if (city && city !== 'All') {
      where.city = { contains: String(city) };
    }

    if (category && category !== 'All') {
      where.category = {
        slug: String(category),
      };
    }

    if (minPrice || maxPrice) {
      where.startingPrice = {};
      if (minPrice) where.startingPrice.gte = parseFloat(String(minPrice));
      if (maxPrice) where.startingPrice.lte = parseFloat(String(maxPrice));
    }

    if (minGuests) {
      where.maxGuests = {
        gte: parseInt(String(minGuests), 10),
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { location: { contains: String(search) } },
        { vendor: { businessName: { contains: String(search) } } },
      ];
    }

    // Sort order
    let orderBy: any = { rating: 'desc' };
    if (sortBy === 'price_asc') orderBy = { startingPrice: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { startingPrice: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [listings, totalCount] = await Promise.all([
      prisma.serviceListing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          vendor: {
            select: { businessName: true, rating: true, reviewCount: true, isVerified: true, city: true },
          },
          category: {
            select: { name: true, slug: true, icon: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.serviceListing.count({ where }),
    ]);

    const formatted = listings.map((item) => ({
      ...item,
      inclusions: tryParseJson(item.inclusions),
      exclusions: tryParseJson(item.exclusions),
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;

    const listing = await prisma.serviceListing.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        vendor: {
          include: {
            documents: {
              where: { status: 'VERIFIED' },
              select: { docType: true },
            },
          },
        },
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        availabilities: {
          where: {
            date: { gte: new Date() },
          },
          take: 30,
        },
        reviews: {
          where: { isPublished: true },
          include: {
            customer: {
              select: { fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!listing) {
      throw new NotFoundError('Service listing not found');
    }

    res.json({
      success: true,
      data: {
        ...listing,
        inclusions: tryParseJson(listing.inclusions),
        exclusions: tryParseJson(listing.exclusions),
      },
    });
  } catch (err) {
    next(err);
  }
};

const tryParseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return [str];
  }
};

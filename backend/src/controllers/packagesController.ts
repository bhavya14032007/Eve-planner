import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventType } = req.query;

    const where: any = { isActive: true };
    if (eventType && eventType !== 'All') {
      where.eventType = { contains: String(eventType) };
    }

    const packages = await prisma.eventPackage.findMany({
      where,
      orderBy: [{ isPopular: 'desc' }, { basePrice: 'asc' }],
      include: {
        addons: true,
        packageServices: {
          include: {
            listing: {
              include: {
                vendor: {
                  select: { businessName: true, rating: true, isVerified: true },
                },
                category: {
                  select: { name: true, icon: true },
                },
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    const formatted = packages.map((pkg) => ({
      ...pkg,
      inclusions: tryParseJson(pkg.inclusions),
      exclusions: tryParseJson(pkg.exclusions),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

export const getPackageDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;

    const pkg = await prisma.eventPackage.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        addons: true,
        packageServices: {
          include: {
            listing: {
              include: {
                vendor: true,
                category: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundError('Celebration package not found');
    }

    res.json({
      success: true,
      data: {
        ...pkg,
        inclusions: tryParseJson(pkg.inclusions),
        exclusions: tryParseJson(pkg.exclusions),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const calculateCustomPackagePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { packageId, selectedAddons } = req.body;

    if (!packageId) {
      throw new BadRequestError('packageId is required');
    }

    const pkg = await prisma.eventPackage.findUnique({
      where: { id: packageId },
      include: { addons: true },
    });

    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    let basePrice = pkg.basePrice;
    let addonsTotal = 0;
    const appliedAddons: Array<{ name: string; price: number; quantity: number; subtotal: number }> = [];

    if (Array.isArray(selectedAddons)) {
      for (const sel of selectedAddons) {
        const found = pkg.addons.find((a) => a.id === sel.addonId);
        if (found) {
          const qty = Math.min(Math.max(1, sel.quantity || 1), found.maxQuantity);
          const subtotal = found.price * qty;
          addonsTotal += subtotal;
          appliedAddons.push({
            name: found.name,
            price: found.price,
            quantity: qty,
            subtotal,
          });
        }
      }
    }

    const subtotal = basePrice + addonsTotal;
    const taxRate = 0.05;
    const tax = Math.round(subtotal * taxRate);
    const grandTotal = subtotal + tax;

    res.json({
      success: true,
      data: {
        packageId: pkg.id,
        packageName: pkg.name,
        basePrice,
        addonsTotal,
        tax,
        grandTotal,
        appliedAddons,
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

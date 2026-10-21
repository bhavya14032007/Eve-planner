import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, fullName: true, phone: true } },
        category: true,
        documents: true,
        _count: { select: { listings: true, reviews: true, bookingRequests: true } },
      },
    });

    res.json({
      success: true,
      data: vendors,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin credentials required');
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestError('Status must be APPROVED or REJECTED');
    }

    const vendor = await prisma.vendorProfile.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    // Atomic update + audit log
    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.vendorProfile.update({
        where: { id },
        data: {
          status,
          isVerified: status === 'APPROVED',
          adminNotes: adminNotes || null,
        },
      });

      // If approved, activate draft listings
      if (status === 'APPROVED') {
        await tx.serviceListing.updateMany({
          where: { vendorId: id },
          data: { isActive: true },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: status === 'APPROVED' ? 'VENDOR_APPROVED' : 'VENDOR_REJECTED',
          targetEntity: 'VendorProfile',
          targetId: id,
          details: `Vendor ${vendor.businessName} was marked as ${status}. Notes: ${adminNotes || 'None'}`,
        },
      });

      return v;
    });

    res.json({
      success: true,
      message: `Vendor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.eventBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true, email: true, phone: true } },
        package: { select: { name: true } },
        services: {
          include: {
            vendor: { select: { businessName: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      pendingVendors,
      totalListings,
      totalBookings,
      confirmedBookings,
      revenueResult,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.vendorProfile.count({ where: { status: 'APPROVED' } }),
      prisma.vendorProfile.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.serviceListing.count({ where: { isActive: true } }),
      prisma.eventBooking.count(),
      prisma.eventBooking.count({ where: { status: 'CONFIRMED' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalVendors,
        pendingVendors,
        totalListings,
        totalBookings,
        confirmedBookings,
        totalRevenue: revenueResult._sum.amount || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        admin: { select: { fullName: true, email: true } },
      },
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

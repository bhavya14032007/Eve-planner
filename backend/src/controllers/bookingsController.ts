import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { calculateBookingPrice, createBooking } from '../services/bookingService';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/errors';

export const bookingSchema = z.object({
  packageId: z.string().optional(),
  eventType: z.string().min(2, 'Event type is required'),
  eventDate: z.string().min(5, 'Event date is required'),
  startTime: z.string().default('18:00'),
  endTime: z.string().default('22:00'),
  location: z.string().min(3, 'Location/Venue address is required'),
  city: z.string().min(2, 'City is required'),
  guestCount: z.number().int().positive('Guest count must be positive'),
  specialRequirements: z.string().optional(),
  selectedAddons: z
    .array(
      z.object({
        addonId: z.string(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .optional(),
  selectedListingIds: z.array(z.string()).optional(),
});

export const calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { packageId, selectedAddons, selectedListingIds } = req.body;
    const calculation = await calculateBookingPrice({
      packageId,
      selectedAddons,
      selectedListingIds,
    });

    res.json({
      success: true,
      data: calculation,
    });
  } catch (err) {
    next(err);
  }
};

export const createBookingRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Please log in to submit a celebration booking request');
    }

    const booking = await createBooking({
      ...req.body,
      customerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Celebration booking request submitted successfully! Participating vendors will review shortly.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    const bookings = await prisma.eventBooking.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        package: {
          select: { name: true, imageUrl: true, basePrice: true },
        },
        services: {
          include: {
            listing: {
              select: { title: true, startingPrice: true },
            },
            vendor: {
              select: { businessName: true, phone: true, email: true },
            },
          },
        },
        vendorRequests: {
          include: {
            vendor: {
              select: { businessName: true, status: true },
            },
          },
        },
        payments: true,
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

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { id } = req.params;

    const booking = await prisma.eventBooking.findUnique({
      where: { id },
      include: {
        package: true,
        services: {
          include: {
            listing: true,
            vendor: true,
          },
        },
        vendorRequests: {
          include: {
            vendor: true,
            listing: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Authorization: only the customer who booked it, the assigned vendors, or an admin
    if (booking.customerId !== req.user.id && req.user.role !== 'ADMIN') {
      const isVendorAssigned = booking.services.some((s) => s.vendor.userId === req.user?.id);
      if (!isVendorAssigned) {
        throw new UnauthorizedError('You are not authorized to view this booking');
      }
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.eventBooking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Not authorized to cancel this booking');
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new BadRequestError(`Cannot cancel a booking that is already ${booking.status}`);
    }

    const updated = await prisma.eventBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by customer',
      },
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const simulatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { id } = req.params;
    const { paymentMethod = 'UPI' } = req.body;

    const booking = await prisma.eventBooking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId !== req.user.id) {
      throw new UnauthorizedError('Not authorized to pay for this booking');
    }

    // Record payment & update status
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId: `TXN-DEMO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        gateway: 'RAZORPAY_DEMO',
        amount: booking.totalAmount,
        currency: 'INR',
        status: 'SUCCESS',
        paymentMethod,
        rawPayload: JSON.stringify({ verified: true, simulatedAt: new Date().toISOString() }),
      },
    });

    const updatedBooking = await prisma.eventBooking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    res.json({
      success: true,
      message: 'Payment confirmed! Your celebration booking is confirmed.',
      data: {
        booking: updatedBooking,
        payment,
      },
    });
  } catch (err) {
    next(err);
  }
};

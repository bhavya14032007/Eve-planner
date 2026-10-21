import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (user: { id: string; email: string; role: string; fullName: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone, city, address } = req.body;

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: 'CUSTOMER',
        customerProfile: {
          create: {
            city: city || 'Delhi NCR',
            address: address || '',
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        customerProfile: true,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        vendorProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          customerProfile: user.customerProfile,
          vendorProfile: user.vendorProfile,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        customerProfile: true,
        vendorProfile: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        customerProfile: user.customerProfile,
        vendorProfile: user.vendorProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

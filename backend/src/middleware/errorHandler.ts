import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Prisma unique constraint violation (P2002)
  if ((err as any)?.code === 'P2002') {
    const target = (err as any)?.meta?.target;
    res.status(409).json({
      success: false,
      error: `A record with this ${Array.isArray(target) ? target.join(', ') : 'field'} already exists.`,
    });
    return;
  }

  // Unhandled / unexpected errors
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(env.NODE_ENV !== 'production' && { message: err.message, stack: err.stack }),
  });
};

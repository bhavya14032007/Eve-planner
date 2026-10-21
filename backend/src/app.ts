import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import servicesRoutes from './routes/servicesRoutes';
import packagesRoutes from './routes/packagesRoutes';
import bookingsRoutes from './routes/bookingsRoutes';
import aiRoutes from './routes/aiRoutes';
import vendorRoutes from './routes/vendorRoutes';
import adminRoutes from './routes/adminRoutes';

export const createApp = () => {
  const app = express();

  // Security & Utility Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // General rate limiter
  app.use('/api', generalLimiter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Eve Planner API',
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/packages', packagesRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler for unknown routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp();

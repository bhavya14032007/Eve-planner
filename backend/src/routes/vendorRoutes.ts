import { Router } from 'express';
import {
  registerVendor,
  getVendorProfile,
  getVendorRequests,
  respondToBookingRequest,
  createListing,
  getVendorAnalytics,
  vendorRegisterSchema,
} from '../controllers/vendorController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: vendorRegisterSchema }), registerVendor);
router.get('/me', requireAuth, requireRole('VENDOR'), getVendorProfile);
router.get('/requests', requireAuth, requireRole('VENDOR'), getVendorRequests);
router.post('/requests/:id/respond', requireAuth, requireRole('VENDOR'), respondToBookingRequest);
router.post('/listings', requireAuth, requireRole('VENDOR'), createListing);
router.get('/analytics', requireAuth, requireRole('VENDOR'), getVendorAnalytics);

export default router;

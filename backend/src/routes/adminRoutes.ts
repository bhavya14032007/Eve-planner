import { Router } from 'express';
import {
  getVendors,
  verifyVendor,
  getAllBookings,
  getAdminStats,
  getAuditLogs,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireRole('ADMIN'));

router.get('/vendors', getVendors);
router.post('/vendors/:id/verify', verifyVendor);
router.get('/bookings', getAllBookings);
router.get('/stats', getAdminStats);
router.get('/audit-logs', getAuditLogs);

export default router;

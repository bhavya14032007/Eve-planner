import { Router } from 'express';
import {
  calculatePrice,
  createBookingRequest,
  getMyBookings,
  getBookingById,
  cancelBooking,
  simulatePayment,
  bookingSchema,
} from '../controllers/bookingsController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/calculate', calculatePrice);
router.post('/', requireAuth, validateRequest({ body: bookingSchema }), createBookingRequest);
router.get('/my', requireAuth, getMyBookings);
router.get('/:id', requireAuth, getBookingById);
router.post('/:id/cancel', requireAuth, cancelBooking);
router.post('/:id/pay', requireAuth, simulatePayment);

export default router;

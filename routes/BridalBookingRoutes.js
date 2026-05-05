// routes/BridalBookingRoutes.js
import express from 'express';
import {
  createBookingFromQuote,
  createDirectBooking,
  getAllBridalBookings,
  getBridalBookingById,
  getBridalBookingsByCustomer,
  updateBridalBookingStatus,
  updateBridalBookingPayment,
  cancelBridalBooking,
  deleteBridalBooking,
  getBridalBookingStats
} from '../controllers/BridalBookingController.js';

const router = express.Router();

// Public routes (for customer lookup)
router.get('/customer', getBridalBookingsByCustomer);

// Admin routes (add authentication middleware in production)
router.post('/from-quote', createBookingFromQuote);
router.post('/direct', createDirectBooking);
router.get('/', getAllBridalBookings);
router.get('/stats', getBridalBookingStats);
router.get('/:id', getBridalBookingById);
router.put('/:id/status', updateBridalBookingStatus);
router.put('/:id/payment', updateBridalBookingPayment);
router.put('/:id/cancel', cancelBridalBooking);
router.delete('/:id', deleteBridalBooking);

export default router;
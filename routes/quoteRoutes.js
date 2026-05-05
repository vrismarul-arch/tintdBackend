// routes/quoteRoutes.js
import express from 'express';
import {
  createQuoteRequest,
  getAllQuoteRequests,
  getQuoteRequestById,
  updateQuoteStatus,
  deleteQuoteRequest
} from '../controllers/quoteController.js';

const router = express.Router();

// Public routes (customers can submit quotes)
router.post('/', createQuoteRequest);

// Admin routes (add authentication middleware in production)
router.get('/', getAllQuoteRequests);
router.get('/:id', getQuoteRequestById);
router.put('/:id/status', updateQuoteStatus);
router.delete('/:id', deleteQuoteRequest);

export default router;
import { Router } from 'express';
import { createReview, getPropertyReviews } from '../controllers/reviewController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/reviews -> Create rating feed review for property
router.post('/', authenticateJWT, createReview);

// GET /api/reviews/property/:propertyId -> Get all reviews for a listing
router.get('/property/:propertyId', getPropertyReviews);

export default router;

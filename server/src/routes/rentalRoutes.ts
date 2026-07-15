import { Router } from 'express';
import { createRental, getMyRentals } from '../controllers/rentalController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/rentals -> Create a rental booking request
router.post('/', authenticateJWT, createRental);

// GET /api/rentals/mine -> Retrieve active logged-in tenant's rental requests
router.get('/mine', authenticateJWT, getMyRentals);

export default router;

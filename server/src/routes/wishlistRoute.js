import express from 'express';
import { toggleWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

// POST /api/wishlist/toggle
router.post('/toggle', toggleWishlist);

export default router;

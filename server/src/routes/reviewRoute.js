import express from 'express';
import {
  createReview,
  getReviewsByRoom,
  getRoomRatingSummary,
} from '../controllers/reviewController.js';
import { getHostReviews } from '../controllers/hostController.js';
import { hostAuth } from '../middlewares/hostAuthMiddleware.js';

const router = express.Router();

// GET   /api/reviews/host       → Thống kê & Danh sách đánh giá của Host (Hỗ trợ Tester & API Client)
router.get('/host', hostAuth, getHostReviews);

// POST  /api/reviews            → Gửi đánh giá mới
router.post('/', createReview);

// GET   /api/reviews/:roomId    → Danh sách đánh giá của phòng (?page=1&limit=10)
router.get('/:roomId', getReviewsByRoom);

// GET   /api/reviews/:roomId/summary → Tóm tắt rating + phân phối sao
router.get('/:roomId/summary', getRoomRatingSummary);

export default router;

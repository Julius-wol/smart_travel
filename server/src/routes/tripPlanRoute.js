import express from 'express';
import {
  generateTripPlan,
  saveTripPlan,
  getMyTripPlans,
  getTripPlanById,
  deleteTripPlan
} from '../controllers/tripPlanController.js';

const router = express.Router();

// [SMART-104] Sinh lộ trình thông minh AI quanh chỗ ở (cho phép kèm bán kính 3km, 5km, 10km)
router.post('/generate', generateTripPlan);

// Lưu lộ trình vào MongoDB
router.post('/save', saveTripPlan);

// Lấy danh sách lộ trình của tôi
router.get('/my-plans', getMyTripPlans);

// Lấy chi tiết một lộ trình theo ID
router.get('/:id', getTripPlanById);

// Xóa lộ trình
router.delete('/:id', deleteTripPlan);

export default router;


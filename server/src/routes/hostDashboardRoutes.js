import express from 'express';
import {
  getHostDashboard,
  exportDashboardReport,
} from '../controllers/hostDashboardController.js';

const router = express.Router();

// GET /api/host/dashboard - Lấy dữ liệu tổng quan kinh doanh
router.get('/', getHostDashboard);

// GET /api/host/dashboard/export - Xuất báo cáo kinh doanh ra file
router.get('/export', exportDashboardReport);

export default router;

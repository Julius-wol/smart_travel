import express from 'express';
import {
  getHostRooms,
  getHostCalendar,
  blockRoomDates,
  unblockRoomDates,
  quickApproveBooking,
  quickRejectBooking
} from '../controllers/hostCalendarController.js';

const router = express.Router();

// Lấy danh sách các phòng thuộc sở hữu của Host
router.get('/rooms', getHostRooms);

// Lấy ma trận lịch theo tháng & KPI của phòng
router.get('/calendar', getHostCalendar);

// Khóa dải ngày đón khách thủ công
router.post('/calendar/block', blockRoomDates);

// Mở bán lại ngày đã khóa
router.post('/calendar/unblock', unblockRoomDates);

// Duyệt nhanh đơn chờ SLA trực tiếp trên Lịch
router.post('/bookings/:id/approve', quickApproveBooking);

// Từ chối đơn đặt phòng
router.post('/bookings/:id/reject', quickRejectBooking);

export default router;

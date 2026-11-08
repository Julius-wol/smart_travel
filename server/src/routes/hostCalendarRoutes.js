import express from 'express';
import {
  getHostRooms,
  getHostCalendar,
  blockRoomDates,
  unblockRoomDates,
  quickApproveBooking,
  quickRejectBooking
} from '../controllers/hostCalendarController.js';
import { hostAuth } from '../middlewares/hostAuthMiddleware.js';
import { requireHostRoom, calendarErrorResponse } from '../services/hostCalendarService.js';
import { subscribeCalendarChanges } from '../services/calendarEvents.js';

const router = express.Router();
router.use(hostAuth);

// Lấy danh sách các phòng thuộc sở hữu của Host
router.get('/rooms', getHostRooms);

// Lấy ma trận lịch theo tháng & KPI của phòng
router.get('/calendar', getHostCalendar);

router.get('/calendar/events', async (req, res) => {
  try {
    await requireHostRoom(req.user._id, req.query.roomId);
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write(': connected\n\n');
    const unsubscribe = subscribeCalendarChanges(req.user._id, req.query.roomId, () => {
      res.write('event: calendar\ndata: changed\n\n');
    });
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000);
    res.on('close', () => { clearInterval(heartbeat); unsubscribe(); });
  } catch (error) {
    calendarErrorResponse(res, error);
  }
});

// Khóa dải ngày đón khách thủ công
router.post('/calendar/block', blockRoomDates);

// Mở bán lại ngày đã khóa
router.post('/calendar/unblock', unblockRoomDates);

// Duyệt nhanh đơn chờ SLA trực tiếp trên Lịch
router.post('/bookings/:id/approve', quickApproveBooking);

// Từ chối đơn đặt phòng
router.post('/bookings/:id/reject', quickRejectBooking);

export default router;

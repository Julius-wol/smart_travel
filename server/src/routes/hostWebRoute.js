import express from 'express';
import * as xlsx from 'xlsx';
import { CalendarError, listHostRooms, getHostCalendarData, blockHostDates, unblockHostDate, approveHostBooking, rejectHostBooking, calendarErrorResponse } from '../services/hostCalendarService.js';
import { getHostDashboardData, HostDashboardError } from '../services/hostDashboardService.js';
import { hostAuth } from '../middlewares/hostAuthMiddleware.js';

const router = express.Router();

/**
 * Helper: Tạo chữ viết tắt (initials) từ họ tên
 */
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'H';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ============================================================
// 1. TICKET SMART-110: VIEW DASHBOARD (HOST PORTAL)
// ============================================================
router.get(['/', '/dashboard'], hostAuth, async (req, res) => {
  try {
    const period = req.query.period || '30_DAYS';
    const roomId = req.query.roomId || 'ALL';
    const hostDoc = req.user;
    const hostUser = {
      id: String(hostDoc._id),
      name: hostDoc?.fullName || 'Chủ cơ sở',
      email: hostDoc?.email || '',
      initials: getInitials(hostDoc?.fullName || 'Chủ cơ sở'),
      phone: hostDoc?.phone || '',
      businessName: hostDoc?.hostProfile?.businessName || '',
    };
    const dashboard = await getHostDashboardData(hostDoc, period, roomId);

    res.render('host/dashboard', {
      title: 'Smart Travel - Cổng Thông Tin Đối Tác Chủ Nhà (Host Portal)',
      activeMenu: 'overview',
      user: req.user,
      hostUser,
      ...dashboard,
    });
  } catch (error) {
    if (error instanceof HostDashboardError) {
      return res.status(error.status).send(`${error.code}: ${error.message}`);
    }
    console.error('❌ Lỗi khi render Host Web Dashboard:', error);
    res.status(500).send('Lỗi khi tải trang Host Portal: ' + error.message);
  }
});

router.get('/dashboard/export', hostAuth, async (req, res) => {
  try {
    const dashboard = await getHostDashboardData(req.user, req.query.period || '30_DAYS', 'ALL');
    const summary = [{
      'Host': req.user.fullName || 'Chủ cơ sở',
      'Kỳ': dashboard.period,
      'Từ ngày': dashboard.range.start,
      'Đến ngày': dashboard.range.end,
      'Doanh thu (VNĐ)': dashboard.kpis.revenue.value,
      'Đơn mới': dashboard.kpis.newBookings.value,
      'Tỷ lệ lấp đầy (%)': dashboard.kpis.occupancyRate.value,
      'Điểm đánh giá': dashboard.kpis.avgRating.value,
    }];
    const bookings = dashboard.reportBookings.map(booking => ({
      'Mã đơn': booking.bookingCode || '',
      'Phòng': booking.roomId?.title || '',
      'Trạng thái': booking.status || '',
      'Ngày tạo': booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
      'Nhận phòng': booking.checkIn ? new Date(booking.checkIn).toISOString() : '',
      'Trả phòng': booking.checkOut ? new Date(booking.checkOut).toISOString() : '',
      'Tổng tiền (VNĐ)': Number(booking.totalPrice || 0),
      'Thanh toán': booking.paymentStatus || '',
    }));
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(summary), 'Tổng quan');
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(bookings), 'Đơn trong kỳ');
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `SmartTravel_Dashboard_${dashboard.period}_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    if (error instanceof HostDashboardError) {
      return res.status(error.status).json({ success: false, code: error.code, message: error.message });
    }
    console.error('Lỗi xuất báo cáo Dashboard:', error);
    return res.status(500).json({ success: false, message: 'Không thể xuất báo cáo Dashboard.' });
  }
});

// Calendar uses the same availability service as the Host REST API.
router.get('/calendar', async (req, res) => {
  try {
    const rooms = await listHostRooms(req.user._id);
    const requestedRoomId = req.query.roomId;
    const selectedRoom = requestedRoomId
      ? rooms.find(room => String(room._id) === requestedRoomId)
      : rooms[0];
    if (requestedRoomId && !selectedRoom) {
      return res.status(403).send('AUTH-403: Bạn không có quyền xem lịch phòng này.');
    }

    const now = new Date();
    const currentMonth = req.query.month === undefined ? now.getMonth() + 1 : Number(req.query.month);
    const currentYear = req.query.year === undefined ? now.getFullYear() : Number(req.query.year);
    const calendar = selectedRoom
      ? await getHostCalendarData(req.user._id, selectedRoom._id, currentMonth, currentYear)
      : { days: [], kpi: { occupancyRate: 0, soldNights: 0, availableNights: 0, estimatedRevenue: 0 }, empty: true };
    const offsetDays = (new Date(Date.UTC(currentYear, currentMonth - 1, 1)).getUTCDay() + 6) % 7;
    return res.render('host/calendar', {
      title: 'Lịch phòng & Giá - Smart Travel Host',
      user: req.user,
      rooms,
      selectedRoom,
      currentMonth,
      currentYear,
      kpi: calendar.kpi,
      calendarDays: calendar.days,
      offsetDays,
      empty: calendar.empty,
    });
  } catch (error) {
    if (error instanceof CalendarError) return res.status(error.status).send(`${error.code}: ${error.message}`);
    console.error('Lỗi khi tải lịch Host:', error);
    return res.status(500).send('Không thể tải lịch phòng.');
  }
});

router.post('/calendar/block', async (req, res) => {
  try {
    const data = await blockHostDates(req.user._id, req.body);
    return res.json({ success: true, code: 'CAL-BLOCK-SUCCESS', message: 'Đã khóa phòng thành công.', data });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
});

router.post('/calendar/unblock', async (req, res) => {
  try {
    const data = await unblockHostDate(req.user._id, { roomId: req.body.roomId, date: req.body.targetDate || req.body.date });
    return res.json({ success: true, code: 'CAL-UNBLOCK-SUCCESS', message: 'Đã mở bán lại ngày phòng.', data });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
});

router.post('/calendar/approve', async (req, res) => {
  try {
    const booking = await approveHostBooking(req.user._id, req.body.bookingId);
    return res.json({ success: true, code: 'BOOK-APPROVE-SUCCESS', message: `Đã duyệt đơn ${booking.bookingCode}.`, data: booking });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
});

router.post('/calendar/reject', async (req, res) => {
  try {
    const booking = await rejectHostBooking(req.user._id, req.body.bookingId, req.body.rejectReason);
    return res.json({ success: true, code: 'BOOK-REJECT-SUCCESS', message: `Đã từ chối đơn ${booking.bookingCode}.`, data: booking });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
});

export default router;

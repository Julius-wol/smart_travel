import {
  CalendarError,
  listHostRooms,
  getHostCalendarData,
  blockHostDates,
  unblockHostDate,
  approveHostBooking,
  rejectHostBooking,
  calendarErrorResponse,
} from '../services/hostCalendarService.js';

export const getHostRooms = async (req, res) => {
  try {
    const rooms = await listHostRooms(req.user._id);
    return res.json({ success: true, data: rooms });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
};

export const getHostCalendar = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) throw new CalendarError(400, 'EMPTY-ROOM-CAL', 'Vui lòng chọn phòng.');
    const now = new Date();
    const data = await getHostCalendarData(
      req.user._id, roomId, req.query.month ?? now.getMonth() + 1, req.query.year ?? now.getFullYear(),
    );
    return res.json({ success: true, data });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
};

export const blockRoomDates = async (req, res) => {
  try {
    const data = await blockHostDates(req.user._id, req.body);
    return res.json({ success: true, code: 'CAL-BLOCK-SUCCESS', message: 'Đã khóa phòng thành công.', data });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
};

export const unblockRoomDates = async (req, res) => {
  try {
    const data = await unblockHostDate(req.user._id, {
      roomId: req.body.roomId, date: req.body.date || req.body.targetDate,
    });
    return res.json({ success: true, code: 'CAL-UNBLOCK-SUCCESS', message: 'Đã mở bán lại ngày phòng.', data });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
};

export const quickApproveBooking = async (req, res) => {
  try {
    const booking = await approveHostBooking(req.user._id, req.params.id);
    return res.json({ success: true, code: 'BOOK-APPROVE-SUCCESS', message: `Đã duyệt đơn ${booking.bookingCode}.`, data: booking });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
};

export const quickRejectBooking = async (req, res) => {
  try {
    const booking = await rejectHostBooking(req.user._id, req.params.id, req.body.rejectReason);
    return res.json({ success: true, code: 'BOOK-REJECT-SUCCESS', message: `Đã từ chối đơn ${booking.bookingCode}.`, data: booking });
  } catch (error) {
    return calendarErrorResponse(res, error);
  }
};

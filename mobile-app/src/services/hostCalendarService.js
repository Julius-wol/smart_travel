import api from './api';

let hostToken = null;
export const setHostCalendarToken = (token) => { hostToken = token || null; };
const auth = () => ({ headers: hostToken ? { Authorization: `Bearer ${hostToken}` } : {} });

/**
 * Lấy danh sách các phòng thuộc sở hữu của Host
 */
export const getHostRoomsApi = async () => {
  return await api.get('/host/rooms', auth());
};

/**
 * Lấy ma trận lịch tháng và 4 chỉ số KPI tổng hợp
 */
export const getHostCalendarApi = async (roomId, month, year) => {
  let url = `/host/calendar?roomId=${encodeURIComponent(roomId)}`;
  if (month) url += `&month=${month}`;
  if (year) url += `&year=${year}`;
  return await api.get(url, auth());
};

/**
 * Khóa dải ngày đón khách thủ công
 */
export const blockRoomDatesApi = async (data) => {
  return await api.post('/host/calendar/block', data, auth());
};

/**
 * Mở bán lại ngày đã bị khóa
 */
export const unblockRoomDatesApi = async (data) => {
  return await api.post('/host/calendar/unblock', data, auth());
};

/**
 * Duyệt nhanh đơn đặt phòng đang chờ SLA
 */
export const quickApproveBookingApi = async (bookingId) => {
  return await api.post(`/host/bookings/${bookingId}/approve`, {}, auth());
};

/**
 * Từ chối đơn đặt phòng đang chờ SLA
 */
export const quickRejectBookingApi = async (bookingId, rejectReason) => {
  return await api.post(`/host/bookings/${bookingId}/reject`, { rejectReason }, auth());
};

import api from './api';

/**
 * Lấy danh sách các phòng thuộc sở hữu của Host
 */
export const getHostRoomsApi = async (ownerId) => {
  const url = ownerId ? `/api/host/rooms?ownerId=${ownerId}` : '/api/host/rooms';
  return await api.get(url);
};

/**
 * Lấy ma trận lịch tháng và 4 chỉ số KPI tổng hợp
 */
export const getHostCalendarApi = async (roomId, month, year) => {
  let url = `/api/host/calendar?roomId=${roomId}`;
  if (month) url += `&month=${month}`;
  if (year) url += `&year=${year}`;
  return await api.get(url);
};

/**
 * Khóa dải ngày đón khách thủ công
 */
export const blockRoomDatesApi = async (data) => {
  return await api.post('/api/host/calendar/block', data);
};

/**
 * Mở bán lại ngày đã bị khóa
 */
export const unblockRoomDatesApi = async (data) => {
  return await api.post('/api/host/calendar/unblock', data);
};

/**
 * Duyệt nhanh đơn đặt phòng đang chờ SLA
 */
export const quickApproveBookingApi = async (bookingId) => {
  return await api.post(`/api/host/bookings/${bookingId}/approve`);
};

/**
 * Từ chối đơn đặt phòng đang chờ SLA
 */
export const quickRejectBookingApi = async (bookingId, rejectReason) => {
  return await api.post(`/api/host/bookings/${bookingId}/reject`, { rejectReason });
};

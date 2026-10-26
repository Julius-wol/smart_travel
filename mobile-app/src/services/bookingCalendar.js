import { API_URL } from '../utils/config';

// Uses the same base URL as checkout. Abort on modal close and time out on a
// stalled server so unknown availability is never displayed as an empty room.
export const loadBookingCalendar = async (roomId, signal) => {
  const response = await fetch(`${API_URL}/bookings/calendar?roomId=${encodeURIComponent(roomId)}`, { signal });
  const body = await response.json();
  if (!response.ok || !body.success || body.data?.roomId !== roomId || !Array.isArray(body.data?.bookedRanges)) {
    throw new Error(body.message || 'Chưa tải được lịch phòng.');
  }
  const validDay = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!body.data.bookedRanges.every((range) => validDay(range?.checkIn) && validDay(range?.checkOut) && range.checkOut > range.checkIn)) {
    throw new Error('Dữ liệu lịch phòng không hợp lệ.');
  }
  return body.data.bookedRanges;
};

export const overlapsBooking = (checkIn, checkOut, ranges) =>
  !!checkIn && !!checkOut && ranges.some((range) => checkIn < range.checkOut && checkOut > range.checkIn);

export const isBookedNight = (day, ranges) => ranges.some((range) => day >= range.checkIn && day < range.checkOut);

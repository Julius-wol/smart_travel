import mongoose from 'mongoose';
import Booking from '../models/Booking.js';

export const GUEST_BOOKING_CONFLICT = {
  success: false,
  available: false,
  conflict: true,
  code: 'GUEST_BOOKING_CONFLICT',
  message: 'Bạn đã có đơn đặt phòng trong khoảng thời gian này. Mỗi khách chỉ được đặt một phòng tại cùng thời điểm. Vui lòng chọn thời gian khác.',
};

export const validStayDates = (start, end) => Number.isFinite(start.getTime())
  && Number.isFinite(end.getTime()) && start < end;

export const findGuestBookingConflict = async ({ userId, emails = [] }, start, end) => {
  const identity = [];
  if (userId && mongoose.isValidObjectId(userId)) identity.push({ userId });
  for (const email of new Set(emails.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim().toLowerCase()))) {
    const pattern = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    identity.push({ email: pattern }, { 'guestContact.email': pattern }, { 'guestInfo.email': pattern });
  }
  if (!identity.length) return null;
  return Booking.findOne({
    $or: identity,
    status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  });
};

import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

// Booking days belong to the property's timezone, independent of server timezone.
const calendarDay = (value) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((entry) => entry.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

export const getBookingCalendar = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { roomId } = req.query;
  if (typeof roomId !== 'string' || !mongoose.isValidObjectId(roomId)) {
    return res.status(400).json({ success: false, message: 'Mã phòng không hợp lệ.' });
  }
  try {
    if (!await Room.exists({ _id: roomId })) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }
    const bookings = await Booking.find({
      roomId,
      status: { $nin: ['REJECTED', 'CANCELLED'] },
      checkOut: { $gt: new Date() },
    }).select('checkIn checkOut -_id').sort({ checkIn: 1 }).lean();
    return res.json({
      success: true,
      data: {
        roomId,
        timeZone: 'Asia/Ho_Chi_Minh',
        bookedRanges: bookings.map((booking) => ({
          checkIn: calendarDay(booking.checkIn),
          checkOut: calendarDay(booking.checkOut),
        })),
      },
    });
  } catch {
    return res.status(503).json({ success: false, message: 'Chưa tải được lịch phòng. Vui lòng thử lại.' });
  }
};

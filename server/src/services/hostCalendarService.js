import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import RoomAvailability from '../models/RoomAvailability.js';
import RoomBlock from '../models/RoomBlock.js';
import { publishCalendarChange } from './calendarEvents.js';

export class CalendarError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const REASONS = {
  MAINTENANCE: 'Sửa chữa / Bảo trì định kỳ',
  EXTERNAL_GUEST: 'Giữ chỗ cho khách đặt ngoài hệ thống',
  HOLIDAY_PERSONAL: 'Nghỉ lễ / Gia đình sử dụng',
  OTHER: 'Khác',
};
const AVAILABILITY_REASONS = {
  MAINTENANCE: 'MAINTENANCE',
  EXTERNAL_GUEST: 'EXTERNAL_BOOKING',
  HOLIDAY_PERSONAL: 'PERSONAL_USE',
  OTHER: 'OTHER',
};
const ACTIVE_BOOKINGS = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED'];
const SOLD_BOOKINGS = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

export const dayKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(date));
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};

const todayKey = () => dayKey(new Date());

const parseDay = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || dayKey(date) !== value ? null : date;
};

const addDays = (date, count) => new Date(date.getTime() + count * 86400000);
const localMidnight = (date) => new Date(`${dayKey(date)}T00:00:00.000+07:00`);

const monthRange = (month, year) => {
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y) || y < 2000 || y > 2100) {
    throw new CalendarError(400, 'CAL-DATE-INVALID', 'Tháng hoặc năm không hợp lệ.');
  }
  return {
    month: m,
    year: y,
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
};

export const isCalendarReadyRoom = (room) =>
  Number(room?.pricePerNight) > 0 && ['Published', 'PUBLISHED', 'ACTIVE'].includes(room?.status);

export const listHostRooms = async (hostId) => {
  const rooms = await Room.find({ ownerId: hostId }).sort({ createdAt: -1 }).lean();
  return rooms.sort((a, b) => Number(isCalendarReadyRoom(b)) - Number(isCalendarReadyRoom(a)));
};

export const requireHostRoom = async (hostId, roomId) => {
  if (!mongoose.isValidObjectId(roomId)) {
    throw new CalendarError(404, 'EMPTY-ROOM-CAL', 'Không tìm thấy phòng.');
  }
  const room = await Room.findById(roomId);
  if (!room) throw new CalendarError(404, 'EMPTY-ROOM-CAL', 'Không tìm thấy phòng.');
  if (String(room.ownerId) !== String(hostId)) {
    throw new CalendarError(403, 'AUTH-403', 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.');
  }
  return room;
};

const bookingNights = (booking) => {
  const span = Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000);
  return Math.max(1, Number(booking.totalNights || booking.nights || span || 1));
};

export const getHostCalendarData = async (hostId, roomId, month, year) => {
  const room = await requireHostRoom(hostId, roomId);
  const range = monthRange(month, year);
  const roomData = {
    _id: room._id, title: room.title, code: room.roomCode || room.code,
    specs: room.specs?.bedroom || `${room.bedrooms || 1} phòng ngủ`,
    pricePerNight: room.pricePerNight,
    weekendPricePerNight: room.weekendPricePerNight ?? room.weekendPrice,
    status: room.status,
  };
  const emptyKpi = { occupancyRate: 0, soldNights: 0, availableNights: 0, estimatedRevenue: 0 };
  if (!isCalendarReadyRoom(room)) {
    return { room: roomData, month: range.month, year: range.year, days: [], kpi: emptyKpi, empty: true };
  }

  const [bookings, availability, legacyBlocks] = await Promise.all([
    Booking.find({ roomId: room._id, status: { $in: ACTIVE_BOOKINGS }, checkIn: { $lt: range.end }, checkOut: { $gt: range.start } })
      .populate('userId', 'fullName phone email').lean(),
    RoomAvailability.find({ roomId: room._id, date: { $gte: range.start, $lt: range.end } }).lean(),
    RoomBlock.find({ roomId: room._id, startDate: { $lt: range.end }, endDate: { $gte: range.start } }).lean(),
  ]);

  const availabilityByDay = new Map(availability.map(item => [dayKey(item.date), item]));
  const days = [];
  let soldNights = 0;
  let blockedNights = 0;
  let availableNights = 0;
  let estimatedRevenue = 0;
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  for (let date = range.start; date < range.end; date = addDays(date, 1)) {
    const key = dayKey(date);
    const dayOfWeek = date.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek >= 5;
    const nightlyPrice = availabilityByDay.get(key)?.customPrice ?? (isWeekend
      ? (room.weekendPricePerNight ?? room.weekendPrice ?? Math.round(room.pricePerNight * 1.12))
      : room.pricePerNight);
    const matchedBookings = bookings.filter(item => key >= dayKey(item.checkIn) && key < dayKey(item.checkOut));
    const booking = matchedBookings.find(item => SOLD_BOOKINGS.includes(item.status)) || matchedBookings[0];
    const availabilityDay = availabilityByDay.get(key);
    const legacyBlock = legacyBlocks.find(item => key >= dayKey(item.startDate) && key <= dayKey(item.endDate));
    let status = 'AVAILABLE';
    let bookingData = null;
    let blockData = null;

    if (booking) {
      status = SOLD_BOOKINGS.includes(booking.status) ? 'BOOKED' : 'PENDING';
      if (status === 'BOOKED') {
        soldNights++;
        estimatedRevenue += Number(booking.totalPrice || 0) / bookingNights(booking);
      }
      bookingData = {
        id: String(booking._id), bookingCode: booking.bookingCode,
        customerName: booking.guestContact?.fullName || booking.fullName || booking.guestInfo?.fullName || booking.userId?.fullName || 'Khách đặt phòng',
        phoneNumber: booking.guestContact?.phone || booking.phoneNumber || booking.guestInfo?.phoneNumber || booking.userId?.phone || '',
        checkIn: dayKey(booking.checkIn), checkOut: dayKey(booking.checkOut),
        nights: bookingNights(booking), guestCount: booking.guests || booking.guestDetails?.adults || 2,
        totalAmount: booking.totalPrice, guestNote: booking.guestContact?.guestNote || booking.notes || booking.specialNote || '',
      };
    } else if (availabilityDay?.status === 'BLOCKED' || legacyBlock) {
      status = 'BLOCKED';
      blockedNights++;
      const reason = legacyBlock?.reason || Object.keys(AVAILABILITY_REASONS).find(item => AVAILABILITY_REASONS[item] === availabilityDay?.blockReason) || 'OTHER';
      blockData = {
        id: String(legacyBlock?._id || availabilityDay?._id || ''), reason,
        reasonLabel: legacyBlock?.reasonLabel || REASONS[reason],
        internalNote: legacyBlock?.internalNote || availabilityDay?.blockNote || '',
      };
    } else if (availabilityDay?.status === 'BOOKED') {
      status = 'BOOKED';
      soldNights++;
    } else {
      availableNights++;
    }

    days.push({
      date: key, dayOfMonth: date.getUTCDate(), dayOfWeek: weekdays[dayOfWeek],
      isWeekend, isSaturday: dayOfWeek === 6, isSunday: dayOfWeek === 0,
      isPast: key < todayKey(), price: nightlyPrice, status, booking: bookingData, block: blockData,
    });
  }

  const capacity = days.length - blockedNights;
  return {
    room: roomData, month: range.month, year: range.year, days,
    kpi: { occupancyRate: capacity ? Math.round(soldNights / capacity * 100) : 0,
      soldNights, availableNights, estimatedRevenue: Math.round(estimatedRevenue) },
    empty: false,
  };
};

export const blockHostDates = async (hostId, { roomId, startDate, endDate, reason, internalNote }) => {
  const room = await requireHostRoom(hostId, roomId);
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  if (!start || !end || start > end || (end - start) / 86400000 > 90) {
    throw new CalendarError(400, 'CAL-DATE-INVALID', 'Khoảng ngày khóa không hợp lệ.');
  }
  if (startDate < todayKey()) throw new CalendarError(400, 'CAL-NAV-PAST', 'Không thể khóa ngày trong quá khứ.');
  if (!REASONS[reason]) throw new CalendarError(400, 'CAL-BLOCK-REASON-REQ', 'Vui lòng chọn lý do khóa lịch phòng.');
  if (!isCalendarReadyRoom(room)) {
    throw new CalendarError(409, 'EMPTY-ROOM-CAL', 'Phòng chưa mở bán.');
  }

  const endExclusive = addDays(end, 1);
  const firstOccupiedNight = localMidnight(addDays(start, 1));
  const endOfRange = localMidnight(endExclusive);
  const [booking, unavailable, legacyBlock] = await Promise.all([
    Booking.findOne({
      roomId,
      status: { $in: ACTIVE_BOOKINGS },
      checkIn: { $lt: endOfRange },
      checkOut: { $gte: firstOccupiedNight },
    }),
    RoomAvailability.findOne({ roomId, date: { $gte: start, $lt: endExclusive }, status: { $in: ['BOOKED', 'BLOCKED', 'PENDING'] } }),
    RoomBlock.findOne({ roomId, startDate: { $lt: endExclusive }, endDate: { $gte: start } }),
  ]);
  if (booking || unavailable || legacyBlock) {
    throw new CalendarError(409, 'CAL-BLOCK-CONFLICT', 'Khoảng ngày này đã có đơn đặt phòng hoặc đã bị khóa.');
  }

  const days = [];
  for (let date = start; date <= end; date = addDays(date, 1)) days.push(new Date(date));
  const changed = [];
  try {
    for (const date of days) {
      const existing = await RoomAvailability.findOne({ roomId, date });
      const result = await RoomAvailability.findOneAndUpdate(
        { roomId, date, status: { $nin: ['BOOKED', 'BLOCKED', 'PENDING'] } },
        { $set: { status: 'BLOCKED', blockReason: AVAILABILITY_REASONS[reason], blockNote: String(internalNote || '').slice(0, 100) } },
        { upsert: true, new: true },
      );
      changed.push({ id: result._id, existed: !!existing });
    }
  } catch (error) {
    for (const item of changed.reverse()) {
      if (item.existed) await RoomAvailability.updateOne({ _id: item.id, status: 'BLOCKED' }, {
        $set: { status: 'AVAILABLE' }, $unset: { blockReason: '', blockNote: '' },
      });
      else await RoomAvailability.deleteOne({ _id: item.id, status: 'BLOCKED' });
    }
    if (error.code === 11000) throw new CalendarError(409, 'CAL-BLOCK-CONFLICT', 'Lịch vừa thay đổi. Vui lòng tải lại và thử lại.');
    throw error;
  }
  publishCalendarChange(hostId, roomId);
  return { roomId, startDate, endDate, reason, internalNote: String(internalNote || '').slice(0, 100) };
};

export const unblockHostDate = async (hostId, { roomId, date }) => {
  await requireHostRoom(hostId, roomId);
  const target = parseDay(date);
  if (!target) throw new CalendarError(400, 'CAL-DATE-INVALID', 'Ngày mở khóa không hợp lệ.');
  if (date < todayKey()) throw new CalendarError(400, 'CAL-NAV-PAST', 'Không thể mở ngày trong quá khứ.');

  const availability = await RoomAvailability.findOne({ roomId, date: target, status: 'BLOCKED' });
  const legacy = await RoomBlock.find({ roomId, startDate: { $lte: target }, endDate: { $gte: target } });
  if (!availability && !legacy.length) throw new CalendarError(404, 'CAL-BLOCK-NOT-FOUND', 'Ngày này không còn bị khóa.');

  if (availability) await RoomAvailability.updateOne({ _id: availability._id, status: 'BLOCKED' }, {
    $set: { status: 'AVAILABLE' }, $unset: { blockReason: '', blockNote: '' },
  });
  for (const block of legacy) {
    const first = parseDay(dayKey(block.startDate));
    const last = parseDay(dayKey(block.endDate));
    await RoomBlock.deleteOne({ _id: block._id });
    if (first < target) await RoomBlock.create({
      roomId, startDate: first, endDate: new Date(target.getTime() - 7 * 3600000 - 1),
      reason: block.reason, reasonLabel: block.reasonLabel, internalNote: block.internalNote, createdBy: block.createdBy,
    });
    if (last > target) await RoomBlock.create({
      roomId, startDate: addDays(target, 1), endDate: new Date(addDays(last, 1).getTime() - 7 * 3600000 - 1),
      reason: block.reason, reasonLabel: block.reasonLabel, internalNote: block.internalNote, createdBy: block.createdBy,
    });
  }
  publishCalendarChange(hostId, roomId);
  return { roomId, date };
};

export const approveHostBooking = async (hostId, bookingId) => {
  if (!mongoose.isValidObjectId(bookingId)) throw new CalendarError(404, 'BOOK-NOT-FOUND', 'Không tìm thấy đơn đặt phòng.');
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new CalendarError(404, 'BOOK-NOT-FOUND', 'Không tìm thấy đơn đặt phòng.');
  await requireHostRoom(hostId, booking.roomId);
  if (booking.status !== 'PENDING') throw new CalendarError(409, 'BOOK-STATUS-CONFLICT', 'Đơn không còn ở trạng thái chờ duyệt.');
  if (booking.slaDeadline && booking.slaDeadline < new Date()) throw new CalendarError(409, 'BOOK-STATUS-CONFLICT', 'Đơn đã quá hạn duyệt.');
  const conflict = await Booking.findOne({
    _id: { $ne: booking._id }, roomId: booking.roomId, status: { $in: SOLD_BOOKINGS },
    checkIn: { $lt: booking.checkOut }, checkOut: { $gt: booking.checkIn },
  });
  if (conflict) throw new CalendarError(409, 'CAL-BLOCK-CONFLICT', 'Khoảng ngày đã có đơn xác nhận khác.');
  booking.status = 'CONFIRMED';
  await booking.save();
  publishCalendarChange(hostId, booking.roomId);
  return booking;
};

export const rejectHostBooking = async (hostId, bookingId, rejectReason) => {
  if (!mongoose.isValidObjectId(bookingId)) throw new CalendarError(404, 'BOOK-NOT-FOUND', 'Không tìm thấy đơn đặt phòng.');
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new CalendarError(404, 'BOOK-NOT-FOUND', 'Không tìm thấy đơn đặt phòng.');
  await requireHostRoom(hostId, booking.roomId);
  if (booking.status !== 'PENDING') throw new CalendarError(409, 'BOOK-STATUS-CONFLICT', 'Đơn không còn ở trạng thái chờ duyệt.');
  if (!String(rejectReason || '').trim()) throw new CalendarError(400, 'BOOK-REJECT-REASON-REQ', 'Vui lòng nhập lý do từ chối.');
  if (booking.paymentStatus === 'PAID') {
    throw new CalendarError(501, 'BOOK-REFUND-NOT-CONFIGURED', 'Đơn đã thanh toán cần được xử lý qua quy trình hoàn tiền.');
  }
  booking.status = 'REJECTED';
  booking.rejectReason = String(rejectReason).trim();
  await booking.save();
  await RoomAvailability.deleteMany({ roomId: booking.roomId, bookingId: booking._id, status: 'BOOKED' });
  publishCalendarChange(hostId, booking.roomId);
  return booking;
};

export const calendarErrorResponse = (res, error) => res.status(error instanceof CalendarError ? error.status : 500).json({
  success: false, code: error instanceof CalendarError ? error.code : 'CAL-SERVER-ERROR',
  message: error instanceof CalendarError ? error.message : 'Không thể xử lý lịch phòng.',
});

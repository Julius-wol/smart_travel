import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import RoomAvailability from '../models/RoomAvailability.js';
import RoomBlock from '../models/RoomBlock.js';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const REVENUE_STATUSES = new Set(['CONFIRMED', 'COMPLETED']);
const OCCUPIED_STATUSES = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];
const SCHEDULE_STATUSES = new Set(['CONFIRMED', 'CHECKED_IN']);
const PERIODS = new Set(['TODAY', '7_DAYS', '30_DAYS', 'THIS_MONTH', 'LAST_MONTH']);
const ACTIVE_ROOM_STATUSES = new Set(['Published', 'PUBLISHED', 'ACTIVE']);

const dayKey = value => {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const result = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${result.year}-${result.month}-${result.day}`;
};

const shiftDay = (key, amount) => {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const localMidnight = key => new Date(`${key}T00:00:00.000+07:00`);

const periodRange = (period, now) => {
  const today = dayKey(now);
  let start;
  let end = today;
  switch (period) {
    case 'TODAY':
      start = today;
      break;
    case '7_DAYS':
      start = shiftDay(today, -6);
      break;
    case 'THIS_MONTH':
      start = `${today.slice(0, 7)}-01`;
      break;
    case 'LAST_MONTH': {
      const currentMonthStart = `${today.slice(0, 7)}-01`;
      end = shiftDay(currentMonthStart, -1);
      start = `${end.slice(0, 7)}-01`;
      break;
    }
    case '30_DAYS':
    default:
      start = shiftDay(today, -29);
      break;
  }

  const dayKeys = [];
  for (let date = start; date <= end; date = shiftDay(date, 1)) dayKeys.push(date);
  return {
    start,
    end,
    endExclusive: shiftDay(end, 1),
    startDate: localMidnight(start),
    endDate: localMidnight(shiftDay(end, 1)),
    dayKeys,
  };
};

const getInitials = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.slice(0, 2) || 'H').toUpperCase();
};

const maskPhoneNumber = phone => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return 'Chưa có SĐT';
  return `${digits.slice(0, 4)}${'*'.repeat(Math.max(0, digits.length - 4))}`;
};

const bookingName = booking =>
  booking.guestContact?.fullName ||
  booking.guestInfo?.fullName ||
  booking.fullName ||
  booking.userId?.fullName ||
  'Khách lưu trú';

const bookingPhone = booking =>
  booking.guestContact?.phone ||
  booking.guestInfo?.phoneNumber ||
  booking.phoneNumber ||
  booking.userId?.phone ||
  '';

const bookingNote = booking =>
  booking.specialRequests ||
  booking.specialNote ||
  booking.notes ||
  booking.guestContact?.guestNote ||
  '';

const getBookingDeadline = booking => {
  if (booking.slaDeadline) return new Date(booking.slaDeadline);
  return new Date(new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000);
};

const countNightsInRange = (booking, range) => {
  const checkIn = dayKey(booking.checkIn);
  const checkOut = dayKey(booking.checkOut);
  const start = checkIn > range.start ? checkIn : range.start;
  const end = checkOut < range.endExclusive ? checkOut : range.endExclusive;
  let nights = 0;
  for (let date = start; date < end; date = shiftDay(date, 1)) nights++;
  return nights;
};

const addBlockedDays = (blockedDays, roomId, start, end, range) => {
  const first = dayKey(start);
  const last = dayKey(end);
  if (!first || !last || last < range.start || first >= range.endExclusive) return;
  const clippedFirst = first < range.start ? range.start : first;
  const clippedLast = last >= range.endExclusive ? shiftDay(range.endExclusive, -1) : last;
  for (let date = clippedFirst; date <= clippedLast; date = shiftDay(date, 1)) {
    blockedDays.add(`${roomId}:${date}`);
  }
};

export class HostDashboardError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const getHostDashboardData = async (host, requestedPeriod, requestedRoomId, now = new Date()) => {
  const period = PERIODS.has(requestedPeriod) ? requestedPeriod : '30_DAYS';
  const range = periodRange(period, now);
  const hostRooms = await Room.find({ ownerId: host._id }).lean();
  const hostRoomIds = hostRooms.map(room => room._id);
  let chartRoomId = 'ALL';

  if (requestedRoomId && requestedRoomId !== 'ALL') {
    if (!mongoose.isValidObjectId(requestedRoomId)) {
      throw new HostDashboardError(403, 'AUTH-403', 'Bạn không có quyền xem dữ liệu phòng này.');
    }
    const selectedRoom = hostRooms.find(room => String(room._id) === requestedRoomId);
    if (!selectedRoom) {
      throw new HostDashboardError(403, 'AUTH-403', 'Bạn không có quyền xem dữ liệu phòng này.');
    }
    chartRoomId = String(selectedRoom._id);
  }

  const roomQuery = { roomId: { $in: hostRoomIds } };
  const [allBookings, ratingReviews, recentReviews, pendingBookings] = await Promise.all([
    Booking.find(roomQuery)
      .populate('roomId', 'title name pricePerNight roomCode city images')
      .populate('userId', 'fullName email phone avatar')
      .sort({ createdAt: -1 })
      .lean(),
    Review.find(roomQuery).select('rating').lean(),
    Review.find(roomQuery)
      .populate('roomId', 'title name roomCode')
      .populate('userId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Booking.find({ ...roomQuery, status: 'PENDING' })
      .populate('roomId', 'title name roomCode')
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const revenueBookings = allBookings.filter(booking =>
    REVENUE_STATUSES.has(booking.status) &&
    dayKey(booking.checkIn) >= range.start &&
    dayKey(booking.checkIn) <= range.end
  );
  const createdBookings = allBookings.filter(booking => {
    const created = dayKey(booking.createdAt);
    return created >= range.start && created <= range.end;
  });
  const revenue = revenueBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  const confirmedCount = revenueBookings.length;

  const activeRooms = hostRooms.filter(room => ACTIVE_ROOM_STATUSES.has(room.status));
  const activeRoomIds = activeRooms.map(room => room._id);
  const blockedDays = new Set();
  if (activeRoomIds.length) {
    const [availability, legacyBlocks] = await Promise.all([
      RoomAvailability.find({
        roomId: { $in: activeRoomIds },
        date: { $gte: range.startDate, $lt: range.endDate },
        status: 'BLOCKED',
      }).lean(),
      RoomBlock.find({
        roomId: { $in: activeRoomIds },
        startDate: { $lt: range.endDate },
        endDate: { $gte: range.startDate },
      }).lean(),
    ]);
    availability.forEach(item => addBlockedDays(blockedDays, String(item.roomId), item.date, item.date, range));
    legacyBlocks.forEach(item => addBlockedDays(blockedDays, String(item.roomId), item.startDate, item.endDate, range));
  }

  const occupiedDays = new Set();
  allBookings
    .filter(booking => OCCUPIED_STATUSES.includes(booking.status))
    .forEach(booking => {
      const roomId = String(booking.roomId?._id || booking.roomId);
      if (!activeRooms.some(room => String(room._id) === roomId)) return;
      const checkIn = dayKey(booking.checkIn);
      const checkOut = dayKey(booking.checkOut);
      const start = checkIn > range.start ? checkIn : range.start;
      const end = checkOut < range.endExclusive ? checkOut : range.endExclusive;
      for (let date = start; date < end; date = shiftDay(date, 1)) occupiedDays.add(`${roomId}:${date}`);
    });

  const totalCapacityNights = activeRooms.length * range.dayKeys.length;
  const availableCapacityNights = Math.max(0, totalCapacityNights - blockedDays.size);
  const soldNights = occupiedDays.size;
  const occupancyRate = availableCapacityNights
    ? Math.min(100, Math.round(soldNights / availableCapacityNights * 100))
    : 0;

  const ratingCount = ratingReviews.length;
  const avgRating = ratingCount
    ? (ratingReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / ratingCount).toFixed(1)
    : '--';

  const today = dayKey(now);
  const tomorrow = shiftDay(today, 1);
  const schedule = {
    today: { dateLabel: `${Number(today.slice(8, 10))} Tháng ${Number(today.slice(5, 7))}`, checkIns: [], checkOuts: [] },
    tomorrow: { dateLabel: `${Number(tomorrow.slice(8, 10))} Tháng ${Number(tomorrow.slice(5, 7))}`, checkIns: [], checkOuts: [] },
  };
  for (const booking of allBookings) {
    if (!SCHEDULE_STATUSES.has(booking.status)) continue;
    const checkIn = dayKey(booking.checkIn);
    const checkOut = dayKey(booking.checkOut);
    const guestName = bookingName(booking);
    const guestCard = {
      bookingCode: booking.bookingCode || 'ST-XXXX',
      guestName,
      phoneMasked: maskPhoneNumber(bookingPhone(booking)),
      roomTitle: booking.roomId?.title || 'Phòng nghỉ',
      initials: getInitials(guestName),
      note: bookingNote(booking),
      status: booking.status,
    };
    if (checkIn === today) schedule.today.checkIns.push(guestCard);
    if (checkOut === today) schedule.today.checkOuts.push(guestCard);
    if (checkIn === tomorrow) schedule.tomorrow.checkIns.push(guestCard);
    if (checkOut === tomorrow) schedule.tomorrow.checkOuts.push(guestCard);
  }

  const chartBookings = chartRoomId === 'ALL'
    ? allBookings
    : allBookings.filter(booking => String(booking.roomId?._id || booking.roomId) === chartRoomId);
  const chartTimeline = range.dayKeys.map(key => {
    const dailyRevenueBookings = chartBookings.filter(booking =>
      REVENUE_STATUSES.has(booking.status) && dayKey(booking.checkIn) === key
    );
    const dailyCreatedBookings = chartBookings.filter(booking => dayKey(booking.createdAt) === key);
    const revenueValue = dailyRevenueBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const [year, month, day] = key.split('-').map(Number);
    const dayLabel = `${day}/${month}`;
    return {
      label: dayLabel,
      fullDate: `${day}/${month}/${year}`,
      revenue: revenueValue,
      bookingsCount: dailyCreatedBookings.length,
      revenueBookingsCount: dailyRevenueBookings.length,
      details: `${dailyCreatedBookings.length} đơn phát sinh`,
    };
  });
  const peak = chartTimeline.reduce((best, day) => day.revenue > best.revenue ? day : best, chartTimeline[0]);
  const chartRevenue = chartTimeline.reduce((sum, day) => sum + day.revenue, 0);
  const chartSummary = {
    dailyAverageFormatted: `${new Intl.NumberFormat('vi-VN').format(Math.round(chartRevenue / range.dayKeys.length))} đ`,
    peakRevenueFormatted: `${new Intl.NumberFormat('vi-VN').format(peak?.revenue || 0)} đ`,
    peakDate: peak?.label || '',
  };

  const pendingWithDeadlines = pendingBookings.map(booking => ({
    booking,
    deadline: getBookingDeadline(booking),
  })).sort((a, b) => a.deadline - b.deadline);
  const mostUrgent = pendingWithDeadlines[0];
  const hoursRemaining = mostUrgent
    ? Math.ceil((mostUrgent.deadline.getTime() - now.getTime()) / (60 * 60 * 1000))
    : 0;
  const urgentBookingCode = mostUrgent?.booking.bookingCode || '';
  const slaMessage = !mostUrgent
    ? 'Hiện không có đơn chờ duyệt.'
    : hoursRemaining > 0
      ? `Bạn có ${pendingBookings.length} đơn chờ duyệt, trong đó ${urgentBookingCode} sẽ hết hạn sau ${hoursRemaining} giờ.`
      : `Bạn có ${pendingBookings.length} đơn chờ duyệt; đơn ${urgentBookingCode} đã quá hạn phản hồi.`;

  const hasPeriodActivity = createdBookings.length > 0 || revenueBookings.length > 0;
  return {
    period,
    range,
    chartRoomId,
    hostRooms,
    isNewHost: hostRooms.length === 0 && allBookings.length === 0 && ratingCount === 0,
    hasPeriodActivity,
    chartTimeline,
    chartSummary,
    recentReviews,
    reportBookings: createdBookings,
    slaAlert: {
      hasPending: pendingBookings.length > 0,
      pendingCount: pendingBookings.length,
      urgentBookingCode,
      urgentExpireHours: Math.max(0, hoursRemaining),
      message: slaMessage,
    },
    schedule,
    kpis: {
      revenue: {
        value: revenue,
        formatted: `${(revenue / 1000000).toFixed(1)} M VND`,
        subtext: `${confirmedCount} đơn đủ điều kiện trong kỳ`,
      },
      newBookings: {
        value: createdBookings.length,
        subtext: 'Bao gồm mọi trạng thái trong kỳ',
      },
      occupancyRate: {
        value: occupancyRate,
        subtext: `${soldNights}/${availableCapacityNights} đêm khả dụng`,
      },
      avgRating: {
        value: avgRating,
        subtext: ratingCount ? `Từ ${ratingCount} lượt nhận xét` : 'Chưa có đánh giá',
      },
    },
  };
};

export const formatDashboardPhone = maskPhoneNumber;

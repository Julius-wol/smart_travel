const statusLabels = {
  PENDING: 'CHỜ DUYỆT', CONFIRMED: 'ĐÃ XÁC NHẬN', CHECKED_IN: 'ĐANG LƯU TRÚ',
  COMPLETED: 'ĐÃ HOÀN THÀNH', CANCELLED: 'ĐÃ HỦY', REJECTED: 'ĐÃ TỪ CHỐI', EXPIRED: 'ĐÃ HẾT HẠN',
};

export const formatBookingHistory = (bookings) => bookings.map((booking) => {
  const room = typeof booking.roomId === 'object' ? booking.roomId : null;
  const start = new Date(booking.checkIn);
  const end = new Date(booking.checkOut);
  const date = (value) => Number.isFinite(value.getTime()) ? value.toLocaleDateString('vi-VN') : '';
  return {
    id: booking._id,
    roomId: room?._id || booking.roomId,
    bookingCode: booking.bookingCode || '',
    title: room?.title || room?.name || 'Phòng không còn khả dụng',
    subtitle: room?.subtitle || '',
    thumbnail: room?.images?.[0],
    location: room?.location?.city || room?.city || room?.address || '',
    checkIn: date(start), checkOut: date(end),
    checkInTime: start.getTime(), checkOutTime: end.getTime(),
    dateRange: `${date(start)} - ${date(end)}`,
    nights: booking.nights ?? booking.totalNights ?? Math.max(0, Math.ceil((end - start) / 86400000)),
    guests: booking.guests ?? booking.guestDetails?.adults ?? 1,
    pricePerNight: booking.pricePerNight ?? room?.pricePerNight ?? room?.price ?? 0,
    totalAmount: `${new Intl.NumberFormat('vi-VN').format(booking.totalPrice ?? 0)}đ`,
    rating: room?.rating ?? 0, reviewCount: room?.reviewCount ?? 0,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    statusText: statusLabels[booking.status] || booking.status || '',
    roomNumber: booking.roomNumber || room?.roomCode || '',
    contact: {
      fullName: booking.guestContact?.fullName || booking.fullName || booking.guestInfo?.fullName || '',
      email: booking.guestContact?.email || booking.email || booking.guestInfo?.email || '',
      phone: booking.guestContact?.phone || booking.phoneNumber || booking.guestInfo?.phoneNumber || '',
    },
    rawRoom: room,
  };
});

const parseBookingDate = (value) => {
  if (!value) return null;
  const vietnameseDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (vietnameseDate) {
    return new Date(Number(vietnameseDate[3]), Number(vietnameseDate[2]) - 1, Number(vietnameseDate[1]), 14);
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

const parseFormattedPrice = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const digits = String(value).replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

export const recentBookingRecord = (recentBooking) => {
  const booking = recentBooking?.booking || {};
  const details = recentBooking?.bookingDetails || {};
  const bookingCode = recentBooking?.bookingCode || booking.bookingCode;
  if (!bookingCode) return null;

  const checkIn = booking.checkIn || details.checkInAt || parseBookingDate(details.checkIn);
  const checkOut = booking.checkOut || details.checkOutAt || parseBookingDate(details.checkOut);
  if (!checkIn || !checkOut) return null;

  return {
    ...booking,
    _id: booking._id || recentBooking.bookingId || `visitor-${bookingCode}`,
    bookingCode,
    roomId: recentBooking.homestay || booking.roomId || {},
    fullName: booking.fullName || details.fullName || '',
    phoneNumber: booking.phoneNumber || details.phoneNumber || '',
    email: booking.email || details.email || '',
    checkIn,
    checkOut,
    nights: booking.nights ?? details.nights ?? 1,
    guests: booking.guests ?? details.guests ?? 1,
    totalPrice: booking.totalPrice ?? parseFormattedPrice(details.totalAmount),
    status: booking.status || recentBooking.bookingStatus || 'PENDING',
    paymentStatus: booking.paymentStatus || details.paymentStatus || 'UNPAID',
  };
};

export const nextUpcomingBooking = (bookings, now = Date.now()) => bookings
  .filter(booking => ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status) && booking.checkOutTime > now)
  .sort((a, b) => a.checkInTime - b.checkInTime)[0] || null;

export const bookingNotifications = (bookings, previous = []) => bookings.map(booking => ({
  id: `booking-${booking._id}`,
  type: 'booking',
  title: `${statusLabels[booking.status] || booking.status || 'Booking'} #${booking.bookingCode || ''}`,
  message: booking.roomId?.title || '',
  time: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : '',
  read: previous.find(item => item.id === `booking-${booking._id}`)?.read ?? false,
  badgeText: statusLabels[booking.status] || '',
  badgeColor: '#E6FFFA', badgeTextColor: '#00796B', icon: 'calendar-outline', iconColor: '#00796B',
  actionType: 'view_booking', bookingCode: booking.bookingCode, rawBooking: booking,
}));

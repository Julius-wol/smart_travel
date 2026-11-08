import { formatBookingHistory, recentBookingRecord } from '../src/utils/bookingHistory';
import bookingSessionReducer, { setRecentBooking } from '../src/store/slices/bookingSessionSlice';

test('builds a visitor booking record for in-app history and e-Pass navigation', () => {
  const record = recentBookingRecord({
    bookingCode: 'ST-1234',
    bookingId: 'booking-123',
    bookingStatus: 'CONFIRMED',
    homestay: { _id: 'room-123', title: 'Ocean View Room' },
    bookingDetails: {
      fullName: 'Visitor Guest',
      email: 'visitor@example.com',
      phoneNumber: '0901234567',
      checkIn: '10/12/2026',
      checkOut: '12/12/2026',
      nights: 2,
      guests: 2,
      totalAmount: '2.000.000đ',
    },
  });

  expect(record).toMatchObject({
    _id: 'booking-123',
    bookingCode: 'ST-1234',
    status: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    totalPrice: 2000000,
  });

  const [trip] = formatBookingHistory([record]);
  expect(trip).toMatchObject({
    id: 'booking-123',
    bookingCode: 'ST-1234',
    title: 'Ocean View Room',
    checkIn: expect.any(String),
    checkOut: expect.any(String),
    statusText: 'ĐÃ XÁC NHẬN',
  });
  expect(trip.contact).toMatchObject({
    fullName: 'Visitor Guest',
    email: 'visitor@example.com',
    phone: '0901234567',
  });
});

test('ignores a recent booking without a booking code or valid stay dates', () => {
  expect(recentBookingRecord({ bookingDetails: {} })).toBeNull();
  expect(recentBookingRecord({
    bookingCode: 'ST-1234',
    bookingDetails: { checkIn: 'invalid', checkOut: 'invalid' },
  })).toBeNull();
});

test('shares the latest booking across app tabs during the active session', () => {
  const recentBooking = { bookingCode: 'ST-5678', bookingStatus: 'PENDING' };

  expect(bookingSessionReducer(undefined, setRecentBooking(recentBooking))).toEqual({
    recentBooking,
  });
});

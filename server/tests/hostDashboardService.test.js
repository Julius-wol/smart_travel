import { jest } from '@jest/globals';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import RoomBlock from '../src/models/RoomBlock.js';
import { formatDashboardPhone, getHostDashboardData } from '../src/services/hostDashboardService.js';

const hostId = '607f1f77bcf86cd799439001';
const roomA = '607f1f77bcf86cd799439003';
const roomB = '607f1f77bcf86cd799439004';
const otherRoom = '607f1f77bcf86cd799439005';
const now = new Date('2026-11-15T05:00:00.000Z');

const query = value => ({
  populate() { return this; },
  select() { return this; },
  sort() { return this; },
  limit() { return this; },
  lean: async () => value,
});

const setup = ({
  rooms = [],
  bookings = [],
  pending = [],
  ratings = [],
  recentReviews = [],
  availability = [],
  blocks = [],
} = {}) => {
  jest.spyOn(Room, 'find').mockReturnValue(query(rooms));
  jest.spyOn(Booking, 'find')
    .mockReturnValueOnce(query(bookings))
    .mockReturnValueOnce(query(pending));
  jest.spyOn(Review, 'find')
    .mockReturnValueOnce(query(ratings))
    .mockReturnValueOnce(query(recentReviews));
  jest.spyOn(RoomAvailability, 'find').mockReturnValue(query(availability));
  jest.spyOn(RoomBlock, 'find').mockReturnValue(query(blocks));
};

afterEach(() => jest.restoreAllMocks());

test('period metrics include only qualifying Host bookings and chart data follows the selected room', async () => {
  const rooms = [
    { _id: roomA, title: 'A1', status: 'Published' },
    { _id: roomB, title: 'A2', status: 'Published' },
  ];
  const bookings = [
    { roomId: { _id: roomA, title: 'A1' }, status: 'CONFIRMED', checkIn: new Date('2026-11-03T05:00:00Z'), checkOut: new Date('2026-11-04T05:00:00Z'), createdAt: new Date('2026-11-03T05:00:00Z'), totalPrice: 1000000 },
    { roomId: { _id: roomA, title: 'A1' }, status: 'COMPLETED', checkIn: new Date('2026-11-07T05:00:00Z'), checkOut: new Date('2026-11-08T05:00:00Z'), createdAt: new Date('2026-11-07T05:00:00Z'), totalPrice: 2000000 },
    { roomId: { _id: roomA, title: 'A1' }, status: 'PENDING', checkIn: new Date('2026-11-08T05:00:00Z'), checkOut: new Date('2026-11-09T05:00:00Z'), createdAt: new Date('2026-11-08T05:00:00Z'), totalPrice: 5000000 },
    { roomId: { _id: roomB, title: 'A2' }, status: 'CONFIRMED', checkIn: new Date('2026-11-10T05:00:00Z'), checkOut: new Date('2026-11-11T05:00:00Z'), createdAt: new Date('2026-10-31T05:00:00Z'), totalPrice: 4000000 },
    { roomId: { _id: roomB, title: 'A2' }, status: 'CHECKED_IN', checkIn: new Date('2026-11-11T05:00:00Z'), checkOut: new Date('2026-11-12T05:00:00Z'), createdAt: new Date('2026-11-11T05:00:00Z'), totalPrice: 99000000 },
    { roomId: { _id: roomA, title: 'A1' }, status: 'CONFIRMED', checkIn: new Date('2026-12-01T05:00:00Z'), checkOut: new Date('2026-12-02T05:00:00Z'), createdAt: new Date('2026-11-10T05:00:00Z'), totalPrice: 9000000 },
  ];
  setup({ rooms, bookings });

  const result = await getHostDashboardData({ _id: hostId }, 'THIS_MONTH', roomA, now);
  expect(result.kpis.revenue.value).toBe(7000000);
  expect(result.kpis.newBookings.value).toBe(5);
  expect(result.chartRoomId).toBe(roomA);
  expect(result.chartTimeline.reduce((sum, day) => sum + day.revenue, 0)).toBe(3000000);
  expect(result.chartTimeline).toHaveLength(15);
  expect(result.reportBookings).toHaveLength(5);
});

test('rejects a requested room outside the Host room list', async () => {
  setup({ rooms: [{ _id: roomA, status: 'Published' }] });
  await expect(getHostDashboardData({ _id: hostId }, '30_DAYS', otherRoom, now))
    .rejects.toMatchObject({ status: 403, code: 'AUTH-403' });
  expect(Booking.find).not.toHaveBeenCalled();
});

test('occupancy clips legacy blocked dates to the selected period', async () => {
  const rooms = [{ _id: roomA, status: 'Published' }];
  const bookings = [{
    roomId: { _id: roomA }, status: 'CONFIRMED',
    checkIn: new Date('2026-11-12T05:00:00Z'), checkOut: new Date('2026-11-15T05:00:00Z'),
    createdAt: new Date('2026-11-01T05:00:00Z'), totalPrice: 3000000,
  }];
  const blocks = [{
    roomId: roomA,
    startDate: new Date('2026-10-01T00:00:00+07:00'),
    endDate: new Date('2026-11-11T23:59:59+07:00'),
  }];
  setup({
    rooms,
    bookings,
    availability: [{
      roomId: roomA,
      date: new Date('2026-11-10T00:00:00+07:00'),
      status: 'BLOCKED',
    }],
    blocks,
  });

  const result = await getHostDashboardData({ _id: hostId }, '7_DAYS', 'ALL', now);
  expect(result.kpis.occupancyRate.value).toBe(75);
  expect(result.kpis.occupancyRate.subtext).toBe('3/4 đêm khả dụng');
});

test('averages all Host reviews, returns the latest three, and separates an empty Host state', async () => {
  setup({
    ratings: [5, 4, 3, 2, 1, 5, 5, 5, 4, 3].map(rating => ({ rating })),
    recentReviews: [{ _id: 'r3' }, { _id: 'r2' }, { _id: 'r1' }],
  });
  const result = await getHostDashboardData({ _id: hostId }, '30_DAYS', 'ALL', now);
  expect(result.kpis.avgRating.value).toBe('3.7');
  expect(result.recentReviews).toHaveLength(3);

  jest.restoreAllMocks();
  setup();
  const empty = await getHostDashboardData({ _id: hostId }, '30_DAYS', 'ALL', now);
  expect(empty.isNewHost).toBe(true);
  expect(empty.kpis.avgRating.value).toBe('--');
});

test('masks phone numbers after the first four digits and handles missing values', () => {
  expect(formatDashboardPhone('0912 345 678')).toBe('0912******');
  expect(formatDashboardPhone('')).toBe('Chưa có SĐT');
});

test('shows only confirmed stay schedule entries and prioritizes the nearest pending deadline', async () => {
  const rooms = [{ _id: roomA, title: 'A1', status: 'Published' }];
  const bookings = [
    {
      roomId: { _id: roomA, title: 'A1' }, status: 'CONFIRMED',
      checkIn: new Date('2026-11-15T05:00:00Z'), checkOut: new Date('2026-11-16T05:00:00Z'),
      createdAt: new Date('2026-11-01T05:00:00Z'),
      fullName: 'Guest One', phoneNumber: '0912 345 678', specialNote: 'Arrive early',
    },
    {
      roomId: { _id: roomA, title: 'A1' }, status: 'PENDING',
      checkIn: new Date('2026-11-15T05:00:00Z'), checkOut: new Date('2026-11-16T05:00:00Z'),
      createdAt: new Date('2026-11-01T05:00:00Z'),
    },
  ];
  const pending = [
    { bookingCode: 'ST-URGENT', slaDeadline: new Date('2026-11-15T06:00:00Z') },
    { bookingCode: 'ST-LATER', slaDeadline: new Date('2026-11-15T10:00:00Z') },
  ];
  setup({ rooms, bookings, pending });

  const result = await getHostDashboardData({ _id: hostId }, 'TODAY', 'ALL', now);
  expect(result.schedule.today.checkIns).toHaveLength(1);
  expect(result.schedule.today.checkIns[0]).toMatchObject({
    guestName: 'Guest One', phoneMasked: '0912******', note: 'Arrive early',
  });
  expect(result.slaAlert).toMatchObject({
    hasPending: true, pendingCount: 2, urgentBookingCode: 'ST-URGENT', urgentExpireHours: 1,
  });
});

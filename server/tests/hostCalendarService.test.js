import { jest } from '@jest/globals';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import RoomBlock from '../src/models/RoomBlock.js';
import { listHostRooms, getHostCalendarData, blockHostDates, unblockHostDate, approveHostBooking, rejectHostBooking } from '../src/services/hostCalendarService.js';

const hostId = '607f1f77bcf86cd799439001';
const otherHostId = '607f1f77bcf86cd799439002';
const roomId = '607f1f77bcf86cd799439003';

afterEach(() => jest.restoreAllMocks());

test('the room filter opens on a sellable room even when a newer draft exists', async () => {
  const draft = { _id: 'draft', title: 'New draft', status: 'Draft', pricePerNight: 0 };
  const published = { _id: 'published', title: 'Open room', status: 'Published', pricePerNight: 300000 };
  jest.spyOn(Room, 'find').mockReturnValue({ sort: () => ({ lean: async () => [draft, published] }) });
  const rooms = await listHostRooms(hostId);
  expect(rooms.map(room => room._id)).toEqual(['published', 'draft']);
});

test('a Host cannot read another Host room calendar', async () => {
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: otherHostId });
  await expect(getHostCalendarData(hostId, roomId, 11, 2027)).rejects.toMatchObject({
    status: 403, code: 'AUTH-403',
  });
});

test('calendar shows pending bookings and blocked dates from the shared availability model', async () => {
  jest.spyOn(Room, 'findById').mockResolvedValue({
    _id: roomId, ownerId: hostId, title: 'Room', pricePerNight: 1000000, status: 'Published',
  });
  jest.spyOn(Booking, 'find').mockReturnValue({
    populate: () => ({ lean: async () => [{
      _id: 'booking-1', bookingCode: 'ST-1001', roomId, status: 'PENDING',
      checkIn: new Date('2027-11-10'), checkOut: new Date('2027-11-12'),
      guestContact: { fullName: 'Guest' }, totalPrice: 2000000,
    }] }),
  });
  jest.spyOn(RoomAvailability, 'find').mockReturnValue({ lean: async () => [{
    _id: 'block-1', date: new Date('2027-11-13'), status: 'BLOCKED', blockReason: 'MAINTENANCE',
  }] });
  jest.spyOn(RoomBlock, 'find').mockReturnValue({ lean: async () => [] });

  const result = await getHostCalendarData(hostId, roomId, 11, 2027);
  expect(result.days.find(day => day.date === '2027-11-10').status).toBe('PENDING');
  expect(result.days.find(day => day.date === '2027-11-13').status).toBe('BLOCKED');
  expect(result.days.find(day => day.date === '2027-11-14').status).toBe('AVAILABLE');
  expect(result.kpi.availableNights).toBe(27);
});

test('blocking rejects a date occupied by a booking before writing availability', async () => {
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: hostId, status: 'Published', pricePerNight: 1000000 });
  jest.spyOn(Booking, 'findOne').mockResolvedValue({ _id: 'booking-1' });
  jest.spyOn(RoomAvailability, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomBlock, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomAvailability, 'findOneAndUpdate');
  await expect(blockHostDates(hostId, {
    roomId, startDate: '2027-11-10', endDate: '2027-11-11', reason: 'MAINTENANCE',
  })).rejects.toMatchObject({ status: 409, code: 'CAL-BLOCK-CONFLICT' });
  expect(RoomAvailability.findOneAndUpdate).not.toHaveBeenCalled();
});

test('a booking checking out on the first blocked day does not conflict with later nights', async () => {
  const checkoutOnFirstDay = {
    roomId,
    status: 'PENDING',
    checkIn: new Date('2026-11-15T07:00:00.000Z'),
    checkOut: new Date('2026-11-17T05:00:00.000Z'),
  };
  jest.spyOn(Room, 'findById').mockResolvedValue({
    _id: roomId, ownerId: hostId, status: 'Published', pricePerNight: 1000000,
  });
  jest.spyOn(Booking, 'findOne').mockImplementation(async query => {
    const upperBound = query.checkIn.$lt;
    const lowerBound = query.checkOut.$gte;
    return checkoutOnFirstDay.checkIn < upperBound && checkoutOnFirstDay.checkOut >= lowerBound
      ? checkoutOnFirstDay
      : null;
  });
  jest.spyOn(RoomAvailability, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomAvailability, 'findOneAndUpdate').mockResolvedValue({ _id: 'blocked-day' });
  jest.spyOn(RoomBlock, 'findOne').mockResolvedValue(null);

  await expect(blockHostDates(hostId, {
    roomId, startDate: '2026-11-17', endDate: '2026-11-19', reason: 'MAINTENANCE',
  })).resolves.toMatchObject({ startDate: '2026-11-17', endDate: '2026-11-19' });
  expect(RoomAvailability.findOneAndUpdate).toHaveBeenCalledTimes(3);
});

test('blocking a night the guest is still staying in is rejected', async () => {
  const booking = {
    roomId,
    status: 'PENDING',
    checkIn: new Date('2026-11-15T07:00:00.000Z'),
    checkOut: new Date('2026-11-18T05:00:00.000Z'),
  };
  jest.spyOn(Room, 'findById').mockResolvedValue({
    _id: roomId, ownerId: hostId, status: 'Published', pricePerNight: 1000000,
  });
  jest.spyOn(Booking, 'findOne').mockImplementation(async query => {
    return booking.checkIn < query.checkIn.$lt && booking.checkOut >= query.checkOut.$gte
      ? booking
      : null;
  });
  jest.spyOn(RoomAvailability, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomAvailability, 'findOneAndUpdate');
  jest.spyOn(RoomBlock, 'findOne').mockResolvedValue(null);

  await expect(blockHostDates(hostId, {
    roomId, startDate: '2026-11-17', endDate: '2026-11-19', reason: 'MAINTENANCE',
  })).rejects.toMatchObject({ status: 409, code: 'CAL-BLOCK-CONFLICT' });
  expect(RoomAvailability.findOneAndUpdate).not.toHaveBeenCalled();
});

test('month KPI counts sold, blocked and available nights without mixing other rooms', async () => {
  jest.spyOn(Room, 'findById').mockResolvedValue({
    _id: roomId, ownerId: hostId, title: 'Room', pricePerNight: 1000000, status: 'Published',
  });
  const bookings = [1, 3, 5, 7, 9].map((day, index) => ({
    _id: `booking-${index}`, status: 'CONFIRMED',
    checkIn: new Date(Date.UTC(2026, 11, day)), checkOut: new Date(Date.UTC(2026, 11, day + 2)),
    totalPrice: 2000000, totalNights: 2,
  }));
  jest.spyOn(Booking, 'find').mockReturnValue({ populate: () => ({ lean: async () => bookings }) });
  jest.spyOn(RoomAvailability, 'find').mockReturnValue({ lean: async () => [12, 13, 14, 15, 16, 17].map(day => ({
    date: new Date(Date.UTC(2026, 11, day)), status: 'BLOCKED', blockReason: 'MAINTENANCE',
  })) });
  jest.spyOn(RoomBlock, 'find').mockReturnValue({ lean: async () => [] });

  const result = await getHostCalendarData(hostId, roomId, 12, 2026);
  expect(result.kpi).toMatchObject({
    soldNights: 10, availableNights: 15, occupancyRate: 40, estimatedRevenue: 10000000,
  });
});

test('approving a pending booking changes the calendar source status to confirmed', async () => {
  const bookingId = '607f1f77bcf86cd799439004';
  const booking = { _id: bookingId, roomId, status: 'PENDING', save: jest.fn(async () => {}) };
  jest.spyOn(Booking, 'findById').mockResolvedValue(booking);
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: hostId });
  jest.spyOn(Booking, 'findOne').mockResolvedValue(null);
  await approveHostBooking(hostId, bookingId);
  expect(booking.status).toBe('CONFIRMED');
  expect(booking.save).toHaveBeenCalled();
});

test('rejecting an unpaid pending booking releases its booked availability dates', async () => {
  const bookingId = '607f1f77bcf86cd799439004';
  const booking = { _id: bookingId, roomId, status: 'PENDING', paymentStatus: 'UNPAID', save: jest.fn(async () => {}) };
  jest.spyOn(Booking, 'findById').mockResolvedValue(booking);
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: hostId });
  const deleted = jest.spyOn(RoomAvailability, 'deleteMany').mockResolvedValue({ deletedCount: 2 });
  await rejectHostBooking(hostId, bookingId, 'Không thể đón khách');
  expect(booking.status).toBe('REJECTED');
  expect(booking.rejectReason).toBe('Không thể đón khách');
  expect(deleted).toHaveBeenCalledWith({ roomId, bookingId, status: 'BOOKED' });
});

test('a paid booking is not marked rejected until refund handling exists', async () => {
  const bookingId = '607f1f77bcf86cd799439004';
  const booking = { _id: bookingId, roomId, status: 'PENDING', paymentStatus: 'PAID', save: jest.fn() };
  jest.spyOn(Booking, 'findById').mockResolvedValue(booking);
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: hostId });
  await expect(rejectHostBooking(hostId, bookingId, 'Lý do')).rejects.toMatchObject({
    status: 501, code: 'BOOK-REFUND-NOT-CONFIGURED',
  });
  expect(booking.status).toBe('PENDING');
  expect(booking.save).not.toHaveBeenCalled();
});

test('unblocking keeps an existing custom price for that date', async () => {
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: hostId });
  jest.spyOn(RoomAvailability, 'findOne').mockResolvedValue({ _id: 'availability-1', customPrice: 1200000 });
  jest.spyOn(RoomBlock, 'find').mockResolvedValue([]);
  const update = jest.spyOn(RoomAvailability, 'updateOne').mockResolvedValue({ modifiedCount: 1 });
  await unblockHostDate(hostId, { roomId, date: '2027-11-10' });
  expect(update).toHaveBeenCalledWith(
    { _id: 'availability-1', status: 'BLOCKED' },
    { $set: { status: 'AVAILABLE' }, $unset: { blockReason: '', blockNote: '' } }
  );
});

test('a concurrent booking conflict rolls back every earlier day in a block range', async () => {
  jest.spyOn(Room, 'findById').mockResolvedValue({
    _id: roomId, ownerId: hostId, status: 'Published', pricePerNight: 1000000,
  });
  jest.spyOn(Booking, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomAvailability, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomBlock, 'findOne').mockResolvedValue(null);
  const conflict = Object.assign(new Error('duplicate'), { code: 11000 });
  jest.spyOn(RoomAvailability, 'findOneAndUpdate')
    .mockResolvedValueOnce({ _id: 'first-day' })
    .mockRejectedValueOnce(conflict);
  const deleted = jest.spyOn(RoomAvailability, 'deleteOne').mockResolvedValue({ deletedCount: 1 });
  await expect(blockHostDates(hostId, {
    roomId, startDate: '2027-11-10', endDate: '2027-11-11', reason: 'MAINTENANCE',
  })).rejects.toMatchObject({ status: 409, code: 'CAL-BLOCK-CONFLICT' });
  expect(deleted).toHaveBeenCalledWith({ _id: 'first-day', status: 'BLOCKED' });
});

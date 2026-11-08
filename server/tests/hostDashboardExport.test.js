import { jest } from '@jest/globals';
import * as xlsx from 'xlsx';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import RoomBlock from '../src/models/RoomBlock.js';
import hostWebRoute from '../src/routes/hostWebRoute.js';

const hostId = '607f1f77bcf86cd799439001';
const roomId = '607f1f77bcf86cd799439003';

const query = value => ({
  populate() { return this; },
  select() { return this; },
  sort() { return this; },
  limit() { return this; },
  lean: async () => value,
});

afterEach(() => jest.restoreAllMocks());

test('Dashboard export downloads a workbook with Host-scoped summary and period bookings', async () => {
  jest.spyOn(Room, 'find').mockReturnValue(query([{ _id: roomId, title: 'Host room', status: 'Published' }]));
  jest.spyOn(Booking, 'find')
    .mockReturnValueOnce(query([{
      bookingCode: 'ST-EXPORT',
      roomId: { _id: roomId, title: 'Host room' },
      status: 'CONFIRMED',
      createdAt: new Date(),
      checkIn: new Date(),
      checkOut: new Date(),
      totalPrice: 1250000,
      paymentStatus: 'PAID',
    }]))
    .mockReturnValueOnce(query([]));
  jest.spyOn(Review, 'find').mockReturnValueOnce(query([])).mockReturnValueOnce(query([]));
  jest.spyOn(RoomAvailability, 'find').mockReturnValue(query([]));
  jest.spyOn(RoomBlock, 'find').mockReturnValue(query([]));

  const route = hostWebRoute.stack.find(layer => layer.route?.path === '/dashboard/export')?.route;
  const handler = route?.stack.at(-1)?.handle;
  expect(handler).toBeDefined();

  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    send(body) { this.body = body; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await handler({
    user: { _id: hostId, fullName: 'Host A' },
    query: { period: 'THIS_MONTH' },
  }, response);

  expect(response.statusCode).toBeUndefined();
  expect(response.headers['Content-Type']).toContain('spreadsheetml');
  expect(response.headers['Content-Disposition']).toContain('.xlsx');
  const workbook = xlsx.read(response.body, { type: 'buffer' });
  expect(workbook.SheetNames).toEqual(['Tổng quan', 'Đơn trong kỳ']);
  const [summary] = xlsx.utils.sheet_to_json(workbook.Sheets['Tổng quan']);
  const [booking] = xlsx.utils.sheet_to_json(workbook.Sheets['Đơn trong kỳ']);
  expect(summary).toMatchObject({ Host: 'Host A', Kỳ: 'THIS_MONTH' });
  expect(booking).toMatchObject({
    'Mã đơn': 'ST-EXPORT',
    Phòng: 'Host room',
    'Tổng tiền (VNĐ)': 1250000,
  });
});

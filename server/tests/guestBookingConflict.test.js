import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import Booking from '../src/models/Booking.js';
import Room from '../src/models/Room.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import { createBooking, checkAvailability } from '../src/controllers/bookingController.js';

const userId = '607f1f77bcf86cd799439001';
const roomId = '607f1f77bcf86cd799439002';
const otherRoomId = '607f1f77bcf86cd799439003';
const app = express();
app.use(express.json());
app.use((req, res, next) => { req.user = { _id: userId, email: 'guest@example.com' }; next(); });
app.post('/bookings', createBooking);
app.get('/availability', checkAvailability);

const payload = {
  userId, roomId, fullName: 'Guest', phoneNumber: '0901234567', email: 'guest@example.com',
  checkIn: '2026-11-11T00:00:00.000Z', checkOut: '2026-11-13T00:00:00.000Z', totalPrice: 2000000,
};
let records;

// Evaluate the controller's query against booking fixtures, including date boundaries.
function matches(record, query) {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') return condition.some(item => matches(record, item));
    if (key === '$and') return condition.every(item => matches(record, item));
    const value = key.split('.').reduce((object, part) => object?.[part], record);
    if (condition instanceof RegExp) return condition.test(value || '');
    if (condition && typeof condition === 'object') {
      if ('$in' in condition) return condition.$in.includes(value);
      if ('$lt' in condition) return value < condition.$lt;
      if ('$gt' in condition) return value > condition.$gt;
    }
    return value === condition;
  });
}

beforeEach(() => {
  records = [{
    userId, roomId: otherRoomId, email: 'guest@example.com', status: 'CONFIRMED',
    checkIn: new Date('2026-11-10T00:00:00.000Z'), checkOut: new Date('2026-11-12T00:00:00.000Z'),
  }];
  jest.spyOn(Booking, 'findOne').mockImplementation(async query => records.find(record => matches(record, query)) || null);
  jest.spyOn(Booking, 'create').mockImplementation(async data => ({ ...data, _id: 'new-booking' }));
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId });
  jest.spyOn(RoomAvailability, 'findOne').mockResolvedValue(null);
  jest.spyOn(RoomAvailability, 'findOneAndUpdate').mockResolvedValue({});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test.each(['PENDING', 'CONFIRMED', 'CHECKED_IN'])('%s booking blocks the same guest from a different room', async status => {
  records[0].status = status;
  const preflight = await request(app).get('/availability').query(payload);
  const submit = await request(app).post('/bookings').send(payload);
  for (const response of [preflight, submit]) {
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ available: false, conflict: true, code: 'GUEST_BOOKING_CONFLICT' });
  }
  expect(Booking.create).not.toHaveBeenCalled();
  expect(RoomAvailability.findOneAndUpdate).not.toHaveBeenCalled();
});

test.each([
  ['2026-11-10', '2026-11-12'],
  ['2026-11-09', '2026-11-11'],
  ['2026-11-09', '2026-11-13'],
  ['2026-11-10T12:00:00Z', '2026-11-11T12:00:00Z'],
])('overlapping stay %s to %s is rejected', async (checkIn, checkOut) => {
  const response = await request(app).post('/bookings').send({ ...payload, checkIn, checkOut });
  expect(response.status).toBe(409);
  expect(Booking.create).not.toHaveBeenCalled();
});

test.each(['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED'])('%s booking does not block a new booking', async status => {
  records[0].status = status;
  expect((await request(app).post('/bookings').send(payload)).status).toBe(201);
});

test.each([
  ['2026-11-12', '2026-11-13'],
  ['2026-11-09', '2026-11-10'],
])('adjacent stay %s to %s is allowed', async (checkIn, checkOut) => {
  const response = await request(app).post('/bookings').send({ ...payload, checkIn, checkOut });
  expect(response.status).toBe(201);
  expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({ roomId, userId }));
});

test('changing contact details or supplied userId cannot bypass the signed-in customer check', async () => {
  const response = await request(app).post('/bookings').send({ ...payload, userId: otherRoomId, email: 'different@example.com' });
  expect(response.status).toBe(409);
  expect(Booking.create).not.toHaveBeenCalled();
});

test('legacy bookings are matched by email without case differences', async () => {
  records[0].userId = undefined;
  records[0].email = 'GUEST@EXAMPLE.COM';
  expect((await request(app).post('/bookings').send(payload)).status).toBe(409);
});

test('email punctuation is matched literally', async () => {
  records[0].userId = undefined;
  records[0].email = 'guest@exampleXcom';
  expect((await request(app).post('/bookings').send(payload)).status).toBe(201);
});

test('email aliases containing a plus sign are recognized', async () => {
  records[0].userId = undefined;
  records[0].email = 'guest+trip@example.com';
  const response = await request(app).post('/bookings').send({ ...payload, email: 'guest+trip@example.com' });
  expect(response.status).toBe(409);
});

test('another customer can book a different room at the same time', async () => {
  records[0].userId = otherRoomId;
  records[0].email = 'another@example.com';
  expect((await request(app).post('/bookings').send(payload)).status).toBe(201);
});

test.each([
  ['invalid', '2026-11-12'],
  ['2026-11-12', '2026-11-12'],
  ['2026-11-13', '2026-11-12'],
])('invalid stay %s to %s is rejected', async (checkIn, checkOut) => {
  const response = await request(app).post('/bookings').send({ ...payload, checkIn, checkOut });
  expect(response.status).toBe(400);
  expect(Booking.create).not.toHaveBeenCalled();
});

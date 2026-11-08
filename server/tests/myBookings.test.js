import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bookingRoute from '../src/routes/bookingRoute.js';
import Booking from '../src/models/Booking.js';
import User from '../src/models/User.js';

const app = express();
app.use(express.json());
app.use('/bookings', bookingRoute);
const accountId = '607f1f77bcf86cd799439001';
const otherId = '607f1f77bcf86cd799439002';
const token = jwt.sign({ userId: accountId, role: 'HOST' }, process.env.ACCES_TOKEN_SECRET || 'secret_key');
let records;

function matches(record, query) {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') return condition.some(branch => matches(record, branch));
    const value = key.split('.').reduce((object, part) => object?.[part], record);
    if (condition instanceof RegExp) return condition.test(value || '');
    return condition === null ? value == null : String(value) === String(condition);
  });
}

beforeEach(() => {
  records = [
    { bookingCode: 'OTHER-GUEST', userId: otherId, roomId: 'host-owned-room', email: 'guest@example.com' },
    { bookingCode: 'OTHER-ROLE', userId: otherId, email: 'host@example.com' },
  ];
  jest.spyOn(User, 'findById').mockReturnValue({ select: async () => ({ _id: accountId, email: 'host@example.com', role: 'HOST' }) });
  jest.spyOn(Booking, 'find').mockImplementation(query => {
    const chain = {
      populate: jest.fn(path => {
        if (path === 'hostId') throw new Error(`Cannot populate path ${path}`);
        return chain;
      }),
      sort: async () => records.filter(record => matches(record, query)),
    };
    return chain;
  });
});
afterEach(() => jest.restoreAllMocks());

test('host with no personal bookings gets an empty list, excluding bookings received as owner', async () => {
  const response = await request(app).get('/bookings/my-bookings').set('Authorization', `Bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ success: true, count: 0, data: [] });
});

test('personal bookings and legacy email bookings are returned for the authenticated customer', async () => {
  records.push({ bookingCode: 'OWN-BOOKING', userId: accountId });
  records.push({ bookingCode: 'LEGACY-BOOKING', guestInfo: { email: 'HOST@EXAMPLE.COM' } });
  const response = await request(app).get('/bookings/my-bookings').set('Authorization', `Bearer ${token}`);
  expect(response.body.count).toBe(2);
  expect(response.body.data.map(record => record.bookingCode)).toEqual(['OWN-BOOKING', 'LEGACY-BOOKING']);
  const queryChain = Booking.find.mock.results[0].value;
  expect(queryChain.populate).toHaveBeenCalledWith('roomId');
  expect(queryChain.populate).not.toHaveBeenCalledWith('hostId');
});

test('query parameters cannot switch to another account history', async () => {
  const response = await request(app).get('/bookings/my-bookings').query({ userId: otherId, email: 'guest@example.com' }).set('Authorization', `Bearer ${token}`);
  expect(response.body.data).toEqual([]);
});

test('missing authentication never returns all bookings', async () => {
  const response = await request(app).get('/bookings/my-bookings');
  expect(response.status).toBe(401);
  expect(Booking.find).not.toHaveBeenCalled();
});

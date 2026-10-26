import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const findOne = jest.fn();
const create = jest.fn();
const findById = jest.fn();
const exists = jest.fn();
jest.unstable_mockModule('../src/models/Booking.js', () => ({ default: { findOne, create } }));
jest.unstable_mockModule('../src/models/Room.js', () => ({ default: { findById, exists } }));
const { createBooking, checkAvailability } = await import('../src/controllers/bookingController.js');
const app = express();
app.use(express.json());
app.post('/api/bookings', createBooking);
app.get('/api/bookings/check-availability', checkAvailability);
const roomId = '664c1234567890abcdef1234';
const userId = '664c1234567890abcdef1235';
const base = {
  roomId, userId, checkIn: '2026-11-10T14:00:00+07:00', checkOut: '2026-11-12T12:00:00+07:00',
  fullName: 'Nguyễn Văn An', phoneNumber: '0901234567', email: 'an@example.com',
};

describe('SMART-88 create booking with isolated persistence (no live data)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findOne.mockResolvedValue(null);
    findById.mockResolvedValue({ _id: roomId, pricePerNight: 1850000 });
    exists.mockResolvedValue({ _id: roomId });
    create.mockImplementation(async (data) => ({ ...data, toObject: () => data }));
  });

  it.each(['', 'name@@example.com', 'name@example', 'a..b@example.com', 'name@-example.com', 'name @example.com'])
  ('014: rejects invalid email %j before any database write', async (email) => {
    const res = await request(app).post('/api/bookings').send({ ...base, email });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CR_BOOK_04');
    expect(create).not.toHaveBeenCalled();
  });

  it('015: accepts corrected email on a subsequent request', async () => {
    expect((await request(app).post('/api/bookings').send({ ...base, email: 'invalid' })).status).toBe(400);
    const res = await request(app).post('/api/bookings').send({ ...base, email: 'fixed@example.com' });
    expect(res.status).toBe(201);
    expect(create.mock.calls[0][0].email).toBe('fixed@example.com');
  });

  it.each(['', 'A'.repeat(200)])('016/017: saves optional note of length %i', async (specialNote) => {
    const res = await request(app).post('/api/bookings').send({ ...base, specialNote });
    expect(res.status).toBe(201);
    expect(create.mock.calls[0][0].specialNote).toBe(specialNote);
  });

  it('018: rejects a 201-character note before writing', async () => {
    const res = await request(app).post('/api/bookings').send({ ...base, specialNote: 'A'.repeat(201) });
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('021/022: saves the selected user/room, dates, inclusive server price and default payment method', async () => {
    const res = await request(app).post('/api/bookings').send({ ...base, totalPrice: 3996000 });
    expect(res.status).toBe(201);
    expect(create.mock.calls[0][0]).toMatchObject({
      roomId, userId, nights: 2, totalPrice: 3700000, status: 'CONFIRMED', paymentMethod: 'NAPAS_QR',
      pricing: { pricePerNight: 1850000, subtotal: 3700000, totalPrice: 3700000 },
    });
    expect(res.body.bookingCode).toMatch(/^ST-\d{4}$/);
  });

  it('023: recalculates three nights from the changed dates even when the client sends old amounts', async () => {
    const res = await request(app).post('/api/bookings').send({
      ...base, checkIn: '2026-11-11T14:00:00+07:00', checkOut: '2026-11-14T12:00:00+07:00',
      nights: 2, totalPrice: 3700000,
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ nights: 3, totalPrice: 5550000 });
  });

  it('025: rechecks the requested room/dates at creation and refuses an existing booking', async () => {
    findOne.mockResolvedValueOnce({ bookingCode: 'ST-9999' });
    const res = await request(app).post('/api/bookings').send(base);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CR_BOOK_09');
    expect(findOne).toHaveBeenCalledWith({
      roomId, status: { $nin: ['REJECTED', 'CANCELLED'] },
      checkIn: { $lt: new Date(base.checkOut) }, checkOut: { $gt: new Date(base.checkIn) },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('checks availability without caching the snapshot', async () => {
    const res = await request(app).get('/api/bookings/check-availability').query(base);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body.available).toBe(true);
  });

  it('rejects an unknown room instead of booking a different room', async () => {
    findById.mockResolvedValue(null);
    expect((await request(app).post('/api/bookings').send(base)).status).toBe(404);
    expect(create).not.toHaveBeenCalled();
  });
});

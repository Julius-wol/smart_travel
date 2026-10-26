import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const exists = jest.fn();
const find = jest.fn();
jest.unstable_mockModule('../src/models/Room.js', () => ({ default: { exists } }));
jest.unstable_mockModule('../src/models/Booking.js', () => ({ default: { find } }));
const { getBookingCalendar } = await import('../src/controllers/bookingCalendarController.js');

const app = express();
app.get('/api/bookings/calendar', getBookingCalendar);
const roomId = '664c1234567890abcdef1234';

describe('GET booking calendar (isolated persistence)', () => {
  let select;
  beforeEach(() => {
    jest.clearAllMocks();
    exists.mockResolvedValue({ _id: roomId });
    select = jest.fn(() => ({ sort: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([
      // UTC evening belongs to the following booking day in Vietnam.
      { checkIn: new Date('2026-11-11T18:00:00Z'), checkOut: new Date('2026-11-14T05:00:00Z'), fullName: 'Private guest', bookingCode: 'PRIVATE' },
    ]) })) }));
    find.mockReturnValue({ select });
  });

  it('returns only date ranges in Vietnam time and excludes cancelled/rejected bookings in the query', async () => {
    const response = await request(app).get('/api/bookings/calendar').query({ roomId });
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({ success: true, data: {
      roomId, timeZone: 'Asia/Ho_Chi_Minh',
      bookedRanges: [{ checkIn: '2026-11-12', checkOut: '2026-11-14' }],
    } });
    expect(find).toHaveBeenCalledWith({ roomId, status: { $nin: ['REJECTED', 'CANCELLED'] }, checkOut: { $gt: expect.any(Date) } });
    expect(select).toHaveBeenCalledWith('checkIn checkOut -_id');
  });

  it('rejects invalid ids before querying the database', async () => {
    const response = await request(app).get('/api/bookings/calendar').query({ roomId: 'demo-room' });
    expect(response.status).toBe(400);
    expect(find).not.toHaveBeenCalled();
    expect(exists).not.toHaveBeenCalled();
  });

  it('returns 404 instead of substituting another room', async () => {
    exists.mockResolvedValue(null);
    const response = await request(app).get('/api/bookings/calendar').query({ roomId });
    expect(response.status).toBe(404);
    expect(find).not.toHaveBeenCalled();
  });

  it('returns 503 on database failure rather than an empty calendar', async () => {
    exists.mockRejectedValue(new Error('Database down'));
    const response = await request(app).get('/api/bookings/calendar').query({ roomId });
    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeUndefined();
  });
});

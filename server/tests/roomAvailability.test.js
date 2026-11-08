import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import Booking from '../src/models/Booking.js';
import Room from '../src/models/Room.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import RoomBlock from '../src/models/RoomBlock.js';
import { getRoomAvailability } from '../src/controllers/bookingController.js';

const roomId = '607f1f77bcf86cd799439002';
const app = express();
app.get('/room-availability', getRoomAvailability);

const queryResult = (result) => ({
  select: () => ({ lean: async () => result }),
});

beforeEach(() => {
  jest.spyOn(Room, 'findById').mockReturnValue({ select: async () => ({ _id: roomId }) });
  jest.spyOn(Booking, 'find').mockReturnValue(queryResult([
    {
      checkIn: new Date('2026-11-10T07:00:00.000Z'),
      checkOut: new Date('2026-11-12T05:00:00.000Z'),
      status: 'CONFIRMED',
    },
  ]));
  jest.spyOn(RoomAvailability, 'find').mockReturnValue(queryResult([
    { date: new Date('2026-11-13T00:00:00.000Z'), status: 'BLOCKED' },
    { date: new Date('2026-11-14T00:00:00.000Z'), status: 'PENDING' },
  ]));
  jest.spyOn(RoomBlock, 'find').mockReturnValue(queryResult([
    {
      startDate: new Date('2026-11-12T00:00:00.000Z'),
      endDate: new Date('2026-11-13T16:59:59.999Z'),
    },
  ]));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('returns booked, pending, and blocked local nights for the selected room', async () => {
  const response = await request(app).get('/room-availability').query({
    roomId,
    startDate: '2026-11-10',
    endDateExclusive: '2026-11-15',
  });

  expect(response.status).toBe(200);
  expect(response.body.data.unavailableDates).toEqual([
    { date: '2026-11-10', status: 'BOOKED' },
    { date: '2026-11-11', status: 'BOOKED' },
    { date: '2026-11-12', status: 'BLOCKED' },
    { date: '2026-11-13', status: 'BLOCKED' },
    { date: '2026-11-14', status: 'BOOKED' },
  ]);
  expect(Booking.find).toHaveBeenCalledWith(expect.objectContaining({
    roomId,
    status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
  }));
});

test('rejects invalid date ranges without querying room data', async () => {
  const response = await request(app).get('/room-availability').query({
    roomId,
    startDate: '2026-02-30',
    endDateExclusive: '2026-03-02',
  });

  expect(response.status).toBe(400);
  expect(Room.findById).not.toHaveBeenCalled();
});

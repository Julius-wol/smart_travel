import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { getRoomRatingSummary } from '../src/controllers/reviewController.js';
import Room from '../src/models/Room.js';
import Review from '../src/models/Review.js';

const app = express();
app.get('/reviews/:roomId/summary', getRoomRatingSummary);
const roomId = '607f1f77bcf86cd799439001';

beforeEach(() => {
  jest.spyOn(Room, 'findById').mockReturnValue({ select: async () => ({ rating: 4.9, reviewCount: 128, numReviews: 128 }) });
});
afterEach(() => jest.restoreAllMocks());

test('summary uses two actual reviews rather than the seeded count of 128', async () => {
  const aggregate = jest.spyOn(Review, 'aggregate').mockResolvedValue([{
    stats: [{ reviewCount: 2, rating: 4.5, cleanliness: 4, location: 5 }],
    distribution: [{ _id: 4, count: 1 }, { _id: 5, count: 1 }],
  }]);
  const res = await request(app).get(`/reviews/${roomId}/summary`);
  expect(res.status).toBe(200);
  expect(res.body.data).toMatchObject({
    rating: 4.5, reviewCount: 2,
    ratingBreakdown: { overall: 4.5, cleanliness: 4, location: 5 },
    distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
  });
  expect(aggregate.mock.calls[0][0][0].$match.roomId.toString()).toBe(roomId);
});

test('zero reviews returns zero count and rating despite stale room statistics', async () => {
  jest.spyOn(Review, 'aggregate').mockResolvedValue([{ stats: [], distribution: [] }]);
  const res = await request(app).get(`/reviews/${roomId}/summary`);
  expect(res.status).toBe(200);
  expect(res.body.data).toMatchObject({ rating: 0, reviewCount: 0, ratingBreakdown: { overall: 0 } });
});

test('invalid room ID is rejected before querying MongoDB', async () => {
  const res = await request(app).get('/reviews/invalid/summary');
  expect(res.status).toBe(404);
  expect(Room.findById).not.toHaveBeenCalled();
});

import { jest } from '@jest/globals';
import path from 'node:path';
import ejs from 'ejs';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import RoomBlock from '../src/models/RoomBlock.js';
import hostWebRoute from '../src/routes/hostWebRoute.js';

const query = value => ({
  populate() { return this; },
  select() { return this; },
  sort() { return this; },
  limit() { return this; },
  lean: async () => value,
});

afterEach(() => jest.restoreAllMocks());

test('Host dashboard route supplies the range and renders successfully with default filters', async () => {
  jest.spyOn(Room, 'find').mockReturnValue(query([]));
  jest.spyOn(Booking, 'find')
    .mockReturnValueOnce(query([]))
    .mockReturnValueOnce(query([]));
  jest.spyOn(Review, 'find')
    .mockReturnValueOnce(query([]))
    .mockReturnValueOnce(query([]));
  jest.spyOn(RoomAvailability, 'find').mockReturnValue(query([]));
  jest.spyOn(RoomBlock, 'find').mockReturnValue(query([]));

  const route = hostWebRoute.stack.find(layer => layer.route?.path?.includes('/dashboard'))?.route;
  const handler = route?.stack.at(-1)?.handle;
  expect(handler).toBeDefined();

  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
    async render(view, locals) {
      expect(view).toBe('host/dashboard');
      expect(locals.range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      this.html = await ejs.renderFile(path.resolve('views/host/dashboard.ejs'), locals);
      return this;
    },
  };
  await handler({
    query: {},
    user: { _id: '607f1f77bcf86cd799439001', fullName: 'Host A', email: 'host@example.com' },
  }, response);

  expect(response.statusCode).toBe(200);
  expect(response.html).toContain('Tổng quan');
  expect(response.body).toBeUndefined();
});

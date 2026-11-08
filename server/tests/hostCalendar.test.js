import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import Room from '../src/models/Room.js';
import hostCalendarRoutes from '../src/routes/hostCalendarRoutes.js';

const hostId = '607f1f77bcf86cd799439001';
const otherHostId = '607f1f77bcf86cd799439002';
const roomId = '607f1f77bcf86cd799439003';
const token = jwt.sign({ userId: hostId }, process.env.ACCES_TOKEN_SECRET || 'secret_key');
const app = express();
app.use(express.json());
app.use('/api/host', hostCalendarRoutes);

afterEach(() => jest.restoreAllMocks());

test('Calendar API requires a Host login', async () => {
  const response = await request(app).get('/api/host/rooms').set('Accept', 'application/json');
  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH-401');
});

test('Host room list only queries rooms owned by the signed-in Host', async () => {
  jest.spyOn(User, 'findById').mockReturnValue({ select: async () => ({ _id: hostId, role: 'HOST' }) });
  const find = jest.spyOn(Room, 'find').mockReturnValue({ sort: () => ({ lean: async () => [] }) });
  const response = await request(app).get('/api/host/rooms')
    .set('Authorization', `Bearer ${token}`).set('Accept', 'application/json');
  expect(response.status).toBe(200);
  expect(response.body.data).toEqual([]);
  expect(find).toHaveBeenCalledWith({ ownerId: hostId });
});

test('a visitor token cannot use Host Calendar APIs', async () => {
  jest.spyOn(User, 'findById').mockReturnValue({ select: async () => ({ _id: hostId, role: 'USER' }) });
  const response = await request(app).get('/api/host/rooms')
    .set('Authorization', `Bearer ${token}`).set('Accept', 'application/json');
  expect(response.status).toBe(403);
  expect(response.body.code).toBe('AUTH-403');
});

test('Host cannot load a room calendar owned by another Host', async () => {
  jest.spyOn(User, 'findById').mockReturnValue({ select: async () => ({ _id: hostId, role: 'HOST' }) });
  jest.spyOn(Room, 'findById').mockResolvedValue({ _id: roomId, ownerId: otherHostId });
  const response = await request(app).get(`/api/host/calendar?roomId=${roomId}&month=11&year=2027`)
    .set('Authorization', `Bearer ${token}`).set('Accept', 'application/json');
  expect(response.status).toBe(403);
  expect(response.body.code).toBe('AUTH-403');
});

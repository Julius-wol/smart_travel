import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRoute from '../src/routes/authRoute.js';
import User from '../src/models/User.js';
import Session from '../src/models/Session.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoute);

let accounts;
let lookup;
const email = 'same@example.com';
const details = { username: 'same', email, firstName: 'Test', lastName: 'Account', password: 'VisitorPass123!' };

beforeEach(async () => {
  accounts = [
    { _id: '607f1f77bcf86cd799439001', username: 'same', email, role: 'USER', password: await bcrypt.hash('VisitorPass123!', 4) },
    { _id: '607f1f77bcf86cd799439002', username: 'same', email, role: 'HOST', password: await bcrypt.hash('HostPass123!', 4) },
  ];
  lookup = jest.spyOn(User, 'findOne').mockImplementation(async query => accounts.find(account =>
    account.role === query.role && (query.$or
      ? query.$or.some(clause => Object.entries(clause).every(([key, value]) => account[key] === value))
      : Object.entries(query).every(([key, value]) => account[key] === value))) || null);
  jest.spyOn(User, 'create').mockImplementation(async data => {
    const account = { ...data, _id: '607f1f77bcf86cd799439003' };
    accounts.push(account);
    return account;
  });
  jest.spyOn(Session, 'create').mockResolvedValue({});
});

afterEach(() => jest.restoreAllMocks());

test('same email signs into separate visitor and host accounts with their own passwords', async () => {
  const visitor = await request(app).post('/api/auth/signin').send({ username: ' SAME@example.com ', password: 'VisitorPass123!' });
  const host = await request(app).post('/api/auth/host/signin').send({ emailOrPhone: email, password: 'HostPass123!' });
  expect(visitor.status).toBe(200);
  expect(host.status).toBe(200);
  const secret = process.env.ACCES_TOKEN_SECRET || 'secret_key';
  expect(jwt.verify(visitor.body.data.accessToken, secret)).toMatchObject({ userId: accounts[0]._id, role: 'USER' });
  expect(jwt.verify(host.body.data.accessToken, secret)).toMatchObject({ userId: accounts[1]._id, role: 'HOST' });
});

test('mobile accepts host credentials while host portal rejects visitor credentials', async () => {
  const visitor = await request(app).post('/api/auth/signin').send({ username: email, password: 'HostPass123!' });
  const host = await request(app).post('/api/auth/host/signin').send({ emailOrPhone: email, password: 'VisitorPass123!' });
  expect(visitor.status).toBe(200);
  expect(jwt.decode(visitor.body.data.accessToken).role).toBe('HOST');
  expect(host.status).toBe(401);
  expect(Session.create).toHaveBeenCalledTimes(1);
});

test('host-only email can register as visitor without changing the host account', async () => {
  accounts = [accounts[1]];
  const host = { ...accounts[0] };
  const res = await request(app).post('/api/auth/signup').send(details);
  expect(res.status).toBe(201);
  expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email, role: 'USER', username: 'same' }));
  expect(accounts[0]).toEqual(host);
  expect(await bcrypt.compare(details.password, accounts[1].password)).toBe(true);
});

test('visitor-only email can register as host with the same username', async () => {
  accounts = [accounts[0]];
  const res = await request(app).post('/api/auth/host/signup').send({ ...details, password: 'HostPass123!' });
  expect(res.status).toBe(201);
  expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email, role: 'HOST', username: 'same' }));
});

test.each(['/api/auth/signup', '/api/auth/host/signup'])('duplicate registration within the same role fails: %s', async endpoint => {
  const res = await request(app).post(endpoint).send(details);
  expect(res.status).toBe(400);
  expect(User.create).not.toHaveBeenCalled();
});

test('host-only account signs into mobile without creating a host CMS cookie', async () => {
  accounts = [accounts[1]];
  const res = await request(app).post('/api/auth/signin').send({ username: email, password: 'HostPass123!' });
  expect(res.status).toBe(200);
  expect(jwt.decode(res.body.data.accessToken).role).toBe('HOST');
  expect(res.headers['set-cookie'].some(cookie => cookie.startsWith('hostToken='))).toBe(false);
  expect(res.body.code).toBeUndefined();
  expect(lookup).toHaveBeenCalledWith(expect.objectContaining({ role: 'USER' }));
});

test('mobile explicitly selects visitor scope even when HOST is supplied', async () => {
  const res = await request(app).post('/api/auth/signin').send({ username: email, password: 'VisitorPass123!', platform: 'mobile', role: 'HOST' });
  expect(res.status).toBe(200);
  expect(lookup).toHaveBeenCalledWith(expect.objectContaining({ role: 'USER' }));
});

test('mobile forgot-password never selects an account from the host role', async () => {
  accounts = [accounts[1]];
  const res = await request(app).post('/api/auth/forgot-password').send({ email });
  expect(res.status).toBe(404);
  expect(lookup).toHaveBeenCalledWith({ email, role: 'USER' });
});

test('database schema constrains email and username within a role', () => {
  const indexes = User.schema.indexes();
  expect(indexes).toEqual(expect.arrayContaining([
    [expect.objectContaining({ email: 1, role: 1 }), expect.objectContaining({ unique: true })],
    [expect.objectContaining({ username: 1, role: 1 }), expect.objectContaining({ unique: true })],
  ]));
  expect(indexes.some(([keys, options]) => options.unique && Object.keys(keys).length === 1 && keys.email)).toBe(false);
});

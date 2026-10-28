import { jest } from '@jest/globals';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRoute from '../src/routes/authRoute.js';
import { protectedRoute } from '../src/middlewares/authMiddlewares.js';
import { authMe } from '../src/controllers/userController.js';
import User from '../src/models/User.js';
import Session from '../src/models/Session.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.get('/api/user/me', protectedRoute, authMe);

function expectResponse(response, status, data = null) {
    expect(response.status).toBe(status);
    expect(response.body).toEqual({ status, message: expect.any(String), data });
    expect(response.body.message.length).toBeGreaterThan(0);
}

afterEach(() => jest.restoreAllMocks());

test('signup returns 201 with the standard envelope', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({});
    const response = await request(app).post('/api/auth/signup').send({
        username: 'response_test', email: 'response@example.com', password: 'Secret123!',
        firstName: 'Test', lastName: 'User',
    });
    expectResponse(response, 201);
});

test('duplicate signup returns field inside data', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ username: 'response_test' });
    const response = await request(app).post('/api/auth/signup').send({
        username: 'response_test', email: 'response@example.com', password: 'Secret123!',
        firstName: 'Test', lastName: 'User',
    });
    expectResponse(response, 400, { field: 'username' });
});

test('signin returns data.accessToken and preserves the refresh cookie', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '507f1f77bcf86cd799439011', password: await bcrypt.hash('Secret123!', 4) });
    jest.spyOn(Session, 'create').mockResolvedValue({});
    const response = await request(app).post('/api/auth/signin').send({ username: 'tester', password: 'Secret123!' });
    expectResponse(response, 200, { accessToken: expect.any(String) });
    const decoded = jwt.verify(response.body.data.accessToken, process.env.ACCES_TOKEN_SECRET || 'secret_key');
    expect(decoded.userId).toBe('507f1f77bcf86cd799439011');
    expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=.*;.*HttpOnly; Secure; SameSite=None/);
});

test('incorrect signin credentials return 401 with null data', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    expectResponse(await request(app).post('/api/auth/signin').send({ username: 'missing', password: 'Secret123!' }), 401);
});

test.each([
    ['/signup', {}], ['/signin', {}], ['/forgot-password', {}],
    ['/verify-otp', {}], ['/reset-password', {}], ['/google', {}],
])('%s validation errors use the envelope', async (path, body) => {
    expectResponse(await request(app).post('/api/auth' + path).send(body), 400);
});

test('unexpected database failure returns the 500 envelope', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('database unavailable'));
    expectResponse(await request(app).post('/api/auth/signin').send({ username: 'tester', password: 'Secret123!' }), 500);
});

test('verify OTP returns data.valid', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({});
    expectResponse(await request(app).post('/api/auth/verify-otp').send({ otp: '123456', email: 'response@example.com' }), 200, { valid: true });
});

test('signout returns null data and removes the session cookie', async () => {
    const remove = jest.spyOn(Session, 'deleteOne').mockResolvedValue({ deletedCount: 1 });
    const response = await request(app).post('/api/auth/signout').set('Cookie', 'refreshToken=test-session').send({});
    expectResponse(response, 200);
    expect(remove).toHaveBeenCalledWith({ refreshToken: 'test-session' });
    expect(response.headers['set-cookie'][0]).toMatch(/^refreshToken=;/);
});

test('missing bearer token returns the 401 envelope', async () => {
    expectResponse(await request(app).get('/api/user/me'), 401);
});

test('invalid bearer token returns the 403 envelope', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    expectResponse(await request(app).get('/api/user/me').set('Authorization', 'Bearer invalid'), 403);
});

test('me returns the user inside data and excludes reset credentials', async () => {
    const user = { _id: '507f1f77bcf86cd799439011', username: 'tester', role: 'USER' };
    const select = jest.fn().mockResolvedValue(user);
    jest.spyOn(User, 'findById').mockReturnValue({ select });
    const token = jwt.sign({ userId: user._id }, process.env.ACCES_TOKEN_SECRET || 'secret_key');
    expectResponse(await request(app).get('/api/user/me').set('Authorization', `Bearer ${token}`), 200, user);
    expect(select).toHaveBeenCalledWith('-password -resetPasswordToken -resetPasswordExpires');
});

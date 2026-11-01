import { jest } from '@jest/globals';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRoute from '../src/routes/authRoute.js';
import User from '../src/models/User.js';
import Session from '../src/models/Session.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoute);

afterEach(() => jest.restoreAllMocks());

describe('Unified Authentication for HOST & USER (Option 1)', () => {
    test('Host can sign in via /api/auth/host/signin and receive Dual-Token and Session', async () => {
        const hashedPassword = await bcrypt.hash('HostSecret123!', 4);
        const hostUser = {
            _id: '607f1f77bcf86cd799439099',
            username: 'host_tester',
            email: 'host@smarttravel.vn',
            role: 'HOST',
            password: hashedPassword
        };

        jest.spyOn(User, 'findOne').mockResolvedValue(hostUser);
        const sessionCreateSpy = jest.spyOn(Session, 'create').mockResolvedValue({});

        const res = await request(app)
            .post('/api/auth/host/signin')
            .send({ emailOrPhone: 'host@smarttravel.vn', password: 'HostSecret123!' });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.role).toBe('HOST');

        // Verify JWT payload
        const decoded = jwt.verify(res.body.data.accessToken, process.env.ACCES_TOKEN_SECRET || 'secret_key');
        expect(decoded.userId).toBe('607f1f77bcf86cd799439099');
        expect(decoded.role).toBe('HOST');

        // Verify session was created in DB
        expect(sessionCreateSpy).toHaveBeenCalledWith(expect.objectContaining({
            userId: '607f1f77bcf86cd799439099',
            refreshToken: expect.any(String)
        }));

        // Verify cookies set
        const setCookieHeaders = res.headers['set-cookie'];
        expect(setCookieHeaders.some(c => c.includes('refreshToken='))).toBe(true);
        expect(setCookieHeaders.some(c => c.includes('hostToken='))).toBe(true);
    });

    test('Regular user is rejected with 403 when trying to access Host portal /host/signin', async () => {
        const hashedPassword = await bcrypt.hash('UserSecret123!', 4);
        const normalUser = {
            _id: '607f1f77bcf86cd799439001',
            username: 'normal_traveler',
            email: 'traveler@gmail.com',
            role: 'USER',
            password: hashedPassword
        };

        jest.spyOn(User, 'findOne').mockResolvedValue(normalUser);

        const res = await request(app)
            .post('/api/auth/host/signin')
            .send({ emailOrPhone: 'traveler@gmail.com', password: 'UserSecret123!' });

        expect(res.status).toBe(403);
    });

    test('Host signing in via /api/auth/signin with clientType=host succeeds', async () => {
        const hashedPassword = await bcrypt.hash('HostSecret123!', 4);
        const hostUser = {
            _id: '607f1f77bcf86cd799439099',
            username: 'host_tester',
            email: 'host@smarttravel.vn',
            role: 'HOST',
            password: hashedPassword
        };

        jest.spyOn(User, 'findOne').mockResolvedValue(hostUser);
        jest.spyOn(Session, 'create').mockResolvedValue({});

        const res = await request(app)
            .post('/api/auth/signin')
            .send({ username: 'host@smarttravel.vn', password: 'HostSecret123!', clientType: 'host' });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });

    test('Host signing in via /api/auth/signin without clientType=host is blocked with ROLE_NOT_PERMITTED_ON_MOBILE', async () => {
        const hashedPassword = await bcrypt.hash('HostSecret123!', 4);
        const hostUser = {
            _id: '607f1f77bcf86cd799439099',
            username: 'host_tester',
            email: 'host@smarttravel.vn',
            role: 'HOST',
            password: hashedPassword
        };

        jest.spyOn(User, 'findOne').mockResolvedValue(hostUser);

        const res = await request(app)
            .post('/api/auth/signin')
            .send({ username: 'host@smarttravel.vn', password: 'HostSecret123!' });

        expect(res.status).toBe(403);
        expect(res.body.code).toBe('ROLE_NOT_PERMITTED_ON_MOBILE');
    });

    test('Refresh token endpoint refreshes access token', async () => {
        const session = {
            _id: 'session123',
            userId: '607f1f77bcf86cd799439099',
            refreshToken: 'valid-refresh-token'
        };
        const hostUser = {
            _id: '607f1f77bcf86cd799439099',
            role: 'HOST',
            status: 'ACTIVE'
        };

        jest.spyOn(Session, 'findOne').mockResolvedValue(session);
        jest.spyOn(User, 'findById').mockResolvedValue(hostUser);

        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'valid-refresh-token' });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });
});


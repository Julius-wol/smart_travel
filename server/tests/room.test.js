import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

describe('Room & Discovery API Tests (SMART-84)', () => {
  jest.setTimeout(15000);

  describe('GET /api/rooms', () => {
    it('phải trả về mã 200 và danh sách phòng theo định dạng chuẩn Monorepo', async () => {
      const res = await request(app).get('/api/rooms?limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('rooms');
      expect(Array.isArray(res.body.data.rooms)).toBe(true);
      expect(res.body.data).toHaveProperty('totalCount');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('hasMore');
    });

    it('phải lọc được theo địa điểm và trả về kết quả tương ứng', async () => {
      const res = await request(app).get('/api/rooms?city=Đà Nẵng');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.rooms)).toBe(true);
    });

    it('phải lọc được theo số lượng phòng (roomsCount)', async () => {
      const res = await request(app).get('/api/rooms?roomsCount=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.rooms)).toBe(true);
    });

    it('phải xử lý trường hợp không tìm thấy kết quả (Zero search results)', async () => {
      const res = await request(app).get('/api/rooms?city=DiaDiemKhongTonTai999999');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rooms.length).toBe(0);
      expect(res.body.data.totalCount).toBe(0);
      expect(res.body.data.hasMore).toBe(false);
    });
  });

  describe('POST /api/wishlist/toggle', () => {
    it('phải trả về lỗi 400 nếu không truyền roomId', async () => {
      const res = await request(app).post('/api/wishlist/toggle').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('phải toggle được phòng yêu thích khi truyền roomId hợp lệ', async () => {
      const res = await request(app)
        .post('/api/wishlist/toggle')
        .send({ roomId: '664c1234567890abcdef1234' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isSaved');
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});

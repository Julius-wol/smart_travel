import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Host Dashboard API Tests (SMART-110)', () => {
  jest.setTimeout(15000);

  describe('GET /api/host/dashboard', () => {
    it('phải trả về mã 200 và dữ liệu tổng quan mặc định 30_DAYS', async () => {
      const res = await request(app).get('/api/host/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('host');
      expect(res.body.data).toHaveProperty('period', '30_DAYS');
      expect(res.body.data).toHaveProperty('kpis');
      expect(res.body.data.kpis).toHaveProperty('revenue');
      expect(res.body.data.kpis).toHaveProperty('newBookings');
      expect(res.body.data.kpis).toHaveProperty('occupancyRate');
      expect(res.body.data.kpis).toHaveProperty('avgRating');
      expect(res.body.data).toHaveProperty('chart');
      expect(res.body.data.chart).toHaveProperty('timeline');
      expect(Array.isArray(res.body.data.chart.timeline)).toBe(true);
      expect(res.body.data).toHaveProperty('schedule');
      expect(res.body.data.schedule).toHaveProperty('today');
      expect(res.body.data.schedule).toHaveProperty('tomorrow');
      expect(res.body.data).toHaveProperty('recentReviews');
      expect(Array.isArray(res.body.data.recentReviews.list)).toBe(true);
    });

    it('phải hỗ trợ chuyển đổi mốc thời gian period=7_DAYS', async () => {
      const res = await request(app).get('/api/host/dashboard?period=7_DAYS');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.period).toBe('7_DAYS');
      expect(res.body.data.periodLabel).toBe('7 ngày qua');
    });

    it('phải có cảnh báo SLA banner khi có đơn PENDING', async () => {
      const res = await request(app).get('/api/host/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.slaAlert).toBeDefined();
      if (res.body.data.slaAlert) {
        expect(res.body.data.slaAlert).toHaveProperty('hasPending');
        expect(res.body.data.slaAlert).toHaveProperty('urgentBookingCode');
      }
    });
  });

  describe('GET /api/host/dashboard/export', () => {
    it('phải trả về 200 và mã DASH-EXPORT-SUCCESS khi xuất báo cáo', async () => {
      const res = await request(app).get('/api/host/dashboard/export?period=30_DAYS');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toBe('DASH-EXPORT-SUCCESS');
      expect(res.body.data).toHaveProperty('downloadUrl');
    });
  });
});

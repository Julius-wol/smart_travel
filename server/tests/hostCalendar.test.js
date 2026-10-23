import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import RoomBlock from '../src/models/RoomBlock.js';

describe('Host Calendar & Availability API Tests (SMART-105)', () => {
  jest.setTimeout(25000);

  let testRoom;
  let testBooking;

  beforeAll(async () => {
    // Tìm hoặc tạo phòng test
    testRoom = await Room.findOne();
    if (!testRoom) {
      testRoom = await Room.create({
        title: 'Villa Mộng Mơ View Hồ & Rừng Thông',
        address: 'Số 123 Đường Hoa Hồng, Đà Lạt',
        city: 'Đà Lạt',
        pricePerNight: 2500000,
        weekendPricePerNight: 2800000,
        maxGuests: 4,
        code: '#P-VL204'
      });
    }

    // Tạo đơn booking CONFIRMED trong tương lai để test conflict
    testBooking = await Booking.create({
      bookingCode: 'BK-TEST-CONF',
      roomId: testRoom._id,
      fullName: 'Lê Hoàng Nam',
      phoneNumber: '0912345678',
      email: 'nam.le@example.com',
      checkIn: new Date(2027, 10, 15), // 15/11/2027
      checkOut: new Date(2027, 10, 18), // 18/11/2027
      nights: 3,
      guests: 2,
      totalPrice: 7500000,
      status: 'CONFIRMED'
    });
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    if (testBooking) {
      await Booking.findByIdAndDelete(testBooking._id);
    }
    if (testRoom) {
      await RoomBlock.deleteMany({ roomId: testRoom._id });
    }
  });

  describe('GET /api/host/rooms', () => {
    it('phải trả về danh sách các phòng của Host với mã 200', async () => {
      const res = await request(app).get('/api/host/rooms');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('pricePerNight');
    });
  });

  describe('GET /api/host/calendar', () => {
    it('phải trả về lỗi 400 EMPTY-ROOM-CAL nếu không truyền roomId', async () => {
      const res = await request(app).get('/api/host/calendar');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('EMPTY-ROOM-CAL');
    });

    it('phải trả về ma trận lịch tháng và 4 chỉ số KPI tổng hợp chính xác', async () => {
      const res = await request(app).get(`/api/host/calendar?roomId=${testRoom._id}&month=11&year=2027`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('room');
      expect(res.body.data).toHaveProperty('kpi');
      expect(res.body.data.kpi).toHaveProperty('occupancyRate');
      expect(res.body.data.kpi).toHaveProperty('soldNights');
      expect(res.body.data.kpi).toHaveProperty('availableNights');
      expect(res.body.data.kpi).toHaveProperty('estimatedRevenue');
      expect(Array.isArray(res.body.data.days)).toBe(true);
      expect(res.body.data.days.length).toBe(30); // Tháng 11 có 30 ngày
    });
  });

  describe('POST /api/host/calendar/block', () => {
    it('phải chặn và báo lỗi CAL-BLOCK-REASON-REQ nếu không chọn lý do khóa', async () => {
      const res = await request(app)
        .post('/api/host/calendar/block')
        .send({
          roomId: testRoom._id,
          startDate: '2027-11-01',
          endDate: '2027-11-03'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CAL-BLOCK-REASON-REQ');
    });

    it('phải ngăn chặn xung đột và báo lỗi CAL-BLOCK-CONFLICT nếu dải ngày có booking CONFIRMED', async () => {
      const res = await request(app)
        .post('/api/host/calendar/block')
        .send({
          roomId: testRoom._id,
          startDate: '2027-11-14',
          endDate: '2027-11-16',
          reason: 'MAINTENANCE'
        });
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CAL-BLOCK-CONFLICT');
    });

    it('phải khóa ngày thành công khi khoảng ngày trống và trả về CAL-BLOCK-SUCCESS', async () => {
      const res = await request(app)
        .post('/api/host/calendar/block')
        .send({
          roomId: testRoom._id,
          startDate: '2027-11-05',
          endDate: '2027-11-07',
          reason: 'MAINTENANCE',
          internalNote: 'Thay hệ thống bồn tắm phòng số 2'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toBe('CAL-BLOCK-SUCCESS');
      expect(res.body.data).toHaveProperty('reason', 'MAINTENANCE');
    });
  });

  describe('POST /api/host/calendar/unblock', () => {
    it('phải mở bán lại ngày đã khóa thành công và trả về CAL-UNBLOCK-SUCCESS', async () => {
      const res = await request(app)
        .post('/api/host/calendar/unblock')
        .send({
          roomId: testRoom._id,
          date: '2027-11-06'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toBe('CAL-UNBLOCK-SUCCESS');
    });
  });

  describe('POST /api/host/bookings/:id/approve', () => {
    it('phải duyệt nhanh đơn PENDING thành CONFIRMED và trả về BOOK-APPROVE-SUCCESS', async () => {
      // Tạo booking PENDING
      const pendingBooking = await Booking.create({
        bookingCode: 'BK-PENDING-SLA',
        roomId: testRoom._id,
        fullName: 'Nguyễn Văn An',
        phoneNumber: '0987654321',
        email: 'an.nguyen@example.com',
        checkIn: new Date(2027, 10, 20),
        checkOut: new Date(2027, 10, 22),
        nights: 2,
        guests: 3,
        totalPrice: 5000000,
        status: 'PENDING'
      });

      const res = await request(app)
        .post(`/api/host/bookings/${pendingBooking._id}/approve`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toBe('BOOK-APPROVE-SUCCESS');
      expect(res.body.data.status).toBe('CONFIRMED');

      // Cleanup
      await Booking.findByIdAndDelete(pendingBooking._id);
    });
  });
});

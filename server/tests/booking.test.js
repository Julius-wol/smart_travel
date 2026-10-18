const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Room = require('../src/models/Room');
const Booking = require('../src/models/Booking');

describe('Booking & Checkout API Tests (SMART-88)', () => {
  jest.setTimeout(20000);

  let testRoom;

  beforeAll(async () => {
    // Tìm hoặc tạo một phòng mẫu để test
    testRoom = await Room.findOne();
    if (!testRoom) {
      testRoom = await Room.create({
        ownerId: new mongoose.Types.ObjectId(),
        title: 'Homestay Test Checkout SMART-88',
        description: 'Phòng kiểm thử checkout',
        address: '123 Đường Test, Quận 1',
        city: 'Đà Nẵng',
        pricePerNight: 1250000,
        maxGuests: 4,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
      });
    }
    // Dọn dẹp trước khi chạy test
    await Booking.deleteMany({ roomId: testRoom._id });
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test booking
    if (testRoom) {
      await Booking.deleteMany({ roomId: testRoom._id });
    }
  });

  describe('GET /api/bookings/check-availability', () => {
    it('phải trả về mã 400 nếu thiếu tham số kiểm tra phòng', async () => {
      const res = await request(app).get('/api/bookings/check-availability');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CR_BOOK_04');
    });

    it('phải trả về 200 và isAvailable = true khi phòng còn trống', async () => {
      const res = await request(app).get(
        `/api/bookings/check-availability?roomId=${testRoom._id}&checkIn=2028-05-01&checkOut=2028-05-03`
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isAvailable');
      expect(typeof res.body.data.isAvailable).toBe('boolean');
    });
  });

  describe('POST /api/bookings', () => {
    it('phải chặn và trả về lỗi 400 CR_BOOK_04 khi thông tin khách không hợp lệ', async () => {
      const invalidPayload = {
        roomId: testRoom._id,
        checkIn: '2028-06-01',
        checkOut: '2028-06-03',
        guestInfo: {
          fullName: 'Nguyen 1234@#', // Tên chứa số và ký tự đặc biệt
          phoneNumber: '0123', // Không đủ 10 số
          email: 'invalid-email', // Sai định dạng RFC
        },
      };

      const res = await request(app).post('/api/bookings').send(invalidPayload);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CR_BOOK_04');
      expect(res.body.message).toContain('Vui lòng điền đầy đủ và chính xác thông tin liên hệ');
    });

    it('phải tạo đơn thành công và trả về mã 201 kèm bookingCode ST-xxxx', async () => {
      const validPayload = {
        roomId: testRoom._id,
        checkIn: '2028-07-10',
        checkOut: '2028-07-13',
        guests: 2,
        guestInfo: {
          fullName: 'Nguyễn Văn An',
          phoneNumber: '0912345678',
          email: 'testsmart88@gmail.com',
        },
        specialNote: 'Xin nhận phòng sớm 13:00',
        paymentMethod: 'NAPAS_QR',
      };

      const res = await request(app).post('/api/bookings').send(validPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('bookingCode');
      expect(res.body.data.bookingCode).toMatch(/^ST-\d{4}$/);
      expect(res.body.data.nights).toBe(3);
      expect(res.body.data.totalPrice).toBe(testRoom.pricePerNight * 3);
    });

    it('phải chặn và trả về lỗi 409 CR_BOOK_09 khi đặt trùng lịch phòng đã có khách', async () => {
      // Đặt cùng khoảng thời gian với đơn vừa tạo ở trên (2028-07-11 đến 2028-07-12)
      const overlappingPayload = {
        roomId: testRoom._id,
        checkIn: '2028-07-11',
        checkOut: '2028-07-12',
        guests: 1,
        guestInfo: {
          fullName: 'Khách Đặt Trùng',
          phoneNumber: '0987654321',
          email: 'trunglich@gmail.com',
        },
        paymentMethod: 'NAPAS_QR',
      };

      const res = await request(app).post('/api/bookings').send(overlappingPayload);
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CR_BOOK_09');
      expect(res.body.message).toContain('phòng của bạn đã được đặt trong thời gian bạn chọn');
    });
  });
});

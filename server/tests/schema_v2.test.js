import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../src/models/User.js';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import Review from '../src/models/Review.js';

describe('MongoDB Schema v2.0 Verification Tests', () => {
  jest.setTimeout(20000);

  let testHost;
  let testRoom;

  beforeAll(async () => {
    // Tạo Host mẫu
    testHost = await User.create({
      email: `test_host_${Date.now()}@smarttravel.vn`,
      password: 'hashed_password_123',
      fullName: 'Chủ nhà Mẫu Test',
      role: 'HOST',
      status: 'ACTIVE',
      hostProfile: {
        businessName: 'Villa Test Homestay',
        isVerified: true,
      },
    });

    // Tạo Room mẫu theo chuẩn Schema v2.0
    testRoom = await Room.create({
      roomCode: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: testHost._id,
      title: 'Homestay Thử Nghiệm Schema v2.0 Đà Nẵng',
      roomType: 'VILLA',
      city: 'Đà Nẵng',
      district: 'Sơn Trà',
      address: '123 Đường Biển Mỹ Khê',
      location: {
        type: 'Point',
        coordinates: [108.2435, 16.0825],
      },
      maxGuests: 4,
      numBedrooms: 2,
      numBeds: 2,
      regularPrice: 1200000,
      weekendPrice: 1400000,
      freeCancellationBeforeHours: 48,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      description: 'Phòng thử nghiệm tích hợp Schema v2.0 với đầy đủ tính năng.',
      amenities: ['Wifi', 'Hồ bơi', 'Bếp riêng'],
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg', 'https://example.com/img3.jpg'],
      status: 'PUBLISHED',
      rating: 5.0,
      numReviews: 1,
    });
  });

  afterAll(async () => {
    if (testRoom?._id) {
      await Room.deleteOne({ _id: testRoom._id });
      await RoomAvailability.deleteMany({ roomId: testRoom._id });
      await Booking.deleteMany({ roomId: testRoom._id });
      await Review.deleteMany({ roomId: testRoom._id });
    }
    if (testHost?._id) {
      await User.deleteOne({ _id: testHost._id });
    }
    await mongoose.connection.close();
  });

  it('1. User Model tuân thủ Schema v2.0 (fullName, status, hostProfile, wishlist)', async () => {
    expect(testHost.fullName).toBe('Chủ nhà Mẫu Test');
    expect(testHost.status).toBe('ACTIVE');
    expect(testHost.role).toBe('HOST');
    expect(testHost.hostProfile.businessName).toBe('Villa Test Homestay');
    expect(testHost.hostProfile.isVerified).toBe(true);
  });

  it('2. Room Model tuân thủ Schema v2.0 và hỗ trợ virtuals (pricePerNight, reviewCount)', async () => {
    expect(testRoom.roomType).toBe('VILLA');
    expect(testRoom.regularPrice).toBe(1200000);
    expect(testRoom.pricePerNight).toBe(1200000); // Virtual
    expect(testRoom.numReviews).toBe(1);
    expect(testRoom.reviewCount).toBe(1); // Virtual
    expect(testRoom.status).toBe('PUBLISHED');
    expect(testRoom.location.type).toBe('Point');
  });

  it('3. Đặt phòng tạo Booking chuẩn v2.0 và tự động khóa ngày trong RoomAvailability', async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2); // 2 đêm

    const res = await request(app)
      .post('/api/bookings')
      .send({
        roomId: testRoom._id,
        fullName: 'Nguyễn Văn Khách',
        phoneNumber: '0901234567',
        email: 'khachhang@test.com',
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        paymentMethod: 'VIETQR',
        totalPrice: 2400000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.bookingCode).toBeDefined();

    const createdBooking = res.body.data;
    expect(createdBooking.status).toBe('CONFIRMED');
    expect(createdBooking.totalNights).toBe(2);
    expect(createdBooking.guestContact.fullName).toBe('Nguyễn Văn Khách');
    expect(createdBooking.hostId.toString()).toBe(testHost._id.toString());

    // Kiểm tra xem RoomAvailability đã được tạo tự động chưa
    const blockedDates = await RoomAvailability.find({
      roomId: testRoom._id,
      status: 'BOOKED',
    });
    expect(blockedDates.length).toBeGreaterThanOrEqual(2);
  });

  it('4. Chống Overbooking (CR_BOOK_07) khi đặt trùng ngày đã bị khóa trong RoomAvailability', async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const resConflict = await request(app)
      .post('/api/bookings')
      .send({
        roomId: testRoom._id,
        fullName: 'Khách Đặt Trùng',
        phoneNumber: '0909999999',
        email: 'trunglich@test.com',
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        paymentMethod: 'MOMO',
        totalPrice: 2400000,
      });

    expect(resConflict.statusCode).toBe(409);
    expect(resConflict.body.conflict).toBe(true);
  });

  it('5. Đánh giá Review liên kết 1-1 với Booking và ngăn chặn đánh giá trùng lặp', async () => {
    // Lấy booking vừa tạo
    const booking = await Booking.findOne({ roomId: testRoom._id });
    expect(booking).toBeDefined();

    // Gửi đánh giá lần 1
    const resRev1 = await request(app)
      .post('/api/reviews')
      .send({
        roomId: testRoom._id,
        bookingId: booking._id,
        fullName: 'Nguyễn Văn Khách',
        rating: 5,
        comment: 'Phòng cực kỳ đẹp và sạch sẽ, đúng chuẩn mô tả!',
        images: ['https://example.com/rev1.jpg'],
      });

    expect(resRev1.statusCode).toBe(201);
    expect(resRev1.body.success).toBe(true);

    // Gửi đánh giá lần 2 trên cùng bookingId -> phải bị từ chối
    const resRev2 = await request(app)
      .post('/api/reviews')
      .send({
        roomId: testRoom._id,
        bookingId: booking._id,
        fullName: 'Nguyễn Văn Khách',
        rating: 4,
        comment: 'Đánh giá lặp lại',
      });

    expect(resRev2.statusCode).toBe(400);
  });
});

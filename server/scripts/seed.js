import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load biến môi trường từ server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
import User from '../src/models/User.js';
import Room from '../src/models/Room.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';
import RoomAvailability from '../src/models/RoomAvailability.js';
import Wishlist from '../src/models/Wishlist.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Lỗi: Chưa cấu hình MONGO_URI trong server/.env!');
  process.exit(1);
}

export const runSeed = async () => {
  try {
    console.log('🔄 Đang kết nối MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Kết nối thành công database: "${mongoose.connection.db.databaseName}"`);

    // 1. Dọn dẹp các collection cũ
    console.log('🧹 Đang làm sạch dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      RoomAvailability.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);
    console.log('✅ Đã dọn sạch database!');

    // 2. Hash mật khẩu chung: '123456'
    const passwordHash = await bcrypt.hash('123456', 10);

    // 3. Khởi tạo Users (Host, Khách hàng, Admin)
    console.log('👤 Đang tạo Users chuẩn Schema v2.0...');
    const hostUser = await User.create({
      email: 'host@smarttravel.com',
      password: passwordHash,
      fullName: 'Lê Hoàng Host',
      phone: '0905123456',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      role: 'HOST',
      status: 'ACTIVE',
      hostProfile: {
        businessName: 'An Nhiên Hospitality & Retreats',
        isVerified: true,
      },
    });

    const customer1 = await User.create({
      email: 'user@smarttravel.com',
      password: passwordHash,
      fullName: 'Nguyễn Văn Du Khách',
      phone: '0912345678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      role: 'USER',
      status: 'ACTIVE',
    });

    const customer2 = await User.create({
      email: 'guest@smarttravel.com',
      password: passwordHash,
      fullName: 'Trần Thị Mai',
      phone: '0987654321',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      role: 'USER',
      status: 'ACTIVE',
    });

    const adminUser = await User.create({
      email: 'admin@smarttravel.com',
      password: passwordHash,
      fullName: 'Quản Trị Viên Hệ Thống',
      phone: '0999888777',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    console.log('✅ Đã tạo 4 tài khoản hệ thống (1 Host, 2 Khách, 1 Admin)! Mật khẩu: 123456');

    // 4. Khởi tạo 6 Homestay/Villa/Apartment đặc sắc
    console.log('🏡 Đang tạo dữ liệu Phòng/Homestay mẫu...');
    const roomsData = [
      {
        roomCode: 'DN-01',
        ownerId: hostUser._id,
        roomType: 'HOMESTAY',
        title: 'An Nhiên Eco Retreat Đà Nẵng',
        description: 'Nằm nép mình bên bán đảo Sơn Trà thơ mộng, An Nhiên Eco Retreat mang đến không gian nghỉ dưỡng xanh mát, ban công hướng trọn bình minh biển Mỹ Khê.',
        address: 'Đường Hoàng Sa, Bán đảo Sơn Trà',
        city: 'Đà Nẵng',
        district: 'Sơn Trà',
        distance: 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
        regularPrice: 1450000,
        weekendPrice: 1650000,
        freeCancellationBeforeHours: 48,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        maxGuests: 4,
        numBedrooms: 2,
        numBeds: 2,
        badge: 'TOP 1% SƠN TRÀ',
        tags: ['Tất cả', 'Homestay', 'Eco Living', 'Gần biển'],
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        ],
        specs: {
          type: 'Nhà nguyên căn',
          capacity: 'Tối đa 4 khách',
          bedroom: '2 PN • 2 Giường King',
          bathroom: '2 Phòng tắm riêng',
        },
        amenities: [
          'Wifi tốc độ cao',
          'Bếp riêng cao cấp',
          'Bồn tắm gỗ pơ-mu',
          'Máy chiếu phim 4K',
          'Giặt & sấy khô',
          'Điều hòa 2 chiều',
          'Ban công view biển',
          'Chỗ đỗ xe ô tô',
        ],
        rating: 4.9,
        numReviews: 2,
        ratingBreakdown: {
          overall: 4.9,
          cleanliness: 5.0,
          location: 4.9,
          service: 4.9,
          amenities: 4.8,
          value: 4.8,
        },
        location: {
          type: 'Point',
          coordinates: [108.2435, 16.0825],
        },
        status: 'PUBLISHED',
      },
      {
        roomCode: 'DN-02',
        ownerId: hostUser._id,
        roomType: 'APARTMENT',
        title: 'The Muse Bohemian Studio Mỹ Khê',
        description: 'Studio phong cách Bohemian mộc mạc và cá tính ngay khu phố Tây An Thượng nhộn nhịp, chỉ cách bãi tắm Mỹ Khê 3 phút đi bộ.',
        address: 'Đường An Thượng 24, Ngũ Hành Sơn',
        city: 'Đà Nẵng',
        district: 'Ngũ Hành Sơn',
        distance: 'Cách bãi tắm Mỹ Khê 200m • Khu phố ẩm thực An Thượng',
        regularPrice: 750000,
        weekendPrice: 850000,
        freeCancellationBeforeHours: 48,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        maxGuests: 2,
        numBedrooms: 1,
        numBeds: 1,
        badge: 'YÊU THÍCH NHẤT',
        tags: ['Tất cả', 'Căn hộ', 'Boho Chic', 'Gần biển'],
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        ],
        specs: {
          type: 'Căn hộ Studio',
          capacity: 'Tối đa 2 khách',
          bedroom: '1 PN • 1 Giường Queen',
          bathroom: '1 Phòng tắm riêng',
        },
        amenities: [
          'Wifi tốc độ cao',
          'Bếp nhỏ tiện lợi',
          'Smart TV Netflix',
          'Điều hòa không khí',
        ],
        rating: 4.85,
        numReviews: 1,
        ratingBreakdown: {
          overall: 4.85,
          cleanliness: 4.9,
          location: 5.0,
          service: 4.8,
          amenities: 4.7,
          value: 4.9,
        },
        location: {
          type: 'Point',
          coordinates: [108.2418, 16.0503],
        },
        status: 'PUBLISHED',
      },
      {
        roomCode: 'DN-03',
        ownerId: hostUser._id,
        roomType: 'VILLA',
        title: 'Mộc Garden Villa & Private Pool',
        description: 'Biệt thự sân vườn biệt lập với hồ bơi riêng và khu tiệc nướng BBQ ngoài trời, lý tưởng cho gia đình hoặc nhóm bạn khám phá Đà Nẵng.',
        address: 'Đường Hà Bổng, Phước Mỹ, Sơn Trà',
        city: 'Đà Nẵng',
        district: 'Sơn Trà',
        distance: 'Cách cầu Rồng 2km • Sát chợ đêm Sơn Trà',
        regularPrice: 2200000,
        weekendPrice: 2500000,
        freeCancellationBeforeHours: 48,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        maxGuests: 8,
        numBedrooms: 3,
        numBeds: 4,
        badge: 'HỒ BƠI RIÊNG',
        tags: ['Tất cả', 'Biệt thự / Villa', 'Hồ bơi riêng', 'Sân vườn BBQ'],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        ],
        specs: {
          type: 'Biệt thự sân vườn',
          capacity: 'Tối đa 8 khách',
          bedroom: '3 PN • 4 Giường',
          bathroom: '3 Phòng tắm riêng',
        },
        amenities: [
          'Hồ bơi riêng ngoài trời',
          'Sân BBQ gia đình',
          'Wifi tốc độ cao',
          'Chỗ đỗ xe ô tô 7 chỗ',
        ],
        rating: 4.95,
        numReviews: 1,
        ratingBreakdown: {
          overall: 4.95,
          cleanliness: 5.0,
          location: 4.9,
          service: 5.0,
          amenities: 5.0,
          value: 4.8,
        },
        location: {
          type: 'Point',
          coordinates: [108.2452, 16.0667],
        },
        status: 'PUBLISHED',
      },
      {
        roomCode: 'DL-01',
        ownerId: hostUser._id,
        roomType: 'BUNGALOW',
        title: 'Mây Valley Pine Bungalow Đà Lạt',
        description: 'Căn nhà gỗ ấm áp trên đồi thông Khe Sanh nhìn xuống thung lũng sương mù mờ ảo. Không gian tĩnh lặng, lò sưởi ấm cúng và vườn hoa hồng khoe sắc.',
        address: 'Đường Khe Sanh, Phường 10',
        city: 'Đà Lạt',
        district: 'Phường 10',
        distance: 'Cách Hồ Xuân Hương 2.5km • View săn mây thung lũng',
        regularPrice: 950000,
        weekendPrice: 1150000,
        freeCancellationBeforeHours: 24,
        checkInTime: '14:00',
        checkOutTime: '11:30',
        maxGuests: 3,
        numBedrooms: 1,
        numBeds: 2,
        badge: 'SĂN MÂY ĐẸP NHẤT',
        tags: ['Tất cả', 'Bungalow', 'Săn mây', 'Đồi thông'],
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
          'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        ],
        specs: {
          type: 'Bungalow Gỗ',
          capacity: 'Tối đa 3 khách',
          bedroom: '1 PN • 2 Giường đơn',
          bathroom: '1 Phòng tắm nước nóng',
        },
        amenities: [
          'Lò sưởi củi ấm cúng',
          'Ban công ngắm mây',
          'Bình nước nóng siêu tốc',
          'Vườn trà & cà phê tự hái',
        ],
        rating: 4.9,
        numReviews: 1,
        ratingBreakdown: {
          overall: 4.9,
          cleanliness: 4.8,
          location: 5.0,
          service: 5.0,
          amenities: 4.9,
          value: 4.9,
        },
        location: {
          type: 'Point',
          coordinates: [108.4552, 11.9367],
        },
        status: 'PUBLISHED',
      },
      {
        roomCode: 'HA-01',
        ownerId: hostUser._id,
        roomType: 'HOMESTAY',
        title: 'Hội An Riverside Heritage Retreat',
        description: 'Biệt thự phong cách cổ điển bên bờ sông Hoài, cách Chùa Cầu 800m. Bao gồm xe đạp miễn phí dạo quanh phố cổ và bữa sáng bánh mì Hội An đặc sản.',
        address: 'Đường Nguyễn Thị Minh Khai, Cẩm Phô',
        city: 'Hội An',
        district: 'Cẩm Phô',
        distance: 'Cách Chùa Cầu 800m • Ven sông Hoài thơ mộng',
        regularPrice: 850000,
        weekendPrice: 950000,
        freeCancellationBeforeHours: 48,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        maxGuests: 4,
        numBedrooms: 2,
        numBeds: 2,
        badge: 'PHỐ CỔ VEN SÔNG',
        tags: ['Tất cả', 'Homestay', 'Phố cổ', 'Ven sông'],
        images: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80',
        ],
        specs: {
          type: 'Nhà cổ truyền thống',
          capacity: 'Tối đa 4 khách',
          bedroom: '2 PN • 2 Giường Đôi',
          bathroom: '2 Phòng tắm',
        },
        amenities: [
          'Xe đạp dạo phố miễn phí',
          'Bữa sáng đặc sản Hội An',
          'Wifi cáp quang',
          'Điều hòa nhiệt độ',
        ],
        rating: 4.88,
        numReviews: 1,
        ratingBreakdown: {
          overall: 4.88,
          cleanliness: 4.9,
          location: 5.0,
          service: 4.9,
          amenities: 4.7,
          value: 4.8,
        },
        location: {
          type: 'Point',
          coordinates: [108.3245, 15.8785],
        },
        status: 'PUBLISHED',
      },
      {
        roomCode: 'HN-01',
        ownerId: hostUser._id,
        roomType: 'APARTMENT',
        title: 'West Lake Sunset Luxury Loft Hà Nội',
        description: 'Căn hộ Duplex cao cấp với cửa kính panorama chạm trần thu trọn hoàng hôn Hồ Tây lộng lẫy, đầy đủ tiện nghi chuẩn 5 sao quốc tế.',
        address: 'Đường Quảng Khánh, Quảng An, Tây Hồ',
        city: 'Hà Nội',
        district: 'Tây Hồ',
        distance: 'Trực diện Hồ Tây • Cách trung tâm phố cổ 10 phút taxi',
        regularPrice: 1850000,
        weekendPrice: 2100000,
        freeCancellationBeforeHours: 48,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        maxGuests: 4,
        numBedrooms: 2,
        numBeds: 2,
        badge: 'PANORAMA HỒ TÂY',
        tags: ['Tất cả', 'Căn hộ', 'Hồ Tây', 'View hoàng hôn'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        ],
        specs: {
          type: 'Căn hộ Duplex Penthouse',
          capacity: 'Tối đa 4 khách',
          bedroom: '2 PN • 2 Giường King',
          bathroom: '2 Phòng tắm',
        },
        amenities: [
          'Ban công kính view Hồ Tây',
          'Smart Home điều khiển giọng nói',
          'Bếp đảo đá cẩm thạch',
          'Hầm đỗ xe thông minh',
        ],
        rating: 4.96,
        numReviews: 1,
        ratingBreakdown: {
          overall: 4.96,
          cleanliness: 5.0,
          location: 5.0,
          service: 5.0,
          amenities: 5.0,
          value: 4.8,
        },
        location: {
          type: 'Point',
          coordinates: [105.8245, 21.0658],
        },
        status: 'PUBLISHED',
      },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`✅ Đã tạo thành công ${createdRooms.length} phòng nghỉ đa dạng vùng miền!`);

    // Đồng bộ Wishlist vào User
    customer1.wishlist = [createdRooms[0]._id, createdRooms[3]._id];
    await customer1.save();

    // 5. Khởi tạo Lịch phòng (RoomAvailability)
    console.log('📅 Đang tạo RoomAvailability (chặn phòng / đặt phòng theo ngày)...');
    const today = new Date();
    const date1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
    const date2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);

    await RoomAvailability.create([
      {
        roomId: createdRooms[0]._id,
        date: date1,
        status: 'BLOCKED',
        blockReason: 'MAINTENANCE',
        blockNote: 'Bảo trì hệ thống nước nóng',
      },
      {
        roomId: createdRooms[0]._id,
        date: date2,
        status: 'BLOCKED',
        blockReason: 'MAINTENANCE',
        blockNote: 'Bảo trì hệ thống nước nóng',
      },
    ]);
    console.log('✅ Đã tạo lịch khóa phòng bảo trì mẫu cho phòng An Nhiên!');

    // 6. Khởi tạo Bookings chuẩn hóa mã e-Pass (ST-XXXX)
    console.log('📋 Đang tạo đơn đặt phòng (Bookings) mẫu chuẩn ST-XXXX...');
    const now = new Date();

    const dInCompleted = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 14, 0);
    const dOutCompleted = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 12, 0);

    const dInConfirmed = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0);
    const dOutConfirmed = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 12, 0);

    const dInPending = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 14, 0);
    const dOutPending = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 13, 12, 0);

    const sla24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await Booking.create([
      // Đơn 1: Đã hoàn thành (COMPLETED) -> Dùng để tính doanh thu Host và viết Review
      {
        bookingCode: 'ST-9821',
        roomId: createdRooms[0]._id,
        userId: customer1._id,
        hostId: hostUser._id,
        checkIn: dInCompleted,
        checkOut: dOutCompleted,
        totalNights: 3,
        guestDetails: { adults: 2, children: 0 },
        guestContact: {
          fullName: customer1.fullName,
          phone: customer1.phone,
          email: customer1.email,
          guestNote: 'Cần nhận phòng yên tĩnh để làm việc từ xa',
        },
        pricePerNight: 1450000,
        totalPrice: 4350000,
        paymentMethod: 'VIETQR',
        paymentStatus: 'PAID',
        status: 'COMPLETED',
        slaDeadline: sla24h,
      },
      // Đơn 2: Đã duyệt (CONFIRMED) -> Dùng để test màn hình Vé điện tử e-Pass trên Mobile
      {
        bookingCode: 'ST-5894',
        roomId: createdRooms[1]._id,
        userId: customer1._id,
        hostId: hostUser._id,
        checkIn: dInConfirmed,
        checkOut: dOutConfirmed,
        totalNights: 2,
        guestDetails: { adults: 2, children: 0 },
        guestContact: {
          fullName: customer1.fullName,
          phone: customer1.phone,
          email: customer1.email,
        },
        pricePerNight: 750000,
        totalPrice: 1500000,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        slaDeadline: sla24h,
      },
      // Đơn 3: Đang chờ duyệt (PENDING) -> Dùng để test chức năng Duyệt Đặt Phòng (Host Approval Flow)
      {
        bookingCode: 'ST-3344',
        roomId: createdRooms[2]._id,
        userId: customer2._id,
        hostId: hostUser._id,
        checkIn: dInPending,
        checkOut: dOutPending,
        totalNights: 3,
        guestDetails: { adults: 6, children: 2 },
        guestContact: {
          fullName: customer2.fullName,
          phone: customer2.phone,
          email: customer2.email,
          guestNote: 'Gia đình có trẻ nhỏ, xin chuẩn bị thêm 1 nôi em bé',
        },
        pricePerNight: 2200000,
        totalPrice: 6600000,
        paymentMethod: 'MOMO',
        paymentStatus: 'PAID',
        status: 'PENDING',
        slaDeadline: sla24h,
      },
      // Đơn 4: Đã hủy (CANCELLED)
      {
        bookingCode: 'ST-4412',
        roomId: createdRooms[3]._id,
        userId: customer2._id,
        hostId: hostUser._id,
        checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15),
        checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13),
        totalNights: 2,
        guestDetails: { adults: 2, children: 0 },
        guestContact: {
          fullName: customer2.fullName,
          phone: customer2.phone,
          email: customer2.email,
        },
        pricePerNight: 950000,
        totalPrice: 1900000,
        paymentMethod: 'VIETQR',
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
        rejectionReason: 'Khác',
        rejectionNote: 'Khách đổi lịch trình công tác đột xuất',
        slaDeadline: sla24h,
      },
    ]);
    console.log(`✅ Đã tạo ${bookings.length} đơn đặt phòng chuẩn ST-XXXX (COMPLETED, CONFIRMED, PENDING, CANCELLED)!`);

    // Gán ngày booked vào RoomAvailability cho đơn CONFIRMED
    await RoomAvailability.create([
      {
        roomId: createdRooms[1]._id,
        date: dInConfirmed,
        status: 'BOOKED',
        bookingId: bookings[1]._id,
      },
    ]);

    // 7. Khởi tạo Đánh giá (Reviews) chuẩn Schema v2 có rating breakdown và amenities
    console.log('⭐ Đang tạo Reviews đánh giá mẫu...');
    await Review.create([
      {
        bookingId: bookings[0]._id,
        roomId: createdRooms[0]._id,
        userId: customer1._id,
        rating: 5,
        comment: 'Kỳ nghỉ tuyệt vời ngoài mong đợi! Phòng sạch bong, view biển Sơn Trà ngắm bình minh tuyệt đẹp. Chủ nhà nhiệt tình hỗ trợ check-in sớm.',
        fullName: customer1.fullName,
        avatar: customer1.avatar,
        bookingCode: bookings[0].bookingCode,
        categories: {
          cleanliness: 5,
          location: 5,
          service: 5,
          amenities: 5,
          value: 5,
        },
        helpful: 12,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
        ],
      },
      {
        roomId: createdRooms[0]._id,
        userId: customer2._id,
        rating: 4.8,
        comment: 'Không gian rất xanh và yên bình, bồn tắm pơ-mu ngâm nước nóng thảo mộc cực kỳ thư giãn. Tiện nghi phòng đầy đủ và hiện đại.',
        fullName: customer2.fullName,
        avatar: customer2.avatar,
        bookingCode: 'ST-8899',
        categories: {
          cleanliness: 5,
          location: 4.8,
          service: 4.9,
          amenities: 4.8,
          value: 4.7,
        },
        helpful: 8,
      },
      {
        roomId: createdRooms[1]._id,
        userId: customer1._id,
        rating: 4.9,
        comment: 'Studio decor phong cách Boho rất có gu, góc nào chụp ảnh cũng đẹp. Ngay khu phố ẩm thực An Thượng nên bước chân ra ngõ là có đồ ăn ngon.',
        fullName: customer1.fullName,
        avatar: customer1.avatar,
        bookingCode: 'ST-5894',
        categories: {
          cleanliness: 4.9,
          location: 5,
          service: 4.8,
          amenities: 4.7,
          value: 5,
        },
        helpful: 5,
      },
      {
        roomId: createdRooms[3]._id,
        userId: customer2._id,
        rating: 5,
        comment: 'Đà Lạt buổi sớm lạnh ngắm sương mù từ ban công bungalow này thì đúng là đỉnh cao. Lò sưởi ấm và chủ nhà pha trà atiso mời tận tình.',
        fullName: customer2.fullName,
        avatar: customer2.avatar,
        bookingCode: 'ST-7721',
        categories: {
          cleanliness: 4.8,
          location: 5,
          service: 5,
          amenities: 4.9,
          value: 5,
        },
        helpful: 15,
      },
    ]);
    console.log('✅ Đã tạo các đánh giá mẫu kèm đầy đủ điểm phân bổ (Tiện nghi, Vệ sinh, Vị trí, Dịch vụ)!');

    // 8. Khởi tạo Wishlist collection
    console.log('❤️ Đang đồng bộ Wishlist collection...');
    await Wishlist.create([
      { userId: customer1._id, roomId: createdRooms[0]._id },
      { userId: customer1._id, roomId: createdRooms[3]._id },
    ]);
    console.log('✅ Đã lưu sẵn 2 phòng yêu thích cho tài khoản user@smarttravel.com!');

    console.log('\n🎉 ========================================================');
    console.log('🎉 NẠP THÀNH CÔNG TOÀN BỘ MOCK DATA CHUẨN SCHEMA V2!');
    console.log('🎉 ========================================================');
    console.log('📌 Danh sách tài khoản thử nghiệm:');
    console.log('   - Chủ nhà (HOST):        host@smarttravel.com     | Mật khẩu: 123456');
    console.log('   - Khách du lịch (USER 1): user@smarttravel.com     | Mật khẩu: 123456');
    console.log('   - Khách du lịch (USER 2): guest@smarttravel.com    | Mật khẩu: 123456');
    console.log('   - Quản trị viên (ADMIN):  admin@smarttravel.com    | Mật khẩu: 123456');
    console.log('📌 Mã đặt phòng mẫu hiển thị trên UI:');
    console.log('   - ST-9821: Đơn ĐÃ HOÀN THÀNH (COMPLETED) - Đã có Review');
    console.log('   - ST-5894: Đơn ĐÃ DUYỆT (CONFIRMED) - Test vé e-Pass');
    console.log('   - ST-3344: Đơn CHỜ DUYỆT (PENDING) - Test Host Approval');
    console.log('   - ST-4412: Đơn ĐÃ HỦY (CANCELLED)');
    console.log('========================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi nạp seed data:', error);
    process.exit(1);
  }
};

runSeed();

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

export async function ensureRobinHost() {
  try {
    let host = await User.findOne({ email: 'robinnguyen@gmail.com' });
    if (!host) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      host = await User.create({
        username: 'robinnguyen',
        email: 'robinnguyen@gmail.com',
        firstName: 'Robin',
        lastName: 'Nguyen',
        password: hashedPassword,
        role: 'HOST',
        phone: '0905123456',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      });
      console.log('✅ Created default Host Robin Nguyen');
    }

    // Ensure the 3 matching rooms exist for Robin Nguyen
    let room1 = await Room.findOne({ ownerId: host._id, roomCode: 'P-VLZ01' });
    if (!room1) {
      room1 = await Room.create({
        ownerId: host._id,
        roomCode: 'P-VLZ01',
        title: 'Ocean View Bungalow – An Nhiên',
        specs: {
          type: 'Bungalow',
          capacity: 'Tối đa 2 người lớn + 1 trẻ em',
          bedroom: '1 Giường King',
          bathroom: '1 Phòng tắm riêng'
        },
        area: 45,
        maxGuests: 3,
        bedrooms: 1,
        beds: 1,
        pricePerNight: 1250000,
        weekendPrice: 1450000,
        status: 'Published',
        address: '12 Hoàng Sa, Bán đảo Sơn Trà',
        city: 'Đà Nẵng',
        district: 'Sơn Trà',
        distance: 'Cách bãi biển Mỹ Khê 50m • Sát biển',
        description: 'Bungalow sát biển với không gian mở thoáng đãng, chỉ vài bước chân là chạm tới bãi cát trắng và làn nước trong xanh. Ban công view trọn bình minh biển Mỹ Khê.',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
        ],
        amenities: [
          { id: '1', name: 'Wifi 100Mbps', icon: 'wifi' },
          { id: '2', name: 'Điều hòa 2 chiều', icon: 'snow' },
          { id: '3', name: 'Bếp đầy đủ gia vị', icon: 'restaurant' },
          { id: '4', name: 'Chỗ đỗ xe ô tô free', icon: 'car' },
          { id: '5', name: 'Bồn tắm thảo mộc', icon: 'water' },
          { id: '6', name: 'Khóa điện tử SmartLock', icon: 'lock' }
        ],
        rating: 4.95,
        reviewCount: 32,
        lastUpdatedBy: 'Robin Nguyen'
      });
    }

    let room2 = await Room.findOne({ ownerId: host._id, roomCode: 'P-VLZ04' });
    if (!room2) {
      room2 = await Room.create({
        ownerId: host._id,
        roomCode: 'P-VLZ04',
        title: 'Villa Mộng Mơ View Hồ',
        specs: {
          type: 'Biệt thự / Villa nguyên căn',
          capacity: 'Tối đa 6 khách',
          bedroom: '3 phòng • 4 giường',
          bathroom: '3 Phòng tắm riêng'
        },
        area: 120,
        maxGuests: 6,
        bedrooms: 3,
        beds: 4,
        pricePerNight: 2500000,
        weekendPrice: 2800000,
        status: 'Published',
        address: 'Số 123 Đường Hoa Hồng, Khu Du Lịch Hồ Tuyền Lâm',
        city: 'Lâm Đồng (Đà Lạt)',
        district: 'Phường 4 (Khu Hồ Tuyền Lâm)',
        distance: 'Bên bờ hồ Tuyền Lâm • View rừng thông 360 độ',
        description: 'Biệt thự nguyên căn view bao trọn rừng thông và mặt hồ sương mù Tuyền Lâm. Thiết kế gỗ mộc ấm cúng kết hợp kính tràn panorama, ban công rộng ngắm bình minh và tiệc BBQ ngoài trời, trang bị bồn tắm kính ngắm sao và lò sưởi thông minh hiện đại.',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80'
        ],
        amenities: [
          { id: '1', name: 'Wifi 100Mbps', icon: 'wifi' },
          { id: '2', name: 'Điều hòa 2 chiều', icon: 'snow' },
          { id: '3', name: 'Bếp đầy đủ gia vị', icon: 'restaurant' },
          { id: '4', name: 'Hồ bơi vô cực riêng', icon: 'water' },
          { id: '5', name: 'Chỗ đỗ xe ô tô free', icon: 'car' },
          { id: '6', name: 'Máy giặt & sấy', icon: 'shirt' },
          { id: '7', name: 'Lò nướng BBQ ngoài trời', icon: 'flame' },
          { id: '8', name: 'Bồn tắm thảo mộc', icon: 'water' },
          { id: '9', name: 'Khóa điện tử SmartLock', icon: 'lock' }
        ],
        rating: 4.98,
        reviewCount: 48,
        lastUpdatedBy: 'Robin Nguyen'
      });
    }

    let room3 = await Room.findOne({ ownerId: host._id, roomCode: 'P-VLZ08' });
    if (!room3) {
      room3 = await Room.create({
        ownerId: host._id,
        roomCode: 'P-VLZ08',
        title: 'Studio Ban Công Hoàng Hôn Sơn Trà',
        specs: {
          type: 'Căn hộ Studio',
          capacity: 'Tối đa 2 khách',
          bedroom: '1 PN • 1 Giường',
          bathroom: '1 Phòng tắm riêng'
        },
        area: 32,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        pricePerNight: 850000,
        weekendPrice: 950000,
        status: 'Published',
        address: '24 An Thượng, Phường Mỹ An',
        city: 'Đà Nẵng',
        district: 'Ngũ Hành Sơn',
        distance: 'Cách biển Mỹ Khê 200m • Phố Tây',
        description: 'Căn hộ Studio tiện nghi với ban công ngắm trọn hoàng hôn lãng mạn. Đầy đủ bếp, máy giặt và không gian làm việc chill yên tĩnh.',
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80'
        ],
        amenities: [
          { id: '1', name: 'Wifi 100Mbps', icon: 'wifi' },
          { id: '2', name: 'Điều hòa 2 chiều', icon: 'snow' },
          { id: '3', name: 'Bếp đầy đủ gia vị', icon: 'restaurant' },
          { id: '4', name: 'Khóa điện tử SmartLock', icon: 'lock' }
        ],
        rating: 4.8,
        reviewCount: 19,
        lastUpdatedBy: 'Robin Nguyen'
      });
    }

    // Now seed the 32 real reviews for Robin's 3 rooms
    // Target distribution: 22 (5★), 6 (4★), 2 (3★), 1 (2★), 1 (1★) => Total 32 reviews
    // Exactly 18 with photos, 14 without photos
    const existingReviewsCount = await Review.countDocuments({
      roomId: { $in: [room1._id, room2._id, room3._id] }
    });

    if (existingReviewsCount < 32) {
      // Clear any partial reviews for these rooms to ensure exact seed state
      await Review.deleteMany({ roomId: { $in: [room1._id, room2._id, room3._id] } });

      const sampleReviews = [
        // 1. Trần Thị Bình (4★, 6 photos) - Villa Mộng Mơ View Hồ
        {
          roomId: room2._id,
          rating: 4,
          fullName: 'Trần Thị Bình',
          stayInfo: {
            checkIn: new Date('2026-10-10'),
            checkOut: new Date('2026-10-12'),
            roomTitle: 'Villa Mộng Mơ View Hồ',
            bookingCode: 'BK-9718'
          },
          bookingCode: 'BK-9718',
          createdAt: new Date('2026-10-13T09:15:00'),
          comment: 'Phòng sạch sẽ, view hồ buổi sáng rất đẹp. Chủ nhà nhiệt tình hỗ trợ check-in sớm. Điểm trừ là wifi hơi yếu ở tầng 2.',
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 4, location: 5, value: 4 }
        },

        // 2. Lê Hoàng Nam (5★, 3 photos) - Villa Mộng Mơ View Hồ
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Lê Hoàng Nam',
          stayInfo: {
            checkIn: new Date('2026-11-01'),
            checkOut: new Date('2026-11-04'),
            roomTitle: 'Villa Mộng Mơ View Hồ',
            bookingCode: 'BK-9758'
          },
          bookingCode: 'BK-9758',
          createdAt: new Date('2026-11-05T14:20:00'),
          comment: 'Chuyến nghỉ dưỡng tuyệt vời cho cả gia đình! Bếp nướng BBQ ngoài trời đầy đủ dụng cụ, bể bơi nước ấm ngắm cảnh cực chill. Chủ nhà chuẩn bị sẵn trà atiso và củi sưởi rất chu đáo. Chắc chắn sẽ quay lại vào dịp tết!',
          images: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
            'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80',
            'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 3. Nguyễn Hải Đăng (2★, 2 photos, caution alert) - Studio Ban Công Hoàng Hôn Sơn Trà
        {
          roomId: room3._id,
          rating: 2,
          fullName: 'Nguyễn Hải Đăng',
          stayInfo: {
            checkIn: new Date('2026-09-25'),
            checkOut: new Date('2026-09-27'),
            roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà',
            bookingCode: 'BK-9602'
          },
          bookingCode: 'BK-9602',
          createdAt: new Date('2026-09-28T11:00:00'),
          comment: 'Vị trí gần biển nhưng cách âm chưa tốt, buổi tối nghe tiếng xe cộ ngoài đường. Bình nóng lạnh lúc được lúc không, đã liên hệ nhưng thợ đến kiểm tra hơi muộn. Mong cơ sở cải thiện chất lượng thiết bị.',
          images: [
            'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=600&q=80',
            'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80'
          ],
          categories: { cleanliness: 3, service: 2, checkin: 3, accuracy: 2, location: 3, value: 2 }
        },

        // 4. Trần Thị Minh Trang (5★, 4 photos) - Ocean View Bungalow – An Nhiên
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Trần Thị Minh Trang',
          stayInfo: {
            checkIn: new Date('2026-10-18'),
            checkOut: new Date('2026-10-20'),
            roomTitle: 'Ocean View Bungalow – An Nhiên',
            bookingCode: 'BK-9725'
          },
          bookingCode: 'BK-9725',
          createdAt: new Date('2026-10-21T10:45:00'),
          comment: 'Kỷ niệm ngày cưới không thể hoàn hảo hơn! Cảm ơn anh Robin đã setup hoa tươi và nến thơm theo yêu cầu. Bãi biển ngay trước thềm nhà, không gian riêng tư và bình yên.',
          images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 5. Hoàng Tuấn Anh (5★, 2 photos)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Hoàng Tuấn Anh',
          stayInfo: { checkIn: new Date('2026-10-05'), checkOut: new Date('2026-10-08'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9690' },
          bookingCode: 'BK-9690',
          createdAt: new Date('2026-10-09T16:30:00'),
          comment: 'Không gian quá lãng mạn, view trọn vẹn cảnh bình minh mặt hồ sương mờ Đà Lạt. Lò sưởi phòng khách rất ấm cúng.',
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 6. Phạm Quỳnh Nga (5★, 3 photos)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Phạm Quỳnh Nga',
          stayInfo: { checkIn: new Date('2026-10-02'), checkOut: new Date('2026-10-04'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-9675' },
          bookingCode: 'BK-9675',
          createdAt: new Date('2026-10-05T08:15:00'),
          comment: 'Sát bãi biển Sơn Trà, sáng thức dậy nghe tiếng sóng vỗ rì rào. Phòng ốc thơm tho, đầy đủ tiện nghi từ máy sấy đến cà phê phin cao cấp.',
          images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 7. Đỗ Minh Quân (4★, 2 photos)
        {
          roomId: room3._id,
          rating: 4,
          fullName: 'Đỗ Minh Quân',
          stayInfo: { checkIn: new Date('2026-09-18'), checkOut: new Date('2026-09-21'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-9580' },
          bookingCode: 'BK-9580',
          createdAt: new Date('2026-09-22T19:40:00'),
          comment: 'Studio bài trí rất hợp lý, ban công nhìn ra hoàng hôn biển siêu đẹp. Chỉ có thang máy hơi đông vào giờ cao điểm.',
          images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 4, checkin: 5, accuracy: 4, location: 5, value: 4 }
        },

        // 8. Vũ Thanh Thảo (5★, 2 photos)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Vũ Thanh Thảo',
          stayInfo: { checkIn: new Date('2026-09-15'), checkOut: new Date('2026-09-17'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9552' },
          bookingCode: 'BK-9552',
          createdAt: new Date('2026-09-18T10:20:00'),
          comment: 'Khuôn viên biệt thự rộng rãi, các bé nhà mình tha hồ chạy nhảy vui chơi. Đồ nướng BBQ rất ngon!',
          images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 9. Bùi Tiến Dũng (5★, 1 photo)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Bùi Tiến Dũng',
          stayInfo: { checkIn: new Date('2026-09-10'), checkOut: new Date('2026-09-12'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-9511' },
          bookingCode: 'BK-9511',
          createdAt: new Date('2026-09-13T14:10:00'),
          comment: 'Dịch vụ của chủ nhà Robin cực kỳ chuyên nghiệp và chu đáo. Nhận phòng nhanh chóng qua khóa thông minh SmartLock.',
          images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 4, value: 5 }
        },

        // 10. Mai Phương Thuý (5★, 3 photos)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Mai Phương Thuý',
          stayInfo: { checkIn: new Date('2026-09-02'), checkOut: new Date('2026-09-05'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9480' },
          bookingCode: 'BK-9480',
          createdAt: new Date('2026-09-06T11:00:00'),
          comment: 'Biệt thự như một bức tranh thu nhỏ giữa Đà Lạt. Bồn tắm ngâm thảo mộc nhìn thẳng ra rừng thông ngút ngàn.',
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
            'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 4 }
        },

        // 11. Đinh Quốc Khánh (4★, 1 photo)
        {
          roomId: room3._id,
          rating: 4,
          fullName: 'Đinh Quốc Khánh',
          stayInfo: { checkIn: new Date('2026-08-28'), checkOut: new Date('2026-08-30'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-9430' },
          bookingCode: 'BK-9430',
          createdAt: new Date('2026-08-31T17:15:00'),
          comment: 'Căn hộ sạch, gần phố đi bộ ẩm thực An Thượng nên rất tiện. Host hướng dẫn check-in rất rõ ràng.',
          images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 4, checkin: 5, accuracy: 4, location: 5, value: 4 }
        },

        // 12. Dương Mỹ Linh (5★, 2 photos)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Dương Mỹ Linh',
          stayInfo: { checkIn: new Date('2026-08-20'), checkOut: new Date('2026-08-23'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-9390' },
          bookingCode: 'BK-9390',
          createdAt: new Date('2026-08-24T09:45:00'),
          comment: 'Một trong những nơi lưu trú ưng ý nhất tại Sơn Trà! Giường êm ngủ sâu giấc, không gian thoáng đãng.',
          images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 13. Nguyễn Gia Bảo (4★, 1 photo)
        {
          roomId: room2._id,
          rating: 4,
          fullName: 'Nguyễn Gia Bảo',
          stayInfo: { checkIn: new Date('2026-08-12'), checkOut: new Date('2026-08-15'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9350' },
          bookingCode: 'BK-9350',
          createdAt: new Date('2026-08-16T13:20:00'),
          comment: 'View đẹp mê li, mọi thứ đều tốt, chỉ có đoạn đường vào hơi dốc nhẹ với xe gầm thấp.',
          images: [
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 4, accuracy: 4, location: 4, value: 4 }
        },

        // 14. Phan Thùy Chi (5★, 2 photos)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Phan Thùy Chi',
          stayInfo: { checkIn: new Date('2026-08-05'), checkOut: new Date('2026-08-07'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-9310' },
          bookingCode: 'BK-9310',
          createdAt: new Date('2026-08-08T15:00:00'),
          comment: 'Bình minh rực rỡ chiếu vào phòng đẹp ngỡ ngàng. Cảm ơn host vì sự đón tiếp nồng hậu.',
          images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 15. Tạ Quang Thắng (3★, 1 photo)
        {
          roomId: room3._id,
          rating: 3,
          fullName: 'Tạ Quang Thắng',
          stayInfo: { checkIn: new Date('2026-07-28'), checkOut: new Date('2026-07-30'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-9270' },
          bookingCode: 'BK-9270',
          createdAt: new Date('2026-07-31T18:25:00'),
          comment: 'Phòng ổn so với tầm giá. Nhưng máy lạnh kêu hơi to khi bật chế độ quạt mạnh.',
          images: [
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80'
          ],
          categories: { cleanliness: 4, service: 3, checkin: 4, accuracy: 4, location: 4, value: 3 }
        },

        // 16. Nguyễn Thúy Hằng (5★, 1 photo)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Nguyễn Thúy Hằng',
          stayInfo: { checkIn: new Date('2026-07-20'), checkOut: new Date('2026-07-23'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9220' },
          bookingCode: 'BK-9220',
          createdAt: new Date('2026-07-24T12:00:00'),
          comment: 'Gia đình mình có kỳ nghỉ rất trọn vẹn tại Đà Lạt. Các dịch vụ đều rất chỉn chu và ấm áp.',
          images: [
            'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 17. Trần Đức Anh (5★, 2 photos)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Trần Đức Anh',
          stayInfo: { checkIn: new Date('2026-07-10'), checkOut: new Date('2026-07-12'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-9180' },
          bookingCode: 'BK-9180',
          createdAt: new Date('2026-07-13T09:10:00'),
          comment: 'Bungalow sát biển rất tiện đi tắm biển sớm. Nước ngọt tắm tráng ngay sân vườn.',
          images: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 18. Lê Thị Cẩm Tú (5★, 1 photo) - 18th photo review (Exactly 18 photo reviews!)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Lê Thị Cẩm Tú',
          stayInfo: { checkIn: new Date('2026-07-01'), checkOut: new Date('2026-07-03'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9130' },
          bookingCode: 'BK-9130',
          createdAt: new Date('2026-07-04T16:40:00'),
          comment: 'Hồ bơi vô cực nước ấm ngắm cảnh đồi thông lúc hoàng hôn là trải nghiệm không thể quên.',
          images: [
            'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80'
          ],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // Remaining 14 reviews without photos (to total 32):
        // 19. Đặng Quốc Hùng (5★, no photo)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Đặng Quốc Hùng',
          stayInfo: { checkIn: new Date('2026-06-25'), checkOut: new Date('2026-06-27'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9090' },
          bookingCode: 'BK-9090',
          createdAt: new Date('2026-06-28T11:20:00'),
          comment: 'Biệt thự rất sạch sẽ, nội thất gỗ sang trọng. Chủ nhà Robin giao tiếp rất lịch sự và phản hồi cực nhanh.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 20. Trịnh Lan Anh (5★, no photo)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Trịnh Lan Anh',
          stayInfo: { checkIn: new Date('2026-06-18'), checkOut: new Date('2026-06-20'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-9050' },
          bookingCode: 'BK-9050',
          createdAt: new Date('2026-06-21T08:50:00'),
          comment: 'Địa điểm tuyệt vời để thư giãn. Không khí trong lành và tiếng sóng biển giúp ngủ rất ngon.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 21. Vũ Hoàng Long (5★, no photo)
        {
          roomId: room3._id,
          rating: 5,
          fullName: 'Vũ Hoàng Long',
          stayInfo: { checkIn: new Date('2026-06-12'), checkOut: new Date('2026-06-14'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-9010' },
          bookingCode: 'BK-9010',
          createdAt: new Date('2026-06-15T15:30:00'),
          comment: 'Căn hộ tiện nghi, máy giặt hoạt động tốt, rất phù hợp cho chuyến công tác kết hợp du lịch ngắn ngày.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 22. Nguyễn Thị Hảo (5★, no photo)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Nguyễn Thị Hảo',
          stayInfo: { checkIn: new Date('2026-06-05'), checkOut: new Date('2026-06-08'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-8970' },
          bookingCode: 'BK-8970',
          createdAt: new Date('2026-06-09T14:15:00'),
          comment: 'Chủ nhà chuẩn bị trà thảo mộc thơm phức đón khách. Cảm giác như đang ở chính ngôi nhà của mình.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 4, value: 5 }
        },

        // 23. Bùi Quang Huy (5★, no photo)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Bùi Quang Huy',
          stayInfo: { checkIn: new Date('2026-05-28'), checkOut: new Date('2026-05-30'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-8930' },
          bookingCode: 'BK-8930',
          createdAt: new Date('2026-05-31T17:40:00'),
          comment: 'Bungalow đẹp, sát biển mát mẻ. Rất đáng đồng tiền bát gạo!',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 24. Đỗ Hồng Nhung (5★, no photo)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Đỗ Hồng Nhung',
          stayInfo: { checkIn: new Date('2026-05-20'), checkOut: new Date('2026-05-22'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-8890' },
          bookingCode: 'BK-8890',
          createdAt: new Date('2026-05-23T10:05:00'),
          comment: 'View hồ sương sớm Đà Lạt không có điểm nào để chê. Tiện nghi nhà bếp đầy đủ gia vị nấu nướng.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 4 }
        },

        // 25. Ngô Gia Khánh (5★, no photo)
        {
          roomId: room3._id,
          rating: 5,
          fullName: 'Ngô Gia Khánh',
          stayInfo: { checkIn: new Date('2026-05-12'), checkOut: new Date('2026-05-14'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-8850' },
          bookingCode: 'BK-8850',
          createdAt: new Date('2026-05-15T19:00:00'),
          comment: 'Check-in bằng SmartLock tiện lợi, không phải chờ đợi. Phòng sạch sẽ và thơm tho.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 4, value: 5 }
        },

        // 26. Hồ Ngọc Diệp (5★, no photo)
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Hồ Ngọc Diệp',
          stayInfo: { checkIn: new Date('2026-05-02'), checkOut: new Date('2026-05-04'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-8810' },
          bookingCode: 'BK-8810',
          createdAt: new Date('2026-05-05T09:30:00'),
          comment: 'Không gian yên tĩnh, bãi cát sạch. Chủ nhà nhiệt tình hỗ trợ thuê xe máy giá rẻ.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 27. Lâm Nhật Hoàng (5★, no photo)
        {
          roomId: room2._id,
          rating: 5,
          fullName: 'Lâm Nhật Hoàng',
          stayInfo: { checkIn: new Date('2026-04-25'), checkOut: new Date('2026-04-27'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-8770' },
          bookingCode: 'BK-8770',
          createdAt: new Date('2026-04-28T13:45:00'),
          comment: 'Hồ bơi nước ấm hoạt động rất tốt, không khí se lạnh Đà Lạt bơi rất sướng. Sẽ ủng hộ dài dài.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        },

        // 28. Tôn Nữ Bích Trâm (4★, no photo)
        {
          roomId: room3._id,
          rating: 4,
          fullName: 'Tôn Nữ Bích Trâm',
          stayInfo: { checkIn: new Date('2026-04-18'), checkOut: new Date('2026-04-20'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-8730' },
          bookingCode: 'BK-8730',
          createdAt: new Date('2026-04-21T18:10:00'),
          comment: 'Phòng đẹp như ảnh quảng cáo. Ban công ngồi uống trà chiều ngắm phố phường rất thích.',
          images: [],
          categories: { cleanliness: 4, service: 5, checkin: 5, accuracy: 5, location: 4, value: 4 }
        },

        // 29. Lý Hải Triều (4★, no photo)
        {
          roomId: room1._id,
          rating: 4,
          fullName: 'Lý Hải Triều',
          stayInfo: { checkIn: new Date('2026-04-10'), checkOut: new Date('2026-04-12'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-8690' },
          bookingCode: 'BK-8690',
          createdAt: new Date('2026-04-13T10:50:00'),
          comment: 'Vị trí đắc địa, cảnh quan tuyệt đẹp. Giá phòng cuối tuần hơi cao một chút nhưng xứng đáng.',
          images: [],
          categories: { cleanliness: 5, service: 4, checkin: 5, accuracy: 4, location: 5, value: 4 }
        },

        // 30. Vương Bảo Trâm (3★, no photo)
        {
          roomId: room2._id,
          rating: 3,
          fullName: 'Vương Bảo Trâm',
          stayInfo: { checkIn: new Date('2026-04-02'), checkOut: new Date('2026-04-04'), roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-8650' },
          bookingCode: 'BK-8650',
          createdAt: new Date('2026-04-05T15:20:00'),
          comment: 'Cảnh quan tuyệt vời nhưng hôm mình đến trời mưa lớn nên mạng chập chờn. Hy vọng cơ sở nâng cấp đường truyền cáp quang.',
          images: [],
          categories: { cleanliness: 4, service: 4, checkin: 4, accuracy: 3, location: 5, value: 3 }
        },

        // 31. Chu Đình Nghiêm (1★, no photo) - 1 star review (Strictly 1 in 1★ bucket!)
        {
          roomId: room3._id,
          rating: 1,
          fullName: 'Chu Đình Nghiêm',
          stayInfo: { checkIn: new Date('2026-03-22'), checkOut: new Date('2026-03-24'), roomTitle: 'Studio Ban Công Hoàng Hôn Sơn Trà', bookingCode: 'BK-8610' },
          bookingCode: 'BK-8610',
          createdAt: new Date('2026-03-25T11:40:00'),
          comment: 'Hôm nhận phòng tầng trên sửa chữa khoan đục ồn ào không ngủ trưa được. Chủ nhà có sang xin lỗi nhưng trải nghiệm hôm đó không tốt.',
          images: [],
          categories: { cleanliness: 3, service: 2, checkin: 3, accuracy: 2, location: 3, value: 1 }
        },

        // 32. Triệu Lệ Quyên (5★, no photo) - Completes 22 5★ reviews!
        {
          roomId: room1._id,
          rating: 5,
          fullName: 'Triệu Lệ Quyên',
          stayInfo: { checkIn: new Date('2026-03-15'), checkOut: new Date('2026-03-17'), roomTitle: 'Ocean View Bungalow – An Nhiên', bookingCode: 'BK-8570' },
          bookingCode: 'BK-8570',
          createdAt: new Date('2026-03-18T16:15:00'),
          comment: 'Bungalow đẹp tuyệt trần, yên tĩnh, thích hợp cho ai muốn trốn khói bụi thành phố để nạp lại năng lượng.',
          images: [],
          categories: { cleanliness: 5, service: 5, checkin: 5, accuracy: 5, location: 5, value: 5 }
        }
      ];

      // Create booking documents for each review to preserve referential integrity
      for (const revData of sampleReviews) {
        let booking = await Booking.findOne({ bookingCode: revData.bookingCode });
        if (!booking) {
          booking = await Booking.create({
            bookingCode: revData.bookingCode,
            roomId: revData.roomId,
            fullName: revData.fullName,
            phoneNumber: '0908' + Math.floor(100000 + Math.random() * 900000),
            email: revData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@gmail.com',
            checkIn: revData.stayInfo.checkIn,
            checkOut: revData.stayInfo.checkOut,
            nights: Math.max(1, Math.round((revData.stayInfo.checkOut - revData.stayInfo.checkIn) / (1000 * 60 * 60 * 24))),
            guests: 2,
            totalPrice: 2500000,
            paymentMethod: 'Smart Travel Pay',
            status: 'COMPLETED'
          });
        }
        revData.bookingId = booking._id;
        await Review.create(revData);
      }

      console.log(`✅ Seeded ${sampleReviews.length} real reviews for Robin Nguyen (matching exact mockup metrics)`);
    }

    return host;
  } catch (error) {
    console.error('Error seeding Robin Host:', error);
    return null;
  }
}

import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

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
    const existingRooms = await Room.find({ ownerId: host._id });
    if (existingRooms.length === 0) {
      const room1 = await Room.create({
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

      const room2 = await Room.create({
        ownerId: host._id,
        roomCode: 'P-VLZ04',
        title: 'Villa Mộng Mơ View Hồ & Rừng Thông',
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
        description: 'Biệt thự nguyên căn view bao trọn rừng thông và mặt hồ sương mù Tuyền Lâm. Thiết kế gỗ mộc ấm cúng kết hợp kính tràn panorama, ban công rộng ngắm bình minh và tiệc BBQ ngoài trời, trang bị bồn tắm kính ngắm sao và lò sưởi thông minh hiện đại. Không gian riêng tuyệt đối cho gia đình và nhóm bạn muốn chữa lành tâm hồn.',
        location: { type: 'Point', coordinates: [108.4321, 11.8984] },
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

      const room3 = await Room.create({
        ownerId: host._id,
        roomCode: 'P-VLZ08',
        title: 'Studio Ban Công Hoàng Hôn',
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
        status: 'Archived',
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

      // Also create sample pending bookings for Robin's rooms
      const existingBk1 = await Booking.findOne({ bookingCode: 'BK-9821' });
      if (!existingBk1) {
        await Booking.create({
          bookingCode: 'BK-9821',
          roomId: room2._id,
          fullName: 'Nguyễn Văn An',
          phoneNumber: '0932.849.678',
          email: 'an.nguyen@gmail.com',
          checkIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          nights: 3,
          guests: 2,
          totalPrice: 7500000,
          paymentMethod: 'Smart Travel Pay',
          status: 'PENDING',
          specialRequests: 'Xin vui lòng hỗ trợ nhận phòng sớm lúc 13H00 nếu phòng đã dọn xong. Cảm ơn chủ nhà!'
        });
      }

      const existingBk2 = await Booking.findOne({ bookingCode: 'BK-9819' });
      if (!existingBk2) {
        await Booking.create({
          bookingCode: 'BK-9819',
          roomId: room1._id,
          fullName: 'Trần Thị Minh Trang',
          phoneNumber: '0985.765.432',
          email: 'minhtrang@travel.vn',
          checkIn: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          checkOut: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          nights: 2,
          guests: 2,
          totalPrice: 2125000,
          paymentMethod: 'Apple Pay',
          status: 'PENDING',
          specialRequests: 'Chuyến đi kỷ niệm ngày cưới của vợ chồng mình, nhờ chủ nhà setup giúp một bình hoa tươi hoặc nến thơm trong phòng ngủ nhé. Xin cảm ơn!'
        });
      }

      console.log('✅ Seeded initial rooms & bookings for Robin Nguyen');
    }

    return host;
  } catch (error) {
    console.error('Error seeding Robin Host:', error);
    return null;
  }
}

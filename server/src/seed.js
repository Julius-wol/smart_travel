import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Room from './models/Room.js';
import User from './models/User.js';

const seedRooms = [
  // 1. Đà Nẵng
  {
    _id: '6ace59ef30cddf9c0815f9bc',
    title: 'An Nhiên Eco Retreat Đà Nẵng',
    description: 'Nằm nép mình bên bán đảo Sơn Trà thơ mộng, An Nhiên Eco Retreat mang đến không gian nghỉ dưỡng xanh mát, ban công hướng trọn bình minh biển Mỹ Khê.',
    address: 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    pricePerNight: 1450000,
    originalPrice: 1850000,
    discountPercent: 22,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    ],
    amenities: ['Wifi', 'Bếp riêng', 'Điều hòa', 'View biển', 'Bồn tắm', 'Đỗ xe'],
    rating: 4.98,
    reviewCount: 142,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    distanceInfo: 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
    location: { lat: 16.0825, lng: 108.2435 },
  },
  {
    _id: '6ace59ef30cddf9c0815f9c5',
    title: 'The Muse Bohemian Studio',
    description: 'Studio phong cách Bohemian mộc mạc và cá tính ngay khu phố Tây An Thượng nhộn nhịp, chỉ cách bãi tắm Mỹ Khê 3 phút đi bộ.',
    address: 'Đường An Thượng 24, Ngũ Hành Sơn, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    pricePerNight: 750000,
    originalPrice: 950000,
    discountPercent: 21,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    amenities: ['Wifi', 'Bếp nhỏ', 'Smart TV', 'Điều hòa', 'Gần biển'],
    rating: 4.85,
    reviewCount: 94,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 24h',
    distanceInfo: 'Cách bãi tắm Mỹ Khê 200m • Khu phố ẩm thực An Thượng',
    location: { lat: 16.0503, lng: 108.2418 },
  },
  {
    _id: '6ace59ef30cddf9c0815f9ca',
    title: 'Mộc Garden Villa & Coffee',
    description: 'Biệt thự sân vườn biệt lập với hồ bơi riêng và khu tiệc nướng BBQ ngoài trời, lý tưởng cho gia đình hoặc nhóm bạn khám phá Đà Nẵng.',
    address: 'Đường Hà Bổng, Phước Mỹ, Sơn Trà, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    pricePerNight: 920000,
    originalPrice: 1150000,
    discountPercent: 20,
    maxGuests: 8,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    amenities: ['Hồ bơi riêng', 'Sân BBQ', 'Wifi', 'Đỗ xe 7 chỗ', 'Điều hòa'],
    rating: 5.0,
    reviewCount: 56,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    distanceInfo: 'Cách cầu Rồng 2km • Sát chợ đêm Sơn Trà',
    location: { lat: 16.0667, lng: 108.2452 },
  },

  // 2. Đà Lạt
  {
    title: 'Mơ Màng Pine Hill Homestay Đà Lạt',
    description: 'Căn nhà gỗ ấm cúng tọa lạc giữa đồi thông xanh ngát, ngắm mây bay lãng đãng mỗi sớm mai và hoàng hôn chiều tà tuyệt đẹp.',
    address: 'Đường Khởi Nghĩa Bắc Sơn, Phường 10, TP. Đà Lạt',
    city: 'Đà Lạt',
    district: 'Phường 10',
    pricePerNight: 680000,
    originalPrice: 850000,
    discountPercent: 20,
    maxGuests: 3,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
    amenities: ['Wifi', 'Lò sưởi', 'Sân vườn BBQ', 'Ban công view thung lũng', 'Bếp chung'],
    rating: 4.92,
    reviewCount: 88,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    distanceInfo: 'Cách Hồ Xuân Hương 1.8km • Gần Dinh 2',
    location: { lat: 11.9365, lng: 108.4552 },
  },
  {
    title: 'Hoàng Hôn Rực Rỡ Villa Đà Lạt',
    description: 'Villa kính ngắm trọn thung lũng đèn đêm Đà Lạt huyền ảo, thiết kế Scandinavian hiện đại tinh tế, view cực chill.',
    address: 'Đường Hùng Vương, Phường 11, TP. Đà Lạt',
    city: 'Đà Lạt',
    district: 'Phường 11',
    pricePerNight: 1250000,
    originalPrice: 1550000,
    discountPercent: 19,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    ],
    amenities: ['Wifi', 'Bồn tắm view kính', 'Bếp đầy đủ', 'Sân nướng BBQ', 'Chỗ đỗ xe'],
    rating: 4.96,
    reviewCount: 110,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 72h',
    distanceInfo: 'Cách quảng trường Lâm Viên 3.5km',
    location: { lat: 11.9482, lng: 108.4715 },
  },

  // 3. Hà Nội
  {
    title: 'Old Quarter Heritage Loft Hà Nội',
    description: 'Căn hộ tầng áp mái đậm chất Indochine cổ kính ngay giữa lòng phố cổ Hà Nội, ban công nhìn ra phố đi bộ Tạ Hiện rực rỡ sắc màu.',
    address: 'Phố Hàng Bạc, Hoàn Kiếm, Hà Nội',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    pricePerNight: 850000,
    originalPrice: 1100000,
    discountPercent: 23,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b2b93e0b4?w=800&q=80',
    ],
    amenities: ['Wifi', 'Điều hòa 2 chiều', 'Smart TV', 'Máy giặt', 'Bếp riêng'],
    rating: 4.89,
    reviewCount: 76,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 24h',
    distanceInfo: 'Cách Hồ Hoàn Kiếm 300m • Đi bộ ra phố đi bộ',
    location: { lat: 21.0336, lng: 105.8524 },
  },
  {
    title: 'Westlake Sunset Suite Tây Hồ',
    description: 'Căn hộ hướng trọn mặt nước Hồ Tây mênh mông, đón gió mát trong lành và ngắm hoàng hôn đỏ rực tuyệt tác của thủ đô.',
    address: 'Đường Quảng An, Tây Hồ, Hà Nội',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    pricePerNight: 1150000,
    originalPrice: 1400000,
    discountPercent: 18,
    maxGuests: 3,
    images: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4b4f?w=800&q=80',
    ],
    amenities: ['Wifi', 'Bồn tắm view hồ', 'Bếp hiện đại', 'Smart TV', 'Đỗ xe'],
    rating: 4.93,
    reviewCount: 65,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    distanceInfo: 'Sát mặt nước Hồ Tây • Gần phủ Tây Hồ',
    location: { lat: 21.0638, lng: 105.8239 },
  },

  // 4. TP. Hồ Chí Minh
  {
    title: 'Saigon Skyview Luxury Studio Quận 1',
    description: 'Studio cao cấp tại tầng 32 với view toàn cảnh Landmark 81 và sông Sài Gòn rực rỡ ánh đèn đêm, tiện nghi 5 sao.',
    address: 'Đường Bến Vân Đồn, Quận 4, TP. Hồ Chí Minh',
    city: 'Hồ Chí Minh',
    district: 'Quận 4',
    pricePerNight: 980000,
    originalPrice: 1250000,
    discountPercent: 22,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
    ],
    amenities: ['Wifi', 'Hồ bơi vô cực tòa nhà', 'Phòng Gym', 'Smart TV', 'Bếp', 'Máy sấy'],
    rating: 4.91,
    reviewCount: 135,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 24h',
    distanceInfo: 'Qua cầu Khánh Hội 5 phút tới chợ Bến Thành Quận 1',
    location: { lat: 10.7684, lng: 106.7025 },
  },
  {
    title: 'Thảo Điền Secret Garden Villa',
    description: 'Biệt thự phong cách nhiệt đới ẩn mình giữa bán đảo Thảo Điền yên bình, hồ bơi riêng biệt lập, không gian xanh thư thái tuyệt đối.',
    address: 'Đường Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    city: 'Hồ Chí Minh',
    district: 'Thành phố Thủ Đức',
    pricePerNight: 2450000,
    originalPrice: 3000000,
    discountPercent: 18,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
    ],
    amenities: ['Hồ bơi riêng', 'Sân vườn nhiệt đới', 'Wifi', 'Bếp mở cao cấp', 'BBQ', 'Đỗ xe'],
    rating: 4.97,
    reviewCount: 42,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 72h',
    distanceInfo: 'Khu phố ẩm thực Tây Thảo Điền',
    location: { lat: 10.8123, lng: 106.7345 },
  },

  // 5. Phú Quốc
  {
    title: 'Phú Quốc Sunset Horizon Bungalow',
    description: 'Bungalow mái lá sang trọng nằm ngay trên bờ cát trắng Bãi Trường, bước chân ra cửa là chạm sóng biển xanh ngọc bích.',
    address: 'Bãi Trường, Dương Tơ, TP. Phú Quốc, Kiên Giang',
    city: 'Phú Quốc',
    district: 'Dương Tơ',
    pricePerNight: 1650000,
    originalPrice: 2100000,
    discountPercent: 21,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    ],
    amenities: ['Sát biển', 'Wifi', 'Bể bơi', 'Nhà hàng ven biển', 'Điều hòa', 'Ăn sáng miễn phí'],
    rating: 4.94,
    reviewCount: 98,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    distanceInfo: 'Cách sân bay Phú Quốc 10 phút lái xe',
    location: { lat: 10.1582, lng: 103.9687 },
  },

  // 6. Sa Pa
  {
    title: 'Mây Sa Pa Mountain View Lodge',
    description: 'Homestay lưng chừng mây ngắm trọn thung lũng Mường Hoa và đỉnh Fansipan hùng vĩ, phong cách mộc bản địa độc đáo.',
    address: 'Bản Tả Van, Thị xã Sa Pa, Lào Cai',
    city: 'Sa Pa',
    district: 'Tả Van',
    pricePerNight: 720000,
    originalPrice: 900000,
    discountPercent: 20,
    maxGuests: 3,
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    ],
    amenities: ['Wifi', 'Ban công săn mây', 'Lò sưởi củi', 'Tắm lá thuốc Dao Đỏ', 'Bếp nướng'],
    rating: 4.95,
    reviewCount: 84,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    distanceInfo: 'Trung tâm bản Tả Van • Cách nhà thờ đá Sa Pa 7km',
    location: { lat: 22.3025, lng: 103.8824 },
  },

  // 7. Hội An
  {
    title: 'Hội An Ancient Riverside Homestay',
    description: 'Ngôi nhà gạch nung ngập tràn hoa giấy bên bờ sông Hoài thơ mộng, không gian tĩnh lặng, miễn phí xe đạp dạo phố cổ.',
    address: 'Đường Huyền Trân Công Chúa, Cẩm Châu, TP. Hội An',
    city: 'Hội An',
    district: 'Cẩm Châu',
    pricePerNight: 650000,
    originalPrice: 800000,
    discountPercent: 19,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    ],
    amenities: ['Wifi', 'Xe đạp miễn phí', 'Ban công view sông', 'Bếp nhỏ', 'Điều hòa'],
    rating: 4.91,
    reviewCount: 67,
    status: 'ACTIVE',
    cancellationPolicy: 'Miễn phí hủy phòng trước 24h',
    distanceInfo: 'Cách Chùa Cầu Hội An 1.2km • Cách biển An Bàng 3km',
    location: { lat: 15.8794, lng: 108.3382 },
  },
];

async function runSeed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI không được tìm thấy trong file .env');
    }

    console.log('Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Kết nối MongoDB Atlas thành công!');

    // Lấy default owner user nếu có
    let owner = await User.findOne({ email: 'datdinh1006dn@gmail.com' });
    if (!owner) {
      owner = await User.findOne({});
    }
    const defaultOwnerId = owner ? owner._id : new mongoose.Types.ObjectId();

    console.log(`Bắt đầu đồng bộ ${seedRooms.length} homestay lên MongoDB Atlas...`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const roomData of seedRooms) {
      const { _id, ...roomFields } = roomData;
      const payload = {
        ...roomFields,
        ownerId: defaultOwnerId,
      };

      if (_id && mongoose.isValidObjectId(_id)) {
        const existing = await Room.findById(_id);
        if (existing) {
          await Room.findByIdAndUpdate(_id, payload);
          updatedCount++;
        } else {
          await Room.create({ _id, ...payload });
          insertedCount++;
        }
      } else {
        const existing = await Room.findOne({ title: roomFields.title });
        if (existing) {
          await Room.findByIdAndUpdate(existing._id, payload);
          updatedCount++;
        } else {
          await Room.create(payload);
          insertedCount++;
        }
      }
    }

    const totalRooms = await Room.countDocuments({ status: 'ACTIVE' });
    console.log(`Đã hoàn tất đồng bộ dữ liệu Atlas:`);
    console.log(`- Tạo mới: ${insertedCount} phòng`);
    console.log(`- Cập nhật: ${updatedCount} phòng`);
    console.log(`- Tổng số phòng ACTIVE trên MongoDB Atlas hiện tại: ${totalRooms}`);

    // Liệt kê danh sách thành phố có phòng trên Atlas
    const cities = await Room.distinct('city');
    console.log('Các thành phố có sẵn homestay để test:', cities.join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu lên Atlas:', error);
    process.exit(1);
  }
}

runSeed();

import Room from '../models/Room.js';

// Danh sách dữ liệu mẫu chuẩn thực tế tại Đà Nẵng
const SEED_DATA = [
  {
    title: 'An Nhiên Eco Retreat Đà Nẵng',
    description: 'Nằm nép mình bên bán đảo Sơn Trà thơ mộng, An Nhiên Eco Retreat mang đến không gian nghỉ dưỡng xanh mát, ban công hướng trọn bình minh biển Mỹ Khê.',
    address: 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    distance: 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
    pricePerNight: 1450000,
    maxGuests: 4,
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
      { id: '1', name: 'Wifi tốc độ cao', icon: 'wifi' },
      { id: '2', name: 'Bếp riêng cao cấp', icon: 'restaurant' },
      { id: '3', name: 'Bồn tắm gỗ pơ-mu', icon: 'water' },
      { id: '4', name: 'Máy chiếu phim 4K', icon: 'videocam' },
      { id: '5', name: 'Giặt & sấy khô', icon: 'shirt' },
      { id: '6', name: 'Điều hòa 2 chiều', icon: 'snow' },
      { id: '7', name: 'Ban công view biển', icon: 'sunny' },
      { id: '8', name: 'Chỗ đỗ xe ô tô', icon: 'car' },
    ],
    rating: 4.9,
    reviewCount: 128,
    ratingBreakdown: {
      overall: 4.9,
      cleanliness: 5.0,
      location: 4.9,
      service: 4.9,
      amenities: 4.8,
      value: 4.9,
    },
    policy: {
      checkIn: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)',
      checkOut: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)',
      cancellation: 'Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00. Sau thời gian này áp dụng chính sách của chủ nhà.',
    },
    location: { type: 'Point', coordinates: [108.2435, 16.0825] },
    status: 'ACTIVE',
  },
  {
    title: 'The Muse Bohemian Studio',
    description: 'Studio phong cách Bohemian mộc mạc và cá tính ngay khu phố Tây An Thượng nhộn nhịp, chỉ cách bãi tắm Mỹ Khê 3 phút đi bộ.',
    address: 'Đường An Thượng 24, Ngũ Hành Sơn, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    distance: 'Cách bãi tắm Mỹ Khê 200m • Khu phố ẩm thực An Thượng',
    pricePerNight: 750000,
    maxGuests: 2,
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
      { id: '1', name: 'Wifi tốc độ cao', icon: 'wifi' },
      { id: '2', name: 'Bếp nhỏ tiện lợi', icon: 'restaurant' },
      { id: '3', name: 'Smart TV Netflix', icon: 'tv' },
      { id: '4', name: 'Điều hòa 2 chiều', icon: 'snow' },
    ],
    rating: 4.85,
    reviewCount: 94,
    location: { type: 'Point', coordinates: [108.2418, 16.0503] },
    status: 'ACTIVE',
  },
  {
    title: 'Mộc Garden Villa & Coffee',
    description: 'Biệt thự sân vườn biệt lập với hồ bơi riêng và khu tiệc nướng BBQ ngoài trời, lý tưởng cho gia đình hoặc nhóm bạn khám phá Đà Nẵng.',
    address: 'Đường Hà Bổng, Phước Mỹ, Sơn Trà, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    distance: 'Cách cầu Rồng 2km • Sát chợ đêm Sơn Trà',
    pricePerNight: 920000,
    maxGuests: 8,
    badge: 'GIẢM 20% HÔM NAY',
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
      { id: '1', name: 'Hồ bơi riêng ngoài trời', icon: 'water' },
      { id: '2', name: 'Sân BBQ gia đình', icon: 'flame' },
      { id: '3', name: 'Wifi tốc độ cao', icon: 'wifi' },
      { id: '4', name: 'Chỗ đỗ xe ô tô 7 chỗ', icon: 'car' },
    ],
    rating: 4.95,
    reviewCount: 156,
    location: { type: 'Point', coordinates: [108.2452, 16.0667] },
    status: 'ACTIVE',
  },
];

// 1. Lấy danh sách tất cả các phòng (hỗ trợ lọc theo keyword, category, city)
export const getAllRooms = async (req, res) => {
  try {
    const { category, search, city, guests } = req.query;

    // Tự động kiểm tra và khởi tạo dữ liệu mẫu nếu DB trống
    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany(SEED_DATA);
      console.log('✅ Đã nạp thành công dữ liệu homestay mẫu vào MongoDB!');
    }

    const conditions = [{ status: { $in: ['ACTIVE', 'Published'] } }];

    if (city && city.trim()) {
      conditions.push({ city: { $regex: city.trim(), $options: 'i' } });
    }

    if (category && category !== 'Tất cả') {
      conditions.push({
        $or: [
          { tags: { $in: [category] } },
          { 'specs.type': { $regex: category, $options: 'i' } }
        ]
      });
    }

    if (search && search.trim()) {
      const s = search.trim();
      conditions.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { address: { $regex: s, $options: 'i' } },
          { city: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
          { tags: { $elemMatch: { $regex: s, $options: 'i' } } }
        ]
      });
    }

    if (guests && Number(guests) > 0) {
      conditions.push({
        maxGuests: { $gte: Number(guests) }
      });
    }

    const query = conditions.length === 1 ? conditions[0] : { $and: conditions };
    const rooms = await Room.find(query).sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách phòng' });
  }
};

// 2. Lấy chi tiết 1 phòng theo ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nơi lưu trú này' });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phòng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết phòng' });
  }
};

// 3. API Reset/Seed lại dữ liệu mẫu
export const seedRooms = async (req, res) => {
  try {
    await Room.deleteMany({});
    const inserted = await Room.insertMany(SEED_DATA);
    return res.status(200).json({
      success: true,
      message: 'Khởi tạo lại dữ liệu mẫu thành công',
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error('Lỗi seed phòng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi seed dữ liệu' });
  }
};

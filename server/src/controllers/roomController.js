import mongoose from 'mongoose';
import Room from '../models/Room.js';

// Host mặc định cho dữ liệu mẫu
const DEFAULT_HOST_ID = new mongoose.Types.ObjectId('664c1234567890abcdef1001');

// Danh sách dữ liệu mẫu chuẩn Schema v2.0 tại Đà Nẵng
export const SEED_DATA = [
  {
    roomCode: 'MP-0101',
    ownerId: DEFAULT_HOST_ID,
    roomType: 'HOMESTAY',
    title: 'An Nhiên Eco Retreat Đà Nẵng',
    description: 'Nằm nép mình bên bán đảo Sơn Trà thơ mộng, An Nhiên Eco Retreat mang đến không gian nghỉ dưỡng xanh mát, ban công hướng trọn bình minh biển Mỹ Khê.',
    address: 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    distance: 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
    regularPrice: 1450000,
    weekendPrice: 1650000,
    pricePerNight: 1450000,
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
    numReviews: 128,
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
      checkIn: '14:00 (Nhận phòng trực tiếp bằng mã vé điện tử e-Pass hoặc chìa khóa trao tay)',
      checkOut: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)',
      cancellation: 'Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00.',
    },
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    location: {
      type: 'Point',
      coordinates: [108.2435, 16.0825],
    },
    status: 'PUBLISHED',
  },
  {
    roomCode: 'MP-0102',
    ownerId: DEFAULT_HOST_ID,
    roomType: 'APARTMENT',
    title: 'The Muse Bohemian Studio',
    description: 'Studio phong cách Bohemian mộc mạc và cá tính ngay khu phố Tây An Thượng nhộn nhịp, chỉ cách bãi tắm Mỹ Khê 3 phút đi bộ.',
    address: 'Đường An Thượng 24, Ngũ Hành Sơn, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    distance: 'Cách bãi tắm Mỹ Khê 200m • Khu phố ẩm thực An Thượng',
    regularPrice: 750000,
    weekendPrice: 850000,
    pricePerNight: 750000,
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
      { id: '1', name: 'Wifi tốc độ cao', icon: 'wifi' },
      { id: '2', name: 'Bếp nhỏ tiện lợi', icon: 'restaurant' },
      { id: '3', name: 'Smart TV Netflix', icon: 'tv' },
      { id: '4', name: 'Điều hòa 2 chiều', icon: 'snow' },
    ],
    rating: 4.85,
    numReviews: 94,
    reviewCount: 94,
    policy: {
      checkIn: '14:00 (Nhận phòng trực tiếp bằng mã vé điện tử e-Pass)',
      checkOut: '12:00',
      cancellation: 'Miễn phí hủy phòng trước 48h.',
    },
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    location: {
      type: 'Point',
      coordinates: [108.2418, 16.0503],
    },
    status: 'PUBLISHED',
  },
  {
    roomCode: 'MP-0103',
    ownerId: DEFAULT_HOST_ID,
    roomType: 'VILLA',
    title: 'Mộc Garden Villa & Coffee',
    description: 'Biệt thự sân vườn biệt lập với hồ bơi riêng và khu tiệc nướng BBQ ngoài trời, lý tưởng cho gia đình hoặc nhóm bạn khám phá Đà Nẵng.',
    address: 'Đường Hà Bổng, Phước Mỹ, Sơn Trà, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    distance: 'Cách cầu Rồng 2km • Sát chợ đêm Sơn Trà',
    regularPrice: 920000,
    weekendPrice: 1100000,
    pricePerNight: 920000,
    freeCancellationBeforeHours: 48,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    maxGuests: 8,
    numBedrooms: 3,
    numBeds: 4,
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
    numReviews: 156,
    reviewCount: 156,
    policy: {
      checkIn: '14:00 (Nhận phòng trực tiếp bằng mã vé điện tử e-Pass)',
      checkOut: '12:00',
      cancellation: 'Miễn phí hủy phòng trước 48h.',
    },
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    location: {
      type: 'Point',
      coordinates: [108.2452, 16.0667],
    },
    status: 'PUBLISHED',
  },
];

/**
 * 1. Lấy danh sách homestay hỗ trợ tìm kiếm và lọc đa tiêu chí
 * GET /api/rooms hoặc GET /api/v1/rooms
 */
export const getAllRooms = async (req, res) => {
  try {
    const {
      city,
      category,
      search,
      minPrice,
      maxPrice,
      guests,
      roomsCount,
      minRating,
      amenities,
      page = 1,
      limit = 10,
    } = req.query;

    // Tự động nạp dữ liệu mẫu nếu DB trống
    try {
      const count = await Room.countDocuments();
      if (count === 0) {
        await Room.insertMany(SEED_DATA);
        console.log('✅ Đã nạp thành công dữ liệu homestay mẫu chuẩn Schema v2.0 vào MongoDB!');
      }
    } catch (seedErr) {
      console.warn('Bỏ qua auto-seed:', seedErr.message);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Xây dựng điều kiện lọc (hỗ trợ cả PUBLISHED và ACTIVE tương thích ngược)
    const andConditions = [{ status: { $in: ['PUBLISHED', 'ACTIVE'] } }];

    // 1. Lọc theo danh mục (category)
    if (category && category !== 'Tất cả') {
      andConditions.push({
        $or: [
          { tags: { $in: [category] } },
          { roomType: { $regex: category, $options: 'i' } },
          { 'specs.type': { $regex: category, $options: 'i' } },
        ],
      });
    }

    // 2. Lọc theo từ khóa tìm kiếm tổng quát (search)
    if (search && search.trim()) {
      const s = search.trim();
      andConditions.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { roomCode: { $regex: s, $options: 'i' } },
          { address: { $regex: s, $options: 'i' } },
          { city: { $regex: s, $options: 'i' } },
          { district: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
          { tags: { $elemMatch: { $regex: s, $options: 'i' } } },
        ],
      });
    }

    // 3. Lọc theo địa điểm / thành phố (city)
    if (city && city.trim() !== '') {
      const cleanCity = city.trim();
      const cityKeywords = cleanCity.split(',').map((c) => c.trim()).filter(Boolean);
      if (cityKeywords.length > 0) {
        andConditions.push({
          $or: cityKeywords.map((kw) => ({
            $or: [
              { city: { $regex: new RegExp(kw, 'i') } },
              { district: { $regex: new RegExp(kw, 'i') } },
              { address: { $regex: new RegExp(kw, 'i') } },
              { title: { $regex: new RegExp(kw, 'i') } },
            ],
          })),
        });
      }
    }

    // 4. Lọc theo khoảng giá (regularPrice hoặc pricePerNight)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && minPrice !== '') {
        const min = Number(minPrice);
        if (!isNaN(min)) priceFilter.$gte = min;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const max = Number(maxPrice);
        if (!isNaN(max)) priceFilter.$lte = max;
      }
      if (Object.keys(priceFilter).length > 0) {
        andConditions.push({
          $or: [
            { regularPrice: priceFilter },
            { pricePerNight: priceFilter },
          ],
        });
      }
    }

    // 5. Lọc theo số lượng khách (guests)
    if (guests && !isNaN(Number(guests)) && Number(guests) > 0) {
      andConditions.push({ maxGuests: { $gte: Number(guests) } });
    }

    // 6. Lọc theo số lượng phòng (roomsCount / numBedrooms)
    if (roomsCount && !isNaN(Number(roomsCount)) && Number(roomsCount) > 1) {
      const minRooms = Number(roomsCount);
      andConditions.push({
        $or: [
          { numBedrooms: { $gte: minRooms } },
          { bedrooms: { $gte: minRooms } },
          { 'specs.bedroom': { $regex: new RegExp(`([${minRooms}-9]|\\d{2,})\\s*PN`, 'i') } },
        ],
      });
    }

    // 7. Lọc theo điểm đánh giá tối thiểu (minRating)
    if (minRating && !isNaN(Number(minRating))) {
      andConditions.push({ rating: { $gte: Number(minRating) } });
    }

    // 8. Lọc theo danh sách tiện ích mong muốn (amenities)
    if (amenities) {
      let amenityList = [];
      if (Array.isArray(amenities)) {
        amenityList = amenities;
      } else if (typeof amenities === 'string') {
        amenityList = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      }
      if (amenityList.length > 0) {
        andConditions.push({
          $or: [
            { amenities: { $all: amenityList } },
            { 'amenities.name': { $all: amenityList } },
          ],
        });
      }
    }

    const query = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    const [rooms, totalCount] = await Promise.all([
      Room.find(query)
        .populate('ownerId', 'fullName name avatar phone email hostProfile')
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Room.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const hasMore = pageNum < totalPages;

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách homestay thành công',
      count: rooms.length,
      data: {
        rooms,
        totalCount,
        page: pageNum,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách homestay:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách homestay',
      error: error.message,
    });
  }
};

/**
 * 2. Lấy chi tiết homestay theo ID
 * GET /api/rooms/:id
 */
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate('ownerId', 'fullName name avatar phone email hostProfile')
      .lean({ virtuals: true });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nơi lưu trú này',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phòng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết phòng',
      error: error.message,
    });
  }
};

/**
 * 3. Khởi tạo / nạp lại dữ liệu mẫu
 * GET /api/rooms/seed
 */
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
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi seed dữ liệu',
      error: error.message,
    });
  }
};

export const getRooms = getAllRooms;

export default {
  getAllRooms,
  getRooms,
  getRoomById,
  seedRooms,
};

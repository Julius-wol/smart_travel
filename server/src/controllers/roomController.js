import Room from '../models/Room.js';

// Dữ liệu mẫu chuẩn Schema v2.0 phục vụ auto-seed khi DB mới khởi tạo
const SEED_DATA = [
  {
    roomCode: 'DN-01',
    title: 'An Nhiên Eco Retreat Đà Nẵng',
    roomType: 'HOMESTAY',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    address: 'Đường Hoàng Sa, Bán đảo Sơn Trà',
    location: { type: 'Point', coordinates: [108.2612, 16.1045] },
    maxGuests: 4,
    numBedrooms: 2,
    numBeds: 2,
    regularPrice: 1450000,
    weekendPrice: 1650000,
    freeCancellationBeforeHours: 48,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    description: 'Nằm nép mình bên bán đảo Sơn Trà thơ mộng, An Nhiên Eco Retreat mang đến không gian nghỉ dưỡng xanh mát, ban công hướng trọn bình minh biển Mỹ Khê.',
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
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    ],
    status: 'PUBLISHED',
    rating: 4.9,
    numReviews: 48,
    badge: 'TOP 1% SƠN TRÀ',
    tags: ['Tất cả', 'Homestay', 'Eco Living', 'Gần biển'],
    distance: 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
    specs: {
      type: 'Nhà nguyên căn',
      capacity: 'Tối đa 4 khách',
      bedroom: '2 PN • 2 Giường King',
      bathroom: '2 Phòng tắm riêng',
    },
    ratingBreakdown: {
      overall: 4.9,
      cleanliness: 5.0,
      location: 4.9,
      service: 4.9,
      amenities: 4.8,
      value: 4.8,
    },
    policy: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Miễn phí hủy phòng trước 48h',
    },
  },
  {
    roomCode: 'DN-02',
    title: 'Sunset Boho Studio Phố Tây An Thượng',
    roomType: 'APARTMENT',
    city: 'Đà Nẵng',
    district: 'Ngũ Hành Sơn',
    address: 'Đường An Thượng 24, Mỹ An, Ngũ Hành Sơn',
    location: { type: 'Point', coordinates: [108.2435, 16.0512] },
    maxGuests: 2,
    numBedrooms: 1,
    numBeds: 1,
    regularPrice: 850000,
    weekendPrice: 950000,
    freeCancellationBeforeHours: 24,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    description: 'Căn hộ Studio mang phong cách Bohemian phóng khoáng, góc làm việc view biển lộng gió, nằm ngay trung tâm phố Tây An Thượng sầm uất.',
    amenities: [
      'Wifi 100Mbps',
      'Bếp đầy đủ gia vị',
      'Máy giặt riêng',
      'Smart TV Netflix',
      'Khóa điện tử SmartLock',
      'Thang máy thẻ từ',
    ],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
    ],
    status: 'PUBLISHED',
    rating: 4.85,
    numReviews: 32,
    badge: 'PHỐ TÂY AN THƯỢNG',
    tags: ['Tất cả', 'Căn hộ', 'Studio', 'Gần biển'],
    distance: 'Cách biển Mỹ Khê 200m • Khu phố ẩm thực đêm',
    specs: {
      type: 'Căn hộ Studio',
      capacity: 'Tối đa 2 khách',
      bedroom: '1 PN • 1 Giường',
      bathroom: '1 Phòng tắm riêng',
    },
    ratingBreakdown: {
      overall: 4.85,
      cleanliness: 4.9,
      location: 5.0,
      service: 4.8,
      amenities: 4.7,
      value: 4.9,
    },
    policy: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Miễn phí hủy phòng trước 24h',
    },
  },
  {
    roomCode: 'DL-01',
    title: 'Mây Valley Pine Bungalow Đà Lạt',
    roomType: 'BUNGALOW',
    city: 'Đà Lạt',
    district: 'Phường 10',
    address: 'Đường Khe Sanh, Phường 10',
    location: { type: 'Point', coordinates: [108.4552, 11.9324] },
    maxGuests: 3,
    numBedrooms: 1,
    numBeds: 2,
    regularPrice: 950000,
    weekendPrice: 1150000,
    freeCancellationBeforeHours: 48,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    description: 'Bungalow gỗ thông mộc mạc ngắm trọn thung lũng sương mù Đà Lạt. Buổi sớm đón mây luồn qua khung cửa kính, thưởng thức trà atiso thơm lừng bên lò sưởi.',
    amenities: [
      'Lò sưởi củi ấm cúng',
      'Bồn tắm thảo mộc view đồi',
      'Bếp nướng BBQ ngoài trời',
      'Trà atiso & Cafe mộc miễn phí',
      'Sân đậu xe rộng rãi',
    ],
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    ],
    status: 'PUBLISHED',
    rating: 4.92,
    numReviews: 64,
    badge: 'VIEW THUNG LŨNG MÂY',
    tags: ['Tất cả', 'Bungalow', 'Săn mây', 'Đà Lạt'],
    distance: 'Cách Quảng trường Lâm Viên 3.5km • View đồi thông',
    specs: {
      type: 'Bungalow gỗ riêng biệt',
      capacity: 'Tối đa 3 khách',
      bedroom: '1 PN • 1 Giường Đôi + 1 Sofa Bed',
      bathroom: '1 Phòng tắm view đồi',
    },
    ratingBreakdown: {
      overall: 4.92,
      cleanliness: 4.9,
      location: 4.9,
      service: 5.0,
      amenities: 4.8,
      value: 4.9,
    },
    policy: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: 'Miễn phí hủy phòng trước 48h',
    },
  },
  {
    roomCode: 'HN-01',
    title: 'West Lake Sunset Luxury Loft Hà Nội',
    roomType: 'APARTMENT',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    address: 'Đường Quảng Khánh, Quảng An, Tây Hồ',
    location: { type: 'Point', coordinates: [105.8245, 21.0621] },
    maxGuests: 4,
    numBedrooms: 2,
    numBeds: 2,
    regularPrice: 1850000,
    weekendPrice: 2100000,
    freeCancellationBeforeHours: 48,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    description: 'Căn hộ Duplex cao cấp với cửa kính panorama chạm trần thu trọn hoàng hôn Hồ Tây lộng lẫy, đầy đủ tiện nghi chuẩn 5 sao quốc tế.',
    amenities: [
      'Ban công kính view Hồ Tây',
      'Smart Home điều khiển giọng nói',
      'Bếp đảo đá cẩm thạch',
      'Hầm đỗ xe thông minh',
    ],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    ],
    status: 'PUBLISHED',
    rating: 4.96,
    numReviews: 29,
    badge: 'PANORAMA HỒ TÂY',
    tags: ['Tất cả', 'Căn hộ', 'Hồ Tây', 'View hoàng hôn'],
    distance: 'Trực diện Hồ Tây • Cách trung tâm phố cổ 10 phút taxi',
    specs: {
      type: 'Căn hộ Duplex Penthouse',
      capacity: 'Tối đa 4 khách',
      bedroom: '2 PN • 2 Giường King',
      bathroom: '2 Phòng tắm',
    },
    ratingBreakdown: {
      overall: 4.96,
      cleanliness: 5.0,
      location: 5.0,
      service: 5.0,
      amenities: 5.0,
      value: 4.8,
    },
    policy: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Miễn phí hủy phòng trước 48h',
    },
  },
];

/**
 * Controller: Lấy danh sách Homestay / Phòng nghỉ với bộ lọc đa tiêu chí
 * Hỗ trợ các use case: Discovery, Search, Category Tabs, Filter theo giá, số phòng, tiện ích
 */
export const getRooms = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      guests,
      roomsCount,
      minRating,
      amenities,
      city,
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

    // Xây dựng điều kiện lọc (hỗ trợ cả PUBLISHED và ACTIVE tương thích ngược)
    const andConditions = [{ status: { $in: ['PUBLISHED', 'ACTIVE', 'Published'] } }];

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
          $or: cityKeywords.flatMap((kw) => [
            { city: { $regex: kw, $options: 'i' } },
            { district: { $regex: kw, $options: 'i' } },
            { address: { $regex: kw, $options: 'i' } },
            { distance: { $regex: kw, $options: 'i' } },
          ]),
        });
      }
    }

    // 4. Lọc theo khoảng giá (minPrice, maxPrice)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        priceFilter.$lte = Number(maxPrice);
      }
      andConditions.push({
        $or: [
          { regularPrice: priceFilter },
          { pricePerNight: priceFilter }
        ]
      });
    }

    // 5. Lọc theo số lượng khách (guests)
    if (guests && !isNaN(Number(guests))) {
      const numGuests = Number(guests);
      andConditions.push({
        $or: [
          { maxGuests: { $gte: numGuests } },
          { 'specs.capacity': { $regex: new RegExp(`([${numGuests}-9]|\\d{2,})\\s*khách`, 'i') } },
        ],
      });
    }

    // 6. Lọc theo số lượng phòng ngủ (roomsCount)
    if (roomsCount && !isNaN(Number(roomsCount))) {
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

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

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
      data: {
        rooms,
        totalCount,
        currentPage: pageNum,
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
 * Controller: Lấy chi tiết homestay theo ID
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
        message: 'Không tìm thấy cơ sở lưu trú này',
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết homestay:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết homestay',
      error: error.message,
    });
  }
};

/**
 * Controller: Lấy danh sách thành phố phổ biến cho trang chủ
 */
export const getPopularCities = async (req, res) => {
  try {
    const cities = await Room.aggregate([
      { $match: { status: { $in: ['PUBLISHED', 'ACTIVE', 'Published'] } } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const formattedCities = cities.map((c) => ({
      name: c._id,
      count: c.count,
      image: c.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    }));

    return res.status(200).json({
      success: true,
      data: formattedCities,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thành phố phổ biến:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách thành phố',
    });
  }
};

export const getAllRooms = getRooms;
export const seedRooms = async (req, res) => {
  try {
    await Room.deleteMany({});
    const created = await Room.insertMany(SEED_DATA);
    return res.status(200).json({ success: true, count: created.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

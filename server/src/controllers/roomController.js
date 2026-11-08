import Room from '../models/Room.js';

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
      image: c.image || null,
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

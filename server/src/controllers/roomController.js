const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Lấy danh sách homestay hỗ trợ tìm kiếm và lọc đa tiêu chí
 * GET /api/rooms hoặc GET /api/v1/rooms
 */
exports.getRooms = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      guests,
      roomsCount,
      minRating,
      amenities,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Xây dựng Query Filter động
    const filter = { status: 'ACTIVE' };

    // 1. Lọc theo địa điểm / thành phố (tìm kiếm mờ không phân biệt hoa thường)
    if (city && city.trim() !== '') {
      const cleanCity = city.trim();
      // Tách các từ nếu có dạng "Đà Nẵng, Sơn Trà"
      const cityKeywords = cleanCity.split(',').map((c) => c.trim()).filter(Boolean);
      if (cityKeywords.length > 0) {
        filter.$or = cityKeywords.map((kw) => ({
          $or: [
            { city: { $regex: new RegExp(kw, 'i') } },
            { district: { $regex: new RegExp(kw, 'i') } },
            { address: { $regex: new RegExp(kw, 'i') } },
            { title: { $regex: new RegExp(kw, 'i') } },
          ],
        }));
      }
    }

    // 2. Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined && minPrice !== '') {
        const min = Number(minPrice);
        if (!isNaN(min)) filter.pricePerNight.$gte = min;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const max = Number(maxPrice);
        if (!isNaN(max)) filter.pricePerNight.$lte = max;
      }
      // Nếu rỗng thì xóa filter giá
      if (Object.keys(filter.pricePerNight).length === 0) {
        delete filter.pricePerNight;
      }
    }

    // 3. Lọc theo số lượng khách (phòng có sức chứa >= số khách yêu cầu)
    if (guests && !isNaN(Number(guests))) {
      filter.maxGuests = { $gte: Number(guests) };
    }

    // 3b. Lọc theo số lượng phòng ngủ / phòng (roomsCount)
    if (roomsCount && !isNaN(Number(roomsCount)) && Number(roomsCount) > 1) {
      const minRooms = Number(roomsCount);
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { bedrooms: { $gte: minRooms } },
          { 'specs.bedroom': { $regex: new RegExp(`([${minRooms}-9]|\\d{2,})\\s*PN`, 'i') } },
        ],
      });
    }

    // 4. Lọc theo điểm đánh giá tối thiểu
    if (minRating && !isNaN(Number(minRating))) {
      filter.rating = { $gte: Number(minRating) };
    }

    // 5. Lọc theo danh sách tiện ích mong muốn (phải có đủ tất cả tiện ích được chọn)
    if (amenities) {
      let amenityList = [];
      if (Array.isArray(amenities)) {
        amenityList = amenities;
      } else if (typeof amenities === 'string') {
        amenityList = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      }
      if (amenityList.length > 0) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { amenities: { $all: amenityList } },
            { 'amenities.name': { $all: amenityList } },
          ],
        });
      }
    }

    // Chạy song song truy vấn danh sách và đếm tổng số kết quả
    const [rooms, totalCount] = await Promise.all([
      Room.find(filter)
        .populate('ownerId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Room.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const hasMore = pageNum < totalPages;

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách homestay thành công',
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
 * Lấy chi tiết homestay theo ID
 * GET /api/rooms/:id
 */
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate('ownerId', 'name avatar phone email')
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng tương ứng',
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

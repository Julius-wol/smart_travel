import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Helper: Lấy ownerId an toàn từ request hoặc tài khoản Host đầu tiên trong hệ thống
const getHostOwnerId = async (req) => {
  if (req.user && (req.user.id || req.user._id)) {
    return req.user.id || req.user._id;
  }
  const hostUser = await User.findOne({ role: 'host' });
  if (hostUser) return hostUser._id;
  const anyUser = await User.findOne({});
  return anyUser ? anyUser._id : null;
};

// Helper: Tính điểm hoàn thiện hồ sơ Superhost theo thời gian thực
export const calculateSuperhostScore = (roomData) => {
  let score = 0;
  // 1. Tên & Vị trí chính xác (25%)
  const hasTitle = roomData.title && roomData.title.trim().length >= 10;
  const hasLocation = roomData.city && roomData.district && roomData.address;
  if (hasTitle && hasLocation) score += 25;
  else if (hasTitle || hasLocation) score += 15;

  // 2. Định giá & Chính sách (25%)
  const hasPrice = roomData.pricePerNight && roomData.pricePerNight >= 50000;
  const hasWeekend = !!roomData.weekendPricePerNight;
  const hasPolicy = roomData.cancellationPolicy48h !== false;
  if (hasPrice && hasWeekend && hasPolicy) score += 25;
  else if (hasPrice) score += 18;

  // 3. Tiện ích đầy đủ (25%)
  const amenityCount = Array.isArray(roomData.amenities) ? roomData.amenities.length : 0;
  if (amenityCount >= 6) score += 25;
  else if (amenityCount >= 1) score += 20;

  // 4. Số lượng ảnh (25%)
  const imgCount = Array.isArray(roomData.images) ? roomData.images.length : 0;
  if (imgCount >= 5) score += 25;
  else if (imgCount >= 3) score += 22;
  else if (imgCount > 0) score += 10;

  return Math.min(100, Math.max(0, score));
};

/**
 * 1. GET /api/rooms/host/inventory
 * Lấy danh sách phòng của Host, tính toán 4 chỉ số KPI và phân trang
 */
export const getInventory = async (req, res) => {
  try {
    const ownerId = await getHostOwnerId(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, roomType, status, sort } = req.query;

    // Filter query cơ bản luôn gắn với ownerId
    const baseOwnerFilter = ownerId ? { ownerId } : {};

    // 1. Tính toán 4 thẻ KPI Metrics
    const totalRooms = await Room.countDocuments(baseOwnerFilter);
    const publishedRooms = await Room.countDocuments({
      ...baseOwnerFilter,
      status: { $in: ['Published', 'ACTIVE'] },
    });
    const archivedRooms = await Room.countDocuments({
      ...baseOwnerFilter,
      status: { $in: ['Archived', 'HIDDEN'] },
    });

    // Đếm đơn chờ duyệt trong 24h
    const hostRooms = await Room.find(baseOwnerFilter).select('_id');
    const roomIds = hostRooms.map((r) => r._id);
    const pendingBookings24h = await Booking.countDocuments({
      roomId: { $in: roomIds },
      status: 'PENDING',
    });

    // 2. Xây dựng điều kiện lọc danh sách
    const filter = { ...baseOwnerFilter };

    // Tìm kiếm theo tên hoặc mã phòng
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { code: { $regex: term, $options: 'i' } },
      ];
    }

    // Lọc theo loại phòng
    if (roomType && roomType !== 'All' && roomType !== 'Tất cả loại phòng') {
      filter.$or = [
        { roomType: roomType },
        { 'specs.type': roomType },
      ];
    }

    // Lọc theo trạng thái
    if (status && status !== 'All' && status !== 'Tất cả trạng thái') {
      if (status === 'Published') {
        filter.status = { $in: ['Published', 'ACTIVE'] };
      } else if (status === 'Archived') {
        filter.status = { $in: ['Archived', 'HIDDEN'] };
      } else if (status === 'Draft') {
        filter.status = 'Draft';
      }
    }

    // Sắp xếp
    let sortObj = { updatedAt: -1 };
    if (sort === 'oldest') {
      sortObj = { updatedAt: 1 };
    }

    // Truy vấn dữ liệu & đếm tổng bản ghi lọc
    const totalRecords = await Room.countDocuments(filter);
    const rooms = await Room.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Tính số đơn booking đang chờ của từng phòng trong danh sách
    const roomsWithPending = await Promise.all(
      rooms.map(async (room) => {
        const pendingCount = await Booking.countDocuments({
          roomId: room._id,
          status: 'PENDING',
        });
        
        // Chuẩn hóa trạng thái hiển thị
        let displayStatus = 'Published';
        if (room.status === 'Archived' || room.status === 'HIDDEN') {
          displayStatus = 'Archived';
        } else if (room.status === 'Draft') {
          displayStatus = 'Draft';
        }

        return {
          ...room,
          status: displayStatus,
          pendingBookingsCount: pendingCount,
        };
      })
    );

    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const from = totalRecords === 0 ? 0 : skip + 1;
    const to = Math.min(skip + limit, totalRecords);

    return res.status(200).json({
      success: true,
      kpis: {
        totalRooms,
        publishedRooms,
        archivedRooms,
        pendingBookings24h,
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit,
        from,
        to,
      },
      data: roomsWithPending,
    });
  } catch (error) {
    console.error('Error in getInventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh mục phòng',
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/rooms/host/inventory/:id
 * Lấy chi tiết thông tin phòng để điền vào form sửa
 */
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = await getHostOwnerId(req);

    const room = await Room.findById(id).lean();
    if (!room) {
      return res.status(404).json({
        success: false,
        code: 'ROOM-NOT-FOUND',
        message: 'Không tìm thấy phòng nghỉ yêu cầu',
      });
    }

    // Kiểm tra phân quyền (BR-HOST-01)
    if (ownerId && room.ownerId && room.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.',
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error in getRoomById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết phòng',
      error: error.message,
    });
  }
};

/**
 * 3. POST /api/rooms/host/inventory
 * Tạo mới phòng (Draft hoặc Published)
 */
export const createRoom = async (req, res) => {
  try {
    const ownerId = await getHostOwnerId(req);
    const roomData = req.body || {};

    // Validate tên phòng
    if (!roomData.title || !roomData.title.trim()) {
      return res.status(400).json({
        success: false,
        code: 'ROOM-REQ-001',
        message: 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (*).',
      });
    }

    // Kiểm tra trùng tên phòng trong danh mục cùng Host
    if (ownerId) {
      const existing = await Room.findOne({
        ownerId,
        title: { $regex: new RegExp(`^${roomData.title.trim()}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          code: 'ROOM-NAME-DUP',
          message: 'Tên phòng nghỉ đã tồn tại trong danh mục của bạn. Vui lòng đặt tên phân biệt.',
        });
      }
    }

    const isPublished = roomData.status === 'Published' || roomData.status === 'ACTIVE';

    // Ràng buộc khi đăng bán chính thức
    if (isPublished) {
      if (!roomData.address || !roomData.city || !roomData.pricePerNight) {
        return res.status(400).json({
          success: false,
          code: 'ROOM-REQ-001',
          message: 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (*).',
        });
      }
      if (!Array.isArray(roomData.images) || roomData.images.length < 3) {
        return res.status(400).json({
          success: false,
          code: 'ROOM-IMG-001',
          message: 'Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét.',
        });
      }
    }

    const score = calculateSuperhostScore(roomData);

    const newRoom = new Room({
      ...roomData,
      ownerId,
      status: roomData.status || 'Draft',
      profileScore: score,
      isSuperhostStandard: score >= 90,
      lastEditedBy: ownerId,
    });

    await newRoom.save();

    return res.status(201).json({
      success: true,
      code: isPublished ? 'ROOM-SAVE-001' : 'ROOM-DRAFT-001',
      message: isPublished ? 'Cập nhật thông tin phòng thành công!' : 'Đã lưu bản nháp thành công. Bạn có thể quay lại hoàn thiện bất kỳ lúc nào.',
      data: newRoom,
    });
  } catch (error) {
    console.error('Error in createRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo phòng',
      error: error.message,
    });
  }
};

/**
 * 4. PUT /api/rooms/host/inventory/:id
 * Cập nhật thông tin phòng
 */
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = await getHostOwnerId(req);
    const roomData = req.body || {};

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        code: 'ROOM-NOT-FOUND',
        message: 'Không tìm thấy phòng nghỉ yêu cầu',
      });
    }

    // Kiểm tra phân quyền (BR-HOST-01)
    if (ownerId && room.ownerId && room.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.',
      });
    }

    // Kiểm tra trùng tên phòng nếu có đổi tên
    if (roomData.title && roomData.title.trim().toLowerCase() !== room.title.trim().toLowerCase()) {
      const existing = await Room.findOne({
        ownerId: room.ownerId,
        _id: { $ne: room._id },
        title: { $regex: new RegExp(`^${roomData.title.trim()}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          code: 'ROOM-NAME-DUP',
          message: 'Tên phòng nghỉ đã tồn tại trong danh mục của bạn. Vui lòng đặt tên phân biệt.',
        });
      }
    }

    const isPublished = roomData.status === 'Published' || room.status === 'Published';
    if (isPublished && Array.isArray(roomData.images) && roomData.images.length < 3) {
      return res.status(400).json({
        success: false,
        code: 'ROOM-IMG-001',
        message: 'Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét.',
      });
    }

    const score = calculateSuperhostScore({ ...room.toObject(), ...roomData });

    Object.assign(room, roomData);
    room.profileScore = score;
    room.isSuperhostStandard = score >= 90;
    room.lastEditedBy = ownerId;

    await room.save();

    return res.status(200).json({
      success: true,
      code: 'ROOM-SAVE-001',
      message: 'Cập nhật thông tin phòng thành công!',
      data: room,
    });
  } catch (error) {
    console.error('Error in updateRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật phòng',
      error: error.message,
    });
  }
};

/**
 * 5. PATCH /api/rooms/host/inventory/:id/status
 * Đổi trạng thái nhanh giữa Published và Archived
 */
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = await getHostOwnerId(req);

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        code: 'ROOM-NOT-FOUND',
        message: 'Không tìm thấy phòng nghỉ yêu cầu',
      });
    }

    if (ownerId && room.ownerId && room.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.',
      });
    }

    room.status = status;
    await room.save();

    const isPublished = status === 'Published';
    return res.status(200).json({
      success: true,
      code: isPublished ? 'ROOM-STA-001' : 'ROOM-STA-002',
      message: isPublished
        ? 'Đã kích hoạt mở bán phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng.'
        : 'Đã tạm dừng hiển thị phòng. Du khách sẽ không tìm thấy phòng này trên ứng dụng.',
      data: {
        id: room._id,
        status: room.status,
      },
    });
  } catch (error) {
    console.error('Error in toggleStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đổi trạng thái phòng',
      error: error.message,
    });
  }
};

/**
 * 6. POST /api/rooms/host/inventory/:id/duplicate
 * Sao chép phòng thành bản nháp mới
 */
export const duplicateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = await getHostOwnerId(req);

    const originalRoom = await Room.findById(id).lean();
    if (!originalRoom) {
      return res.status(404).json({
        success: false,
        code: 'ROOM-NOT-FOUND',
        message: 'Không tìm thấy phòng gốc để nhân bản',
      });
    }

    if (ownerId && originalRoom.ownerId && originalRoom.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.',
      });
    }

    const { _id, createdAt, updatedAt, code, ...cleanData } = originalRoom;

    const duplicatedRoom = new Room({
      ...cleanData,
      title: `Bản sao của ${originalRoom.title}`,
      code: '#P-VL' + Math.floor(100 + Math.random() * 900),
      status: 'Draft',
      ownerId,
      lastEditedBy: ownerId,
    });

    await duplicatedRoom.save();

    return res.status(201).json({
      success: true,
      code: 'ROOM-DUP-001',
      message: `Đã nhân bản phòng thành công thành bản nháp [${duplicatedRoom.title}].`,
      data: duplicatedRoom,
    });
  } catch (error) {
    console.error('Error in duplicateRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi nhân bản phòng',
      error: error.message,
    });
  }
};

/**
 * 7. DELETE /api/rooms/host/inventory/:id
 * Xóa phòng (có kiểm tra ràng buộc booking tương lai)
 */
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = await getHostOwnerId(req);

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        code: 'ROOM-NOT-FOUND',
        message: 'Không tìm thấy phòng cần xóa',
      });
    }

    if (ownerId && room.ownerId && room.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.',
      });
    }

    // Kiểm tra đơn đặt phòng trong tương lai (booking_time >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookingsCount = await Booking.countDocuments({
      roomId: room._id,
      status: { $in: ['PENDING', 'CONFIRMED'] },
      $or: [
        { checkInDate: { $gte: today } },
        { bookingDate: { $gte: today.toISOString().split('T')[0] } },
      ],
    });

    // Nếu còn đơn đặt phòng tới: Chặn xóa và tự động chuyển sang Archived
    if (upcomingBookingsCount > 0) {
      room.status = 'Archived';
      await room.save();

      return res.status(409).json({
        success: false,
        code: 'ROOM-DEL-001',
        message: 'Không thể xóa phòng! Phòng này đang có đơn đặt phòng trong thời gian tới. Phòng được tự động chuyển sang trạng thái Tạm dừng (Archived).',
        data: {
          id: room._id,
          status: 'Archived',
        },
      });
    }

    // Không còn đơn hàng -> Xóa vĩnh viễn
    await Room.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      code: 'ROOM-DEL-002',
      message: 'Đã xóa phòng nghỉ vĩnh viễn khỏi danh sách của bạn.',
      data: { id },
    });
  } catch (error) {
    console.error('Error in deleteRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa phòng',
      error: error.message,
    });
  }
};

/**
 * 8. GET /api/rooms/host/inventory/export
 * Xuất danh sách phòng ra file Excel/CSV
 */
export const exportExcel = async (req, res) => {
  try {
    const ownerId = await getHostOwnerId(req);
    const filter = ownerId ? { ownerId } : {};

    const rooms = await Room.find(filter).sort({ updatedAt: -1 }).lean();

    // Tạo CSV content đơn giản, tương thích Excel
    const header = ['Mã phòng', 'Tên phòng', 'Loại phòng', 'Giá niêm yết (VNĐ)', 'Giá cuối tuần', 'Trạng thái', 'Điểm Superhost'];
    const rows = rooms.map((r) => [
      r.code || '',
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.roomType || r.specs?.type || 'Homestay',
      r.pricePerNight || 0,
      r.weekendPricePerNight || 0,
      r.status || 'Published',
      `${r.profileScore || 0}%`,
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((row) => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-phong.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error in exportExcel:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất file Excel',
      error: error.message,
    });
  }
};

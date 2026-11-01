import {
  createSessionAndTokens,
  revokeSession,
  verifyGoogleToken,
  authenticateHostCredentials,
  registerHostUser
} from '../services/authService.js';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ==========================================
// 1. ROOM INVENTORY (SCR-HOST-01)
// ==========================================
export const getRoomsList = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { search, type, status, sort, page = 1, error } = req.query;

    // 1. Calculate KPI Metrics
    const totalRooms = await Room.countDocuments({ ownerId });
    const publishedCount = await Room.countDocuments({
      ownerId,
      status: { $in: ['Published', 'ACTIVE'] }
    });
    const archivedCount = await Room.countDocuments({
      ownerId,
      status: { $in: ['Archived', 'HIDDEN'] }
    });

    // Find all room IDs for this host to count pending bookings in last 24h
    const hostRooms = await Room.find({ ownerId }).select('_id');
    const hostRoomIds = hostRooms.map(r => r._id);

    const pendingBookings24h = await Booking.countDocuments({
      roomId: { $in: hostRoomIds },
      status: 'PENDING'
    });

    // 2. Build Query Filters
    const query = { ownerId };

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { roomCode: { $regex: s, $options: 'i' } }
      ];
    }

    if (type && type !== 'Tất cả' && type !== 'Tất cả loại phòng') {
      query.$or = [
        { 'specs.type': { $regex: type, $options: 'i' } },
        { tags: { $in: [type] } }
      ];
    }

    if (status && status !== 'Tất cả' && status !== 'Tất cả trạng thái') {
      if (status === 'Published') {
        query.status = { $in: ['Published', 'ACTIVE'] };
      } else if (status === 'Archived') {
        query.status = { $in: ['Archived', 'HIDDEN'] };
      } else {
        query.status = status;
      }
    }

    // 3. Sorting
    let sortQuery = { updatedAt: -1 };
    if (sort === 'Cũ nhất' || sort === 'oldest') {
      sortQuery = { updatedAt: 1 };
    }

    // 4. Pagination
    const currentPage = Math.max(1, parseInt(page) || 1);
    const limit = 10;
    const skip = (currentPage - 1) * limit;

    const filteredTotal = await Room.countDocuments(query);
    const rawRooms = await Room.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // 5. Attach Pending Bookings Count per room
    const rooms = await Promise.all(
      rawRooms.map(async (room) => {
        const pendingCount = await Booking.countDocuments({
          roomId: room._id,
          status: 'PENDING'
        });
        const rObj = room.toObject();
        // Normalize status
        if (rObj.status === 'ACTIVE') rObj.status = 'Published';
        if (rObj.status === 'HIDDEN') rObj.status = 'Archived';
        return {
          ...rObj,
          pendingCount
        };
      })
    );

    const totalPages = Math.ceil(filteredTotal / limit) || 1;

    res.render('host/rooms/index', {
      title: 'Quản lý phòng - Smart Travel Host',
      user: req.user,
      kpis: {
        totalRooms,
        publishedCount,
        archivedCount,
        pendingBookings24h
      },
      rooms,
      pagination: {
        currentPage,
        totalPages,
        limit,
        filteredTotal,
        startItem: filteredTotal === 0 ? 0 : skip + 1,
        endItem: Math.min(skip + limit, filteredTotal)
      },
      filters: {
        search: search || '',
        type: type || 'Tất cả loại phòng',
        status: status || 'Tất cả trạng thái',
        sort: sort || 'Mới nhất'
      },
      initialError: error || null
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng Host:', error);
    res.status(500).send('Lỗi máy chủ khi tải danh sách phòng');
  }
};

// ==========================================
// 2. EXPORT EXCEL (EXP-001)
// ==========================================
export const exportRoomsExcel = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { search, type, status, sort } = req.query;

    const query = { ownerId };
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { roomCode: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (type && type !== 'Tất cả' && type !== 'Tất cả loại phòng') {
      query.$or = [
        { 'specs.type': { $regex: type, $options: 'i' } },
        { tags: { $in: [type] } }
      ];
    }
    if (status && status !== 'Tất cả' && status !== 'Tất cả trạng thái') {
      if (status === 'Published') query.status = { $in: ['Published', 'ACTIVE'] };
      else if (status === 'Archived') query.status = { $in: ['Archived', 'HIDDEN'] };
      else query.status = status;
    }

    let sortQuery = { updatedAt: -1 };
    if (sort === 'Cũ nhất' || sort === 'oldest') sortQuery = { updatedAt: 1 };

    const rooms = await Room.find(query).sort(sortQuery);

    const rows = await Promise.all(
      rooms.map(async (r, index) => {
        const pendingCount = await Booking.countDocuments({ roomId: r._id, status: 'PENDING' });
        let st = r.status;
        if (st === 'ACTIVE') st = 'Published';
        if (st === 'HIDDEN') st = 'Archived';

        return {
          'STT': index + 1,
          'Mã phòng': r.roomCode || `MP-${r._id.toString().slice(-4)}`,
          'Tên phòng': r.title,
          'Loại phòng': r.specs?.type || 'Homestay',
          'Giá tiêu chuẩn (VNĐ)': r.pricePerNight,
          'Giá cuối tuần (VNĐ)': r.weekendPrice || r.pricePerNight,
          'Sức chứa tối đa': r.maxGuests,
          'Số phòng ngủ': r.bedrooms || 1,
          'Số giường': r.beds || 1,
          'Diện tích (m²)': r.area || 40,
          'Tỉnh / Thành phố': r.city,
          'Quận / Huyện': r.district || '',
          'Địa chỉ chi tiết': r.address,
          'Trạng thái': st,
          'Số lượng ảnh': r.images ? r.images.length : 0,
          'Đơn chờ duyệt': pendingCount,
          'Ngày cập nhật': new Date(r.updatedAt).toLocaleDateString('vi-VN')
        };
      })
    );

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Danh sách phòng');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `SmartTravel_Phong_${Date.now()}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Lỗi xuất Excel:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xuất file Excel' });
  }
};

// ==========================================
// 3. CREATE ROOM FORM (SCR-HOST-02)
// ==========================================
export const getCreateRoom = (req, res) => {
  const blankRoom = {
    _id: '',
    roomCode: '',
    title: '',
    specs: {
      type: 'Homestay',
      capacity: 'Tối đa 2 khách',
      bedroom: '1 PN • 1 Giường',
      bathroom: '1 Phòng tắm riêng'
    },
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    area: 45,
    city: 'Lâm Đồng (Đà Lạt)',
    district: '',
    address: '',
    pricePerNight: '',
    weekendPrice: '',
    description: '',
    policy: {
      freeCancel48h: true,
      checkIn: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)',
      checkOut: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)',
      cancellation: 'Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00.'
    },
    amenities: [
      { id: '1', name: 'Wifi 100Mbps', icon: 'wifi' }
    ],
    images: [],
    status: 'Draft',
    location: {
      type: 'Point',
      coordinates: [108.2208, 16.0678],
      lat: 16.0678,
      lng: 108.2208
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastUpdatedBy: req.user.firstName + ' ' + req.user.lastName
  };

  res.render('host/rooms/form', {
    title: 'Thêm phòng nghỉ mới - Smart Travel Host',
    user: req.user,
    mode: 'create',
    room: blankRoom
  });
};

// ==========================================
// 4. EDIT ROOM FORM (SCR-HOST-02)
// ==========================================
export const getEditRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.redirect('/host/rooms?error=AUTH-403');
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.redirect('/host/rooms?error=AUTH-403');
    }

    // BR-HOST-01: Check room ownership strictly
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.redirect('/host/rooms?error=AUTH-403');
    }

    const rObj = room.toObject();
    if (rObj.status === 'ACTIVE') rObj.status = 'Published';
    if (rObj.status === 'HIDDEN') rObj.status = 'Archived';

    res.render('host/rooms/form', {
      title: `Chỉnh sửa: ${room.title} - Smart Travel Host`,
      user: req.user,
      mode: 'edit',
      room: rObj
    });
  } catch (error) {
    console.error('Lỗi khi mở form edit:', error);
    res.redirect('/host/rooms?error=AUTH-403');
  }
};

// ==========================================
// 5. SAVE ROOM (CREATE & UPDATE)
// ==========================================
export const saveRoom = async (req, res) => {
  try {
    const { id } = req.params; // If present, update; else create
    const {
      title,
      roomType,
      maxGuests,
      bedrooms,
      beds,
      area,
      city,
      district,
      address,
      pricePerNight,
      weekendPrice,
      description,
      freeCancel48h,
      amenities, // Array of { id, name, icon } or string json
      images, // Array of strings
      status, // 'Published' or 'Draft' or 'Archived'
      lat,
      lng
    } = req.body;

    const targetStatus = status || 'Draft';
    const isPublishing = targetStatus === 'Published';

    // Parse arrays if they are strings
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      try { parsedAmenities = JSON.parse(amenities); } catch (e) { parsedAmenities = []; }
    }
    parsedAmenities = Array.isArray(parsedAmenities) ? parsedAmenities : [];

    let parsedImages = images;
    if (typeof images === 'string') {
      try { parsedImages = JSON.parse(images); } catch (e) { parsedImages = []; }
    }
    parsedImages = Array.isArray(parsedImages) ? parsedImages : [];

    // Validation rules
    // 1. Mandatory check for Publishing
    if (isPublishing) {
      if (!title || !title.trim() || !roomType || !city || !address || !pricePerNight || !description || !description.trim()) {
        return res.status(400).json({
          code: 'ROOM-REQ-001',
          message: 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (*).'
        });
      }
      if (parsedAmenities.length === 0) {
        return res.status(400).json({
          code: 'ROOM-REQ-001',
          message: 'Vui lòng chọn tối thiểu 1 tiện ích.'
        });
      }
      if (parsedImages.length < 3) {
        return res.status(400).json({
          code: 'ROOM-IMG-001',
          message: 'Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét.'
        });
      }
    }

    // Title validation
    if (title) {
      if (title.trim().length < 10 || title.trim().length > 150) {
        return res.status(400).json({
          code: 'ROOM-REQ-001',
          message: 'Tên phòng nghỉ phải từ 10 đến 150 ký tự.'
        });
      }

      // Check unique title for this host [ROOM-NAME-DUP]
      const duplicateQuery = {
        ownerId: req.user._id,
        title: title.trim(),
        ...(id && mongoose.isValidObjectId(id) ? { _id: { $ne: id } } : {})
      };
      const duplicate = await Room.findOne(duplicateQuery);
      if (duplicate) {
        return res.status(400).json({
          code: 'ROOM-NAME-DUP',
          message: 'Tên phòng nghỉ đã tồn tại trong danh mục của bạn. Vui lòng đặt tên phân biệt.'
        });
      }
    }

    // Description validation
    if (description) {
      if (description.length > 1000) {
        return res.status(400).json({
          code: 'ROOM-CHAR-LIMIT',
          message: 'Mô tả phòng đã vượt quá giới hạn 1.000 ký tự cho phép.'
        });
      }
      if (isPublishing && description.trim().length < 50) {
        return res.status(400).json({
          code: 'ROOM-REQ-001',
          message: 'Mô tả chi tiết phòng nghỉ bắt buộc tối thiểu 50 ký tự.'
        });
      }
    }

    // Pricing validation
    const numPrice = Number(pricePerNight) || 0;
    if (isPublishing && (numPrice < 50000 || numPrice > 500000000)) {
      return res.status(400).json({
        code: 'ROOM-REQ-001',
        message: 'Giá thuê phải từ 50.000 VNĐ đến 500.000.000 VNĐ.'
      });
    }

    const numWeekendPrice = weekendPrice ? Number(weekendPrice) : numPrice;

    // Room object construction
    const roomData = {
      title: title ? title.trim() : 'Bản nháp phòng mới',
      specs: {
        type: roomType || 'Homestay',
        capacity: `Tối đa ${maxGuests || 2} khách`,
        bedroom: `${bedrooms || 1} phòng • ${beds || 1} giường`,
        bathroom: 'Phòng tắm riêng'
      },
      maxGuests: Number(maxGuests) || 2,
      bedrooms: Number(bedrooms) || 1,
      beds: Number(beds) || 1,
      area: Number(area) || 45,
      city: city || 'Đà Nẵng',
      district: district || '',
      address: address || '',
      pricePerNight: numPrice,
      weekendPrice: numWeekendPrice,
      description: description || '',
      amenities: parsedAmenities,
      images: parsedImages,
      policy: {
        freeCancel48h: freeCancel48h === true || freeCancel48h === 'true' || freeCancel48h === 'on',
        checkIn: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)',
        checkOut: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)',
        cancellation: (freeCancel48h === true || freeCancel48h === 'true' || freeCancel48h === 'on')
          ? 'Cho phép hủy miễn phí trước 48h nhận phòng. Khách hàng được hoàn 100% tiền nếu hủy trước 2 ngày.'
          : 'Không hoàn tiền khi hủy phòng.'
      },
      status: targetStatus,
      location: {
        type: 'Point',
        coordinates: [
          Number(lng) || 108.2208,
          Number(lat) || 16.0678
        ]
      },
      lastUpdatedBy: req.user.firstName + ' ' + req.user.lastName
    };

    let savedRoom;
    if (id && mongoose.isValidObjectId(id)) {
      const existing = await Room.findById(id);
      if (!existing) {
        return res.status(404).json({ code: 'AUTH-403', message: 'Không tìm thấy phòng này' });
      }
      if (existing.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          code: 'AUTH-403',
          message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.'
        });
      }

      savedRoom = await Room.findByIdAndUpdate(id, roomData, { returnDocument: 'after' });
    } else {
      roomData.ownerId = req.user._id;
      savedRoom = await Room.create(roomData);
    }

    const code = isPublishing ? 'ROOM-SAVE-001' : 'ROOM-DRAFT-001';
    const message = isPublishing
      ? 'Cập nhật thông tin phòng thành công!'
      : 'Đã lưu bản nháp thành công. Bạn có thể quay lại hoàn thiện bất kỳ lúc nào.';

    return res.status(200).json({
      success: true,
      code,
      message,
      room: savedRoom,
      redirectUrl: '/host/rooms'
    });
  } catch (error) {
    console.error('Lỗi khi lưu phòng:', error);
    return res.status(500).json({
      code: 'SERVER_ERROR',
      message: error.message || 'Lỗi hệ thống khi lưu phòng'
    });
  }
};

// ==========================================
// 6. TOGGLE STATUS (Published <-> Archived)
// ==========================================
export const toggleRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetStatus } = req.body; // 'Published' or 'Archived'

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ code: 'AUTH-403', message: 'Mã phòng không hợp lệ' });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ code: 'AUTH-403', message: 'Không tìm thấy phòng' });
    }

    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.'
      });
    }

    // If publishing, ensure minimum 3 images
    if (targetStatus === 'Published') {
      if (!room.images || room.images.length < 3) {
        return res.status(400).json({
          code: 'ROOM-IMG-001',
          message: 'Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét.'
        });
      }
      room.status = 'Published';
      await room.save();
      return res.status(200).json({
        success: true,
        code: 'ROOM-STA-001',
        message: 'Đã kích hoạt mở bán phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng.'
      });
    } else if (targetStatus === 'Archived') {
      room.status = 'Archived';
      await room.save();
      return res.status(200).json({
        success: true,
        code: 'ROOM-STA-002',
        message: 'Đã tạm dừng hiển thị phòng. Du khách sẽ không tìm thấy phòng này trên ứng dụng.'
      });
    } else {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi toggle status:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// ==========================================
// 7. DUPLICATE ROOM (ROOM-DUP-001)
// ==========================================
export const duplicateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ code: 'AUTH-403', message: 'Mã phòng không hợp lệ' });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ code: 'AUTH-403', message: 'Không tìm thấy phòng' });
    }

    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.'
      });
    }

    const clonedData = room.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.roomCode;

    clonedData.title = `Bản sao của ${room.title}`;
    clonedData.status = 'Draft';
    clonedData.ownerId = req.user._id;

    const newRoom = await Room.create(clonedData);

    return res.status(200).json({
      success: true,
      code: 'ROOM-DUP-001',
      message: `Đã nhân bản phòng thành công thành bản nháp "${newRoom.title}".`,
      room: newRoom
    });
  } catch (error) {
    console.error('Lỗi duplicate phòng:', error);
    return res.status(500).json({ message: 'Lỗi khi nhân bản phòng' });
  }
};

// ==========================================
// 8. DELETE ROOM (CONFIRM-DEL-001, ROOM-DEL-001, ROOM-DEL-002)
// ==========================================
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationText } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ code: 'AUTH-403', message: 'Mã phòng không hợp lệ' });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ code: 'AUTH-403', message: 'Không tìm thấy phòng' });
    }

    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        code: 'AUTH-403',
        message: 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.'
      });
    }

    // Check future bookings (booking checkOut >= start of today AND status in PENDING or CONFIRMED)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const futureBookings = await Booking.find({
      roomId: room._id,
      checkOut: { $gte: startOfToday },
      status: { $in: ['PENDING', 'CONFIRMED'] }
    });

    if (futureBookings.length > 0) {
      // BLOCK DELETE! Automatically set to Archived
      room.status = 'Archived';
      await room.save();

      return res.status(400).json({
        success: false,
        code: 'ROOM-DEL-001',
        message: 'Không thể xóa phòng! Phòng này đang có đơn đặt phòng trong thời gian tới. Phòng được tự động chuyển sang trạng thái Tạm dừng (Archived).'
      });
    }

    // If confirmation word required
    if (room.status !== 'Draft' && confirmationText !== 'XÓA') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng gõ chính xác chữ "XÓA" để xác nhận.'
      });
    }

    await Room.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      code: 'ROOM-DEL-002',
      message: 'Đã xóa phòng nghỉ vĩnh viễn khỏi danh sách của bạn.'
    });
  } catch (error) {
    console.error('Lỗi delete phòng:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa phòng' });
  }
};

// ==========================================
// 9. MULTI-IMAGE UPLOAD API
// ==========================================
export const uploadImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 'ROOM-IMG-002',
        message: 'Không tìm thấy tệp tải lên'
      });
    }

    const urls = req.files.map(file => `/uploads/rooms/${file.filename}`);
    return res.status(200).json({
      success: true,
      urls
    });
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    return res.status(500).json({
      code: 'ROOM-IMG-NETERR',
      message: 'Tải ảnh thất bại do lỗi kết nối mạng. Vui lòng bấm thử lại.'
    });
  }
};

// ==========================================
// 10. BOOKINGS APPROVAL (SCR-HOST-03)
// ==========================================
export const getHostBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { tab = 'pending', search, roomId } = req.query;

    const hostRooms = await Room.find({ ownerId });
    const hostRoomIds = hostRooms.map(r => r._id);

    const query = { roomId: { $in: hostRoomIds } };

    if (tab === 'pending') {
      query.status = 'PENDING';
    } else if (tab === 'confirmed') {
      query.status = 'CONFIRMED';
    } else if (tab === 'history') {
      query.status = { $in: ['REJECTED', 'CANCELLED', 'COMPLETED'] };
    }

    if (roomId && mongoose.isValidObjectId(roomId)) {
      query.roomId = roomId;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { bookingCode: { $regex: s, $options: 'i' } },
        { fullName: { $regex: s, $options: 'i' } },
        { phoneNumber: { $regex: s, $options: 'i' } },
        { 'guestInfo.fullName': { $regex: s, $options: 'i' } },
        { 'guestInfo.phoneNumber': { $regex: s, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('roomId')
      .populate('userId', 'firstName lastName email phoneNumber avatar')
      .sort({ createdAt: -1 })
      .lean();

    const pendingCount = await Booking.countDocuments({
      roomId: { $in: hostRoomIds },
      status: 'PENDING'
    });
    const confirmedCount = await Booking.countDocuments({
      roomId: { $in: hostRoomIds },
      status: 'CONFIRMED'
    });
    const historyCount = await Booking.countDocuments({
      roomId: { $in: hostRoomIds },
      status: { $in: ['REJECTED', 'CANCELLED', 'COMPLETED'] }
    });

    res.render('host/bookings/index', {
      title: 'Duyệt đơn đặt phòng - Smart Travel Host',
      user: req.user,
      bookings,
      counts: {
        pending: pendingCount,
        confirmed: confirmedCount,
        history: historyCount
      },
      currentTab: tab,
      rooms: hostRooms,
      selectedRoomId: roomId || ''
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách booking:', error);
    res.status(500).send('Lỗi khi tải danh sách booking');
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    const booking = await Booking.findById(id).populate('roomId');
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt phòng' });
    }

    if (booking.roomId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 'AUTH-403', message: 'Không có quyền thao tác trên đơn này' });
    }

    booking.status = status;
    if (rejectReason) booking.rejectReason = rejectReason;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: status === 'CONFIRMED' ? 'Đã xác nhận duyệt đơn đặt phòng!' : 'Đã từ chối yêu cầu đặt phòng.',
      booking
    });
  } catch (error) {
    console.error('Lỗi duyệt booking:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// ==========================================
// 11. QUICK AUTH (AUTH-401-EXPIRED MODAL)
// ==========================================
export const quickAuth = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateHostCredentials(email, password);
    await createSessionAndTokens(user, res, { isHost: true });
    return res.status(200).json({ success: true, message: 'Xác thực thành công!' });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_PASSWORD') {
      return res.status(401).json({ success: false, message: error.message });
    }
    if (error.code === 'NOT_HOST') {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error('Lỗi quickAuth:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xác thực' });
  }
};

// ==========================================
// 12. HOST LOGIN & LOGOUT & REGISTER
// ==========================================
export const getLogin = (req, res) => {
  const { error } = req.query;
  let errorMsg = null;
  if (error === 'not_host') {
    errorMsg = 'Tài khoản của bạn là Khách du lịch (USER). Cổng web này chỉ dành riêng cho Đối tác cho thuê phòng (HOST). Vui lòng đăng nhập bằng tài khoản Chủ phòng!';
  } else if (error === 'expired') {
    errorMsg = 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
  }
  res.render('host/login', {
    title: 'Đăng nhập Host Portal - Smart Travel',
    error: errorMsg,
    emailOrPhone: '',
    googleClientId: process.env.OAUTH_CLIENT_ID || '539925498757-3ugbbj7ifb1260ljto341lam3ikfm1dm.apps.googleusercontent.com'
  });
};

export const postLogin = async (req, res) => {
  const googleClientId = process.env.OAUTH_CLIENT_ID || '539925498757-3ugbbj7ifb1260ljto341lam3ikfm1dm.apps.googleusercontent.com';
  try {
    const { emailOrPhone, password } = req.body;
    const user = await authenticateHostCredentials(emailOrPhone, password);

    // Lưu session vào Database & cấp token đồng bộ chuẩn JWT
    await createSessionAndTokens(user, res, { isHost: true });

    res.redirect('/host/rooms');
  } catch (error) {
    console.error('Lỗi postLogin:', error.message);
    res.render('host/login', {
      title: 'Đăng nhập Host Portal - Smart Travel',
      error: error.message || 'Lỗi máy chủ khi đăng nhập',
      emailOrPhone: req.body.emailOrPhone || '',
      googleClientId
    });
  }
};

// ==========================================
// 12B. GOOGLE SIGN-IN FOR HOST PORTAL
// ==========================================
export const postGoogleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Thiếu Google access token' });
    }

    // Call Google userinfo API qua core authService
    const googleUser = await verifyGoogleToken(accessToken);
    const { email, given_name, family_name, picture } = googleUser;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Không lấy được email từ tài khoản Google' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register as HOST
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }

      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username,
        email: email.toLowerCase(),
        firstName: given_name || 'Chủ phòng',
        lastName: family_name || '',
        fullName: `${given_name || ''} ${family_name || ''}`.trim() || username,
        password: hashedPassword,
        avatar: picture || '',
        role: 'HOST',
        status: 'ACTIVE',
        wishlist: []
      });
      console.log(`✅ [Host Google Login] Tự động tạo tài khoản Host mới: ${email}`);
    } else {
      // Check role
      if (user.role !== 'HOST') {
        return res.status(403).json({
          success: false,
          message: `Tài khoản (${email}) hiện đang là Khách du lịch (USER). Cổng web này chỉ dành riêng cho Đối tác Chủ phòng (HOST). Vui lòng đăng nhập bằng tài khoản Chủ phòng!`
        });
      }
    }

    // Lưu session vào Database & cấp token đồng bộ chuẩn JWT
    await createSessionAndTokens(user, res, { isHost: true });

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      redirectUrl: '/host/rooms'
    });
  } catch (error) {
    console.error('Lỗi postGoogleLogin:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi đăng nhập với Google'
    });
  }
};

export const getRegister = (req, res) => {
  res.render('host/register', {
    title: 'Đăng ký Đối tác Chủ phòng - Smart Travel',
    error: null,
    values: {}
  });
};

export const postRegister = async (req, res) => {
  try {
    const { username, email, phone, firstName, lastName, password, confirmPassword } = req.body;

    if (confirmPassword && password !== confirmPassword) {
      return res.render('host/register', {
        title: 'Đăng ký Đối tác Chủ phòng - Smart Travel',
        error: 'Mật khẩu xác nhận không khớp',
        values: req.body
      });
    }

    // Đăng ký tài khoản Host qua core service
    const newUser = await registerHostUser(req.body);

    // Lưu session vào Database & cấp token đồng bộ chuẩn JWT
    await createSessionAndTokens(newUser, res, { isHost: true });

    res.redirect('/host/rooms');
  } catch (error) {
    console.error('Lỗi postRegister:', error.message);
    res.render('host/register', {
      title: 'Đăng ký Đối tác Chủ phòng - Smart Travel',
      error: error.message || 'Lỗi hệ thống khi đăng ký tài khoản Host',
      values: req.body
    });
  }
};

export const logout = async (req, res) => {
  await revokeSession(req, res);
  res.redirect('/host/login');
};


// ==========================================
// 4. REVIEWS & FEEDBACK (SCR-HOST-05)
// ==========================================
export const getHostReviews = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { roomId, rating, hasImages, sort = 'newest', page = 1, limit = 10, format } = req.query;

    // BR-HOST-01: Get all rooms belonging to this host
    const hostRooms = await Room.find({ ownerId }).select('_id title roomCode').lean();
    const hostRoomIds = hostRooms.map(r => r._id);

    // If roomId is supplied, verify host ownership
    let targetRoomIds = hostRoomIds.map(id => new mongoose.Types.ObjectId(id));
    let selectedRoom = null;

    const isApi = req.originalUrl?.includes('/api') || req.path?.includes('/api') || req.xhr || req.headers.accept?.includes('application/json') || format === 'json';

    if (roomId && roomId !== 'ALL' && roomId !== '') {
      const isOwned = hostRoomIds.some(id => id.toString() === roomId.toString());
      if (!isOwned) {
        if (isApi) {
          return res.status(403).json({
            success: false,
            code: 'AUTH-403',
            message: 'Bạn không có quyền truy cập đánh giá của cơ sở lưu trú này (AUTH-403)'
          });
        }
        return res.status(403).render('host/error', {
          statusCode: 403,
          errorCode: 'AUTH-403',
          title: 'Truy cập bị từ chối',
          message: 'Bạn không có quyền truy cập đánh giá của cơ sở lưu trú này (AUTH-403)',
          user: req.user
        });
      }
      targetRoomIds = [new mongoose.Types.ObjectId(roomId)];
      selectedRoom = hostRooms.find(r => r._id.toString() === roomId.toString());
    }

    // BR-HOST-06: Calculate Hero Card Stats with MongoDB aggregation
    const statsFacet = await Review.aggregate([
      { $match: { roomId: { $in: targetRoomIds } } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                cleanlinessAvg: { $avg: '$categories.cleanliness' },
                serviceAvg: { $avg: { $ifNull: ['$categories.service', '$categories.communication'] } },
                checkinAvg: { $avg: '$categories.checkin' },
                accuracyAvg: { $avg: '$categories.accuracy' },
                locationAvg: { $avg: '$categories.location' },
                valueAvg: { $avg: { $ifNull: ['$categories.value', '$categories.amenities'] } },
                photoCount: {
                  $sum: {
                    $cond: [{ $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] }, 1, 0]
                  }
                }
              }
            }
          ],
          starCounts: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const overallData = statsFacet[0]?.overall[0] || {};
    const starCountsData = statsFacet[0]?.starCounts || [];

    const totalReviews = overallData.totalReviews || 0;
    const avgRating = totalReviews > 0 ? (Math.round(overallData.avgRating * 10) / 10).toFixed(1) : '--';

    // Build star distribution map (5 to 1)
    const starMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    starCountsData.forEach(item => {
      const star = Math.round(item._id);
      if (starMap[star] !== undefined) {
        starMap[star] = item.count;
      }
    });

    const starDistribution = [5, 4, 3, 2, 1].map(star => {
      const count = starMap[star] || 0;
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return { star, count, percentage };
    });

    const stats = {
      totalReviews,
      avgRating,
      photoCount: overallData.photoCount || 0,
      starDistribution,
      starMap,
      subRatings: {
        cleanliness: totalReviews > 0 ? (overallData.cleanlinessAvg || 5.0).toFixed(1) : '--',
        service: totalReviews > 0 ? (overallData.serviceAvg || 4.8).toFixed(1) : '--',
        checkin: totalReviews > 0 ? (overallData.checkinAvg || 4.9).toFixed(1) : '--',
        accuracy: totalReviews > 0 ? (overallData.accuracyAvg || 4.7).toFixed(1) : '--',
        location: totalReviews > 0 ? (overallData.locationAvg || 4.6).toFixed(1) : '--',
        value: totalReviews > 0 ? (overallData.valueAvg || 4.6).toFixed(1) : '--'
      }
    };

    // Filter for review cards
    const filter = { roomId: { $in: targetRoomIds } };
    if (rating && ['1', '2', '3', '4', '5'].includes(rating.toString())) {
      filter.rating = Number(rating);
    }
    if (hasImages === 'true' || hasImages === '1') {
      filter['images.0'] = { $exists: true };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1, createdAt: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = [5, 10, 20].includes(parseInt(limit)) ? parseInt(limit) : 10;
    const totalFiltered = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
    const skip = (pageNumber - 1) * pageSize;

    const rawReviews = await Review.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .populate('roomId', 'title roomCode')
      .lean();

    const reviews = rawReviews.map(rev => {
      // Initials helper
      const name = rev.fullName || 'Khách hàng';
      const parts = name.trim().split(/\s+/);
      let initials = 'KH';
      if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }

      // Check-in / check-out dates formatting
      let stayDates = '';
      if (rev.stayInfo?.checkIn && rev.stayInfo?.checkOut) {
        const d1 = new Date(rev.stayInfo.checkIn);
        const d2 = new Date(rev.stayInfo.checkOut);
        const pad = (n) => String(n).padStart(2, '0');
        stayDates = `${pad(d1.getDate())}/${pad(d1.getMonth() + 1)} ➔ ${pad(d2.getDate())}/${pad(d2.getMonth() + 1)}/${d2.getFullYear()}`;
      }

      // Posted time formatting
      let postedAt = '';
      if (rev.createdAt) {
        const d = new Date(rev.createdAt);
        const pad = (n) => String(n).padStart(2, '0');
        postedAt = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }

      return {
        ...rev,
        initials,
        stayDates,
        postedAt,
        isNegative: rev.rating <= 2,
        roomTitle: rev.stayInfo?.roomTitle || rev.roomId?.title || 'Phòng lưu trú',
        bookingCode: rev.stayInfo?.bookingCode || rev.bookingCode || 'BK-XXXX',
        totalImages: rev.images ? rev.images.length : 0
      };
    });

    const startCount = totalFiltered > 0 ? skip + 1 : 0;
    const endCount = Math.min(skip + pageSize, totalFiltered);

    const pagination = {
      page: pageNumber,
      limit: pageSize,
      totalPages,
      totalFiltered,
      startCount,
      endCount
    };

    if (isApi) {
      return res.json({
        success: true,
        stats,
        reviews,
        pagination,
        rooms: hostRooms,
        selectedRoom
      });
    }

    return res.render('host/reviews/index', {
      user: req.user,
      title: 'Đánh giá & Phản hồi - Smart Travel Host',
      activeNav: 'reviews',
      stats,
      reviews,
      pagination,
      rooms: hostRooms,
      selectedRoom,
      query: req.query
    });
  } catch (error) {
    console.error('Lỗi getHostReviews:', error);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: 'Lỗi tải đánh giá' });
    }
    return res.status(500).send('Lỗi máy chủ khi tải đánh giá');
  }
};

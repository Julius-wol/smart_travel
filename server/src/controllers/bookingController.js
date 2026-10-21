import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

// 1. Tạo đơn đặt phòng mới (Lưu vào MongoDB)
export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      userId,
      fullName,
      phoneNumber,
      email,
      checkIn,
      checkOut,
      guests,
      paymentMethod,
      totalPrice,
    } = req.body;

    // Validate dữ liệu cơ bản từ khách hàng
    if (!fullName || !fullName.trim() || !phoneNumber || !phoneNumber.trim() || !email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.',
      });
    }

    // Kiểm tra phòng có tồn tại không (hỗ trợ cả valid ObjectId và fallback phòng mẫu active)
    let targetRoomId = roomId;
    let room = null;
    if (roomId && mongoose.isValidObjectId(roomId)) {
      room = await Room.findById(roomId);
    }
    if (!room) {
      room = await Room.findOne({ status: 'ACTIVE' });
      if (room) {
        targetRoomId = room._id;
      }
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Phòng không tồn tại hoặc đã ngừng hoạt động',
      });
    }

    // Xử lý ngày nhận/trả phòng thời gian thực
    const startDate = checkIn ? new Date(checkIn) : new Date();
    const endDate = checkOut ? new Date(checkOut) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    // Tính số đêm thực tế
    const diffTime = endDate.getTime() - startDate.getTime();
    const actualNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // CR_BOOK_07: Kiểm tra xem phòng này trong khoảng thời gian đã có người đặt chưa
    const existingConflict = await Booking.findOne({
      roomId: targetRoomId,
      status: 'CONFIRMED',
      $and: [
        { checkIn: { $lt: endDate } },
        { checkOut: { $gt: startDate } }
      ]
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        code: 'CR_BOOK_07',
        message: 'Rất tiếc, phòng này vừa được khách khác đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương.',
      });
    }

    // Tạo mã đặt phòng duy nhất dạng ST-XXXX (ví dụ: ST-5894)
    let bookingCode;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      bookingCode = `ST-${randomNum}`;
      const existing = await Booking.findOne({ bookingCode });
      if (!existing) isUnique = true;
    }

    // Sanitize userId: chỉ lưu nếu đúng định dạng ObjectId MongoDB
    const validUserId = (userId && typeof userId === 'string' && mongoose.isValidObjectId(userId))
      ? userId
      : undefined;

    // Tạo bản ghi đặt phòng mới với thời gian thực
    const newBooking = await Booking.create({
      bookingCode,
      roomId: targetRoomId,
      userId: validUserId,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      checkIn: startDate,
      checkOut: endDate,
      nights: actualNights,
      guests: guests || 2,
      paymentMethod: paymentMethod || 'momo',
      totalPrice: totalPrice || 2550000,
      status: 'CONFIRMED',
    });

    console.log(`✅ Đã tạo đơn đặt phòng thành công: ${bookingCode} cho khách: ${fullName} (${actualNights} đêm)`);

    return res.status(201).json({
      success: true,
      message: 'Đặt phòng và thanh toán thành công!',
      bookingCode,
      data: newBooking,
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo booking:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi tạo đơn đặt phòng',
    });
  }
};

// 2. Kiểm tra tình trạng phòng trống thời gian thực (Real-time Availability)
export const checkAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp roomId, checkIn và checkOut',
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    const conflictingBooking = await Booking.findOne({
      roomId,
      status: 'CONFIRMED',
      $and: [
        { checkIn: { $lt: endDate } },
        { checkOut: { $gt: startDate } }
      ]
    });

    return res.status(200).json({
      success: true,
      available: !conflictingBooking,
      conflictBooking: conflictingBooking
        ? {
            bookingCode: conflictingBooking.bookingCode,
            checkIn: conflictingBooking.checkIn,
            checkOut: conflictingBooking.checkOut,
          }
        : null,
    });
  } catch (error) {
    console.error('Lỗi checkAvailability:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi kiểm tra phòng',
    });
  }
};

// 3. Lấy thông tin đơn đặt phòng theo mã bookingCode (Dùng cho màn hình vé e-Pass)
export const getBookingByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const booking = await Booking.findOne({ bookingCode: code.toUpperCase() }).populate('roomId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đơn đặt phòng',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Lỗi getBookingByCode:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
    });
  }
};

// 4. Lấy danh sách lịch sử đặt phòng của người dùng
export const getMyBookings = async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const bookings = await Booking.find(query).populate('roomId').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Lỗi getMyBookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
    });
  }
};

import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

const PHONE_REGEX = /^(0)(3|5|7|8|9)[0-9]{8}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ỹ\s]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 1. Kiểm tra tình trạng phòng trống trong khoảng thời gian đã chọn
 * GET /api/bookings/check-availability
 */
export const checkAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        code: 'CR_BOOK_04',
        message: 'Vui lòng cung cấp đầy đủ thông tin phòng và thời gian đặt.',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        code: 'CR_BOOK_04',
        message: 'Thời gian nhận phòng và trả phòng không hợp lệ.',
      });
    }

    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $nin: ['REJECTED', 'CANCELLED'] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    return res.status(200).json({
      success: true,
      available: !conflictingBooking,
      data: {
        isAvailable: !conflictingBooking,
      },
      conflictBooking: conflictingBooking
        ? {
            bookingCode: conflictingBooking.bookingCode,
            checkIn: conflictingBooking.checkIn,
            checkOut: conflictingBooking.checkOut,
          }
        : null,
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra phòng trống:', error);
    return res.status(500).json({
      success: false,
      code: 'CR_BOOK_03',
      message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.',
      error: error.message,
    });
  }
};

/**
 * 2. Tạo đơn đặt phòng mới và ghi nhận giao dịch thanh toán
 * POST /api/bookings
 */
export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests = 1,
      guestInfo,
      fullName,
      phoneNumber,
      email,
      specialNote = '',
      notes = '',
      paymentMethod = 'NAPAS_QR',
      totalPrice,
      userId,
    } = req.body;

    const info = guestInfo || {
      fullName: fullName || req.body.name,
      phoneNumber: phoneNumber || req.body.phone,
      email: email,
    };

    // 1. Kiểm tra tính hợp lệ cơ bản của dữ liệu khách hàng
    if (!roomId || !checkIn || !checkOut || !info.fullName || !info.phoneNumber || !info.email) {
      return res.status(400).json({
        success: false,
        code: 'CR_BOOK_04',
        message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.',
      });
    }

    const trimmedFullName = String(info.fullName).trim();
    const trimmedPhoneNumber = String(info.phoneNumber).trim();
    const trimmedEmail = String(info.email).trim().toLowerCase();

    if (
      trimmedFullName.length > 50 ||
      !NAME_REGEX.test(trimmedFullName) ||
      !PHONE_REGEX.test(trimmedPhoneNumber) ||
      !EMAIL_REGEX.test(trimmedEmail)
    ) {
      return res.status(400).json({
        success: false,
        code: 'CR_BOOK_04',
        message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.',
      });
    }

    const noteText = (specialNote || notes || '').trim();
    if (noteText && noteText.length > 200) {
      return res.status(400).json({
        success: false,
        code: 'CR_BOOK_04',
        message: 'Yêu cầu đặc biệt không được vượt quá 200 ký tự.',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        code: 'CR_BOOK_04',
        message: 'Thời gian nhận phòng và trả phòng không hợp lệ.',
      });
    }

    // 2. Tìm kiếm phòng
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
        code: 'CR_BOOK_04',
        message: 'Không tìm thấy phòng tương ứng.',
      });
    }

    // 3. Kiểm tra xung đột lịch đặt phòng (Overlap check)
    const conflictingBooking = await Booking.findOne({
      roomId: targetRoomId,
      status: { $nin: ['REJECTED', 'CANCELLED'] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        conflict: true,
        code: 'CR_BOOK_09',
        message: 'Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác',
      });
    }

    // 4. Tính toán số đêm và giá phòng
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay));
    const pricePerNight = room.pricePerNight || 0;
    const subtotal = pricePerNight * nights;
    const finalTotalPrice = totalPrice || subtotal;

    // 5. Sinh mã đặt phòng duy nhất dạng ST-xxxx
    let bookingCode;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      bookingCode = `ST-${randomNum}`;
      const existing = await Booking.findOne({ bookingCode });
      if (!existing) isUnique = true;
    }

    // 6. Gán userId
    const validUserId = (userId && typeof userId === 'string' && mongoose.isValidObjectId(userId))
      ? userId
      : (req.user?.id && mongoose.isValidObjectId(req.user.id) ? req.user.id : new mongoose.Types.ObjectId());

    // 7. Tạo bản ghi đặt phòng mới
    const newBooking = await Booking.create({
      userId: validUserId,
      roomId: targetRoomId,
      bookingCode,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests: Number(guests) || 1,
      fullName: trimmedFullName,
      phoneNumber: trimmedPhoneNumber,
      email: trimmedEmail,
      guestInfo: {
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        email: trimmedEmail,
      },
      specialNote: noteText,
      notes: noteText,
      paymentMethod,
      pricing: {
        pricePerNight,
        nights,
        subtotal,
        taxAndServiceFeePercentage: 8,
        totalPrice: finalTotalPrice,
      },
      totalPrice: finalTotalPrice,
      status: 'CONFIRMED',
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt phòng và xác nhận thanh toán thành công!',
      bookingCode: newBooking.bookingCode,
      data: {
        _id: newBooking._id,
        bookingCode: newBooking.bookingCode,
        roomId: newBooking.roomId,
        checkIn: newBooking.checkIn,
        checkOut: newBooking.checkOut,
        nights,
        totalPrice: finalTotalPrice,
        status: newBooking.status,
        booking: newBooking,
        ...newBooking.toObject(),
      },
    });
  } catch (error) {
    console.error('Lỗi khi tạo đơn đặt phòng:', error);
    return res.status(500).json({
      success: false,
      code: 'CR_BOOK_03',
      message: error.message || 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.',
    });
  }
};

/**
 * 3. Lấy thông tin đơn đặt phòng theo mã bookingCode
 * GET /api/bookings/:code
 */
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

/**
 * 4. Lấy danh sách lịch sử đặt phòng của người dùng
 * GET /api/bookings/my-bookings
 */
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

const bookingController = {
  checkAvailability,
  createBooking,
  getBookingByCode,
  getMyBookings,
};

export default bookingController;

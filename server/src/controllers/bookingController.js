import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import RoomAvailability from '../models/RoomAvailability.js';
import { findGuestBookingConflict, GUEST_BOOKING_CONFLICT, validStayDates } from '../services/bookingConflictService.js';

// Helper chuẩn hóa phương thức thanh toán
const normalizePaymentMethod = (method) => {
  if (!method) return 'VIETQR';
  const upper = String(method).toUpperCase().trim();
  const validMethods = ['VIETQR', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'APPLE_PAY'];
  if (validMethods.includes(upper)) return upper;
  if (upper === 'CARD') return 'CREDIT_CARD';
  return 'VIETQR';
};

// 1. Tạo đơn đặt phòng mới (Lưu vào MongoDB & Khóa lịch RoomAvailability)
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
      guestDetails,
      guestContact,
      paymentMethod,
      totalPrice,
      notes,
    } = req.body;

    // Lấy thông tin liên hệ ưu tiên từ nested guestContact hoặc flat fields
    const contactName = (guestContact?.fullName || fullName || '').trim();
    const contactPhone = (guestContact?.phone || phoneNumber || '').trim();
    const contactEmail = (guestContact?.email || email || '').trim();
    const contactNote = (guestContact?.guestNote || notes || '').trim();

    // Validate dữ liệu cơ bản từ khách hàng
    if (!contactName || !contactPhone || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ (Họ tên, SĐT, Email).',
      });
    }

    // Kiểm tra phòng có tồn tại không
    let targetRoomId = roomId;
    let room = null;
    if (roomId && mongoose.isValidObjectId(roomId)) {
      room = await Room.findById(roomId);
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Phòng không tồn tại hoặc đã ngừng hoạt động',
      });
    }

    // Xử lý ngày nhận/trả phòng thời gian thực
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    if (!validStayDates(startDate, endDate)) {
      return res.status(400).json({ success: false, message: 'Ngày nhận/trả phòng không hợp lệ.' });
    }
    const accountId = req.user?._id || userId;
    const guestConflict = await findGuestBookingConflict({
      userId: accountId,
      emails: [req.user?.email, contactEmail],
    }, startDate, endDate);
    if (guestConflict) return res.status(409).json(GUEST_BOOKING_CONFLICT);

    // Tính số đêm thực tế
    const diffTime = endDate.getTime() - startDate.getTime();
    const actualNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 1. Kiểm tra xung đột qua Booking
    const existingConflict = await Booking.findOne({
      roomId: targetRoomId,
      status: { $in: ['CONFIRMED', 'PENDING'] },
      $and: [
        { checkIn: { $lt: endDate } },
        { checkOut: { $gt: startDate } }
      ]
    });

    // 2. Kiểm tra xung đột qua RoomAvailability (chặn phòng bị khóa bảo trì hoặc đã book)
    const availabilityConflict = await RoomAvailability.findOne({
      roomId: targetRoomId,
      status: { $in: ['BOOKED', 'BLOCKED'] },
      date: { $gte: startDate, $lt: endDate }
    });

    if (existingConflict || availabilityConflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        code: 'CR_BOOK_07',
        message: 'Rất tiếc, phòng này vừa được khách khác đặt hoặc chủ nhà đã khóa lịch trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương.',
      });
    }

    // Tạo mã đặt phòng duy nhất dạng ST-XXXX (ví dụ: ST-5894 hoặc BK-9821)
    let bookingCode;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      bookingCode = `ST-${randomNum}`;
      const existing = await Booking.findOne({ bookingCode });
      if (!existing) isUnique = true;
    }

    // Sanitize userId
    const validUserId = (accountId && mongoose.isValidObjectId(accountId))
      ? accountId
      : undefined;

    // Tạo bản ghi đặt phòng mới với trạng thái PENDING để Host xét duyệt
    const pricePerNight = Number(room.pricePerNight ?? room.regularPrice ?? room.price);
    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
      return res.status(400).json({ success: false, message: 'Phòng chưa có giá hợp lệ.' });
    }
    const newBooking = await Booking.create({
      bookingCode,
      roomId: targetRoomId,
      userId: validUserId,
      fullName: contactName,
      phoneNumber: contactPhone,
      email: contactEmail.toLowerCase(),
      guestInfo: {
        fullName: contactName,
        phoneNumber: contactPhone,
        email: contactEmail.toLowerCase()
      },
      checkIn: startDate,
      checkOut: endDate,
      nights: actualNights,
      guests: guests || 2,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      pricePerNight,
      totalPrice: pricePerNight * actualNights,
      paymentStatus: 'UNPAID',
      status: 'PENDING',
    });

    // Tự động khóa lịch phòng trong RoomAvailability cho từng ngày lưu trú
    try {
      const currentDate = new Date(startDate);
      const datesToBlock = [];
      while (currentDate < endDate) {
        datesToBlock.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await Promise.all(
        datesToBlock.map((d) =>
          RoomAvailability.findOneAndUpdate(
            { roomId: targetRoomId, date: d },
            {
              $set: {
                status: 'BOOKED',
                bookingId: newBooking._id,
              },
            },
            { upsert: true, returnDocument: 'after' }
          )
        )
      );
    } catch (availErr) {
      console.warn('⚠️ Lỗi khi cập nhật RoomAvailability:', availErr.message);
    }

    console.log(`✅ Đã tạo đơn đặt phòng thành công: ${bookingCode} cho khách: ${contactName} (${actualNights} đêm)`);

    return res.status(201).json({
      success: true,
      message: 'Đã gửi yêu cầu đặt phòng.',
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
    if (!validStayDates(startDate, endDate)) {
      return res.status(400).json({ success: false, message: 'Ngày nhận/trả phòng không hợp lệ.' });
    }
    const guestConflict = await findGuestBookingConflict({
      userId: req.user?._id || req.query.userId,
      emails: [req.user?.email, req.query.email],
    }, startDate, endDate);
    if (guestConflict) return res.status(409).json(GUEST_BOOKING_CONFLICT);

    // Kiểm tra đơn Booking hiện hữu
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['CONFIRMED', 'PENDING'] },
      $and: [
        { checkIn: { $lt: endDate } },
        { checkOut: { $gt: startDate } }
      ]
    });

    // Kiểm tra RoomAvailability (Blocked / Booked)
    const availabilityConflict = await RoomAvailability.findOne({
      roomId,
      status: { $in: ['BOOKED', 'BLOCKED'] },
      date: { $gte: startDate, $lt: endDate }
    });

    const isAvailable = !conflictingBooking && !availabilityConflict;

    return res.status(200).json({
      success: true,
      available: isAvailable,
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
    const booking = await Booking.findOne({ bookingCode: code.toUpperCase() })
      .populate('roomId')
      .populate('hostId', 'fullName name phone email hostProfile');

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
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để xem booking.' });
    const identity = [{ userId: req.user._id }];
    if (req.user.email) {
      const email = new RegExp(`^${req.user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      // Legacy bookings may lack userId. Never include another account's bookings.
      identity.push({ userId: null, $or: [{ email }, { 'guestContact.email': email }, { 'guestInfo.email': email }] });
    }
    const query = { $or: identity };

    const bookings = await Booking.find(query)
      .populate('roomId')
      .populate('hostId', 'fullName name phone email hostProfile')
      .sort({ createdAt: -1 });

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

export default {
  createBooking,
  checkAvailability,
  getBookingByCode,
  getMyBookings,
};

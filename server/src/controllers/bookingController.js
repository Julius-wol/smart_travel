const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

const PHONE_REGEX = /^(0)(3|5|7|8|9)[0-9]{8}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ỹ\s]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Controller xử lý Booking & Payment (SMART-88)
 */
const bookingController = {
  /**
   * GET /api/bookings/check-availability
   * Kiểm tra tình trạng phòng trống trong khoảng thời gian đã chọn
   */
  async checkAvailability(req, res) {
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
        data: {
          isAvailable: !conflictingBooking,
        },
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
  },

  /**
   * POST /api/bookings
   * Tạo đơn đặt phòng mới và ghi nhận giao dịch
   */
  async createBooking(req, res) {
    try {
      const {
        roomId,
        checkIn,
        checkOut,
        guests = 1,
        guestInfo,
        specialNote = '',
        paymentMethod = 'NAPAS_QR',
      } = req.body;

      // 1. Kiểm tra tính hợp lệ cơ bản của dữ liệu
      if (!roomId || !checkIn || !checkOut || !guestInfo) {
        return res.status(400).json({
          success: false,
          code: 'CR_BOOK_04',
          message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.',
        });
      }

      const { fullName, phoneNumber, email } = guestInfo;

      if (
        !fullName ||
        !phoneNumber ||
        !email ||
        fullName.length > 50 ||
        !NAME_REGEX.test(fullName.trim()) ||
        !PHONE_REGEX.test(phoneNumber.trim()) ||
        !EMAIL_REGEX.test(email.trim())
      ) {
        return res.status(400).json({
          success: false,
          code: 'CR_BOOK_04',
          message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.',
        });
      }

      if (specialNote && specialNote.length > 200) {
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

      // 2. Tìm kiếm phòng và tính toán giá
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          code: 'CR_BOOK_04',
          message: 'Không tìm thấy phòng tương ứng.',
        });
      }

      // 3. Kiểm tra xung đột lịch đặt phòng (Overlap check)
      const conflictingBooking = await Booking.findOne({
        roomId,
        status: { $nin: ['REJECTED', 'CANCELLED'] },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      });

      if (conflictingBooking) {
        return res.status(409).json({
          success: false,
          code: 'CR_BOOK_09',
          message: 'Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác',
        });
      }

      // 4. Tính toán số đêm và bảng giá
      const msPerDay = 1000 * 60 * 60 * 24;
      const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay));
      const pricePerNight = room.pricePerNight || 0;
      const subtotal = pricePerNight * nights;
      const totalPrice = subtotal; // Thuế VAT & phí dịch vụ 8% đã bao gồm trong giá niêm yết

      // 5. Sinh mã đặt phòng duy nhất dạng ST-xxxx
      const bookingCode = 'ST-' + Math.floor(1000 + Math.random() * 9000);

      // 6. Gán userId (từ token nếu có hoặc sinh ObjectId ngẫu nhiên nếu là khách)
      const userId = req.user?.id || req.body.userId || new mongoose.Types.ObjectId();

      const newBooking = new Booking({
        userId,
        roomId,
        bookingCode,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(guests) || 1,
        guestInfo: {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim().toLowerCase(),
        },
        specialNote: specialNote ? specialNote.trim() : '',
        paymentMethod,
        pricing: {
          pricePerNight,
          nights,
          subtotal,
          taxAndServiceFeePercentage: 8,
          totalPrice,
        },
        totalPrice,
        status: 'PENDING',
      });

      await newBooking.save();

      return res.status(201).json({
        success: true,
        message: 'Đặt phòng và xác nhận thanh toán thành công!',
        data: {
          _id: newBooking._id,
          bookingCode: newBooking.bookingCode,
          roomId: newBooking.roomId,
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut,
          nights,
          totalPrice,
          status: newBooking.status,
          booking: newBooking,
        },
      });
    } catch (error) {
      console.error('Lỗi khi tạo đơn đặt phòng:', error);
      return res.status(500).json({
        success: false,
        code: 'CR_BOOK_03',
        message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.',
        error: error.message,
      });
    }
  },
};

module.exports = bookingController;

import mongoose from 'mongoose';
import Room from '../models/Room.js';
import RoomBlock from '../models/RoomBlock.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const REASON_LABELS = {
  MAINTENANCE: 'Sửa chữa / Bảo trì định kỳ',
  EXTERNAL_GUEST: 'Giữ chỗ cho khách đặt ngoài hệ thống',
  HOLIDAY_PERSONAL: 'Nghỉ lễ / Gia đình sử dụng',
  OTHER: 'Khác',
};

/**
 * Format date thành chuỗi YYYY-MM-DD
 */
const formatDateStr = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy danh sách các phòng thực tế của Host từ MongoDB Atlas
 * GET /api/host/rooms
 */
export const getHostRooms = async (req, res) => {
  try {
    let ownerId = req.query.ownerId || req.user?.id || req.user?._id;

    if (!ownerId) {
      const hostUser = await User.findOne({ role: { $in: ['HOST', 'host'] } }).lean();
      if (hostUser) {
        ownerId = hostUser._id;
      }
    }

    let filter = {};
    if (ownerId && mongoose.isValidObjectId(ownerId)) {
      filter = { ownerId: new mongoose.Types.ObjectId(ownerId) };
    }

    let rooms = await Room.find(filter)
      .select('_id title name code roomCode address specs pricePerNight regularPrice weekendPrice weekendPricePerNight maxGuests images status')
      .lean();

    // Nếu host được chỉ định chưa có phòng, fallback về tất cả các phòng đang phát hành
    if (!rooms || rooms.length === 0) {
      rooms = await Room.find({
        status: { $in: ['PUBLISHED', 'ACTIVE', 'Published', 'active'] },
      })
        .select('_id title name code roomCode address specs pricePerNight regularPrice weekendPrice weekendPricePerNight maxGuests images status')
        .lean();
    }

    // Chuẩn hóa dữ liệu trả về cho frontend
    const normalizedRooms = rooms.map((r) => {
      const price = r.pricePerNight || r.regularPrice || 1450000;
      const weekend = r.weekendPricePerNight || r.weekendPrice || Math.round(price * 1.15);
      return {
        _id: r._id,
        title: r.title || r.name || 'Phòng nghỉ dưỡng',
        code: r.code || r.roomCode || `#MP-${String(r._id).slice(-4).toUpperCase()}`,
        address: r.address || 'Đà Nẵng',
        specs: r.specs || { bedroom: '2 phòng ngủ', bed: '2 giường', bath: '2 phòng tắm' },
        pricePerNight: price,
        weekendPricePerNight: weekend,
        maxGuests: r.maxGuests || 4,
        images: r.images && r.images.length > 0 ? r.images : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600'],
        status: r.status,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng thành công từ MongoDB Atlas',
      data: normalizedRooms,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng Host:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách phòng',
      error: error.message,
    });
  }
};

/**
 * Lấy ma trận lịch và chỉ số KPI thực tế của phòng theo tháng từ MongoDB
 * GET /api/host/calendar
 */
export const getHostCalendar = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        code: 'EMPTY-ROOM-CAL',
        message: 'Không tìm thấy dữ liệu lịch phòng. Vui lòng chọn một phòng đang hoạt động để xem lịch.',
      });
    }

    const room = await Room.findById(roomId).lean();
    if (!room) {
      return res.status(404).json({
        success: false,
        code: 'EMPTY-ROOM-CAL',
        message: 'Không tìm thấy thông tin phòng lưu trú.',
      });
    }

    // Xác định tháng và năm (Mặc định là tháng & năm hiện tại)
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    // Xác định số ngày trong tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999);

    // Truy vấn các khoảng ngày bị khóa thực tế trong RoomBlock
    const blocks = await RoomBlock.find({
      roomId,
      $or: [
        { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } },
      ],
    }).lean();

    // Truy vấn các đơn booking thực tế trong tháng
    const bookings = await Booking.find({
      roomId,
      status: { $in: ['CONFIRMED', 'PENDING', 'COMPLETED'] },
      $or: [
        { checkIn: { $lte: endOfMonth }, checkOut: { $gte: startOfMonth } },
      ],
    }).lean();

    const priceBase = room.pricePerNight || room.regularPrice || 1450000;
    const weekendBase = room.weekendPricePerNight || room.weekendPrice || Math.round(priceBase * 1.15);

    // Tạo mảng từng ngày trong tháng
    const days = [];
    let soldNights = 0;
    let blockedNights = 0;
    let availableNights = 0;
    let estimatedRevenue = 0;

    const todayStr = formatDateStr(now);

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = formatDateStr(currentDate);
      const dayOfWeekNum = currentDate.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
      const isWeekend = dayOfWeekNum === 5 || dayOfWeekNum === 6 || dayOfWeekNum === 0;

      // Giá áp dụng theo ngày
      const price = isWeekend ? weekendBase : priceBase;
      const isPast = dateStr < todayStr;

      // Tìm xem có block nào trùng ngày này không
      const matchedBlock = blocks.find((b) => {
        const bStart = formatDateStr(b.startDate);
        const bEnd = formatDateStr(b.endDate);
        return dateStr >= bStart && dateStr <= bEnd;
      });

      // Tìm xem có booking nào trùng ngày này không (checkIn <= date < checkOut)
      const matchedBooking = bookings.find((b) => {
        const bCheckIn = formatDateStr(b.checkIn);
        const bCheckOut = formatDateStr(b.checkOut);
        return dateStr >= bCheckIn && dateStr < bCheckOut;
      });

      let status = 'AVAILABLE';
      let bookingData = null;
      let blockData = null;

      if (matchedBlock) {
        status = 'BLOCKED';
        blockedNights++;
        blockData = {
          id: matchedBlock._id,
          reason: matchedBlock.reason,
          reasonLabel: matchedBlock.reasonLabel || REASON_LABELS[matchedBlock.reason] || 'Khóa bảo trì',
          internalNote: matchedBlock.internalNote || '',
        };
      } else if (matchedBooking) {
        if (['CONFIRMED', 'COMPLETED'].includes(matchedBooking.status)) {
          status = 'BOOKED';
          soldNights++;
          estimatedRevenue += price;
        } else if (matchedBooking.status === 'PENDING') {
          status = 'PENDING';
        }

        const isSpanStart = dateStr === formatDateStr(matchedBooking.checkIn);
        bookingData = {
          id: matchedBooking._id,
          bookingCode: matchedBooking.bookingCode || `#BK-${matchedBooking._id.toString().slice(-4).toUpperCase()}`,
          customerName: matchedBooking.fullName || matchedBooking.customerName || 'Khách lưu trú',
          phoneNumber: matchedBooking.phoneNumber || '',
          nights: matchedBooking.nights || 1,
          guests: matchedBooking.guests || 2,
          totalPrice: matchedBooking.totalPrice || price * (matchedBooking.nights || 1),
          specialRequest: matchedBooking.notes || '',
          status: matchedBooking.status,
          isSpanStart,
        };
      } else {
        status = 'AVAILABLE';
        availableNights++;
      }

      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

      days.push({
        date: dateStr,
        dayOfMonth: day,
        dayOfWeek: dayNames[dayOfWeekNum],
        isWeekend,
        isPast,
        price,
        status,
        booking: bookingData,
        block: blockData,
      });
    }

    // Tính toán KPI Tỷ lệ lấp đầy
    const usableNights = daysInMonth - blockedNights;
    const occupancyRate = usableNights > 0 ? Math.round((soldNights / usableNights) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        room: {
          _id: room._id,
          title: room.title || room.name,
          code: room.code || room.roomCode || `#MP-${String(room._id).slice(-4).toUpperCase()}`,
          specs: room.specs?.bedroom || (typeof room.specs === 'string' ? room.specs : '2 phòng ngủ'),
          pricePerNight: priceBase,
          weekendPricePerNight: weekendBase,
        },
        month,
        year,
        kpi: {
          occupancyRate,
          soldNights,
          availableNights,
          estimatedRevenue,
        },
        days,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu Host Calendar:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy dữ liệu lịch',
      error: error.message,
    });
  }
};

/**
 * Khóa một hoặc nhiều ngày đón khách thủ công
 * POST /api/host/calendar/block
 */
export const blockRoomDates = async (req, res) => {
  try {
    const { roomId, startDate, endDate, reason, internalNote, userId } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ roomId, startDate và endDate',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        code: 'CAL-BLOCK-REASON-REQ',
        message: 'Vui lòng chọn lý do khóa lịch phòng trước khi tiếp tục.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: 'Khoảng ngày khóa không hợp lệ',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (end < today) {
      return res.status(400).json({
        success: false,
        code: 'CAL-NAV-PAST',
        message: 'Không thể thực hiện thao tác khóa hoặc mở ngày cho các mốc thời gian trong quá khứ.',
      });
    }

    const startCheck = new Date(start);
    startCheck.setHours(0, 0, 0, 0);
    const endCheck = new Date(end);
    endCheck.setHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
      checkIn: { $lte: endCheck },
      checkOut: { $gt: startCheck },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        code: 'CAL-BLOCK-CONFLICT',
        message: 'Không thể khóa ngày! Khoảng thời gian này đã có đơn đặt phòng đã xác nhận. Vui lòng kiểm tra lại.',
      });
    }

    const roomBlock = new RoomBlock({
      roomId,
      startDate: startCheck,
      endDate: endCheck,
      reason,
      reasonLabel: REASON_LABELS[reason] || 'Khóa bảo trì',
      internalNote: internalNote ? internalNote.slice(0, 100) : '',
      createdBy: userId || null,
    });

    await roomBlock.save();

    return res.status(200).json({
      success: true,
      code: 'CAL-BLOCK-SUCCESS',
      message: 'Đã khóa phòng thành công cho các ngày được chọn. Khách du lịch sẽ không thể đặt phòng vào thời gian này.',
      data: roomBlock,
    });
  } catch (error) {
    console.error('Lỗi khi khóa ngày phòng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi khóa ngày',
      error: error.message,
    });
  }
};

/**
 * Mở bán lại ngày đã bị khóa
 * POST /api/host/calendar/unblock
 */
export const unblockRoomDates = async (req, res) => {
  try {
    const { roomId, blockId, date } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin roomId',
      });
    }

    let deletedCount = 0;
    if (blockId) {
      const result = await RoomBlock.deleteOne({ _id: blockId, roomId });
      deletedCount = result.deletedCount;
    } else if (date) {
      const targetDate = new Date(date);
      const result = await RoomBlock.deleteMany({
        roomId,
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate },
      });
      deletedCount = result.deletedCount;
    }

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi khóa phòng để mở lại.',
      });
    }

    return res.status(200).json({
      success: true,
      code: 'CAL-UNBLOCK-SUCCESS',
      message: 'Đã mở bán lại phòng thành công. Phòng đã sẵn sàng nhận đơn đặt mới trên hệ thống.',
      data: { roomId, deletedCount },
    });
  } catch (error) {
    console.error('Lỗi khi mở khóa ngày:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi mở bán lại ngày',
      error: error.message,
    });
  }
};

/**
 * Duyệt nhanh đơn đặt phòng đang chờ SLA
 * POST /api/host/bookings/:id/approve
 */
export const quickApproveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        code: 'CAL-BOOKING-NOT-FOUND',
        message: 'Không tìm thấy đơn đặt phòng yêu cầu.',
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Đơn đặt phòng đang ở trạng thái ${booking.status}, không thể duyệt.`,
      });
    }

    booking.status = 'CONFIRMED';
    booking.confirmedAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      code: 'CAL-QUICK-APPROVE-SUCCESS',
      message: `Đã xác nhận đơn đặt phòng ${booking.bookingCode || ''} thành công! Khách đã nhận được vé điện tử e-Pass.`,
      data: booking,
    });
  } catch (error) {
    console.error('Lỗi khi duyệt đơn đặt phòng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi duyệt đơn',
      error: error.message,
    });
  }
};

/**
 * Từ chối đơn đặt phòng đang chờ SLA
 * POST /api/host/bookings/:id/reject
 */
export const quickRejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        code: 'CAL-BOOKING-NOT-FOUND',
        message: 'Không tìm thấy đơn đặt phòng yêu cầu.',
      });
    }

    booking.status = 'CANCELLED';
    booking.cancelReason = rejectReason || 'Chủ nhà từ chối nhận phòng';
    booking.cancelledAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      code: 'CAL-QUICK-REJECT-SUCCESS',
      message: `Đã từ chối đơn đặt phòng ${booking.bookingCode || ''}. Hệ thống đã gửi thông báo đến khách hàng.`,
      data: booking,
    });
  } catch (error) {
    console.error('Lỗi khi từ chối đơn đặt phòng:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi từ chối đơn',
      error: error.message,
    });
  }
};

export default {
  getHostRooms,
  getHostCalendar,
  blockRoomDates,
  unblockRoomDates,
  quickApproveBooking,
  quickRejectBooking,
};

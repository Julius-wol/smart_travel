import Room from '../models/Room.js';
import RoomBlock from '../models/RoomBlock.js';
import Booking from '../models/Booking.js';

const REASON_LABELS = {
  MAINTENANCE: 'Sửa chữa / Bảo trì định kỳ',
  EXTERNAL_GUEST: 'Giữ chỗ cho khách đặt ngoài hệ thống',
  HOLIDAY_PERSONAL: 'Nghỉ lễ / Gia đình sử dụng',
  OTHER: 'Khác'
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
 * Lấy danh sách các phòng thuộc sở hữu của Host
 * GET /api/host/rooms
 */
export const getHostRooms = async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = ownerId ? { ownerId } : {};
    
    let rooms = await Room.find(filter).select('_id title code address specs pricePerNight weekendPricePerNight maxGuests images status');
    
    // Đảm bảo có phòng chuẩn Villa Mộng Mơ View Hồ & Rừng Thông (#P-VL204) theo thiết kế Figma
    let figmaRoom = rooms.find(r => r.code === '#P-VL204' || r.title.includes('Villa Mộng Mơ'));
    if (!figmaRoom) {
      figmaRoom = await Room.create({
        title: 'Villa Mộng Mơ View Hồ & Rừng Thông',
        code: '#P-VL204',
        address: 'Số 123 Đường Hoa Hồng, Khu Du Lịch Hồ Tuyền Lâm, Phường 4, Đà Lạt',
        city: 'Đà Lạt',
        specs: { bedroom: '4 phòng ngủ', bed: '4 giường', bath: '3 phòng tắm' },
        pricePerNight: 2500000,
        weekendPricePerNight: 2800000,
        maxGuests: 6,
        status: 'ACTIVE',
        images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600']
      });
      rooms.unshift(figmaRoom);
    } else {
      rooms = [figmaRoom, ...rooms.filter(r => r._id.toString() !== figmaRoom._id.toString())];
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng thành công',
      data: rooms
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách phòng',
      error: error.message
    });
  }
};

/**
 * Helper tự động seed dữ liệu mẫu cho Tháng 11/2026 nếu DB trống
 */
const seedFigmaCalendarDataIfEmpty = async (roomId) => {
  const existingBlocks = await RoomBlock.countDocuments({ roomId });
  const existingBookings = await Booking.countDocuments({ roomId });

  if (existingBlocks === 0) {
    // Ngày 8-10 khóa bảo trì
    await RoomBlock.create({
      roomId,
      startDate: new Date('2026-11-08T00:00:00Z'),
      endDate: new Date('2026-11-10T23:59:59Z'),
      reason: 'MAINTENANCE',
      reasonLabel: 'Khóa bảo trì',
      internalNote: 'Bảo trì hệ thống nước nóng & cảnh quan'
    });
  }

  if (existingBookings === 0) {
    // 1. Booking ngày 1 - 4: Lê Hoàng Nam
    await Booking.create({
      roomId,
      bookingCode: '#BK-9750',
      fullName: 'Lê Hoàng Nam',
      phoneNumber: '0987.654.321',
      email: 'nam.le@example.com',
      checkIn: new Date('2026-11-01T14:00:00Z'),
      checkOut: new Date('2026-11-04T12:00:00Z'),
      nights: 3,
      guests: 2,
      totalPrice: 7800000,
      status: 'CONFIRMED'
    });

    // 2. Booking ngày 13 - 15: Đỗ Thùy Dung
    await Booking.create({
      roomId,
      bookingCode: '#BK-9788',
      fullName: 'Đỗ Thùy Dung',
      phoneNumber: '0909.112.233',
      email: 'dung.do@example.com',
      checkIn: new Date('2026-11-13T14:00:00Z'),
      checkOut: new Date('2026-11-15T12:00:00Z'),
      nights: 2,
      guests: 2,
      totalPrice: 5600000,
      status: 'CONFIRMED'
    });

    // 3. Booking ngày 20 - 23 (CHỜ DUYỆT SLA): Nguyễn Văn An
    await Booking.create({
      roomId,
      bookingCode: '#BK-9821',
      fullName: 'Nguyễn Văn An',
      phoneNumber: '0912.345.678',
      email: 'an.nguyen@example.com',
      checkIn: new Date('2026-11-20T14:00:00Z'),
      checkOut: new Date('2026-11-23T12:00:00Z'),
      nights: 2,
      guests: 4,
      totalPrice: 7500000,
      status: 'PENDING',
      notes: 'Xin nhận phòng sớm lúc 13h00 nếu được do gia đình có con nhỏ...'
    });

    // 4. Booking ngày 23 - 30: Trần Minh Tuấn
    await Booking.create({
      roomId,
      bookingCode: '#BK-9835',
      fullName: 'Trần Minh Tuấn',
      phoneNumber: '0933.445.566',
      email: 'tuan.tran@example.com',
      checkIn: new Date('2026-11-23T14:00:00Z'),
      checkOut: new Date('2026-11-30T12:00:00Z'),
      nights: 7,
      guests: 2,
      totalPrice: 18000000,
      status: 'CONFIRMED'
    });

    // 5. Booking tháng 10: Lê Văn Thịnh
    await Booking.create({
      roomId,
      bookingCode: '#BK-9640',
      fullName: 'Lê Văn Thịnh',
      phoneNumber: '0918.776.655',
      email: 'thinh.le@example.com',
      checkIn: new Date('2026-10-10T14:00:00Z'),
      checkOut: new Date('2026-10-25T12:00:00Z'),
      nights: 15,
      guests: 2,
      totalPrice: 38000000,
      status: 'CONFIRMED'
    });
  }
};

/**
 * Lấy ma trận lịch và chỉ số KPI của phòng theo tháng
 * GET /api/host/calendar
 */
export const getHostCalendar = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        code: 'EMPTY-ROOM-CAL',
        message: 'Không tìm thấy dữ liệu lịch phòng. Vui lòng chọn một phòng đang hoạt động để xem lịch.'
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        code: 'EMPTY-ROOM-CAL',
        message: 'Không tìm thấy thông tin phòng lưu trú.'
      });
    }

    // Tự động seed dữ liệu ban đầu cho phòng nếu chưa có
    await seedFigmaCalendarDataIfEmpty(roomId);

    // Xác định tháng và năm
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : 11;
    const year = req.query.year ? parseInt(req.query.year, 10) : 2026;

    // Xác định số ngày trong tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999);

    // Truy vấn các khoảng ngày bị khóa (RoomBlock) trong tháng
    const blocks = await RoomBlock.find({
      roomId,
      $or: [
        { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } }
      ]
    });

    // Truy vấn các đơn booking trong tháng (Confirmed hoặc Pending)
    let bookings = await Booking.find({
      roomId,
      status: { $in: ['CONFIRMED', 'PENDING'] },
      $or: [
        { checkIn: { $lte: endOfMonth }, checkOut: { $gte: startOfMonth } }
      ]
    });

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
      const isWeekend = (dayOfWeekNum === 5 || dayOfWeekNum === 6 || dayOfWeekNum === 0); // Thứ 6, Thứ 7, CN

      // Giá áp dụng theo ngày
      const price = isWeekend 
        ? (room.weekendPricePerNight || Math.round(room.pricePerNight * 1.12))
        : room.pricePerNight;

      const isPast = dateStr < todayStr;

      // Tìm xem có block nào trùng ngày này không
      const matchedBlock = blocks.find(b => {
        const bStart = formatDateStr(b.startDate);
        const bEnd = formatDateStr(b.endDate);
        return dateStr >= bStart && dateStr <= bEnd;
      });

      // Tìm xem có booking nào trùng ngày này không (checkIn <= date < checkOut)
      const matchedBooking = bookings.find(b => {
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
          internalNote: matchedBlock.internalNote || ''
        };
      } else if (matchedBooking) {
        if (matchedBooking.status === 'CONFIRMED') {
          status = 'BOOKED';
          soldNights++;
          estimatedRevenue += price;
        } else if (matchedBooking.status === 'PENDING') {
          status = 'PENDING';
        }

        const isSpanStart = (dateStr === formatDateStr(matchedBooking.checkIn));
        bookingData = {
          id: matchedBooking._id,
          bookingCode: matchedBooking.bookingCode || ('#BK-' + matchedBooking._id.toString().slice(-4).toUpperCase()),
          customerName: matchedBooking.fullName || 'Khách lưu trú',
          phoneNumber: matchedBooking.phoneNumber || '',
          nights: matchedBooking.nights || 1,
          guests: matchedBooking.guests || 2,
          totalPrice: matchedBooking.totalPrice || (price * (matchedBooking.nights || 1)),
          specialRequest: matchedBooking.notes || '',
          status: matchedBooking.status,
          isSpanStart
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
        block: blockData
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
          title: room.title,
          code: room.code || '#P-VL204',
          specs: room.specs?.bedroom || '4 phòng ngủ',
          pricePerNight: room.pricePerNight,
          weekendPricePerNight: room.weekendPricePerNight || Math.round(room.pricePerNight * 1.12)
        },
        month,
        year,
        kpi: {
          occupancyRate,
          soldNights,
          availableNights,
          estimatedRevenue
        },
        days
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy dữ liệu lịch',
      error: error.message
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
        message: 'Vui lòng cung cấp đầy đủ roomId, startDate và endDate'
      });
    }

    // Bắt buộc phải chọn lý do
    if (!reason) {
      return res.status(400).json({
        success: false,
        code: 'CAL-BLOCK-REASON-REQ',
        message: 'Vui lòng chọn lý do khóa lịch phòng trước khi tiếp tục.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: 'Khoảng ngày khóa không hợp lệ'
      });
    }

    // Kiểm tra không khóa ngày quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (end < today) {
      return res.status(400).json({
        success: false,
        code: 'CAL-NAV-PAST',
        message: 'Không thể thực hiện thao tác khóa hoặc mở ngày cho các mốc thời gian trong quá khứ.'
      });
    }

    // Kiểm tra xung đột với đơn đặt phòng CONFIRMED
    const startCheck = new Date(start);
    startCheck.setHours(0, 0, 0, 0);
    const endCheck = new Date(end);
    endCheck.setHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      roomId,
      status: 'CONFIRMED',
      checkIn: { $lte: endCheck },
      checkOut: { $gt: startCheck }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        code: 'CAL-BLOCK-CONFLICT',
        message: 'Không thể khóa ngày! Khoảng thời gian này đã có đơn đặt phòng đã xác nhận. Vui lòng kiểm tra lại.'
      });
    }

    // Tạo bản ghi khóa phòng mới
    const roomBlock = new RoomBlock({
      roomId,
      startDate: startCheck,
      endDate: endCheck,
      reason,
      reasonLabel: REASON_LABELS[reason] || 'Khóa bảo trì',
      internalNote: internalNote ? internalNote.slice(0, 100) : '',
      createdBy: userId || null
    });

    await roomBlock.save();

    return res.status(200).json({
      success: true,
      code: 'CAL-BLOCK-SUCCESS',
      message: 'Đã khóa phòng thành công cho các ngày được chọn. Khách du lịch sẽ không thể đặt phòng vào thời gian này.',
      data: roomBlock
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi khóa ngày',
      error: error.message
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
        message: 'Vui lòng cung cấp roomId'
      });
    }

    if (blockId) {
      await RoomBlock.findByIdAndDelete(blockId);
    } else if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(12, 0, 0, 0);

      // Xóa tất cả các block bao trùm ngày này
      await RoomBlock.deleteMany({
        roomId,
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp blockId hoặc date để mở khóa'
      });
    }

    return res.status(200).json({
      success: true,
      code: 'CAL-UNBLOCK-SUCCESS',
      message: 'Đã mở bán lại phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi mở khóa ngày',
      error: error.message
    });
  }
};

/**
 * Duyệt nhanh đơn đặt phòng đang chờ SLA trực tiếp trên Lịch
 * POST /api/host/bookings/:id/approve
 */
export const quickApproveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đặt phòng'
      });
    }

    booking.status = 'CONFIRMED';
    await booking.save();

    return res.status(200).json({
      success: true,
      code: 'BOOK-APPROVE-SUCCESS',
      message: `Đã phê duyệt đơn đặt phòng #${booking.bookingCode || id} thành công. Lịch phòng đã được tự động khóa.`,
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi duyệt đơn đặt phòng',
      error: error.message
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
        message: 'Không tìm thấy đơn đặt phòng'
      });
    }

    booking.status = 'REJECTED';
    booking.notes = rejectReason ? `${booking.notes || ''} [Lý do từ chối: ${rejectReason}]` : booking.notes;
    await booking.save();

    return res.status(200).json({
      success: true,
      code: 'BOOK-REJECT-SUCCESS',
      message: `Đã từ chối đơn đặt phòng #${booking.bookingCode || id} thành công. Ngày phòng đã được mở lại.`,
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi từ chối đơn đặt phòng',
      error: error.message
    });
  }
};

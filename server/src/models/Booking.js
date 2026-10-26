import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // Mã vé e-Pass hiển thị trên UI (vd: "BK-9821" hoặc "ST-5894")
  bookingCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }, // Denormalized để tăng tốc Dashboard của Host
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },

  // Thời gian lưu trú
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalNights: { type: Number, required: true, min: 1, default: 1 },

  // Chi tiết đoàn khách
  guestDetails: {
    adults: { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, default: 0 }
  },

  // Thông tin liên hệ & Yêu cầu đặc biệt
  guestContact: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    guestNote: { type: String, maxlength: 500 } // Lời nhắn nhận phòng sớm, tiện ích...
  },

  // Giá & Thanh toán
  pricePerNight: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['VIETQR', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'APPLE_PAY'],
    default: 'VIETQR'
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID', 'REFUNDED'],
    default: 'PAID'
  },

  // Trạng thái đơn đặt phòng
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'],
    default: 'PENDING',
    index: true
  },
  slaDeadline: { type: Date }, // Hạn chót duyệt 24h từ lúc tạo đơn
  rejectionReason: {
    type: String,
    enum: [
      'Trùng lịch / Phòng bận ngoài hệ thống',
      'Cơ sở lưu trú đang bảo trì / sửa chữa',
      'Không đáp ứng được yêu cầu đặc biệt của khách',
      'Lý do bất khả kháng / Thiên tai, thời tiết',
      'Khác'
    ]
  },
  rejectionNote: { type: String, maxlength: 200 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals tương thích ngược với API Mobile App cũ
BookingSchema.virtual('fullName')
  .get(function () { return this.guestContact?.fullName; })
  .set(function (v) {
    if (!this.guestContact) this.guestContact = {};
    this.guestContact.fullName = v;
  });

BookingSchema.virtual('phoneNumber')
  .get(function () { return this.guestContact?.phone; })
  .set(function (v) {
    if (!this.guestContact) this.guestContact = {};
    this.guestContact.phone = v;
  });

BookingSchema.virtual('email')
  .get(function () { return this.guestContact?.email; })
  .set(function (v) {
    if (!this.guestContact) this.guestContact = {};
    this.guestContact.email = v;
  });

BookingSchema.virtual('notes')
  .get(function () { return this.guestContact?.guestNote; })
  .set(function (v) {
    if (!this.guestContact) this.guestContact = {};
    this.guestContact.guestNote = v;
  });

BookingSchema.virtual('nights')
  .get(function () { return this.totalNights; })
  .set(function (v) { this.totalNights = v; });

BookingSchema.virtual('guests')
  .get(function () { return this.guestDetails?.adults; })
  .set(function (v) {
    if (!this.guestDetails) this.guestDetails = { adults: 1, children: 0 };
    this.guestDetails.adults = v;
  });

BookingSchema.index({ hostId: 1, status: 1 });
BookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;

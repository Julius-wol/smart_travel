import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true, uppercase: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  
  // Khách hàng
  fullName: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  guestInfo: {
    fullName: String,
    phoneNumber: String,
    email: String
  },
  guestContact: {
    fullName: String,
    phone: String,
    email: String,
    guestNote: String
  },
  guestDetails: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },

  // Thời gian & Quy mô
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, default: 1 },
  totalNights: { type: Number, default: 1 },
  guests: { type: Number, default: 2 },

  // Ghi chú & Yêu cầu
  notes: { type: String, trim: true },
  specialNote: { type: String, trim: true },
  specialRequests: { type: String, trim: true },

  // Tài chính & Thanh toán
  pricePerNight: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, default: 'Smart Travel Pay' },
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
  
  // Từ chối đơn
  rejectReason: { type: String, trim: true },
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
  strict: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals tương thích ngược
bookingSchema.virtual('customerName').get(function() {
  return this.fullName || this.guestInfo?.fullName || this.guestContact?.fullName || 'Khách vãng lai';
});

bookingSchema.virtual('customerPhone').get(function() {
  return this.phoneNumber || this.guestInfo?.phoneNumber || this.guestContact?.phone || '';
});

bookingSchema.virtual('customerEmail').get(function() {
  return this.email || this.guestInfo?.email || this.guestContact?.email || '';
});

bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

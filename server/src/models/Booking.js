const mongoose = require('mongoose');

const guestInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [50, 'Họ tên tối đa 50 ký tự'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    trim: true,
    lowercase: true,
  },
}, { _id: false });

const pricingBreakdownSchema = new mongoose.Schema({
  pricePerNight: { type: Number, required: true, min: 0 },
  nights: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
  taxAndServiceFeePercentage: { type: Number, default: 8 },
  totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true,
  },
  bookingCode: {
    type: String,
    unique: true,
    index: true,
    default: () => 'ST-' + Math.floor(1000 + Math.random() * 9000),
  },
  checkIn: {
    type: Date,
    required: true,
    index: true,
  },
  checkOut: {
    type: Date,
    required: true,
    index: true,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  guestInfo: {
    type: guestInfoSchema,
    required: true,
  },
  specialNote: {
    type: String,
    trim: true,
    maxlength: 200,
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['NAPAS_QR', 'E_WALLET', 'DIGITAL_WALLET'],
    default: 'NAPAS_QR',
  },
  pricing: {
    type: pricingBreakdownSchema,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
  },
}, { timestamps: true });

// Compound index để tối ưu kiểm tra trùng lịch đặt phòng
bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

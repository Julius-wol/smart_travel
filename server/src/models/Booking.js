import mongoose from 'mongoose';

const guestInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'Họ tên tối đa 50 ký tự'],
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
  },
}, { _id: false });

const pricingBreakdownSchema = new mongoose.Schema({
  pricePerNight: { type: Number, required: false, min: 0 },
  nights: { type: Number, required: false, min: 1 },
  subtotal: { type: Number, required: false, min: 0 },
  taxAndServiceFeePercentage: { type: Number, default: 8 },
  totalPrice: { type: Number, required: false, min: 0 },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
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
    uppercase: true,
    default: () => 'ST-' + Math.floor(1000 + Math.random() * 9000),
  },
  fullName: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
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
  nights: {
    type: Number,
    default: 1,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  guestInfo: {
    type: guestInfoSchema,
    required: false,
  },
  specialNote: {
    type: String,
    trim: true,
    maxlength: 200,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    default: 'NAPAS_QR',
  },
  pricing: {
    type: pricingBreakdownSchema,
    required: false,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
    default: 'CONFIRMED',
  },
}, { timestamps: true });

// Pre-save hook: đồng bộ fullName, phoneNumber, email giữa guestInfo và root fields
bookingSchema.pre('save', function () {
  if (this.guestInfo) {
    if (!this.fullName && this.guestInfo.fullName) this.fullName = this.guestInfo.fullName;
    if (!this.phoneNumber && this.guestInfo.phoneNumber) this.phoneNumber = this.guestInfo.phoneNumber;
    if (!this.email && this.guestInfo.email) this.email = this.guestInfo.email;
  } else if (this.fullName || this.phoneNumber || this.email) {
    this.guestInfo = {
      fullName: this.fullName || '',
      phoneNumber: this.phoneNumber || '',
      email: this.email || '',
    };
  }
});

// Compound index để tối ưu kiểm tra trùng lịch đặt phòng
bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1, status: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export { Booking };
export default Booking;

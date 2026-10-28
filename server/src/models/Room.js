import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [108.2208, 16.0678]
  }
}, { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });

pointSchema.virtual('lat').get(function() {
  return (Array.isArray(this.coordinates) && this.coordinates.length >= 2) ? this.coordinates[1] : 16.0678;
});

pointSchema.virtual('lng').get(function() {
  return (Array.isArray(this.coordinates) && this.coordinates.length >= 2) ? this.coordinates[0] : 108.2208;
});

const roomSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomCode: { type: String, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, required: true, default: 'Đà Nẵng' },
  district: { type: String, default: '' },
  distance: { type: String, default: '' },
  pricePerNight: { type: Number, default: 0, min: 0 },
  weekendPrice: { type: Number, min: 0 },
  maxGuests: { type: Number, default: 2, min: 1 },
  bedrooms: { type: Number, default: 1, min: 1 },
  beds: { type: Number, default: 1, min: 1 },
  area: { type: Number, default: 45 },
  images: [{ type: String }],
  badge: { type: String, default: '' },
  tags: [{ type: String }],
  distance: { type: String, default: '' },
  distanceInfo: { type: String },
  specs: {
    type: { type: String, default: 'Nhà nguyên căn' },
    capacity: { type: String, default: 'Tối đa 2 khách' },
    bedroom: { type: String, default: '1 PN • 1 Giường' },
    bathroom: { type: String, default: '1 Phòng tắm riêng' },
  },
  amenities: [{ type: mongoose.Schema.Types.Mixed }],
  rating: { type: Number, default: 4.9, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  ratingBreakdown: {
    overall: { type: Number, default: 5.0 },
    cleanliness: { type: Number, default: 5.0 },
    location: { type: Number, default: 5.0 },
    service: { type: Number, default: 5.0 },
    amenities: { type: Number, default: 5.0 },
    value: { type: Number, default: 5.0 },
  },
  policy: {
    checkIn: { type: String, default: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)' },
    checkOut: { type: String, default: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)' },
    cancellation: { type: String, default: 'Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00.' },
    freeCancel48h: { type: Boolean, default: true }
  },
  status: { 
    type: String, 
    enum: ['Published', 'Archived', 'Draft', 'ACTIVE', 'HIDDEN'], 
    default: 'Draft' 
  },
  location: {
    type: pointSchema,
    default: () => ({ type: 'Point', coordinates: [108.2208, 16.0678] })
  },
  lastUpdatedBy: { type: String, default: 'Robin Nguyen' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

roomSchema.index({ location: '2dsphere' });

// Pre-save middleware to generate roomCode if not present
roomSchema.pre('save', function() {
  if (!this.roomCode) {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.roomCode = `P-VL${randomSuffix}`;
  }
});

// Indexes hỗ trợ GeoJSON và truy vấn hiệu năng cao
roomSchema.index({ ownerId: 1, status: 1 });
roomSchema.index({ title: 'text', city: 'text' });

const Room = mongoose.model('Room', roomSchema);
export default Room;


import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  address: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true, 
    default: 'Đà Nẵng',
    index: true 
  },
  district: { 
    type: String 
  },
  distance: { 
    type: String, 
    default: '' 
  },
  distanceInfo: {
    type: String
  },
  pricePerNight: { 
    type: Number, 
    required: true, 
    min: 0, 
    index: true 
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxGuests: { 
    type: Number, 
    default: 2, 
    min: 1, 
    index: true 
  },
  images: [{ 
    type: String 
  }],
  badge: { 
    type: String, 
    default: '' 
  },
  tags: [{ 
    type: String 
  }],
  specs: {
    type: { type: String, default: 'Nhà nguyên căn' },
    capacity: { type: String, default: 'Tối đa 4 khách' },
    bedroom: { type: String, default: '2 PN • 2 Giường King' },
    bathroom: { type: String, default: '2 Phòng tắm riêng' },
  },
  amenities: [{
    type: mongoose.Schema.Types.Mixed
  }],
  rating: { 
    type: Number, 
    default: 4.9, 
    min: 0, 
    max: 5, 
    index: true 
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ratingBreakdown: {
    overall: { type: Number, default: 4.9 },
    cleanliness: { type: Number, default: 5.0 },
    location: { type: Number, default: 4.9 },
    service: { type: Number, default: 4.9 },
    amenities: { type: Number, default: 4.8 },
    value: { type: Number, default: 4.9 },
  },
  policy: {
    checkIn: { type: String, default: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)' },
    checkOut: { type: String, default: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)' },
    cancellation: { type: String, default: 'Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00.' },
  },
  cancellationPolicy: {
    type: String,
    default: 'Miễn phí hủy phòng trước 48h'
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'HIDDEN'], 
    default: 'ACTIVE',
    index: true
  },
  location: {
    lat: { type: Number, default: 16.0544 },
    lng: { type: Number, default: 108.2022 }
  }
}, { timestamps: true });

// Text search index cho title và city
roomSchema.index({ title: 'text', city: 'text' });

const Room = mongoose.model('Room', roomSchema);
export default Room;

import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  // Mã phòng hiển thị trên UI (vd: "MP-0102" hoặc "P-VL204")
  roomCode: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: true, 
    minlength: 5, 
    maxlength: 150, 
    trim: true,
    index: true 
  },
  roomType: { 
    type: String, 
    enum: ['HOMESTAY', 'VILLA', 'APARTMENT', 'HOTEL', 'BUNGALOW'], 
    required: true,
    default: 'HOMESTAY'
  },

  // Địa chỉ & Tọa độ GPS (GeoJSON Point)
  city: { type: String, required: true, index: true },
  district: { type: String, default: '' },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, default: [108.2022, 16.0544] } // [longitude, latitude]
  },

  // Thông số phòng & Sức chứa
  maxGuests: { type: Number, required: true, min: 1, max: 50, default: 2 },
  numBedrooms: { type: Number, default: 1, min: 1 },
  numBeds: { type: Number, default: 1, min: 1 },

  // Chính sách giá & Giờ giấc
  regularPrice: { type: Number, required: true, min: 50000 }, // Giá ngày thường (T2 - T5)
  weekendPrice: { type: Number }, // Giá Thứ 6 - CN (nếu bỏ trống = regularPrice)
  freeCancellationBeforeHours: { type: Number, default: 48 }, // Miễn phí hủy trước 48h
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '12:00' },

  description: { type: String, default: '', maxlength: 2000 },
  amenities: [{ type: mongoose.Schema.Types.Mixed }], // Hỗ trợ cả mảng String tên tiện ích và Object tiện ích
  images: [{ type: String, required: true }], // Album ảnh

  // Vòng đời phòng: DRAFT (Nháp) | PUBLISHED (Mở bán) | ARCHIVED (Tạm dừng/Bảo trì) (Kèm hỗ trợ tương thích ACTIVE/HIDDEN)
  status: { 
    type: String, 
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE', 'HIDDEN'], 
    default: 'PUBLISHED', 
    index: true 
  },

  // Điểm đánh giá tích lũy
  rating: { type: Number, default: 0, min: 0, max: 5, index: true },
  numReviews: { type: Number, default: 0 },

  // Các trường bổ trợ giao diện Mobile & Web (Specs, Badges, Tags, Breakdown)
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
  ratingBreakdown: {
    overall: { type: Number, default: 5.0 },
    cleanliness: { type: Number, default: 5.0 },
    location: { type: Number, default: 5.0 },
    service: { type: Number, default: 5.0 },
    amenities: { type: Number, default: 5.0 },
    value: { type: Number, default: 5.0 },
  },
  policy: {
    checkIn: { type: String, default: '14:00' },
    checkOut: { type: String, default: '12:00' },
    cancellation: { type: String, default: 'Miễn phí hủy phòng trước 48h' },
  },
  cancellationPolicy: { type: String, default: 'Miễn phí hủy phòng trước 48h' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals tương thích ngược cho Mobile App & API Client cũ
RoomSchema.virtual('pricePerNight')
  .get(function() { return this.regularPrice; })
  .set(function(v) { this.regularPrice = v; });

RoomSchema.virtual('reviewCount')
  .get(function() { return this.numReviews; })
  .set(function(v) { this.numReviews = v; });

// Indexes hỗ trợ GeoJSON và truy vấn hiệu năng cao
RoomSchema.index({ location: '2dsphere' });
RoomSchema.index({ ownerId: 1, status: 1 });
RoomSchema.index({ title: 'text', city: 'text' });

const Room = mongoose.model('Room', RoomSchema);
export default Room;

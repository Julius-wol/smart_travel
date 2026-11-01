import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: undefined
  }
}, { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });

pointSchema.virtual('lat').get(function() {
  return (Array.isArray(this.coordinates) && this.coordinates.length >= 2) ? this.coordinates[1] : undefined;
});

pointSchema.virtual('lng').get(function() {
  return (Array.isArray(this.coordinates) && this.coordinates.length >= 2) ? this.coordinates[0] : undefined;
});

const roomSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomCode: { type: String, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  district: { type: String, default: '' },
  distance: { type: String, default: '' },
  pricePerNight: { type: Number, default: 0, min: 0 },
  weekendPrice: { type: Number, min: 0 },
  maxGuests: { type: Number, default: 2, min: 1 },
  bedrooms: { type: Number, default: 1, min: 1 },
  beds: { type: Number, default: 1, min: 1 },
  area: { type: Number, min: 0 },
  images: [{ type: String }],
  badge: { type: String, default: '' },
  tags: [{ type: String }],
  distanceInfo: { type: String },
  specs: {
    type: { type: String, default: '' },
    capacity: { type: String, default: '' },
    bedroom: { type: String, default: '' },
    bathroom: { type: String, default: '' },
  },
  amenities: [{ type: mongoose.Schema.Types.Mixed }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  ratingBreakdown: {
    overall: { type: Number, default: 0 },
    cleanliness: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    service: { type: Number, default: 0 },
    amenities: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
  },
  policy: {
    checkIn: { type: String, default: '' },
    checkOut: { type: String, default: '' },
    cancellation: { type: String, default: '' },
    freeCancel48h: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['Published', 'Archived', 'Draft', 'ACTIVE', 'HIDDEN', 'PUBLISHED', 'ARCHIVED', 'DRAFT'], 
    default: 'Draft' 
  },
  location: {
    type: pointSchema,
    default: undefined
  },
  lastUpdatedBy: { type: String, default: '' }
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

// Virtuals tương thích ngược cho Mobile App & API Client cũ
roomSchema.virtual('regularPrice')
  .get(function() { return this.pricePerNight; })
  .set(function(v) { this.pricePerNight = v; });

roomSchema.virtual('numReviews')
  .get(function() { return this.reviewCount; })
  .set(function(v) { this.reviewCount = v; });

// Indexes hỗ trợ GeoJSON và truy vấn hiệu năng cao
roomSchema.index({ ownerId: 1, status: 1 });
roomSchema.index({ title: 'text', city: 'text' });

const Room = mongoose.model('Room', roomSchema);
export default Room;

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true, 
    index: true 
  },
  district: { 
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
    required: true, 
    min: 1, 
    index: true 
  },
  images: [{ 
    type: String 
  }],
  amenities: [{ 
    type: String, 
    index: true 
  }],
  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5, 
    index: true 
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'HIDDEN'], 
    default: 'ACTIVE',
    index: true
  },
  distanceInfo: {
    type: String
  },
  cancellationPolicy: {
    type: String,
    default: 'Miễn phí hủy phòng trước 48h'
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

// Text search index cho title và city
roomSchema.index({ title: 'text', city: 'text' });

module.exports = mongoose.model('Room', roomSchema);

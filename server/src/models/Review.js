import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  // Ràng buộc duy nhất: Mỗi booking chỉ được review đúng 1 lần
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    sparse: true,
    unique: true 
  },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true, 
    minlength: 5, 
    maxlength: 1000 
  },
  images: [{ 
    type: String 
  }], // Tối đa 5 ảnh chụp thực tế từ du khách

  // Trường hỗ trợ hiển thị nhanh trên UI không cần populate nhiều cấp
  fullName: { 
    type: String, 
    trim: true 
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  categories: {
    cleanliness:   { type: Number, min: 1, max: 5 },
    location:      { type: Number, min: 1, max: 5 },
    service:       { type: Number, min: 1, max: 5 },
    amenities:     { type: Number, min: 1, max: 5 },
    value:         { type: Number, min: 1, max: 5 },
    checkin:       { type: Number, min: 1, max: 5 },
    accuracy:      { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 }
  },
  bookingCode: { 
    type: String, 
    default: '' 
  },
  stayInfo: {
    checkIn: { type: Date },
    checkOut: { type: Date },
    roomTitle: { type: String },
    bookingCode: { type: String }
  },
  helpful: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

ReviewSchema.index({ roomId: 1, createdAt: -1 });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;

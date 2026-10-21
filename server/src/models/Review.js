import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    roomId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Lưu sẵn tên & avatar để hiển thị nhanh mà không cần populate
    fullName:  { type: String, required: true, trim: true },
    avatar:    { type: String, default: '' },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true, trim: true, maxlength: 1000 },
    // Tiêu chí chi tiết (tuỳ chọn)
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      location:    { type: Number, min: 1, max: 5 },
      service:     { type: Number, min: 1, max: 5 },
      value:       { type: Number, min: 1, max: 5 },
    },
    // Bookingcode để xác minh đã ở
    bookingCode: { type: String, default: '' },
    helpful:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;

import mongoose from 'mongoose';

const roomBlockSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'MAINTENANCE',        // Sửa chữa / Bảo trì định kỳ
      'EXTERNAL_GUEST',     // Giữ chỗ cho khách đặt ngoài hệ thống
      'HOLIDAY_PERSONAL',   // Nghỉ lễ / Gia đình sử dụng
      'OTHER'               // Khác
    ]
  },
  reasonLabel: {
    type: String,
    default: 'Khóa bảo trì'
  },
  internalNote: {
    type: String,
    maxlength: 100,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

// Compound index tối ưu tìm kiếm theo khoảng ngày của phòng
roomBlockSchema.index({ roomId: 1, startDate: 1, endDate: 1 });

const RoomBlock = mongoose.model('RoomBlock', roomBlockSchema);
export default RoomBlock;

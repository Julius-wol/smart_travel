import mongoose from 'mongoose';

const RoomAvailabilitySchema = new mongoose.Schema({
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true, 
    index: true 
  },
  date: { 
    type: Date, 
    required: true 
  }, // Ngày theo định dạng YYYY-MM-DD
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'BOOKED', 'BLOCKED', 'PENDING'], 
    default: 'AVAILABLE' 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }, // Gắn với đơn phòng nếu đã Booked
  blockReason: { 
    type: String, 
    enum: ['MAINTENANCE', 'EXTERNAL_BOOKING', 'PERSONAL_USE', 'OTHER'] 
  },
  blockNote: { 
    type: String, 
    maxlength: 100 
  }, // Ghi chú nội bộ hiển thị trên ô lịch
  customPrice: { 
    type: Number 
  } // Phụ thu ngày lễ / Giảm giá ngày đặc biệt
}, { timestamps: true });

// Khóa chỉ mục kép: Đảm bảo 1 phòng không bao giờ tồn tại 2 bản ghi trùng ngày
RoomAvailabilitySchema.index({ roomId: 1, date: 1 }, { unique: true });

const RoomAvailability = mongoose.model('RoomAvailability', RoomAvailabilitySchema);
export default RoomAvailability;

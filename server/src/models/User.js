import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'], 
    lowercase: true, 
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc'] 
  },
  fullName: { 
    type: String, 
    required: [true, 'Họ và tên là bắt buộc'], 
    trim: true 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  role: { 
    type: String, 
    enum: ['USER', 'HOST', 'ADMIN'], 
    default: 'USER',
    index: true 
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  // Danh sách homestay yêu thích của khách (Đồng bộ với màn hình SCR-MOB-ACC-03)
  wishlist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room' 
  }],
  // Hồ sơ đối tác dành riêng cho HOST
  hostProfile: {
    businessName: { type: String, trim: true },
    isVerified: { type: Boolean, default: false }
  },
  // Trường tương thích ngược & hỗ trợ xác thực mở rộng
  username: { 
    type: String, 
    trim: true
  },
  firstName: { 
    type: String, 
    trim: true 
  },
  lastName: { 
    type: String, 
    trim: true 
  },
  resetPasswordToken: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Email and username identify an account within its role, not across portals.
UserSchema.index({ email: 1, role: 1 }, { unique: true });
UserSchema.index({ username: 1, role: 1 }, {
  unique: true,
  partialFilterExpression: { username: { $type: 'string', $gt: '' } }
});

// Tự động gán fullName từ firstName và lastName nếu chưa có (tương thích ngược dữ liệu cũ)
UserSchema.pre('validate', function() {
  if (!this.fullName) {
    const combined = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    if (combined || this.username) {
      this.fullName = combined || this.username;
    }
  }
});

// Virtual name tương thích UI cũ
UserSchema.virtual('name').get(function() {
  return this.fullName || `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

const User = mongoose.model('User', UserSchema);

export default User;

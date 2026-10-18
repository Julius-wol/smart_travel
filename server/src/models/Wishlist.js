const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  }
}, { timestamps: true });

// Mỗi người dùng chỉ like một phòng một lần duy nhất
wishlistSchema.index({ userId: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);

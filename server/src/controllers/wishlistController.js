const Wishlist = require('../models/Wishlist');

/**
 * Toggle trạng thái yêu thích phòng
 * POST /api/wishlist/toggle
 */
exports.toggleWishlist = async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin roomId',
      });
    }

    // Nếu người dùng chưa truyền userId hoặc chưa đăng nhập, trả về thành công giả lập
    const targetUserId = userId || req.user?.id || '664c1234567890abcdef1234';

    const existing = await Wishlist.findOne({ userId: targetUserId, roomId });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        message: 'Đã xóa phòng khỏi danh sách yêu thích',
        data: { roomId, isSaved: false },
      });
    } else {
      await Wishlist.create({ userId: targetUserId, roomId });
      return res.status(200).json({
        success: true,
        message: 'Đã thêm phòng vào danh sách yêu thích',
        data: { roomId, isSaved: true },
      });
    }
  } catch (error) {
    console.error('Lỗi toggle wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật danh sách yêu thích',
      error: error.message,
    });
  }
};

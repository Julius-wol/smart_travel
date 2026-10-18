const express = require('express');
const router = express.Router();
const roomRoutes = require('./roomRoutes');
const wishlistController = require('../controllers/wishlistController');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chào mừng đến với Smart Travel API v1!',
    version: '1.0',
  });
});

// Phân hệ Rooms (Homestay discovery, search, filter)
router.use('/rooms', roomRoutes);

// Phân hệ Wishlist (Lưu/bỏ lưu phòng yêu thích)
router.post('/wishlist/toggle', wishlistController.toggleWishlist);

module.exports = router;

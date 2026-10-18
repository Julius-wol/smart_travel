const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/bookings/check-availability - Kiểm tra tình trạng phòng trống
router.get('/check-availability', bookingController.checkAvailability);

// POST /api/bookings - Tạo đơn đặt phòng mới và ghi nhận thanh toán
router.post('/', bookingController.createBooking);

module.exports = router;

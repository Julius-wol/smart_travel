const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Lấy danh sách phòng (tìm kiếm & lọc)
router.get('/', roomController.getRooms);

// Lấy chi tiết một phòng
router.get('/:id', roomController.getRoomById);

module.exports = router;

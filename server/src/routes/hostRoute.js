import express from 'express';
import {
  getRoomsList,
  exportRoomsExcel,
  getCreateRoom,
  getEditRoom,
  saveRoom,
  toggleRoomStatus,
  duplicateRoom,
  deleteRoom,
  uploadImages,
  getHostBookings,
  updateBookingStatus,
  quickAuth,
  getLogin,
  postLogin,
  postGoogleLogin,
  getRegister,
  postRegister,
  logout
} from '../controllers/hostController.js';
import { hostAuth } from '../middlewares/hostAuthMiddleware.js';
import { uploadRoomImages } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public / Auth routes
router.get('/login', getLogin);
router.post('/login', postLogin);
router.post('/auth/google', postGoogleLogin);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/logout', logout);
router.post('/api/quick-auth', quickAuth);

// Base route redirect
router.get('/', (req, res) => res.redirect('/host/rooms'));

// Host protected routes
router.use(hostAuth);

// Room Inventory
router.get('/rooms', getRoomsList);
router.get('/export-excel', exportRoomsExcel);

// Create / Update Room
router.get('/rooms/create', getCreateRoom);
router.get('/rooms/:id/edit', getEditRoom);
router.post('/rooms', saveRoom);
router.put('/rooms/:id', saveRoom);

// Status, Duplicate & Delete
router.post('/rooms/:id/status', toggleRoomStatus);
router.post('/rooms/:id/duplicate', duplicateRoom);
router.delete('/rooms/:id', deleteRoom);

// Multi-image upload
router.post('/api/upload', (req, res, next) => {
  uploadRoomImages.array('images', 15)(req, res, (err) => {
    if (err) {
      if (err.message && err.message.includes('ROOM-IMG-002')) {
        return res.status(400).json({
          code: 'ROOM-IMG-002',
          message: 'Tệp tin vượt quá kích thước 5MB hoặc sai định dạng cho phép (chỉ nhận JPG, PNG, WEBP).'
        });
      }
      return res.status(400).json({
        code: 'ROOM-IMG-002',
        message: err.message || 'Lỗi khi tải ảnh'
      });
    }
    next();
  });
}, uploadImages);

// Bookings approval
router.get('/bookings', getHostBookings);
router.post('/bookings/:id/status', updateBookingStatus);

export default router;

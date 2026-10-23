import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoute from './src/routes/authRoute.js';
import userRoute from './src/routes/userRoute.js';
import roomRoute from './src/routes/roomRoute.js';
import bookingRoute from './src/routes/bookingRoute.js';
import reviewRoute from './src/routes/reviewRoute.js';
import adminRoute from './src/routes/admin.js';
import wishlistRoute from './src/routes/wishlistRoute.js';
import { toggleWishlist } from './src/controllers/wishlistController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares cơ bản
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 2. EJS View Engine (Web Admin)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Welcome API
app.get(['/api', '/api/v1'], (req, res) => {
  res.json({
    success: true,
    message: 'Chào mừng đến với Smart Travel API v1!',
    version: '1.0',
  });
});

// 3. Routes chính
app.use('/api/auth', authRoute);         // Auth & Google
app.use('/api/user', userRoute);         // User Profile
app.use('/api/rooms', roomRoute);        // Homestay / Room Discovery
app.use('/api/bookings', bookingRoute);  // Booking & Checkout
app.use('/api/reviews', reviewRoute);    // Reviews & Rating
app.use('/api/wishlist', wishlistRoute); // Wishlist
app.post('/api/wishlist/toggle', toggleWishlist); // Direct endpoint alias

// Hỗ trợ alias /api/v1
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/rooms', roomRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/wishlist', wishlistRoute);

// Web Admin
app.use('/admin', adminRoute);

// 4. Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_travel')
  .then(() => console.log('✅ Kết nối MongoDB thành công!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// 5. Khởi động Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại http://0.0.0.0:${PORT} (Truy cập qua mạng LAN: http://${process.env.HOST_IP || '192.168.102.37'}:${PORT})`);
  });
}

export default app;

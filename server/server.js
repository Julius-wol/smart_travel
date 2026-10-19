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

// 3. Routes
app.use('/api/auth', authRoute);       // Auth & Google
app.use('/api/user', userRoute);       // User Profile
app.use('/api/rooms', roomRoute);      // Homestay / Room Discovery
app.use('/api/bookings', bookingRoute);// Booking & Checkout
app.use('/api/reviews', reviewRoute);  // Reviews & Rating

// 4. Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_travel')
    .then(() => console.log('✅ Kết nối MongoDB thành công!'))
    .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// 5. Khởi động Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

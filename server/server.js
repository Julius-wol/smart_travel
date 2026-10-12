import express from 'express';
import mongoose from 'mongoose';
 import dotenv from 'dotenv';
import authRoute from './src/routes/authRoute.js';
import apiRoutes from './src/routes/api.js';
import { protectedRoute } from './src/middlewares/authMiddlewares.js';
import cookieParser from 'cookie-parser';
import userRoute from './src/routes/userRoute.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Cấu hình Middlewares cơ bản

app.use(express.json()); // Để đọc JSON từ Mobile App gửi lêns
app.use(cookieParser());

//public routes
app.use('/api/auth', authRoute);

//private routes
app.use('/api/user', userRoute);


// 2. Cấu hình EJS View Engine (Dành cho Web Admin)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Cho phép truy cập file tĩnh (css, js, ảnh upload) từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 3. Kết nối CSDL MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_travel')
    .then(() => console.log(' Kết nối MongoDB thành công!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// 4. Khai báo Routes
app.use('/api/v1', apiRoutes);
app.use('/admin', adminRoutes);

// 5. Khởi động Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

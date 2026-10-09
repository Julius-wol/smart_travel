require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Cấu hình Middlewares cơ bản
app.use(cors());
app.use(express.json()); // Để đọc JSON từ Mobile App gửi lên
app.use(express.urlencoded({ extended: true })); // Để đọc dữ liệu Form HTML

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
const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');

app.use('/api/v1', apiRoutes);
app.use('/admin', adminRoutes);

// 5. Khởi động Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

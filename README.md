# Smart Travel Platform

Dự án Đặt phòng kết hợp Trợ lý AI Du lịch (Sử dụng Google Gemini).
Dự án được tổ chức theo kiến trúc Monorepo bao gồm 2 phân hệ chính:
- **`server/`**: Backend REST API (Node.js, Express, MongoDB) & Web Admin Panel (EJS).
- **`mobile-app/`**: Ứng dụng Mobile dành cho Khách hàng (React Native, Expo).

---

## 📂 Tổng quan cấu trúc thư mục

```text
smart_travel/
├── package.json        # Cấu hình Monorepo (chứa các lệnh npm run dev:all, ...)
├── server/             # 🛠 Backend (Node.js/Express)
│   ├── src/            # Mã nguồn chính của Server
│   │   ├── config/     # Các cấu hình hệ thống (Database, API Keys...)
│   │   ├── controllers/# Logic xử lý cho từng API (nhận req, trả res)
│   │   ├── middlewares/# Các hàm trung gian (Xác thực JWT, Upload file...)
│   │   ├── models/     # Các Schema MongoDB định nghĩa cấu trúc dữ liệu
│   │   ├── routes/     # Định nghĩa Endpoints (Routing)
│   │   └── utils/      # Các hàm tiện ích dùng chung
│   ├── views/          # Giao diện EJS (Server-Side Rendering) cho Web Admin
│   └── server.js       # Điểm vào (Entry point) của Server
└── mobile-app/         # 📱 Mobile App (React Native/Expo)
    ├── src/            # Mã nguồn chính của Mobile App
    │   ├── assets/     # Hình ảnh, fonts, icons...
    │   ├── components/ # Các UI Components dùng lại nhiều lần
    │   ├── database/   # Quản lý lưu trữ local (SQLite, AsyncStorage...)
    │   ├── navigation/ # Cấu hình chuyển đổi giữa các màn hình (React Navigation)
    │   ├── screens/    # Các màn hình chính (Home, Login, Booking, Profile...)
    │   ├── services/   # Nơi cấu hình gọi API giao tiếp với Backend Server
    │   ├── store/      # Quản lý State toàn cục (Redux Toolkit...)
    │   └── utils/      # Các hàm tiện ích
    ├── App.js          # Điểm khởi chạy giao diện của ứng dụng Mobile
    └── package.json    # Quản lý thư viện riêng của Mobile
```

---

## 🚀 1. Hướng dẫn cài đặt (Dành cho thành viên team)

Vì dự án sử dụng **NPM Workspaces**, bạn chỉ cần chạy lệnh cài đặt một lần duy nhất tại thư mục gốc để tự động cài thư viện cho cả `server` và `mobile-app`.

### Yêu cầu môi trường
- Node.js (Khuyên dùng bản LTS >= 18.x)
- Cài đặt sẵn MongoDB (Local hoặc MongoDB Atlas)

### Cài đặt dependencies
Tại thư mục gốc `smart_travel`, mở Terminal và chạy lệnh:
```bash
npm install
```

---

## 🛠 2. Cấu hình Biến môi trường (.env)

Mỗi phân hệ cần có cấu hình môi trường riêng. Tuyệt đối **KHÔNG** commit file `.env` lên Github.

### Cho Server
Di chuyển vào thư mục `server/` và copy file mẫu:
```bash
cd server
cp .env.example .env
```
*Mở file `server/.env` và điền các thông số: URI kết nối MongoDB, Secret Key cho JWT, API Key của Gemini...*

---

## 🏃 3. Hướng dẫn chạy dự án (Run dev)

Dự án được cấu trúc theo dạng Monorepo. Bạn có thể khởi chạy từ thư mục gốc nhờ vào các scripts đã được định nghĩa trong `package.json`.

### Chạy tất cả cùng lúc (Khuyên dùng)
Mở **một** Terminal ở thư mục gốc và chạy lệnh sau để khởi động đồng thời Backend Server và Mobile App:
```bash
npm run dev:all
```

### Chạy lẻ từng phần
Nếu chỉ muốn chạy riêng rẽ, bạn mở Terminal ở thư mục gốc và chạy một trong các lệnh sau:
- **Chạy Backend Server:** `npm run dev:server`
- **Chạy Mobile App:** `npm run dev:mobile`

---

## 🌳 4. Quy trình làm việc nhóm (Git Workflow)

Để hạn chế conflict, team thống nhất tuân thủ quy tắc sau:
1. Nhánh chính (`main` hoặc `master`) chỉ chứa code đã hoàn thiện và chạy ổn định.
2. Khi làm task mới, hãy tạo nhánh từ nhánh chính: 
   - `git checkout -b feature/ten-tinh-nang`
3. Sau khi code xong, format code và commit:
   - `git add .`
   - `git commit -m "feat: thêm tính năng xyz"`
4. Push nhánh của bạn lên repo và tạo **Pull Request (PR)** để review code.



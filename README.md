# Smart Travel Platform

Dự án Đặt phòng kết hợp Trợ lý AI Du lịch (Sử dụng Google Gemini).
Dự án được tổ chức theo kiến trúc Monorepo bao gồm 2 phân hệ chính:
- **`server/`**: Backend API & Web Admin Panel (Node.js, Express, MongoDB, EJS).
- **`mobile-app/`**: Ứng dụng Mobile dành cho Khách (React Native, Expo).

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

Bạn có thể chạy dự án từ thư mục gốc nhờ vào các scripts đã được định nghĩa trong `package.json`.

### Chạy Backend Server
Mở Terminal ở thư mục gốc và chạy:
```bash
npm run dev:server
```

### Chạy Mobile App
Mở một Terminal khác (cũng ở thư mục gốc) và chạy:
```bash
npm run dev:mobile
```

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

Chúc team code vui và không bug! 🐛🚫

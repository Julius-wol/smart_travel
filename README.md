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

## 🗄 3. Hướng dẫn Khởi tạo MongoDB Atlas & Nạp Dữ Liệu Mẫu (Seed Data)

Hệ thống sử dụng **MongoDB Schema v2.0** chuẩn hoá phục vụ cả **Host Web Portal** và **Visitor Mobile App**. Để tạo cơ sở dữ liệu riêng hoặc làm mới dữ liệu cho toàn bộ thành viên:

### A. Khởi tạo MongoDB Atlas mới (Free M0 Cluster)
1. Đăng ký/Đăng nhập tại [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Chọn **Create Database** -> Chọn gói **M0 Free (Shared)** -> Chọn vùng **AWS Singapore (`ap-southeast-1`)** để đạt tốc độ cao nhất từ Việt Nam.
3. **Tạo Database User**: Nhập `Username` và `Password` (lưu lại mật khẩu).
4. **Cấu hình Network Access**: Thêm IP `0.0.0.0/0` (Allow Access from Anywhere) để các thành viên và thiết bị Mobile đều truy cập được.
5. **Lấy chuỗi kết nối (Connection String)**:
   - Vào tab **Database** -> Nhấn nút **Connect** -> Chọn **Drivers** (Node.js).
   - Copy chuỗi có dạng:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_travel?retryWrites=true&w=majority
     ```
   - Thay `<username>` và `<password>` của bạn vào chuỗi trên, sau đó dán vào biến `MONGO_URI` trong file `server/.env`.

### B. Nạp Dữ Liệu Mẫu Tự Động (1 Lệnh Duy Nhất)
Tại thư mục gốc của dự án, mở Terminal và chạy:
```bash
npm run seed
```
> Lệnh này sẽ tự động khởi tạo toàn bộ dữ liệu mẫu chuẩn Schema v2.0 bao gồm: Tài khoản định danh, Homestay/Villa đa vùng miền, Đơn đặt phòng có mã `ST-XXXX`, Đánh giá đa tiêu chí (có `amenities`), Lịch khóa phòng `RoomAvailability`, và Danh sách yêu thích `Wishlist`.

### C. Danh sách Tài khoản & Dữ liệu Mẫu để Test

| Vai trò | Email đăng nhập | Mật khẩu | Mục đích kiểm thử |
| :--- | :--- | :---: | :--- |
| **HOST (Chủ nhà)** | `host@smarttravel.com` | `123456` | Kiểm tra **Host Portal**: Dashboard thống kê doanh thu, duyệt/từ chối booking, quản lý phòng. |
| **USER 1 (Khách du lịch)** | `user@smarttravel.com` | `123456` | Kiểm tra **Mobile App**: Đặt phòng, xem vé e-Pass, xem phòng yêu thích (Wishlist). |
| **USER 2 (Khách du lịch)** | `guest@smarttravel.com` | `123456` | Kiểm tra tạo booking mới, viết đánh giá và phản hồi phòng. |
| **ADMIN (Quản trị viên)** | `admin@smarttravel.com` | `123456` | Kiểm tra trang Quản trị hệ thống (Admin Web Panel). |

**Mã Đặt Phòng (UI ID - ST-XXXX) có sẵn trong hệ thống:**
* `ST-9821`: Đơn **ĐÃ HOÀN THÀNH (COMPLETED)** — Có sẵn Review đánh giá thực tế.
* `ST-5894`: Đơn **ĐÃ DUYỆT (CONFIRMED)** — Dùng để kiểm tra hiển thị Vé điện tử e-Pass trên Mobile App.
* `ST-3344`: Đơn **CHỜ DUYỆT (PENDING)** — Dùng để kiểm tra tính năng Duyệt đặt phòng trên Host Portal.
* `ST-4412`: Đơn **ĐÃ HỦY (CANCELLED)** — Có lý do và ghi chú hủy phòng.

**Mã Cơ Sở Lưu Trú (UI ID - RoomCode):**
* `DN-01`: *An Nhiên Eco Retreat Đà Nẵng* (Sơn Trà - Biển Mỹ Khê)
* `DN-02`: *The Muse Bohemian Studio* (An Thượng - Ngũ Hành Sơn)
* `DN-03`: *Mộc Garden Villa & Private Pool* (Villa hồ bơi riêng Đà Nẵng)
* `DL-01`: *Mây Valley Pine Bungalow Đà Lạt* (Đồi thông săn mây Khe Sanh)
* `HA-01`: *Hội An Riverside Heritage Retreat* (Nhà cổ ven sông Hoài)
* `HN-01`: *West Lake Sunset Luxury Loft Hà Nội* (Penthouse panorama Hồ Tây)

---

## 🏃 4. Hướng dẫn chạy dự án (Run dev)

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

## 🌳 5. Quy trình làm việc nhóm (Git Workflow)

Để hạn chế conflict, team thống nhất tuân thủ quy tắc sau:
1. Nhánh chính (`main` hoặc `master`) chỉ chứa code đã hoàn thiện và chạy ổn định.
2. Khi làm task mới, hãy tạo nhánh từ nhánh chính: 
   - `git checkout -b feature/ten-tinh-nang`
3. Sau khi code xong, format code và commit:
   - `git add .`
   - `git commit -m "feat: thêm tính năng xyz"`
4. Push nhánh của bạn lên repo và tạo **Pull Request (PR)** để review code.

---
## 📋 6. Quy trình phát triển Spec-Driven Development (Spec Kit)

Dự án đã tích hợp công cụ **Spec Kit** (`github/spec-kit`) nhằm chuẩn hóa quy trình phát triển có sự hỗ trợ của AI Agent theo phương pháp **Spec-Driven Development (SDD)**:

- 📜 **Hiến pháp dự án (Constitution)**: [.specify/memory/constitution.md](.specify/memory/constitution.md) - Quy định kiến trúc, tiêu chuẩn API, bảo mật và công nghệ bắt buộc.
- 📖 **Hướng dẫn chi tiết quy trình SDD**: [docs/SPEC_KIT_SDD_GUIDE.md](docs/SPEC_KIT_SDD_GUIDE.md) - Hướng dẫn 7 bước từ tạo spec (`/speckit.specify`), lập kế hoạch (`/speckit.plan`), phân rã task (`/speckit.tasks`) đến khi sinh mã nguồn (`/speckit.implement`).

---

## 📚 7. Tài liệu kỹ thuật & Kiến trúc (Documentation)

- [Quy trình hoạt động Authentication (JWT & Google OAuth)](docs/JWT_AUTH_WORKFLOW.md)
- [Đặc tả Giao diện Chi tiết Nơi lưu trú (Home Details Screen)](docs/HOME_DETAILS_SPEC.md)
- [Đặc tả Cơ sở dữ liệu (Database Schema)](docs/database-schema.md)

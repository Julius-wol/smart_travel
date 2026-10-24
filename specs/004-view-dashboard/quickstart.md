# Quickstart Guide: View Dashboard (SMART-110)

## 1. Khởi Chạy Server & Test Backend API

```bash
cd server
npm start
```

* **Test API Tổng quan:**
  ```bash
  curl http://localhost:5000/api/host/dashboard?period=30_DAYS
  ```
* **Test API Xuất báo cáo:**
  ```bash
  curl http://localhost:5000/api/host/dashboard/export?period=30_DAYS
  ```

---

## 2. Khởi Chạy Mobile App

```bash
cd mobile-app
npx expo start
```

* Nhấn phím `w` để mở giao diện Web hoặc quét mã QR bằng ứng dụng Expo Go trên thiết bị di động.
* Điều hướng đến màn hình **Host Dashboard** (`HostDashboardScreen`).
* Sidebar: Mục `Tổng quan` được kích hoạt sẵn (`activeId="overview"`).
* Bấm vào `Lịch phòng & Giá` để chuyển sang `HostCalendarScreen`.

---

## 3. Các Kịch Bản Kiểm Thử Thủ Công & E2E (Checklist)

1. **Header & Bộ lọc Thời gian:**
   - Chọn "7 ngày qua", "30 ngày qua", "Tháng này" -> 4 thẻ KPI và biểu đồ tự động cập nhật số liệu.
   - Bấm nút "Xuất báo cáo" -> Hiển thị Toast thông báo xanh `[DASH-EXPORT-SUCCESS]`.
2. **SLA Alert Banner:**
   - Khi có đơn PENDING: Banner vàng cam xuất hiện cảnh báo đơn gấp nhất (#BK-9819).
   - Bấm `Chuyển tới Duyệt đơn →` điều hướng sang màn hình Booking Approval.
3. **Biểu đồ Doanh thu (Area Chart):**
   - Bấm chuyển đổi giữa `Doanh thu (VNĐ)` và `Số đơn`.
   - Chọn dropdown `Lọc theo phòng` (Tất cả hoặc từng phòng cụ thể).
   - Chạm vào các điểm nút đồ thị để xem Card Tooltip nổi.
4. **Lịch Nhận / Trả phòng:**
   - Chuyển giữa tab `Hôm nay (4)` và `Ngày mai (2)`.
   - Kiểm tra hiển thị khách, tên phòng, SĐT che `0912.***.678` và status badge.
5. **Đánh giá mới nhất:**
   - Hiển thị 3 đánh giá kèm điểm sao, tên phòng, ngày đăng và trích dẫn nhận xét.
   - Bấm vào bài đánh giá hoặc `Xem tất cả →` điều hướng sang [SMART-108].

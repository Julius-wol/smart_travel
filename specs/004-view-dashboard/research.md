# Research & Technical Decisions: View Dashboard (SMART-110)

**Feature**: View Dashboard (`SMART-110`)  
**Parent Ticket**: `SMART-107`  
**Date**: 2026-10-24  
**Status**: Completed  

---

## 1. Technical Context & Architectural Decisions

### Research 1: Cơ chế Tổng hợp Dữ liệu Dashboard theo Khoảng Thời Gian
* **Context**: Màn hình Dashboard cần cung cấp dữ liệu tức thì theo 5 mốc thời gian: `Hôm nay (TODAY)`, `7 ngày qua (7_DAYS)`, `30 ngày qua (30_DAYS)` (mặc định), `Tháng này (THIS_MONTH)`, `Tháng trước (LAST_MONTH)`.
* **Decision**: Xây dựng endpoint duy nhất `GET /api/host/dashboard` nhận query `?period=30_DAYS&roomId=ALL`:
  * Backend tự động tính toán dải ngày `[startDate, endDate]` dựa trên `period`.
  * Lọc toàn bộ các phòng thuộc `ownerId` của Host đăng nhập (tuân thủ nguyên tắc bảo mật phân quyền `BR-HOST-01`).
* **Rationale**: Gom toàn bộ KPI, biểu đồ, cảnh báo SLA và danh sách đón/tiễn vào 1 API payload duy nhất giúp giảm thiểu số lượng network requests (tránh waterfall), render giao diện đồng bộ trong 1 lần fetch.

---

### Research 2: Công thức Tính Toán 4 Chỉ Số KPI Cốt Lõi (BR-HOST-06)
* **Context**: Cần tính toán chính xác 4 chỉ số hiển thị trên hàng thẻ KPI:
  1. **Doanh thu**:
     $$\text{Doanh thu} = \sum \text{totalPrice} \quad (\text{đơn Booking trạng thái } \text{CONFIRMED} \text{ hoặc } \text{COMPLETED} \text{ có check-in trong kỳ})$$
     * Hiển thị rút gọn: `[X] M VND` (ví dụ `45.2 M VND`). Sub-badge: `[N] đơn hoàn thành & đã xác nhận`.
  2. **Đơn đặt mới**:
     $$\text{Đơn mới} = \text{Count}(\text{Bookings tạo mới trong kỳ, bất kể trạng thái})$$
     * Sub-badge: `Tỷ lệ chốt đơn tự động [X]%` (tỷ lệ đơn CONFIRMED tự động qua hệ thống / tổng đơn).
  3. **Tỷ lệ lấp đầy**:
     $$\text{Tỷ lệ lấp đầy} = \frac{\text{Số đêm phòng đã bán (Booked)}}{\text{Số phòng ACTIVE} \times \text{Số ngày trong kỳ}} \times 100\%$$
     * Hiển thị dạng phần trăm (ví dụ `68%`). Nếu Host chưa có phòng hoạt động, hiển thị `0%` hoặc `--`.
  4. **Điểm đánh giá TB**:
     $$\text{Điểm TB} = \frac{\sum \text{rating}}{\text{Tổng số lượt đánh giá}}$$
     * Hiển thị dạng `[X.X] ★` (ví dụ `4.7 ★`). Nếu chưa có đánh giá nào, hiển thị `--`.

---

### Research 3: Cấu Trúc Dữ Liệu & Render Biểu Đồ Doanh Thu & Xu Hướng
* **Context**: Biểu đồ yêu cầu hỗ trợ chuyển đổi giữa 2 chế độ trục Y: `Doanh thu (VNĐ)` và `Số đơn`, đồng thời lọc theo từng phòng hoặc xem gộp `Tất cả phòng`. Khi chạm vào 1 điểm trên đồ thị, hiển thị Card Tooltip nổi.
* **Decision**:
  * Trả về mảng `timeline` gồm từng mốc ngày cách nhật hoặc theo chuỗi ngày trong kỳ:
    ```json
    [
      { "date": "2026-10-15", "label": "15/10", "revenue": 5000000, "bookingsCount": 2, "details": "2 đơn (Villa Mộng Mơ & Ocean View)" }
    ]
    ```
  * Tính sẵn 2 chỉ số chân trang:
    * `dailyAverage`: Doanh thu trung bình theo ngày (ví dụ `1.506.000 đ`).
    * `peakRevenue`: Đỉnh doanh thu cao nhất kèm ngày đạt đỉnh (ví dụ `7.500.000 đ (Ngày 20/10)`).
  * Render phía Client: Sử dụng SVG Area Chart mượt mà, hỗ trợ touch/tap để chọn điểm hiển thị tooltip nổi màu tối.

---

### Research 4: Quy Tắc Cảnh Báo Đơn Chờ Duyệt Khẩn Cấp (SLA 24h - BR-HOST-03)
* **Context**: Đơn đặt phòng trạng thái `PENDING` cần được Host phản hồi trong vòng 24 giờ kể từ lúc tạo đơn.
* **Decision**:
  * Query tất cả đơn `PENDING` của Host:
    ```javascript
    const pendingBookings = await Booking.find({
      roomId: { $in: hostRoomIds },
      status: 'PENDING'
    }).sort({ createdAt: 1 });
    ```
  * Nếu `pendingBookings.length > 0`:
    * Tính thời gian còn lại cho đơn gấp nhất:
      $$\text{expireHours} = \max\left(1, \text{round}\left(\frac{(\text{createdAt} + 24\text{h}) - \text{now}}{3600 \times 1000}\right)\right)$$
    * Bật SLA Banner: *"Bạn có [X] đơn chờ duyệt, trong đó 1 đơn (#[Mã đơn]) sẽ hết hạn sau [Y] giờ."*
    * Cung cấp link hành động `Chuyển tới Duyệt đơn →` điều hướng sang màn hình Booking Approval.
  * Nếu không có đơn chờ (`pendingBookings.length === 0`), ẩn hoàn toàn banner.

---

### Research 5: Lịch Đón / Tiễn Khách Hôm Nay vs Ngày Mai
* **Context**: Thẻ "Lịch Nhận / Trả phòng" hiển thị khách đến (Check-in 14:00) hoặc khách đi (Check-out 12:00) trong ngày Hôm nay hoặc Ngày mai. Cần bảo mật thông tin liên lạc (che bớt số điện thoại).
* **Decision**:
  * Filter bookings có `checkIn` hoặc `checkOut` trùng với ngày Hôm nay hoặc Ngày mai.
  * Hàm mask số điện thoại: `phone.replace(/(\d{4})\d{3}(\d{3})/, '$1.***.$2')` (ví dụ `0912345678` -> `0912.***.678`).
  * Gắn nhãn badge:
    * `🟢 Check-in [Giờ]` (vd: `Check-in 14:00`, `Check-in 15:30`)
    * `🔵 Check-out [Giờ]` (vd: `Check-out 12:00`, `Check-out 11:30`)

---

### Research 6: Khối Đánh Giá Mới Nhất
* **Context**: Hiển thị Top 3 nhận xét mới nhất từ khách du lịch đã hoàn thành kỳ nghỉ.
* **Decision**:
  * Query 3 reviews mới nhất từ `Review` model thuộc các phòng của Host, sắp xếp `createdAt: -1`.
  * Trích xuất: Tên khách, Avatar chữ cái viết tắt, Số sao (1-5 sao), Tên phòng, Ngày đăng, Nội dung nhận xét (rút gọn 2 dòng).
  * Nhấp vào bài đánh giá hoặc bấm `Xem tất cả →` điều hướng sang màn hình Đánh giá & Phản hồi (`SMART-108`).

---

### Research 7: Nghiệp Vụ Xuất Báo Cáo Kinh Doanh
* **Context**: Khi Host bấm nút `Xuất báo cáo`, hệ thống tiến hành trích xuất số liệu kinh doanh ra file Excel/PDF và hiển thị thông báo thành công `[DASH-EXPORT-SUCCESS]`.
* **Decision**:
  * Cung cấp endpoint `GET /api/host/dashboard/export` hoặc xử lý kết xuất trực tiếp trên client với thông báo toast chuẩn `DASH-EXPORT-SUCCESS`: *"Đang kết xuất báo cáo kinh doanh ra file Excel, quá trình tải xuống sẽ bắt đầu ngay."*

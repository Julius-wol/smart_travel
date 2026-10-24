# Feature Specification: View Dashboard (SMART-110)

**Feature Branch**: `feature/SMART-110-view-dashboard`  
**Created**: 2026-10-24  
**Status**: Ready for Planning  
**Input**: User description: "SMART-110 View Dashboard", Jira Ticket `SMART-110` (Parent: `SMART-107`), Figma Design Node:
- Main Host Dashboard Screen: [Figma Node 394:1125](https://www.figma.com/design/BUZPMFqoSItS2eJF3mzi7Z/Smart-Travel?node-id=394-1125)

---

## 1. Executive Summary & User Story

Là một **Host (Đối tác cho thuê phòng)**,  
**Tôi muốn** xem dashboard tổng hợp thông tin về doanh thu, số lượng phòng, tỉ lệ booking, doanh thu theo các mốc thời gian, lịch nhận/trả phòng và reviews trong cùng một không gian,  
**Để** tôi có thể dễ dàng quản lý vận hành, nắm bắt nhanh tình hình kinh doanh và điều hướng đến các dịch vụ cần thiết.

---

## 2. User Scenarios & Testing *(Prioritized User Journeys)*

### User Story 1 - Header Chào mừng, Bộ lọc Thời gian & Xuất Báo Cáo (Priority: P1)
Host đăng nhập vào ứng dụng và truy cập màn hình "Tổng quan" (Dashboard). Hệ thống hiển thị lời chào kèm tên Host ("Xin chào, Robin Nguyen 👋"). Phía trên bên phải hiển thị dropdown khoảng thời gian lọc (mặc định "30 ngày qua", có thể chọn "Hôm nay", "7 ngày qua", "30 ngày qua", "Tháng này", "Tháng trước") và nút "Xuất báo cáo".

* **Why this priority**: Cung cấp ngữ cảnh thời gian làm cơ sở cho toàn bộ các thẻ KPI và biểu đồ bên dưới.
* **Independent Test**: Chọn các mốc thời gian khác nhau từ dropdown -> 4 thẻ KPI và biểu đồ doanh thu tự động tính toán lại dữ liệu tương ứng. Bấm "Xuất báo cáo" -> hiển thị thông báo thành công `[DASH-EXPORT-SUCCESS]`.
* **Acceptance Scenarios**:
  1. **Given** Host truy cập màn hình Tổng quan, **When** màn hình tải xong, **Then** hiển thị H1: `Xin chào, [Tên Host] 👋` (vd: "Xin chào, Robin Nguyen 👋") và Subtext: `Đây là tình hình kinh doanh của bạn`.
  2. **Given** dropdown "Khoảng thời gian", **When** mở chọn, **Then** hiển thị danh sách các mốc: `Hôm nay`, `7 ngày qua`, `30 ngày qua` (mặc định), `Tháng này`, `Tháng trước`.
  3. **Given** Host đổi mốc thời gian, **When** giá trị thay đổi, **Then** 4 KPI Cards và Biểu đồ doanh thu tự động tải và tính toán lại dữ liệu thời gian thực.
  4. **Given** nút `Xuất báo cáo` (Primary Teal `#00685F`), **When** Host bấm nút, **Then** hệ thống hiển thị thông báo `[DASH-EXPORT-SUCCESS]`: *"Đang kết xuất báo cáo kinh doanh ra file Excel, quá trình tải xuống sẽ bắt đầu ngay."*

---

### User Story 2 - SLA Alert Banner: Cảnh Báo Đơn Chờ Duyệt Khẩn Cấp (Priority: P1)
Khi có đơn đặt phòng đang ở trạng thái `Pending` (chờ duyệt), hệ thống tự động hiển thị một Banner cảnh báo nổi bật ở đầu trang với tông màu vàng cam, nêu đích danh mã đơn có thời hạn SLA gấp nhất và nút điều hướng khẩn cấp sang màn hình duyệt đơn.

* **Why this priority**: Đảm bảo quy tắc SLA 24h (BR-HOST-03), giúp Host không bỏ lỡ khách và tránh bị hủy đơn tự động do quá hạn.
* **Independent Test**: Khi tài khoản có ít nhất 1 đơn `Pending`, banner xuất hiện; khi không có đơn nào, banner tự động ẩn.
* **Acceptance Scenarios**:
  1. **Given** có ít nhất 1 đơn đặt phòng `Pending`, **When** Host xem Dashboard, **Then** hiển thị SLA Alert Banner nền vàng nhạt `#FFFBEB`, viền trái vàng cam `#F59E0B`, icon cảnh báo.
  2. **Given** có đơn chờ duyệt, **Then** banner hiển thị nội dung: `Bạn có [X] đơn chờ duyệt, trong đó 1 đơn (#[Mã đơn]) sẽ hết hạn sau [Y] giờ.` (vd: "Bạn có 2 đơn chờ duyệt, trong đó 1 đơn (#BK-9819) sẽ hết hạn sau 3 giờ.").
  3. **Given** banner hiển thị, **When** Host bấm vào liên kết `Chuyển tới Duyệt đơn →`, **Then** điều hướng trực tiếp sang màn hình Duyệt đơn ([SMART-103] Booking Approval).
  4. **Given** không có đơn `Pending` nào (0 đơn), **When** Host tải Dashboard, **Then** SLA Alert Banner tự động ẩn hoàn toàn để tối ưu không gian hiển thị.

---

### User Story 3 - Hàng 4 Thẻ KPI Hiệu Suất Kinh Doanh (Priority: P1)
4 Thẻ KPI lớn cung cấp câu trả lời tức thì cho câu hỏi "Tình hình kinh doanh đang tốt hay xấu?":

* **Why this priority**: Giúp Host nắm bắt 4 chỉ số cốt lõi: Doanh thu, Đơn mới, Tỷ lệ lấp đầy, và Đánh giá trung bình.
* **Independent Test**: Kiểm tra giá trị của 4 thẻ KPI tính toán theo mốc thời gian đã chọn:
  1. **Card 1: Doanh thu**
     - Giá trị lớn: `[X] M VND` (vd: `45.2 M VND`).
     - Sub-badge: `[N] đơn hoàn thành & đã xác nhận` (vd: `14 đơn hoàn thành & đã xác nhận`).
     - Quy tắc: Tổng `totalPrice` của các đơn `Confirmed` và `Completed` có ngày check-in trong kỳ.
  2. **Card 2: Đơn đặt mới**
     - Giá trị lớn: `[N] đơn` (vd: `18 đơn`).
     - Sub-badge: `Tỷ lệ chốt đơn tự động [X]%` (vd: `Tỷ lệ chốt đơn tự động 82%`).
     - Quy tắc: Tổng số đơn booking phát sinh mới trong khoảng thời gian đã chọn.
  3. **Card 3: Tỷ lệ lấp đầy**
     - Giá trị lớn: `[X]%` (vd: `68%`).
     - Quy tắc: Số đêm phòng đã bán (`Booked`) chia cho (Số phòng hoạt động x Số ngày trong kỳ) * 100%.
  4. **Card 4: Điểm đánh giá TB**
     - Giá trị lớn: `[X.X] ★` (vd: `4.7 ★`).
     - Quy tắc: Trung bình cộng số sao từ các đánh giá thực tế từ khách hàng (thang điểm 5.0). Hiển thị `--` nếu chưa có đánh giá nào.

---

### User Story 4 - Biểu Đồ Doanh Thu & Xu Hướng Đặt Phòng Tương Tác (Priority: P1)
Biểu đồ vùng (Area Chart) trực quan hóa doanh thu và số lượng đơn theo từng ngày trong kỳ, hỗ trợ chuyển đổi giữa chế độ tiền tệ (VNĐ) và số lượng đơn, lọc theo từng phòng hoặc xem gộp tất cả.

* **Why this priority**: Cung cấp góc nhìn xu hướng chi tiết và biến động kinh doanh theo ngày.
* **Independent Test**: Chuyển đổi giữa 2 tab "Doanh thu (VNĐ)" và "Số đơn", lọc theo phòng, hover/touch vào các điểm nút đồ thị để xem tooltip chi tiết.
* **Acceptance Scenarios**:
  1. **Given** khối biểu đồ hiển thị, **When** quan sát header, **Then** có tiêu đề "Biểu đồ doanh thu & xu hướng đặt phòng", subtext "Doanh thu theo ngày trong [Khoảng thời gian đã chọn]", Segmented button toggle giữa `Doanh thu (VNĐ)` và `Số đơn`, và Dropdown lọc theo phòng (`Tất cả 3 phòng` hoặc phòng cụ thể).
  2. **Given** chế độ `Doanh thu (VNĐ)` đang chọn, **When** hiển thị trục Y, **Then** các mốc rút gọn dạng triệu đồng (0tr, 2tr, 4tr, 6tr, 8tr). Đường biểu diễn có gradient fill màu xanh mềm mại.
  3. **Given** Host bấm chuyển sang `Số đơn`, **When** đồ thị cập nhật, **Then** trục Y chuyển sang hiển thị số đơn (0, 1, 2, 3, 4, 5...) và đường xu hướng vẽ theo số lượng đơn phát sinh trong ngày.
  4. **Given** Host chọn một phòng cụ thể trong dropdown `Lọc theo phòng`, **When** giá trị thay đổi, **Then** biểu đồ vẽ lại đường xu hướng của riêng phòng đó. Nếu không có dữ liệu, hiển thị thông báo `[DASH-EMPTY-DATA]`.
  5. **Given** người dùng chạm/hover vào một điểm trên đồ thị, **Then** xuất hiện Card Tooltip nổi màu tối:
     - Dòng 1: Ngày cụ thể (vd: `15/10/2026`).
     - Dòng 2: Tổng doanh thu (vd: `5.000.000 đ`).
     - Dòng 3: Số đơn & Tên phòng (vd: `2 đơn (Villa Mộng Mơ & Ocean View)`).
  6. **Given** chân biểu đồ (Chart Footer), **Then** hiển thị 2 chỉ số tóm tắt:
     - `🟢 Trung bình ngày: [X] đ` (vd: `1.506.000 đ`).
     - `🟣 Đỉnh doanh thu: [Y] đ (Ngày DD/MM)` (vd: `7.500.000 đ (Ngày 20/10)`).

---

### User Story 5 - Khối Lịch Nhận / Trả Phòng Theo Ngày (Priority: P2)
Cung cấp danh sách khách hàng sẽ đến nhận phòng (Check-in 14:00) hoặc trả phòng (Check-out 12:00) trong ngày Hôm nay hoặc Ngày mai.

* **Why this priority**: Hỗ trợ Host đón tiếp khách chu đáo, chuẩn bị phòng sạch sẽ và nắm bắt thông tin liên hệ.
* **Independent Test**: Chuyển đổi giữa 2 tab `Hôm nay ([N])` và `Ngày mai ([M])`, xem thông tin khách và badge trạng thái.
* **Acceptance Scenarios**:
  1. **Given** thẻ "Lịch Nhận / Trả phòng", **Then** có 2 tab chuyển đổi: `Hôm nay (4)` (active) và `Ngày mai (2)`.
  2. **Given** mỗi thẻ khách lưu trú trong danh sách, **Then** hiển thị:
     - Avatar tròn chữ cái viết tắt (vd: `HN`, `TĐ`, `MT`, `VT`).
     - Họ tên khách hàng (in đậm).
     - Tên phòng nghỉ.
     - Số điện thoại đã che 6 số cuối (vd: `0912.***.678`).
     - Huy hiệu trạng thái: `🟢 Check-in [Giờ]` hoặc `🔵 Check-out [Giờ]`.
     - Ghi chú đặc biệt nếu có (vd: *"Yêu cầu: Đón tại sân bay"*, *"Đã bàn giao chìa khóa"*, *"Phòng đã dọn sạch"*).

---

### User Story 6 - Khối Đánh Giá Mới Nhất & Điều Hướng (Priority: P2)
Trích xuất 3 bài đánh giá mới nhất được gửi từ ứng dụng Mobile của du khách đã hoàn thành kỳ nghỉ.

* **Why this priority**: Giúp Host nhanh chóng nắm bắt phản hồi khách hàng để kịp thời khen thưởng hoặc chấn chỉnh dịch vụ.
* **Independent Test**: Xem 3 đánh giá gần nhất, bấm vào bài đánh giá điều hướng sang màn hình Đánh giá & Phản hồi ([SMART-108]).
* **Acceptance Scenarios**:
  1. **Given** thẻ "Đánh giá mới nhất", **Then** hiển thị tiêu đề kèm Badge điểm TB `★ 4.7 / 5.0`.
  2. **Given** danh sách 3 đánh giá gần nhất, mỗi bài hiển thị:
     - Avatar tròn + Tên khách + Dãy 5 sao vàng.
     - Tên phòng + Ngày đăng (vd: `Villa Mộng Mơ • 13/10/2026`).
     - Trích dẫn nhận xét (rút gọn trong 2 dòng).
  3. **Given** Host bấm vào bài đánh giá hoặc bấm `Xem tất cả →`, **When** click, **Then** điều hướng sang màn hình [SMART-108] View Reviews & Feedbacks.

---

### User Story 7 - Bảo Mật Phân Quyền & Trạng Thái Host Mới (Priority: P1)
Đảm bảo an toàn dữ liệu và xử lý các tình huống biên.

* **Acceptance Scenarios**:
  1. **BR-HOST-01 (Bảo mật theo Host):** Toàn bộ số liệu Dashboard chỉ truy xuất phòng và giao dịch thuộc `ownerId` của Host hiện tại. Nếu truy cập ID cơ sở khác, từ chối với lỗi `AUTH-403`: *"Tài khoản của bạn không có quyền xem thông tin tổng quan của cơ sở lưu trú này."*
  2. **New Host (Tài khoản mới chưa có phòng/đơn):** 4 thẻ KPI hiển thị `0` hoặc `--`. Biểu đồ ẩn đường vẽ và hiển thị khung hướng dẫn `[DASH-NEW-HOST]`: *"Chưa có dữ liệu kinh doanh. Số liệu sẽ tự động hiển thị sau khi bạn đăng phòng và có đơn đặt phòng đầu tiên."*

---

## 3. Hệ Thống Thông Báo (Common Messages)

| Mã phản hồi (Code) | Loại | Nội dung thông báo hiển thị |
| :--- | :--- | :--- |
| `AUTH-403` | Error / Toast | Tài khoản của bạn không có quyền xem thông tin tổng quan của cơ sở lưu trú này. |
| `DASH-EXPORT-SUCCESS` | Success / Toast | Đang kết xuất báo cáo kinh doanh ra file Excel, quá trình tải xuống sẽ bắt đầu ngay. |
| `DASH-SLA-ALERT` | Caution / Banner | Cảnh báo: Có [X] đơn đặt phòng đang chờ duyệt, trong đó có đơn sắp hết hạn SLA 24h. |
| `DASH-EMPTY-DATA` | Info / State | Chưa có dữ liệu kinh doanh phát sinh trong khoảng thời gian được chọn. |
| `DASH-NEW-HOST` | Info / State | Chưa có dữ liệu kinh doanh. Số liệu sẽ tự động hiển thị sau khi bạn đăng phòng và có đơn đặt phòng đầu tiên. |

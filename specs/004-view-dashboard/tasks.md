# Tasks: View Dashboard (SMART-110)

**Input**: Design documents from `specs/004-view-dashboard/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/dashboard-api.yaml`, `quickstart.md`, Figma Node `394:1125`)  
**Branch**: `feature/SMART-110-view-dashboard`  
**Status**: Completed  

---

## Format: `[ID] [P?] [Story] Description`
* **[P]**: Có thể thực hiện song song (các file độc lập, không bị xung đột phụ thuộc).
* **[Story]**: Gắn với User Story tương ứng trong `spec.md` (`[US1]` .. `[US7]`).
* Mọi task đều chỉ định đường dẫn file cụ thể trong Monorepo (`server/` và `mobile-app/`).

---

## Phase 1: Setup & API Interceptors

- [x] **T001** `[P]` Khởi tạo các mã hằng số thông báo nghiệp vụ Dashboard (`AUTH-403`, `DASH-EXPORT-SUCCESS`, `DASH-SLA-ALERT`, `DASH-EMPTY-DATA`, `DASH-NEW-HOST`) và cấu hình interceptor tại `mobile-app/src/services/api.js`.

---

## Phase 2: Backend Controller, Routes & API Tests

- [x] **T002** Xây dựng controller `server/src/controllers/hostDashboardController.js` gồm:
  - `getHostDashboard`: Nhận `period` (TODAY, 7_DAYS, 30_DAYS, THIS_MONTH, LAST_MONTH) và `roomId` (ALL hoặc ID phòng cụ thể).
  - Tính toán dải ngày `[startDate, endDate]`.
  - Tính 4 thẻ KPI: Doanh thu (tổng tiền các đơn CONFIRMED/COMPLETED trong kỳ), Đơn mới, Tỷ lệ lấp đầy, Điểm đánh giá TB.
  - Tính toán dữ liệu Biểu đồ xu hướng: timeline theo ngày, số tiền và số đơn, chỉ số trung bình ngày `dailyAverage` và đỉnh doanh thu `peakRevenue`.
  - Cảnh báo SLA 24h: Tìm đơn PENDING có thời hạn gấp nhất, tính số giờ còn lại `urgentExpireHours`.
  - Danh sách đón/tiễn khách Hôm nay & Ngày mai: Phân loại CHECK_IN vs CHECK_OUT, che 6 số cuối SĐT (`0912.***.678`).
  - Danh sách 3 đánh giá mới nhất từ khách lưu trú.
  - `exportDashboardReport`: Trả về phản hồi thành công `[DASH-EXPORT-SUCCESS]`.
- [x] **T003** `[P]` Xây dựng router `server/src/routes/hostDashboardRoutes.js` khai báo `GET /` và `GET /export`, đồng thời đăng ký vào `server/server.js` tại route `/api/host/dashboard`.
- [x] **T004** Viết bộ kiểm thử tự động Backend API `server/tests/hostDashboard.test.js`:
  - Kiểm tra `GET /api/host/dashboard` trả về đúng cấu trúc DTO 200 kèm kpi, chart, slaAlert, schedule, recentReviews.
  - Kiểm tra chuyển đổi `period=7_DAYS` vs `period=30_DAYS` tính toán lại số liệu chính xác.
  - Kiểm tra `GET /api/host/dashboard/export` trả về mã `DASH-EXPORT-SUCCESS`.

---

## Phase 3: Mobile Redux Slice & Service Client

- [x] **T005** `[P]` Xây dựng service `mobile-app/src/services/hostDashboardService.js` chứa các hàm gọi API: `getHostDashboardApi` và `exportDashboardReportApi`.
- [x] **T006** `[P]` Xây dựng Redux Slice `mobile-app/src/store/slices/hostDashboardSlice.js` quản lý state (thời gian chọn, chế độ biểu đồ REVENUE/BOOKINGS, phòng chọn lọc, activeTab lịch đón/tiễn, dữ liệu kpis, chart, slaAlert, schedule, recentReviews, loading, toast) và đăng ký `hostDashboardReducer` vào `mobile-app/src/store/store.js`.

---

## Phase 4: UI Components (Chuẩn Figma Node 394:1125)

- [x] **T007** `[P]` `[US1]` Xây dựng component `mobile-app/src/components/dashboard/HostDashboardHeader.js`:
  - Lời chào: `Xin chào, [Tên Host] 👋` + `Đây là tình hình kinh doanh của bạn`.
  - Dropdown chọn khoảng thời gian (`30 ngày qua`, `Hôm nay`, `7 ngày qua`, `Tháng này`, `Tháng trước`).
  - Nút `Xuất báo cáo` (Primary Teal `#00685F`, icon excel/download), bắn thông báo `[DASH-EXPORT-SUCCESS]`.
- [x] **T008** `[P]` `[US2]` Xây dựng component `mobile-app/src/components/dashboard/HostSlaAlertBanner.js`:
  - Nền vàng nhạt `#FFFBEB`, viền trái `#F59E0B`, icon cảnh báo.
  - Text: `Bạn có [X] đơn chờ duyệt, trong đó 1 đơn (#[Mã đơn]) sẽ hết hạn sau [Y] giờ.`
  - Nút hành động: `Chuyển tới Duyệt đơn →` điều hướng sang màn hình Booking Approval.
  - Tự động ẩn hoàn toàn khi không có đơn PENDING.
- [x] **T009** `[P]` `[US3]` Xây dựng component `mobile-app/src/components/dashboard/HostDashboardKpiCards.js`:
  - 4 Thẻ KPI: Doanh thu (`45.2 M VND`), Đơn đặt mới (`18 đơn`), Tỷ lệ lấp đầy (`68%`), Điểm đánh giá TB (`4.7 ★`).
  - Thiết kế bo góc 16px, viền mềm mại, typography in đậm nổi bật theo Figma.
- [x] **T010** `[US4]` Xây dựng component `mobile-app/src/components/dashboard/HostRevenueTrendChart.js`:
  - Header: Tiêu đề "Biểu đồ doanh thu & xu hướng đặt phòng" + Toggle `Doanh thu (VNĐ)` vs `Số đơn` + Dropdown `Lọc theo phòng`.
  - Area Chart Canvas: Đường cong mềm mại kèm dải chuyển màu gradient mờ, trục X ngày cách nhật, trục Y rút gọn theo triệu đồng.
  - Interactive Tooltip: Card tooltip nổi màu tối khi người dùng chạm vào điểm đồ thị (`15/10/2026: 5.000.000 đ • 2 đơn (Villa Mộng Mơ & Ocean View)`).
  - Footer Summary: `🟢 Trung bình ngày: [X] đ` và `🟣 Đỉnh doanh thu: [Y] đ (Ngày DD/MM)`.
- [x] **T011** `[P]` `[US5]` Xây dựng component `mobile-app/src/components/dashboard/HostCheckInOutSchedule.js`:
  - Header: "Lịch Nhận / Trả phòng" + 2 tab `Hôm nay (4)` (active) & `Ngày mai (2)`.
  - Thẻ khách: Avatar tròn viết tắt, Tên khách, Tên phòng, SĐT che `0912.***.678`, Status badge (`🟢 Check-in 14:00`, `🔵 Check-out 12:00`), Ghi chú đón sân bay / phòng đã dọn.
- [x] **T012** `[P]` `[US6]` Xây dựng component `mobile-app/src/components/dashboard/HostRecentReviews.js`:
  - Header: "Đánh giá mới nhất" + Badge điểm TB `★ 4.7 / 5.0` + Link "Xem tất cả →".
  - Danh sách 3 đánh giá gần nhất: Avatar tròn, Tên khách, Dãy 5 sao vàng, Tên phòng, Ngày đăng, Trích dẫn nhận xét 2 dòng.
  - Click vào bài đánh giá điều hướng sang [SMART-108].

---

## Phase 5: Screen Assembly & Navigation

- [x] **T013** Xây dựng màn hình `mobile-app/src/screens/HostDashboardScreen.js` tích hợp toàn bộ các components trên:
  - Tích hợp `HostTopNav` và `HostSidebar` với `activeId="overview"`.
  - Hỗ trợ responsive layout (Drawer trên mobile, sidebar cố định trên desktop).
  - Hỗ trợ pull-to-refresh và toast notification.
- [x] **T014** Cập nhật `mobile-app/src/components/calendar/HostSidebar.js` xử lý điều hướng mượt mà:
  - Bấm `Tổng quan` -> ở lại / chuyển `HostDashboardScreen`.
  - Bấm `Lịch phòng & Giá` -> chuyển `HostCalendarScreen`.
- [x] **T015** Đăng ký `HostDashboard` trong `mobile-app/src/navigation/AppNavigator.js`.

---

## Phase 6: Verification & End-to-End Tests

- [x] **T016** Viết bộ kiểm thử Mobile App `mobile-app/__tests__/HostDashboard.test.js` kiểm tra hiển thị 4 KPI, đổi mốc thời gian, đổi tab lịch đón/tiễn, chuyển toggle biểu đồ và xuất báo cáo.
- [x] **T017** Chạy toàn bộ test suites (`npm test` ở server và `npm run test:unit` ở mobile-app) đảm bảo không có lỗi tồn đọng.

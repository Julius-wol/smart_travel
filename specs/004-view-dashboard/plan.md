# Implementation Plan: View Dashboard (SMART-110)

**Branch**: `feature/SMART-110-view-dashboard` | **Date**: 2026-10-24 | **Spec**: [specs/004-view-dashboard/spec.md](spec.md)  
**Input**: Feature specification from `specs/004-view-dashboard/spec.md` (SMART-110, Parent Ticket SMART-107, Figma Node: `394:1125` Main Host Dashboard Screen)

---

## 1. Summary

Triển khai hoàn chỉnh tính năng **Host View Dashboard (Màn hình Tổng quan kinh doanh dành cho Host)**:
* **Backend (Node.js / Express / MongoDB)**:
  * Xây dựng controller `hostDashboardController.js`:
    * `GET /api/host/dashboard`: Tổng hợp dữ liệu theo khoảng thời gian (`period`: TODAY, 7_DAYS, 30_DAYS, THIS_MONTH, LAST_MONTH) và lọc theo phòng (`roomId`: ALL | specific). Tính toán 4 thẻ KPI, dữ liệu biểu đồ xu hướng (Area Chart timeline), SLA alert banner đơn chờ, danh sách đón/tiễn khách Hôm nay/Ngày mai, và Top 3 đánh giá mới nhất.
    * `GET /api/host/dashboard/export`: Giả lập kết xuất báo cáo kinh doanh ra file Excel / PDF (`DASH-EXPORT-SUCCESS`).
  * Xây dựng route `hostDashboardRoutes.js` và đăng ký vào `server/server.js`.
* **Mobile App (React Native / Expo)**:
  * Xây dựng Redux slice `hostDashboardSlice.js` và API service `hostDashboardService.js`.
  * Xây dựng các components chuyên trách:
    * `HostDashboardHeader`: Lời chào Host, Dropdown khoảng thời gian, Nút Xuất báo cáo.
    * `HostSlaAlertBanner`: Banner cảnh báo đơn chờ duyệt khẩn cấp (SLA 24h, mã đơn #BK-9819).
    * `HostDashboardKpiCards`: 4 thẻ KPI lớn (Doanh thu, Đơn đặt mới, Tỷ lệ lấp đầy, Điểm đánh giá TB).
    * `HostRevenueTrendChart`: Biểu đồ vùng tương tác mượt mà, toggle `Doanh thu (VNĐ)` / `Số đơn`, dropdown lọc phòng, card tooltip nổi khi chạm và chỉ số tóm tắt chân trang.
    * `HostCheckInOutSchedule`: Khối Lịch Nhận / Trả phòng theo 2 tab `Hôm nay (4)` và `Ngày mai (2)`, thông tin khách, SĐT che `0912.***.678`, status badge.
    * `HostRecentReviews`: Khối Đánh giá mới nhất (Top 3 đánh giá, sao, tên phòng, ngày đăng, trích dẫn).
  * Xây dựng màn hình `HostDashboardScreen.js` tích hợp `HostSidebar` (`activeId="overview"`) và `HostTopNav`.
  * Đăng ký `HostDashboardScreen` vào `AppNavigator.js`.
* **Kiểm thử tự động & E2E**:
  * Unit test cho Backend API (`server/tests/hostDashboard.test.js`).
  * Unit & Integration test cho Mobile App (`mobile-app/__tests__/HostDashboard.test.js`).

---

## 2. Technical Context

* **Language/Version**: JavaScript (Node.js >= 18.x / ES2022) cho Server; React Native 0.86 / React 19 / Expo 57 cho Mobile.
* **Primary Dependencies**:
  * *Server*: `express@5.2.1`, `mongoose@9.11.1`, `cors`, `dotenv`.
  * *Mobile*: `expo@57.0.27`, `@react-navigation/native-stack@7`, `@reduxjs/toolkit@2.13`, `react-redux@9.3`, `react-native-paper@5.15`, `axios@1.20`, `@expo/vector-icons@15`.
* **Storage**:
  * *Server*: MongoDB (Collections: `rooms`, `bookings`, `reviews`, `users`).
  * *Mobile*: Redux Store (`hostDashboardSlice`).
* **Performance Goals**:
  * API `GET /api/host/dashboard` phản hồi trong $< 60\text{ms}$.
  * Chuyển đổi giữa các mốc thời gian và chế độ biểu đồ tức thì 60 FPS.
* **Constraints**:
  * Bảo mật phân quyền: Chỉ truy xuất dữ liệu thuộc quyền quản lý của Host hiện tại (`ownerId`) (`BR-HOST-01`).
  * Nếu tài khoản Host cố tình truy cập vào ID cơ sở khác, trả về lỗi `AUTH-403`.

---

## 3. Constitution Check

*GATE: Kiểm tra tính tuân thủ Hiến pháp dự án (`.specify/memory/constitution.md`)*

| Quy chuẩn Hiến pháp | Trạng thái | Đánh giá & Giải pháp |
| :--- | :---: | :--- |
| **I. Spec-First** | PASSED | Đã có `spec.md`, `research.md`, `data-model.md`, `contracts/dashboard-api.yaml`, `quickstart.md`. |
| **II. Monorepo MVC & Separation** | PASSED | Backend: `routes/hostDashboardRoutes.js` -> `controllers/hostDashboardController.js`. Mobile: `screens/HostDashboardScreen.js` -> `components/dashboard/` -> `store/slices/hostDashboardSlice.js`. |
| **III. Standardized API Protocol** | PASSED | Mọi endpoint chuẩn hóa `{ success: boolean, code?: string, message: string, data?: object }`. |
| **IV. Security & Privacy** | PASSED | Bảo vệ token JWT, kiểm tra `ownerId` tránh truy cập trái phép (`AUTH-403`), che 6 số cuối SĐT khách hàng. |
| **V. Aesthetics & Figma Sync** | PASSED | Thiết kế đồng bộ 100% với Figma Node `394:1125`, Deep Teal `#00685F`, Amber `#F59E0B`, Indigo `#4648D4`, font Plus Jakarta Sans / system. |

---

## 4. Project Structure & Impacted Files

```text
smart_travel/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── hostDashboardController.js      # [NEW] Controller tổng hợp số liệu Dashboard
│   │   └── routes/
│   │       └── hostDashboardRoutes.js          # [NEW] Route /api/host/dashboard
│   ├── tests/
│   │   └── hostDashboard.test.js               # [NEW] API test cho Dashboard
│   └── server.js                               # [MODIFIED] Đăng ký hostDashboardRoutes
├── mobile-app/
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── HostDashboardHeader.js      # [NEW] Header chào mừng, bộ lọc thời gian & xuất báo cáo
│   │   │       ├── HostSlaAlertBanner.js       # [NEW] Banner cảnh báo đơn chờ duyệt khẩn cấp (SLA 24h)
│   │   │       ├── HostDashboardKpiCards.js    # [NEW] 4 thẻ KPI doanh thu, đơn mới, lấp đầy, rating
│   │   │       ├── HostRevenueTrendChart.js    # [NEW] Biểu đồ vùng xu hướng tương tác
│   │   │       ├── HostCheckInOutSchedule.js   # [NEW] Lịch đón/tiễn khách Hôm nay & Ngày mai
│   │   │       └── HostRecentReviews.js        # [NEW] Khối 3 đánh giá mới nhất
│   │   ├── screens/
│   │   │   └── HostDashboardScreen.js          # [NEW] Màn hình chính Host View Dashboard
│   │   ├── services/
│   │   │   └── hostDashboardService.js         # [NEW] API Service gọi Backend
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   └── hostDashboardSlice.js       # [NEW] Redux Slice quản lý state Dashboard
│   │   │   └── store.js                        # [MODIFIED] Đăng ký hostDashboard reducer
│   │   └── navigation/
│   │       └── AppNavigator.js                 # [MODIFIED] Đăng ký HostDashboard screen
│   └── __tests__/
│       └── HostDashboard.test.js               # [NEW] Unit test cho Dashboard UI
└── specs/
    └── 004-view-dashboard/                     # [NEW] Specs artifacts
```

# 📘 TÀI LIỆU KỸ THUẬT & API SPECIFICATION
## [SMART-103] Duyệt đơn đặt phòng (Booking Approval Dashboard)
> **Dành cho:** Frontend Developer, Mobile App Developer, Backend Developer, QA / Tester  
> **Phiên bản:** v1.0.0  
> **Cập nhật lần cuối:** 28/10/2026  
> **Môi trường Backend:** Node.js / Express / MongoDB Atlas  
> **Màn hình thiết kế (Figma):** `SCR-HOST-03` Booking Dashboard, `MODAL-APPROVE`, `MODAL-REJECT`  
> **Base URL:** `http://localhost:5000` (hoặc URL Server Deploy)

---

## 📑 MỤC LỤC
1. [Tổng quan chức năng & Đối chiếu Figma UI](#1-tổng-quan-chức-năng--đối-chiếu-figma-ui)
2. [Quy tắc nghiệp vụ & Cơ chế cốt lõi (Business Rules)](#2-quy-tắc-nghiệp-vụ--cơ-chế-cốt-lõi-business-rules)
3. [Bảng tổng hợp API Endpoints](#3-bảng-tổng-hợp-api-endpoints)
4. [Chi tiết từng API & Cấu trúc Response](#4-chi-tiết-từng-api--cấu-trúc-response)
   - [API 01: Lấy danh sách đơn đặt phòng & Bộ lọc (SCR-HOST-03)](#api-01-lấy-danh-sách-đơn-đặt-phòng--bộ-lọc-scr-host-03)
   - [API 02: Phê duyệt đơn đặt phòng an toàn (MODAL-APPROVE)](#api-02-phê-duyệt-đơn-đặt-phòng-an-toàn-modal-approve)
   - [API 03: Từ chối đơn đặt phòng & Kích hoạt hoàn tiền (MODAL-REJECT)](#api-03-từ-chối-đơn-đặt-phòng--kích-hoạt-hoàn-tiền-modal-reject)
   - [API 04: Xác thực nhanh Host khi hết phiên (Quick Auth)](#api-04-xác-thực-nhanh-host-khi-hết-phiên-quick-auth)
5. [Từ điển mã phản hồi (Response Code Dictionary)](#5-từ-điển-mã-phản-hồi-response-code-dictionary)
6. [Báo cáo kết quả kiểm thử trên Database thực tế (Test Report)](#6-báo-cáo-kết-quả-kiểm-thử-trên-database-thực-tế-test-report)

---

## 1. TỔNG QUAN CHỨC NĂNG & ĐỐI CHIẾU FIGMA UI

Tính năng **`[SMART-103] Duyệt đơn đặt phòng (Booking Approval)`** hỗ trợ Đối tác Chủ phòng (Host) tiếp nhận, xét duyệt hoặc từ chối các yêu cầu đặt phòng từ khách du lịch trên nền tảng SmartTravel với các thành phần giao diện chuẩn Figma:

### I. Booking Dashboard (`SCR-HOST-03`)
* **1.1 Breadcrumb:** `» Đơn đặt phòng` - Hiển thị vị trí trang hiện tại; khi click không reload trang nếu đang ở trang gốc.
* **1.2 Tiêu đề & Mô tả:** H1 *"Duyệt đơn đặt phòng"*, Subtext *"Tiếp nhận và xét duyệt đơn từ khách du lịch trên ứng dụng SmartTravel"*.
* **1.3 - 1.5 Navigation Tabs với Badge số lượng:**
  * **Tab "Chờ duyệt":** Active (Pill xanh đậm), hiển thị badge `Chờ duyệt (X)`. Lọc các đơn `PENDING` cần Host xử lý trong chu kỳ SLA 24h.
  * **Tab "Đã xác nhận":** Inactive (Pill viền nhạt), badge `Đã xác nhận (Y)`. Lọc các đơn `CONFIRMED`.
  * **Tab "Lịch sử & Từ chối":** Inactive (Pill viền nhạt), badge `Lịch sử & Từ chối (Z)`. Lọc các đơn `COMPLETED`, `REJECTED`, `EXPIRED`, `CANCELLED`.
* **1.6 - 1.8 Bộ lọc & Tìm kiếm:**
  * **Ô tìm kiếm:** Hỗ trợ tìm kiếm theo Mã đơn (`#BK...`), Họ tên khách hàng, Số điện thoại. Kích hoạt tìm kiếm khi gõ phím `Enter`. Nếu không tìm thấy, hiển thị trạng thái `[EMPTY-BOOK-001]`.
  * **Dropdown "Thời gian nhận":** Lọc theo mốc Check-in (`Tất cả`, `Hôm nay`, `Ngày mai`, `Tuần này`, `Tháng này`).
  * **Dropdown "Phòng nghỉ":** Lọc theo từng phòng lưu trú thuộc sở hữu của Host.

### II. Booking Card Component
* **2.1 - 2.2 Header:** `#Mã đơn • Tên phòng nghỉ` kèm **Huy hiệu đếm ngược SLA 24h**:
  * Còn `>= 6h`: Badge xanh dương `⏱ Còn Xh để duyệt`.
  * Còn `< 6h`: Badge đỏ cảnh báo nhấp nháy `! Khẩn cấp: Còn Xh để duyệt`.
  * Quá hạn: Tự động chuyển sang `[BOOK-SLA-EXPIRED]`.
* **2.3 - 2.5 Cột trái (Thông tin đoàn):**
  * Avatar tròn chứa Initials 2 chữ cái đầu của khách du lịch.
  * Họ tên in đậm, SĐT, Email liên hệ.
  * Khung viền Lịch nhận (14:00) & Trả phòng (12:00) kèm badge Thời lượng `X đêm`.
  * Tag badges xám: Số lượng người lớn/trẻ em, số phòng ngủ, tiện ích phòng nổi bật.
* **2.6 - 2.8 Cột phải (Tài chính & Yêu cầu):**
  * TỔNG TIỀN THANH TOÁN (VND Bold cỡ lớn).
  * Huy hiệu xanh lá xác nhận kênh thanh toán: `✓ Đã thanh toán qua SmartTravel Pay` / `Apple Pay` / `VietQR` / `Thẻ tín dụng`.
  * Khung màu tím nhạt bo góc **"YÊU CẦU ĐẶC BIỆT TỪ KHÁCH HÀNG"** nổi bật với icon tin nhắn và trích dẫn lời nhắn của khách.
* **2.9 - 2.11 Footer:**
  * Chính sách hủy phòng: `• Chính sách hủy: Hoàn tiền 100% trước 48h nhận phòng`.
  * Nút `✕ Từ chối` (Outline Danger) mở `MODAL-REJECT`.
  * Nút `✓ Phê duyệt đơn đặt` (Primary Solid) mở `MODAL-APPROVE`.

### III. Hộp thoại Phê duyệt (`MODAL-APPROVE`)
* **3.1 - 3.2 Header:** Icon dấu tích xanh `✓` trong vòng tròn + Badge `🛡 Phê duyệt An toàn`, Tiêu đề `Xác nhận duyệt đơn #[Mã đơn]`.
* **3.3 Cảnh báo khóa lịch:** Thông báo tác động `Lịch phòng [Tên phòng] sẽ tự động khóa từ ngày [Check-in] đến [Check-out]`.
* **3.4 Summary Card:** Thẻ màu xám tóm tắt Tên khách, số đêm, số lượng khách, Doanh thu thực nhận sau duyệt (`... VNĐ`).
* **3.5 Footer Notice:** Text `• Tự động gửi email & thông báo tức thời cho du khách`.
* **3.6 - 3.7 Nút thao tác:** Nút `Hủy` và Nút `✓ Xác nhận duyệt`.

### IV. Hộp thoại Từ chối (`MODAL-REJECT`)
* **4.1 Header:** Icon cảnh báo đỏ ⚠️ + Tiêu đề `Từ chối yêu cầu đặt phòng` kèm `Đơn #[Mã đơn] • Khách hàng [Tên khách]`.
* **4.2 Banner hoàn tiền:** Box cảnh báo màu vàng/amber: `Số tiền [X] VNĐ sẽ được hệ thống hoàn lại 100% về ví/tài khoản khách du lịch trong vòng 30 giây.`
* **4.3 Dropdown "LÝ DO TỪ CHỐI *":** Bắt buộc chọn 1 trong 5 lý do chuẩn hóa hệ thống. Nếu bỏ trống bấm xác nhận sẽ báo cảnh báo `[BOOK-REQ-REASON]`.
* **4.4 Lời nhắn gửi khách hàng:** Textarea tối đa 200 ký tự với bộ đếm góc trên bên phải `x / 200 ký tự`.
* **4.5 - 4.6 Nút thao tác:** Nút `Đóng` và Nút `✕ Xác nhận từ chối` (Danger Solid Red).

---

## 2. QUY TẮC NGHIỆP VỤ & CƠ CHẾ CỐT LÕI (BUSINESS RULES)

1. **Bảo mật và phân vùng dữ liệu theo Host (`BR-HOST-01`):**
   * Host chỉ được xem và duyệt/từ chối các đơn đặt phòng thuộc về các phòng do chính mình sở hữu (`ownerId === req.user._id`).
   * Nếu Host cố tình truy cập hoặc gửi payload duyệt đơn của Host khác, hệ thống lập tức chặn và trả về lỗi bảo mật `[AUTH-403]`.
2. **Quy chuẩn thời gian phản hồi SLA 24h (`BR-HOST-03`):**
   * Đếm ngược 24h kích hoạt ngay khi khách thanh toán giữ chỗ thành công trên Mobile App (`createdAt`).
   * Còn `>= 6h`: Badge xanh dương `⏱ Còn Xh để duyệt`.
   * Còn `< 6h`: Badge đỏ nhấp nháy `! Khẩn cấp: Còn Xh để duyệt`.
   * Sau 24h không phản hồi: Trạng thái tự động đổi thành `EXPIRED` (`[BOOK-SLA-EXPIRED]`), hệ thống kích hoạt tự động hoàn tiền 100% cho du khách và giải phóng lịch phòng.
3. **Cơ chế Phê duyệt an toàn (`BR-HOST-04`):**
   * Kiểm tra xung đột lịch: Nếu có đơn khác đã duyệt (`CONFIRMED`) trùng ngày Check-in/Check-out, hệ thống chặn phê duyệt và báo `[BOOK-CAL-CONFLICT]`.
   * Kiểm tra hủy phòng sớm: Nếu khách đã bấm hủy đơn trên Mobile trước khi Host duyệt, hệ thống từ chối và báo `[BOOK-GUEST-CANCELLED]`.
   * Khi phê duyệt thành công: Đơn chuyển sang `CONFIRMED`, tự động tạo/cập nhật bản ghi trên Ma trận lịch phòng (`RoomAvailability`) với trạng thái `BOOKED` cho toàn bộ các ngày từ `checkIn` đến `checkOut`.
4. **Cơ chế Từ chối và Hoàn tiền tự động:**
   * Khi Host từ chối đơn: Bắt buộc cung cấp lý do (`[BOOK-REQ-REASON]`).
   * Đơn chuyển sang `REJECTED`, xóa bỏ các ngày đã khóa trong `RoomAvailability` để mở bán lại cho khách khác, và kích hoạt cổng thanh toán hoàn tiền 100% cho du khách (`[BOOK-REJECT-SUCCESS]`).

---

## 3. BẢNG TỔNG HỢP API ENDPOINTS

| STT | Phương thức | Endpoint URL | Mục đích nghiệp vụ | Mã phản hồi chính |
| :---: | :---: | :--- | :--- | :--- |
| **01** | `GET` | `/host/bookings` | Tải danh sách đơn, bộ đếm tab, tìm kiếm, lọc theo ngày/phòng | `EMPTY-BOOK-001` |
| **02** | `POST` | `/host/bookings/:id/status` | Phê duyệt đơn (`CONFIRMED`) & Tự động khóa lịch phòng | `BOOK-APPROVE-SUCCESS`, `BOOK-CAL-CONFLICT`, `BOOK-GUEST-CANCELLED`, `BOOK-SLA-EXPIRED`, `AUTH-403` |
| **03** | `POST` | `/host/bookings/:id/status` | Từ chối đơn (`REJECTED`) & Tự động giải phóng lịch, hoàn tiền | `BOOK-REJECT-SUCCESS`, `BOOK-REQ-REASON`, `BOOK-SLA-EXPIRED`, `AUTH-403` |
| **04** | `POST` | `/host/api/quick-auth` | Xác thực đăng nhập Host lấy Session Token | `AUTH-401-EXPIRED` |

---

## 4. CHI TIẾT TỪNG API & CẤU TRÚC RESPONSE

### API 01: Lấy danh sách đơn đặt phòng & Bộ lọc (SCR-HOST-03)
* **Method & URL:** `GET /host/bookings`
* **Headers:** `Cookie: hostToken=<token>`
* **Query Parameters (Tùy chọn):**
  * `tab` *(string)*: `pending` (mặc định), `confirmed`, `history`.
  * `search` *(string)*: Tìm theo mã đơn `#BK...`, họ tên khách hoặc số điện thoại. Nhấn `Enter` để gửi yêu cầu.
  * `checkInTime` *(string)*: `all` (Tất cả), `today` (Hôm nay), `tomorrow` (Ngày mai), `this_week` (Tuần này), `this_month` (Tháng này).
  * `roomId` *(string ObjectId)*: Lọc theo cơ sở lưu trú cụ thể thuộc Host.

#### 📥 Response Data Model:
```json
{
  "title": "Duyệt đơn đặt phòng - Smart Travel Host",
  "currentTab": "pending",
  "counts": {
    "pending": 2,
    "confirmed": 14,
    "history": 36
  },
  "filters": {
    "search": "",
    "checkInTime": "all",
    "roomId": ""
  },
  "bookings": [
    {
      "_id": "6adf16d94430d1c8c1484c9d",
      "bookingCode": "BK-9821",
      "roomId": {
        "_id": "6adf16d94430d1c8c1484c95",
        "title": "Villa Mộng Mơ View Hồ & Rừng Thông",
        "bedrooms": 3,
        "amenities": ["Hồ bơi riêng", "BBQ ngoài trời"]
      },
      "fullName": "Nguyễn Văn An",
      "phoneNumber": "0932.849.678",
      "email": "an.nguyen@gmail.com",
      "checkIn": "2026-11-20T14:00:00.000Z",
      "checkOut": "2026-11-23T12:00:00.000Z",
      "nights": 3,
      "guests": 2,
      "totalPrice": 7500000,
      "paymentMethod": "Smart Travel Pay",
      "paymentStatus": "PAID",
      "status": "PENDING",
      "specialRequests": "Xin vui lòng hỗ trợ nhận phòng sớm lúc 13h00 nếu phòng đã dọn xong. Cảm ơn chủ nhà!",
      "createdAt": "2026-10-28T09:00:00.000Z"
    }
  ]
}
```

---

### API 02: Phê duyệt đơn đặt phòng an toàn (MODAL-APPROVE)
* **Method & URL:** `POST /host/bookings/:id/status`
* **Headers:** `Content-Type: application/json`, `Cookie: hostToken=<token>`
* **Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

#### 🟢 Phản hồi thành công (HTTP 200 - BOOK-APPROVE-SUCCESS):
```json
{
  "success": true,
  "code": "BOOK-APPROVE-SUCCESS",
  "message": "Đã phê duyệt đơn đặt phòng #BK-9821 thành công. Lịch phòng đã được tự động khóa.",
  "booking": {
    "_id": "6adf16d94430d1c8c1484c9d",
    "bookingCode": "BK-9821",
    "status": "CONFIRMED"
  }
}
```

#### 🔴 Phản hồi lỗi Trùng lịch (HTTP 400 - BOOK-CAL-CONFLICT):
```json
{
  "success": false,
  "code": "BOOK-CAL-CONFLICT",
  "message": "Không thể duyệt đơn! Khoảng thời gian này đã bị trùng lịch với một đơn đặt phòng khác đã xác nhận."
}
```

#### 🔴 Phản hồi lỗi Khách đã hủy trước (HTTP 400 - BOOK-GUEST-CANCELLED):
```json
{
  "success": false,
  "code": "BOOK-GUEST-CANCELLED",
  "message": "Du khách đã hủy yêu cầu đặt phòng này trước đó. Thao tác xét duyệt không còn khả dụng."
}
```

#### 🔴 Phản hồi lỗi Quá hạn 24h SLA (HTTP 400 - BOOK-SLA-EXPIRED):
```json
{
  "success": false,
  "code": "BOOK-SLA-EXPIRED",
  "message": "Đơn đặt phòng #BK-9821 đã quá hạn 24h xét duyệt và được hệ thống tự động hủy hoàn tiền."
}
```

#### 🔴 Phản hồi lỗi Phân quyền (HTTP 403 - AUTH-403):
```json
{
  "code": "AUTH-403",
  "message": "Tài khoản của bạn không có quyền thao tác trên đơn đặt phòng này."
}
```

---

### API 03: Từ chối đơn đặt phòng & Kích hoạt hoàn tiền (MODAL-REJECT)
* **Method & URL:** `POST /host/bookings/:id/status`
* **Headers:** `Content-Type: application/json`, `Cookie: hostToken=<token>`
* **Request Body:**
```json
{
  "status": "REJECTED",
  "rejectReason": "Phòng bận đột xuất / Trùng lịch bên ngoài",
  "rejectionNote": "Rất xin lỗi bạn vì thời gian này cơ sở lưu trú đang chuẩn bị sửa chữa một số hạng mục nên không thể tiếp đón trọn vẹn."
}
```

#### 🟢 Phản hồi từ chối thành công (HTTP 200 - BOOK-REJECT-SUCCESS):
```json
{
  "success": true,
  "code": "BOOK-REJECT-SUCCESS",
  "message": "Đã từ chối đơn đặt phòng #BK-9821. Hệ thống đã kích hoạt hoàn tiền 100% cho du khách.",
  "booking": {
    "_id": "6adf16d94430d1c8c1484c9d",
    "bookingCode": "BK-9821",
    "status": "REJECTED",
    "rejectReason": "Phòng bận đột xuất / Trùng lịch bên ngoài",
    "rejectionNote": "Rất xin lỗi bạn vì thời gian này cơ sở lưu trú đang chuẩn bị sửa chữa một số hạng mục..."
  }
}
```

#### 🟡 Phản hồi lỗi thiếu lý do từ chối (HTTP 400 - BOOK-REQ-REASON):
```json
{
  "success": false,
  "code": "BOOK-REQ-REASON",
  "message": "Vui lòng chọn lý do từ chối yêu cầu đặt phòng trước khi tiếp tục."
}
```

---

### API 04: Xác thực nhanh Host khi hết phiên (Quick Auth)
* **Method & URL:** `POST /host/api/quick-auth`
* **Request Body:**
```json
{
  "email": "host@smarttravel.com",
  "password": "your_password"
}
```
* **Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Xác thực thành công!"
}
```
* **Set-Cookie Header:** `hostToken=<jwt_token>; Path=/; HttpOnly; Max-Age=604800`

---

## 5. TỪ ĐIỂN MÃ PHẢN HỒI (RESPONSE CODE DICTIONARY)

| Mã phản hồi (Code) | Loại (Type) | Nội dung thông báo hiển thị | Ngữ cảnh & Điều kiện kích hoạt |
| :--- | :---: | :--- | :--- |
| **`AUTH-403`** | Error / Toast | *Tài khoản của bạn không có quyền thao tác trên đơn đặt phòng này.* | Host cố tình truy cập hoặc gửi payload duyệt/từ chối đơn của phòng thuộc Host khác. |
| **`BOOK-APPROVE-SUCCESS`** | Success / Toast | *Đã phê duyệt đơn đặt phòng #[Mã đơn] thành công. Lịch phòng đã được tự động khóa.* | Host bấm xác nhận duyệt đơn đặt phòng thành công trên `MODAL-APPROVE`. |
| **`BOOK-REJECT-SUCCESS`** | Info / Toast | *Đã từ chối đơn đặt phòng #[Mã đơn]. Hệ thống đã kích hoạt hoàn tiền 100% cho du khách.* | Host bấm xác nhận từ chối đơn thành công trên `MODAL-REJECT`. |
| **`BOOK-REQ-REASON`** | Warning / Inline | *Vui lòng chọn lý do từ chối yêu cầu đặt phòng trước khi tiếp tục.* | Bấm xác nhận từ chối trên `MODAL-REJECT` nhưng chưa chọn lý do trong dropdown. |
| **`BOOK-CAL-CONFLICT`** | Error / Modal | *Không thể duyệt đơn! Khoảng thời gian này đã bị trùng lịch với một đơn đặt phòng khác đã xác nhận.* | Host duyệt đơn có khoảng Check-in/Check-out trùng với ngày đã được xác nhận trước đó. |
| **`BOOK-GUEST-CANCELLED`** | Warning / Modal | *Du khách đã hủy yêu cầu đặt phòng này trước đó. Thao tác xét duyệt không còn khả dụng.* | Host bấm duyệt/từ chối nhưng đơn đã bị du khách bấm hủy trên Mobile App. |
| **`BOOK-SLA-EXPIRED`** | Caution / Toast | *Đơn đặt phòng #[Mã đơn] đã quá hạn 24h xét duyệt và được hệ thống tự động hủy hoàn tiền.* | Đơn chờ duyệt quá 24h mà Host không phản hồi theo quy định SLA (`BR-HOST-03`). |
| **`EMPTY-BOOK-001`** | Info / State | *Hiện tại không có yêu cầu đặt phòng nào cần xử lý trong mục này.* | Không tìm thấy đơn đặt phòng nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm. |

---

## 6. BÁO CÁO KẾT QUẢ KIỂM THỬ TRÊN DATABASE THỰC TẾ (TEST REPORT)

### Thông số môi trường kiểm thử:
* **Môi trường:** MongoDB Database thực tế (127.0.0.1:27017/smarttravel). **Nói không với Mock Data**.
* **Tài khoản Host đối soát:** `host@smarttravel.com` (Robin / Lê Hoàng Host) - ID: `6adf16d84430d1c8c1484c8f`.
* **Phòng đối soát kiểm thử:** `An Nhiên Eco Retreat Đà Nẵng` (ID: `6adf16d94430d1c8c1484c93`).
* **Tổng số kịch bản kiểm thử:** **28 / 28 Testcases**
* **Tỷ lệ đạt chuẩn:** **100.0% PASS**

### Chi tiết kết quả thực thi:

```
===============================================================
🚀 KẾT QUẢ KIỂM THỬ TÍCH HỢP TOÀN DIỆN: [SMART-103] BOOKING APPROVAL
    Môi trường: REAL DATABASE MONGODB (NO MOCK)
===============================================================

--- BƯỚC 1: XÁC THỰC VÀ THIẾT LẬP PHIÊN LÀM VIỆC (SESSION COOKIE) ---
  ✅ [PASS] Đăng nhập Host thành công nhận session cookie

--- BƯỚC 2: CHUẨN BỊ BẢN GHI ĐẶT PHÒNG THỰC TẾ TRONG DATABASE ---
  ✅ Đã tạo thành công 5 đơn đặt phòng mẫu với đầy đủ trạng thái.

--- BƯỚC 3: KIỂM THỬ CÁC TÍNH NĂNG VÀ NGHIỆP VỤ ---
  ✅ [PASS] TC01.1 - Truy cập màn hình /host/bookings trả về HTTP 200
  ✅ [PASS] TC01.2 - Giao diện có H1 "Duyệt đơn đặt phòng"
  ✅ [PASS] TC01.3 - Hiển thị 3 Tabs: Chờ duyệt, Đã xác nhận, Lịch sử & Từ chối
  ✅ [PASS] TC01.4 - Hiển thị mã đơn TEST-BK-PENDING-01 trong danh sách Chờ duyệt
  ✅ [PASS] TC01.5 - Bảo mật phân quyền: KHÔNG chứa mã đơn TEST-BK-OTHERHOST-05 của Host khác
  ✅ [PASS] TC02.1 - Tìm kiếm theo mã đơn trả về đúng đơn cần tìm
  ✅ [PASS] TC02.2 - Không tìm thấy kết quả hiển thị thông báo [EMPTY-BOOK-001]
  ✅ [PASS] TC03.1 - Phê duyệt trả về HTTP 200
  ✅ [PASS] TC03.2 - Response trả về mã [BOOK-APPROVE-SUCCESS]
  ✅ [PASS] TC03.3 - Trạng thái đơn trong Database chuyển thành CONFIRMED
  ✅ [PASS] TC03.4 - Ma trận lịch phòng đã tự động khóa 3 đêm lưu trú
  ✅ [PASS] TC04.1 - Phê duyệt đơn trùng lịch trả về HTTP 400
  ✅ [PASS] TC04.2 - Response trả về mã lỗi [BOOK-CAL-CONFLICT]
  ✅ [PASS] TC04.3 - Thông báo giải thích rõ ràng về xung đột trùng lịch
  ✅ [PASS] TC05.1 - Duyệt đơn đã bị khách hủy trả về HTTP 400
  ✅ [PASS] TC05.2 - Response trả về mã lỗi [BOOK-GUEST-CANCELLED]
  ✅ [PASS] TC06.1 - Thao tác đơn quá hạn 24h trả về HTTP 400
  ✅ [PASS] TC06.2 - Response trả về mã [BOOK-SLA-EXPIRED]
  ✅ [PASS] TC06.3 - Database đã tự động cập nhật trạng thái đơn thành EXPIRED
  ✅ [PASS] TC07.1 - Từ chối không có lý do trả về HTTP 400
  ✅ [PASS] TC07.2 - Response trả về mã cảnh báo [BOOK-REQ-REASON]
  ✅ [PASS] TC08.1 - Từ chối hợp lệ trả về HTTP 200
  ✅ [PASS] TC08.2 - Response trả về mã [BOOK-REJECT-SUCCESS]
  ✅ [PASS] TC08.3 - Trạng thái đơn trong Database chuyển thành REJECTED
  ✅ [PASS] TC08.4 - Lý do và lời nhắn từ chối được lưu chính xác vào DB
  ✅ [PASS] TC09.1 - Thao tác trên đơn của Host khác bị chặn HTTP 403
  ✅ [PASS] TC09.2 - Response trả về mã lỗi bảo mật [AUTH-403]

===============================================================
📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ:
   - Tổng số kiểm thử: 28
   - Thành công (PASS): 28
   - Thất bại (FAIL):    0
   - Tỷ lệ đạt:        100.0%
===============================================================
```

---
*Tài liệu được biên soạn đồng bộ với mã nguồn và thiết kế Figma chính thức của SmartTravel.*

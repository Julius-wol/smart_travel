# 📘 TÀI LIỆU KỸ THUẬT & API SPECIFICATION
## [SMART-99] Quản lý kho phòng (Manage Room Inventory)
> **Dành cho:** Frontend Developer, Backend Developer, QA / Tester  
> **Phiên bản:** v1.0.0  
> **Cập nhật lần cuối:** 28/10/2026  
> **Môi trường Backend:** Node.js / Express / MongoDB Atlas  
> **Base URL:** `http://localhost:5000` (hoặc URL Server Deploy)

---

## 📑 MỤC LỤC
1. [Tổng quan chức năng](#1-tổng-quan-chức-năng)
2. [Cơ chế xác thực & Phân quyền (Authentication)](#2-cơ-chế-xác-thực--phân-quyền)
3. [Bảng tổng hợp API Endpoints](#3-bảng-tổng-hợp-api-endpoints)
4. [Chi tiết từng API & Cấu trúc Response](#4-chi-tiết-từng-api--cấu-trúc-response)
   - [API 01: Danh mục phòng & KPI Dashboard](#api-01-danh-mục-phòng--kpi-dashboard-scr-host-01)
   - [API 02: Xuất danh sách phòng ra Excel](#api-02-xuất-danh-sách-phòng-ra-excel)
   - [API 03: Tải chi tiết phòng để chỉnh sửa](#api-03-tải-chi-tiết-phòng-để-chỉnh-sửa)
   - [API 04: Thêm mới phòng nghỉ](#api-04-thêm-mới-phòng-nghỉ)
   - [API 05: Cập nhật thông tin phòng](#api-05-cập-nhật-thông-tin-phòng)
   - [API 06: Bật/Tắt trạng thái hiển thị nhanh](#api-06-bậttắt-trạng-thái-hiển-thị-nhanh-toggle-status)
   - [API 07: Nhân bản phòng (Duplicate)](#api-07-nhân-bản-phòng-duplicate)
   - [API 08: Xóa phòng & Ràng buộc Booking](#api-08-xóa-phòng-delete-room)
   - [API 09: Tải lên album ảnh phòng](#api-09-tải-lên-album-ảnh-phòng-multi-image-upload)
   - [API 10: Xác thực nhanh Quick Auth](#api-10-xác-thực-nhanh-quick-auth)
5. [Từ điển mã phản hồi (Response Code Dictionary)](#5-từ-điển-mã-phản-hồi-response-code-dictionary)
6. [Tài khoản & Dữ liệu Test thật trên Database](#6-tài-khoản--dữ-liệu-test-thật-trên-database)

---

## 1. TỔNG QUAN CHỨC NĂNG

Tính năng **`[SMART-99] Quản lý kho phòng (Manage Room Inventory)`** bao gồm 2 phân hệ màn hình cốt lõi trên Cổng thông tin Đối tác Chủ phòng (Host Portal):
* **SCR-HOST-01 (Room Inventory Screen):** Quản lý toàn bộ cơ sở lưu trú của Host, tính toán KPI thời gian thực (Tổng số phòng, Đang bán, Tạm dừng, Đơn chờ duyệt 24h), tìm kiếm theo tên/mã phòng, lọc theo loại phòng/trạng thái/sắp xếp, chuyển đổi trạng thái nhanh, nhân bản và xóa phòng có kiểm tra ràng buộc đơn đặt phòng.
* **SCR-HOST-02 (Create / Update Room Screen):** Form thêm mới và cập nhật thông tin phòng với quy chuẩn validation chặt chẽ (tên không trùng, độ dài mô tả, ràng buộc giá), bộ chọn vị trí 34 tỉnh/thành cascading, bản đồ GPS Leaflet tương tác, gallery ảnh kéo thả (tối thiểu 3, tối đa 15 ảnh), tính toán điểm tối ưu hồ sơ Superhost theo thời gian thực và cơ chế Auto-save tự động khôi phục.

---

## 2. CƠ CHẾ XÁC THỰC & PHÂN QUYỀN

* **Phương thức xác thực:** Sử dụng JWT Cookie (`hostToken`) hoặc Header `Authorization: Bearer <token>`.
* **Phân quyền bắt buộc (Role Guard):** Tài khoản đăng nhập bắt buộc phải có `role: "HOST"`.
  * Nếu tài khoản là `USER` (Khách du lịch) cố đăng nhập vào Host Portal: Bị chặn với lỗi `not_host`.
  * Nếu JWT hết hạn khi đang nhập form: Kích hoạt modal Quick Auth `[AUTH-401-EXPIRED]` để đăng nhập lại mật khẩu mà **không làm mất dữ liệu vừa điền**.
* **Cô lập dữ liệu (BR-HOST-01):** Host chỉ xem và thao tác được các phòng có `ownerId` trùng với `_id` của chính mình. Mọi hành vi cố tình thay đổi `id` trên URL hoặc API đều bị chặn với mã `[AUTH-403]`.

---

## 3. BẢNG TỔNG HỢP API ENDPOINTS

| STT | Method | Endpoint URL | Mục đích nghiệp vụ | Mã phản hồi chính |
| :---: | :---: | :--- | :--- | :--- |
| **01** | `GET` | `/host/rooms` | Tải danh sách phòng, KPI metrics, lọc, tìm kiếm, phân trang | `EMPTY-001` |
| **02** | `GET` | `/host/export-excel` | Xuất báo cáo danh sách phòng ra file Excel `.xlsx` | `EXP-001` |
| **03** | `GET` | `/host/rooms/:id/edit` | Lấy dữ liệu chi tiết phòng (Prefill Form sửa) | `AUTH-403` |
| **04** | `POST` | `/host/rooms` | Tạo mới phòng (Lưu bản nháp hoặc Đăng bán) | `ROOM-SAVE-001`, `ROOM-DRAFT-001`, `ROOM-NAME-DUP`, `ROOM-REQ-001` |
| **05** | `PUT` | `/host/rooms/:id` | Cập nhật thông tin phòng đã có | `ROOM-SAVE-001`, `ROOM-DRAFT-001`, `AUTH-403` |
| **06** | `POST` | `/host/rooms/:id/status` | Bật/tắt trạng thái hiển thị (`Published` ⟷ `Archived`) | `ROOM-STA-001`, `ROOM-STA-002`, `ROOM-IMG-001` |
| **07** | `POST` | `/host/rooms/:id/duplicate` | Nhân bản phòng thành bản nháp (`Draft`) mới | `ROOM-DUP-001` |
| **08** | `DELETE`| `/host/rooms/:id` | Xóa phòng (Có đối soát đơn đặt phòng tương lai) | `ROOM-DEL-001`, `ROOM-DEL-002`, `CONFIRM-DEL-001` |
| **09** | `POST` | `/host/api/upload` | Tải lên album ảnh phòng (tối đa 15 file, max 5MB/file) | `ROOM-IMG-002`, `ROOM-IMG-NETERR` |
| **10** | `POST` | `/host/api/quick-auth` | Xác thực lại mật khẩu khi hết hạn Token | `AUTH-401-EXPIRED` |

---

## 4. CHI TIẾT TỪNG API & CẤU TRÚC RESPONSE

### API 01: Danh mục phòng & KPI Dashboard (SCR-HOST-01)
* **Method & URL:** `GET /host/rooms`
* **Headers:** `Cookie: hostToken=<token>`
* **Query Parameters (Tùy chọn):**
  * `search` *(string)*: Tìm theo tên phòng hoặc mã phòng (vd: `DN-01`).
  * `type` *(string)*: Lọc theo loại hình (`Bungalow`, `Biệt thự / Villa`, `Khách sạn`, `Căn hộ Studio`, `Homestay`).
  * `status` *(string)*: Lọc theo trạng thái (`Published`, `Archived`, `Draft`).
  * `sort` *(string)*: `Mới nhất` (mặc định) hoặc `Cũ nhất` (`oldest`).
  * `page` *(number)*: Số trang (mặc định = 1, 10 phòng/trang).

#### 📥 Response Data Model:
```json
{
  "kpis": {
    "totalRooms": 6,
    "publishedCount": 6,
    "archivedCount": 0,
    "pendingBookings24h": 1
  },
  "rooms": [
    {
      "_id": "6adf16d94430d1c8c1484c93",
      "roomCode": "DN-01",
      "title": "An Nhiên Eco Retreat Đà Nẵng",
      "status": "Published",
      "pricePerNight": 1250000,
      "weekendPrice": 1450000,
      "city": "Đà Nẵng",
      "district": "Sơn Trà",
      "address": "Đường Hoàng Sa, Bán đảo Sơn Trà",
      "specs": {
        "type": "Nhà nguyên căn",
        "capacity": "Tối đa 4 khách",
        "bedroom": "2 PN • 2 Giường King",
        "bathroom": "2 Phòng tắm riêng"
      },
      "images": [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"
      ],
      "pendingCount": 0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "limit": 10,
    "filteredTotal": 6,
    "startItem": 1,
    "endItem": 6
  }
}
```

---

### API 02: Xuất danh sách phòng ra Excel
* **Method & URL:** `GET /host/export-excel`
* **Headers:** `Cookie: hostToken=<token>`
* **Query Parameters:** Kế thừa bộ lọc đang chọn (`search`, `type`, `status`, `sort`).
* **Response Headers:**
  * `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  * `Content-Disposition: attachment; filename="SmartTravel_Phong_1730123456.xlsx"`
* **Mã Toast UI kích hoạt:** `[EXP-001]` *"Đang xuất dữ liệu danh mục phòng ra file Excel, quá trình tải sẽ bắt đầu ngay."*

---

### API 03: Tải chi tiết phòng để chỉnh sửa
* **Method & URL:** `GET /host/rooms/:id/edit`
* **Path Parameter:** `id` *(ObjectId)*: ID phòng trong DB.
* **Xử lý bảo mật (BR-HOST-01):** Nếu `ownerId` của phòng khác với Host hiện tại:
  * Trả về HTTP `302 Redirect` đến: `/host/rooms?error=AUTH-403`
  * Kích hoạt Toast đỏ **`[AUTH-403]`**: *"Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này."*

---

### API 04: Thêm mới phòng nghỉ
* **Method & URL:** `POST /host/rooms`
* **Headers:** `Content-Type: application/json`, `Cookie: hostToken=<token>`

#### 📤 Request Body:
```json
{
  "title": "Ocean View Luxury Villa Sơn Trà",
  "roomType": "Biệt thự / Villa",
  "maxGuests": 6,
  "bedrooms": 3,
  "beds": 3,
  "area": 120,
  "city": "Đà Nẵng",
  "district": "Sơn Trà (Bán đảo & Biển Mỹ Khê)",
  "address": "15 Hoàng Sa, Thọ Quang, Sơn Trà",
  "pricePerNight": 2500000,
  "weekendPrice": 3000000,
  "description": "Biệt thự view biển trực diện với hồ bơi vô cực riêng tư. Tiện nghi đẳng cấp 5 sao cho gia đình nghỉ dưỡng trọn vẹn.",
  "freeCancel48h": true,
  "amenities": "[{\"id\":\"1\",\"name\":\"Wifi 100Mbps\",\"icon\":\"wifi\"},{\"id\":\"2\",\"name\":\"Bể bơi riêng\",\"icon\":\"pool\"}]",
  "images": "[\"/uploads/rooms/img1.jpg\",\"/uploads/rooms/img2.jpg\",\"/uploads/rooms/img3.jpg\"]",
  "status": "Published",
  "lat": 16.0825,
  "lng": 108.2435
}
```

#### 📥 Response Success - Đăng bán (`status = "Published"`):
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "code": "ROOM-SAVE-001",
  "message": "Cập nhật thông tin phòng thành công!",
  "room": {
    "_id": "6ae2108269527c51fb9e46c3",
    "roomCode": "P-VL88AB",
    "title": "Ocean View Luxury Villa Sơn Trà",
    "status": "Published",
    "ownerId": "6adf16d84430d1c8c1484c8f"
  },
  "redirectUrl": "/host/rooms"
}
```

#### 📥 Response Success - Lưu bản nháp (`status = "Draft"`):
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "code": "ROOM-DRAFT-001",
  "message": "Đã lưu bản nháp thành công. Bạn có thể quay lại hoàn thiện bất kỳ lúc nào.",
  "room": {
    "_id": "6ae2108269527c51fb9e46c4",
    "status": "Draft"
  },
  "redirectUrl": "/host/rooms"
}
```

#### 📥 Response Errors (Validation):
* **Trùng tên phòng cùng Host:** `400 Bad Request`
```json
{
  "code": "ROOM-NAME-DUP",
  "message": "Tên phòng nghỉ đã tồn tại trong danh mục của bạn. Vui lòng đặt tên phân biệt."
}
```
* **Thiếu trường bắt buộc có dấu (*):** `400 Bad Request`
```json
{
  "code": "ROOM-REQ-001",
  "message": "Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (*)."
}
```
* **Album dưới 3 ảnh khi Publish:** `400 Bad Request`
```json
{
  "code": "ROOM-IMG-001",
  "message": "Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét."
}
```
* **Mô tả vượt quá 1.000 ký tự:** `400 Bad Request`
```json
{
  "code": "ROOM-CHAR-LIMIT",
  "message": "Mô tả phòng đã vượt quá giới hạn 1.000 ký tự cho phép."
}
```

---

### API 05: Cập nhật thông tin phòng
* **Method & URL:** `PUT /host/rooms/:id`
* **Path Parameter:** `id` *(ObjectId)*: ID phòng cần cập nhật.
* **Headers:** `Content-Type: application/json`, `Cookie: hostToken=<token>`
* **Request Body:** Tương tự API 04.
* **Response:**
  * `200 OK`: Trả về `ROOM-SAVE-001` hoặc `ROOM-DRAFT-001`.
  * `403 Forbidden`: Trả về `AUTH-403` nếu cố tình sửa phòng của Host khác.

---

### API 06: Bật/Tắt trạng thái hiển thị nhanh (Toggle Status)
* **Method & URL:** `POST /host/rooms/:id/status`
* **Headers:** `Content-Type: application/json`, `Cookie: hostToken=<token>`

#### 📤 Request Body:
```json
{
  "targetStatus": "Archived" // hoặc "Published"
}
```

#### 📥 Response - Chuyển sang Tạm dừng (Archived):
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "code": "ROOM-STA-002",
  "message": "Đã tạm dừng hiển thị phòng. Du khách sẽ không tìm thấy phòng này trên ứng dụng."
}
```

#### 📥 Response - Mở bán lại (Published):
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "code": "ROOM-STA-001",
  "message": "Đã kích hoạt mở bán phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng."
}
```

---

### API 07: Nhân bản phòng (Duplicate)
* **Method & URL:** `POST /host/rooms/:id/duplicate`
* **Headers:** `Cookie: hostToken=<token>`

#### 📥 Response Success:
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "code": "ROOM-DUP-001",
  "message": "Đã nhân bản phòng thành công thành bản nháp \"Bản sao của Hội An Riverside Heritage Retreat\".",
  "room": {
    "_id": "6ae2108169527c51fb9e46c2",
    "roomCode": "P-VLZ821",
    "title": "Bản sao của Hội An Riverside Heritage Retreat",
    "status": "Draft",
    "ownerId": "6adf16d84430d1c8c1484c8f"
  }
}
```

---

### API 08: Xóa phòng (Delete Room)
* **Method & URL:** `DELETE /host/rooms/:id`
* **Headers:** `Content-Type: application/json`, `Cookie: hostToken=<token>`

#### 📤 Request Body:
```json
{
  "confirmationText": "XÓA" // Bắt buộc đối với phòng không phải Draft
}
```

#### 📥 Response - Bị CHẶN XÓA do có đơn Booking tới:
* **HTTP Status:** `400 Bad Request`
```json
{
  "success": false,
  "code": "ROOM-DEL-001",
  "message": "Không thể xóa phòng! Phòng này đang có đơn đặt phòng trong thời gian tới. Phòng được tự động chuyển sang trạng thái Tạm dừng (Archived)."
}
```

#### 📥 Response - Xóa vĩnh viễn thành công:
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "code": "ROOM-DEL-002",
  "message": "Đã xóa phòng nghỉ vĩnh viễn khỏi danh sách của bạn."
}
```

---

### API 09: Tải lên album ảnh phòng (Multi-image Upload)
* **Method & URL:** `POST /host/api/upload`
* **Headers:** `Content-Type: multipart/form-data`, `Cookie: hostToken=<token>`
* **Body (Form-Data):** `images` (Mảng file, tối đa 15 file).

#### 📥 Response Success:
* **HTTP Status:** `200 OK`
```json
{
  "success": true,
  "urls": [
    "/uploads/rooms/images-1730123456789-102.jpg",
    "/uploads/rooms/images-1730123456790-204.png"
  ]
}
```

#### 📥 Response Error - Sai kích thước hoặc sai định dạng:
* **HTTP Status:** `400 Bad Request`
```json
{
  "code": "ROOM-IMG-002",
  "message": "Tệp tin vượt quá kích thước 5MB hoặc sai định dạng cho phép (chỉ nhận JPG, PNG, WEBP)."
}
```

---

### API 10: Xác thực nhanh (Quick Auth)
* **Method & URL:** `POST /host/api/quick-auth`
* **Mục đích:** Kích hoạt bởi Modal `[AUTH-401-EXPIRED]` khi Host đang nhập form mà Token hết hạn.

#### 📤 Request Body:
```json
{
  "email": "host@smarttravel.com",
  "password": "your_password"
}
```

#### 📥 Response Success:
* **HTTP Status:** `200 OK`
* **Headers:** `Set-Cookie: hostToken=<token_moi>; Path=/; HttpOnly; Max-Age=604800`
```json
{
  "success": true,
  "message": "Xác thực thành công!"
}
```

---

## 5. TỪ ĐIỂN MÃ PHẢN HỒI (RESPONSE CODE DICTIONARY)

| Mã phản hồi (Code) | Loại (Type) | Nội dung thông báo hiển thị | Ngữ cảnh kích hoạt |
| :--- | :---: | :--- | :--- |
| **`AUTH-403`** | Error / Toast | Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này. | Host cố truy cập/can thiệp ID phòng của Host khác qua URL/API. |
| **`AUTH-401-EXPIRED`** | Modal / Quick Auth | Phiên làm việc đã hết hạn. Vui lòng xác thực lại mật khẩu để tiếp tục lưu dữ liệu. | Token JWT hết hạn trong lúc Host đang thao tác trên form. |
| **`ROOM-REQ-001`** | Warning / Inline | Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (*). | Thiếu Tên, Loại phòng, Địa chỉ, Giá, Mô tả hoặc Tiện ích. |
| **`ROOM-NAME-DUP`** | Warning / Toast | Tên phòng nghỉ đã tồn tại trong danh mục của bạn. Vui lòng đặt tên phân biệt. | Nhập tên phòng trùng lặp 100% với một phòng khác của cùng Host. |
| **`ROOM-CHAR-LIMIT`** | Warning / Inline | Mô tả phòng đã vượt quá giới hạn 1.000 ký tự cho phép. | Nhập textarea mô tả vượt quá 1.000 ký tự. |
| **`ROOM-IMG-001`** | Error / Modal | Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét. | Bấm đăng bán nhưng album chỉ có dưới 3 ảnh. |
| **`ROOM-IMG-002`** | Error / Toast | Tệp tin vượt quá kích thước 5MB hoặc sai định dạng cho phép (chỉ nhận JPG, PNG, WEBP). | Tải file > 5MB hoặc file sai đuôi (.pdf, .exe,...). |
| **`ROOM-IMG-NETERR`**| Error / Inline | Tải ảnh thất bại do lỗi kết nối mạng. Vui lòng bấm thử lại. | Mất mạng hoặc gián đoạn kết nối khi đang upload. |
| **`ROOM-DEL-001`** | Caution / Modal | Không thể xóa phòng! Phòng này đang có đơn đặt phòng trong thời gian tới. Phòng được tự động chuyển sang trạng thái Tạm dừng (Archived). | Bấm xóa phòng có đơn booking tới (`checkOut >= today`). |
| **`CONFIRM-DEL-001`**| Confirm / Modal | Bạn có chắc chắn muốn xóa phòng này? Thao tác này sẽ xóa vĩnh viễn dữ liệu khỏi hệ thống. Vui lòng gõ "XÓA" để xác nhận. | Kích hoạt khi bấm icon xóa phòng Draft hoặc phòng không có booking tới. |
| **`ROOM-DEL-002`** | Success / Toast | Đã xóa phòng nghỉ vĩnh viễn khỏi danh sách của bạn. | Xóa thành công bản ghi khỏi DB. |
| **`CONFIRM-STA-ARCHIVE`** | Confirm / Modal | Bạn có chắc muốn tạm dừng hiển thị phòng này? Phòng sẽ không còn hiển thị cho du khách trên ứng dụng. | Click vào pill trạng thái `Published` tại bảng danh sách. |
| **`CONFIRM-STA-PUBLISH`** | Confirm / Modal | Bạn có muốn mở bán lại phòng này? Phòng sẽ được hiển thị công khai trên ứng dụng. | Click vào pill trạng thái `Archived` tại bảng danh sách. |
| **`ROOM-STA-001`** | Success / Toast | Đã kích hoạt mở bán phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng. | Chuyển trạng thái sang `Published` thành công. |
| **`ROOM-STA-002`** | Info / Toast | Đã tạm dừng hiển thị phòng. Du khách sẽ không tìm thấy phòng này trên ứng dụng. | Chuyển trạng thái sang `Archived` thành công. |
| **`ROOM-SAVE-001`** | Success / Toast | Cập nhật thông tin phòng thành công! | Lưu thành công toàn bộ dữ liệu form lên server và kích hoạt `Published`. |
| **`ROOM-DRAFT-001`**| Info / Toast | Đã lưu bản nháp thành công. Bạn có thể quay lại hoàn thiện bất kỳ lúc nào. | Bấm nút "Lưu bản nháp" ở thanh Bottom Bar. |
| **`ROOM-AUTOSAVE-001`**| Info / Label | Đã lưu bản nháp tự động [thời gian]. | Hệ thống tự động lưu form vào LocalStorage sau mỗi 60 giây. |
| **`ROOM-RESTORE-001`** | Confirm / Modal | Tìm thấy nội dung chưa lưu từ phiên làm việc trước. Bạn có muốn khôi phục không? | Mở form phát hiện cache LocalStorage từ phiên làm việc trước chưa lưu. |
| **`CONFIRM-CANCEL-001`**| Confirm / Modal | Bạn có chắc chắn muốn hủy? Mọi thay đổi chưa lưu sẽ bị mất. | Bấm nút "Hủy thay đổi" hoặc chuyển trang khi có dữ liệu form chưa lưu. |
| **`ROOM-DUP-001`** | Success / Toast | Đã nhân bản phòng thành công thành bản nháp [Tên phòng]. | Thao tác Sao chép (Duplicate) phòng từ bảng danh mục thành công. |
| **`EXP-001`** | Success / Toast | Đang xuất dữ liệu danh mục phòng ra file Excel, quá trình tải sẽ bắt đầu ngay. | Host bấm nút "Xuất Excel" trên thanh công cụ. |
| **`EMPTY-001`** | Info / State | Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại. | Kết quả tìm kiếm theo từ khóa hoặc lọc theo danh mục trả về 0 bản ghi. |

---

## 6. TÀI KHOẢN & DỮ LIỆU TEST THẬT TRÊN DATABASE

Tester có thể sử dụng các tài khoản và bản ghi thật sau có sẵn trong database MongoDB Atlas để đối soát và viết kịch bản test Postman / Automated Test:

### 1. Tài khoản Host chính (Sở hữu 6 phòng)
* **Email:** `host@smarttravel.com`
* **Mật khẩu:** `123456`
* **User ID:** `6adf16d84430d1c8c1484c8f`

### 2. Các phòng thực tế của Host `host@smarttravel.com`:
1. `6adf16d94430d1c8c1484c93` (Mã: `DN-01` - *"An Nhiên Eco Retreat Đà Nẵng"*, status: `Published`, đơn cũ đã xong, **đủ điều kiện test xóa với chữ "XÓA"**).
2. `6adf16d94430d1c8c1484c94` (Mã: `DN-02` - *"The Muse Bohemian Studio Mỹ Khê"*, có đơn `ST-5894` đến 30/10/2026, **dùng test chặn xóa [ROOM-DEL-001]**).
3. `6adf16d94430d1c8c1484c95` (Mã: `DN-03` - *"Mộc Garden Villa & Private Pool"*, có đơn `ST-3344` trạng thái `PENDING`, **dùng test badge tím "1 đơn mới" và đếm KPI pending 24h**).
4. `6adf16d94430d1c8c1484c96` (Mã: `DL-01` - *"Mây Valley Pine Bungalow Đà Lạt"*, **dùng test toggle Published ⟷ Archived**).
5. `6adf16d94430d1c8c1484c97` (Mã: `HA-01` - *"Hội An Riverside Heritage Retreat"*, **dùng test Duplicate phòng**).
6. `6adf16d94430d1c8c1484c98` (Mã: `HN-01` - *"West Lake Sunset Luxury Loft Hà Nội"*, **dùng test chặn trùng tên [ROOM-NAME-DUP]**).

### 3. Phòng của Host khác (Dùng test chặn quyền [AUTH-403]):
* **Phòng ID:** `6ae01e40b36ef904280dfc2e` (Mã: `P-VLOFYK` - *"Smart Homestay"* thuộc sở hữu của Host `datdinh1006dn@gmail.com`).

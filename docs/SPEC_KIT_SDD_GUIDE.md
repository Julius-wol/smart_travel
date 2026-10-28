# Hướng Dẫn Quy Trình Spec-Driven Development (SDD) Với Spec Kit

Tài liệu này hướng dẫn cách áp dụng quy trình **Spec-Driven Development (SDD)** bằng công cụ **Spec Kit** (`specify-cli`) trong dự án **Smart Travel Platform**.

---

## 📌 1. Triết lý SDD (Spec-Driven Development)

Thay vì "vibe coding" (yêu cầu AI viết code ngay lập tức khiến mã nguồn thiếu cấu trúc, dễ phát sinh lỗi và khó bảo trì), SDD áp dụng quy trình:

```text
Ý tưởng / Yêu cầu  ──>  Đặc tả (spec.md)  ──>  Kế hoạch (plan.md)  ──>  Phân rã (tasks.md)  ──>  Triển khai Code (implement)
```

* **Hiến pháp (`constitution.md`)**: Bộ quy chuẩn bất biến về công nghệ, kiến trúc và bảo mật.
* **Đặc tả (`spec.md`)**: Làm rõ **Làm cái gì** và **Tại sao** (*What & Why*) - góc nhìn sản phẩm và người dùng.
* **Kế hoạch (`plan.md`)**: Làm rõ **Làm như thế nào** (*How*) - thiết kế database, endpoint, state management.
* **Checklist (`tasks.md`)**: Chia nhỏ thành các bước nguyên tử để AI hoặc lập trình viên thực thi tuần tự.
* **Code**: Chỉ là sản phẩm cuối cùng sinh ra từ các artifacts đã được kiểm duyệt.

---

## 📂 2. Cấu trúc Spec Kit trong dự án

Sau khi khởi tạo, dự án có các thư mục và file cấu hình sau:

```text
smart_travel/
├── .specify/
│   ├── memory/
│   │   └── constitution.md     # Hiến pháp kỹ thuật của Smart Travel (Bắt buộc tuân thủ)
│   ├── templates/              # File mẫu chuẩn cho spec, plan, tasks
│   ├── scripts/                # Scripts tự động hoá của Spec Kit
│   └── integration.json        # Cấu hình AI agent integration
├── .agents/skills/             # Các skills tích hợp cho AI Agent (Antigravity/Copilot/Claude...)
│   ├── speckit-constitution/
│   ├── speckit-specify/
│   ├── speckit-clarify/
│   ├── speckit-plan/
│   ├── speckit-tasks/
│   ├── speckit-analyze/
│   ├── speckit-implement/
│   └── speckit-converge/
└── docs/
    └── SPEC_KIT_SDD_GUIDE.md   # File hướng dẫn này
```

---

## 🔄 3. Chi tiết 7 bước phát triển tính năng (SDD Workflow)

Khi cần phát triển một tính năng mới (ví dụ: *Lọc danh sách phòng theo giá và tiện ích*, *Gợi ý lịch trình du lịch bằng Gemini AI*), bạn tương tác với AI Agent qua các lệnh sau:

### Bước 1: Rà soát Hiến pháp dự án
```bash
/speckit.constitution
```
* **Mục đích**: Nhắc nhở AI về các quy chuẩn kỹ thuật (Express 5, MongoDB Mongoose, React Native Expo, JWT auth, Monorepo...).
* File liên quan: `.specify/memory/constitution.md`.

---

### Bước 2: Soạn thảo Đặc tả tính năng
```bash
/speckit.specify
```
* **Prompt mẫu**: 
  > *"Tôi muốn xây dựng tính năng tìm kiếm và lọc phòng nghỉ (Filter Rooms) trên Mobile App theo: khoảng giá (min - max), thành phố (city), và danh sách tiện ích (amenities: wifi, hồ bơi...). Hãy tạo đặc tả chi tiết."*
* **AI sẽ làm**: Tạo file `spec.md` gồm User Stories, Functional Requirements và Acceptance Criteria (chưa đi sâu vào code).

---

### Bước 3: Làm rõ điểm mơ hồ (Clarification - Khuyến nghị)
```bash
/speckit.clarify
```
* **Mục đích**: AI sẽ quét `spec.md`, tìm các trường hợp biên (edge cases) chưa rõ ràng và đặt câu hỏi cho bạn.
* **Ví dụ AI hỏi**: 
  1. *Khi người dùng chọn nhiều tiện ích, hệ thống lọc theo điều kiện AND (phải có đủ tất cả tiện ích) hay OR (chỉ cần có ít nhất một)?*
  2. *Khoảng giá mặc định nếu người dùng không chọn là bao nhiêu?*
* Bạn trả lời, AI sẽ tự động cập nhật câu trả lời vào `spec.md`.

---

### Bước 4: Thiết kế Kế hoạch kỹ thuật
```bash
/speckit.plan
```
* **Mục đích**: Dựa vào `constitution.md` và `spec.md`, AI lên phương án kiến trúc chi tiết.
* **Nội dung `plan.md` sẽ chứa**:
  * **Backend**: Route `GET /api/rooms?city=&minPrice=&maxPrice=&amenities=`, Query builder trong Mongoose, Pagination.
  * **Frontend**: Screen `FilterModal.js`, Component `PriceSlider.js`, Redux slice `roomFilterSlice.js`.
  * **Validation**: Yup schema cho tham số lọc.

---

### Bước 5: Phân rã thành danh sách công việc (Tasks Breakdown)
```bash
/speckit.tasks
```
* **Mục đích**: Chuyển đổi `plan.md` thành một checklist công việc độc lập, nguyên tử (atomic), sắp xếp theo đúng thứ tự triển khai.
* **Kết quả**: Tạo `tasks.md` dạng checklist `[ ] Task 1`, `[ ] Task 2`...

---

### Bước 6: Kiểm tra tính nhất quán (Analyze & Consistency Check)
```bash
/speckit.analyze
```
* **Mục đích**: AI kiểm tra chéo giữa:
  * `constitution.md` (Có vi phạm quy tắc API format hoặc security không?)
  * `spec.md` (Kế hoạch có đáp ứng đủ các tiêu chí người dùng muốn không?)
  * `plan.md` và `tasks.md` (Có task nào bị thiếu sót không?)

---

### Bước 7: Tiến hành Code (Implementation)
```bash
/speckit.implement
```
* **Mục đích**: AI lần lượt đọc từng task trong `tasks.md`, viết mã nguồn, bổ sung test và đánh dấu `[x]` khi hoàn thành.
* Bạn review code theo từng task và tiến hành chạy thử trên môi trường dev.

---

## 💡 4. Ví dụ thực chiến một chu trình SDD trong Smart Travel

Giả sử bạn cần làm tính năng **"Lưu lịch trình du lịch cá nhân vào thiết bị (Offline Trip Plan) bằng SQLite"**:

| Bước | Lệnh gọi AI | Nội dung thực hiện |
| :--- | :--- | :--- |
| **B1** | `/speckit.specify` | Mô tả: Khách hàng sau khi nhận lịch trình gợi ý từ Gemini AI có thể bấm nút "Lưu offline". Dữ liệu lưu vào SQLite cục bộ trên điện thoại thông qua thư viện `expo-sqlite`. |
| **B2** | `/speckit.clarify` | AI hỏi: *Nếu người dùng đăng xuất, dữ liệu SQLite có bị xóa không? Có giới hạn số lượng lịch trình lưu offline không?* -> Trả lời để AI bổ sung vào spec. |
| **B3** | `/speckit.plan` | Thiết kế bảng `offline_trips` trong `mobile-app/src/database/sqlite.js`, tạo custom hook `useOfflineTrips`, xử lý đồng bộ. |
| **B4** | `/speckit.tasks` | Tạo danh sách task: 1. Tạo migration SQLite -> 2. Viết helper CRUD -> 3. Viết action trong Redux -> 4. Gắn nút bấm UI. |
| **B5** | `/speckit.implement`| AI lần lượt tạo file và viết code chuẩn chỉnh theo từng task. |

---

## 🛠 5. Các lệnh Terminal hỗ trợ (Specify CLI)

Tại thư mục gốc của dự án `smart_travel`, bạn có thể dùng các lệnh terminal sau:

* **Kiểm tra môi trường và công cụ**:
  ```bash
  specify check
  ```
* **Xem phiên bản Spec Kit**:
  ```bash
  specify version
  ```
* **Xem các tích hợp và extension**:
  ```bash
  specify extension list
  specify bundle list
  ```

---

## ⚠️ 6. Những điều cần ghi nhớ

1. **Không bỏ qua bước `spec.md`**: Khi có yêu cầu thay đổi (change request), hãy cập nhật lại `spec.md` trước khi sửa code.
2. **Tuân thủ Hiến pháp**: Không tự ý thêm thư viện ngoài danh mục đã quy định trong `constitution.md` nếu chưa có sự thống nhất của team.
3. **Commit kèm Spec**: Khi tạo Pull Request, commit luôn cả thư mục spec của tính năng đó để người review nắm được ngữ cảnh đầy đủ.

# \[SMART\-99\] Manage Room Inventory

Ticket: [SMART-96](https://huyennk30.atlassian.net/browse/SMART-96)

# User Story

**Là **một Host (Đối tác cho thuê phòng),  

**Tôi muốn **xem danh sách phòng của tôi và thực hiện Thêm mới, Chỉnh sửa, Ẩn/Hiện thông tin phòng,  

**Để** tôi có thể cập nhật thông tin phòng, giá tiền và hình ảnh chính xác cho khách du lịch đặt phòng.

# Screen Flow


<https://www.figma.com/design/BUZPMFqoSItS2eJF3mzi7Z/Smart-Travel?node-id=394-1125&t=SoE0o04CLViNb6Gq-4>

---

| No | Screen/Section | Field/Component | Type | Mandatory | Default/State | Detail (Mô tả hành vi, hiển thị, điều hướng & phản hồi) |
| --- | --- | --- | --- | --- | --- | --- |
| **I** | **Room Inventory Screen** |  |  |  |  |  |
| 1.1 | Page Header | Breadcrumb | Navigation | No | `» Quản lý phòng` | • Hiển thị vị trí trang hiện tại.• Click không reload nếu đang ở trang gốc. |
| 1.2 | Top Header | Language Switcher | Toggle | No | `VN` (Active) | • Chuyển đổi ngôn ngữ giao diện giữa Tiếng Việt (`VN`) và Tiếng Anh (`EN`). |
| 1.3 | Top Header | Notification Bell | Icon Button | No | Có chấm đỏ badge | • Hiển thị số lượng thông báo chưa đọc.• Click mở popover danh sách thông báo đặt phòng / duyệt tin. |
| 1.4 | Top Header | Profile Menu | Dropdown Avatar | No | Tên Host + Email | • Hiển thị Avatar, Tên Host ("Robert Nguyen") và Email.• Click hiển thị menu con: Hồ sơ cá nhân, Cài đặt tài khoản, Đăng xuất. |
| 1.5 | Page Header | Tiêu đề & Mô tả | Typography | No | Static text | • H1: "Quản lý phòng".• Subtext: "Quản lý cơ sở lưu trú, giá cả và trạng thái hiển thị của bạn trên hệ thống". |
| 1.6 | Page Header | Nút `Xuất Excel` | Button (Outline) | No | Enabled | • Click gọi API xuất báo cáo danh sách phòng hiện tại ra file `.xlsx` theo bộ lọc đang chọn.• Phản hồi hệ thống: `[EXP-001]`. |
| 1.7 | Page Header | Nút `+ Thêm phòng mới` | Button (Primary) | No | Enabled | • Click điều hướng sang màn hình tạo phòng mới (Create Room) với form trắng rỗng. |
| 1.8 | KPI Metrics Bar | Thẻ "TỔNG SỐ PHÒNG" | KPI Card | No | Giá trị số nguyên | • Đếm tổng số phòng thuộc sở hữu của Host hiện tại (`ownerId`). |
| 1.9 | KPI Metrics Bar | Thẻ "ĐANG MỞ BÁN" | KPI Card | No | Giá trị số nguyên | • Đếm số phòng có trạng thái `Published`. |
| 1.10 | KPI Metrics Bar | Thẻ "TẠM DỪNG / BẢO TRÌ" | KPI Card | No | Giá trị số nguyên | • Đếm số phòng có trạng thái `Archived`. |
| 1.11 | KPI Metrics Bar | Thẻ "ĐƠN CHỜ DUYỆT (24H)" | KPI Card (Highlight tím) | No | Số lượng đơn + Link | • Đếm tổng số đơn đặt phòng đang ở trạng thái `Pending` trong vòng 24h.• Click link "Xem danh sách yêu cầu →" điều hướng trực tiếp sang Màn hình **duyệt yêu cầu đặt phòng **(`SCR-HOST-03`) kích hoạt Tab "Chờ duyệt". |
| 1.12 | Filter & Search Bar | Ô tìm kiếm phòng | Search Input | No | Placeholder: "Tìm theo tên phòng, mã phòng..." | • Hỗ trợ tìm kiếm theo Tên phòng hoặc Mã phòng (e.g. `MP: 0102`).• Kích hoạt tìm kiếm sau khi người dùng nhấn phím Enter• Nếu không tìm thấy kết quả: Hiển thị trạng thái `[EMPTY-001]`. |
| 1.13 | Filter & Search Bar | Dropdown "Loại phòng" | Select Dropdown | No | `Tất cả loại phòng` | • Lọc theo: Bungalow, Biệt thự / Villa, Khách sạn, Căn hộ Studio, Homestay.• Khi chọn một mục, tự động reload bảng dữ liệu tương ứng. |
| 1.14 | Filter & Search Bar | Dropdown "Trạng thái" | Select Dropdown | No | `Tất cả trạng thái` | • Lọc theo: Tất cả, Đang bán (`Published`), Tạm dừng (`Archived`), Bản nháp (`Draft`). |
| 1.15 | Filter & Search Bar | Dropdown "Sắp xếp" | Select Dropdown | No | `Mới nhất` | • Click để chọn sắp xếp danh sách theo thời gian chỉnh sửa (`lastUpdated`): Mới nhất / Cũ nhất. |
| 1.16 | Data Table | Cột "HÌNH ẢNH" | Image Thumbnail | Yes | Frame bo góc `56x40px` | • Hiển thị ảnh đại diện chính kèm badge đếm số lượng ảnh (vd: `1/5`).• Hover hiển thị ảnh phóng to dạng popover xem nhanh. |
| 1.17 | Data Table | Cột "TÊN PHÒNG & LOẠI PHÒNG" | Multi-line Text + Tag | Yes | Tên (Bold) + Mã phòng (Pill) | • Dòng 1: Tên phòng nghỉ + Badge mã phòng (`MP: xxxx`).• Dòng 2: Loại hình, diện tích, sức chứa tối đa, cấu hình giường.• Click vào tên phòng: Nếu ở trạng thái `Draft` hoặc `Archived`, điều hướng đến màn hình Update Room; nếu ở trạng thái `Published`, chỉ mở chế độ xem chi tiết (không cho sửa trực tiếp). |
| 1.18 | Data Table | Cột "GIÁ NIÊM YẾT" | Text + Action Link | Yes | Định dạng tiền VND | • Dòng 1: Số tiền in đậm kèm đơn vị `/ đêm` (vd: `1.250.000đ / đêm`). |
| 1.19 | Data Table | Cột "TRẠNG THÁI" | Status Pill / Toggle | Yes | `Published` (Green) / `Archived` (Gray) / `Draft` (Yellow) | • Badge bo tròn hiển thị trạng thái của phòng:- `Published` → Click mở modal xác nhận `[CONFIRM-STA-ARCHIVE]`; đồng ý chuyển sang `Archived` kèm thông báo `[ROOM-STA-002]`.- `Archived` → Click mở modal xác nhận `[CONFIRM-STA-PUBLISH]`; đồng ý chuyển sang `Published` kèm thông báo `[ROOM-STA-001]`.- `Draft`: Nút bị vô hiệu hóa (không cho chuyển trạng thái trực tiếp từ bảng). |
| 1.20 | Data Table | Cột "ĐƠN MỚI" | Notification Pill | No | Pill tím `x đơn mới` hoặc `-` | • Nếu phòng có đơn booking đang chờ duyệt: Hiển thị badge tím.• Click badge điều hướng thẳng đến chi tiết duyệt đơn của phòng đó tại `SCR-HOST-03`. |
| 1.21 | Data Table | Cột "THAO TÁC" | Action Icon Button | Yes | Icon Pencil / More / Delete | • Click icon Cây bút (Pencil):- Với phòng `Draft` / `Archived`: Điều hướng sang màn hình Chỉnh sửa `SCR-HOST-02`.- Với phòng `Published`: Không cho phép chỉnh sửa trực tiếp, icon bút chì được làm mờ (vô hiệu hóa) - Click tùy chọn Nhân bản (Duplicate): Nhân bản toàn bộ dữ liệu thành phòng mới `[ROOM-DUP-001]`. - Click icon Thùng rác (Delete): - Với phòng `Draft`: Mở modal xác nhận `[CONFIRM-DEL-001]`; xác nhận xong xóa bản ghi trong DB kèm `[ROOM-DEL-002]`.- Với phòng `Published` đang có booking tới (`booking_time >= today`): Chặn xóa và tự động chuyển sang `Archived` kèm thông báo `[ROOM-DEL-001]`.- Với phòng `Archived` hoặc `Published` không có booking tới: Mở modal xác nhận `[CONFIRM-DEL-001]`; xác nhận xong xóa bản ghi khỏi DB kèm `[ROOM-DEL-002]`. |
| 1.22 | Table Footer | Thông tin phân trang | Text | No | `Hiển thị X - Y trong tổng số Z phòng` | • Hiển thị chỉ số bản ghi hiện tại trên tổng số kết quả lọc. |
| 1.23 | Table Footer | Pagination Controls | Button Group | No | `[< Trước]` `[1]` `[Sau >]` | • Nút Previous/Next bị vô hiệu hóa khi ở trang đầu/trang cuối.\<br\>• Chuyển trang giữ nguyên trạng thái Search và Filter trên URL query. |
| **II** | **Create / Update Room Screen** |  |  |  |  |  |
| 2.1 | Top Navigation & Title | Breadcrumb | Navigation Link | No | `» Quản lý phòng » Chỉnh sửa phòng` | • Click `Quản lý phòng` để quay lại **danh sách**`SCR-HOST-01`.• Nếu form có dữ liệu chưa lưu: Kích hoạt cảnh báo `[CONFIRM-CANCEL-001]`. |
| 2.2 | Top Navigation & Title | Tiêu đề Form | Typography | No | Static text + Tên phòng | • Chế độ sửa: `[Tên phòng]`. Chế độ thêm: `Thêm phòng nghỉ mới`.• Kèm theo Badge mã phòng `[MP: xxxx]` và Badge trạng thái (`Published` / `Archived` / `Draft`). |
| 2.4 | Section 1: Thông tin cơ bản | Tên phòng nghỉ | Text Input | **Yes** | Max 150 ký tự | • Nhập tên thương mại của phòng (10 - 150 ký tự).• Validate bắt buộc nhập, không được để trống hoặc chỉ chứa khoảng trắng `[ROOM-REQ-001]`.• Kiểm tra không được trùng tên với phòng khác của cùng Host `[ROOM-NAME-DUP]`. |
| 2.5 | Section 1: Thông tin cơ bản | Loại cơ sở lưu trú | Select Dropdown | **Yes** | `Biệt thự / Villa nguyên căn` | • Lựa chọn danh mục: Biệt thự/Villa, Homestay, Căn hộ/Studio, Khách sạn, Bungalow.• Validate bắt buộc chọn `[ROOM-REQ-001]`. |
| 2.6 | Section 1: Thông tin cơ bản | Sức chứa tối đa | Stepper Input | **Yes** | `[-] 2 khách [+]` | • Số nguyên dương, tối thiểu 1, tối đa 50.• Nút `-` bị disable khi giá trị bằng 1. |
| 2.7 | Section 1: Thông tin cơ bản | Phòng ngủ & Giường | Dual Stepper Input | **Yes** | `X phòng` / `Y giường` | • Số lượng phòng ngủ riêng biệt (Min 1, Max 20).• Số lượng giường sẵn có (Min 1, Max 30). |
| 2.8 | Section 2: Địa chỉ & Vị trí tọa độ | Tỉnh / Thành phố | Select Dropdown | **Yes** | Placeholder: "Chọn Tỉnh/Thành..." | • Danh sách 34 tỉnh/thành phố Việt Nam.• Khi chọn lại Tỉnh/Thành, tự động reset trường Quận/Huyện.• Bắt buộc chọn `[ROOM-REQ-001]`. |
| 2.9 | Section 2: Địa chỉ & Vị trí tọa độ | Quận / Huyện / Phường | Select Dropdown | **Yes** | Placeholder: "Chọn Quận/Huyện..." | • Danh sách cấp hành chính phụ thuộc vào Tỉnh/Thành đã chọn.• Bắt buộc chọn `[ROOM-REQ-001]`. |
| 2.10 | Section 2: Địa chỉ & Vị trí tọa độ | Địa chỉ chi tiết | Text Input | **Yes** | Placeholder: "Số nhà, tên đường, khu vực..." | • Nhập chính xác số nhà, ngõ/ngách, tên đường.• Dữ liệu này dùng để đồng bộ vị trí tự động lên bản đồ.• Bắt buộc nhập `[ROOM-REQ-001]`. |
| 2.11 | Section 2: Địa chỉ & Vị trí tọa độ | Bản đồ GPS Preview | Map Viewer + Coordinates | Yes | Bản đồ tương tác + Pin | • Hiển thị tọa độ vĩ độ/kinh độ (vd: `11.8974° N, 108.4312° E`).\<br\>• Link `[Điều chỉnh ghim vị trí]`: Mở modal kéo thả Marker bản đồ để chỉnh tọa độ chuẩn xác. |
| 2.12 | Section 3: Đơn giá & Mô tả phòng | Giá thuê theo đêm tiêu chuẩn | Number Input + Prefix VND | **Yes** | Min 50.000 VNĐ | • Giá niêm yết các ngày trong tuần (Thứ 2 - Thứ 5).• Tự động format dấu chấm phân cách hàng nghìn (vd: `2.500.000`).• Bắt buộc nhập `[ROOM-REQ-001]`. |
| 2.13 | Section 3: Đơn giá & Mô tả phòng | Giá cuối tuần (Tùy chọn) | Number Input + Prefix VND | No | Null / Số nguyên | • Giá áp dụng riêng cho Thứ 6, Thứ 7, Chủ Nhật.• Nếu để trống, hệ thống tự động áp dụng bằng mức giá ngày thường. |
| 2.14 | Section 3: Đơn giá & Mô tả phòng | Mô tả chi tiết phòng nghỉ | Textarea (Rich Text) | **Yes** | Tối thiểu 50, tối đa 1.000 ký tự | • Nhập mô tả không gian, tầm nhìn, dịch vụ.• Bắt buộc tối thiểu 50 ký tự `[ROOM-REQ-001]`.• Bộ đếm ký tự thời gian thực ở góc dưới (`xxx/1000 ký tự`). Khi vượt quá 1000 ký tự, hiển thị cảnh báo `[ROOM-CHAR-LIMIT]`. |
| 2.15 | Section 3: Đơn giá & Mô tả phòng | Chính sách hủy phòng | Checkbox | No | Checked | • Checkbox: "Cho phép hủy miễn phí trước 48h nhận phòng".• Subtext: "Khách hàng được hoàn 100% tiền nếu hủy trước 2 ngày". |
| 2.16 | Section 4: Tiện ích & Dịch vụ nổi bật | Danh mục tiện nghi | Checkbox Grid Cards | **Yes** | Tối thiểu chọn 1 tiện ích | • Hệ thống gồm các Card tiện ích có sẵn icon: Wifi, Bếp, Bể bơi riêng, Đỗ xe, BBQ, Bồn sục, Khóa thông minh...• Bắt buộc chọn ít nhất 1 tiện ích `[ROOM-REQ-001]`. |
| 2.17 | Section 4: Tiện ích & Dịch vụ nổi bật | Nút `+ Tạo tiện ích mới` | Action Link / Button | No | Enabled | • Click mở modal nhập tiện ích đặc thù chưa có trong danh mục hệ thống. |
| 2.18 | Section 5: Album hình ảnh phòng | Drag & Drop Zone | File Upload Area | **Yes** | Chấp nhận PNG, JPG, WEBP | • Cho phép kéo thả trực tiếp hoặc click duyệt file từ máy tính.• Dung lượng tối đa: `5MB/file`. Số lượng quy định: Tối thiểu 3 ảnh, tối đa 15 ảnh.• Nếu file vượt 5MB hoặc sai định dạng: Kích hoạt `[ROOM-IMG-002]`.• Nếu mất kết nối mạng khi upload: Kích hoạt `[ROOM-IMG-NETERR]`. |
| 2.19 | Section 5: Album hình ảnh phòng | Ảnh đã tải lên (Gallery) | Image Grid + Actions | Yes | Danh sách ảnh thumbnail | • Hiển thị các ảnh đã upload kèm nút xóa `(X)`.• Ảnh đầu tiên có badge `[⭐ Ảnh đại diện]`. Cho phép kéo thả hoán đổi vị trí để chọn ảnh bìa mới. |
| 2.20 | Section 5: Album hình ảnh phòng | Chỉ số số lượng ảnh | Meta Counter | No | Text `[X/15 ảnh đã tải]` | • Hiển thị tỷ lệ số ảnh hiện có trên giới hạn tối đa 15 ảnh. |
| 2.21 | Right Sidebar: Meta Info | Thẻ "THÔNG TIN NHANH" | Meta Card | No | Read-only | • Hiển thị: Trạng thái hiển thị (`Published` / `Archived` / `Draft`), Ngày tạo, Cập nhật lần cuối, Người sửa. |
| 2.22 | Right Sidebar: Profile Score | Thẻ "CHỈ SỐ TỐI ƯU HỒ SƠ" | Progress Circle + Checklist | No | Điểm % (vd: `92% Đạt chuẩn Superhost`) | • Vòng tròn % độ hoàn thiện hồ sơ kèm huy hiệu đánh giá.• Tiêu chí: Vị trí chính xác, Định giá ngày & cuối tuần, Tiện ích đầy đủ (\>6 mục), Album ảnh (\>= 5 ảnh chuẩn). -      - \>= 90%: Nhãn "Đạt chuẩn Superhost". -      - \< 90%: Nhãn "Hoàn thiện thêm để đạt SuperHost” |
| 2.23 | Sticky Bottom Action Bar | Nút `Hủy thay đổi` | Link Button (Ghost) | No | Enabled | • Click hiển thị dialog xác nhận: `[CONFIRM-CANCEL-001]`. |
| 2.24 | Sticky Bottom Action Bar | Trạng thái Auto-save | Timestamp Label | No | Text: `Đã lưu bản nháp tự động [thời gian]` | • Tự động lưu form vào LocalStorage / Cache Server sau mỗi 60 giây khi có thay đổi: `[ROOM-AUTOSAVE-001]`. |
| 2.25 | Sticky Bottom Action Bar | Nút `Lưu bản nháp` | Button (Outline) | No | Enabled | • Lưu dữ liệu hiện tại ở trạng thái `Draft` (chưa công khai cho khách tìm kiếm trên app): `[ROOM-DRAFT-001]`. |
| 2.26 | Sticky Bottom Action Bar | Nút `Cập nhật & Đăng bán` / `Đăng bán` | Button (Primary Solid) | No | Enabled khi điền đủ field bắt buộc | • Validate toàn bộ form.• Thiếu trường bắt buộc: Hiển thị `[ROOM-REQ-001]`.• Album dưới 3 ảnh: Hiển thị `[ROOM-IMG-001]`.• Token hết hạn: Kích hoạt `[AUTH-401-EXPIRED]`.• Thành công: Đưa phòng sang trạng thái `Published` và phản hồi `[ROOM-SAVE-001]`. |

---

# Acceptance Criteria

1. Phân hệ Quản lý Danh mục & Bảo mật dữ liệu

- **Phân quyền và bảo mật dữ liệu phòng (BR-HOST-01):**
    - Khi Host truy cập vào trang Quản lý phòng, hệ thống lập tức đối soát `ownerId` trong phiên đăng nhập hiện tại với cơ sở dữ liệu. Bảng danh sách phòng tuyệt đối chỉ trả về các bản ghi thuộc quyền sở hữu của chính Host đó.
    - Trong mọi tình huống, Host không thể xem, tìm kiếm, chỉnh sửa hay can thiệp vào bất kỳ phòng nào của các đối tác khác, kể cả khi cố tình can thiệp mã phòng (Room ID) trên thanh địa chỉ URL. Nếu cố tình truy cập ID không hợp lệ, hệ thống chặn truy cập và hiển thị cảnh báo vi phạm quyền hạn `[AUTH-403]`.
- **Tính toán và hiển thị các chỉ số tổng quan (KPI Metrics):**
    - Hàng thẻ KPI đầu trang được tự động tính toán thời gian thực theo từng Host:
        - Thẻ *Tổng số phòng*: Thống kê tất cả các cơ sở lưu trú của Host đang quản lý trong hệ thống.
        - Thẻ *Đang mở bán*: Tổng số phòng đang có trạng thái `Published` và sẵn sàng nhận khách.
        - Thẻ *Tạm dừng / Bảo trì*: Tổng số phòng đang ở trạng thái `Archived`.
        - Thẻ *Đơn chờ duyệt (24h)*: Đếm số lượng booking đang chờ xác nhận (`Pending`). Khi Host bấm vào dòng "Xem danh sách yêu cầu →", màn hình lập tức chuyển hướng sang phân hệ Duyệt đơn (`SCR-HOST-03`) với bộ lọc kích hoạt sẵn ở Tab "Chờ duyệt".
- **Tìm kiếm và lọc danh mục:**
    - Host có thể gõ từ khóa tìm kiếm theo tên phòng hoặc mã phòng tại ô tìm kiếm. Hệ thống chỉ bắt đầu kích hoạt truy vấn sau khi người dùng nhấn phím Enter.
    - Các bộ lọc "Loại phòng", "Trạng thái" (Tất cả, `Published`, `Archived`, `Draft`) và bộ lọc sắp xếp thời gian cập nhật ("Mới nhất" / "Cũ nhất") có thể hoạt động độc lập hoặc kết hợp cùng lúc với ô tìm kiếm.
    - Khi không có bản ghi nào thỏa mãn điều kiện, bảng dữ liệu hiển thị trạng thái trống kèm thông báo `[EMPTY-001]`.

---

### 2. Vòng đời của Phòng (Room Lifecycle) & Các ràng buộc trạng thái

#### 2.1. Trạng thái Bản nháp (Draft)

- **Khái niệm:** Là trạng thái phòng chưa được cấu hình đầy đủ các trường bắt buộc, được lưu lại tạm thời để người dùng tiếp tục hoàn thiện về sau. Phòng ở trạng thái này không hiển thị với du khách trên mobile.
- **Hành vi khả dụng:**
    - *Chỉnh sửa (Modify):* Điều hướng sang trang Create/Update Room với đầy đủ thông tin đã lưu trong bản nháp được điền sẵn lên form.
    - *Đăng bán (Publish):* Khi Host đã điền đầy đủ tất cả các trường bắt buộc và tải lên tối thiểu 3 ảnh hợp lệ, nút "Đăng bán" sẽ sáng lên (Enabled). Khi bấm, hệ thống kích hoạt phòng sang trạng thái `Published` và phản hồi `[ROOM-SAVE-001]`.
    - *Xóa (Delete):* Khi bấm icon xóa, hệ thống hiển thị modal xác nhận `[CONFIRM-DEL-001]`. Sau khi người dùng gõ xác nhận, hệ thống xóa hoàn toàn bản ghi phòng ra khỏi cơ sở dữ liệu và thông báo `[ROOM-DEL-002]`.
    - *Chuyển trạng thái trực tiếp trên Table:* Huy hiệu `Draft` tại cột Trạng thái bị vô hiệu hóa (không cho phép click đổi trạng thái nhanh).

#### 2.2. Trạng thái Đang mở bán (Published)

- **Khái niệm:** Là trạng thái phòng đã được công bố chính thức và sẵn sàng đón nhận khách đặt phòng trên ứng dụng Mobile.
- **Hành vi khả dụng:**
    - *Chỉnh sửa (Modify):* Không cho phép chỉnh sửa trực tiếp nội dung phòng đang mở bán để bảo toàn tính nhất quán cho các đơn đặt phòng hiện có. Để thay đổi thông tin lớn, Host cần chuyển phòng sang trạng thái `Archived` hoặc sử dụng tính năng Duplicate.
    - *Sao chép (Duplicate):* Cho phép sao chép tất cả thông tin của phòng thành một phòng mới với ID mới, tên phòng được tự động ghép thêm tiền tố "Bản sao của \[Tên phòng gốc\]" và được gán trạng thái là `Draft` kèm thông báo `[ROOM-DUP-001]`.
    - *Tạm dừng hiển thị:* Khi Host click vào pill `Published` tại bảng danh sách, hệ thống hiển thị modal xác nhận `[CONFIRM-STA-ARCHIVE]`. Sau khi xác nhận, phòng được chuyển sang trạng thái `Archived` kèm thông báo `[ROOM-STA-002]`.
    - *Xóa (Delete):*
        - Nếu phòng đang có đơn đặt phòng trong thời gian tới (`booking_time >= today`, bao gồm trạng thái `Pending` hoặc `Confirmed`): Hệ thống **tuyệt đối không cho phép xóa**, tự động ngăn chặn thao tác và chỉ cho phép chuyển trạng thái sang `Archived` kèm thông báo `[ROOM-DEL-001]`. Các booking hiện có của phòng này vẫn hoạt động bình thường.
        - Nếu phòng không có bất kỳ booking nào trong thời gian tới: Hệ thống hiển thị modal xác nhận `[CONFIRM-DEL-001]`, yêu cầu Host nhập chữ "XÓA" trước khi xóa vĩnh viễn bản ghi khỏi cơ sở dữ liệu kèm phản hồi `[ROOM-DEL-002]`.

#### 2.3. Trạng thái Tạm ẩn (Archived)

- **Khái niệm:** Là trạng thái phòng tạm thời ngừng đón khách và bị ẩn khỏi ứng dụng Mobile.
- **Hành vi khả dụng:**
    - *Mở bán lại (Back to Published):* Host bấm vào pill `Archived` tại bảng danh sách, hệ thống mở modal xác nhận `[CONFIRM-STA-PUBLISH]`. Khi đồng ý, phòng quay lại trạng thái `Published` kèm thông báo `[ROOM-STA-001]`.
    - *Chỉnh sửa (Modify):* Cho phép bấm icon Cây bút để mở form cập nhật lại các thông tin, tiện ích, đơn giá trước khi mở bán trở lại.
    - *Xóa (Delete):* Tương tự phòng Published, hệ thống kiểm tra danh sách booking tới. Nếu không có booking, hiển thị modal xác nhận `[CONFIRM-DEL-001]` và xóa bản ghi khỏi hệ thống kèm `[ROOM-DEL-002]`. Nếu còn booking tồn đọng, hệ thống kích hoạt `[ROOM-DEL-001]`.

---

### 3. Thêm mới & Chỉnh sửa thông tin phòng

- **Điều hướng và tải dữ liệu form:**
    - Khi bấm `+ Thêm phòng mới` từ màn hình **Room Inventory Screen**: Hệ thống điều hướng sang form trắng, các trường số lượng mặc định giá trị cơ bản (Sức chứa: 2 khách, 1 phòng ngủ, 1 giường; Loại phòng: Homestay; Trạng thái mặc định: `Draft`).
    - Khi bấm Chỉnh sửa một dòng phòng: Hệ thống gọi API lấy toàn bộ dữ liệu hiện tại của phòng theo `id` và tự động điền (Prefill) chính xác vào từng trường nhập liệu tương ứng trên màn hình Create/Update Room.
- **Ràng buộc trường bắt buộc và Validate dữ liệu:**
    - **Tên phòng nghỉ:** Bắt buộc nhập, độ dài từ 10 đến 150 ký tự. Không được để trống `[ROOM-REQ-001]`. Hệ thống kiểm tra không cho phép đặt tên trùng lặp 100% với một phòng khác của cùng Host `[ROOM-NAME-DUP]`.
    - **Địa chỉ & Vị trí:** Bắt buộc chọn Tỉnh/Thành phố trong danh mục 34 tỉnh/thành phố và Quận/Huyện tương ứng `[ROOM-REQ-001]`. Khi Host nhập Địa chỉ chi tiết, hệ thống tự động ghim vị trí ước tính trên bản đồ GPS. Host có thể bấm "Điều chỉnh ghim vị trí" để di chuyển marker nhằm có tọa độ vĩ độ/kinh độ chính xác.
    - **Đơn giá:** Bắt buộc nhập giá ngày trong tuần tiêu chuẩn (Tối thiểu 50.000 VNĐ, tối đa 500.000.000 VNĐ) `[ROOM-REQ-001]`. Giá cuối tuần là trường tùy chọn; nếu Host không nhập giá cuối tuần, hệ thống sẽ tự động gán bằng giá ngày thường khi tính tiền cho du khách.
    - **Mô tả chi tiết:** Bắt buộc nhập tối thiểu 50 ký tự `[ROOM-REQ-001]` và không được vượt quá 1.000 ký tự. Khi vượt quá 1.000 ký tự, hệ thống hiển thị cảnh báo `[ROOM-CHAR-LIMIT]`.
    - **Tiện ích:** Phải chọn tối thiểu 1 tiện ích cơ bản `[ROOM-REQ-001]`.
- **Quy chuẩn tải ảnh và Quản lý Album hình ảnh:**
    - Hệ thống chỉ chấp nhận các tệp hình ảnh có định dạng `.jpg`, `.jpeg`, `.png`, `.webp` với dung lượng tối đa là 5MB cho mỗi tệp tin. Nếu tệp vi phạm kích thước hoặc định dạng, hệ thống thông báo lỗi `[ROOM-IMG-002]`.
    - **Số lượng ảnh bắt buộc:** Host phải tải lên **tối thiểu 3 hình ảnh** và được tải tối đa 15 hình ảnh. Nếu số lượng ảnh dưới 3 khi bấm đăng bán, hệ thống hiển thị thông báo lỗi `[ROOM-IMG-001]`.
    - Host có thể bấm nút `(X)` trên từng thumbnail để xóa ảnh, hoặc kéo thả các ảnh để thay đổi thứ tự hiển thị. Ảnh đầu tiên trong danh sách luôn được đánh dấu huy hiệu `[⭐ Ảnh đại diện]`.

---

### 4. Thuật toán Điểm tối ưu hồ sơ & Cơ chế Lưu nháp tự động

- **Chỉ số tối ưu hóa hồ sơ (Profile Health Score):**
    - Cột bên phải màn hình hiển thị thanh điểm hoàn thiện hồ sơ phòng theo thời gian thực (Real-time Calculation) dựa trên 4 tiêu chí:
        1. *Tên và thông tin vị trí chính xác*: Đạt 100% khi điền đủ Tên, Tỉnh, Huyện, Địa chỉ chi tiết và ghim GPS.
        2. *Định giá theo ngày & cuối tuần*: Đạt 100% khi nhập cả giá tiêu chuẩn, giá cuối tuần và chính sách hủy phòng.
        3. *Danh mục tiện ích đầy đủ*: Đạt 100% nếu tích chọn từ 6 tiện ích trở lên (Đạt 80% nếu có từ 1 - 5 tiện ích).
        4. *Số lượng ảnh tải lên*: Đạt 100% khi tải từ 5 ảnh trở lên (Đạt 90% nếu có từ 3 - 4 ảnh).
    - Tổng điểm được tính theo trọng số. Khi đạt trên 90%, hệ thống gắn nhãn *"Đạt chuẩn Superhost"*. Nếu dưới 90%, hệ thống hiển thị nhãn *"Hoàn thiện thêm để đạt SuperHost"*.
- **Cơ chế lưu nháp an toàn (Auto-Save & Draft):**
    - Trong quá trình Host nhập liệu, hệ thống tự động ghi nhớ toàn bộ trạng thái form vào bộ nhớ cục bộ sau mỗi 60 giây và hiển thị thông báo nhẹ: `[ROOM-AUTOSAVE-001]`.
    - Nếu Host vô tình tắt trình duyệt, mất mạng đột ngột hoặc bấm nhầm link khác, khi quay lại form hệ thống sẽ tự động hiển thị gợi ý: `[ROOM-RESTORE-001]`.
    - Khi bấm `Lưu bản nháp`, phòng được lưu ở trạng thái `Draft` và hệ thống phản hồi `[ROOM-DRAFT-001]`.

---

### 5. Xử lý các tình huống ngoại lệ & Ngoại vi

- **Mất kết nối mạng khi tải ảnh lên:**
    - Nếu đường truyền gián đoạn khi upload ảnh, ảnh bị lỗi sẽ hiển thị viền đỏ kèm nút "Thử lại" và thông báo `[ROOM-IMG-NETERR]`. Các ảnh đã tải thành công trước đó vẫn được giữ nguyên trong hàng đợi.
- **Hủy thao tác khi form chưa lưu:**
    - Khi Host bấm nút "Hủy thay đổi" hoặc click vào Breadcrumb / Link ngoài khi form có thay đổi chưa lưu, hệ thống kích hoạt dialog xác nhận `[CONFIRM-CANCEL-001]`.
- **Phiên làm việc hết hạn (Token Expiration):**
    - Nếu JWT Token hết hạn trong khi Host đang chỉnh sửa form, khi bấm nút Lưu, hệ thống không làm mất dữ liệu đã nhập mà hiển thị modal đăng nhập nhanh `[AUTH-401-EXPIRED]` để Host xác thực lại, sau đó tự động tiếp tục tiến trình lưu dữ liệu.

---

# Common Message

| Mã phản hồi (Code) | Loại (Type) | Nội dung thông báo hiển thị | Ngữ cảnh & Điều kiện kích hoạt |
| --- | --- | --- | --- |
| **AUTH-403** | Error / Toast | Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này. | Host cố tình truy cập vào ID phòng của một Host khác qua URL. |
| **AUTH-401-EXPIRED** | Modal / Quick Auth | Phiên làm việc đã hết hạn. Vui lòng xác thực lại mật khẩu để tiếp tục lưu dữ liệu. | Token JWT hết hạn trong lúc Host đang thao tác trên form Create/Update Room. |
| **ROOM-REQ-001** | Warning / Inline | Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (\*). | Bấm lưu/đăng bán khi thiếu Tên phòng, Loại phòng, Địa chỉ, Giá, Mô tả hoặc Tiện ích. |
| **ROOM-NAME-DUP** | Warning / Toast | Tên phòng nghỉ đã tồn tại trong danh mục của bạn. Vui lòng đặt tên phân biệt. | Nhập tên phòng trùng lặp 100% với một phòng khác của cùng Host. |
| **ROOM-CHAR-LIMIT** | Warning / Inline | Mô tả phòng đã vượt quá giới hạn 1.000 ký tự cho phép. | Nhập nội dung textarea mô tả vượt quá 1.000 ký tự. |
| **ROOM-IMG-001** | Error / Modal | Album ảnh chưa đạt yêu cầu. Bạn cần tải lên tối thiểu 3 hình ảnh rõ nét. | Bấm đăng bán nhưng album chỉ có 0, 1 hoặc 2 ảnh. |
| **ROOM-IMG-002** | Error / Toast | Tệp tin vượt quá kích thước 5MB hoặc sai định dạng cho phép (chỉ nhận JPG, PNG, WEBP). | Kéo thả tệp ảnh \> 5MB hoặc tệp sai định dạng. |
| **ROOM-IMG-NETERR** | Error / Inline | Tải ảnh thất bại do lỗi kết nối mạng. Vui lòng bấm thử lại. | Mất mạng hoặc ngắt kết nối gián đoạn khi đang upload ảnh. |
| **ROOM-DEL-001** | Caution / Modal | Không thể xóa phòng! Phòng này đang có đơn đặt phòng trong thời gian tới. Phòng được tự động chuyển sang trạng thái Tạm dừng (Archived). | Host bấm xóa phòng `Published` có đơn booking tới (`booking_time >= today`). |
| **CONFIRM-DEL-001** | Confirm / Modal | Bạn có chắc chắn muốn xóa phòng này? Thao tác này sẽ xóa vĩnh viễn dữ liệu khỏi hệ thống. Vui lòng gõ "XÓA" để xác nhận. | Kích hoạt khi bấm xóa phòng `Draft` hoặc phòng không có booking tới. |
| **ROOM-DEL-002** | Success / Toast | Đã xóa phòng nghỉ vĩnh viễn khỏi danh sách của bạn. | Xóa thành công phòng thỏa mãn điều kiện không còn ràng buộc đơn hàng. |
| **CONFIRM-STA-ARCHIVE** | Confirm / Modal | Bạn có chắc muốn tạm dừng hiển thị phòng này? Phòng sẽ không còn hiển thị cho du khách trên ứng dụng. | Click vào pill trạng thái `Published` tại bảng danh sách phòng. |
| **CONFIRM-STA-PUBLISH** | Confirm / Modal | Bạn có muốn mở bán lại phòng này? Phòng sẽ được hiển thị công khai trên ứng dụng. | Click vào pill trạng thái `Archived` tại bảng danh sách phòng. |
| **ROOM-STA-001** | Success / Toast | Đã kích hoạt mở bán phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng. | Chuyển trạng thái sang `Published` thành công. |
| **ROOM-STA-002** | Info / Toast | Đã tạm dừng hiển thị phòng. Du khách sẽ không tìm thấy phòng này trên ứng dụng. | Chuyển trạng thái sang `Archived` thành công. |
| **ROOM-SAVE-001** | Success / Toast | Cập nhật thông tin phòng thành công! | Lưu thành công toàn bộ dữ liệu form lên server và kích hoạt trạng thái `Published`. |
| **ROOM-DRAFT-001** | Info / Toast | Đã lưu bản nháp thành công. Bạn có thể quay lại hoàn thiện bất kỳ lúc nào. | Bấm nút "Lưu bản nháp" ở thanh Bottom Bar. |
| **ROOM-AUTOSAVE-001** | Info / Label | Đã lưu bản nháp tự động \[thời gian\]. | Hệ thống tự động lưu form vào bộ nhớ cục bộ sau mỗi 60 giây. |
| **ROOM-RESTORE-001** | Confirm / Modal | Tìm thấy nội dung chưa lưu từ phiên làm việc trước. Bạn có muốn khôi phục không? | Mở form phát hiện cache LocalStorage từ phiên làm việc trước chưa lưu. |
| **CONFIRM-CANCEL-001** | Confirm / Modal | Bạn có chắc chắn muốn hủy? Mọi thay đổi chưa lưu sẽ bị mất. | Bấm nút "Hủy thay đổi" hoặc chuyển trang khi có dữ liệu form chưa lưu. |
| **ROOM-DUP-001** | Success / Toast | Đã nhân bản phòng thành công thành bản nháp \[Tên phòng\]. | Thao tác Sao chép (Duplicate) phòng từ bảng danh mục thành công. |
| **EXP-001** | Success / Toast | Đang xuất dữ liệu danh mục phòng ra file Excel, quá trình tải sẽ bắt đầu ngay. | Host bấm nút "Xuất Excel" trên thanh công cụ danh mục. |
| **EMPTY-001** | Info / State | Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại. | Kết quả tìm kiếm theo từ khóa hoặc lọc theo danh mục trả về 0 bản ghi. |

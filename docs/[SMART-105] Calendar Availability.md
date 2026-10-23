# \[SMART\-105\] Calendar Availability

Ticket:[SMART-98](https://huyennk30.atlassian.net/browse/SMART-98)

# User Story

Là một Host (Đối tác cho thuê phòng),  

Tôi muốn xem giao diện lịch (Calendar) theo từng phòng và có thể chủ động khóa (Block) hoặc mở (Open) ngày đón khách,  

Để tôi có thể linh hoạt giữ phòng cho khách vãng lai, sửa chữa bảo dưỡng hoặc nghỉ lễ mà không bị khách trên app đặt trùng.

# Screen Flow


<https://www.figma.com/design/BUZPMFqoSItS2eJF3mzi7Z/Smart-Travel?node-id=394-1125&t=SoE0o04CLViNb6Gq-4>

| No | Screen/Section | Field/Component | Type | Mandatory | Default/State | Detail (Mô tả hành vi, hiển thị, điều hướng & phản hồi) |
| --- | --- | --- | --- | --- | --- | --- |
| **I** | **Main Screen** |  |  |  |  |  |
| 1.1 | Page Header | Breadcrumb | Navigation Link | No | `← Lịch phòng & Trạng thái trống` | • Click quay lại trang Tổng quan hoặc Quản lý phòng.• Không reload trang nếu đang ở trang gốc. |
| 1.2 | Page Header | Tiêu đề & Mô tả | Typography | No | Static text | • H1: "Lịch phòng & Trạng thái trống".• Subtext: "Quản lý tình trạng sẵn có, linh hoạt điều chỉnh biểu giá theo ngày và khóa lịch đón khách tức thì". |
| 1.3 | Top Header Right | Summary KPI Card | Metric Box (4 cột) | No | Tính toán thời gian thực | • Thẻ tổng hợp 4 chỉ số hiệu suất của phòng trong tháng đang xem:1. `TỶ LỆ LẤP ĐẦY`: % tỷ lệ lấp đầy (vd: `78%`).2. `ĐÃ BÁN`: Tổng số đêm đã có khách ở (vd: `23 đêm`).3. `NGÀY TRỐNG`: Số đêm còn trống có thể bán (vd: `7 đêm`).4. `DOANH THU DỰ TÍNH`: Doanh thu từ các đơn đã xác nhận (vd: `46.5M đ`). |
| 1.4 | Top Control Bar | Dropdown "Chọn phòng" | Select Dropdown | **Yes** | Phòng đầu tiên của Host | • Hiển thị icon nhà + Tên phòng (vd: `Villa Mộng Mơ View Hồ & Rừng Thông ⌄`).• Subtext: Mã căn (`#P-VL204`) + Cấu hình (`4 phòng ngủ`).• Khi chọn phòng khác, hệ thống tự động tải lại dữ liệu lịch của phòng đó. |
| 1.5 | Top Control Bar | Bộ điều hướng tháng | Control Group | No | Tháng hiện tại | • Nút `[ < ]` (Tháng trước), Tiêu đề `Tháng [MM], [YYYY]`, Nút `[ > ]` (Tháng sau).• Nút `[Hôm nay]`: Click đưa lịch quay nhanh về tháng và ngày hiện tại. |
| 1.6 | Top Control Bar | Chế độ xem (View Mode) | Pill Toggle | No | `Tháng` (Active) | • Lựa chọn chế độ hiển thị: Xem theo Tháng (Month View). |
| 1.7 | Legend Bar | Chú giải trạng thái (Legend) | Status Indicators | No | Static guide | • Hiển thị 4 mã màu trực quan:- `🟢 Trống`: Sẵn sàng nhận khách.- `🔵 Đã đặt`: Đã có khách đặt và xác nhận thành công.- `🟡 Chờ duyệt`: Đơn mới đang chờ Host phản hồi SLA 24h.- `🔴 Đã khóa / Bảo trì`: Host chủ động khóa phòng không nhận khách. |
| 1.8 | Legend Bar | Ghi chú giá | Info Text | No | `ⓘ Giá hiển thị...` | • Subtext: "Giá hiển thị: VNĐ / đêm (Tự động tăng vào Thứ 6 - Chủ Nhật)". |
| **II** | **Calendar Grid Matrix ** |  |  |  |  |  |
| 2.1 | Grid Header | Tiêu đề ngày trong tuần | Table Header (7 Cột) | Yes | T2 đến CN | • Cột T2 (Thứ 2) đến T6 (Thứ 6): Màu chữ đen chuẩn.• Cột T7 (Thứ 7) & CN (Chủ Nhật): Cột cuối tuần được tô nền xanh/tím nhạt, tiêu đề CN in màu đỏ cam. |
| 2.2 | Cell Frame | Ô ngày (General Cell) | Interactive Container | Yes | Viền xám bo góc | • Mỗi ô đại diện cho 1 ngày trong tháng:- Góc trên trái: Số ngày trong tháng (1, 2, 3... 31).- Góc trên phải: Mức giá áp dụng ngày đó (vd: `2.5tr` ngày thường, `2.8tr` cuối tuần).- Các ngày thuộc tháng trước/tháng sau: Hiển thị mờ (Disabled). Nếu click thao tác quá khứ: Báo `[CAL-NAV-PAST]`. |
| 2.3 | Cell: Trạng thái Trống | Ô "🟢 Trống" | Clickable Cell | Yes | Nền trắng + Chấm xanh | • Hiển thị nhãn `🟢 Trống` ở giữa ô.• Click hoặc kéo chọn dải ngày trống: Mở hộp thoại `[MODAL-BLOCK-DATE]` để Host chủ động khóa lịch. |
| 2.4 | Cell: Trạng thái Đã đặt | Ô "🔵 Đã đặt" | Booking Pill Component | Yes | Nền tím nhạt bo góc | • Hiển thị tên khách (vd: `Lê Hoàng Nam`, `Đỗ Thùy Dung`) + Mã đơn (`#BK-9750`).• Nếu kỳ nghỉ kéo dài nhiều đêm: Thẻ được nối dài liền mạch qua các ô ngày liên tiếp.• Click vào thẻ: Mở Drawer xem chi tiết đơn đặt phòng đã xác nhận. |
| 2.5 | Cell: Trạng thái Khóa | Ô "🔴 Đã khóa / Bảo trì" | Blocked Container | Yes | Nền hồng nhạt + Icon 🔒 | • Hiển thị icon ổ khóa `🔒` ở góc trên và nhãn `Khóa bảo trì` hoặc lý do khóa cá nhân.• Click vào ô: Mở hộp thoại `[MODAL-UNBLOCK-DATE]` để Host xác nhận mở bán lại phòng. |
| 2.6 | Cell: Chờ duyệt | Ô "🟡 Chờ duyệt" | Alert Pill Component | Yes | Nền vàng cam + Badge | • Hiển thị Badge vàng `Chờ duyệt` + Tên khách (vd: `Nguyễn Văn An`).• Click vào ô: Mở ngay cửa sổ nổi `[POPOVER-QUICK-BOOKING]` thao tác duyệt nhanh tại chỗ. |
| **III** | **Duyệt nhanh đơn trên Lịch** |  |  |  |  |  |
| 3.1 | Popover Header | Badge SLA & Mã đơn | Badge + Typography | Yes | Highlight vàng cam | • Badge: `CHỜ DUYỆT SLA` (Chữ in hoa nền vàng).• Mã đơn: `#[Mã đơn]` (vd: `#BK-9821`).• Nút `✕` góc phải: Click đóng popover. |
| 3.2 | Popover Header | Thông tin khách hàng | Avatar + Text | Yes | Avatar + Tên + SĐT | • Avatar tròn 2 chữ cái đầu (vd: `NA`).\<br\>• Tên khách hàng (Bold) + SĐT |
| 3.3 | Popover Body | Chi tiết đặt phòng | Info Grid | Yes | 3 dòng thông tin | • Thời gian: `[Ngày nhận] - [Ngày trả] (X đêm)`.• Số khách: `X người lớn, Y trẻ em`.• Tổng tiền: In đậm cỡ chữ lớn (vd: `7.500.000 VNĐ`). |
| 3.4 | Popover Body | Yêu cầu đặc biệt | Note Box | No | Box màu xám/tím nhạt | • Lời nhắn của khách (vd: "Xin nhận phòng sớm lúc 13h00 nếu được do gia đình có con nhỏ..."). |
| 3.5 | Popover Footer | Nút `Từ chối` | Button (Secondary Outline) | Yes | Enabled | • Click mở Modal Từ chối đơn & Hoàn tiền `[MODAL-REJECT]` như** màn hình duyệt đơn.** |
| 3.6 | Popover Footer | Nút `✓ Duyệt đơn` | Button (Primary Teal/Green) | Yes | Enabled | • Click xác nhận duyệt đơn trực tiếp ngay trên lịch.• Cập nhật ngày từ `Chờ duyệt` sang `🔵 Đã đặt`, gửi phản hồi thành công `[BOOK-APPROVE-SUCCESS]`. |
| **IV** | **Khóa / Mở ngày thủ công** |  |  |  |  |  |
| 4.1 | Modal Block Header | Tiêu đề Modal | Typography | Yes | `Khóa lịch đón khách` | • Hiển thị tiêu đề và khoảng ngày được chọn: `Từ ngày [Start] đến ngày [End] ([X] đêm)`. |
| 4.2 | Modal Block Body | Dropdown "Lý do khóa" | Select Dropdown | **Yes** | Placeholder: "Chọn lý do..." | • Danh mục: Sửa chữa / Bảo trì định kỳ, Giữ chỗ cho khách đặt ngoài hệ thống, Nghỉ lễ / Gia đình sử dụng, Khác.• Chưa chọn mà bấm Lưu: Hiển thị cảnh báo `[CAL-BLOCK-REASON-REQ]`. |
| 4.3 | Modal Block Body | Ghi chú nội bộ | Text Input | No | Tối đa 100 ký tự | • Nhập ghi chú ngắn (vd: "Thay hệ thống bồn vệ sinh cho phòng số 2"). Nội dung này sẽ hiển thị trên ô ngày. |
| 4.4 | Modal Block Footer | Nút `Xác nhận khóa` | Button (Danger Solid) | Yes | Enabled | • Kiểm tra xung đột: Nếu dải ngày có booking `Confirmed`, chặn và báo lỗi `[CAL-BLOCK-CONFLICT]`.• Thành công: Cập nhật các ô ngày sang màu đỏ và thông báo `[CAL-BLOCK-SUCCESS]`. |
| 4.5 | Modal Unblock | Hộp thoại Mở bán lại | Confirm Modal | Yes | `Mở lại ngày đón khách` | • Hiển thị nội dung xác nhận: `[CAL-CONFIRM-UNBLOCK]`.• Host bấm đồng ý: Chuyển ngày từ Đã khóa sang `🟢 Trống` và thông báo `[CAL-UNBLOCK-SUCCESS]`. |

# Acceptance Criteria

### 1. Phân vùng dữ liệu & Thống kê hiệu suất theo Tháng

- **Bảo mật và phân vùng dữ liệu theo Host (BR-HOST-01):**
    - Ma trận lịch phòng chỉ hiển thị các cơ sở lưu trú thuộc quyền quản lý của Host hiện tại (`ownerId`).
    - Khi Host chuyển đổi giữa các phòng tại dropdown "Chọn phòng", hệ thống lập tức tải lại toàn bộ trạng thái ngày, giá và các đơn booking liên quan của đúng căn phòng đó. Nếu Host cố tình truy cập vào ID phòng của đối tác khác qua URL, hệ thống từ chối truy cập và báo lỗi `[AUTH-403]`.
- **Tính toán các chỉ số kinh doanh tổng hợp (Summary Metrics):**
    - Thẻ tóm tắt 4 chỉ số ở đầu trang được tính toán động dựa trên toàn bộ các ngày thuộc tháng đang hiển thị:
        - *Tỷ lệ lấp đầy:* Tỷ lệ % số đêm đã có khách ở (`Booked`) chia cho tổng số đêm khả dụng trong tháng (không tính các ngày bị khóa bảo trì).
        - *Đã bán:* Tổng số đêm phòng đã được đặt và xác nhận thành công trong tháng.
        - *Ngày trống:* Tổng số đêm còn ở trạng thái `Trống` sẵn sàng đón khách mới.
        - *Doanh thu dự tính:* Tổng số tiền thu được từ tất cả các đơn đặt phòng `Confirmed` có lịch lưu trú trong tháng đó.

---

### 2. Hiển thị Lưới Lịch & Mã màu trạng thái trực quan

- **Quy chuẩn hiển thị lưới lịch 7 cột:**
    - Lưới lịch được tổ chức theo tuần lễ từ Thứ 2 (T2) đến Chủ Nhật (CN). Các cột Thứ 7 và Chủ Nhật được phân biệt thị giác bằng nền màu xanh nhạt hoặc tím nhạt, tiêu đề Chủ Nhật có màu đỏ cam nổi bật.
    - Mỗi ô ngày hiển thị rõ: Số ngày trong tháng (ở góc trái) và Mức giá niêm yết theo đêm (ở góc phải).
    - **Chính sách giá ngày thường vs cuối tuần:** Hệ thống tự động áp dụng giá ngày thường (Thứ 2 - Thứ 5, vd: `2.5tr`) và giá cuối tuần (Thứ 6 - Chủ Nhật, vd: `2.8tr`) theo đúng cấu hình Host đã thiết lập tại [\[SMART-99\] Manage Room Inventory](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6389761/SMART-99+Manage+Room+Inventory)
- **Mã màu ngữ nghĩa của 4 trạng thái phòng:**
    - **Trạng thái Trống (**`Available`): Ô ngày nền trắng viền xám mờ kèm nhãn `🟢 Trống`. Khách du lịch có thể tìm thấy và đặt phòng vào những ngày này trên ứng dụng Mobile.
    - **Trạng thái Đã đặt (**`Booked`): Ô ngày hiển thị thẻ màu tím nhạt bo góc chứa Tên khách hàng và Mã đơn đặt phòng. Với kỳ nghỉ kéo dài nhiều ngày (ví dụ: ngày 13 đến 14/11), thẻ được nối dài liên tục qua các ô ngày tương ứng.
    - **Trạng thái Khóa bảo trì (**`Blocked`): Ô ngày có nền màu hồng/đỏ nhạt kèm icon ổ khóa đỏ `🔒` và nhãn lý do khóa (vd: `Khóa bảo trì`). Ngày này bị vô hiệu hóa hoàn toàn trên ứng dụng của du khách.
    - **Trạng thái Chờ duyệt (**`Pending`): Ô ngày có huy hiệu màu vàng cam nhấp nháy `Chờ duyệt` kèm tên khách. Đây là khoảng thời gian đang có khách giữ chỗ chờ Host phản hồi theo SLA 24h.

---

### 3. Nghiệp vụ Khóa / Mở ngày thủ công & Ngăn ngừa xung đột lịch

- **Thao tác Khóa ngày đón khách thủ công:**
    - Host có thể click vào một ô ngày trống hoặc kéo chuột chọn một dải ngày trống liên tiếp (ví dụ từ ngày 8 đến ngày 10/11) để mở hộp thoại `MODAL-BLOCK-DATE`.
    - Host bắt buộc phải chọn Lý do khóa (Bảo trì, Đón khách ngoài, Việc gia đình...) từ danh mục hệ thống. Nếu để trống, hệ thống hiển thị cảnh báo `[CAL-BLOCK-REASON-REQ]`.
    - **Ngăn chặn xung đột lịch (Conflict Prevention):** Khi bấm xác nhận khóa, hệ thống kiểm tra toàn bộ dải ngày được chọn. Nếu có bất kỳ ngày nào đã tồn tại đơn đặt phòng ở trạng thái `Confirmed`, hệ thống lập tức từ chối thao tác khóa và hiển thị cảnh báo nghiêm ngặt `[CAL-BLOCK-CONFLICT]`.
    - Khi khóa thành công, các ô ngày được cập nhật ngay lập tức sang màu đỏ và hệ thống phản hồi `[CAL-BLOCK-SUCCESS]`.
- **Thao tác Mở bán lại ngày đã khóa:**
    - Khi Host muốn mở lại ngày đang bị khóa để đón khách, Host click vào ô ngày màu đỏ. Hệ thống hiển thị hộp thoại xác nhận `[CAL-CONFIRM-UNBLOCK]`.
    - Sau khi Host bấm đồng ý, hệ thống mở khóa ngày phòng trong cơ sở dữ liệu, ô ngày chuyển về màu xanh `🟢 Trống` và phát thông báo `[CAL-UNBLOCK-SUCCESS]`.

---

### 4. Tương tác Xét duyệt nhanh đơn đặt phòng trực tiếp trên Lịch

- **Cửa sổ thao tác nhanh tại chỗ (Quick SLA Action Popover):**
    - Nhằm tối ưu hóa hiệu suất làm việc của Host, khi click vào bất kỳ ô ngày nào có trạng thái `Chờ duyệt`, hệ thống lập tức mở cửa sổ nổi `POPOVER-QUICK-BOOKING` neo trực tiếp vào ô ngày đó mà không cần chuyển trang sang màn hình Duyệt đơn.
    - Cửa sổ hiển thị đầy đủ: Badge cảnh báo `CHỜ DUYỆT SLA`, Mã đơn, Thông tin khách hàng, Thời gian lưu trú, Số lượng khách, Tổng tiền thanh toán và Yêu cầu đặc biệt của khách.
- **Thực hiện hành động Duyệt / Từ chối:**
    - **Duyệt đơn nhanh:** Khi Host bấm nút `✓ Duyệt đơn` trên popover, hệ thống tiến hành khóa dải ngày thành `🔵 Đã đặt`, gửi thông báo đến app du khách và hiển thị thông báo thành công `[BOOK-APPROVE-SUCCESS]`.
    - **Từ chối đơn:** Khi Host bấm nút `Từ chối`, hệ thống chuyển tiếp sang modal từ chối để nhập lý do và kích hoạt hoàn tiền tự động 100% cho khách theo đúng quy trình tại [\[SMART-103\] Booking Approval](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6357042/SMART-103+Booking+Approval)

---

### 5. Xử lý các tình huống ngoại lệ & Ngoại vi 

- **Thao tác trên các mốc thời gian trong quá khứ:**
    - Các ngày đã trôi qua trước ngày hiện tại được làm mờ (Disabled). Nếu Host cố tình click hoặc thao tác khóa/mở các ngày trong quá khứ, hệ thống sẽ chặn thao tác và hiển thị thông báo `[CAL-NAV-PAST]`.
- **Trường hợp không tìm thấy dữ liệu phòng:**
    - Nếu Host chọn một phòng mới tạo ở trạng thái `Draft` chưa cấu hình giá hoặc phòng bị lỗi dữ liệu, bảng lịch hiển thị trạng thái rỗng kèm gợi ý `[EMPTY-ROOM-CAL]`.
- **Đồng bộ hóa đa thiết bị (Real-time Sync):**
    - Nếu Host đang mở màn hình lịch trên máy tính trong khi khách hàng thực hiện đặt phòng thành công trên Mobile, hệ thống sử dụng WebSocket để tự động vẽ lại ô ngày đó sang trạng thái `🟡 Chờ duyệt` ngay lập tức mà Host không cần bấm F5 tải lại trang.

# Common Message

| Mã phản hồi (Code) | Loại (Type) | Nội dung thông báo hiển thị | Ngữ cảnh & Điều kiện kích hoạt |
| --- | --- | --- | --- |
| **AUTH-403** | Error / Toast | Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này. | Host cố tình truy cập lịch phòng của đối tác khác qua URL. |
| **CAL-BLOCK-SUCCESS** | Success / Toast | Đã khóa phòng thành công cho các ngày được chọn. Khách du lịch sẽ không thể đặt phòng vào thời gian này. | Khóa thành công một hoặc nhiều ngày trống trên lịch. |
| **CAL-UNBLOCK-SUCCESS** | Success / Toast | Đã mở bán lại phòng thành công. Phòng đã sẵn sàng đón khách trên ứng dụng. | Mở khóa thành công ngày đã bị khóa bảo trì trước đó. |
| **CAL-BLOCK-CONFLICT** | Error / Modal | Không thể khóa ngày! Khoảng thời gian này đã có đơn đặt phòng đã xác nhận. Vui lòng kiểm tra lại. | Thao tác khóa ngày rơi vào ngày đã có booking `Confirmed`. |
| **CAL-CONFIRM-UNBLOCK** | Confirm / Modal | Bạn có chắc muốn mở lại ngày này? Phòng sẽ được hiển thị công khai trên ứng dụng để du khách đặt chỗ. | Click vào ô ngày đang bị khóa để mở lại. |
| **CAL-BLOCK-REASON-REQ** | Warning / Inline | Vui lòng chọn lý do khóa lịch phòng trước khi tiếp tục. | Chưa chọn lý do khóa trong dropdown của `MODAL-BLOCK-DATE`. |
| **BOOK-APPROVE-SUCCESS** | Success / Toast | Đã phê duyệt đơn đặt phòng #\[Mã đơn\] thành công. Lịch phòng đã được tự động khóa. | Bấm duyệt đơn thành công trực tiếp từ cửa sổ `POPOVER-QUICK-BOOKING`. |
| **CAL-NAV-PAST** | Info / Toast | Không thể thực hiện thao tác khóa hoặc mở ngày cho các mốc thời gian trong quá khứ. | Host cố tình click hoặc thao tác trên các ô ngày đã qua. |
| **EMPTY-ROOM-CAL** | Info / State | Không tìm thấy dữ liệu lịch phòng. Vui lòng chọn một phòng đang hoạt động để xem lịch. | Phòng được chọn chưa hoàn thiện cấu hình hoặc không có dữ liệu lịch. |

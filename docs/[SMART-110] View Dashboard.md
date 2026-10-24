# \[SMART\-110\] View Dashboard

Ticket: [SMART-107](https://huyennk30.atlassian.net/browse/SMART-107)

# User Story

Là một Host (Đối tác cho thuê phòng),

Tôi muốn xem dashboard tổng hợp thông tin về doanh thu, số lượng phòng, tỉ lệ booking, doanh thu theo các mốc thời gian, reviews trong cùng một không gian

Để tôi có thể dễ dàng quản lí và điều hướng đến các dịch vụ cần thiết

# Screen Flow


<https://www.figma.com/design/BUZPMFqoSItS2eJF3mzi7Z/Smart-Travel?node-id=394-1125&t=SoE0o04CLViNb6Gq-4>

| No | Screen/Section | Field/Component | Type | Mandatory | Default/State | Detail (Mô tả hành vi, hiển thị, điều hướng & phản hồi) |
| --- | --- | --- | --- | --- | --- | --- |
| **I** | **Màn hình chính** |  |  |  |  |  |
| 1.1 | Page Header Left | Lời chào & Tên Host | Typography | No | Static text + Tên Host | • H1: `Xin chào, [Tên Host] 👋` (vd: "Xin chào, Robin Nguyen 👋").• Subtext: `Đây là tình hình kinh doanh của bạn`. |
| 1.2 | Page Header Right | Dropdown "Khoảng thời gian" | Select Dropdown | No | `30 ngày qua` | • Danh sách mốc thời gian lọc: Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước.• Khi đổi mốc thời gian: 4 KPI Cards và Biểu đồ tự động tính toán lại dữ liệu. |
| 1.3 | Page Header Right | Nút `Xuất báo cáo` | Button (Primary Teal/Green) | No | Enabled | • Click xuất toàn bộ dữ liệu chỉ số kinh doanh trong kỳ lọc ra file Excel/PDF.• Phản hồi hệ thống: `[DASH-EXPORT-SUCCESS]`. |
| 1.4 | **SLA Alert Banner** | Banner cảnh báo đơn chờ | Alert Banner (Amber/Yellow) | No | Có điều kiện (Chỉ hiện khi có đơn `Pending`) | • Nền vàng nhạt `#FFFBEB`, viền trái vàng cam `#F59E0B`.• Hiển thị nội dung: `Bạn có [X] đơn chờ duyệt, trong đó 1 đơn (#[Mã đơn]) sẽ hết hạn sau [Y] giờ`.• Kích hoạt cảnh báo hệ thống `[DASH-SLA-ALERT]`.• Link hành động: `Chuyển tới Duyệt đơn →` điều hướng ngay sang [\[SMART-103\] Booking Approval](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6357042/SMART-103+Booking+Approval) |
| 1.5 | **KPI Cards Row** | Card 1: Doanh thu | KPI Card Box | Yes | Tính toán thời gian thực | • Giá trị lớn in đậm: `[X] M VND` (vd: `45.2 M VND`).• Sub-badge bên dưới: `[N] đơn hoàn thành & đã xác nhận`.• Tổng giá trị các đơn `Confirmed` và `Completed` có ngày check-in trong kỳ. |
| 1.6 | KPI Cards Row | Card 2: Đơn đặt mới | KPI Card Box | Yes | Tính toán thời gian thực | • Giá trị lớn: `[N] đơn` (vd: `18 đơn`).• Sub-badge bên dưới: `Tỷ lệ chốt đơn tự động [X]%`.• Đếm tổng số đơn booking mới phát sinh trong khoảng thời gian đã chọn. |
| 1.7 | KPI Cards Row | Card 3: Tỷ lệ lấp đầy | KPI Card Box | Yes | Tính toán thời gian thực | • Giá trị lớn: `[X]%` (vd: `68%`).• Tỷ lệ phần trăm số đêm đã bán trên tổng số đêm khả dụng của toàn bộ các phòng trong kỳ. |
| 1.8 | KPI Cards Row | Card 4: Điểm đánh giá TB | KPI Card Box | Yes | Thang điểm 5.0 | • Giá trị lớn: `[X.X] ★` (vd: `4.7 ★`).• Điểm trung bình cộng các đánh giá từ khách hàng tính đến thời điểm hiện tại. |
| **II** | **Biểu đồ Doanh thu & Xu hướng** |  |  |  |  |  |
| 2.1 | Chart Header Left | Tiêu đề & Mô tả | Typography | No | Static text | • H2: "Biểu đồ doanh thu & xu hướng đặt phòng".• Subtext: "Doanh thu theo ngày trong \[Khoảng thời gian đã chọn\]". |
| 2.2 | Chart Header Right | Toggle "Doanh thu / Số đơn" | Segmented Button | No | `Doanh thu (VNĐ)` (Active) | • Chuyển đổi giữa 2 chế độ hiển thị trên trục Y: Doanh thu theo số tiền (VNĐ) hoặc Số lượng đơn đặt phòng phát sinh. |
| 2.3 | Chart Header Right | Dropdown "Lọc theo phòng" | Select Dropdown | No | `Tất cả [N] phòng` | • Lọc xem biểu đồ doanh thu của riêng từng phòng hoặc xem gộp tất cả. |
| 2.4 | Chart Canvas Area | Biểu đồ vùng (Area Chart) | Interactive Chart | Yes | Line xanh dương + Fill gradient | • Trục X: Các mốc ngày trong kỳ (vd: 22/09, 26/09, ... 20/10).• Trục Y: Giá trị tiền rút gọn (0tr, 2tr, 4tr, 6tr, 8tr).• Hover vào một điểm trên đồ thị: Hiển thị tooltip chi tiết ngày, số tiền và số đơn (vd: `15/10/2026: 5.000.000 đ • 2 đơn`).• Nếu không có dữ liệu: Hiển thị `[DASH-EMPTY-DATA]`. |
| 2.5 | Chart Footer Summary | Chỉ số tóm tắt đồ thị | Tag / Legend Indicator | No | 2 mốc chỉ số | • `🟢 Trung bình ngày: [X] đ` (vd: `1.506.000 đ`).• `🟣 Đỉnh doanh thu: [Y] đ (Ngày DD/MM)` (vd: `7.500.000 đ (Ngày 20/10)`). |
| **III** | **Khối Lịch Nhận / Trả phòng** |  |  |  |  |  |
| 3.1 | Card Header | Tiêu đề & Tabs lọc | Card Header + Tabs | Yes | `Hôm nay ([N])` (Active) | • Tiêu đề: "Lịch Nhận / Trả phòng" + Subtext: "Theo dõi lịch trình đón khách chu đáo".• Tab switch: `Hôm nay ([X])` và `Ngày mai ([Y])`. |
| 3.2 | Guest List Item | Thẻ thông tin khách lưu trú | List Item Container | Yes | Viền xám bo góc 8px | • Avatar chữ cái viết tắt tròn.• Họ tên khách hàng (Bold) + Tên phòng nghỉ + Số điện thoại che 6 số cuối (vd: `0912.***.***`). |
| 3.3 | Guest List Item | Huy hiệu Check-in / Check-out | Status Badge Pill | Yes | Dynamic | • `🟢 Check-in [Giờ]` (vd: `Check-in 14:00`).• `🔵 Check-out [Giờ]` (vd: `Check-out 12:00`). |
| **IV** | **Khối Đánh giá mới nhất (Cột phải)** |  |  |  |  |  |
| 4.1 | Card Header | Tiêu đề & Điểm TB | Card Header + Badge | Yes | Badge điểm `★ 4.7 / 5.0` | • Tiêu đề: "Đánh giá mới nhất" + Subtext: "Từ khách đã hoàn thành kỳ nghỉ".• Click vào header hoặc link xem tất cả: Chuyển hướng sang màn hình [\[SMART-108\]View Reviews & Feedbacks](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6422602/SMART-108+View+Reviews+Feedbacks) |
| 4.2 | Review Item | Danh sách nhận xét (Top 3) | List Item Container | Yes | 3 đánh giá gần nhất | • Avatar tròn + Tên khách + Dãy 5 sao vàng.• Tên phòng + Ngày đăng (vd: `Villa Mộng Mơ • 13/10/2026`).• Trích dẫn nhận xét (rút gọn trong 2 dòng).• Click vào dòng nhận xét: Điều hướng thẳng sang [\[SMART-108\]View Reviews & Feedbacks](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6422602/SMART-108+View+Reviews+Feedbacks) và cuộn đến bài đánh giá tương ứng. |

# Acceptance Criteria

1. Phân vùng dữ liệu & Nguyên tắc Vận hành Trung tâm 

- **Bảo mật dữ liệu theo phiên đăng nhập Host (BR-HOST-01):**
    - Toàn bộ dữ liệu hiển thị trên Dashboard (KPIs, Biểu đồ, Lịch đón/tiễn khách, Đánh giá mới nhất) chỉ truy xuất các thông tin thuộc quyền quản lý của Host hiện tại (`ownerId`).
    - Nếu tài khoản Host cố tình truy cập vào ID cơ sở khác, hệ thống chặn truy cập và hiển thị cảnh báo vi phạm quyền hạn `[AUTH-403]`.
- **Nguyên tắc "3 Câu hỏi trong 5 Giây":**
    - Dashboard đóng vai trò là màn hình mặc định ngay sau khi Host đăng nhập, được thiết kế để giải quyết ngay lập tức 3 câu hỏi vận hành sống còn:
        1. *Hôm nay tôi cần xử lý đơn hàng hay đón/tiễn khách nào?* → Thể hiện qua Banner SLA và Khối Lịch Nhận/Trả phòng hôm nay.
        2. *Tình hình kinh doanh tháng này đang tốt hay xấu?* -\> Thể hiện qua 4 thẻ KPI và Biểu đồ xu hướng doanh thu.
        3. *Khách hàng đang đánh giá thế nào về tôi?* → Thể hiện qua Điểm đánh giá TB và Khối Đánh giá mới nhất.

---

### 2. Cảnh báo Đơn chờ duyệt & Quy tắc SLA (BR-HOST-03)

- **Hiển thị thông minh Banner Cảnh báo Đơn chờ duyệt:**
    - Banner cảnh báo chỉ xuất hiện ở đầu trang khi hệ thống phát hiện có ít nhất 1 đơn đặt phòng đang ở trạng thái `Pending`.
    - Nếu không có đơn chờ duyệt nào, banner này tự động ẩn hoàn toàn để tối ưu không gian hiển thị.
    - Nếu có nhiều đơn chờ, banner tự động phát hiện và nêu đích danh mã đơn có thời hạn SLA gấp nhất (ví dụ: `#[Mã đơn] sẽ hết hạn sau 3 giờ`) kèm kích hoạt cảnh báo `[DASH-SLA-ALERT]`.
- **Điều hướng xử lý khẩn cấp:**
    - Khi Host bấm vào liên kết `Chuyển tới Duyệt đơn →` trên banner, hệ thống điều hướng trực tiếp sang Màn hình [\[SMART-103\] Booking Approval](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6357042/SMART-103+Booking+Approval)  và tự động kích hoạt sẵn Tab "Chờ duyệt".

---

### 3. Công thức tính toán các chỉ số KPI & Biểu đồ Xu hướng (BR-HOST-06)

- **Quy tắc tính toán 4 Thẻ KPI chính:**
    - *Doanh thu:* Tổng tiền thanh toán (`totalPrice`) của tất cả các đơn đặt phòng ở trạng thái `Confirmed` và `Completed` có ngày bắt đầu nhận phòng (`checkInDate`) nằm trong khoảng thời gian được chọn.
    - *Đơn đặt mới:* Tổng số lượng yêu cầu đặt phòng phát sinh mới trong kỳ lọc (bất kể trạng thái).
    - *Tỷ lệ lấp đầy:* Số đêm phòng đã bán (`Booked`) chia cho tích số giữa (Số phòng hoạt động x Số ngày trong kỳ) nhân 100%.
    - *Điểm đánh giá TB:* Trung bình cộng toàn bộ số sao từ các bài review thực tế của khách hàng, làm tròn đến 1 chữ số thập phân (hiển thị `--` nếu chưa có đánh giá nào).
- **Tương tác trên Biểu đồ Doanh thu (ApexCharts):**
    - Trục hoành biểu diễn các mốc thời gian cách nhật trong kỳ; trục tung thể hiện doanh thu quy đổi triệu đồng (`tr`).
    - Khi Host rê chuột (Hover) vào các điểm nút trên đồ thị: Hiển thị tooltip màu tối chứa ngày cụ thể, tổng doanh thu trong ngày và số lượng đơn tương ứng.
    - Khi bấm chuyển sang tab `Số đơn`: Biểu đồ mượt mà chuyển trục tung sang hiển thị số lượng đơn đặt phòng phát sinh theo ngày.
    - Khi Host chọn một phòng cụ thể trong dropdown `Lọc theo phòng`, biểu đồ ngay lập tức vẽ lại đường xu hướng của riêng phòng đó. Nếu khoảng thời gian không có doanh thu phát sinh, biểu đồ hiển thị thông báo `[DASH-EMPTY-DATA]`.

---

### 4. Lịch đón / tiễn khách & Đánh giá mới nhất

- **Theo dõi Lịch Nhận / Trả phòng theo ngày:**
    - Thẻ bên trái cung cấp danh sách khách hàng sẽ đến nhận phòng (Check-in 14:00) hoặc trả phòng (Check-out 12:00) trong ngày `Hôm nay` hoặc `Ngày mai`.
    - Hỗ trợ Host nắm bắt nhanh thông tin liên lạc (SĐT che bớt ký tự nhạy cảm) và các ghi chú đặc biệt (ví dụ: *Yêu cầu đón tại sân bay*, *Phòng đã dọn sạch*).
- **Theo dõi nhận xét khách hàng (Đánh giá mới nhất):**
    - Thẻ bên phải trích xuất 3 bài đánh giá mới nhất được gửi từ ứng dụng Mobile.
    - Giúp Host nhanh chóng nắm bắt các phản hồi tích cực cũng như phản ánh dịch vụ (như wifi yếu, cách âm kém) để kịp thời cải thiện vận hành.
    - Khi Host bấm vào bất kỳ dòng đánh giá nào hoặc bấm vào tiêu đề, hệ thống điều hướng trực tiếp sang màn hình [\[SMART-108\]View Reviews & Feedbacks](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/6422602/SMART-108+View+Reviews+Feedbacks)

---

### 5. Xử lý các tình huống ngoại lệ & Ngoại vi

- **Trường hợp Host mới đăng ký chưa có phòng hoặc chưa có giao dịch (New Host):**
    - Đối với các đối tác mới tạo tài khoản:
        - 4 thẻ KPI hiển thị `0` hoặc `--`.
        - Biểu đồ doanh thu ẩn đường vẽ và hiển thị khung thông tin hướng dẫn `[DASH-NEW-HOST]`.
        - Khối Nhận/Trả phòng và Đánh giá hiển thị trạng thái chờ đơn hàng đầu tiên.
- **Xuất báo cáo kinh doanh:**
    - Khi Host bấm nút `Xuất báo cáo` ở góc trên bên phải, hệ thống tiến hành kết xuất toàn bộ số liệu thống kê trong khoảng thời gian đang chọn thành file Excel/PDF và hiển thị thông báo `[DASH-EXPORT-SUCCESS]`.

# Common Message

| Mã phản hồi (Code) | Loại (Type) | Nội dung thông báo hiển thị | Ngữ cảnh & Điều kiện kích hoạt |
| --- | --- | --- | --- |
| **AUTH-403** | Error / Toast | Tài khoản của bạn không có quyền xem thông tin tổng quan của cơ sở lưu trú này. | Host cố tình truy cập trái phép dữ liệu kinh doanh của Host khác qua URL/API. |
| **DASH-EXPORT-SUCCESS** | Success / Toast | Đang kết xuất báo cáo kinh doanh ra file Excel, quá trình tải xuống sẽ bắt đầu ngay. | Host bấm nút "Xuất báo cáo" ở góc trên bên phải trang Dashboard. |
| **DASH-SLA-ALERT** | Caution / Banner | Cảnh báo: Có \[X\] đơn đặt phòng đang chờ duyệt, trong đó có đơn sắp hết hạn SLA 24h. | Tự động kích hoạt khi có ít nhất 1 đơn đặt phòng `Pending` sắp quá hạn duyệt. |
| **DASH-EMPTY-DATA** | Info / State | Chưa có dữ liệu kinh doanh phát sinh trong khoảng thời gian được chọn. | Khoảng thời gian lọc không có bất kỳ giao dịch hoặc lượt đặt phòng nào. |
| **DASH-NEW-HOST** | Info / State | Chưa có dữ liệu kinh doanh. Số liệu sẽ tự động hiển thị sau khi bạn đăng phòng và có đơn đặt phòng đầu tiên. | Trạng thái hiển thị đối với tài khoản Host mới chưa phát sinh giao dịch. |

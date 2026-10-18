# \[SMART\-84\] Booking Discovery & Search

Ticket: [SMART-18](https://huyennk30.atlassian.net/browse/SMART-18)

# User Story

Là một khách du lịch, tôi muốn tìm kiếm, lọc danh sách homestay theo địa điểm, thời gian lưu trú, lượng khách và tiện ích mong muốn, để nhanh chóng tìm được nơi ở phù hợp nhất với kế hoạch và ngân sách của chuyến đi 

# Screen Flow
<https://www.figma.com/design/BUZPMFqoSItS2eJF3mzi7Z/Smart-Travel?node-id=29-1190&t=xTJBCXCqai0XAtbc-4>

| **No** | **Section** | **Field** | **Type** | **Mandatory** | **Default/State** | **Description** |
| --- | --- | --- | --- | --- | --- | --- |
| **1** | Top Bar | Logo Smart Travel | Icon/Text | Yes | Display | • Logo thương hiệu kết hợp icon la bàn.• Click: Cuộn lên đầu trang (Scroll to top). |
| **2** | Top Bar | Global Search Icon | Button (Icon) | Yes | Enabled | • Icon kính lúp.• Click: Mở màn hình tìm kiếm toàn cục. |
| **3** | Top Bar | Notification Bell | Button (Icon) | Yes | Enabled | • Icon chuông, kèm badge đỏ nếu có thông báo mới (`unread_count > 0`).• Click: Mở màn hình thông báo. |
| **4** | Top Bar | Profile Avatar | Button (Image) | Yes | Enabled | • Avatar người dùng.• Click: Mở trang cá nhân / Profile. |
| **5** | Search Filter Box | Destination Input | Search Bar | Yes | Placeholder: "Bạn muốn đi đâu?" | • Hỗ trợ icon Micro (Voice search).• Click vào thanh: Mở modal chọn địa điểm/khu vực. |
| **6** | Search Filter Box | Date Range Picker | Button | Yes | Placeholder: "Chọn ngày" | • Click: Mở Calendar Picker để thay đổi ngày lưu trú.• Khi đã chọn: Hiển thị "{Ngày đến} - {Ngày đi} ({X} đêm)". |
| **7** | Search Filter Box | Guest & Room Selector | Button | Yes | Placeholder: "Chọn số khách, phòng" | • Click: Mở BottomSheet tăng/giảm số khách và số phòng.• Khi đã chọn: Hiển thị "{X} khách • {Y} phòng". |
| **8** | Search Filter Box | Filter Adjust Button | Button (Icon) | Yes | Enabled | • Icon thanh trượt bộ lọc bên phải.• Click: Mở BottomSheet cấu hình bộ lọc nâng cao gồm: -      - Khoảng giá: Dưới 1tr, Từ 1tr đến 2tr, Trên 2tr.     - Số lượng khách: Tối thiểu 1.     - Điểm đánh giá: Chọn từ 1 - 5 sao. |
| **9** | Quick Filter Chips | Bộ lọc Tag | Chip Button | No | Display | • Hiển thị số lượng bộ lọc phụ đang áp dụng (ví dụ: "Bộ lọc (1)").• Click: Mở lại popup điều chỉnh bộ lọc. |
| **10** | Quick Filter Chips | Tất cả Chip | Chip Button | No | Selected (Active) | • Trạng thái mặc định: Hiển thị "Tất cả (10)" khi chưa config search/filter.• Sau khi config search/filter: Hiển thị "Tất cả (X)" với X là tổng số homestay trong khu vực thỏa mãn các bộ lọc. |
| **11** | Result Summary | Summary Title | Label | Yes | Display | • Trạng thái mặc định: Hiển thị "Khám phá những homestay mới nhất hôm nay" (tải 10 homestay mới nhất từ database).• Sau khi config search/filter: Hiển thị "{X} homestay phù hợp" kèm text phụ: "Khu vực {khu vực đang tìm kiếm} & lân cận".• Khi X = 0: Hiển thị "Không tìm thấy homestay phù hợp với bộ lọc của bạn. Vui lòng đặt lại bộ lọc." |
| **12** | Homestay Card | Image Carousel | Image Slider | Yes | Display (vd: "1/8") | • Hiển thị ảnh kèm badge số ảnh.• Vuốt ngang trực tiếp trên card để xem các góc chụp thực tế của phòng. |
| **13** | Homestay Card | Wishlist Heart | Button (Icon) | Yes | Trái tim viền xám / Đỏ | • Click: Toggle lưu yêu thích vào SQLite/Server.• Hiển thị thông báo Toast `CR_BOOK_01` hoặc `CR_BOOK_02`.• Nếu chưa đăng nhập: Kích hoạt modal yêu cầu đăng nhập. |
| **14** | Homestay Card | Property Name & Rating | Label Group | Yes | Display | • Hiển thị tên nơi lưu trú, điểm đánh giá trung bình và số lượt đánh giá (vd: "An Nhiên Eco Retreat Đà Nẵng", Rating "★ 4.9 (122 reviews)").• Chạm vào tên homestay: Điều hướng sang màn hình **Chi tiết homestay** (`SCR-MOB-BOOK-02`). |
| **15** | Homestay Card | Location & Distance | Label | Yes | Display | • Hiển thị vị trí cụ thể và khoảng cách ước tính tới địa danh nổi bật (vd: "Sơn Trà • Cách bãi tắm Mỹ Khê 250m"). |
| **16** | Homestay Card | Amenity Tags | Horizontal Tags | No | Display | • Danh sách các tag tiện ích nổi bật nhất của phòng (vd: "Wifi 250Mbps", "Bếp riêng", "Bồn tắm gỗ"). |
| **17** | Homestay Card | Pricing Block | Text Group | Yes | Display | • Giá gốc gạch ngang + Tag giảm giá (vd: "-24%") + Giá chốt ("680.000đ /đêm").• Hiển thị chính sách giá và cam kết: "Miễn phí hủy phòng trước 48h". |
| **18** | Homestay Card | Xem phòng CTA | Button | Yes | Enabled (Màu xanh đậm) | • Nút hành động chính trên thẻ phòng.• Click vào nút này hoặc chạm vào Ảnh phòng / Thân Card: Chuyển hướng sang màn hình **Chi tiết homestay** (`SCR-MOB-BOOK-02`). |
| **19** | Pagination / Load More | Xem thêm Button | Button | Yes | Enabled | • Hiển thị: "Xem thêm {X} Homestay tại {khu vực đang tìm kiếm}".• Click: Tải thêm danh sách homestay tiếp theo (Pagination / Infinite Scroll).• Ẩn nút hoàn toàn khi X = 0 (kết quả rỗng) hoặc khi đã tải hết danh sách. |
| **20** | Bottom Navigation | Navigation Tab Bar | Bottom Menu | Yes | Fixed | • 4 Tabs: Khám phá, Đặt phòng (Active), Lịch trình, Tài khoản.• Tab "Đặt phòng" hiển thị nổi bật màu xanh. Click từng tab để chuyển phân hệ tương ứng. |

# Acceptance Criteria

### 1. Tìm kiếm, Lọc và Khám phá Homestay (Discovery & Search Filtering)

- **Cấu trúc hiển thị Section trên màn hình:**
    - Khi người dùng điều hướng vào tab Đặt phòng, hệ thống hiển thị màn hình với các Section:
        1. Top Bar
        2. Search Filter Box
        3. Quick Filter Chips
        4. Result Summary
        5. Homestay Card List (Carousel ảnh, Wishlist Heart, Tên & Rating, Vị trí & Khoảng cách, Tiện ích, Khối giá, Nút Xem phòng)
        6. Pagination / Load More ("Xem thêm")
        7. Bottom Navigation Bar
- **Trạng thái Mặc định (Default State - Khi chưa cấu hình Search / Filter):**
    - **Search Filter Box:** Ô tìm kiếm hiển thị placeholder: `"Bạn muốn đi đâu?"`; chọn ngày hiển thị placeholder: `"Chọn ngày"`; chọn số lượng hiển thị placeholder: `"Chọn số khách, phòng"`.
    - **Quick Filter Chips:** Hiển thị chip `"Tất cả (10)"` ở trạng thái được chọn (Selected/Active).
    - **Result Summary:** Hiển thị tiêu đề text tĩnh: `"Khám phá những homestay mới nhất hôm nay"`.
    - **Homestay Card:** Hệ thống tự động truy vấn và hiển thị 10 homestay mới nhất từ database.
- **Trạng thái Đã kích hoạt Tìm kiếm / Lọc (Filtered State):**
    - Kích hoạt khi người dùng áp dụng bộ lọc từ tab "Đặt phòng" hoặc bấm tìm kiếm từ trang chủ chuyển sang.
    - **Search Filter Box:**
        - Thanh tìm kiếm hiển thị: `{vị trí/khu vực}` (ví dụ: "Đà Nẵng, Sơn Trà").
        - Thanh chọn ngày hiển thị: `{ngày check-in} - {ngày check-out} ({X} đêm)`. Khi bấm vào sẽ mở Calendar Modal để chọn ngày, hệ thống tự động tính số đêm.
        - Thanh số lượng hiển thị: `{X} khách • {Y} phòng`.
        - Bộ lọc phụ (nút Filter): Cho phép lọc nâng cao theo mức giá (*Dưới 1tr*, *Từ 1tr - 2tr*, *Trên 2tr*), số khách (tối thiểu 1) và điểm đánh giá (1 - 5 sao).
    - **Quick Filter Chips:** Cập nhật nhãn `"Tất cả (X)"` với X là tổng số homestay thỏa mãn toàn bộ tiêu chí lọc.
    - **Result Summary:** Cập nhật hiển thị: `"{X} homestay phù hợp"` kèm text phụ: `"Khu vực {khu vực đang tìm kiếm} & lân cận"`.
    - **Homestay Card:** Hiển thị danh sách các card homestay thỏa mãn điều kiện lọc.
- **Tương tác trên Homestay Card:**
    - **Image Carousel:** Người dùng có thể vuốt ngang trực tiếp trên card để xem các ảnh góc phòng khác nhau mà không cần click vào trong.
    - **Wishlist Heart:** Nếu đã đăng nhập, hệ thống toggle trạng thái lưu và ghi nhận vào Local SQLite + đồng bộ Server, hiển thị Toast `CR_BOOK_01` hoặc `CR_BOOK_02`. Nếu chưa đăng nhập, kích hoạt modal yêu cầu đăng nhập.
    - **Điều hướng xem chi tiết:** Người dùng click vào nút `Xem phòng`, hoặc chạm trực tiếp vào **Ảnh phòng** hay **Tên homestay** trên thân Card đều sẽ kích hoạt điều hướng sang màn hình Chi tiết homestay (`SCR-MOB-BOOK-02`).
- **Xử lý kết quả rỗng (Zero Search Results - Edge Case):**
    - Khi bộ lọc quá hẹp dẫn đến không có homestay nào thỏa mãn (`X = 0`):
        - Mục Result Summary hiển thị thông báo: `"Không tìm thấy homestay phù hợp với bộ lọc của bạn. Vui lòng đặt lại bộ lọc."`
        - Danh sách Homestay Card không hiển thị item nào.
        - Nút `Xem thêm` (Pagination) được **ẩn hoàn toàn**.

# Common Message

| **Response ID** | **Loại phản hồi (Type)** | **Nội dung thông báo hiển thị** | **Vị trí & Thời gian tồn tại** | **Điều kiện kích hoạt ** |
| --- | --- | --- | --- | --- |
| **CR\_BOOK\_01** | Toast Notification (Success) | `"Đã thêm phòng vào danh sách yêu thích"` | Dưới đáy màn hình, tự ẩn sau 2.5s | Bấm icon Trái tim trên Card phòng hoặc trang chi tiết khi chưa thích. |
| **CR\_BOOK\_02** | Toast Notification (Info) | `"Đã xóa phòng khỏi danh sách yêu thích"` | Dưới đáy màn hình, tự ẩn sau 2.5s | Bấm icon Trái tim khi phòng đang ở trạng thái đã thích. |
| **CR\_BOOK\_03** | Toast Notification (Error) | `"Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền."` | Dưới đáy màn hình, tự ẩn sau 3.0s | Thiết bị mất mạng hoặc timeout khi gọi API tải danh sách homestay/tạo đơn đặt phòng. |
| **CR\_BOOK\_04** | Inline Warning / Toast | `"Vui lòng điền đầy đủ và chính xác thông tin liên hệ."` | Dưới đáy màn hình hoặc dưới ô input bị lỗi | Bỏ trống Họ tên, SĐT hoặc nhập sai định dạng Email tại màn hình Thanh toán. |
| **CR\_BOOK\_05** | Loading Overlay | `"Đang xử lý đặt phòng và xác nhận thanh toán an toàn..."` | Toàn màn hình (Full-screen overlay kèm Spinner) | Ngay sau khi người dùng nhấn nút "Xác nhận & Thanh toán". |
| **CR\_BOOK\_06** | Toast Notification (Success) | `"Đã sao chép mã đặt phòng vào bộ nhớ tạm"` | Dưới đáy màn hình, tự ẩn sau 2.0s | Bấm vào icon sao chép cạnh mã booking `ST-5894` trên vé e-Pass. |
| **CR\_BOOK\_07** | Alert Dialog | `"Rất tiếc, phòng này vừa được khách khác đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương."` | Popup giữa màn hình kèm nút `[Xem phòng khác]` | Server trả về lỗi conflict tình trạng phòng trống khi submit thanh toán. |
| **CR\_BOOK\_08** | Toast Notification (Info) | `"Đang tạo lịch trình du lịch đồng bộ với phòng của bạn..."` | Dưới đáy màn hình, tự ẩn sau 2.5s | Bấm nút "Tạo Lịch trình Chuyến đi" từ màn hình vé e-Pass để chuyển sang AI Planner. |

# 📋 TÀI LIỆU ĐẶC TẢ GIAO DIỆN & PHÂN TÍCH CHỨC NĂNG: HOME DETAILS SCREEN
**Mã màn hình:** `[SMART-85] Home Details Screen (Chi tiết nơi lưu trú)`  
**Dự án:** Smart Travel Platform (React Native / Expo Mobile App)  
**Tài liệu tham chiếu:** Functional Requirement Specification & Common Message Matrix (CR_BOOK_01 → CR_BOOK_08)

---

## 🎯 1. TỔNG QUAN MÀN HÌNH

- **Mục tiêu:** Cung cấp thông tin trực quan, đầy đủ và đáng tin cậy về nơi lưu trú (homestay/khách sạn/resort) bao gồm thư viện ảnh thực tế, thông số phòng, tiện nghi, đánh giá từ khách hàng, vị trí bản đồ và chính sách lưu trú nhằm thúc đẩy quyết định đặt phòng của khách du lịch.
- **Vị trí trong luồng điều hướng (Navigation Flow):**
  - **Điểm vào:** Từ `[SMART-84] Booking Discovery & Search` (khi người dùng click vào Card phòng ở trang tìm kiếm/khám phá).
  - **Điểm ra:** 
    - Nút Back: Quay lại `[SMART-84] Booking Discovery & Search`.
    - Nút "Đặt phòng ngay CTA": Điều hướng sang màn hình thanh toán `[SMART-88] Checkout & Payment`.
    - Icon Profile: Mở `ProfileScreen`.
    - Địa chỉ: Mở ứng dụng bản đồ ngoại vi (Google Maps / Apple Maps).

---

## 🧱 2. PHÂN TÍCH CHI TIẾT 17 THÀNH PHẦN GIAO DIỆN (UI COMPONENTS)

| No | Nhóm (Section) | Trường (Field) | Loại Component | Bắt buộc | Trạng thái hiển thị | Đặc tả hành vi & Xử lý sự kiện (Behavior & Events) |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **1** | **Header Bar** | Back Button | Icon Button | Có | Luôn kích hoạt | - Icon mũi tên quay lại (`arrow-back`).<br>- **Action:** `navigation.goBack()` để trở về màn hình `[SMART-84]`. |
| **2** | **Header Bar** | Title | Label Text | Có | Hiển thị: "Home Details" | - Header font chữ đậm, căn giữa hoặc cạnh nút back, màu trung tính sang trọng. |
| **3** | **Header Bar** | Action Icons | Button Group | Có | Enabled (2-3 icons) | - **Wishlist Heart:** Bấm lưu/bỏ lưu yêu thích (kích hoạt `CR_BOOK_01` hoặc `CR_BOOK_02`).<br>- **Profile Avatar:** Mở nhanh trang cá nhân người dùng. |
| **4** | **Media Showcase** | Hero Image & Slider | Gallery Slider | Có | Hiển thị (vd: "10/12") | - Ảnh lớn tỉ lệ 16:9 với badge đếm số ảnh góc phải (vd: "1/12").<br>- Hỗ trợ vuốt ngang xem ảnh mượt mà.<br>- 3 ảnh thumbnail nhỏ bên dưới kèm nút `+x ảnh nữa` (bấm mở Modal phóng to full màn hình). |
| **5** | **Media Showcase** | Match & Tag Badges | Tag Group (Chips) | Không | Hiển thị nhãn | - Các tag nổi bật: `TOP 1% SƠN TRÀ`, `Eco Living`, `Gần biển`, `Được yêu thích nhất`.<br>- Tone màu nổi bật, bo góc mềm mại. |
| **6** | **Title & Rating** | Homestay Name | Label Heading | Có | Hiển thị tên đầy đủ | - Typography cỡ lớn (22-24px, Bold), màu `#1A202C` (vd: *"An Nhiên Eco Retreat Đà Nẵng"*). |
| **7** | **Title & Rating** | Rating & Review Count | Label Link | Có | Hiển thị sao & lượt đánh giá | - Hiển thị: `★ 4.9 • 128 đánh giá`.<br>- **Action:** Click vào dòng này sẽ kích hoạt cuộn mượt màn hình (`ScrollView.scrollTo`) xuống thẳng phần **Khách hàng chia sẻ (Section 13)**. |
| **8** | **Address & Map** | Address Info Block | Card / Label | Có | Hiển thị địa chỉ chi tiết | - Hiển thị địa chỉ cụ thể và chỉ dẫn khoảng cách (vd: *"Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng - Cách bãi biển 150m"*).<br>- **Action:** Bấm vào Card mở Google Maps / Apple Maps qua `Linking.openURL(geo:lat,lng)`. |
| **9** | **Key Specs Grid** | Room Specs Grid | 4-Cell Grid Box | Có | 4 ô thông số trọng yếu | - Ô 1: **Loại hình** (Nhà nguyên căn / Căn hộ dịch vụ)<br>- Ô 2: **Sức chứa** (Tối đa 4 khách)<br>- Ô 3: **Phòng ngủ** (2 PN • 2 Giường King)<br>- Ô 4: **Phòng tắm** (2 Phòng tắm riêng khép kín). |
| **10** | **Amenities Section** | Amenity List | Grid Items (8 icons) | Có | 8 tiện ích tiêu biểu | - Hiển thị icon + tên: Wifi tốc độ cao, Bếp riêng cao cấp, Bồn tắm gỗ pơ-mu, Máy chiếu phim 4K, Giặt & sấy khô, Điều hòa 2 chiều, Ban công view biển, Chỗ đỗ xe ô tô.<br>- **Action:** Nút *"Xem tất cả tiện ích"* mở BottomSheet/Modal liệt kê toàn bộ danh mục. |
| **11** | **Review Summary** | Overall Score & Bars | Score Widget | Có | Điểm tổng kết & 5 thanh | - Điểm số lớn: `4.9 / 5.0 - Xuất sắc`.<br>- 5 thanh tiến trình (Progress Bar): Vệ sinh sạch sẽ (5.0), Vị trí & Cảnh quan (4.9), Dịch vụ & Chủ nhà (4.9), Tiện nghi phòng (4.8), Đáng giá tiền (4.9). |
| **12** | **Customer Reviews** | Review Filter Tags | Filter Chips | Không | Default: "Tất cả" | - Bộ lọc đánh giá nhanh: `Tất cả (128)`, `Có hình ảnh (42)`, `5 sao (110)`, `4 sao (15)`. Người dùng có thể click chip để filter danh sách bên dưới. |
| **13** | **Customer Reviews** | Review Item Cards | Card List | Có | Danh sách đánh giá | - Mỗi card gồm: Avatar, Tên khách hàng, Ngày lưu trú / Loại phòng, Số sao vàng, Nội dung nhận xét chi tiết, Thumbnail ảnh thực tế khách chụp.<br>- Nút *"Xem toàn bộ 128 đánh giá"*. |
| **14** | **Booking Policy** | Check-in / Out Times | 2-Cell Box | Có | Hiển thị giờ nhận/trả | - **Nhận phòng:** 14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock).<br>- **Trả phòng:** 12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống). |
| **15** | **Booking Policy** | Cancellation Policy | Info Card (Warning) | Có | Thẻ thông tin chính sách | - *"Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00 ngày 13 Th05. Sau thời gian này, áp dụng chính sách hoàn trả của chủ nhà."* |
| **16** | **Bottom Booking Bar** | Sticky Price Block | Price Group | Có | Cố định dưới chân màn hình | - Hiển thị giá trung bình: `1.450.000 VND / đêm • Đã bao gồm thuế & phí`. Nằm cố định ở thanh Bottom Bar (Sticky). |
| **17** | **Bottom Booking Bar** | Đặt phòng ngay CTA | Button Action | Có | Enabled (Màu xanh đậm) | - Nút CTA chính nổi bật: *"Đặt phòng ngay"*.<br>- **Action:** Kiểm tra trạng thái phòng còn trống và điều hướng người dùng sang `[SMART-88] Checkout & Payment`. |

---

## 📢 3. HỆ THỐNG PHẢN HỒI & THÔNG BÁO (COMMON MESSAGES MATRIX)

Hệ thống sẽ được trang bị component `Toast` và `LoadingOverlay` chuẩn hóa để hiển thị 8 mã thông báo theo yêu cầu:

| Mã phản hồi (ID) | Loại phản hồi (Type) | Nội dung thông báo | Vị trí & Thời gian | Điều kiện kích hoạt |
|:---:|:---:|:---|:---:|:---|
| **CR_BOOK_01** | Toast Notification (Success) | *"Đã thêm phòng vào danh sách yêu thích"* | Dưới đáy màn hình, tự ẩn sau **2.5s** | Bấm icon Trái tim (Wishlist) khi phòng chưa được thích. |
| **CR_BOOK_02** | Toast Notification (Info) | *"Đã xóa phòng khỏi danh sách yêu thích"* | Dưới đáy màn hình, tự ẩn sau **2.5s** | Bấm icon Trái tim khi phòng đang ở trạng thái đã thích. |
| **CR_BOOK_03** | Toast Notification (Error) | *"Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền."* | Dưới đáy màn hình, tự ẩn sau **3.0s** | Mất mạng hoặc API timeout khi tải chi tiết phòng/tạo đơn. |
| **CR_BOOK_04** | Inline Warning / Toast | *"Vui lòng điền đầy đủ và chính xác thông tin liên hệ."* | Dưới đáy màn hình hoặc dưới ô input bị lỗi | Bỏ trống Họ tên, SĐT hoặc nhập sai email tại bước đặt phòng/thanh toán. |
| **CR_BOOK_05** | Loading Overlay | *"Đang xử lý đặt phòng và xác nhận thanh toán an toàn..."* | Toàn màn hình (Full-screen overlay kèm Spinner) | Ngay sau khi người dùng nhấn nút *"Xác nhận & Thanh toán"*. |
| **CR_BOOK_06** | Toast Notification (Success) | *"Đã sao chép mã đặt phòng vào bộ nhớ tạm"* | Dưới đáy màn hình, tự ẩn sau **2.0s** | Bấm icon sao chép cạnh mã booking `ST-5894` trên vé e-Pass. |
| **CR_BOOK_07** | Alert Dialog | *"Rất tiếc, phòng này vừa được khách khác đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương."* | Popup giữa màn hình kèm nút `[Xem phòng khác]` | Server trả về lỗi conflict (phòng đã có người đặt trong ngày chọn). |
| **CR_BOOK_08** | Toast Notification (Info) | *"Đang tạo lịch trình du lịch đồng bộ với phòng của bạn..."* | Dưới đáy màn hình, tự ẩn sau **2.5s** | Bấm nút *"Tạo Lịch trình Chuyến đi"* từ vé e-Pass để chuyển sang AI Planner. |

---

## 🛠️ 4. KIẾN TRÚC KỸ THUẬT & TỔ CHỨC FILE CODE (DỰ KIẾN TRIỂN KHAI)

1. **`mobile-app/src/screens/HomeDetailsScreen.js`:**
   - Màn hình chính chứa toàn bộ 17 sections, tích hợp `Animated.ScrollView`, Sticky Bottom Bar, cuộn mượt đến Reviews và liên kết Map.
2. **`mobile-app/src/components/ToastNotification.js`:**
   - Component Toast tái sử dụng toàn app, hỗ trợ hiệu ứng trượt mượt mà (Fade/Slide), tự ẩn theo thời gian động (`duration: 2.0s - 3.0s`) và màu sắc tương ứng (Success xanh lá, Info xanh dương, Error đỏ).
3. **`mobile-app/src/components/LoadingOverlay.js`:**
   - Full-screen Spinner overlay mờ nền cho mã `CR_BOOK_05`.
4. **`mobile-app/App.js`:**
   - Đăng ký màn hình `HomeDetails` vào hệ thống React Navigation.

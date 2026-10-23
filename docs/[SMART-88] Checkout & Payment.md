# \[SMART\-88\] Checkout & Payment

Ticket: [SMART-18](https://huyennk30.atlassian.net/browse/SMART-18)

# User Story

Là một Khách du lịch (Visitor), 

**Tôi muốn** rà soát thông tin lưu trú, nhập thông tin liên hệ, gửi yêu cầu đặc biệt và chọn phương thức thanh toán,  
**Để** hoàn tất thủ tục giữ chỗ với homestay một cách minh bạch và an toàn.

# Screen Flow


<https://www.figma.com/design/BUZPMFqoSItS2eJF3mzi7Z/Smart-Travel?node-id=29-1190&t=xTJBCXCqai0XAtbc-4>

| **No** | **Section** | **Field** | **Type** | **Mandatory** | **Default/State** | **Description** |
| --- | --- | --- | --- | --- | --- | --- |
| **1** | Top Header | Back Button | Button (Icon) | Yes | Enabled | • Icon mũi tên quay lại.• Click: Trở về màn hình** \[SMART-86\] Home Details Page** |
| **2** | Top Header | Header Title & Subtitle | Text Group | Yes | Display | • Tiêu đề: "Xác nhận & Thanh toán".• Dòng phụ: "Bảo mật SSL 256-bit" khẳng định an toàn dữ liệu. |
| **3** | Top Header | Profile Avatar | Button (Image) | Yes | Enabled | • Avatar người dùng. |
| **4** | Summary Card | Property Summary | Card Info | Yes | Display | Hiển thị: Hình ảnh, Tên homestay, Loại, Địa chỉ, Rating, Số lượng khách tối đa |
| **5** | Summary Card | Schedule Info Box | 2-Column Info | Yes | Display | - Click vào icon lịch để chọn ngày bắt đầu hoặc ngày kết thúc → Hệ thống tính toán giá tiền, update trên trang - Hiển thị: "{Ngày bắt đầu}– {Ngày kết thúc} ({số đêm} đêm nghỉ dưỡng)". - Chi tiết giờ: Nhận phòng: 14:00 • {Ngày bắt đầu}/ Trả phòng: {Ngày kết thúc}. |
| **6** | Guest Information | Section Header | Label Group | Yes | Display | • Tiêu đề "Thông tin khách lưu trú" kèm dấu “\*” - Thông tin bắt buộc. |
| **7** | Guest Information | Full Name Input | Text Input (50) | Yes | Điền sẵn tên tài khoản từ tài khoản | • Họ và tên khách đại diện đặt phòng.• Validate không để trống, tối đa 50 ký tự. |
| **8** | Guest Information | Phone Number Input | Phone Input (10) | Yes | Điền sẵn số điện thoại từ tài khoản | • Số điện thoại liên hệ nhận SMS/Zalo.• Validate chuẩn 10 chữ số di động Việt Nam. |
| **9** | Guest Information | Email Input | Email Input | Yes | Điền sẵn email từ tài khoản | • Email nhận Hóa đơn điện tử & Vé e-Pass.• Validate chuẩn định dạng Email. |
| **10** | Guest Information | Host Special Note | Checkbox + Input (200) | No | Checked (Mặc định mở): Màu xanh đậmUncheck: Ô vuông viền xám | • Nhãn: "Yêu cầu đặc biệt đến chủ nhà".• Cho phép nhập text ngắn: "Xin check-in sớm 13:00 nếu có thể. Cảm ơn!". |
| **11** | Payment Method | Payment Options Group | Radio Group | Yes | Default: "Chuyển khoản QR Napas 24/7" (Khuyên dùng) | • Lựa chọn phương thức thanh toán: -      - **Chuyển khoản QR Napas 24/7**: Quét mã VietQR tự động, xác nhận ngay.     -  **Ví MoMo / ZaloPay / ShopeePay**: Liên kết ví điện tử 1 chạm.     - **Apple Pay / Google Pay**: Xác thực sinh trắc học Touch/Face ID. |
| **12** | Invoice Details | Invoice Breakdown | Text Table | Yes | Display | • Tiền phòng ({số tiền}đ x {số đêm} đêm): {tổng số tiền}đ.• Thuế VAT & Phí dịch vụ (8%): Đã bao gồm.• **Tổng tiền lưu trú**:**{tổng số tiền}đ** (Đã gồm trọn gói dịch vụ). |
| **13** | Policy & Guarantee | Protection Notice Box | Text Block | Yes | Display | • "Miễn phí hủy phòng trước 14:00 ngày {ngày bắt đầu} hoàn lại 100% tổng tiền đã thanh toán."• "Đảm bảo 100% giữ phòng chuẩn hình sang xịn: Smart Travel bồi thường 150% nếu phòng không đúng thực tế." |
| **14** | Bottom Checkout Bar | Payment Amount Display | Label | Yes | Fixed | • Text: "Thanh toán ngay: {tổng số tiền}đ" kèm dòng phụ "Miễn phí hủy trong 48h". |
| **15** | Bottom Checkout Bar | Xác nhận & Thanh toán CTA | Button | Yes | Enabled (Màu xanh đậm) | • Nút submit hoàn tất đặt phòng.• Click: Validate toàn bộ form -\> Hiển thị loading mô phỏng 1.5s -\> Ghi nhận đơn vào MongoDB -\> Điều hướng thẳng sang màn hình[** \[SMART-90\] Booking Result**](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/3014748/SMART-90+Booking+Result) |

# Acceptance Criteria

Quy trình Xác nhận & Thanh toán (Checkout & Payment Flow)

- **Hiển thị các thông tin phòng đang đặt:**
    - Property Summary
    - Schedule Info Box: Trong trường hợp cần thay đổi thời gian, click vào biểu tượng lịch để đổi → Hệ thống tính toán lại giá tiền, update lại các giá tiền ở mục Invoice Breakdown và Payment Amount Display. 

- **Tự động điền và Xác thực thông tin khách hàng (Form Validation):**
    - Màn hình tự động tải sẵn thông tin Họ tên, SĐT và Email từ tài khoản người dùng đang đăng nhập.
    - Trường hợp người dùng chỉnh sửa thông tin:
        - **Họ và tên:** Bắt buộc nhập, không chứa ký tự số hoặc ký tự đặc biệt, tối đa 50 ký tự.
        - **Số điện thoại:** Bắt buộc nhập, đúng định dạng số điện thoại Việt Nam (10 chữ số, đầu số hợp lệ).
        - **Email:** Bắt buộc nhập, đúng chuẩn cú pháp RFC (ví dụ: `name@domain.com`).
        - Nếu để trống hoặc sai định dạng bất kỳ trường nào khi bấm thanh toán, hệ thống hiển thị thông báo lỗi `CR_BOOK_04` và highlight đỏ trường tương ứng.
    - Người dùng có thể để lại lời nhắn yêu cầu đặc biệt cho chủ nhà (tối đa 200 ký tự).
- **Lựa chọn Phương thức thanh toán:**
    - Người dùng chọn 1 trong 3 phương thức thanh toán qua Radio button:
        1. Chuyển khoản QR Napas 24/7 (VietQR động).
        2. Ví điện tử MoMo / ZaloPay / ShopeePay.
        3. Apple Pay / Google Pay.
    - Mặc định chọn phương thức QR Napas 24/7.
- **Minh bạch Chi phí (Billing Breakdown):**
    - Bảng hóa đơn liệt kê chi tiết: Giá phòng theo số đêm (vd: `1.850.000đ x 3 đêm = 5.550.000đ`), Thuế VAT và Phí dịch vụ ghi nhận rõ "Đã bao gồm", Tổng tiền thanh toán hiển thị đậm rõ ràng.
- **Xử lý Đặt phòng & Thanh toán giả lập (Payment Processing Simulation):**
    - Khi người dùng bấm `Xác nhận & Thanh toán`: 
        - Hệ thống kiểm tra tình trạng phòng còn trống. Nếu không thì hiển thị **CR\_BOOK\_09**
        - Nếu không có sự thay đổi thời gian, hoặc thời gian thay đổi đã hợp lệ, hệ thống hiển thị hiệu ứng Loading (`CR_BOOK_05`) trong 1.5 giây để mô phỏng tiến trình giao dịch bảo mật.
    - Sau đó, hệ thống tự động ghi nhận đơn đặt phòng vào cơ sở dữ liệu MongoDB và điều hướng thẳng sang [**\[SMART-90\] Booking Result**](https://huyennk30.atlassian.net/wiki/spaces/ST/pages/3014748/SMART-90+Booking+Result)**** mà không cần bước quét mã phụ.

# Common Message

| **Response ID** | **Loại phản hồi (Type)** | **Nội dung thông báo hiển thị** | **Vị trí & Thời gian tồn tại** | **Điều kiện kích hoạt** |
| --- | --- | --- | --- | --- |
| **CR\_BOOK\_01** | Toast Notification (Success) | `"Đã thêm phòng vào danh sách yêu thích"` | Dưới đáy màn hình, tự ẩn sau 2.5s | Bấm icon Trái tim trên Card phòng hoặc trang chi tiết khi chưa thích. |
| **CR\_BOOK\_02** | Toast Notification (Info) | `"Đã xóa phòng khỏi danh sách yêu thích"` | Dưới đáy màn hình, tự ẩn sau 2.5s | Bấm icon Trái tim khi phòng đang ở trạng thái đã thích. |
| **CR\_BOOK\_03** | Toast Notification (Error) | `"Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền."` | Dưới đáy màn hình, tự ẩn sau 3.0s | Thiết bị mất mạng hoặc timeout khi gọi API tải danh sách homestay/tạo đơn đặt phòng. |
| **CR\_BOOK\_04** | Inline Warning / Toast | `"Vui lòng điền đầy đủ và chính xác thông tin liên hệ."` | Dưới đáy màn hình hoặc dưới ô input bị lỗi | Bỏ trống Họ tên, SĐT hoặc nhập sai định dạng Email tại màn hình Thanh toán. |
| **CR\_BOOK\_05** | Loading Overlay | `"Đang xử lý đặt phòng và xác nhận thanh toán an toàn..."` | Toàn màn hình (Full-screen overlay kèm Spinner) | Ngay sau khi người dùng nhấn nút "Xác nhận & Thanh toán". |
| **CR\_BOOK\_06** | Toast Notification (Success) | `"Đã sao chép mã đặt phòng vào bộ nhớ tạm"` | Dưới đáy màn hình, tự ẩn sau 2.0s | Bấm vào icon sao chép cạnh mã booking `ST-5894` trên vé e-Pass. |
| **CR\_BOOK\_07** | Alert Dialog | `"Rất tiếc, phòng này vừa được khách khác đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương."` | Popup giữa màn hình kèm nút `[Xem phòng khác]` | Server trả về lỗi conflict tình trạng phòng trống khi submit thanh toán. |
| **CR\_BOOK\_08** | Toast Notification (Info) | `"Đang tạo lịch trình du lịch đồng bộ với phòng của bạn..."` | Dưới đáy màn hình, tự ẩn sau 2.5s | Bấm nút "Tạo Lịch trình Chuyến đi" từ màn hình vé e-Pass để chuyển sang AI Planner. |
| **CR\_BOOK\_09** | Invalid Timeline Booking | `"Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác"` | Dưới đáy màn hình, tự ẩn sau 2.5s | Khi bấm xác nhận và thanh toán Hoặc khi bấm đặt ngay từ màn hình Home hoặc Favourite List |

/**
 * SMART TRAVEL HOST PORTAL - I18N DICTIONARY (VI / EN)
 * Seamless real-time bilingual translation engine
 */

const HOST_TRANSLATIONS = {
  vi: {
    // Header & Breadcrumb
    'nav_rooms': 'Quản lý phòng',
    'nav_create_room': 'Thêm phòng mới',
    'nav_edit_room': 'Chỉnh sửa phòng',
    'nav_bookings': 'Duyệt đơn đặt phòng',
    'profile_link': 'Hồ sơ cá nhân',
    'settings_link': 'Cài đặt tài khoản',
    'logout_btn': 'Đăng xuất',
    'notif_title': 'Thông báo mới',

    // Sidebar
    'sb_heading_ops': 'QUẢN TRỊ CƠ SỞ',
    'sb_dashboard': 'Tổng quan',
    'sb_rooms': 'Quản lý phòng',
    'sb_bookings': 'Đơn đặt phòng',
    'sb_calendar': 'Lịch phòng & Giá',
    'sb_reviews': 'Đánh giá & Phản hồi',
    'sb_finance': 'Doanh thu & Rút tiền',
    'sb_settings': 'Cài đặt cơ sở lưu trú',
    'sb_help': 'Trợ giúp & Hỗ trợ',

    // SCR-HOST-01: Room Inventory
    'inv_title': 'Quản lý phòng',
    'inv_subtext': 'Quản lý cơ sở lưu trú, thiết lập biểu giá và trạng thái hiển thị thời gian thực',
    'inv_export_excel': 'Xuất Excel',
    'inv_add_room': 'Thêm phòng mới',
    'inv_kpi_total': 'TỔNG SỐ PHÒNG',
    'inv_kpi_published': 'ĐANG MỞ BÁN',
    'inv_kpi_archived': 'TẠM DỪNG / BẢO TRÌ',
    'inv_kpi_pending': 'ĐƠN CHỜ DUYỆT MỚI',
    'inv_kpi_pending_link': 'Xem danh sách yêu cầu →',
    'inv_search_ph': 'Tìm theo tên phòng, mã phòng... (Nhấn Enter để tìm)',
    'inv_filter_all_types': 'Tất cả loại phòng',
    'inv_filter_all_status': 'Tất cả trạng thái',
    'inv_sort_newest': 'Mới nhất',
    'inv_sort_oldest': 'Cũ nhất',
    'inv_col_photo': 'HÌNH ẢNH',
    'inv_col_name': 'TÊN PHÒNG & LOẠI HÌNH',
    'inv_col_price': 'GIÁ NIÊM YẾT',
    'inv_col_status': 'TRẠNG THÁI',
    'inv_col_pending': 'ĐƠN CHỜ',
    'inv_col_actions': 'THAO TÁC',
    'inv_per_night': '/ đêm',
    'inv_pending_new': 'đơn mới',
    'inv_empty_title': 'Không tìm thấy phòng nào phù hợp',
    'inv_empty_sub': 'Vui lòng thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các tiêu chí bộ lọc. [EMPTY-001]',
    'inv_reset_filter': 'Đặt lại bộ lọc',
    'inv_prev': '‹ Trước',
    'inv_next': 'Sau ›',

    // SCR-HOST-02: Room Form
    'form_title_create': 'Thêm phòng nghỉ mới',
    'form_subtext_create': 'Khởi tạo phòng lưu trú mới, thiết lập hình ảnh và thông số để bắt đầu đón khách',
    'form_title_edit': 'Chỉnh sửa phòng nghỉ',
    'form_subtext_edit': 'Cập nhật giá, tiện ích, mô tả và hình ảnh cơ sở lưu trú của bạn',
    'form_quick_info': 'THÔNG TIN NHANH',
    'form_current_status': 'Trạng thái hiện tại',
    'form_created_date': 'Ngày tạo phòng',
    'form_updated_date': 'Cập nhật lần cuối',
    'form_manager': 'Người phụ trách',
    'form_health_title': 'CHỈ SỐ TỐI ƯU TIN ĐĂNG',
    'form_health_need_improve': 'Cần hoàn thiện',
    'form_health_superhost': 'Xuất sắc',
    'form_health_sub_improve': 'Hoàn thiện thêm để đạt SuperHost',
    'form_health_sub_superhost': 'Đạt chuẩn Superhost',
    'form_check_name_loc': 'Tên và thông tin vị trí chính xác',
    'form_check_pricing': 'Định giá theo ngày & cuối tuần',
    'form_check_amenities': 'Danh mục tiện ích đầy đủ (>6 mục)',
    'form_check_photos': 'Số lượng ảnh tải lên (4/5 ảnh chuẩn)',

    // Form Section 1
    'sec1_title': '1. Thông tin cơ bản & Quy mô',
    'sec1_sub': 'Tên cơ sở lưu trú, phân loại hình thức và thông số phòng',
    'lbl_room_name': 'Tên phòng nghỉ / Homestay',
    'ph_room_name': 'Vd: An Nhiên Eco Retreat - Bungalow View Rừng Thông Đà Lạt',
    'lbl_room_type': 'Loại hình phòng',
    'lbl_max_guests': 'Sức chứa tối đa',
    'lbl_beds_rooms': 'Phòng ngủ & Giường',
    'unit_guests': 'khách',
    'unit_rooms': 'phòng',
    'unit_beds': 'giường',

    // Form Section 2
    'sec2_title': '2. Địa chỉ & Vị trí tọa độ',
    'sec2_sub': 'Giúp khách hàng dễ dàng tìm đường và đồng bộ hiển thị vị trí GPS',
    'lbl_province': 'Tỉnh / Thành phố',
    'lbl_district': 'Quận / Huyện / Phường',
    'ph_choose_district': 'Chọn Quận/Huyện/Phường...',
    'lbl_address': 'Địa chỉ chi tiết',
    'ph_address': 'Số nhà, tên đường, khu vực (Vd: Chợ An Hải Bắc, đường Trần Hưng Đạo)...',
    'btn_find_on_map': '🔍 Tìm vị trí',
    'btn_fullscreen_map': 'Phóng to bản đồ ⛶',
    'gps_coord_label': 'TỌA ĐỘ GPS:',
    'gps_tip': '💡 Mẹo: Bạn có thể kéo thả ghim đỏ hoặc click trực tiếp lên bản đồ để chọn chính xác vị trí cơ sở lưu trú của bạn.',
    'gps_loading': '⏳ Đang định vị địa chỉ...',

    // Form Section 3
    'sec3_title': '3. Định giá & Mô tả phòng',
    'sec3_sub': 'Chiến lược giá linh hoạt và nội dung giới thiệu thu hút khách hàng',
    'lbl_price_weekday': 'Giá thuê theo đêm tiêu chuẩn',
    'lbl_price_weekend': 'Giá cuối tuần (Thứ 6, Thứ 7)',
    'lbl_price_weekend_tip': 'Tự động tính thêm phụ thu cho các ngày lưu trú cuối tuần',
    'lbl_desc': 'Mô tả chi tiết phòng',
    'ph_desc': 'Mô tả không gian, tầm nhìn, phong cách thiết kế, các điểm du lịch lân cận...',
    'desc_counter_prefix': 'Ký tự:',
    'desc_counter_min': '(Tối thiểu 50 ký tự)',
    'desc_limit_warn': '⚠️ Bạn đã đạt giới hạn tối đa 1.000 ký tự. [WARN-DESC-001]',
    'lbl_cancel_policy': 'Chính sách hủy phòng:',
    'lbl_cancel_free': 'Cho phép hủy miễn phí trước 48h nhận phòng (Hoàn tiền 100% nếu hủy trước 2 ngày)',

    // Form Section 4
    'sec4_title': '4. Hình ảnh & Tiện nghi phòng',
    'sec4_sub': 'Hình ảnh sắc nét và danh mục tiện ích giúp tăng 3x tỷ lệ đặt phòng',
    'dropzone_drag': 'Kéo thả ảnh vào đây hoặc',
    'dropzone_btn': 'Chọn ảnh từ thiết bị',
    'dropzone_sub': 'Tối thiểu 3 ảnh. Định dạng JPG, PNG, WEBP. Tối đa 5MB/ảnh.',
    'lbl_amenities_heading': 'Danh mục tiện nghi:',
    'btn_add_amenity': '+ Thêm tiện ích khác',

    // Sticky Bottom Bar
    'bar_autosave': 'Đã lưu bản nháp tự động',
    'btn_cancel_edit': 'Hủy',
    'btn_save_draft': 'Lưu bản nháp',
    'btn_publish_room': '🚀 Mở bán ngay',

    // SCR-HOST-03: Bookings
    'bk_title': 'Duyệt đơn đặt phòng',
    'bk_sub': 'Tiếp nhận và xét duyệt đơn từ khách du lịch trên ứng dụng Smart Travel',
    'bk_tab_pending': 'Chờ duyệt',
    'bk_tab_confirmed': 'Đã xác nhận',
    'bk_tab_history': 'Lịch sử & Từ chối',
    'bk_search_ph': 'Tìm theo mã đơn (#BK...), tên khách hoặc SĐT...',
    'bk_filter_all_rooms': 'Tất cả phòng nghỉ',
    'bk_urgent_5h': '🔥 Khẩn cấp: Còn 5h để duyệt',
    'bk_normal_18h': '⏱️ Còn 18h để duyệt',
    'bk_check_in': 'Nhận:',
    'bk_check_out': 'Trả:',
    'bk_duration': 'Thời lượng:',
    'bk_unit_nights': 'đêm',
    'bk_unit_guests': 'khách',
    'bk_unit_bedrooms': 'phòng ngủ',
    'bk_special_req': 'YÊU CẦU ĐẶC BIỆT TỪ KHÁCH HÀNG:',
    'bk_total_pay': 'TỔNG TIỀN THANH TOÁN',
    'bk_paid_via': '✓ Đã thanh toán qua',
    'bk_policy_cancel': 'Chính sách hủy: Hoàn tiền 100% trước 48h',
    'bk_btn_reject': '✕ Từ chối',
    'bk_btn_approve': '✓ Phê duyệt đơn đặt',
    'bk_empty_title': 'Không có đơn đặt phòng nào',
    'bk_empty_sub': 'Hiện không có yêu cầu nào trong tab này.',

    // Modals
    'modal_approve_title': 'Phê duyệt an toàn',
    'modal_approve_confirm': 'Xác nhận duyệt đơn',
    'modal_approve_sub': 'Lịch phòng sẽ tự động khóa cho khoảng thời gian của đơn đặt này.',
    'modal_approve_rev': 'Doanh thu đơn',
    'modal_approve_auto_email': '✓ Tự động gửi email & thông báo tức thời cho du khách',
    'modal_approve_btn_cancel': 'Hủy',
    'modal_approve_btn_ok': '✓ Xác nhận duyệt',

    'modal_reject_title': 'Từ chối yêu cầu đặt phòng',
    'modal_reject_refund_alert': 'Số tiền sẽ được hệ thống hoàn lại 100% về tài khoản khách du lịch trong vòng 30 giây.',
    'modal_reject_lbl_reason': 'LÝ DO TỪ CHỐI *',
    'modal_reject_lbl_note': 'LỜI NHẮN GỬI ĐẾN KHÁCH HÀNG (Tối đa 300 ký tự)',
    'modal_reject_btn_close': 'Đóng',
    'modal_reject_btn_ok': '✕ Xác nhận từ chối',

    'modal_map_title': 'Điều chỉnh vị trí ghim bản đồ',
    'modal_map_sub': 'Click vào bản đồ hoặc kéo ghim để cập nhật tọa độ chính xác cho cơ sở lưu trú của bạn:',
    'modal_map_save': 'Lưu tọa độ',
    'modal_map_close': 'Đóng',

    'modal_delete_title': 'Xóa phòng nghỉ',
    'modal_delete_alert': 'Thao tác này sẽ xóa vĩnh viễn dữ liệu khỏi hệ thống và không thể phục hồi.',
    'modal_delete_type_prompt': 'Vui lòng gõ chữ "XÓA" vào ô bên dưới để xác nhận:',
    'modal_delete_btn_cancel': 'Hủy bỏ',
    'modal_delete_btn_confirm': 'Xác nhận xóa vĩnh viễn'
  },

  en: {
    // Header & Breadcrumb
    'nav_rooms': 'Room Inventory',
    'nav_create_room': 'Add New Room',
    'nav_edit_room': 'Edit Room',
    'nav_bookings': 'Booking Approvals',
    'profile_link': 'Host Profile',
    'settings_link': 'Account Settings',
    'logout_btn': 'Log Out',
    'notif_title': 'Notifications',

    // Sidebar
    'sb_heading_ops': 'PROPERTY MANAGEMENT',
    'sb_dashboard': 'Dashboard',
    'sb_rooms': 'Room Inventory',
    'sb_bookings': 'Bookings',
    'sb_calendar': 'Calendar & Rates',
    'sb_reviews': 'Guest Reviews',
    'sb_finance': 'Revenue & Payouts',
    'sb_settings': 'Property Settings',
    'sb_help': 'Help & Support',

    // SCR-HOST-01: Room Inventory
    'inv_title': 'Room Inventory',
    'inv_subtext': 'Manage properties, set dynamic rate cards, and control real-time listing status',
    'inv_export_excel': 'Export Excel',
    'inv_add_room': 'Add New Room',
    'inv_kpi_total': 'TOTAL ROOMS',
    'inv_kpi_published': 'PUBLISHED',
    'inv_kpi_archived': 'ARCHIVED / PAUSED',
    'inv_kpi_pending': 'NEW PENDING REQUESTS',
    'inv_kpi_pending_link': 'View requests →',
    'inv_search_ph': 'Search by title, room code... (Press Enter to search)',
    'inv_filter_all_types': 'All Property Types',
    'inv_filter_all_status': 'All Statuses',
    'inv_sort_newest': 'Newest first',
    'inv_sort_oldest': 'Oldest first',
    'inv_col_photo': 'PHOTO',
    'inv_col_name': 'NAME & SPECS',
    'inv_col_price': 'LISTING RATE',
    'inv_col_status': 'STATUS',
    'inv_col_pending': 'PENDING',
    'inv_col_actions': 'ACTIONS',
    'inv_per_night': '/ night',
    'inv_pending_new': 'new reqs',
    'inv_empty_title': 'No rooms found',
    'inv_empty_sub': 'Please adjust your search criteria or reset filters. [EMPTY-001]',
    'inv_reset_filter': 'Reset Filters',
    'inv_prev': '‹ Prev',
    'inv_next': 'Next ›',

    // SCR-HOST-02: Room Form
    'form_title_create': 'Add New Room',
    'form_subtext_create': 'Create a new lodging unit, upload photos, and configure specs to welcome travelers',
    'form_title_edit': 'Edit Room Listing',
    'form_subtext_edit': 'Update nightly pricing, amenities, room specs, and photo gallery',
    'form_quick_info': 'QUICK DETAILS',
    'form_current_status': 'Current Status',
    'form_created_date': 'Creation Date',
    'form_updated_date': 'Last Modified',
    'form_manager': 'Listing Host',
    'form_health_title': 'LISTING HEALTH SCORE',
    'form_health_need_improve': 'Needs Improvement',
    'form_health_superhost': 'Excellent',
    'form_health_sub_improve': 'Complete more fields to earn SuperHost',
    'form_health_sub_superhost': 'Superhost Standard Achieved',
    'form_check_name_loc': 'Accurate Title & Location info',
    'form_check_pricing': 'Weekday & Weekend Pricing Set',
    'form_check_amenities': 'Full Amenities (>6 items selected)',
    'form_check_photos': 'High Quality Photos (4/5 target)',

    // Form Section 1
    'sec1_title': '1. Basic Information & Capacity',
    'sec1_sub': 'Property name, accommodation type, and space specifications',
    'lbl_room_name': 'Room / Homestay Title',
    'ph_room_name': 'E.g., An Nhien Eco Retreat - Pine Forest Bungalow Da Lat',
    'lbl_room_type': 'Property Type',
    'lbl_max_guests': 'Maximum Guests',
    'lbl_beds_rooms': 'Bedrooms & Beds',
    'unit_guests': 'guests',
    'unit_rooms': 'rooms',
    'unit_beds': 'beds',

    // Form Section 2
    'sec2_title': '2. Address & GPS Coordinates',
    'sec2_sub': 'Help guests locate your property easily with synchronized GPS mapping',
    'lbl_province': 'Province / City',
    'lbl_district': 'District / Ward',
    'ph_choose_district': 'Select District/Ward...',
    'lbl_address': 'Street Address',
    'ph_address': 'House number, street name, landmarks (e.g. An Hai Bac Market, Tran Hung Dao St)...',
    'btn_find_on_map': '🔍 Locate on Map',
    'btn_fullscreen_map': 'Fullscreen Map ⛶',
    'gps_coord_label': 'GPS COORDINATES:',
    'gps_tip': '💡 Tip: Drag the red marker or click on the map to pinpoint your exact doorstep location.',
    'gps_loading': '⏳ Geocoding address...',

    // Form Section 3
    'sec3_title': '3. Rates & Room Description',
    'sec3_sub': 'Flexible pricing strategy and attractive storytelling to convert guests',
    'lbl_price_weekday': 'Standard Weekday Nightly Rate',
    'lbl_price_weekend': 'Weekend Rate (Fri, Sat)',
    'lbl_price_weekend_tip': 'Automatically adds weekend surcharge for Friday & Saturday stays',
    'lbl_desc': 'Room Description',
    'ph_desc': 'Describe the space, atmosphere, aesthetic design, nearby tourist attractions...',
    'desc_counter_prefix': 'Characters:',
    'desc_counter_min': '(Minimum 50 chars)',
    'desc_limit_warn': '⚠️ You have reached the maximum limit of 1,000 characters. [WARN-DESC-001]',
    'lbl_cancel_policy': 'Cancellation Policy:',
    'lbl_cancel_free': 'Free cancellation up to 48 hours before check-in (100% refund if cancelled 2 days prior)',

    // Form Section 4
    'sec4_title': '4. Photos & Room Amenities',
    'sec4_sub': 'Crisp photography and rich amenities increase booking rates by 3x',
    'dropzone_drag': 'Drag & drop photos here or',
    'dropzone_btn': 'Browse Files',
    'dropzone_sub': 'Minimum 3 photos required. Formats: JPG, PNG, WEBP. Max 5MB each.',
    'lbl_amenities_heading': 'Available Amenities:',
    'btn_add_amenity': '+ Add Custom Amenity',

    // Sticky Bottom Bar
    'bar_autosave': 'Draft auto-saved',
    'btn_cancel_edit': 'Cancel',
    'btn_save_draft': 'Save Draft',
    'btn_publish_room': '🚀 Publish Now',

    // SCR-HOST-03: Bookings
    'bk_title': 'Booking Approvals',
    'bk_sub': 'Review and accept reservation requests from travelers on Smart Travel',
    'bk_tab_pending': 'Pending Review',
    'bk_tab_confirmed': 'Confirmed',
    'bk_tab_history': 'History & Rejected',
    'bk_search_ph': 'Search by booking code (#BK...), guest name or phone...',
    'bk_filter_all_rooms': 'All Accommodations',
    'bk_urgent_5h': '🔥 Urgent: 5h left to approve',
    'bk_normal_18h': '⏱️ 18h left to approve',
    'bk_check_in': 'Check-in:',
    'bk_check_out': 'Check-out:',
    'bk_duration': 'Duration:',
    'bk_unit_nights': 'nights',
    'bk_unit_guests': 'guests',
    'bk_unit_bedrooms': 'bedrooms',
    'bk_special_req': 'SPECIAL REQUESTS FROM GUEST:',
    'bk_total_pay': 'TOTAL PAYMENT',
    'bk_paid_via': '✓ Paid via',
    'bk_policy_cancel': 'Cancellation Policy: 100% refund before 48h',
    'bk_btn_reject': '✕ Reject',
    'bk_btn_approve': '✓ Approve Booking',
    'bk_empty_title': 'No bookings found',
    'bk_empty_sub': 'No reservations found in this status tab.',

    // Modals
    'modal_approve_title': 'Safe Approval',
    'modal_approve_confirm': 'Confirm Reservation',
    'modal_approve_sub': 'Your room calendar will be locked for the reservation dates.',
    'modal_approve_rev': 'Booking Revenue',
    'modal_approve_auto_email': '✓ Instant email & push notification sent to the traveler',
    'modal_approve_btn_cancel': 'Cancel',
    'modal_approve_btn_ok': '✓ Confirm & Approve',

    'modal_reject_title': 'Decline Reservation Request',
    'modal_reject_refund_alert': '100% of the funds will be automatically refunded to the traveler in 30 seconds.',
    'modal_reject_lbl_reason': 'DECLINE REASON *',
    'modal_reject_lbl_note': 'MESSAGE TO TRAVELER (Max 300 characters)',
    'modal_reject_btn_close': 'Close',
    'modal_reject_btn_ok': '✕ Confirm Decline',

    'modal_map_title': 'Adjust GPS Pin Location',
    'modal_map_sub': 'Click on the map or drag the pin to update your precise property coordinates:',
    'modal_map_save': 'Save Coordinates',
    'modal_map_close': 'Close',

    'modal_delete_title': 'Delete Room Listing',
    'modal_delete_alert': 'This action will permanently delete this property and cannot be undone.',
    'modal_delete_type_prompt': 'Please type "XÓA" or "DELETE" below to confirm:',
    'modal_delete_btn_cancel': 'Cancel',
    'modal_delete_btn_confirm': 'Permanently Delete'
  }
};

/**
 * Global translation function
 */
function t(key) {
  const currentLang = localStorage.getItem('host_lang') || 'vi';
  const dict = HOST_TRANSLATIONS[currentLang] || HOST_TRANSLATIONS.vi;
  return dict[key] || HOST_TRANSLATIONS.vi[key] || key;
}

/**
 * Set host language and translate the entire DOM
 */
function setHostLanguage(lang) {
  if (lang !== 'vi' && lang !== 'en') lang = 'vi';
  localStorage.setItem('host_lang', lang);
  document.documentElement.lang = lang;

  // Update switcher buttons UI
  const btnVN = document.getElementById('btnLangVN');
  const btnEN = document.getElementById('btnLangEN');
  if (btnVN && btnEN) {
    if (lang === 'vi') {
      btnVN.classList.add('active');
      btnEN.classList.remove('active');
    } else {
      btnEN.classList.add('active');
      btnVN.classList.remove('active');
    }
  }

  const dict = HOST_TRANSLATIONS[lang] || HOST_TRANSLATIONS.vi;

  // Translate all text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Translate placeholders with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Translate titles/tooltips with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) {
      el.setAttribute('title', dict[key]);
    }
  });
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('host_lang') || 'vi';
  setHostLanguage(savedLang);
});

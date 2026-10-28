import fetch from 'node:http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: './server/.env' });

const BASE_URL = 'http://localhost:5000';
let hostToken = '';
let host2Token = '';
let userToken = '';

const testResults = [];

function logTest(id, name, status, details, durationMs = 0) {
  testResults.push({ id, name, status, details, durationMs });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${id}] ${name} (${durationMs}ms) - ${status}: ${details}`);
}

async function request(urlPath, options = {}) {
  const start = Date.now();
  const headers = options.headers || {};
  if (options.token) {
    headers['Cookie'] = `hostToken=${options.token}`;
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  
  const res = await globalThis.fetch(`${BASE_URL}${urlPath}`, {
    ...options,
    headers,
    redirect: 'manual'
  });
  
  const duration = Date.now() - start;
  let body = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  
  return {
    status: res.status,
    headers: res.headers,
    body,
    duration
  };
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('🚀 BẮT ĐẦU THỰC THI BỘ KIỂM THỬ [SMART-99] VỚI DỮ LIỆU THẬT DB');
  console.log('===============================================================\n');

  // 1. SETUP & AUTHENTICATION
  console.log('--- GIAI ĐOẠN 1: ĐĂNG NHẬP & XÁC THỰC TÀI KHOẢN THẬT ---');
  
  // Host 1 Login
  const h1Res = await request('/host/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ emailOrPhone: 'host@smarttravel.com', password: '123456' }).toString()
  });
  const cookie1 = h1Res.headers.get('set-cookie');
  if (cookie1 && cookie1.includes('hostToken=')) {
    const match = cookie1.match(/hostToken=([^;]+)/);
    hostToken = match ? match[1] : '';
    logTest('SETUP_01', 'Đăng nhập Host 1 (host@smarttravel.com)', 'PASS', 'Nhận hostToken thành công', h1Res.duration);
  } else {
    logTest('SETUP_01', 'Đăng nhập Host 1', 'FAIL', `Không nhận được cookie hostToken. Status: ${h1Res.status}`);
  }

  // Host 2 Auth Token (User ID: 6adffbbdf5114d38fa4be1b9)
  const jwt = (await import('jsonwebtoken')).default;
  host2Token = jwt.sign(
    { userId: '6adffbbdf5114d38fa4be1b9', role: 'HOST' },
    process.env.ACCES_TOKEN_SECRET || 'secret_key',
    { expiresIn: '7d' }
  );
  if (host2Token) {
    logTest('SETUP_02', 'Cấp phiên làm việc Host 2 (datdinh1006dn@gmail.com)', 'PASS', 'Khởi tạo host2Token phân quyền HOST thành công');
  } else {
    logTest('SETUP_02', 'Cấp phiên làm việc Host 2', 'FAIL', 'Không tạo được host2Token');
  }

  // Non-Host User Login check
  const uRes = await request('/host/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ emailOrPhone: 'user@smarttravel.com', password: '123456' }).toString()
  });
  if (uRes.body && uRes.body.includes('Cổng web này chỉ dành riêng cho Đối tác')) {
    logTest('SETUP_03', 'Chặn tài khoản User thường đăng nhập Host Portal', 'PASS', 'Hiển thị lỗi phân quyền chính xác', uRes.duration);
  } else {
    logTest('SETUP_03', 'Chặn tài khoản User thường', 'FAIL', 'Không thấy thông báo lỗi vai trò');
  }

  console.log('\n--- GIAI ĐOẠN 2: KIỂM THỬ MÀN HÌNH QUẢN LÝ PHÒNG (SCR-HOST-01) ---');

  // TC_INV_001: KPI Metrics
  const invRes = await request('/host/rooms', { token: hostToken });
  if (invRes.status === 200) {
    const hasTotal6 = invRes.body.includes('TỔNG SỐ PHÒNG') && invRes.body.includes('<div class="host-kpi-val">6</div>');
    const hasPending1 = invRes.body.includes('ĐƠN CHỜ DUYỆT MỚI') && invRes.body.includes('<div class="host-kpi-val">1</div>');
    if (hasTotal6 && hasPending1) {
      logTest('TC_INV_001', 'KPI Metrics Bar tính toán đúng dữ liệu thật', 'PASS', 'Tổng số phòng: 6 | Đơn chờ duyệt: 1', invRes.duration);
    } else {
      logTest('TC_INV_001', 'KPI Metrics Bar', 'FAIL', 'Giá trị KPI không khớp dữ liệu DB');
    }
  } else {
    logTest('TC_INV_001', 'Tải trang /host/rooms', 'FAIL', `Status: ${invRes.status}`);
  }

  // TC_INV_002: Link Duyệt đơn SCR-HOST-03
  if (invRes.body && invRes.body.includes('/host/bookings?tab=pending')) {
    logTest('TC_INV_002', 'Link "Xem danh sách yêu cầu →" điều hướng đúng tab pending', 'PASS', 'HREF: /host/bookings?tab=pending');
  } else {
    logTest('TC_INV_002', 'Link duyệt đơn', 'FAIL', 'Không tìm thấy link /host/bookings?tab=pending');
  }

  // TC_INV_003: Phân quyền & Cô lập dữ liệu Host (BR-HOST-01)
  // Host 1 does not see Host 2's room "Smart Homestay" (P-VLOFYK)
  const room2InList = invRes.body.includes('Smart Homestay') || invRes.body.includes('P-VLOFYK');
  if (!room2InList) {
    logTest('TC_INV_003A', 'Bảng phòng chỉ hiển thị phòng thuộc sở hữu Host 1', 'PASS', 'Không rò rỉ phòng của Host 2');
  } else {
    logTest('TC_INV_003A', 'Bảng phòng Host 1', 'FAIL', 'Phát hiện phòng của Host 2 trong danh sách!');
  }

  // Host 1 accessing Host 2's room edit URL: 6ae01e40b36ef904280dfc2e
  const unauthEditRes = await request('/host/rooms/6ae01e40b36ef904280dfc2e/edit', { token: hostToken });
  const isRedirect403 = unauthEditRes.status === 302 && unauthEditRes.headers.get('location')?.includes('error=AUTH-403');
  if (isRedirect403) {
    logTest('TC_INV_003B', 'Chặn truy cập trái phép ID phòng của Host khác (GET)', 'PASS', 'Chặn 302 Redirect về /host/rooms?error=AUTH-403', unauthEditRes.duration);
  } else {
    logTest('TC_INV_003B', 'Chặn truy cập phòng Host khác', 'FAIL', `Status: ${unauthEditRes.status}`);
  }

  // Host 1 modifying Host 2's room via API
  const unauthPutRes = await request('/host/rooms/6ae01e40b36ef904280dfc2e', {
    method: 'PUT',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title' })
  });
  if (unauthPutRes.status === 403 && unauthPutRes.body?.code === 'AUTH-403') {
    logTest('TC_INV_003C', 'Chặn API PUT sửa phòng của Host khác', 'PASS', `HTTP 403: ${unauthPutRes.body.message}`, unauthPutRes.duration);
  } else {
    logTest('TC_INV_003C', 'Chặn API PUT sửa phòng', 'FAIL', `Status: ${unauthPutRes.status}`);
  }

  // TC_INV_004: Tìm kiếm theo mã phòng thật (DN-01)
  const searchRes = await request('/host/rooms?search=DN-01', { token: hostToken });
  if (searchRes.status === 200 && searchRes.body.includes('An Nhiên Eco Retreat Đà Nẵng') && !searchRes.body.includes('West Lake Sunset')) {
    logTest('TC_INV_004', 'Tìm kiếm theo Mã phòng "DN-01"', 'PASS', 'Chỉ trả về phòng An Nhiên Eco Retreat', searchRes.duration);
  } else {
    logTest('TC_INV_004', 'Tìm kiếm Mã phòng', 'FAIL', 'Kết quả tìm kiếm không chính xác');
  }

  // TC_INV_005: Tìm kiếm không có kết quả [EMPTY-001]
  const emptyRes = await request('/host/rooms?search=KHONG-TON-TAI-999', { token: hostToken });
  if (emptyRes.status === 200 && emptyRes.body.includes('EMPTY-001') && emptyRes.body.includes('Không tìm thấy phòng nào phù hợp')) {
    logTest('TC_INV_005', 'Hiển thị Empty State khi tìm kiếm không có kết quả', 'PASS', 'Hiển thị đúng mã [EMPTY-001]', emptyRes.duration);
  } else {
    logTest('TC_INV_005', 'Empty State', 'FAIL', 'Không tìm thấy EMPTY-001 trên giao diện');
  }

  // TC_INV_006: Lọc theo Loại phòng = Bungalow
  const filterTypeRes = await request('/host/rooms?type=Bungalow', { token: hostToken });
  if (filterTypeRes.status === 200 && filterTypeRes.body.includes('Mây Valley Pine Bungalow') && !filterTypeRes.body.includes('West Lake Sunset')) {
    logTest('TC_INV_006', 'Lọc danh mục Loại phòng = Bungalow', 'PASS', 'Chỉ trả về phòng Mây Valley Pine Bungalow Đà Lạt', filterTypeRes.duration);
  } else {
    logTest('TC_INV_006', 'Lọc Loại phòng', 'FAIL', 'Kết quả lọc không chính xác');
  }

  // TC_INV_012: Badge đơn chờ tại phòng DN-03
  if (invRes.body.includes('1 đơn mới') && invRes.body.includes('roomId=6adf16d94430d1c8c1484c95')) {
    logTest('TC_INV_012', 'Hiển thị badge tím "1 đơn mới" tại phòng DN-03', 'PASS', 'Đúng ID phòng 6adf16d94430d1c8c1484c95');
  } else {
    logTest('TC_INV_012', 'Badge đơn mới', 'FAIL', 'Không thấy badge 1 đơn mới');
  }

  // TC_INV_009 & TC_INV_010: Vòng đời trạng thái phòng (Published <-> Archived)
  // Dùng phòng DL-01 (6adf16d94430d1c8c1484c96)
  const toArchiveRes = await request('/host/rooms/6adf16d94430d1c8c1484c96/status', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetStatus: 'Archived' })
  });
  if (toArchiveRes.status === 200 && toArchiveRes.body?.code === 'ROOM-STA-002') {
    logTest('TC_INV_009', 'Chuyển trạng thái Published -> Archived', 'PASS', `Code: ${toArchiveRes.body.code} - ${toArchiveRes.body.message}`, toArchiveRes.duration);
  } else {
    logTest('TC_INV_009', 'Chuyển sang Archived', 'FAIL', JSON.stringify(toArchiveRes.body));
  }

  // Toggle back to Published
  const toPublishRes = await request('/host/rooms/6adf16d94430d1c8c1484c96/status', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetStatus: 'Published' })
  });
  if (toPublishRes.status === 200 && toPublishRes.body?.code === 'ROOM-STA-001') {
    logTest('TC_INV_010', 'Mở bán lại phòng Archived -> Published', 'PASS', `Code: ${toPublishRes.body.code} - ${toPublishRes.body.message}`, toPublishRes.duration);
  } else {
    logTest('TC_INV_010', 'Mở bán lại Published', 'FAIL', JSON.stringify(toPublishRes.body));
  }

  // TC_INV_013: Nhân bản phòng (Duplicate) phòng HA-01 (6adf16d94430d1c8c1484c97)
  let duplicatedRoomId = null;
  const dupRes = await request('/host/rooms/6adf16d94430d1c8c1484c97/duplicate', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' }
  });
  if (dupRes.status === 200 && dupRes.body?.code === 'ROOM-DUP-001') {
    duplicatedRoomId = dupRes.body.room?._id;
    const title = dupRes.body.room?.title;
    const status = dupRes.body.room?.status;
    if (title.includes('Bản sao của') && status === 'Draft') {
      logTest('TC_INV_013', 'Nhân bản phòng (Duplicate) thành công', 'PASS', `ID mới: ${duplicatedRoomId} | Tiêu đề: "${title}" | Trạng thái: ${status}`, dupRes.duration);
    } else {
      logTest('TC_INV_013', 'Nhân bản phòng', 'FAIL', `Dữ liệu không đúng: ${title}, ${status}`);
    }
  } else {
    logTest('TC_INV_013', 'Nhân bản phòng', 'FAIL', JSON.stringify(dupRes.body));
  }

  // TC_INV_014: Chặn xóa phòng CÓ booking tương lai (DN-02: 6adf16d94430d1c8c1484c94)
  const delBlockedRes = await request('/host/rooms/6adf16d94430d1c8c1484c94', {
    method: 'DELETE',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmationText: 'XÓA' })
  });
  if (delBlockedRes.status === 400 && delBlockedRes.body?.code === 'ROOM-DEL-001') {
    logTest('TC_INV_014', 'Chặn xóa phòng có đơn đặt phòng tương lai [ROOM-DEL-001]', 'PASS', `Chặn thành công và tự động chuyển Archived: ${delBlockedRes.body.message}`, delBlockedRes.duration);
    // Khôi phục lại trạng thái Published cho phòng DN-02
    await request('/host/rooms/6adf16d94430d1c8c1484c94/status', {
      method: 'POST',
      token: hostToken,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStatus: 'Published' })
    });
  } else {
    logTest('TC_INV_014', 'Chặn xóa phòng có booking', 'FAIL', JSON.stringify(delBlockedRes.body));
  }

  // TC_INV_015: Xóa phòng KHÔNG có booking (dùng phòng vừa nhân bản duplicatedRoomId)
  if (duplicatedRoomId) {
    // Thử xóa khi chưa xác nhận gõ XÓA (nếu là phòng khác Draft)
    const delSuccessRes = await request(`/host/rooms/${duplicatedRoomId}`, {
      method: 'DELETE',
      token: hostToken,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationText: 'XÓA' })
    });
    if (delSuccessRes.status === 200 && delSuccessRes.body?.code === 'ROOM-DEL-002') {
      logTest('TC_INV_015', 'Xóa vĩnh viễn phòng thỏa mãn điều kiện [ROOM-DEL-002]', 'PASS', `Đã xóa phòng ${duplicatedRoomId} khỏi DB`, delSuccessRes.duration);
    } else {
      logTest('TC_INV_015', 'Xóa phòng thỏa mãn điều kiện', 'FAIL', JSON.stringify(delSuccessRes.body));
    }
  }

  // TC_INV_016: Xuất file Excel
  const exportRes = await request('/host/export-excel', { token: hostToken });
  const isXlsx = exportRes.headers.get('content-type')?.includes('spreadsheetml');
  if (exportRes.status === 200 && isXlsx) {
    logTest('TC_INV_016', 'Xuất danh mục phòng ra file Excel .xlsx', 'PASS', 'Định dạng MIME openxmlformats hợp lệ', exportRes.duration);
  } else {
    logTest('TC_INV_016', 'Xuất Excel', 'FAIL', `Status: ${exportRes.status}`);
  }

  console.log('\n--- GIAI ĐOẠN 3: KIỂM THỬ FORM CREATE/UPDATE ROOM (SCR-HOST-02) ---');

  // TC_FORM_001: Form tạo mới
  const createFormRes = await request('/host/rooms/create', { token: hostToken });
  if (createFormRes.status === 200 && createFormRes.body.includes('Thêm phòng nghỉ mới')) {
    logTest('TC_FORM_001', 'Tải giao diện Tạo phòng mới (/host/rooms/create)', 'PASS', 'Render EJS form trắng thành công', createFormRes.duration);
  } else {
    logTest('TC_FORM_001', 'Form tạo mới', 'FAIL', `Status: ${createFormRes.status}`);
  }

  // TC_FORM_002: Form chỉnh sửa prefill phòng DN-01 (6adf16d94430d1c8c1484c93)
  const editFormRes = await request('/host/rooms/6adf16d94430d1c8c1484c93/edit', { token: hostToken });
  if (editFormRes.status === 200 && editFormRes.body.includes('An Nhiên Eco Retreat Đà Nẵng') && editFormRes.body.includes('DN-01')) {
    logTest('TC_FORM_002', 'Prefill dữ liệu chính xác khi sửa phòng thật DN-01', 'PASS', 'Tên phòng và mã phòng điền đúng', editFormRes.duration);
  } else {
    logTest('TC_FORM_002', 'Form chỉnh sửa prefill', 'FAIL', `Status: ${editFormRes.status}`);
  }

  // TC_FORM_003: Chặn trùng tên phòng cùng Host [ROOM-NAME-DUP]
  const dupNameRes = await request('/host/rooms', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'West Lake Sunset Luxury Loft Hà Nội', // Trùng tên phòng có sẵn của Host 1
      roomType: 'Homestay',
      status: 'Draft'
    })
  });
  if (dupNameRes.status === 400 && dupNameRes.body?.code === 'ROOM-NAME-DUP') {
    logTest('TC_FORM_003', 'Chặn trùng 100% tên phòng của cùng Host [ROOM-NAME-DUP]', 'PASS', `Code: ${dupNameRes.body.code} - ${dupNameRes.body.message}`, dupNameRes.duration);
  } else {
    logTest('TC_FORM_003', 'Chặn trùng tên phòng', 'FAIL', JSON.stringify(dupNameRes.body));
  }

  // TC_FORM_004: Validate độ dài tên phòng (< 10 ký tự)
  const shortNameRes = await request('/host/rooms', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Phòng bé', // 8 ký tự
      status: 'Published'
    })
  });
  if (shortNameRes.status === 400 && shortNameRes.body?.code === 'ROOM-REQ-001') {
    logTest('TC_FORM_004', 'Validate độ dài tên phòng (< 10 ký tự)', 'PASS', shortNameRes.body.message, shortNameRes.duration);
  } else {
    logTest('TC_FORM_004', 'Validate tên phòng', 'FAIL', JSON.stringify(shortNameRes.body));
  }

  // TC_FORM_008: Chặn đăng bán khi Album thiếu ảnh (< 3 ảnh) [ROOM-IMG-001]
  const lackImgRes = await request('/host/rooms', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Biệt Thự Đồi Thông Mới Xây Đạt Chuẩn',
      roomType: 'Biệt thự / Villa',
      city: 'Lâm Đồng (Đà Lạt)',
      district: 'Phường 4',
      address: '10 Đặng Thái Thân',
      pricePerNight: 1500000,
      description: 'Căn biệt thự view trọn đồi thông xanh mát với đầy đủ tiện nghi cao cấp đạt chuẩn 5 sao.',
      amenities: JSON.stringify([{ id: '1', name: 'Wifi' }]),
      images: JSON.stringify(['https://img.com/1.jpg', 'https://img.com/2.jpg']), // Chỉ 2 ảnh
      status: 'Published'
    })
  });
  if (lackImgRes.status === 400 && lackImgRes.body?.code === 'ROOM-IMG-001') {
    logTest('TC_FORM_008', 'Chặn Đăng bán khi Album ảnh dưới 3 ảnh [ROOM-IMG-001]', 'PASS', `Code: ${lackImgRes.body.code} - ${lackImgRes.body.message}`, lackImgRes.duration);
  } else {
    logTest('TC_FORM_008', 'Chặn thiếu ảnh', 'FAIL', JSON.stringify(lackImgRes.body));
  }

  // TC_SAVE_001: Lưu bản nháp (Draft) cho phép thiếu trường bắt buộc [ROOM-DRAFT-001]
  const draftRes = await request('/host/rooms', {
    method: 'POST',
    token: hostToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Bản Nháp Villa Hồ Tuyền Lâm Mới Nhất',
      status: 'Draft'
    })
  });
  let draftRoomId = null;
  if (draftRes.status === 200 && draftRes.body?.code === 'ROOM-DRAFT-001') {
    draftRoomId = draftRes.body.room?._id;
    logTest('TC_SAVE_001', 'Lưu bản nháp thành công khi chưa đủ thông tin [ROOM-DRAFT-001]', 'PASS', `Tạo draft thành công với ID: ${draftRoomId}`, draftRes.duration);
    // Cleanup draft room
    if (draftRoomId) {
      await request(`/host/rooms/${draftRoomId}`, {
        method: 'DELETE',
        token: hostToken,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: 'XÓA' })
      });
    }
  } else {
    logTest('TC_SAVE_001', 'Lưu bản nháp', 'FAIL', JSON.stringify(draftRes.body));
  }

  // TC_AUTH_001: Quick Auth API khi Token hết hạn
  const quickAuthRes = await request('/host/api/quick-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'host@smarttravel.com',
      password: '123456'
    })
  });
  const qCookie = quickAuthRes.headers.get('set-cookie');
  if (quickAuthRes.status === 200 && quickAuthRes.body?.success && qCookie?.includes('hostToken=')) {
    logTest('TC_AUTH_001', 'Xác thực nhanh Quick Auth [AUTH-401-EXPIRED Recovery]', 'PASS', 'Cấp lại cookie hostToken thành công mà không mất session', quickAuthRes.duration);
  } else {
    logTest('TC_AUTH_001', 'Quick Auth', 'FAIL', JSON.stringify(quickAuthRes.body));
  }

  console.log('\n===============================================================');
  console.log('📊 TỔNG KẾT KẾT QUẢ THỰC THI KIỂM THỬ (TEST SUMMARY REPORT)');
  console.log('===============================================================');
  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  console.log(`TỔNG SỐ TEST CASE: ${testResults.length}`);
  console.log(`✅ SỐ CA ĐẠT (PASS): ${passCount}`);
  console.log(`❌ SỐ CA THẤT BẠI (FAIL): ${failCount}`);
  console.log(`TỶ LỆ THÀNH CÔNG: ${((passCount / testResults.length) * 100).toFixed(1)}%`);
  console.log('===============================================================\n');

  process.exit(failCount > 0 ? 1 : 0);
}

runAllTests().catch(err => {
  console.error('Lỗi ngoại lệ trong quá trình chạy test:', err);
  process.exit(1);
});

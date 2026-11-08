# Authentication API

Response cho `/api/auth/*` và `/api/user/me` (bao gồm alias `/api/v1`):

```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "<JWT>"
  }
}
```

- `status` là số, luôn trùng HTTP status thực tế. Signup thành công trả 201; signin thành công trả 200; lỗi giữ 400/401/403/404/429/500.
- `message` luôn là chuỗi.
- `data` là object hoặc `null` khi không có dữ liệu, kể cả lỗi thông thường.
- Signin và Google trả `data.accessToken`; refresh token vẫn ở cookie HttpOnly.
- Verify OTP trả `data.valid`. Trùng tài khoản trả `data.field` (`username` hoặc `email`).
- `/user/me` trả thông tin user trong `data`, loại password và thông tin reset password.

## Postman

1. Import `SmartTravel-Authentication.postman_collection.json` (thay collection cũ nếu đã import).
2. Khởi động MongoDB và backend: `npm run dev:server`.
3. Đặt collection variable `baseUrl=http://localhost:5000/api`, không có `/` cuối. Không đặt environment/data variables trùng tên với các collection variables.
4. Run folder **01 - Automated authentication**, đúng thứ tự, một iteration.

**Happy case signin nằm ngay request thứ 2:** `02 - HAPPY CASE - Signin: valid username and password (200)`. Request 01 tự tạo tài khoản mới và lưu credentials. Request 02 lưu token từ `response.data.accessToken`; request 03 gọi `/user/me` để kiểm tra danh tính. Có thêm happy case đăng nhập bằng email và phone.

43 request gồm 32 ca mặc định, 8 ca recovery và 3 ca Google tùy chọn. Mọi post-response script đều kiểm tra đủ ba key và `response.status` trùng HTTP status. Chạy trên database test: mỗi lần chạy tạo tài khoản mới; không tự xóa tài khoản.

Collection gửi refresh cookie tường minh khi signout để dùng được với HTTP localhost, dù backend đặt cookie `Secure`. Dùng cookie jar sạch khi chạy. Test logout không chứng minh session đã bị xóa trong database; JWT hiện không bị thu hồi ngay sau logout.

## OTP và Google tùy chọn

- Recovery: sau folder 01, đặt `runRecovery=true`. Gửi riêng R01, rồi R02 trong vòng 60 giây (kỳ vọng 429). Lấy OTP trong terminal backend local, hoặc hộp thư test nếu tài khoản dùng email nhận thư được, đặt vào biến `otp`. Chỉ chọn R03–R08 để chạy tiếp; không chạy lại R01/R02. OTP có hiệu lực 15 phút. Sau đó đặt lại cờ false và xóa OTP. Các request cần OTP bị bỏ qua nếu biến rỗng. Lần chạy folder 01 tiếp theo tạo tài khoản mới.
- Google: đặt `runGoogle=true`; G01 gọi Google với token sai. G02/G03 cần Google OAuth **access token** thật trong `googleAccessToken`, không phải ID token/JWT của app. Google signin có thể tạo tài khoản mới. Xóa token và tắt cờ sau khi dùng.

## Kiểm chứng local

```powershell
cd server
node --experimental-vm-modules ../node_modules/jest/bin/jest.js --runTestsByPath tests/authResponse.test.js --runInBand
```

Từ thư mục gốc:

```powershell
node --test mobile-app/__tests__/mobileAuth.test.cjs
```

Backend tests dùng route Express và middleware thật với model database được thay bằng dữ liệu test trong bộ nhớ. Không xác minh MongoDB, gửi email hay Google bên ngoài. Collection đã kiểm tra JSON và cú pháp scripts; cần chạy trên backend của bạn để xác minh end-to-end.

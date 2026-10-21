# 🔐 QUY TRÌNH HOẠT ĐỘNG AUTHENTICATION (JWT & GOOGLE OAUTH)
**Dự án:** Smart Travel Platform (Node.js/Express + MongoDB + React Native Expo)

---

## 📌 1. TỔNG QUAN KIẾN TRÚC BẢO MẬT

Hệ thống xác thực của Smart Travel áp dụng mô hình **Dual-Token Architecture (Access Token + Refresh Token)** kết hợp với **Google OAuth 2.0**:

- **Access Token (JWT):** Token ngắn hạn (Short-lived), dùng để chứng thực danh tính người dùng trong từng request gửi lên các API được bảo vệ (`Authorization: Bearer <token>`).
- **Refresh Token (Opaque Token):** Token dài hạn (Long-lived, 7 ngày), được tạo ngẫu nhiên bằng chuỗi bytes mật mã học (`crypto.randomBytes(64)`), lưu trong Database (`Session`) và gửi về client qua **HttpOnly Cookie** nhằm chống lại tấn công XSS.
- **Băm mật khẩu:** Mật khẩu của người dùng được mã hóa một chiều bằng thư viện `bcrypt` (10 salt rounds) trước khi lưu vào MongoDB.

---

## 🗺️ 2. SƠ ĐỒ QUY TRÌNH TỔNG THỂ (SEQUENCE DIAGRAM)

### 2.1 Luồng Đăng nhập Email & Mật khẩu (Standard JWT Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Mobile App (Expo)
    participant Server as Backend API (Express)
    participant DB as MongoDB Atlas

    User->>App: Nhập Email/Username & Mật khẩu
    App->>App: Validate form (bắt buộc nhập, pass >= 6 ký tự)
    App->>Server: POST /api/auth/signin { username, password }
    Server->>DB: Tìm User theo username hoặc email
    alt Không tìm thấy User
        Server-->>App: 404/401 User không tồn tại
    else Tìm thấy User
        Server->>Server: So khớp mật khẩu với bcrypt.compare()
        alt Mật khẩu SAI
            Server-->>App: 401 Mật khẩu không chính xác
        else Mật khẩu ĐÚNG
            Server->>Server: Tạo JWT Access Token (payload: userId)
            Server->>Server: Tạo Refresh Token ngẫu nhiên (crypto 64 bytes)
            Server->>DB: Lưu Session { userId, refreshToken, expiresAt }
            Server-->>App: 200 OK + { accessToken } + Set-Cookie: refreshToken (HttpOnly)
            App->>Server: GET /api/user/me (Header: Bearer accessToken)
            Server->>DB: Tìm User profile theo userId
            Server-->>App: 200 OK { user profile }
            App->>App: Chuyển hướng sang màn hình Profile
        end
    end
```

---

### 2.2 Luồng Đăng nhập bằng Google (Google OAuth 2.0 Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Mobile App (Expo Go)
    participant Google as Google OAuth Server
    participant Server as Backend API (Express)
    participant DB as MongoDB Atlas

    User->>App: Bấm "Tiếp tục với Google"
    App->>Google: Mở màn hình đăng nhập (iosClientId / webClientId)
    User->>Google: Đăng nhập & cấp quyền tài khoản Google
    Google-->>App: Chuyển hướng callback kèm Google Token (host.exp.Exponent:/oauthredirect)
    App->>Server: POST /api/auth/google { accessToken }
    Server->>Google: Xác thực token: GET https://www.googleapis.com/oauth2/v3/userinfo
    alt Token không hợp lệ
        Server-->>App: 401 Google token không hợp lệ
    else Token hợp lệ (nhận email, name, avatar)
        Server->>DB: Tìm User theo email Google
        alt Chưa có tài khoản
            Server->>DB: Tự động tạo mới User (mật khẩu ngẫu nhiên băm bcrypt, role USER)
        end
        Server->>Server: Tạo JWT Access Token cho User
        Server->>Server: Tạo Refresh Token Session
        Server->>DB: Lưu Session vào MongoDB
        Server-->>App: 200 OK + { accessToken } + Set-Cookie: refreshToken
        App->>Server: GET /api/user/me (Header: Bearer accessToken)
        Server-->>App: 200 OK { user profile }
        App->>App: Chuyển hướng sang màn hình Profile
    end
```

---

### 2.3 Luồng Xác thực Request được bảo vệ (Protected Route)

```mermaid
sequenceDiagram
    autonumber
    participant App as Mobile App
    participant Middleware as Middleware (verifyToken)
    participant Controller as Controller (/api/user/me)
    participant DB as MongoDB

    App->>Middleware: Request kèm Header: "Authorization: Bearer <accessToken>"
    Middleware->>Middleware: Kiểm tra Header Authorization
    alt Không có token
        Middleware-->>App: 401 Unauthorized (Chưa đăng nhập)
    else Có token
        Middleware->>Middleware: jwt.verify(token, ACCES_TOKEN_SECRET)
        alt Token hết hạn / Chữ ký sai
            Middleware-->>App: 403 Forbidden (Token không hợp lệ)
        else Token hợp lệ
            Middleware->>Middleware: Gán req.userId = decoded.userId
            Middleware->>Controller: next()
            Controller->>DB: User.findById(req.userId).select("-password")
            DB-->>Controller: Dữ liệu User
            Controller-->>App: 200 OK { user data }
        end
    end
```

---

### 2.4 Luồng Quên mật khẩu & Đổi mật khẩu qua OTP (Forgot & Reset Password)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Mobile App
    participant Server as Backend API
    participant Gmail as Google Cloud OAuth (Nodemailer)
    participant DB as MongoDB

    User->>App: Nhập email cần khôi phục
    App->>Server: POST /api/auth/forgot-password { email }
    Server->>DB: Tìm User theo email
    alt Email không tồn tại
        Server-->>App: 404 Email không tồn tại
    else Email hợp lệ
        Server->>Server: Kiểm tra Rate Limit (chống spam cách nhau tối thiểu 60s)
        Server->>Server: Tạo mã OTP ngẫu nhiên 6 chữ số
        Server->>DB: Lưu resetPasswordToken = OTP, resetPasswordExpires = +15 phút
        Server->>Gmail: Gửi email chứa mã OTP đến người dùng
        Server-->>App: 200 OK "Đã gửi mã OTP về email"
    end

    User->>App: Nhập mã OTP + Mật khẩu mới
    App->>Server: POST /api/auth/reset-password { email, otp, newPassword }
    Server->>DB: Tìm User theo email, so sánh OTP & kiểm tra hạn 15 phút
    alt OTP sai hoặc đã hết hạn
        Server-->>App: 400 Mã OTP không hợp lệ hoặc đã hết hạn
    else OTP hợp lệ
        Server->>Server: Băm mật khẩu mới với bcrypt
        Server->>DB: Cập nhật password mới, xóa resetPasswordToken & resetPasswordExpires
        Server-->>App: 200 OK "Đặt lại mật khẩu thành công"
    end
```

---

## ⚙️ 3. CÁC API ENDPOINTS AUTHENTICATION

| Method | Endpoint | Quyền truy cập | Chức năng | Body Payload mẫu |
|:---:|:---|:---:|:---|:---|
| `POST` | `/api/auth/signup` | Public | Đăng ký tài khoản mới | `{ username, email, password, confirmPassword, role }` |
| `POST` | `/api/auth/signin` | Public | Đăng nhập bằng Email/Username | `{ username, password }` |
| `POST` | `/api/auth/google` | Public | Đăng nhập bằng Google Token | `{ accessToken }` |
| `POST` | `/api/auth/forgot-password` | Public | Yêu cầu gửi mã OTP khôi phục | `{ email }` |
| `POST` | `/api/auth/reset-password` | Public | Đổi mật khẩu bằng mã OTP | `{ email, otp, newPassword }` |
| `POST` | `/api/auth/signout` | Public | Đăng xuất, hủy Session & Cookie | `{}` |
| `GET` | `/api/user/me` | Protected (JWT) | Lấy thông tin cá nhân của người dùng | Header: `Authorization: Bearer <token>` |

---

## 🛡️ 4. QUY TẮC BẢO MẬT & CHI TIẾT KỸ THUẬT

1. **Bảo mật Access Token:**
   - Được ký bằng khóa bí mật `ACCES_TOKEN_SECRET` trong file `.env`.
   - Thời hạn token được giới hạn ngắn nhằm giảm thiểu rủi ro khi token bị lộ.
   - Client lưu tạm thời trong Memory (State/Redux) khi app đang hoạt động.

2. **Bảo mật Refresh Token & Session:**
   - Tạo bằng mã hóa ngẫu nhiên: `crypto.randomBytes(64).toString('hex')`.
   - Được lưu vào Collection `sessions` trong MongoDB với thời gian hết hạn cụ thể (`expiresAt`).
   - Cài đặt Cookie với cờ an toàn cao:
     ```javascript
     res.cookie("refreshToken", refreshToken, {
       httpOnly: true, // Trình duyệt chặn mã độc JavaScript truy cập
       secure: true,   // Chỉ gửi qua kết nối HTTPS
       sameSite: "none", // Cho phép gửi chéo domain (mobile/web)
       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
     });
     ```

3. **Cơ chế chống brute-force / spam mã OTP:**
   - Tại API `/api/auth/forgot-password`, hệ thống kiểm tra thời gian gửi mã trước đó. Nếu chưa qua 60 giây, trả về HTTP status `429 Too Many Requests`.
   - Mã OTP tự động vô hiệu hóa sau 15 phút.

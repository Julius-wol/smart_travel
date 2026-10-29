import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Tạo Access Token (JWT) và Refresh Token, lưu Session vào Database và set Cookie
 * Dùng chung cho cả USER và HOST
 */
export const createSessionAndTokens = async (user, res, options = {}) => {
  const isHost = options.isHost || user.role === 'HOST';

  // 1. Tạo Access Token (JWT) mang thông tin userId và role
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCES_TOKEN_SECRET || 'secret_key',
    { expiresIn: options.accessTokenTtl || ACCESS_TOKEN_TTL }
  );

  // 2. Tạo Opaque Refresh Token 64-byte mật mã học
  const refreshToken = crypto.randomBytes(64).toString('hex');

  // 3. Lưu Session vào MongoDB
  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  // 4. Set Cookie Refresh Token (chuẩn cho cả Mobile & Web)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/'
  });

  // 5. Nếu là Host (hoặc có cờ setHostCookie), set thêm hostToken cookie để hỗ trợ Web SSR EJS
  if (isHost || options.setHostCookie) {
    res.cookie('hostToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: '/'
    });
  }

  return { accessToken, refreshToken, user };
};

/**
 * Thu hồi phiên (Revoke Session): Xóa bản ghi trong MongoDB và clear cookies
 */
export const revokeSession = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await Session.deleteOne({ refreshToken });
  }

  res.clearCookie('refreshToken', { path: '/' });
  res.clearCookie('hostToken', { path: '/' });
  res.clearCookie('token', { path: '/' });
};

/**
 * Làm mới Access Token thông qua Refresh Token hợp lệ
 */
export const refreshSession = async (refreshToken, res, options = {}) => {
  if (!refreshToken) return null;

  const session = await Session.findOne({
    refreshToken,
    expiresAt: { $gt: new Date() }
  });

  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user || user.status === 'SUSPENDED') {
    await Session.deleteOne({ _id: session._id });
    return null;
  }

  const isHost = options.isHost || user.role === 'HOST';

  // Tạo access token mới
  const newAccessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCES_TOKEN_SECRET || 'secret_key',
    { expiresIn: options.accessTokenTtl || ACCESS_TOKEN_TTL }
  );

  if (isHost || options.setHostCookie) {
    res.cookie('hostToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: '/'
    });
  }

  return { accessToken: newAccessToken, user };
};

/**
 * Xác thực token Google OAuth 2.0
 */
export const verifyGoogleToken = async (accessToken) => {
  if (!accessToken) throw new Error('Thiếu Google access token');

  const googleRes = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
  );

  if (!googleRes.ok) {
    throw new Error('Google access token không hợp lệ hoặc đã hết hạn');
  }

  return await googleRes.json();
};

/**
 * Xác thực thông tin đăng nhập của HOST (email/username/phone + password)
 */
export const authenticateHostCredentials = async (queryInput, password) => {
  const query = (queryInput || '').trim();
  if (!query || !password) {
    throw new Error('Vui lòng nhập Email/Số điện thoại và Mật khẩu');
  }

  const user = await User.findOne({
    $or: [
      { username: query },
      { email: query.toLowerCase() },
      { phone: query }
    ]
  });

  if (!user) {
    const err = new Error('Tài khoản không tồn tại trên hệ thống Smart Travel');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Mật khẩu không chính xác');
    err.code = 'INVALID_PASSWORD';
    throw err;
  }

  if (user.role !== 'HOST') {
    const err = new Error('Tài khoản của bạn là Khách du lịch (USER). Cổng này chỉ dành riêng cho Đối tác cho thuê phòng (HOST).');
    err.code = 'NOT_HOST';
    throw err;
  }

  return user;
};

/**
 * Đăng ký tài khoản HOST mới
 */
export const registerHostUser = async ({ username, email, phone, firstName, lastName, password }) => {
  const cleanUsername = (username || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const cleanFirstName = (firstName || '').trim();
  const cleanLastName = (lastName || '').trim();

  if (!cleanUsername || !cleanEmail || !password || !cleanFirstName || !cleanLastName) {
    const err = new Error('Vui lòng điền đầy đủ tất cả các trường bắt buộc (*)');
    err.code = 'MISSING_FIELDS';
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('Mật khẩu phải có tối thiểu 6 ký tự');
    err.code = 'PASSWORD_TOO_SHORT';
    throw err;
  }

  const duplicate = await User.findOne({
    $or: [
      { username: cleanUsername },
      { email: cleanEmail }
    ]
  });

  if (duplicate) {
    const err = new Error(duplicate.username === cleanUsername
      ? 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.'
      : 'Email đã được đăng ký. Vui lòng dùng email khác.'
    );
    err.code = 'DUPLICATE_USER';
    err.field = duplicate.username === cleanUsername ? 'username' : 'email';
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username: cleanUsername,
    email: cleanEmail,
    phone: cleanPhone,
    firstName: cleanFirstName,
    lastName: cleanLastName,
    fullName: `${cleanFirstName} ${cleanLastName}`.trim(),
    password: hashedPassword,
    role: 'HOST',
    status: 'ACTIVE',
    wishlist: []
  });

  return newUser;
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { refreshSession, revokeSession } from '../services/authService.js';

export const hostAuth = async (req, res, next) => {
  try {
    const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
    let token = bearer?.[1] || req.cookies?.hostToken || req.cookies?.token;

    const handleExpired = async () => {
      // Thử tự động gia hạn phiên thông qua Refresh Token trong DB nếu có
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const result = await refreshSession(refreshToken, res, { isHost: true });
          if (result && result.user && result.user.role === 'HOST') {
            req.user = result.user;
            return next();
          }
        } catch (refreshErr) {
          console.warn('Auto refresh host session failed:', refreshErr.message);
        }
      }

      await revokeSession(req, res);

      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({
          code: 'AUTH-401-EXPIRED',
          message: 'Phiên làm việc đã hết hạn. Vui lòng xác thực lại mật khẩu để tiếp tục lưu dữ liệu.'
        });
      }
      return res.redirect('/host/login?error=expired');
    };

    // If no token exists, try refresh token first or redirect to login
    if (!token) {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const result = await refreshSession(refreshToken, res, { isHost: true });
          if (result && result.user && result.user.role === 'HOST') {
            req.user = result.user;
            return next();
          }
        } catch (e) {}
      }

      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({ code: 'AUTH-401', message: 'Vui lòng đăng nhập với tài khoản Host' });
      }
      return res.redirect('/host/login');
    }

    // Verify token
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET || 'secret_key', async (err, decoded) => {
      if (err) {
        return handleExpired();
      }

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        await revokeSession(req, res);
        if (req.xhr || req.headers.accept?.includes('json')) {
          return res.status(401).json({ code: 'AUTH-401', message: 'Tài khoản Host không còn tồn tại.' });
        }
        return res.redirect('/host/login?error=notfound');
      }

      // Check Host role strictly
      if (user.role !== 'HOST') {
        await revokeSession(req, res);
        if (req.xhr || req.headers.accept?.includes('json')) {
          return res.status(403).json({ code: 'AUTH-403', message: 'Chỉ tài khoản Host được truy cập lịch phòng.' });
        }
        return res.redirect('/host/login?error=not_host');
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('hostAuth error:', error);
    return res.status(500).send('Lỗi xác thực Host');
  }
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ensureRobinHost } from '../utils/seedHostData.js';

export const hostAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.hostToken || req.cookies?.token;
    
    // Check Authorization header as fallback
    if (!token && req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1];
    }

    // If no token exists, redirect to login page
    if (!token) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({ code: 'AUTH-401', message: 'Vui lòng đăng nhập với tài khoản Host' });
      }
      return res.redirect('/host/login');
    }

    // Verify token
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET || 'secret_key', async (err, decoded) => {
      if (err) {
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
          return res.status(401).json({
            code: 'AUTH-401-EXPIRED',
            message: 'Phiên làm việc đã hết hạn. Vui lòng xác thực lại mật khẩu để tiếp tục lưu dữ liệu.'
          });
        }
        res.clearCookie('hostToken');
        return res.redirect('/host/login?error=expired');
      }

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        res.clearCookie('hostToken');
        return res.redirect('/host/login?error=notfound');
      }

      // Check Host role strictly
      if (user.role !== 'HOST') {
        res.clearCookie('hostToken');
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

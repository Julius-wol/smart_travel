import { sendResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Session from '../models/Session.js';
import {
    createSessionAndTokens,
    revokeSession,
    refreshSession,
    verifyGoogleToken,
    registerHostUser,
    authenticateHostCredentials
} from '../services/authService.js';

const ACCES_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const signUp = async (req, res) => {
    try {
        const { password, role } = req.body;
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const firstName = typeof req.body.firstName === 'string' ? req.body.firstName.trim() : '';
        const lastName = typeof req.body.lastName === 'string' ? req.body.lastName.trim() : '';
        const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
        if (!username || !password || !email || !firstName || !lastName) {
            return sendResponse(res, 400, "Không thể thiếu username, password, email, firstName, lastName");
        }

        if (typeof password !== 'string' || password.length < 6) {
            return sendResponse(res, 400, "Mật khẩu phải có tối thiểu 6 ký tự");
        }
    
        //kiem tra user ton tai chua
        const duplicate = await User.findOne({ $or: [{ username }, { email }] });
        if (duplicate) {
            const field = duplicate.username === username ? 'username' : 'email';
            return sendResponse(res, 400, field === 'username'
                ? 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác hoặc đăng nhập.'
                : 'Email đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.', { field });
        }

        //ma hoa pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // tao user moi
        await User.create({
            username,
            password: hashedPassword,
            email,
            phone,
            fullName: (req.body.fullName || `${firstName} ${lastName}`).trim(),
            firstName,
            lastName,
            role: (role === 'HOST') ? 'HOST' : 'USER',
            status: 'ACTIVE',
            wishlist: [],
        });

        return sendResponse(res, 201, "Đăng ký thành công");
    } catch (error) {
        if (error.code === 11000) {
            const field = error.keyPattern?.username ? 'username' : 'email';
            return sendResponse(res, 400, field === 'username'
                ? 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác hoặc đăng nhập.'
                : 'Email đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.', { field });
        }
        console.error("Lỗi khi gọi signUp", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

export const signIn = async (req, res) => {
    try {
        const { username, password, clientType, role: requestedRole } = req.body;

        if (!username || !password) {
            return sendResponse(res, 400, "Không thể thiếu username, password");
        }

        // Tìm user theo username, email hoặc phone
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username },
                { phone: username }
            ]
        });

        if (!user) {
            return sendResponse(res, 401, "Tài khoản hoặc mật khẩu không đúng");
        }

        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect) {
            return sendResponse(res, 401, "Tài khoản hoặc mật khẩu không đúng");
        }

        const isHostClient = clientType === 'host' || requestedRole === 'HOST' || req.query?.clientType === 'host';

        if (isHostClient) {
            if (user.role !== 'HOST') {
                return res.status(403).json({
                    message: "Tài khoản của bạn là Khách du lịch (USER). Cổng này chỉ dành riêng cho Đối tác Chủ phòng (HOST). Vui lòng đăng nhập bằng tài khoản Chủ phòng!",
                    code: "NOT_HOST",
                    role: user.role
                });
            }
        } else {
            // Chặn tài khoản HOST đăng nhập vào ứng dụng mobile dành cho khách du lịch
            if (user.role === 'HOST') {
                return res.status(403).json({
                    message: "Tài khoản của bạn là Đối tác Chủ phòng (Host). Ứng dụng điện thoại chỉ dành riêng cho Khách du lịch đặt phòng. Vui lòng đăng nhập trên trang Web quản trị Host!",
                    code: "ROLE_NOT_PERMITTED_ON_MOBILE",
                    role: user.role
                });
            }
        }

        // Tạo access token & refresh token session thống nhất qua Core Auth Service
        const { accessToken } = await createSessionAndTokens(user, res, { isHost: isHostClient });

        return sendResponse(res, 200, "Đăng nhập thành công", { accessToken });
    } catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

export const signOut = async (req, res) => {
    try {
        await revokeSession(req, res);
        return sendResponse(res, 200, "Đăng xuất thành công");
    } catch (error) {
        console.error("Lỗi khi gọi signOut", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return sendResponse(res, 400, "Vui lòng cung cấp email");

        const user = await User.findOne({ email });
        if (!user) return sendResponse(res, 404, "Email không tồn tại");

        // Chống spam OTP: Nếu mã trước đó được tạo chưa quá 60 giây, yêu cầu chờ
        if (user.resetPasswordExpires && (user.resetPasswordExpires - Date.now() > 14 * 60 * 1000)) {
            const waitSeconds = Math.ceil((user.resetPasswordExpires - (Date.now() + 14 * 60 * 1000)) / 1000);
            return sendResponse(res, 429, `Vui lòng đợi ${waitSeconds > 0 ? waitSeconds : 60} giây trước khi yêu cầu gửi lại mã!`);
        }

        // Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        if (!user.fullName) {
            user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
        }
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
        await user.save();

        // Gửi email chứa OTP
        if (process.env.EMAIL_USER) {
            try {
                let transporter;

                if (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET && process.env.OAUTH_REFRESH_TOKEN) {
                    // 1. Gửi qua Google Cloud OAuth 2.0
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            type: 'OAuth2',
                            user: process.env.EMAIL_USER,
                            clientId: process.env.OAUTH_CLIENT_ID,
                            clientSecret: process.env.OAUTH_CLIENT_SECRET,
                            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                        },
                    });
                } else if (process.env.EMAIL_PASS) {
                    // 2. Gửi qua Gmail Mật khẩu ứng dụng (App Password)
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER, 
                            pass: process.env.EMAIL_PASS, 
                        },
                    });
                }

                if (transporter) {
                    await transporter.sendMail({
                        from: `"SmartTravel Support" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: "Mã OTP Khôi phục mật khẩu - SmartTravel",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                                <h2 style="color: #00796B; text-align: center;">SmartTravel - Khôi phục mật khẩu</h2>
                                <p>Xin chào,</p>
                                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản SmartTravel. Mã OTP xác thực của bạn là:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #00796B; background: #E0F2F1; padding: 10px 25px; border-radius: 8px; border: 1px dashed #00796B;">${otp}</span>
                                </div>
                                <p style="color: #666; font-size: 14px;">Mã xác thực có hiệu lực trong vòng <b>15 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="color: #999; font-size: 12px; text-align: center;">Đội ngũ phát triển ứng dụng SmartTravel</p>
                            </div>
                        `,
                    });
                    console.log("📨 Đã gửi email thực tế đến:", email);
                } else {
                    console.log("⚠️ Chưa cấu hình OAuth2 hoặc Mật khẩu ứng dụng trong .env -> Bỏ qua gửi email thật.");
                }
            } catch (mailError) {
                console.log("⚠️ Không thể gửi mail thật (chi tiết lỗi:", mailError.message, "), bỏ qua lỗi này.");
            }
        } else {
            console.log("⚠️ Chưa cấu hình EMAIL_USER trong .env -> Bỏ qua bước gửi thư thật.");
        }

        console.log("=========================================");
        console.log("🔐 MÃ OTP CỦA BẠN LÀ:", otp);
        console.log("Hãy lấy mã này nhập vào App để test nhé!");
        console.log("=========================================");

        return sendResponse(res, 200, "Mã OTP đã được gửi đến email của bạn");
    } catch (error) {
        console.error("Lỗi forgotPassword:", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const token = (req.body.otp || req.body.token || '').toString().trim();
        const email = (req.body.email || '').toString().trim().toLowerCase();
        if (!token) return sendResponse(res, 400, "Vui lòng nhập mã OTP");

        const query = {
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        };
        if (email) {
            query.email = email;
        }

        const user = await User.findOne(query);

        if (!user) return sendResponse(res, 400, "Mã OTP không đúng hoặc đã hết hạn");

        return sendResponse(res, 200, "Xác thực mã OTP thành công", { valid: true });
    } catch (error) {
        console.error("Lỗi verifyOtp:", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return sendResponse(res, 400, "Vui lòng cung cấp token và mật khẩu mới");
        if (newPassword.length < 6) return sendResponse(res, 400, "Mật khẩu mới phải có tối thiểu 6 ký tự");

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token phải còn hạn
        });

        if (!user) return sendResponse(res, 400, "Token không hợp lệ hoặc đã hết hạn");

        if (!user.fullName) {
            user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return sendResponse(res, 200, "Đổi mật khẩu thành công");
    } catch (error) {
        console.error("Lỗi resetPassword:", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

// ==========================================
// GOOGLE SIGN IN
// ==========================================
export const googleSignIn = async (req, res) => {
    try {
        const { accessToken, clientType, role: requestedRole } = req.body;
        if (!accessToken) {
            return sendResponse(res, 400, "Thiếu Google access token");
        }

        let googleUser;
        try {
            googleUser = await verifyGoogleToken(accessToken);
        } catch (err) {
            return sendResponse(res, 401, err.message || "Google token không hợp lệ");
        }

        const { email, given_name, family_name, picture } = googleUser;
        if (!email) {
            return sendResponse(res, 400, "Không lấy được email từ Google");
        }

        const isHostClient = clientType === 'host' || requestedRole === 'HOST' || req.query?.clientType === 'host';
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter++}`;
            }

            const fullName = `${given_name || ''} ${family_name || ''}`.trim() || username;
            user = await User.create({
                username,
                fullName,
                email: email.toLowerCase(),
                firstName: given_name || (isHostClient ? 'Chủ phòng' : 'User'),
                lastName: family_name || '',
                password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
                avatar: picture || '',
                role: isHostClient ? 'HOST' : 'USER',
                status: 'ACTIVE',
                wishlist: []
            });
        } else {
            if (isHostClient) {
                if (user.role !== 'HOST') {
                    return res.status(403).json({
                        success: false,
                        message: `Tài khoản (${email}) hiện đang là Khách du lịch (USER). Cổng này chỉ dành riêng cho Đối tác Chủ phòng (HOST).`,
                        code: "NOT_HOST"
                    });
                }
            } else {
                if (user.role === 'HOST') {
                    return res.status(403).json({
                        message: "Tài khoản của bạn là Đối tác Chủ phòng (Host). Ứng dụng điện thoại chỉ dành riêng cho Khách du lịch đặt phòng. Vui lòng đăng nhập trên trang Web quản trị Host!",
                        code: "ROLE_NOT_PERMITTED_ON_MOBILE",
                        role: user.role
                    });
                }
            }
        }

        const { accessToken: jwtToken } = await createSessionAndTokens(user, res, { isHost: isHostClient });
        return sendResponse(res, 200, "Đăng nhập Google thành công", { accessToken: jwtToken });
    } catch (error) {
        console.error("Lỗi googleSignIn:", error);
        return sendResponse(res, 500, "Lỗi hệ thống");
    }
};

// ==========================================
// DEDICATED HOST REST APIs
// ==========================================
export const hostSignInApi = async (req, res) => {
    try {
        const { emailOrPhone, username, password } = req.body;
        const query = emailOrPhone || username;
        const user = await authenticateHostCredentials(query, password);
        const { accessToken } = await createSessionAndTokens(user, res, { isHost: true });
        return sendResponse(res, 200, "Đăng nhập Host thành công", { accessToken, role: user.role });
    } catch (error) {
        if (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_PASSWORD') {
            return sendResponse(res, 401, error.message);
        }
        if (error.code === 'NOT_HOST') {
            return sendResponse(res, 403, error.message);
        }
        console.error("Lỗi hostSignInApi:", error);
        return sendResponse(res, 500, error.message || "Lỗi hệ thống khi đăng nhập Host");
    }
};

export const hostSignUpApi = async (req, res) => {
    try {
        const newUser = await registerHostUser(req.body);
        const { accessToken } = await createSessionAndTokens(newUser, res, { isHost: true });
        return sendResponse(res, 201, "Đăng ký tài khoản Host thành công", { accessToken, role: newUser.role });
    } catch (error) {
        if (error.code === 'MISSING_FIELDS' || error.code === 'PASSWORD_TOO_SHORT') {
            return sendResponse(res, 400, error.message);
        }
        if (error.code === 'DUPLICATE_USER') {
            return sendResponse(res, 400, error.message, { field: error.field });
        }
        console.error("Lỗi hostSignUpApi:", error);
        return sendResponse(res, 500, "Lỗi hệ thống khi đăng ký Host");
    }
};

export const refreshTokenApi = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            return sendResponse(res, 401, "Thiếu refresh token");
        }
        const result = await refreshSession(token, res);
        if (!result) {
            return sendResponse(res, 401, "Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
        }
        return sendResponse(res, 200, "Làm mới token thành công", { accessToken: result.accessToken });
    } catch (error) {
        console.error("Lỗi refreshTokenApi:", error);
        return sendResponse(res, 500, "Lỗi hệ thống khi làm mới token");
    }
};

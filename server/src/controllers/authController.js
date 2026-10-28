import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Session from '../models/Session.js';

const ACCES_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const signUp = async (req, res) =>{
    try {
        const { username, password, email, phone, firstName, lastName, role } = req.body;
        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({ message: "Không thể thiếu username, password, email, firstName, lastName" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có tối thiểu 6 ký tự" });
        }
    
        //kiem tra user ton tai chua
const duplicate = await User.findOne({ $or: [{ username }, { email }] });
if (duplicate) {
    return res.status(400).json({ message: "Username hoac email da ton tai" });
}

        //ma hoa pass

const hashedPassword = await bcrypt.hash(password, 10); // số 10 là 2 mũ 10 số lần mã hóa, số càng lớn thì càng an toàn nhưng tốn tài nguyên cua hacker

        // tao user moi
await User.create({
    username,
    password: hashedPassword,
    email,
    phone,
    firstName,
    lastName,
    role: (role === 'HOST') ? 'HOST' : 'USER',
});

        //return

    return res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        console.error("Lỗi khi gọi signUp", error)
        return res.status(500).json ({message:"Lỗi hệ thống"});
        
    }

};

export const signIn = async (req,res) => {
    try {

        //lấy inputs
        const {username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Không thể thiếu username, password" });
        }



        //lấy hashed password trong db so với pass input
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username },
                { phone: username }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
        }

        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect) {
            return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
        }

        // Chặn tài khoản HOST đăng nhập vào ứng dụng mobile dành cho khách du lịch
        if (user.role === 'HOST') {
            return res.status(403).json({
                message: "Tài khoản của bạn là Đối tác Chủ phòng (Host). Ứng dụng điện thoại chỉ dành riêng cho Khách du lịch đặt phòng. Vui lòng đăng nhập trên trang Web quản trị Host!",
                code: "ROLE_NOT_PERMITTED_ON_MOBILE",
                role: user.role
            });
        }
        
        //neu khop, tạo accesToken với JWT
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCES_TOKEN_SECRET || 'secret_key', { expiresIn: ACCES_TOKEN_TTL  });

        // Tạo  refreshtoken
        const refreshToken = crypto.randomBytes(64).toString("hex")

       //tạo session mới để lưu refresh token
await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
})



       // trả refresh token về trong cookie

res.cookie("refreshToken", refreshToken,{
    httpOnly: true,
    secure: true,
    sameSite: "none", 
    maxAge: REFRESH_TOKEN_TTL_MS,
    
})



        

        // tra access token ve trong res
        return res.status(200).json({ message:"Đăng nhập thành công" ,
            accessToken,
        });
        
    } catch (error) {
        console.error("Lỗi khi gọi signIn", error)
        return res.status(500).json ({message: "Lỗi hệ thống"});
    }
};

export const signOut = async (req,res) => {
    try{
        // lấy refreshtoken từ cookie
        const token = req.cookies?.refreshToken;
        if (token) {
            //xoa refresh token khoi session
            await Session.deleteOne({ refreshToken: token });
            
            //xoa cookie
            res.clearCookie("refreshToken");
        
        };
        // trả về
        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        console.error("Lỗi khi gọi signOut", error)
        return res.status(500).json ({message: "Lỗi hệ thống"});
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng cung cấp email" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email không tồn tại" });

        // Chống spam OTP: Nếu mã trước đó được tạo chưa quá 60 giây, yêu cầu chờ
        if (user.resetPasswordExpires && (user.resetPasswordExpires - Date.now() > 14 * 60 * 1000)) {
            const waitSeconds = Math.ceil((user.resetPasswordExpires - (Date.now() + 14 * 60 * 1000)) / 1000);
            return res.status(429).json({ 
                message: `Vui lòng đợi ${waitSeconds > 0 ? waitSeconds : 60} giây trước khi yêu cầu gửi lại mã!` 
            });
        }

        // Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

        return res.status(200).json({ 
            message: "Mã OTP đã được gửi đến email của bạn"
        });
    } catch (error) {
        console.error("Lỗi forgotPassword:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: "Vui lòng cung cấp token và mật khẩu mới" });
        if (newPassword.length < 6) return res.status(400).json({ message: "Mật khẩu mới phải có tối thiểu 6 ký tự" });

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token phải còn hạn
        });

        if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Lỗi resetPassword:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// ==========================================
// GOOGLE SIGN IN
// ==========================================
export const googleSignIn = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: "Thiếu Google access token" });
        }

        // Xác minh token với Google & lấy thông tin user
        const googleRes = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );

        if (!googleRes.ok) {
            return res.status(401).json({ message: "Google token không hợp lệ" });
        }

        const googleUser = await googleRes.json();
        const { email, given_name, family_name, picture, sub: googleId } = googleUser;

        if (!email) {
            return res.status(400).json({ message: "Không lấy được email từ Google" });
        }

        // Tìm hoặc tạo user mới (auto-register nếu chưa có)
        let user = await User.findOne({ email });

        if (!user) {
            // Tạo username từ email (bỏ phần @...)
            const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter++}`;
            }

            user = await User.create({
                username,
                email,
                firstName: given_name || 'User',
                lastName: family_name || '',
                password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // random pass
                avatar: picture || '',
                role: 'USER',
            });

            console.log(`✅ Tạo tài khoản Google mới: ${email}`);
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

        // Tạo JWT access token
        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.ACCES_TOKEN_SECRET || 'secret_key',
            { expiresIn: ACCES_TOKEN_TTL }
        );

        // Tạo refresh token session
        const refreshToken = crypto.randomBytes(64).toString('hex');
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL_MS,
        });

        return res.status(200).json({
            message: "Đăng nhập Google thành công",
            accessToken: jwtToken,
        });

    } catch (error) {
        console.error("Lỗi googleSignIn:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
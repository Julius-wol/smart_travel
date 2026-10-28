import { sendResponse } from '../utils/apiResponse.js';
export const authMe = async (req, res) => {
try{
 const user = req.user; //lấy từ midd

 return sendResponse(res, 200, 'Lấy thông tin người dùng thành công', user);

}catch(error){
    console.error("Lỗi khi gọi authMe", error);
    return sendResponse(res, 500, "Lỗi hệ thống");
}

}

import User from '../models/User.js';

export const updateProfile = async (req, res) => {
    try {
        const { fullName, firstName, lastName, phone, avatar, hostProfile } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (fullName) updateData.fullName = fullName.trim();
        else if (firstName || lastName) {
            updateData.fullName = `${firstName || ''} ${lastName || ''}`.trim();
        }
        if (firstName) updateData.firstName = firstName.trim();
        if (lastName) updateData.lastName = lastName.trim();
        if (phone !== undefined) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (hostProfile !== undefined) updateData.hostProfile = hostProfile;

        // Cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        ).select("-password -resetPasswordToken -resetPasswordExpires");

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        return res.status(200).json({
            message: "Cập nhật thông tin thành công",
            user: updatedUser
        });
    } catch (error) {
        console.error("Lỗi updateProfile:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn một ảnh" });
        }

        const userId = req.user._id;
        const avatarUrl = '/uploads/' + req.file.filename;

        // Cập nhật URL ảnh vào user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { avatar: avatarUrl } },
            { returnDocument: 'after' }
        ).select("-password");

        return res.status(200).json({
            message: "Cập nhật ảnh đại diện thành công",
            avatar: avatarUrl,
            user: updatedUser
        });
    } catch (error) {
        console.error("Lỗi updateAvatar:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

import bcrypt from 'bcrypt';

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ và mới" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
        }

        // Mã hoá mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Lỗi changePassword:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

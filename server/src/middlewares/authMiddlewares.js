import { sendResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
    try{
       
   //lấy token tu header
const authHeader = req.headers["authorization"];
const token = authHeader && authHeader.split(" ")[1];

if(!token) {
    return sendResponse(res, 401, "Không có accesstoken");
}

   //xac nhan token hop le
jwt.verify (token, process.env.ACCES_TOKEN_SECRET || 'secret_key', async (err, decodedUser) => {
    if(err) {
        console.log(err);
        return sendResponse(res, 403, "Accesstoken hết hạn hoặc không đúng");
    }
    

    try {
        // tìm user
        const user = await User.findById(decodedUser.userId).select("-password -resetPasswordToken -resetPasswordExpires");
        
        if(!user) {
            return sendResponse(res, 404, "Người dùng không tồn tại");
        }


        //tra user ve trong req
        req.user = user;
        next();
    } catch(dbErr) {
        console.error(dbErr);
        return sendResponse(res, 500, "Lỗi hệ thống database");
    }
});

    }catch(error)   {
        console.error("Lỗi khi xác thực", error)
        return sendResponse(res, 500, "Lỗi hệ thống")
    }
}

        

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
    try{
       
   //lấy token tu header
const authHeader = req.headers["authorization"];
const token = authHeader && authHeader.split(" ")[1];

if(!token) {
    return res.status(401).json({ message: "Không có accesstoken" });
}

   //xac nhan token hop le
jwt.verify (token, process.env.ACCES_TOKEN_SECRET || 'secret_key', async (err, decodedUser) => {
    if(err) {
        console.log(err);
        return res.status(403).json({ message: "Accesstoken hết hạn hoặc không đúng" });
    }
    

    try {
        // tìm user
        const user = await User.findById(decodedUser.userId).select("-password");
        
        if(!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }


        //tra user ve trong req
        req.user = user;
        next();
    } catch(dbErr) {
        console.error(dbErr);
        return res.status(500).json({ message: "Lỗi hệ thống database" });
    }
});

    }catch(error)   {
        console.error("Lỗi khi xác thực", error)
        return res.status(500).json({ message: "Lỗi hệ thống"})
    }
}

        

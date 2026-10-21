import express from 'express';
import { authMe, updateProfile, updateAvatar, changePassword } from '../controllers/userController.js';
import { protectedRoute } from '../middlewares/authMiddlewares.js';
const router = express.Router();

import multer from 'multer';
import path from 'path';

// Cấu hình Multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get("/me", protectedRoute, authMe);
router.put("/profile", protectedRoute, updateProfile);
router.post("/avatar", protectedRoute, upload.single('avatar'), updateAvatar);
router.put("/password", protectedRoute, changePassword);

export default router;
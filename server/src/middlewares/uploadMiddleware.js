import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../public/uploads/rooms');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `room-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|webp)$/i;
  const isExtValid = allowedExtensions.test(file.originalname);
  const isMimeValid = !file.mimetype || file.mimetype.startsWith('image/') || allowedExtensions.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  } else {
    cb(new Error('ROOM-IMG-002: Tệp tin vượt quá kích thước 5MB hoặc sai định dạng cho phép (chỉ nhận JPG, PNG, WEBP).'));
  }
};

export const uploadRoomImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

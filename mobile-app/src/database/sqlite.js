import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db = null;

// Khởi tạo Database SQLite cho Wishlist offline
export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    // Trên môi trường Web, fallback dùng bộ nhớ in-memory/localStorage nếu SQLite không hỗ trợ
    return null;
  }
  try {
    if (!db) {
      if (typeof SQLite.openDatabaseAsync === 'function') {
        db = await SQLite.openDatabaseAsync('smart_travel.db');
      } else if (typeof SQLite.openDatabaseSync === 'function') {
        db = SQLite.openDatabaseSync('smart_travel.db');
      }
    }

    if (db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS wishlist_rooms (
          roomId TEXT PRIMARY KEY,
          title TEXT,
          city TEXT,
          pricePerNight REAL,
          rating REAL,
          firstImage TEXT,
          savedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          isSynced INTEGER DEFAULT 1
        );
      `);
    }
    return db;
  } catch (error) {
    console.error('Lỗi khởi tạo SQLite database:', error);
    return null;
  }
};

// Thêm phòng vào danh sách yêu thích
export const saveWishlistRoom = async (room) => {
  if (Platform.OS === 'web' || !db) return true;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO wishlist_rooms (roomId, title, city, pricePerNight, rating, firstImage, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        room._id || room.roomId,
        room.title || '',
        room.city || '',
        room.pricePerNight || 0,
        room.rating || 0,
        room.images && room.images.length > 0 ? room.images[0] : (room.firstImage || ''),
      ]
    );
    return true;
  } catch (error) {
    console.error('Lỗi lưu wishlist vào SQLite:', error);
    return false;
  }
};

// Xóa phòng khỏi danh sách yêu thích
export const removeWishlistRoom = async (roomId) => {
  if (Platform.OS === 'web' || !db) return true;
  try {
    await db.runAsync(`DELETE FROM wishlist_rooms WHERE roomId = ?`, [roomId]);
    return true;
  } catch (error) {
    console.error('Lỗi xóa wishlist khỏi SQLite:', error);
    return false;
  }
};

// Kiểm tra xem phòng đã được lưu chưa
export const isRoomWishlisted = async (roomId) => {
  if (Platform.OS === 'web' || !db) return false;
  try {
    const result = await db.getFirstAsync(
      `SELECT roomId FROM wishlist_rooms WHERE roomId = ?`,
      [roomId]
    );
    return !!result;
  } catch (error) {
    return false;
  }
};

// Lấy danh sách toàn bộ ID phòng yêu thích (dùng cho Redux khởi động O(1))
export const getAllWishlistIds = async () => {
  if (Platform.OS === 'web' || !db) return [];
  try {
    const rows = await db.getAllAsync(`SELECT roomId FROM wishlist_rooms`);
    return rows ? rows.map((r) => r.roomId) : [];
  } catch (error) {
    console.error('Lỗi lấy danh sách ID wishlist:', error);
    return [];
  }
};

// Lấy toàn bộ danh sách phòng yêu thích offline
export const getAllWishlistRooms = async () => {
  if (Platform.OS === 'web' || !db) return [];
  try {
    return await db.getAllAsync(`SELECT * FROM wishlist_rooms ORDER BY savedAt DESC`);
  } catch (error) {
    console.error('Lỗi lấy danh sách phòng wishlist:', error);
    return [];
  }
};

export default {
  initDatabase,
  saveWishlistRoom,
  removeWishlistRoom,
  isRoomWishlisted,
  getAllWishlistIds,
  getAllWishlistRooms,
};

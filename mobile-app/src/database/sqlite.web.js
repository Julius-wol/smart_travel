// Keep the existing web fallback without bundling the native SQLite driver.
export const initDatabase = async () => null;
export const saveWishlistRoom = async () => true;
export const removeWishlistRoom = async () => true;
export const isRoomWishlisted = async () => false;
export const getAllWishlistIds = async () => [];
export const getAllWishlistRooms = async () => [];

export default {
  initDatabase,
  saveWishlistRoom,
  removeWishlistRoom,
  isRoomWishlisted,
  getAllWishlistIds,
  getAllWishlistRooms,
};

import api from './api';

// Gọi API lấy danh sách homestay có lọc
export const fetchRoomsApi = async (params = {}) => {
  return await api.get('/rooms', { params });
};

// Gọi API lấy chi tiết homestay
export const fetchRoomDetailApi = async (id) => {
  return await api.get(`/rooms/${id}`);
};

// Gọi API đồng bộ Wishlist
export const toggleWishlistApi = async (roomId) => {
  return await api.post('/wishlist/toggle', { roomId });
};

export default {
  fetchRoomsApi,
  fetchRoomDetailApi,
  toggleWishlistApi,
};

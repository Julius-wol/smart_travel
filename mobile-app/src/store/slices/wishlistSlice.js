import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  saveWishlistRoom,
  removeWishlistRoom,
  getAllWishlistIds,
} from '../../database/sqlite';
import { toggleWishlistApi } from '../../services/roomService';

// Khởi tạo danh sách ID đã like từ SQLite local
export const loadWishlistFromLocalThunk = createAsyncThunk(
  'wishlist/loadFromLocal',
  async () => {
    const ids = await getAllWishlistIds();
    return ids;
  }
);

// Toggle Wishlist (Lưu SQLite + đồng bộ Server)
export const toggleWishlistThunk = createAsyncThunk(
  'wishlist/toggle',
  async ({ room, isCurrentlySaved: passedIsSaved }, { getState }) => {
    const roomId = room._id || room.roomId;
    const state = getState();
    const isCurrentlySaved =
      passedIsSaved !== undefined
        ? passedIsSaved
        : !!state.wishlist.savedRoomIds[roomId];

    if (isCurrentlySaved) {
      await removeWishlistRoom(roomId);
    } else {
      await saveWishlistRoom(room);
    }

    // Đồng bộ Server ngầm
    try {
      await toggleWishlistApi(roomId);
    } catch (e) {
      // Offline hoặc chưa login, dữ liệu vẫn an toàn trong SQLite
    }

    return { roomId, isSaved: !isCurrentlySaved };
  }
);

const initialState = {
  savedRoomIds: {}, // Record<string, boolean> cho tra cứu O(1)
  toastMessage: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWishlistFromLocalThunk.fulfilled, (state, action) => {
        const map = {};
        (action.payload || []).forEach((id) => {
          map[id] = true;
        });
        state.savedRoomIds = map;
      })
      .addCase(toggleWishlistThunk.fulfilled, (state, action) => {
        const { roomId, isSaved } = action.payload;
        if (isSaved) {
          state.savedRoomIds[roomId] = true;
          state.toastMessage = {
            id: 'CR_BOOK_01',
            text: 'Đã thêm phòng vào danh sách yêu thích',
            type: 'success',
          };
        } else {
          delete state.savedRoomIds[roomId];
          state.toastMessage = {
            id: 'CR_BOOK_02',
            text: 'Đã xóa phòng khỏi danh sách yêu thích',
            type: 'info',
          };
        }
      });
  },
});

export const { clearToast } = wishlistSlice.actions;
export default wishlistSlice.reducer;

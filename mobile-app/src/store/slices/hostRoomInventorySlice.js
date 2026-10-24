import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getInventoryApi,
  getRoomByIdApi,
  createRoomApi,
  updateRoomApi,
  toggleStatusApi,
  duplicateRoomApi,
  deleteRoomApi,
  exportExcelApi,
} from '../../services/hostRoomInventoryService';

// 1. Thunk tải danh mục phòng & KPI
export const fetchInventory = createAsyncThunk(
  'hostRoomInventory/fetchInventory',
  async (customParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().hostRoomInventory;
      const params = {
        page: customParams.page !== undefined ? customParams.page : state.pagination.page,
        limit: customParams.limit !== undefined ? customParams.limit : state.pagination.limit,
        search: customParams.search !== undefined ? customParams.search : state.filters.search,
        roomType: customParams.roomType !== undefined ? customParams.roomType : state.filters.roomType,
        status: customParams.status !== undefined ? customParams.status : state.filters.status,
        sort: customParams.sort !== undefined ? customParams.sort : state.filters.sort,
      };
      const response = await getInventoryApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Không thể tải danh sách phòng'
      );
    }
  }
);

// 2. Thunk lấy chi tiết phòng
export const fetchRoomDetail = createAsyncThunk(
  'hostRoomInventory/fetchRoomDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getRoomByIdApi(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể tải chi tiết phòng');
    }
  }
);

// 3. Thunk lưu phòng (Tạo mới hoặc Cập nhật)
export const saveRoom = createAsyncThunk(
  'hostRoomInventory/saveRoom',
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      let response;
      if (id) {
        response = await updateRoomApi(id, roomData);
      } else {
        response = await createRoomApi(roomData);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 4. Thunk đổi trạng thái nhanh
export const toggleRoomStatus = createAsyncThunk(
  'hostRoomInventory/toggleRoomStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await toggleStatusApi(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 5. Thunk nhân bản phòng
export const duplicateRoom = createAsyncThunk(
  'hostRoomInventory/duplicateRoom',
  async (id, { rejectWithValue }) => {
    try {
      const response = await duplicateRoomApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 6. Thunk xóa phòng với cơ chế bảo vệ booking
export const deleteRoom = createAsyncThunk(
  'hostRoomInventory/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteRoomApi(id);
      return response;
    } catch (error) {
      // Trả về error object chứa code: 'ROOM-DEL-001' nếu có đơn đặt trong tương lai
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  rooms: [],
  kpis: {
    totalRooms: 0,
    publishedRooms: 0,
    archivedRooms: 0,
    pendingBookings24h: 0,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {
    search: '',
    roomType: 'ALL',
    status: 'ALL',
    sort: 'newest',
  },
  currentRoom: null,
  loading: false,
  detailLoading: false,
  error: null,
  actionLoading: false,
  alertMessage: null, // { type: 'success' | 'error', text: '', code: '' }
};

export const hostRoomInventorySlice = createSlice({
  name: 'hostRoomInventory',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset về trang 1 khi lọc
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearAlert: (state) => {
      state.alertMessage = null;
    },
    setAlert: (state, action) => {
      state.alertMessage = action.payload;
    },
    resetCurrentRoom: (state) => {
      state.currentRoom = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchInventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.rooms = action.payload.data || [];
          if (action.payload.kpis) {
            state.kpis = action.payload.kpis;
          }
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
        }
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchRoomDetail
      .addCase(fetchRoomDetail.pending, (state) => {
        state.detailLoading = true;
        state.currentRoom = null;
      })
      .addCase(fetchRoomDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentRoom = action.payload;
      })
      .addCase(fetchRoomDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // saveRoom
      .addCase(saveRoom.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(saveRoom.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.alertMessage = {
          type: 'success',
          text: action.payload?.message || 'Cập nhật phòng thành công',
          code: action.payload?.code || 'ROOM-SAVE-001',
        };
      })
      .addCase(saveRoom.rejected, (state, action) => {
        state.actionLoading = false;
        state.alertMessage = {
          type: 'error',
          text: action.payload?.message || 'Lưu phòng thất bại',
          code: action.payload?.code || 'ROOM-ERR-001',
        };
      })
      // toggleRoomStatus
      .addCase(toggleRoomStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleRoomStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const roomId = action.meta.arg?.id;
        const newStatus = action.meta.arg?.status;
        const room = state.rooms.find((r) => (r._id || r.id) === roomId);
        if (room && newStatus) {
          const oldStatus = room.status;
          room.status = newStatus;
          if ((newStatus === 'Published' || newStatus === 'ACTIVE') && oldStatus !== newStatus) {
            state.kpis.publishedRooms += 1;
            state.kpis.archivedRooms = Math.max(0, state.kpis.archivedRooms - 1);
          } else if ((newStatus === 'Archived' || newStatus === 'HIDDEN') && oldStatus !== newStatus) {
            state.kpis.archivedRooms += 1;
            state.kpis.publishedRooms = Math.max(0, state.kpis.publishedRooms - 1);
          }
        }
        state.alertMessage = {
          type: 'success',
          text: action.payload?.message || 'Cập nhật trạng thái thành công',
          code: action.payload?.code || 'ROOM-STA-001',
        };
      })
      .addCase(toggleRoomStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.alertMessage = {
          type: 'error',
          text: action.payload?.message || 'Không thể đổi trạng thái',
          code: action.payload?.code || 'ROOM-ERR-002',
        };
      })
      // duplicateRoom
      .addCase(duplicateRoom.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(duplicateRoom.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.data) {
          state.rooms.unshift(action.payload.data);
          state.kpis.totalRooms += 1;
        }
        state.alertMessage = {
          type: 'success',
          text: action.payload?.message || 'Nhân bản phòng thành công',
          code: action.payload?.code || 'ROOM-DUP-001',
        };
      })
      .addCase(duplicateRoom.rejected, (state, action) => {
        state.actionLoading = false;
        state.alertMessage = {
          type: 'error',
          text: action.payload?.message || 'Không thể nhân bản phòng',
          code: action.payload?.code || 'ROOM-ERR-003',
        };
      })
      // deleteRoom
      .addCase(deleteRoom.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.actionLoading = false;
        const roomId = action.meta.arg;
        state.rooms = state.rooms.filter((r) => (r._id || r.id) !== roomId);
        state.kpis.totalRooms = Math.max(0, state.kpis.totalRooms - 1);
        state.alertMessage = {
          type: 'success',
          text: action.payload?.message || 'Xóa phòng thành công',
          code: action.payload?.code || 'ROOM-DEL-002',
        };
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.actionLoading = false;
        state.alertMessage = {
          type: 'error',
          text: action.payload?.message || 'Không thể xóa phòng',
          code: action.payload?.code || 'ROOM-DEL-001',
        };
      });
  },
});

export const { setFilters, setPage, clearAlert, setAlert, resetCurrentRoom } =
  hostRoomInventorySlice.actions;

export default hostRoomInventorySlice.reducer;

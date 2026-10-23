import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRoomsApi } from '../../services/roomService';

export const fetchRoomsThunk = createAsyncThunk(
  'room/fetchRooms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchRoomsApi(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi tải danh sách phòng');
    }
  }
);

export const loadMoreRoomsThunk = createAsyncThunk(
  'room/loadMoreRooms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchRoomsApi(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi tải thêm phòng');
    }
  }
);

const initialState = {
  rooms: [],
  totalCount: 0,
  page: 1,
  limit: 10,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,
  filters: {
    city: 'Đà Nẵng, Sơn Trà',
    checkIn: null,
    checkOut: null,
    nights: 3,
    guests: 2,
    roomsCount: 1,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    amenities: [],
  },
  activeFilterCount: 0,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Tính toán số lượng filter nâng cao đang áp dụng
      let count = 0;
      if (state.filters.minPrice !== null || state.filters.maxPrice !== null) count++;
      if (state.filters.minRating !== null) count++;
      if (state.filters.roomsCount && state.filters.roomsCount > 1) count++;
      if (state.filters.amenities && state.filters.amenities.length > 0) count += state.filters.amenities.length;
      state.activeFilterCount = count;
      state.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.activeFilterCount = 0;
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRoomsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload?.rooms || [];
        state.totalCount = action.payload?.totalCount || 0;
        state.page = action.payload?.page || 1;
        state.hasMore = action.payload?.hasMore || false;
      })
      .addCase(fetchRoomsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load More Rooms
      .addCase(loadMoreRoomsThunk.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(loadMoreRoomsThunk.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        const newRooms = action.payload?.rooms || [];
        state.rooms = [...state.rooms, ...newRooms];
        state.page = action.payload?.page || state.page + 1;
        state.hasMore = action.payload?.hasMore || false;
      })
      .addCase(loadMoreRoomsThunk.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearError } = roomSlice.actions;
export default roomSlice.reducer;

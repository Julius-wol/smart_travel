import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getHostRoomsApi,
  getHostCalendarApi,
  blockRoomDatesApi,
  unblockRoomDatesApi,
  quickApproveBookingApi,
  quickRejectBookingApi,
} from '../../services/hostCalendarService';

// Async Thunks
export const fetchHostRooms = createAsyncThunk(
  'hostCalendar/fetchRooms',
  async (ownerId, { rejectWithValue }) => {
    try {
      const response = await getHostRoomsApi(ownerId);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchHostCalendar = createAsyncThunk(
  'hostCalendar/fetchCalendar',
  async ({ roomId, month, year }, { rejectWithValue }) => {
    try {
      const response = await getHostCalendarApi(roomId, month, year);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const blockDatesThunk = createAsyncThunk(
  'hostCalendar/blockDates',
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await blockRoomDatesApi(data);
      const state = getState().hostCalendar;
      if (state.selectedRoom) {
        dispatch(
          fetchHostCalendar({
            roomId: state.selectedRoom._id,
            month: state.currentMonth,
            year: state.currentYear,
          })
        );
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const unblockDatesThunk = createAsyncThunk(
  'hostCalendar/unblockDates',
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await unblockRoomDatesApi(data);
      const state = getState().hostCalendar;
      if (state.selectedRoom) {
        dispatch(
          fetchHostCalendar({
            roomId: state.selectedRoom._id,
            month: state.currentMonth,
            year: state.currentYear,
          })
        );
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const quickApproveBookingThunk = createAsyncThunk(
  'hostCalendar/approveBooking',
  async (bookingId, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await quickApproveBookingApi(bookingId);
      const state = getState().hostCalendar;
      if (state.selectedRoom) {
        dispatch(
          fetchHostCalendar({
            roomId: state.selectedRoom._id,
            month: state.currentMonth,
            year: state.currentYear,
          })
        );
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const quickRejectBookingThunk = createAsyncThunk(
  'hostCalendar/rejectBooking',
  async ({ bookingId, rejectReason }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await quickRejectBookingApi(bookingId, rejectReason);
      const state = getState().hostCalendar;
      if (state.selectedRoom) {
        dispatch(
          fetchHostCalendar({
            roomId: state.selectedRoom._id,
            month: state.currentMonth,
            year: state.currentYear,
          })
        );
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const now = new Date();

const initialState = {
  rooms: [],
  selectedRoom: null,
  currentMonth: now.getMonth() + 1,
  currentYear: now.getFullYear(),
  kpi: {
    occupancyRate: 0,
    soldNights: 0,
    availableNights: 0,
    estimatedRevenue: 0,
  },
  calendarDays: [],
  selectedRange: {
    start: null,
    end: null,
  },
  blockModalVisible: false,
  unblockModalVisible: false,
  targetUnblockDate: null,
  activePopoverBooking: null,
  loading: false,
  error: null,
};

const hostCalendarSlice = createSlice({
  name: 'hostCalendar',
  initialState,
  reducers: {
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    changeMonth: (state, action) => {
      let newMonth = state.currentMonth + action.payload;
      let newYear = state.currentYear;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      state.currentMonth = newMonth;
      state.currentYear = newYear;
    },
    resetToCurrentMonth: (state) => {
      const cur = new Date();
      state.currentMonth = cur.getMonth() + 1;
      state.currentYear = cur.getFullYear();
    },
    openBlockModal: (state, action) => {
      state.selectedRange = action.payload || { start: null, end: null };
      state.blockModalVisible = true;
    },
    closeBlockModal: (state) => {
      state.blockModalVisible = false;
      state.selectedRange = { start: null, end: null };
    },
    openUnblockModal: (state, action) => {
      state.targetUnblockDate = action.payload;
      state.unblockModalVisible = true;
    },
    closeUnblockModal: (state) => {
      state.unblockModalVisible = false;
      state.targetUnblockDate = null;
    },
    setActivePopoverBooking: (state, action) => {
      state.activePopoverBooking = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchHostRooms
    builder
      .addCase(fetchHostRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
        if (!state.selectedRoom && action.payload && action.payload.length > 0) {
          state.selectedRoom = action.payload[0];
        }
      })
      .addCase(fetchHostRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể tải danh sách phòng';
      });

    // fetchHostCalendar
    builder
      .addCase(fetchHostCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarDays = action.payload?.days || [];
        state.kpi = action.payload?.kpi || initialState.kpi;
        if (action.payload?.room) {
          state.selectedRoom = {
            ...state.selectedRoom,
            ...action.payload.room,
          };
        }
      })
      .addCase(fetchHostCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi tải lịch phòng';
      });
  },
});

export const {
  setSelectedRoom,
  changeMonth,
  resetToCurrentMonth,
  openBlockModal,
  closeBlockModal,
  openUnblockModal,
  closeUnblockModal,
  setActivePopoverBooking,
  clearError,
} = hostCalendarSlice.actions;

export default hostCalendarSlice.reducer;

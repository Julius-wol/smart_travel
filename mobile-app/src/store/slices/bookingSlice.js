import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createBookingApi, checkAvailabilityApi } from '../../services/bookingService';

export const checkAvailabilityThunk = createAsyncThunk(
  'booking/checkAvailability',
  async ({ roomId, checkIn, checkOut }, { rejectWithValue }) => {
    try {
      const response = await checkAvailabilityApi(roomId, checkIn, checkOut);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createBookingThunk = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      // 1.5s simulated payment delay theo đặc tả SMART-88 CR_BOOK_05
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await createBookingApi(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  schedule: {
    checkIn: '2026-10-25',
    checkOut: '2026-10-27',
    nights: 2,
  },
  guestInfo: {
    fullName: 'Lê Đăng Trung Hiếu',
    phoneNumber: '0987654321',
    email: 'hieu.le@smarttravel.vn',
    hasSpecialNote: true,
    specialNote: 'Xin check-in sớm 13:00 nếu có thể. Cảm ơn!',
  },
  paymentMethod: 'NAPAS_QR',
  pricing: {
    pricePerNight: 1250000,
    nights: 2,
    subtotal: 2500000,
    taxAndServiceFeePercentage: 8,
    totalPrice: 2500000,
  },
  loading: false,
  simulatingPayment: false,
  error: null,
  latestBooking: null,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    updateSchedule: (state, action) => {
      const { checkIn, checkOut, pricePerNight } = action.payload;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const msPerDay = 1000 * 60 * 60 * 24;
      const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay));
      const basePrice = pricePerNight || state.pricing.pricePerNight || 0;
      const subtotal = basePrice * nights;

      state.schedule = {
        checkIn,
        checkOut,
        nights,
      };
      state.pricing = {
        pricePerNight: basePrice,
        nights,
        subtotal,
        taxAndServiceFeePercentage: 8,
        totalPrice: subtotal,
      };
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setGuestInfo: (state, action) => {
      state.guestInfo = {
        ...state.guestInfo,
        ...action.payload,
      };
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    resetBookingState: (state) => {
      state.loading = false;
      state.simulatingPayment = false;
      state.error = null;
      state.latestBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createBookingThunk
      .addCase(createBookingThunk.pending, (state) => {
        state.loading = true;
        state.simulatingPayment = true;
        state.error = null;
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.simulatingPayment = false;
        state.latestBooking = action.payload;
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.loading = false;
        state.simulatingPayment = false;
        state.error = action.payload || {
          code: 'CR_BOOK_03',
          message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.',
        };
      });
  },
});

export const {
  updateSchedule,
  setPaymentMethod,
  setGuestInfo,
  clearBookingError,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;

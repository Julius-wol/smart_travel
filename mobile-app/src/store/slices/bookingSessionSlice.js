import { createSlice } from '@reduxjs/toolkit';

const bookingSessionSlice = createSlice({
  name: 'bookingSession',
  initialState: { recentBooking: null },
  reducers: {
    setRecentBooking(state, action) {
      state.recentBooking = action.payload;
    },
  },
});

export const { setRecentBooking } = bookingSessionSlice.actions;
export default bookingSessionSlice.reducer;

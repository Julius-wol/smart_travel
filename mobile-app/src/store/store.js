import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './slices/roomSlice';
import wishlistReducer from './slices/wishlistSlice';
import hostCalendarReducer from './slices/hostCalendarSlice';
import bookingSessionReducer from './slices/bookingSessionSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    wishlist: wishlistReducer,
    hostCalendar: hostCalendarReducer,
    bookingSession: bookingSessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

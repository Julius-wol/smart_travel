import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './slices/roomSlice';
import wishlistReducer from './slices/wishlistSlice';
import hostCalendarReducer from './slices/hostCalendarSlice';
import hostDashboardReducer from './slices/hostDashboardSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    wishlist: wishlistReducer,
    hostCalendar: hostCalendarReducer,
    hostDashboard: hostDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

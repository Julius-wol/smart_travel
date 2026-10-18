import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './slices/roomSlice';
import wishlistReducer from './slices/wishlistSlice';
import bookingReducer from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    wishlist: wishlistReducer,
    booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

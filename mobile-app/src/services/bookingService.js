import api from './api';

/**
 * Service giao tiếp API đặt phòng & thanh toán (SMART-88)
 */
export const checkAvailabilityApi = async (roomId, checkIn, checkOut) => {
  return await api.get('/bookings/check-availability', {
    params: {
      roomId,
      checkIn,
      checkOut,
    },
  });
};

export const createBookingApi = async (bookingData) => {
  return await api.post('/bookings', bookingData);
};

export default {
  checkAvailabilityApi,
  createBookingApi,
};

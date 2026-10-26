import { API_URL } from '../utils/config';

const requestCheckout = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}/bookings${path}`, {
      ...options,
      signal: controller.signal,
    });
    return { ok: response.ok, status: response.status, body: await response.json() };
  } finally {
    clearTimeout(timeout);
  }
};

export const checkCheckoutAvailability = ({ roomId, checkIn, checkOut }) => {
  const query = Object.entries({ roomId, checkIn, checkOut })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return requestCheckout(`/check-availability?${query}`);
};

export const createCheckoutBooking = (payload, token) => requestCheckout('', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(payload),
});

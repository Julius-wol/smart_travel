import api from '../src/services/api';
import {
  setHostCalendarToken,
  getHostRoomsApi,
  getHostCalendarApi,
  blockRoomDatesApi,
} from '../src/services/hostCalendarService';

afterEach(() => {
  setHostCalendarToken(null);
  jest.restoreAllMocks();
});

test('Host Calendar calls the authenticated API under the configured /api base URL', async () => {
  const get = jest.spyOn(api, 'get').mockResolvedValue({ success: true, data: [] });
  const post = jest.spyOn(api, 'post').mockResolvedValue({ success: true });
  setHostCalendarToken('host-token');

  await getHostRoomsApi();
  await getHostCalendarApi('room-1', 11, 2027);
  await blockRoomDatesApi({ roomId: 'room-1', startDate: '2027-11-10', endDate: '2027-11-10' });

  expect(get).toHaveBeenNthCalledWith(1, '/host/rooms', {
    headers: { Authorization: 'Bearer host-token' },
  });
  expect(get).toHaveBeenNthCalledWith(2, '/host/calendar?roomId=room-1&month=11&year=2027', {
    headers: { Authorization: 'Bearer host-token' },
  });
  expect(post).toHaveBeenCalledWith('/host/calendar/block', expect.any(Object), {
    headers: { Authorization: 'Bearer host-token' },
  });
});

// Repository-owned contract: server/openapi/checkout.yaml. Test fixtures only.
const http = require('http');
const conflictMessage = 'Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác';
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  try {
    const bookings = (await pm.state.get('checkout.bookings')) || [];
    const overlaps = (roomId, start, end) => bookings.some((booking) =>
      booking.roomId === roomId && booking.checkIn < end && booking.checkOut > start);
    if (req.method === 'GET' && url.pathname === '/api/bookings/check-availability') {
      const roomId = url.searchParams.get('roomId');
      const available = !roomId.endsWith('36') && !overlaps(roomId,
        url.searchParams.get('checkIn'), url.searchParams.get('checkOut'));
      return send(200, { success: true, available, data: { isAvailable: available } });
    }
    if (req.method === 'POST' && url.pathname === '/api/bookings') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !body.email || !body.email.includes('@') || (body.specialNote || '').length > 200) {
        return send(400, { success: false, code: 'CR_BOOK_04', message: 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.' });
      }
      // 37 models inventory claimed after the availability snapshot.
      if (body.roomId.endsWith('37') || overlaps(body.roomId, body.checkIn, body.checkOut)) {
        return send(409, { success: false, conflict: true, code: 'CR_BOOK_09', message: conflictMessage });
      }
      const nights = Math.round((Date.parse(body.checkOut) - Date.parse(body.checkIn)) / 86400000);
      const booking = { ...body, nights, totalPrice: nights * 1850000, bookingCode: `ST-${1000 + bookings.length}`, status: 'CONFIRMED' };
      await pm.state.set('checkout.bookings', [...bookings, booking]);
      return send(201, { success: true, bookingCode: booking.bookingCode, data: booking });
    }
    return send(501, { error: 'Endpoint not defined in checkout simulation' });
  } catch (error) {
    return send(500, { success: false, error: error.message });
  }
});
server.listen(process.env.PORT || 4501);

import path from 'node:path';
import ejs from 'ejs';

test('Host Calendar renders inside the shared Host navigation with usable data', async () => {
  const roomId = '607f1f77bcf86cd799439003';
  const html = await ejs.renderFile(path.resolve('views/host/calendar.ejs'), {
    title: 'Lịch phòng & Giá',
    user: { fullName: 'Host', email: 'host@example.com' },
    rooms: [{ _id: roomId, title: 'Room', roomCode: 'RM-1' }],
    selectedRoom: { _id: roomId, title: 'Room', roomCode: 'RM-1' },
    currentMonth: 11,
    currentYear: 2027,
    kpi: { occupancyRate: 0, soldNights: 0, availableNights: 30, estimatedRevenue: 0 },
    calendarDays: [{
      date: '2027-11-01', dayOfMonth: 1, price: 1000000,
      status: 'AVAILABLE', isPast: false, booking: null, block: null,
    }],
    offsetDays: 0,
    empty: false,
  });
  expect(html).toContain('href="/host/dashboard"');
  expect(html).toContain('href="/host/bookings"');
  expect(html).toContain('href="/host/calendar"');
  expect(html).toContain('class="calendar-day available');
  expect(html).toContain('id="calendarData"');
});

test('Host dashboard uses the same sidebar and header shell as Calendar', async () => {
  const chartTimeline = Array.from({ length: 8 }, () => ({
    label: '8/11', fullDate: '8/11/2026', revenue: 0, bookingsCount: 0, details: '0 đơn',
  }));
  const html = await ejs.renderFile(path.resolve('views/host/dashboard.ejs'), {
    title: 'Tổng quan', user: { fullName: 'Host', email: 'host@example.com' },
    hostUser: { name: 'Host', email: 'host@example.com', initials: 'H' },
    period: '30_DAYS', chartRoomId: 'ALL', isNewHost: false, hasPeriodActivity: false,
    slaAlert: { hasPending: false, pendingCount: 0 },
    chartTimeline, chartSummary: { dailyAverageFormatted: '0 đ', peakRevenueFormatted: '0 đ', peakDate: '8/11' },
    kpis: {
      revenue: { formatted: '0 M VND', subtext: '0 đơn' },
      newBookings: { value: 0, subtext: '' },
      occupancyRate: { value: 0, subtext: '' },
      avgRating: { value: 0, subtext: '' },
    },
    schedule: {
      today: { dateLabel: '8 Tháng 11', checkIns: [], checkOuts: [] },
      tomorrow: { dateLabel: '9 Tháng 11', checkIns: [], checkOuts: [] },
    },
    recentReviews: [], hostRooms: [], recentBookings: [],
  });
  expect(html.match(/class="host-sidebar"/g)).toHaveLength(1);
  expect(html).toContain('host/css/host.css');
  expect(html).toContain('host-top-header');
  expect(html).toContain('class="host-nav-item active"');
  expect(html).toContain('href="/host/calendar"');
  expect(html).toContain('id="exportDashboard"');
  expect(html).toContain('DASH-EXPORT-SUCCESS');
  expect(html).toContain('data-state="DASH-EMPTY-DATA"');
  const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  expect(inlineScripts.length).toBeGreaterThan(0);
  inlineScripts.forEach(([, script]) => expect(() => new Function(script)).not.toThrow());
});

import React from 'react';
import renderer from 'react-test-renderer';
import hostDashboardReducer, {
  setPeriod,
  setChartMode,
  setScheduleTab,
  setSelectedRoom,
  setToast,
  clearToast,
} from '../src/store/slices/hostDashboardSlice';
import HostDashboardHeader from '../src/components/dashboard/HostDashboardHeader';
import HostSlaAlertBanner from '../src/components/dashboard/HostSlaAlertBanner';
import HostDashboardKpiCards from '../src/components/dashboard/HostDashboardKpiCards';
import HostRevenueTrendChart from '../src/components/dashboard/HostRevenueTrendChart';
import HostCheckInOutSchedule from '../src/components/dashboard/HostCheckInOutSchedule';
import HostRecentReviews from '../src/components/dashboard/HostRecentReviews';

describe('Host Dashboard Components (SMART-110)', () => {
  it('renders HostDashboardHeader with greeting and time filter', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HostDashboardHeader
          hostName="Robin Nguyen"
          periodLabel="30 ngày qua"
        />
      );
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Xin chào, Robin Nguyen 👋');
    expect(str).toContain('Đây là tình hình kinh doanh của bạn');
    expect(str).toContain('30 ngày qua');
    expect(str).toContain('Xuất báo cáo');
  });

  it('renders HostSlaAlertBanner with urgent booking alert and action link', async () => {
    const mockSla = {
      hasPending: true,
      pendingCount: 2,
      urgentBookingCode: '#BK-9819',
      urgentExpireHours: 3,
    };

    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HostSlaAlertBanner slaAlert={mockSla} />
      );
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('2 đơn chờ duyệt');
    expect(str).toContain('#BK-9819');
    expect(str).toContain('3 giờ');
    expect(str).toContain('Chuyển tới Duyệt đơn');
  });

  it('renders HostDashboardKpiCards with 4 core KPI metrics', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(<HostDashboardKpiCards />);
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Doanh thu');
    expect(str).toContain('45.2 M VND');
    expect(str).toContain('Đơn đặt mới');
    expect(str).toContain('18 đơn');
    expect(str).toContain('Tỷ lệ lấp đầy');
    expect(str).toContain('68%');
    expect(str).toContain('Điểm đánh giá TB');
    expect(str).toContain('4.7 ★');
  });

  it('renders HostRevenueTrendChart with interactive toggle and summary', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HostRevenueTrendChart chartMode="REVENUE" />
      );
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Biểu đồ doanh thu & xu hướng đặt phòng');
    expect(str).toContain('Doanh thu (VNĐ)');
    expect(str).toContain('Số đơn');
    expect(str).toContain('Trung bình ngày:');
    expect(str).toContain('1.506.000 đ');
    expect(str).toContain('Đỉnh doanh thu:');
    expect(str).toContain('7.500.000 đ (Ngày 20/10)');
  });

  it('renders HostCheckInOutSchedule with tabs and guest items', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HostCheckInOutSchedule activeTab="TODAY" />
      );
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Lịch Nhận / Trả phòng');
    expect(str).toContain('Hôm nay');
    expect(str).toContain('Ngày mai');
    expect(str).toContain('Lê Hoàng Nam');
    expect(str).toContain('0912.***.678');
  });

  it('renders HostRecentReviews with top reviews and ratings', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(<HostRecentReviews />);
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Đánh giá mới nhất');
    expect(str).toContain('4.7 / 5.0');
    expect(str).toContain('Xem tất cả');
    expect(str).toContain('Trần Thị Bình');
    expect(str).toContain('Villa Mộng Mơ');
  });

  it('properly updates hostDashboardSlice state through reducers', () => {
    const initialState = hostDashboardReducer(undefined, { type: '@@INIT' });
    expect(initialState.period).toBe('30_DAYS');

    const nextStatePeriod = hostDashboardReducer(initialState, setPeriod('7_DAYS'));
    expect(nextStatePeriod.period).toBe('7_DAYS');
    expect(nextStatePeriod.periodLabel).toBe('7 ngày qua');

    const nextStateChart = hostDashboardReducer(nextStatePeriod, setChartMode('BOOKINGS'));
    expect(nextStateChart.chartMode).toBe('BOOKINGS');

    const nextStateTab = hostDashboardReducer(nextStateChart, setScheduleTab('TOMORROW'));
    expect(nextStateTab.scheduleTab).toBe('TOMORROW');

    const nextStateRoom = hostDashboardReducer(nextStateTab, setSelectedRoom('room-123'));
    expect(nextStateRoom.selectedRoomId).toBe('room-123');

    const nextStateToast = hostDashboardReducer(
      nextStateRoom,
      setToast({ type: 'success', message: 'Test Toast' })
    );
    expect(nextStateToast.toast).toEqual({ type: 'success', message: 'Test Toast' });

    const nextStateClear = hostDashboardReducer(nextStateToast, clearToast());
    expect(nextStateClear.toast).toBeNull();
  });
});

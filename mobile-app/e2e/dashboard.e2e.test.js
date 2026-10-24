import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders } from './helpers/test-utils';
import HostDashboardScreen from '../src/screens/HostDashboardScreen';
import * as hostDashboardService from '../src/services/hostDashboardService';

// Mock hostDashboardService
jest.mock('../src/services/hostDashboardService', () => {
  const getHostDashboardApi = jest.fn();
  const exportDashboardReportApi = jest.fn();

  return {
    __esModule: true,
    getHostDashboardApi,
    exportDashboardReportApi,
    default: {
      getHostDashboardApi,
      exportDashboardReportApi,
    },
  };
});

describe('E2E Integration Journey: Host View Dashboard (SMART-110)', () => {
  const mockDashboardData = {
    host: {
      id: 'host-1',
      name: 'Robin Nguyen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    slaAlert: {
      hasPending: true,
      pendingCount: 2,
      urgentBookingCode: '#BK-9921',
      urgentExpireHours: 4,
    },
    kpis: {
      revenue: {
        value: 45200000,
        formatted: '45.2 M VND',
        changePercent: 12.5,
        trend: 'UP',
        note: '+12.5% so với kỳ trước',
      },
      newBookings: {
        value: 18,
        formatted: '18 đơn',
        changePercent: 8,
        trend: 'UP',
        note: '+8% so với kỳ trước',
      },
      occupancyRate: {
        value: 68,
        formatted: '68%',
        changePercent: 5.2,
        trend: 'UP',
        note: '+5.2% lấp đầy',
      },
      averageRating: {
        value: 4.7,
        formatted: '4.7 ★',
        totalReviews: 24,
        note: '24 lượt đánh giá',
      },
    },
    chart: {
      mode: 'REVENUE',
      dailyAverage: 1500000,
      dailyAverageFormatted: '1.500.000 đ',
      peakRevenue: 5000000,
      peakRevenueFormatted: '5.000.000 đ',
      peakDateFormatted: '15/10',
      timeline: [
        { date: '2026-10-01', revenue: 1200000, bookingsCount: 1, label: '01/10' },
        { date: '2026-10-15', revenue: 5000000, bookingsCount: 2, label: '15/10' },
        { date: '2026-10-24', revenue: 2000000, bookingsCount: 1, label: '24/10' },
      ],
    },
    schedule: {
      today: [
        {
          id: 'b1',
          bookingCode: '#BK-8821',
          type: 'CHECK_IN',
          guestName: 'Phạm Hoàng Sơn',
          maskedPhone: '0912.***.678',
          roomName: 'Phòng Deluxe Hướng Biển (P.302)',
          time: '14:00',
          specialNote: 'Đón sân bay lúc 13:00',
        },
      ],
      tomorrow: [
        {
          id: 'b2',
          bookingCode: '#BK-8815',
          type: 'CHECK_OUT',
          guestName: 'Trần Bảo Anh',
          maskedPhone: '0988.***.321',
          roomName: 'Villa Mộng Mơ (V-102)',
          time: '12:00',
          specialNote: 'Yêu cầu thanh toán bổ sung minibar',
        },
      ],
    },
    recentReviews: [
      {
        id: 'r1',
        guestName: 'Nguyễn Văn A',
        rating: 5,
        roomName: 'Villa Mộng Mơ',
        date: '20/10/2026',
        comment: 'Phòng cực kỳ sạch sẽ, view ngắm hoàng hôn tuyệt đẹp!',
      },
    ],
  };

  const mockNavigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    hostDashboardService.getHostDashboardApi.mockResolvedValue({
      success: true,
      data: mockDashboardData,
    });
    hostDashboardService.exportDashboardReportApi.mockResolvedValue({
      success: true,
      message: 'Xuất file báo cáo thành công [DASH-EXPORT-SUCCESS]',
      downloadUrl: 'https://smarttravel.vn/export/dashboard-202610.xlsx',
    });
  });

  test('E2E Flow: Host opens dashboard, views KPIs, checks SLA alert, and triggers export report', async () => {
    const preloadedState = {
      hostDashboard: {
        period: '30_DAYS',
        periodLabel: '30 ngày qua',
        selectedRoomId: 'ALL',
        chartMode: 'REVENUE',
        scheduleTab: 'TODAY',
        selectedTooltipPoint: null,
        host: mockDashboardData.host,
        slaAlert: mockDashboardData.slaAlert,
        kpis: mockDashboardData.kpis,
        chart: mockDashboardData.chart,
        schedule: mockDashboardData.schedule,
        recentReviews: mockDashboardData.recentReviews,
        loading: false,
        exportLoading: false,
        error: null,
        toast: null,
      },
    };

    await renderWithProviders(
      <HostDashboardScreen navigation={mockNavigation} />,
      { preloadedState }
    );

    // 1. Initial Loading & Data Fetch
    await waitFor(() => {
      expect(hostDashboardService.getHostDashboardApi).toHaveBeenCalled();
    });

    // 2. Verify Header & Host Greeting
    await waitFor(() => {
      expect(screen.getByText(/Xin chào, Robin Nguyen 👋/i)).toBeTruthy();
      expect(screen.getByText(/Đây là tình hình kinh doanh của bạn/i)).toBeTruthy();
    });

    // 3. Verify SLA Alert Banner is visible with 2 pending bookings
    expect(screen.getByText(/2 đơn chờ duyệt/i)).toBeTruthy();
    expect(screen.getByText(/Chuyển tới Duyệt đơn/i)).toBeTruthy();

    // 4. Verify 4 KPI Cards
    expect(screen.getByText('45.2 M VND')).toBeTruthy();
    expect(screen.getByText('18 đơn')).toBeTruthy();
    expect(screen.getByText('68%')).toBeTruthy();
    expect(screen.getByText('4.7 ★')).toBeTruthy();

    // 5. Verify Check-in schedule card
    expect(screen.getByText('Phạm Hoàng Sơn')).toBeTruthy();
    expect(screen.getByText(/0912\.\*\*\*\.678/)).toBeTruthy();

    // 6. Test Switch Tab: Hôm nay -> Ngày mai
    const tomorrowTab = screen.getByText(/Ngày mai \(1\)/i);
    await act(async () => {
      fireEvent.press(tomorrowTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Trần Bảo Anh')).toBeTruthy();
      expect(screen.getByText(/0988\.\*\*\*\.321/)).toBeTruthy();
    });

    // 7. Test Export Report Button
    const exportBtn = screen.getByText('Xuất báo cáo');
    await act(async () => {
      fireEvent.press(exportBtn);
    });

    await waitFor(() => {
      expect(hostDashboardService.exportDashboardReportApi).toHaveBeenCalled();
    });
  });
});

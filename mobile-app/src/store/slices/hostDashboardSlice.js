import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHostDashboardApi, exportDashboardReportApi } from '../../services/hostDashboardService';

// 1. Async Thunk: Tải toàn bộ dữ liệu Dashboard
export const fetchHostDashboard = createAsyncThunk(
  'hostDashboard/fetchHostDashboard',
  async ({ period = '30_DAYS', roomId = 'ALL' } = {}, { rejectWithValue }) => {
    try {
      const response = await getHostDashboardApi(period, roomId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải dữ liệu Dashboard kinh doanh'
      );
    }
  }
);

// 2. Async Thunk: Xuất báo cáo kinh doanh
export const exportReportThunk = createAsyncThunk(
  'hostDashboard/exportReportThunk',
  async (period = '30_DAYS', { rejectWithValue }) => {
    try {
      const response = await exportDashboardReportApi(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi kết xuất báo cáo'
      );
    }
  }
);

const initialState = {
  period: '30_DAYS',
  periodLabel: '30 ngày qua',
  selectedRoomId: 'ALL',
  chartMode: 'REVENUE', // 'REVENUE' | 'BOOKINGS'
  scheduleTab: 'TODAY', // 'TODAY' | 'TOMORROW'
  selectedChartPointIndex: 6, // Mặc định trỏ vào điểm 16/10 (Figma)
  host: {
    name: 'Robin Nguyen',
    email: 'robinnguyen@gmail.com',
    initials: 'RN',
  },
  slaAlert: {
    hasPending: true,
    pendingCount: 2,
    urgentBookingCode: '#BK-9819',
    urgentExpireHours: 3,
    message: 'Bạn có 2 đơn chờ duyệt, trong đó 1 đơn (#BK-9819) sẽ hết hạn sau 3 giờ.',
  },
  kpis: {
    revenue: {
      value: 45200000,
      formatted: '45.2 M VND',
      confirmedBookingsCount: 14,
      subBadge: '14 đơn hoàn thành & đã xác nhận',
    },
    newBookings: {
      count: 18,
      formatted: '18 đơn',
      autoCloseRate: 82,
      subBadge: 'Tỷ lệ chốt đơn tự động 82%',
    },
    occupancyRate: {
      percentage: 68,
      formatted: '68%',
    },
    avgRating: {
      score: 4.7,
      formatted: '4.7 ★',
      totalReviewsCount: 32,
    },
  },
  chart: {
    mode: 'REVENUE',
    selectedRoomId: 'ALL',
    roomsList: [
      { id: 'ALL', title: 'Tất cả 3 phòng' },
      { id: '6ace59ef30cddf9c0815f9bc', title: 'Villa Mộng Mơ H5' },
      { id: '6ace59ef30cddf9c0815f9c5', title: 'The Muse Bohemian Studio' },
      { id: '6ace59ef30cddf9c0815f9c8', title: 'Ocean View Bungalow' },
    ],
    timeline: [
      { date: '2026-09-22', label: '22/09', revenue: 1200000, bookingsCount: 1, details: '1 đơn (The Muse)' },
      { date: '2026-09-26', label: '26/09', revenue: 2400000, bookingsCount: 1, details: '1 đơn (Villa Mộng Mơ)' },
      { date: '2026-09-30', label: '30/09', revenue: 3100000, bookingsCount: 2, details: '2 đơn (Studio & Villa)' },
      { date: '2026-10-04', label: '04/10', revenue: 1800000, bookingsCount: 1, details: '1 đơn (Ocean View)' },
      { date: '2026-10-08', label: '08/10', revenue: 3500000, bookingsCount: 2, details: '2 đơn (Villa Mộng Mơ)' },
      { date: '2026-10-12', label: '12/10', revenue: 2900000, bookingsCount: 2, details: '2 đơn (The Muse & Ocean)' },
      {
        date: '2026-10-15',
        label: '16/10',
        revenue: 5000000,
        bookingsCount: 2,
        details: '2 đơn (Villa Mộng Mơ & Ocean View)',
        isHighlighted: true,
      },
      {
        date: '2026-10-20',
        label: '20/10',
        revenue: 7500000,
        bookingsCount: 3,
        details: '3 đơn (Đỉnh doanh thu ngày phụ nữ)',
        isPeak: true,
      },
    ],
    summary: {
      dailyAverage: 1506000,
      dailyAverageFormatted: '1.506.000 đ',
      peakRevenue: 7500000,
      peakDate: '20/10',
      peakRevenueFormatted: '7.500.000 đ (Ngày 20/10)',
    },
  },
  schedule: {
    activeTab: 'TODAY',
    todayCount: 4,
    tomorrowCount: 2,
    today: [
      {
        id: 'sc-1',
        bookingCode: '#BK-8821',
        guestName: 'Lê Hoàng Nam',
        initials: 'HN',
        roomName: 'Villa Mộng Mơ H5',
        maskedPhone: '0912.***.678',
        type: 'CHECK_IN',
        time: '14:00',
        statusBadge: '🟢 Check-in 14:00',
        specialNote: '',
      },
      {
        id: 'sc-2',
        bookingCode: '#BK-8815',
        guestName: 'Đỗ Thùy Dung',
        initials: 'TĐ',
        roomName: 'Studio Ban Công',
        maskedPhone: '0988.***.321',
        type: 'CHECK_OUT',
        time: '12:00',
        statusBadge: '🔵 Check-out 12:00',
        specialNote: 'Đã bàn giao chìa khóa',
      },
      {
        id: 'sc-3',
        bookingCode: '#BK-8833',
        guestName: 'Phạm Minh Tuấn',
        initials: 'MT',
        roomName: 'Ocean View Bungalow',
        maskedPhone: '0934.***.990',
        type: 'CHECK_IN',
        time: '15:30',
        statusBadge: '🟢 Check-in 15:30',
        specialNote: 'Yêu cầu: Đón tại sân bay',
      },
      {
        id: 'sc-4',
        bookingCode: '#BK-8809',
        guestName: 'Vũ Hoài Thương',
        initials: 'VT',
        roomName: 'Villa Mộng Mơ',
        maskedPhone: '0905.***.456',
        type: 'CHECK_OUT',
        time: '11:30',
        statusBadge: '🔵 Check-out 11:30',
        specialNote: 'Phòng đã dọn sạch',
      },
    ],
    tomorrow: [
      {
        id: 'sc-5',
        bookingCode: '#BK-8840',
        guestName: 'Nguyễn Phương Thảo',
        initials: 'NT',
        roomName: 'Studio Ban Công',
        maskedPhone: '0903.***.112',
        type: 'CHECK_IN',
        time: '14:00',
        statusBadge: '🟢 Check-in 14:00',
        specialNote: 'Check-in tự động Smart Lock',
      },
      {
        id: 'sc-6',
        bookingCode: '#BK-8829',
        guestName: 'Hoàng Quang Anh',
        initials: 'QA',
        roomName: 'Ocean View Bungalow',
        maskedPhone: '0977.***.889',
        type: 'CHECK_OUT',
        time: '12:00',
        statusBadge: '🔵 Check-out 12:00',
        specialNote: 'Hỗ trợ gửi hành lý lễ tân',
      },
    ],
  },
  recentReviews: {
    overallRating: 4.7,
    totalReviews: 32,
    list: [
      {
        id: 'rev-1',
        guestName: 'Trần Thị Bình',
        initials: 'TB',
        rating: 5,
        roomName: 'Villa Mộng Mơ H5',
        date: '13/10/2026',
        comment:
          'Phòng sạch sẽ, view hồ bơi buổi sáng rất đẹp. Chủ nhà nhiệt tình hỗ trợ check-in sớm. Điểm trừ là wifi hơi yếu ở tầng 2.',
      },
      {
        id: 'rev-2',
        guestName: 'Lê Hoàng Nam',
        initials: 'LN',
        rating: 5,
        roomName: 'Villa Mộng Mơ',
        date: '05/11/2026',
        comment:
          'Chuyến nghỉ dưỡng tuyệt vời cho cả gia đình! Bếp nướng BBQ ngoài trời đầy đủ dụng cụ, hồ bơi nước ấm ngắm cảnh cực chill...',
      },
      {
        id: 'rev-3',
        guestName: 'Trần Thị Minh Trang',
        initials: 'MT',
        rating: 5,
        roomName: 'Ocean View Bungalow',
        date: '21/10/2026',
        comment:
          'Kỷ niệm ngày cưới không thể hoàn hảo hơn! Cảm ơn anh Robin đã setup hoa tươi và nến thơm theo yêu cầu...',
      },
    ],
  },
  loading: false,
  exportLoading: false,
  error: null,
  toast: null,
};

export const hostDashboardSlice = createSlice({
  name: 'hostDashboard',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
      switch (action.payload) {
        case 'TODAY':
          state.periodLabel = 'Hôm nay';
          break;
        case '7_DAYS':
          state.periodLabel = '7 ngày qua';
          break;
        case 'THIS_MONTH':
          state.periodLabel = 'Tháng này';
          break;
        case 'LAST_MONTH':
          state.periodLabel = 'Tháng trước';
          break;
        case '30_DAYS':
        default:
          state.periodLabel = '30 ngày qua';
          break;
      }
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoomId = action.payload;
    },
    setChartMode: (state, action) => {
      state.chartMode = action.payload;
    },
    setScheduleTab: (state, action) => {
      state.scheduleTab = action.payload;
    },
    setSelectedChartPoint: (state, action) => {
      state.selectedChartPointIndex = action.payload;
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchHostDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          const d = action.payload.data;
          if (d.host) state.host = d.host;
          if (d.period) state.period = d.period;
          if (d.periodLabel) state.periodLabel = d.periodLabel;
          if (d.slaAlert !== undefined) state.slaAlert = d.slaAlert;
          if (d.kpis) state.kpis = d.kpis;
          if (d.chart) {
            state.chart = {
              ...state.chart,
              ...d.chart,
            };
          }
          if (d.schedule) state.schedule = d.schedule;
          if (d.recentReviews) state.recentReviews = d.recentReviews;
        }
      })
      .addCase(fetchHostDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export Report
      .addCase(exportReportThunk.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportReportThunk.fulfilled, (state) => {
        state.exportLoading = false;
        state.toast = {
          type: 'success',
          code: 'DASH-EXPORT-SUCCESS',
          message: 'Đang kết xuất báo cáo kinh doanh ra file Excel, quá trình tải xuống sẽ bắt đầu ngay.',
        };
      })
      .addCase(exportReportThunk.rejected, (state, action) => {
        state.exportLoading = false;
        state.toast = {
          type: 'error',
          message: action.payload || 'Không thể xuất báo cáo',
        };
      });
  },
});

export const {
  setPeriod,
  setSelectedRoom,
  setChartMode,
  setScheduleTab,
  setSelectedChartPoint,
  setToast,
  clearToast,
} = hostDashboardSlice.actions;

export default hostDashboardSlice.reducer;

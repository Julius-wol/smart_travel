import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHostDashboardApi, exportDashboardReportApi } from '../../services/hostDashboardService';

// 1. Async Thunk: Tải toàn bộ dữ liệu Dashboard
export const fetchHostDashboard = createAsyncThunk(
  'hostDashboard/fetchHostDashboard',
  async ({ period = '30_DAYS', roomId = 'ALL' } = {}, { rejectWithValue }) => {
    try {
      const response = await getHostDashboardApi(period, roomId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Không thể tải dữ liệu Dashboard kinh doanh'
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
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Lỗi khi kết xuất báo cáo'
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
  selectedChartPointIndex: 0,
  host: {
    name: 'Lê Hoàng Host',
    email: 'host@smarttravel.com',
    initials: 'LH',
  },
  slaAlert: null,
  kpis: {
    revenue: {
      value: 0,
      formatted: '0 đ',
      confirmedBookingsCount: 0,
      subBadge: 'Chưa có đơn hoàn thành',
    },
    newBookings: {
      count: 0,
      formatted: '0 đơn',
      autoCloseRate: 100,
      subBadge: 'Tỷ lệ chốt đơn 100%',
    },
    occupancyRate: {
      percentage: 0,
      formatted: '0%',
    },
    avgRating: {
      score: 5.0,
      formatted: '5.0 ★',
      totalReviewsCount: 0,
    },
  },
  chart: {
    mode: 'REVENUE',
    selectedRoomId: 'ALL',
    roomsList: [{ id: 'ALL', title: 'Tất cả phòng' }],
    timeline: [],
    summary: {
      dailyAverage: 0,
      dailyAverageFormatted: '0 đ',
      peakRevenue: 0,
      peakDate: '',
      peakRevenueFormatted: '0 đ',
    },
  },
  schedule: {
    activeTab: 'TODAY',
    todayCount: 0,
    tomorrowCount: 0,
    today: [],
    tomorrow: [],
  },
  recentReviews: {
    overallRating: 5.0,
    totalReviews: 0,
    list: [],
  },
  loading: true,
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
      if (state.chart) {
        state.chart.selectedRoomId = action.payload;
      }
    },
    setChartMode: (state, action) => {
      state.chartMode = action.payload;
      if (state.chart) {
        state.chart.mode = action.payload;
      }
    },
    setScheduleTab: (state, action) => {
      state.scheduleTab = action.payload;
      if (state.schedule) {
        state.schedule.activeTab = action.payload;
      }
    },
    setSelectedChartPointIndex: (state, action) => {
      state.selectedChartPointIndex = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
    clearError: (state) => {
      state.error = null;
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
        const d = action.payload?.data || action.payload;
        if (d) {
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
  setSelectedChartPointIndex,
  clearToast,
  clearError,
} = hostDashboardSlice.actions;

export default hostDashboardSlice.reducer;

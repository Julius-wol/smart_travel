import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders } from './helpers/test-utils';
import HostCalendarScreen from '../src/screens/HostCalendarScreen';
import * as hostCalendarService from '../src/services/hostCalendarService';

// Mock hostCalendarService
jest.mock('../src/services/hostCalendarService', () => {
  const getHostRoomsApi = jest.fn();
  const getHostCalendarApi = jest.fn();
  const blockRoomDatesApi = jest.fn();
  const unblockRoomDatesApi = jest.fn();
  const quickApproveBookingApi = jest.fn();
  const quickRejectBookingApi = jest.fn();

  return {
    __esModule: true,
    getHostRoomsApi,
    getHostCalendarApi,
    blockRoomDatesApi,
    unblockRoomDatesApi,
    quickApproveBookingApi,
    quickRejectBookingApi,
    default: {
      getHostRoomsApi,
      getHostCalendarApi,
      blockRoomDatesApi,
      unblockRoomDatesApi,
      quickApproveBookingApi,
      quickRejectBookingApi,
    },
  };
});

describe('E2E Integration Journey: Host Calendar & Availability (SMART-105)', () => {
  const mockRoom = {
    _id: '67112233445566778899aabb',
    title: 'Villa Mộng Mơ View Hồ & Rừng Thông',
    code: '#P-VL204',
    specs: { bedroom: '4 phòng ngủ' },
    pricePerNight: 2500000,
    weekendPricePerNight: 2800000,
  };

  const mockCalendarData = {
    room: mockRoom,
    month: 11,
    year: 2026,
    kpi: {
      occupancyRate: 78,
      soldNights: 23,
      availableNights: 7,
      estimatedRevenue: 46500000,
    },
    days: [
      {
        date: '2026-11-01',
        dayOfMonth: 1,
        dayOfWeek: 'CN',
        isWeekend: true,
        isPast: false,
        price: 2800000,
        status: 'AVAILABLE',
      },
      {
        date: '2026-11-05',
        dayOfMonth: 5,
        dayOfWeek: 'T5',
        isWeekend: false,
        isPast: false,
        price: 2500000,
        status: 'BOOKED',
        booking: {
          id: 'bk-01',
          bookingCode: '#BK-9750',
          customerName: 'Lê Hoàng Nam',
          phoneNumber: '0912.***.678',
          nights: 3,
          guests: 2,
          totalPrice: 7500000,
        },
      },
      {
        date: '2026-11-10',
        dayOfMonth: 10,
        dayOfWeek: 'T3',
        isWeekend: false,
        isPast: false,
        price: 2500000,
        status: 'PENDING',
        booking: {
          id: 'bk-02',
          bookingCode: '#BK-9821',
          customerName: 'Nguyễn Văn An',
          phoneNumber: '0987.***.123',
          nights: 2,
          guests: 3,
          totalPrice: 5000000,
          specialRequest: 'Xin nhận phòng sớm lúc 13h00 nếu được...',
        },
      },
      {
        date: '2026-11-20',
        dayOfMonth: 20,
        dayOfWeek: 'T6',
        isWeekend: true,
        isPast: false,
        price: 2800000,
        status: 'BLOCKED',
        block: {
          id: 'block-01',
          reason: 'MAINTENANCE',
          reasonLabel: 'Khóa bảo trì',
          internalNote: 'Thay hệ thống bồn vệ sinh cho phòng số 2',
        },
      },
    ],
  };

  const preloadedState = {
    hostCalendar: {
      rooms: [mockRoom],
      selectedRoom: mockRoom,
      currentMonth: 11,
      currentYear: 2026,
      kpi: mockCalendarData.kpi,
      calendarDays: mockCalendarData.days,
      selectedRange: { start: null, end: null },
      blockModalVisible: false,
      unblockModalVisible: false,
      targetUnblockDate: null,
      activePopoverBooking: null,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    hostCalendarService.getHostRoomsApi.mockResolvedValue({
      success: true,
      data: [mockRoom],
    });

    hostCalendarService.getHostCalendarApi.mockResolvedValue({
      success: true,
      data: mockCalendarData,
    });
  });

  it('Journey 1: Host mở màn hình Lịch phòng, tải dữ liệu thành công và hiển thị 4 KPI card', async () => {
    await renderWithProviders(<HostCalendarScreen />, { preloadedState });

    await waitFor(() => {
      // Kiểm tra hiển thị tiêu đề và tên phòng
      expect(screen.getAllByText('Lịch phòng & Trạng thái trống').length).toBeGreaterThan(0);
      expect(screen.getByText('Villa Mộng Mơ View Hồ & Rừng Thông')).toBeTruthy();

      // Kiểm tra 4 thẻ KPI
      expect(screen.getByText('TỶ LỆ LẤP ĐẦY')).toBeTruthy();
      expect(screen.getByText('78%')).toBeTruthy();
      expect(screen.getByText('23')).toBeTruthy(); // Đã bán
      expect(screen.getByText('7')).toBeTruthy(); // Ngày trống
      expect(screen.getByText('46.5M ₫')).toBeTruthy(); // Doanh thu
    });
  });

  it('Journey 2: Host bấm chọn ngày trống mở Modal khóa lịch và khóa ngày thành công', async () => {
    hostCalendarService.blockRoomDatesApi.mockResolvedValue({
      success: true,
      code: 'CAL-BLOCK-SUCCESS',
      message: 'Đã khóa phòng thành công cho các ngày được chọn.',
    });

    await renderWithProviders(<HostCalendarScreen />, { preloadedState });

    // Nhấn vào ô ngày trống 2026-11-01
    await waitFor(() => {
      expect(screen.getByTestId('day-cell-2026-11-01')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('day-cell-2026-11-01'));

    // Chờ modal khóa phòng mở lên
    await waitFor(() => {
      expect(screen.getByText('Khóa lịch đón khách')).toBeTruthy();
      expect(screen.getByTestId('reason-MAINTENANCE')).toBeTruthy();
    }, { timeout: 3000 });

    // Chọn lý do khóa
    await act(async () => {
      fireEvent.press(screen.getByTestId('reason-MAINTENANCE'));
    });

    // Bấm Xác nhận khóa phòng
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-confirm-block'));
    });

    await waitFor(() => {
      expect(hostCalendarService.blockRoomDatesApi).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'MAINTENANCE',
        })
      );
    }, { timeout: 3000 });
  });

  it('Journey 3: Host click ô ngày Chờ duyệt mở Popover và duyệt nhanh đơn SLA thành công', async () => {
    hostCalendarService.quickApproveBookingApi.mockResolvedValue({
      success: true,
      code: 'BOOK-APPROVE-SUCCESS',
      message: 'Đã phê duyệt đơn đặt phòng #BK-9821 thành công.',
    });

    await renderWithProviders(<HostCalendarScreen />, { preloadedState });

    // Click vào ô Chờ duyệt (ngày 2026-11-10)
    await waitFor(() => {
      expect(screen.getByTestId('day-cell-2026-11-10')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('day-cell-2026-11-10'));

    // Chờ popover nổi lên
    await waitFor(() => {
      expect(screen.getByText('CHỜ DUYỆT SLA')).toBeTruthy();
      expect(screen.getAllByText('Nguyễn Văn An').length).toBeGreaterThan(0);
      expect(screen.getByText('5.000.000 VNĐ')).toBeTruthy();
      expect(screen.getByTestId('btn-approve-booking')).toBeTruthy();
    }, { timeout: 3000 });

    // Bấm duyệt đơn
    fireEvent.press(screen.getByTestId('btn-approve-booking'));

    await waitFor(() => {
      expect(hostCalendarService.quickApproveBookingApi).toHaveBeenCalledWith('bk-02');
    }, { timeout: 3000 });
  });

  it('Journey 4: Host click vào ô ngày đã khóa mở Modal mở lại ngày và xác nhận', async () => {
    hostCalendarService.unblockRoomDatesApi.mockResolvedValue({
      success: true,
      code: 'CAL-UNBLOCK-SUCCESS',
      message: 'Đã mở bán lại phòng thành công.',
    });

    await renderWithProviders(<HostCalendarScreen />, { preloadedState });

    // Click vào ô đã khóa (ngày 2026-11-20)
    await waitFor(() => {
      expect(screen.getByTestId('day-cell-2026-11-20')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('day-cell-2026-11-20'));

    // Chờ modal xác nhận mở lại
    await waitFor(() => {
      expect(screen.getByText('Mở lại ngày đón khách')).toBeTruthy();
      expect(screen.getByTestId('btn-confirm-unblock')).toBeTruthy();
    }, { timeout: 3000 });

    // Bấm xác nhận mở lại
    fireEvent.press(screen.getByTestId('btn-confirm-unblock'));

    await waitFor(() => {
      expect(hostCalendarService.unblockRoomDatesApi).toHaveBeenCalledWith({
        roomId: mockRoom._id,
        date: '2026-11-20',
      });
    }, { timeout: 3000 });
  });
});

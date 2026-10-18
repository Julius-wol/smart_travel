import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders, E2EFlowNavigator } from './helpers/test-utils';
import { mockRoomDetail, mockBookingSuccess } from './helpers/mockData';
import * as bookingService from '../src/services/bookingService';

// Mock bookingService
jest.mock('../src/services/bookingService', () => {
  const checkAvailabilityApi = jest.fn();
  const createBookingApi = jest.fn();

  return {
    __esModule: true,
    checkAvailabilityApi,
    createBookingApi,
    default: {
      checkAvailabilityApi,
      createBookingApi,
    },
  };
});

describe('E2E User Journey: Checkout & Payment Flow (SMART-88)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    bookingService.checkAvailabilityApi.mockResolvedValue({
      success: true,
      data: { isAvailable: true },
    });

    bookingService.createBookingApi.mockResolvedValue({
      success: true,
      message: 'Đặt phòng và xác nhận thanh toán thành công!',
      data: mockBookingSuccess,
    });
  });

  it('Journey 1: Người dùng mở màn hình Checkout, hiển thị tóm tắt phòng, lịch trình và thông tin khách điền sẵn', async () => {
    await renderWithProviders(
      <E2EFlowNavigator
        initialRouteName="CheckoutPayment"
        initialParams={{ room: mockRoomDetail }}
      />
    );

    // Chờ màn hình render hoàn tất
    await waitFor(() => {
      expect(screen.getByText('Xác nhận & Đặt phòng')).toBeTruthy();
      expect(screen.getByText('An Nhiên Eco Retreat Đà Nẵng')).toBeTruthy();
    });

    // Kiểm tra thông tin khách điền sẵn
    expect(screen.getByDisplayValue('Lê Đăng Trung Hiếu')).toBeTruthy();
    expect(screen.getByDisplayValue('0987654321')).toBeTruthy();
    expect(screen.getByDisplayValue('hieu.le@smarttravel.vn')).toBeTruthy();

    // Kiểm tra phương thức thanh toán mặc định Napas QR
    expect(screen.getByText('Chuyển khoản QR Napas 24/7')).toBeTruthy();
    expect(screen.getByText('Khuyên dùng')).toBeTruthy();

    // Kiểm tra cam kết bảo vệ 150%
    expect(screen.getByText(/Smart Travel cam kết bồi thường 150%/)).toBeTruthy();
  });

  it('Journey 2: Thay đổi ngày lưu trú -> Hệ thống tự động tính lại số đêm và cập nhật giá tức thì', async () => {
    await renderWithProviders(
      <E2EFlowNavigator
        initialRouteName="CheckoutPayment"
        initialParams={{ room: mockRoomDetail }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('schedule-info-box')).toBeTruthy();
    });

    // Mở modal điều chỉnh ngày
    const scheduleBox = screen.getByTestId('schedule-info-box');
    await act(async () => {
      fireEvent.press(scheduleBox);
    });

    // Chờ modal xuất hiện
    await waitFor(() => {
      expect(screen.getByTestId('checkin-input')).toBeTruthy();
    });

    // Nhập ngày mới: 2026-10-25 đến 2026-10-28 (3 đêm)
    const checkinInput = screen.getByTestId('checkin-input');
    const checkoutInput = screen.getByTestId('checkout-input');

    await act(async () => {
      fireEvent.changeText(checkinInput, '2026-10-25');
      fireEvent.changeText(checkoutInput, '2026-10-28');
    });

    // Bấm nút cập nhật giá
    const applyBtn = screen.getByTestId('apply-dates-btn');
    await act(async () => {
      fireEvent.press(applyBtn);
    });

    // Kiểm tra số đêm và tổng tiền cập nhật
    await waitFor(() => {
      expect(screen.getByText('(3 đêm nghỉ)')).toBeTruthy();
      expect(screen.getByTestId('bottom-bar-price').props.children).toContain('3.750.000');
    });
  });

  it('Journey 3: Nhập sai định dạng SĐT và Email -> Bấm thanh toán bị chặn và hiển thị thông báo lỗi CR_BOOK_04', async () => {
    await renderWithProviders(
      <E2EFlowNavigator
        initialRouteName="CheckoutPayment"
        initialParams={{ room: mockRoomDetail }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('phone-input')).toBeTruthy();
    });

    // Sửa SĐT thành không hợp lệ
    const phoneInput = screen.getByTestId('phone-input');
    await act(async () => {
      fireEvent.changeText(phoneInput, '0123'); // Sai định dạng SĐT
    });

    // Kiểm tra thông báo lỗi hiển thị ngay lập tức
    await waitFor(() => {
      expect(screen.getByTestId('phone-error')).toBeTruthy();
    });

    // Bấm nút Xác nhận & Thanh toán
    const submitBtn = screen.getByTestId('checkout-submit-btn');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    // Xác nhận API tạo đơn không bị gọi khi dữ liệu lỗi
    expect(bookingService.createBookingApi).not.toHaveBeenCalled();
  });

  it('Journey 4: Phòng bị trùng lịch đặt -> Hiển thị thông báo xung đột CR_BOOK_09', async () => {
    // Mock API kiểm tra phòng trả về đã bị đặt (trùng lịch)
    bookingService.checkAvailabilityApi.mockResolvedValueOnce({
      success: true,
      data: { isAvailable: false },
    });

    await renderWithProviders(
      <E2EFlowNavigator
        initialRouteName="CheckoutPayment"
        initialParams={{ room: mockRoomDetail }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('checkout-submit-btn')).toBeTruthy();
    });

    // Bấm nút Xác nhận & Thanh toán
    const submitBtn = screen.getByTestId('checkout-submit-btn');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    // Kiểm tra Toast thông báo xung đột phòng CR_BOOK_09
    await waitFor(() => {
      expect(
        screen.getByText('Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác')
      ).toBeTruthy();
      expect(bookingService.createBookingApi).not.toHaveBeenCalled();
    });
  });

  it('Journey 5: Đặt phòng hợp lệ -> Mô phỏng giao dịch an toàn 1.5s -> Chuyển sang màn hình Booking Result', async () => {
    await renderWithProviders(
      <E2EFlowNavigator
        initialRouteName="CheckoutPayment"
        initialParams={{ room: mockRoomDetail }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('checkout-submit-btn')).toBeTruthy();
    });

    // Bấm nút Xác nhận & Thanh toán
    const submitBtn = screen.getByTestId('checkout-submit-btn');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    // Kiểm tra API tạo đơn được gọi
    await waitFor(
      () => {
        expect(bookingService.checkAvailabilityApi).toHaveBeenCalled();
        expect(bookingService.createBookingApi).toHaveBeenCalled();
      },
      { timeout: 3500 }
    );

    // Kiểm tra chuyển sang màn hình Booking Result
    await waitFor(
      () => {
        expect(screen.getByText('Đặt phòng thành công!')).toBeTruthy();
        expect(screen.getByTestId('booking-code-text').props.children).toBe('ST-5894');
      },
      { timeout: 3500 }
    );
  });
});

import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders, E2EFlowNavigator } from './helpers/test-utils';
import { mockRooms, mockRoomDetail } from './helpers/mockData';
import * as roomService from '../src/services/roomService';

// Mock roomService với __esModule: true để các named imports trong thunks hoạt động chính xác
jest.mock('../src/services/roomService', () => {
  const fetchRoomsApi = jest.fn();
  const fetchRoomDetailApi = jest.fn();
  const toggleWishlistApi = jest.fn();

  return {
    __esModule: true,
    fetchRoomsApi,
    fetchRoomDetailApi,
    toggleWishlistApi,
    default: {
      fetchRoomsApi,
      fetchRoomDetailApi,
      toggleWishlistApi,
    },
  };
});

describe('E2E User Journey: Booking Discovery & Details Flow (SMART-84)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Thiết lập response mặc định cho API danh sách phòng
    roomService.fetchRoomsApi.mockResolvedValue({
      data: {
        rooms: mockRooms,
        totalCount: 2,
        page: 1,
        limit: 10,
        hasMore: false,
      },
    });

    // Thiết lập response mặc định cho API chi tiết phòng
    roomService.fetchRoomDetailApi.mockResolvedValue({
      data: mockRoomDetail,
    });

    // Thiết lập response cho API Wishlist
    roomService.toggleWishlistApi.mockResolvedValue({
      success: true,
      data: { saved: true },
    });
  });

  it('Journey 1: Người dùng khởi động ứng dụng, xem danh sách Homestay và thông tin tổng quan', async () => {
    renderWithProviders(<E2EFlowNavigator />);

    // Chờ API gọi và danh sách homestay hiển thị
    await waitFor(() => {
      expect(roomService.fetchRoomsApi).toHaveBeenCalled();
      expect(screen.getByText('An Nhiên Eco Retreat Đà Nẵng')).toBeTruthy();
    });

    // Kiểm tra các thông tin cốt lõi xuất hiện trên màn hình
    expect(screen.getByText('Sơn Trà Sunset Villa & Studio')).toBeTruthy();
    expect(screen.getByText('2 homestay phù hợp')).toBeTruthy();

    // Kiểm tra hiển thị giá và tag giảm giá
    expect(screen.getByText('1.250.000đ')).toBeTruthy();
    expect(screen.getByText('850.000đ')).toBeTruthy();
  });

  it('Journey 2: Người dùng bấm Trái tim để Lưu/Bỏ lưu homestay yêu thích (Wishlist)', async () => {
    const { store } = renderWithProviders(<E2EFlowNavigator />);

    await waitFor(() => {
      expect(screen.getByText('An Nhiên Eco Retreat Đà Nẵng')).toBeTruthy();
    });

    // Tìm nút Trái tim qua testID
    const heartBtn = screen.getByTestId('wishlist-btn-room_danang_01');
    expect(heartBtn).toBeTruthy();

    // Người dùng bấm lưu phòng đầu tiên vào Wishlist
    await act(async () => {
      fireEvent.press(heartBtn);
    });

    // Kiểm tra Redux state được cập nhật ngay lập tức
    expect(store.getState().wishlist.savedRoomIds['room_danang_01']).toBe(true);

    // Kiểm tra thông báo Toast CR_BOOK_01 hiển thị
    await waitFor(() => {
      expect(screen.getByText('Đã thêm phòng vào danh sách yêu thích')).toBeTruthy();
    });
  });

  it('Journey 3: Người dùng chuyển từ màn hình Discovery sang màn hình RoomDetail và xem chi tiết phòng', async () => {
    renderWithProviders(<E2EFlowNavigator />);

    await waitFor(() => {
      expect(screen.getByText('An Nhiên Eco Retreat Đà Nẵng')).toBeTruthy();
    });

    // Tìm các nút "Xem phòng"
    const viewRoomButtons = screen.getAllByText('Xem phòng');
    expect(viewRoomButtons.length).toBeGreaterThan(0);

    // Người dùng nhấn "Xem phòng" trên Homestay đầu tiên
    await act(async () => {
      fireEvent.press(viewRoomButtons[0]);
    });

    // Kiểm tra API chi tiết phòng được gọi đúng ID
    await waitFor(() => {
      expect(roomService.fetchRoomDetailApi).toHaveBeenCalledWith('room_danang_01');
    });

    // Kiểm tra màn hình chi tiết đã mount và hiển thị đầy đủ thông tin phòng
    await waitFor(() => {
      expect(screen.getByText('Bán đảo Sơn Trà, Đà Nẵng')).toBeTruthy();
      expect(screen.getByText('Đặt phòng ngay')).toBeTruthy();
      expect(screen.getByText('Giới thiệu homestay')).toBeTruthy();
      expect(screen.getByText('Tiện nghi nổi bật')).toBeTruthy();
      expect(screen.getByText('Chính sách hủy phòng')).toBeTruthy();
    });
  });

  it('Journey 4: Người dùng tìm kiếm nhận kết quả trống và bấm "Xóa tất cả bộ lọc"', async () => {
    // Giả lập API trả về kết quả rỗng cho từ khóa không tồn tại
    roomService.fetchRoomsApi.mockResolvedValueOnce({
      data: {
        rooms: [],
        totalCount: 0,
        page: 1,
        limit: 10,
        hasMore: false,
      },
    });

    // Khởi tạo state với địa điểm Côn Đảo (không có phòng)
    renderWithProviders(<E2EFlowNavigator />, {
      preloadedState: {
        room: {
          rooms: [],
          totalCount: 0,
          page: 1,
          limit: 10,
          hasMore: false,
          isLoading: false,
          isLoadingMore: false,
          isRefreshing: false,
          error: null,
          filters: {
            city: 'Côn Đảo',
            checkIn: null,
            checkOut: null,
            nights: 3,
            guests: 2,
            roomsCount: 1,
            minPrice: null,
            maxPrice: null,
            minRating: null,
            amenities: [],
          },
          activeFilterCount: 1,
        },
      },
    });

    // Chờ màn hình Empty State (ZeroResultView) hiển thị
    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy homestay phù hợp')).toBeTruthy();
      expect(screen.getByText('Xóa tất cả bộ lọc')).toBeTruthy();
    });

    // Giả lập API trả về kết quả sau khi reset bộ lọc về mặc định
    roomService.fetchRoomsApi.mockResolvedValueOnce({
      data: {
        rooms: mockRooms,
        totalCount: 2,
        page: 1,
        limit: 10,
        hasMore: false,
      },
    });

    // Người dùng bấm "Xóa tất cả bộ lọc"
    const resetBtn = screen.getByText('Xóa tất cả bộ lọc');
    await act(async () => {
      fireEvent.press(resetBtn);
    });

    // Danh sách homestay được khôi phục
    await waitFor(() => {
      expect(screen.getByText('An Nhiên Eco Retreat Đà Nẵng')).toBeTruthy();
    });
  });
});

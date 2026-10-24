import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders } from './helpers/test-utils';
import HostRoomInventoryScreen from '../src/screens/HostRoomInventoryScreen';
import HostRoomFormScreen from '../src/screens/HostRoomFormScreen';
import * as hostRoomInventoryService from '../src/services/hostRoomInventoryService';

// Mock hostRoomInventoryService
jest.mock('../src/services/hostRoomInventoryService', () => {
  const getInventoryApi = jest.fn();
  const getRoomByIdApi = jest.fn();
  const createRoomApi = jest.fn();
  const updateRoomApi = jest.fn();
  const toggleStatusApi = jest.fn();
  const duplicateRoomApi = jest.fn();
  const deleteRoomApi = jest.fn();
  const exportExcelApi = jest.fn();

  return {
    __esModule: true,
    getInventoryApi,
    getRoomByIdApi,
    createRoomApi,
    updateRoomApi,
    toggleStatusApi,
    duplicateRoomApi,
    deleteRoomApi,
    exportExcelApi,
    default: {
      getInventoryApi,
      getRoomByIdApi,
      createRoomApi,
      updateRoomApi,
      toggleStatusApi,
      duplicateRoomApi,
      deleteRoomApi,
      exportExcelApi,
    },
  };
});

const getMockInventoryData = () => ({
  success: true,
  data: [
    {
      _id: 'room-1',
      id: 'room-1',
      title: 'Luxury Ocean Villa Sơn Trà',
      code: '#P-VL101',
      roomType: 'Villa',
      status: 'Published',
      pricePerNight: 3500000,
      weekendPricePerNight: 3900000,
      city: 'Đà Nẵng',
      district: 'Sơn Trà',
      address: '100 Võ Nguyên Giáp',
      specs: { bedroomCount: 3, bedCount: 3, area: 120 },
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427',
      ],
      pendingBookingsCount: 2,
    },
    {
      _id: 'room-2',
      id: 'room-2',
      title: 'Cozy Riverside Studio Homestay',
      code: '#P-VL102',
      roomType: 'Homestay',
      status: 'Archived',
      pricePerNight: 850000,
      weekendPricePerNight: 950000,
      city: 'Đà Nẵng',
      district: 'Hải Châu',
      address: '45 Bạch Đằng',
      specs: { bedroomCount: 1, bedCount: 1, area: 45 },
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6',
      ],
      pendingBookingsCount: 0,
    },
  ],
  kpis: {
    totalRooms: 12,
    publishedRooms: 10,
    archivedRooms: 2,
    pendingBookings24h: 3,
  },
  pagination: {
    total: 12,
    page: 1,
    limit: 10,
    totalPages: 2,
  },
});

const getFreshState = () => {
  const inv = getMockInventoryData();
  return {
    hostRoomInventory: {
      rooms: inv.data,
      kpis: inv.kpis,
      pagination: inv.pagination,
      filters: { search: '', roomType: 'ALL', status: 'ALL', sort: 'newest' },
      currentRoom: null,
      loading: false,
      detailLoading: false,
      error: null,
      actionLoading: false,
      alertMessage: null,
    },
  };
};

describe('E2E Integration Journey: Manage Room Inventory (SMART-99)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hostRoomInventoryService.getInventoryApi.mockResolvedValue(getMockInventoryData());
  });

  test('Journey 1: Tải và hiển thị danh mục phòng kèm 4 chỉ số KPI chính xác', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    await renderWithProviders(
      <HostRoomInventoryScreen navigation={mockNavigation} />,
      { preloadedState: getFreshState() }
    );

    // 1. Kiểm tra tiêu đề trang
    await waitFor(() => {
      expect(screen.getByText('Quản lý danh mục phòng')).toBeTruthy();
    });

    // 2. Kiểm tra 4 thẻ KPI
    expect(screen.getByText('TỔNG SỐ PHÒNG')).toBeTruthy();
    expect(screen.getByText('ĐANG MỞ BÁN')).toBeTruthy();
    expect(screen.getByText('TẠM DỪNG / BẢO TRÌ')).toBeTruthy();
    expect(screen.getByText('CẦN XỬ LÝ')).toBeTruthy();
    expect(screen.getAllByText('12').length).toBeGreaterThan(0); // totalRooms
    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // publishedRooms

    // 3. Kiểm tra danh sách phòng trong bảng
    expect(screen.getByText('Luxury Ocean Villa Sơn Trà')).toBeTruthy();
    expect(screen.getByText('Cozy Riverside Studio Homestay')).toBeTruthy();
    expect(screen.getAllByText(/3\.500\.000 đ/i).length).toBeGreaterThan(0);
  });

  test('Journey 2: Tìm kiếm và bộ lọc theo loại phòng gửi đúng tham số API', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    await renderWithProviders(
      <HostRoomInventoryScreen navigation={mockNavigation} />,
      { preloadedState: getFreshState() }
    );

    // Nhập từ khóa tìm kiếm
    const searchInput = screen.getByTestId('inventory-search-input');
    await act(async () => {
      fireEvent.changeText(searchInput, 'Ocean Villa');
      fireEvent(searchInput, 'submitEditing', { nativeEvent: { text: 'Ocean Villa' } });
    });

    await waitFor(() => {
      expect(hostRoomInventoryService.getInventoryApi).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Ocean Villa',
          page: 1,
        })
      );
    }, { timeout: 3000 });
  });

  test('Journey 3: Mở modal đổi trạng thái nhanh phòng (Status Confirm Modal)', async () => {
    hostRoomInventoryService.toggleStatusApi.mockResolvedValue({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      code: 'ROOM-STA-001',
    });

    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    await renderWithProviders(
      <HostRoomInventoryScreen navigation={mockNavigation} />,
      { preloadedState: getFreshState() }
    );

    await waitFor(() => {
      expect(screen.getByText('Luxury Ocean Villa Sơn Trà')).toBeTruthy();
    });

    // Click vào pill trạng thái "Đang mở bán" của phòng 1
    const statusPills = screen.getAllByText('Đang mở bán');
    await act(async () => {
      fireEvent.press(statusPills[0]);
    });

    // Modal xác nhận xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Tạm dừng hiển thị phòng?')).toBeTruthy();
      expect(screen.getByText('Xác nhận tạm dừng')).toBeTruthy();
    });

    // Xác nhận tạm dừng
    await act(async () => {
      fireEvent.press(screen.getByText('Xác nhận tạm dừng'));
    });

    await waitFor(() => {
      expect(hostRoomInventoryService.toggleStatusApi).toHaveBeenCalledWith(
        'room-1',
        'Archived'
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Tạm dừng hiển thị phòng?')).toBeNull();
    });
  });

  test('Journey 4: Chặn xóa phòng có booking sắp tới (ROOM-DEL-001) và xóa thành công khi an toàn (ROOM-DEL-002)', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    await renderWithProviders(
      <HostRoomInventoryScreen navigation={mockNavigation} />,
      { preloadedState: getFreshState() }
    );

    // Chờ dữ liệu bảng tải xong
    await waitFor(() => {
      expect(screen.getByText('Luxury Ocean Villa Sơn Trà')).toBeTruthy();
      expect(screen.getByText('Cozy Riverside Studio Homestay')).toBeTruthy();
    });

    // Chờ các button xóa hiển thị
    await waitFor(() => {
      expect(screen.getByTestId('delete-btn-room-1')).toBeTruthy();
      expect(screen.getByTestId('delete-btn-room-2')).toBeTruthy();
    });

    // Phòng 1 có pendingBookingsCount: 2 -> Bấm icon xóa
    const deleteBtn1 = screen.getByTestId('delete-btn-room-1');
    await act(async () => {
      fireEvent.press(deleteBtn1);
    });

    await waitFor(() => {
      expect(screen.getByText('Không thể xóa phòng này!')).toBeTruthy();
      expect(screen.getByText('Đã hiểu')).toBeTruthy();
    });

    // Đóng cảnh báo
    await act(async () => {
      fireEvent.press(screen.getByText('Đã hiểu'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Không thể xóa phòng này!')).toBeNull();
    });

    // Giờ thử với phòng 2 (không có booking)
    hostRoomInventoryService.deleteRoomApi.mockResolvedValue({
      success: true,
      message: 'Xóa phòng thành công',
      code: 'ROOM-DEL-002',
    });

    const deleteBtn2 = screen.getByTestId('delete-btn-room-2');
    await act(async () => {
      fireEvent.press(deleteBtn2);
    });

    await waitFor(() => {
      expect(screen.getByText('Xác nhận xóa vĩnh viễn phòng?')).toBeTruthy();
      expect(screen.getByPlaceholderText("Gõ 'XÓA'...")).toBeTruthy();
    });

    // Nhập từ khóa 'XÓA'
    const keywordInput = screen.getByPlaceholderText("Gõ 'XÓA'...");
    await act(async () => {
      fireEvent.changeText(keywordInput, 'XÓA');
    });

    const confirmDeleteBtn = screen.getByTestId('confirm-delete-btn');
    await act(async () => {
      fireEvent.press(confirmDeleteBtn);
    });

    await waitFor(() => {
      expect(hostRoomInventoryService.deleteRoomApi).toHaveBeenCalledWith('room-2');
    });

    await waitFor(() => {
      expect(screen.queryByText('Xác nhận xóa vĩnh viễn phòng?')).toBeNull();
    });
  });

  test('Journey 5: Màn hình tạo / sửa phòng tính điểm Superhost và lưu thành công', async () => {
    hostRoomInventoryService.createRoomApi.mockResolvedValue({
      success: true,
      data: { _id: 'room-new', title: 'Super Premium Beachfront Danang Villa' },
      code: 'ROOM-SAVE-001',
    });

    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    await renderWithProviders(
      <HostRoomFormScreen route={{ params: { mode: 'create' } }} navigation={mockNavigation} />
    );

    // 1. Kiểm tra các mục của Form 5 phân hệ
    await waitFor(() => {
      expect(screen.getByText('1. Thông tin cơ bản')).toBeTruthy();
      expect(screen.getByText('2. Địa chỉ & Vị trí tọa độ')).toBeTruthy();
      expect(screen.getByText('3. Đơn giá & Mô tả')).toBeTruthy();
      expect(screen.getByText('4. Tiện ích & Dịch vụ nổi bật')).toBeTruthy();
      expect(screen.getByText('Album hình ảnh phòng')).toBeTruthy();
    });

    // 2. Kiểm tra chỉ số Superhost Score Card hiển thị
    expect(screen.getByText('Chỉ số tối ưu Superhost')).toBeTruthy();

    // 3. Nhập thông tin bắt buộc
    const titleInput = screen.getByPlaceholderText('VD: Ocean View Luxury Villa Sơn Trà...');
    await act(async () => {
      fireEvent.changeText(titleInput, 'Super Premium Beachfront Danang Villa');
    });

    const addressInput = screen.getByPlaceholderText('VD: 120 Võ Nguyên Giáp, Phước Mỹ...');
    await act(async () => {
      fireEvent.changeText(addressInput, '99 Hoàng Sa, Sơn Trà, Đà Nẵng');
    });

    // 4. Bấm "Xuất bản phòng"
    const publishBtn = screen.getByTestId('publish-room-btn');
    await act(async () => {
      fireEvent.press(publishBtn);
    });

    await waitFor(() => {
      expect(hostRoomInventoryService.createRoomApi).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Super Premium Beachfront Danang Villa',
          address: '99 Hoàng Sa, Sơn Trà, Đà Nẵng',
          status: 'Published',
        })
      );
    }, { timeout: 3000 });
  });
});

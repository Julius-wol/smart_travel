import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  fetchInventory,
  setFilters,
  setPage,
  toggleRoomStatus,
  duplicateRoom,
  deleteRoom,
  clearAlert,
} from '../store/slices/hostRoomInventorySlice';
import { exportExcelApi } from '../services/hostRoomInventoryService';
import HostSidebar from '../components/calendar/HostSidebar';
import HostTopNav from '../components/calendar/HostTopNav';
import InventoryKpiCards from '../components/inventory/InventoryKpiCards';
import InventoryFilterBar from '../components/inventory/InventoryFilterBar';
import InventoryTable from '../components/inventory/InventoryTable';
import StatusConfirmModal from '../components/inventory/StatusConfirmModal';
import DeleteConfirmModal from '../components/inventory/DeleteConfirmModal';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

const HostRoomInventoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const {
    rooms,
    kpis,
    pagination,
    filters,
    loading,
    actionLoading,
    alertMessage,
  } = useSelector((state) => state.hostRoomInventory);

  const [refreshing, setRefreshing] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState(filters.search || '');
  const [exportLoading, setExportLoading] = useState(false);

  // Modal States
  const [statusModalRoom, setStatusModalRoom] = useState(null);
  const [deleteModalRoom, setDeleteModalRoom] = useState(null);
  const [deleteBlockReason, setDeleteBlockReason] = useState(null);

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchInventory());
    setRefreshing(false);
  }, [dispatch]);

  // Filter handlers
  const handleSearchSubmit = (explicitSearch) => {
    const q = typeof explicitSearch === 'string' ? explicitSearch : searchText;
    dispatch(setFilters({ search: q }));
    dispatch(fetchInventory({ search: q, page: 1 }));
  };

  const handleRoomTypeChange = (newType) => {
    dispatch(setFilters({ roomType: newType }));
    dispatch(fetchInventory({ roomType: newType, page: 1 }));
  };

  const handleStatusChange = (newStatus) => {
    dispatch(setFilters({ status: newStatus }));
    dispatch(fetchInventory({ status: newStatus, page: 1 }));
  };

  const handleSortChange = (newSort) => {
    dispatch(setFilters({ sort: newSort }));
    dispatch(fetchInventory({ sort: newSort, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchText('');
    dispatch(setFilters({ search: '', roomType: 'ALL', status: 'ALL', sort: 'newest' }));
    dispatch(fetchInventory({ search: '', roomType: 'ALL', status: 'ALL', sort: 'newest', page: 1 }));
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    dispatch(fetchInventory({ page: newPage }));
  };

  // Sidebar navigation
  const handleSidebarNavigate = (menuId) => {
    setMobileDrawerVisible(false);
    if (menuId === 'overview') {
      navigation.navigate('HostDashboard');
    } else if (menuId === 'calendar') {
      navigation.navigate('HostCalendar');
    } else if (menuId === 'rooms') {
      // Stay on room inventory
    }
  };

  // Status Modal Action
  const handleConfirmStatusToggle = async (room, targetStatus) => {
    setStatusModalRoom(null);
    await dispatch(toggleRoomStatus({ id: room._id || room.id, status: targetStatus }));
  };

  // Delete Room Action
  const handleConfirmDelete = async (room) => {
    const res = await dispatch(deleteRoom(room._id || room.id));
    if (res.meta.requestStatus === 'rejected') {
      const err = res.payload;
      if (err?.code === 'ROOM-DEL-001' || err?.response?.data?.code === 'ROOM-DEL-001') {
        setDeleteBlockReason(
          err?.message || err?.response?.data?.message || 'Phòng đang có đơn đặt phòng sắp tới. Không thể xóa!'
        );
        return;
      }
    }
    setDeleteModalRoom(null);
    setDeleteBlockReason(null);
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      await exportExcelApi({
        search: filters.search,
        roomType: filters.roomType,
        status: filters.status,
      });
      // Giả lập download thành công
      alert('Đã tải xuống danh sách phòng dạng file Excel/CSV thành công!');
    } catch (error) {
      alert(error.message || 'Lỗi khi kết xuất file Excel');
    } finally {
      setExportLoading(false);
    }
  };

  // Tính toán hiển thị số lượng bản ghi
  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.appLayout}>
        {/* Desktop Sidebar (Fixed 250px) */}
        {isDesktop && (
          <View style={styles.desktopSidebarWrapper}>
            <HostSidebar activeId="rooms" onNavigate={handleSidebarNavigate} />
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.mainContentCol}>
          {/* Top Navigation */}
          <HostTopNav
            breadcrumb="Quản lý phòng • Smart Travel Host Portal"
            onBack={() => navigation.goBack && navigation.goBack()}
            onMenuPress={() => setMobileDrawerVisible(true)}
          />

          {/* Alert Message Toast */}
          {alertMessage && (
            <View
              style={[
                styles.alertToast,
                alertMessage.type === 'error' ? styles.alertError : styles.alertSuccess,
              ]}
            >
              <MaterialCommunityIcons
                name={alertMessage.type === 'error' ? 'alert-circle' : 'check-circle'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.alertToastText}>{alertMessage.text}</Text>
              <TouchableOpacity onPress={() => dispatch(clearAlert())} style={{ marginLeft: 'auto' }}>
                <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00685F']}
                tintColor="#00685F"
              />
            }
          >
            {/* Page Header (Matching Figma 394:1125) */}
            <View style={[styles.headerRow, !isDesktop && styles.mobileHeaderRow]}>
              <View style={styles.headerTextGroup}>
                <Text style={styles.pageTitle}>Quản lý danh mục phòng</Text>
                <Text style={styles.pageSubtitle}>
                  Xem và quản lý trạng thái, giá bán, tiện ích của tất cả các cơ sở lưu trú.
                </Text>
              </View>

              <View style={styles.headerActionGroup}>
                {/* Export Excel Button */}
                <TouchableOpacity
                  style={styles.exportBtn}
                  onPress={handleExportExcel}
                  disabled={exportLoading}
                  activeOpacity={0.7}
                >
                  {exportLoading ? (
                    <ActivityIndicator size="small" color="#00685F" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="file-excel-outline" size={18} color="#00685F" />
                      <Text style={styles.exportBtnText}>Xuất Excel</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Add Room Button */}
                <TouchableOpacity
                  style={styles.addRoomBtn}
                  onPress={() => navigation.navigate('HostRoomForm', { mode: 'create' })}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                  <Text style={styles.addRoomBtnText}>Thêm phòng mới</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4 KPI Cards */}
            <InventoryKpiCards
              kpis={kpis}
              onPendingPress={() => navigation.navigate('HostDashboard')}
            />

            {/* Filter Bar */}
            <InventoryFilterBar
              search={searchText}
              roomType={filters.roomType}
              status={filters.status}
              sort={filters.sort}
              onSearchChange={setSearchText}
              onSearchSubmit={handleSearchSubmit}
              onRoomTypeChange={handleRoomTypeChange}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
              onResetFilters={handleResetFilters}
            />

            {/* Inventory Table */}
            <InventoryTable
              rooms={rooms}
              loading={loading}
              onStatusClick={(room) => setStatusModalRoom(room)}
              onEditRoom={(room) =>
                navigation.navigate('HostRoomForm', {
                  mode: 'edit',
                  roomId: room._id || room.id,
                })
              }
              onCalendarRoom={(room) =>
                navigation.navigate('HostCalendar', { roomId: room._id || room.id })
              }
              onDuplicateRoom={(room) =>
                dispatch(duplicateRoom(room._id || room.id))
              }
              onDeleteRoom={(room) => {
                setDeleteBlockReason(null);
                setDeleteModalRoom(room);
              }}
              onAddRoom={() => navigation.navigate('HostRoomForm', { mode: 'create' })}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination Footer */}
            {pagination.total > 0 && (
              <View style={[styles.paginationRow, !isDesktop && styles.mobilePaginationRow]}>
                <Text style={styles.paginationInfoText}>
                  Hiển thị <Text style={styles.boldText}>{startRecord}</Text> -{' '}
                  <Text style={styles.boldText}>{endRecord}</Text> trong tổng số{' '}
                  <Text style={styles.boldText}>{pagination.total}</Text> phòng
                </Text>

                <View style={styles.paginationButtons}>
                  <TouchableOpacity
                    style={[styles.pageBtn, pagination.page === 1 && styles.pageBtnDisabled]}
                    onPress={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={18}
                      color={pagination.page === 1 ? '#94A3B8' : '#334155'}
                    />
                  </TouchableOpacity>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pageNumberBtn, pagination.page === p && styles.pageNumberBtnActive]}
                      onPress={() => handlePageChange(p)}
                    >
                      <Text
                        style={[
                          styles.pageNumberText,
                          pagination.page === p && styles.pageNumberTextActive,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[
                      styles.pageBtn,
                      pagination.page === pagination.totalPages && styles.pageBtnDisabled,
                    ]}
                    onPress={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={pagination.page === pagination.totalPages ? '#94A3B8' : '#334155'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>

      {/* Status Confirm Modal */}
      <StatusConfirmModal
        visible={!!statusModalRoom}
        room={statusModalRoom}
        loading={actionLoading}
        onClose={() => setStatusModalRoom(null)}
        onConfirm={handleConfirmStatusToggle}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        visible={!!deleteModalRoom}
        room={deleteModalRoom}
        blockReason={deleteBlockReason}
        loading={actionLoading}
        onClose={() => {
          setDeleteModalRoom(null);
          setDeleteBlockReason(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Mobile Drawer Sidebar Modal */}
      {!isDesktop && (
        <Modal
          visible={mobileDrawerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMobileDrawerVisible(false)}
        >
          <View style={styles.drawerBackdrop}>
            <TouchableOpacity
              style={styles.drawerDismissArea}
              activeOpacity={1}
              onPress={() => setMobileDrawerVisible(false)}
            />
            <View style={styles.drawerSidebarContainer}>
              <HostSidebar activeId="rooms" onNavigate={handleSidebarNavigate} />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  desktopSidebarWrapper: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  mainContentCol: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  mobileHeaderRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTextGroup: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
  },
  headerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00685F',
    backgroundColor: '#E6F5F3',
  },
  exportBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#00685F',
  },
  addRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#00685F',
    ...SHADOWS.card,
  },
  addRoomBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#FFFFFF',
  },
  alertToast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 8,
  },
  alertSuccess: {
    backgroundColor: '#16A34A',
  },
  alertError: {
    backgroundColor: '#EF4444',
  },
  alertToastText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#FFFFFF',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
  },
  mobilePaginationRow: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  paginationInfoText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
  },
  boldText: {
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageBtnDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  pageNumberBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageNumberBtnActive: {
    backgroundColor: '#00685F',
    borderColor: '#00685F',
  },
  pageNumberText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#334155',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flexDirection: 'row',
  },
  drawerDismissArea: {
    flex: 1,
  },
  drawerSidebarContainer: {
    width: 250,
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
});

export default HostRoomInventoryScreen;

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHostRooms,
  fetchHostCalendar,
  blockDatesThunk,
  unblockDatesThunk,
  quickApproveBookingThunk,
  setSelectedRoom,
  changeMonth,
  resetToCurrentMonth,
  openBlockModal,
  closeBlockModal,
  openUnblockModal,
  closeUnblockModal,
  setActivePopoverBooking,
  clearError,
} from '../store/slices/hostCalendarSlice';
import HostSidebar from '../components/calendar/HostSidebar';
import HostTopNav from '../components/calendar/HostTopNav';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarKpiCards from '../components/calendar/CalendarKpiCards';
import CalendarLegend from '../components/calendar/CalendarLegend';
import CalendarGridMatrix from '../components/calendar/CalendarGridMatrix';
import BlockDateModal from '../components/calendar/BlockDateModal';
import UnblockDateModal from '../components/calendar/UnblockDateModal';
import QuickBookingPopover from '../components/calendar/QuickBookingPopover';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../constants/theme';

const HostCalendarScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const {
    rooms,
    selectedRoom,
    currentMonth,
    currentYear,
    kpi,
    calendarDays,
    selectedRange,
    blockModalVisible,
    unblockModalVisible,
    targetUnblockDate,
    activePopoverBooking,
    loading,
    error,
  } = useSelector((state) => state.hostCalendar);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' | 'error' | 'info'
  const [refreshing, setRefreshing] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Hiển thị toast thông báo tự ẩn
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Tải danh sách phòng khi mount
  useEffect(() => {
    dispatch(fetchHostRooms());
  }, [dispatch]);

  // 2. Tải lịch khi selectedRoom hoặc tháng/năm thay đổi
  useEffect(() => {
    if (selectedRoom?._id) {
      dispatch(fetchHostCalendar({
        roomId: selectedRoom._id,
        month: currentMonth,
        year: currentYear,
      }));
    }
  }, [dispatch, selectedRoom?._id, currentMonth, currentYear]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedRoom?._id) {
      await dispatch(fetchHostCalendar({
        roomId: selectedRoom._id,
        month: currentMonth,
        year: currentYear,
      }));
    }
    setRefreshing(false);
  }, [dispatch, selectedRoom?._id, currentMonth, currentYear]);

  // Handler khi click chọn ngày trống
  const handleDateClick = (dayItem) => {
    dispatch(openBlockModal({ start: dayItem.date, end: dayItem.date }));
  };

  // Handler khi click ngày trong quá khứ
  const handlePastDateClick = () => {
    showToast(
      'Không thể thực hiện thao tác khóa hoặc mở ngày cho các mốc thời gian trong quá khứ. (CAL-NAV-PAST)',
      'info'
    );
  };

  // Handler xác nhận khóa dải ngày
  const handleConfirmBlock = async ({ startDate, endDate, reason, internalNote }) => {
    if (!selectedRoom?._id) return;
    setIsBlocking(true);
    const resultAction = await dispatch(
      blockDatesThunk({
        roomId: selectedRoom._id,
        startDate,
        endDate,
        reason,
        internalNote,
      })
    );
    setIsBlocking(false);

    if (blockDatesThunk.fulfilled.match(resultAction)) {
      dispatch(closeBlockModal());
      showToast(
        resultAction.payload?.message || 'Đã khóa phòng thành công cho các ngày được chọn. (CAL-BLOCK-SUCCESS)',
        'success'
      );
    } else {
      const err = resultAction.payload;
      if (err?.code === 'CAL-BLOCK-CONFLICT') {
        Alert.alert(
          'Xung đột lịch phòng!',
          err?.message || 'Không thể khóa ngày! Khoảng thời gian này đã có đơn đặt phòng đã xác nhận. Vui lòng kiểm tra lại. (CAL-BLOCK-CONFLICT)',
          [{ text: 'Đã hiểu', style: 'cancel' }]
        );
      } else {
        showToast(err?.message || 'Lỗi khi khóa phòng', 'error');
      }
    }
  };

  // Handler xác nhận mở bán lại ngày đã khóa
  const handleConfirmUnblock = async (date) => {
    if (!selectedRoom?._id) return;
    setIsUnblocking(true);
    const resultAction = await dispatch(
      unblockDatesThunk({
        roomId: selectedRoom._id,
        date,
      })
    );
    setIsUnblocking(false);

    if (unblockDatesThunk.fulfilled.match(resultAction)) {
      dispatch(closeUnblockModal());
      showToast(
        resultAction.payload?.message || 'Đã mở bán lại phòng thành công. Phòng đã sẵn sàng đón khách. (CAL-UNBLOCK-SUCCESS)',
        'success'
      );
    } else {
      showToast(resultAction.payload?.message || 'Lỗi khi mở lại ngày', 'error');
    }
  };

  // Handler duyệt nhanh đơn đặt phòng
  const handleQuickApprove = async (bookingId) => {
    const resultAction = await dispatch(quickApproveBookingThunk(bookingId));
    if (quickApproveBookingThunk.fulfilled.match(resultAction)) {
      dispatch(setActivePopoverBooking(null));
      showToast(
        resultAction.payload?.message || 'Đã phê duyệt đơn đặt phòng thành công! (BOOK-APPROVE-SUCCESS)',
        'success'
      );
    } else {
      showToast(resultAction.payload?.message || 'Lỗi khi duyệt đơn', 'error');
    }
  };

  // Safe back navigation handler
  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate && navigation.navigate('MainTabs', { screen: 'Discovery' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Toast thông báo nổi */}
      {toastMessage && (
        <View
          style={[
            styles.toastContainer,
            toastType === 'error' && styles.toastError,
            toastType === 'info' && styles.toastInfo,
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Bố cục Responsive chuẩn View Dashboard: Cột Sidebar 250px bên TRÁI trên Desktop */}
      <View style={styles.appLayout}>
        {/* Sidebar cố định bên TRÁI trên màn hình Desktop (>= 960px) */}
        {isDesktop && (
          <View style={styles.desktopSidebarWrapper}>
            <HostSidebar
              activeId="calendar"
              onNavigate={(id) => {
                if (id === 'overview') {
                  navigation.navigate('HostDashboard');
                } else if (id === 'rooms') {
                  navigation.navigate('HostRoomInventory');
                } else if (id !== 'calendar') {
                  showToast('Chức năng đang hoàn thiện. Hiện tại ưu tiên Quản lý Lịch phòng & Giá.', 'info');
                }
              }}
            />
          </View>
        )}

        {/* Cột Nội Dung Chính */}
        <View style={styles.mainContentCol}>
          <HostTopNav
            breadcrumb="Lịch phòng & Trạng thái trống • Smart Travel Host Portal"
            user={route?.params?.user}
            onBack={handleBack}
            onMenuPress={() => setMobileDrawerVisible(true)}
            onProfile={() => navigation?.navigate && navigation.navigate('Profile', { user: route?.params?.user, token: route?.params?.token })}
          />

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00796B']} tintColor="#00796B" />
            }
          >
            {/* 1. Tiêu đề trang & Mô tả */}
            <View style={styles.pageHeaderBlock}>
              <Text style={styles.pageTitle}>Lịch phòng & Trạng thái trống</Text>
              <Text style={styles.pageSubtitle}>
                Quản lý tình trạng sẵn có, linh hoạt điều chỉnh biểu giá theo ngày và khóa lịch đón khách tức thì.
              </Text>
            </View>

            {/* 2. Hàng 4 thẻ KPI trải dài full-width (chuẩn View Dashboard) */}
            <CalendarKpiCards kpi={kpi} />

            {/* 3. Thanh điều khiển chọn phòng & Tháng */}
            <CalendarHeader
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelectRoom={(room) => dispatch(setSelectedRoom(room))}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrevMonth={() => dispatch(changeMonth(-1))}
              onNextMonth={() => dispatch(changeMonth(1))}
              onToday={() => dispatch(resetToCurrentMonth())}
            />

            {/* 4. Chú giải trạng thái */}
            <CalendarLegend />

            {/* 5. Lưới lịch ma trận 7 cột */}
            {loading && !refreshing && calendarDays.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00796B" />
                <Text style={styles.loadingText}>Đang tải dữ liệu lịch phòng...</Text>
              </View>
            ) : (
              <CalendarGridMatrix
                days={calendarDays}
                currentMonth={currentMonth}
                currentYear={currentYear}
                selectedRange={selectedRange}
                onDateClick={handleDateClick}
                onPastDateClick={handlePastDateClick}
                onOpenQuickBooking={(booking) => dispatch(setActivePopoverBooking(booking))}
                onOpenUnblock={(date) => dispatch(openUnblockModal(date))}
              />
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>

      {/* Modal Khóa lịch đón khách */}
      <BlockDateModal
        visible={blockModalVisible}
        selectedRange={selectedRange}
        onClose={() => dispatch(closeBlockModal())}
        onConfirmBlock={handleConfirmBlock}
        loading={isBlocking}
      />

      {/* Modal Mở lại ngày đón khách */}
      <UnblockDateModal
        visible={unblockModalVisible}
        targetDate={targetUnblockDate}
        onClose={() => dispatch(closeUnblockModal())}
        onConfirmUnblock={handleConfirmUnblock}
        loading={isUnblocking}
      />

      {/* Popover Duyệt nhanh đơn chờ SLA */}
      <QuickBookingPopover
        visible={!!activePopoverBooking}
        booking={activePopoverBooking}
        onClose={() => dispatch(setActivePopoverBooking(null))}
        onApprove={handleQuickApprove}
        loading={loading}
      />

      {/* Drawer Modal Sidebar bên TRÁI cho màn hình Mobile (< 960px) */}
      {!isDesktop && (
        <Modal
          visible={mobileDrawerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMobileDrawerVisible(false)}
        >
          <View style={styles.drawerOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerHeaderText}>QUẢN TRỊ CƠ SỞ</Text>
                <TouchableOpacity
                  onPress={() => setMobileDrawerVisible(false)}
                  style={styles.drawerCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#1E293B" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <HostSidebar
                  activeId="calendar"
                  onNavigate={(id) => {
                    setMobileDrawerVisible(false);
                    if (id === 'overview') {
                      navigation.navigate('HostDashboard');
                    } else if (id === 'rooms') {
                      navigation.navigate('HostRoomInventory');
                    } else if (id !== 'calendar') {
                      showToast('Chức năng đang hoàn thiện. Hiện tại ưu tiên Lịch phòng & Giá.', 'info');
                    }
                  }}
                />
              </ScrollView>
            </View>
            <TouchableOpacity
              style={styles.drawerBackdrop}
              activeOpacity={1}
              onPress={() => setMobileDrawerVisible(false)}
            />
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
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  mainContentCol: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  pageHeaderBlock: {
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 19,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerContent: {
    width: 270,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  drawerHeaderText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  drawerCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  toastContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -160 }],
    width: 320,
    backgroundColor: 'rgba(11, 28, 48, 0.94)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 18,
    paddingVertical: 12,
    zIndex: 99999,
    ...SHADOWS.card,
  },
  toastError: {
    backgroundColor: '#DC2626',
  },
  toastInfo: {
    backgroundColor: 'rgba(11, 28, 48, 0.94)',
  },
  toastText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HostCalendarScreen;

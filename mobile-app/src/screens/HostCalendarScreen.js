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

      {/* Bố cục Responsive: Web / Desktop vs Mobile */}
      {isDesktop ? (
        <View style={styles.desktopContainer}>
          {/* 1. Left Sidebar */}
          <HostSidebar
            activeId="calendar"
            onNavigate={(id) => {
              if (id === 'overview') {
                navigation.navigate('HostDashboard');
              } else if (id !== 'calendar') {
                showToast('Chức năng đang hoàn thiện. Hiện tại ưu tiên Quản lý Lịch phòng & Giá.', 'info');
              }
            }}
          />

          {/* 2. Right Main Area */}
          <View style={styles.desktopMainCol}>
            <HostTopNav
              user={route?.params?.user}
              onBack={handleBack}
              onProfile={() => navigation?.navigate && navigation.navigate('Profile', { user: route?.params?.user, token: route?.params?.token })}
            />

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.desktopScrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00796B']} />
              }
            >
              {/* Tiêu đề & 4 thẻ KPI nằm ngang theo Figma */}
              <View style={styles.desktopTitleKpiRow}>
                <View style={styles.titleTextCol}>
                  <Text style={styles.pageTitle}>Lịch phòng & Trạng thái trống</Text>
                  <Text style={styles.pageSubtitle}>
                    Quản lý tình trạng sẵn có, linh hoạt điều chỉnh biểu giá theo ngày và khóa lịch đón khách tức thì.
                  </Text>
                </View>

                <CalendarKpiCards kpi={kpi} />
              </View>

              {/* Thanh điều khiển chọn phòng & tháng */}
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

              {/* Chú giải trạng thái */}
              <CalendarLegend />

              {/* Lưới lịch ma trận 7 cột */}
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
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={styles.mobileContainer}>
          {/* Mobile Top Nav */}
          <HostTopNav
            user={route?.params?.user}
            onMenuPress={() => setMobileDrawerVisible(true)}
            onBack={handleBack}
            onProfile={() => navigation?.navigate && navigation.navigate('Profile', { user: route?.params?.user, token: route?.params?.token })}
          />

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00796B']} />
            }
          >
            {/* Tiêu đề trang */}
            <View style={styles.mobileTitleBlock}>
              <Text style={styles.pageTitle}>Lịch phòng & Trạng thái trống</Text>
              <Text style={styles.pageSubtitle}>
                Quản lý tình trạng sẵn có, linh hoạt điều chỉnh biểu giá theo ngày và khóa lịch đón khách tức thì.
              </Text>
            </View>

            {/* 4 Thẻ KPI */}
            <View style={styles.mobileKpiWrap}>
              <CalendarKpiCards kpi={kpi} />
            </View>

            {/* Thanh điều khiển chọn phòng & tháng */}
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

            {/* Chú giải trạng thái */}
            <CalendarLegend />

            {/* Lưới lịch ma trận 7 cột */}
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
          </ScrollView>
        </View>
      )}

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

      {/* Drawer Modal hiển thị HostSidebar trên thiết bị di động */}
      {mobileDrawerVisible && (
        <Modal visible={mobileDrawerVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.mobileDrawerOverlay}
            activeOpacity={1}
            onPress={() => setMobileDrawerVisible(false)}
          >
            <TouchableOpacity
              style={styles.mobileDrawerCard}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.mobileDrawerHeader}>
                <Text style={styles.mobileDrawerHeaderText}>QUẢN TRỊ HOST PORTAL</Text>
                <TouchableOpacity
                  onPress={() => setMobileDrawerVisible(false)}
                  style={styles.mobileDrawerCloseBtn}
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
                    } else if (id !== 'calendar') {
                      showToast('Chức năng đang hoàn thiện. Hiện tại ưu tiên Lịch phòng & Giá.', 'info');
                    }
                  }}
                />
              </ScrollView>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
          </TouchableOpacity>
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
  mobileDrawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.45)',
    flexDirection: 'row',
  },
  mobileDrawerCard: {
    width: 270,
    backgroundColor: '#F0F4FA',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  mobileDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F0F4FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mobileDrawerHeaderText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  mobileDrawerCloseBtn: {
    padding: 4,
  },
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMainCol: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  scrollContainer: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
  },
  mobileScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 60,
  },
  desktopTitleKpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 20,
  },
  titleTextCol: {
    flex: 1,
    maxWidth: 520,
  },
  mobileTitleBlock: {
    marginBottom: 10,
  },
  pageTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textHeading,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    color: COLORS.textBody,
    marginTop: 4,
    lineHeight: 19,
  },
  mobileKpiWrap: {
    marginVertical: 4,
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

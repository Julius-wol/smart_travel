import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchHostDashboard,
  exportReportThunk,
  setPeriod,
  setSelectedRoom,
  setChartMode,
  setScheduleTab,
  clearToast,
} from '../store/slices/hostDashboardSlice';
import HostSidebar from '../components/calendar/HostSidebar';
import HostTopNav from '../components/calendar/HostTopNav';
import HostDashboardHeader from '../components/dashboard/HostDashboardHeader';
import HostSlaAlertBanner from '../components/dashboard/HostSlaAlertBanner';
import HostDashboardKpiCards from '../components/dashboard/HostDashboardKpiCards';
import HostRevenueTrendChart from '../components/dashboard/HostRevenueTrendChart';
import HostCheckInOutSchedule from '../components/dashboard/HostCheckInOutSchedule';
import HostRecentReviews from '../components/dashboard/HostRecentReviews';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

const HostDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isTablet = width >= 768 && width < 960;

  const {
    period,
    periodLabel,
    selectedRoomId,
    chartMode,
    scheduleTab,
    host,
    slaAlert,
    kpis,
    chart,
    schedule,
    recentReviews,
    loading,
    exportLoading,
    toast,
  } = useSelector((state) => state.hostDashboard);

  const [refreshing, setRefreshing] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // 1. Tải dữ liệu Dashboard ban đầu
  useEffect(() => {
    dispatch(fetchHostDashboard({ period, roomId: selectedRoomId }));
  }, [dispatch, period, selectedRoomId]);

  // Tự ẩn toast sau 3.5 giây
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchHostDashboard({ period, roomId: selectedRoomId }));
    setRefreshing(false);
  }, [dispatch, period, selectedRoomId]);

  // Điều hướng từ Sidebar: Chỉ navigate tới màn hình kế tiếp hợp lệ, các mục chưa có để nguyên
  const handleSidebarNavigate = (menuId) => {
    setMobileDrawerVisible(false);
    if (menuId === 'calendar') {
      navigation.navigate('HostCalendar');
    } else if (menuId === 'rooms') {
      navigation.navigate('HostRoomInventory');
    }
    // Các menu khác ('bookings', 'reviews', 'revenue', 'settings'): để nguyên, sẽ code sau
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.appLayout}>
        {/* Sidebar cố định bên TRÁI trên màn hình Desktop (>= 960px) */}
        {isDesktop && (
          <View style={styles.desktopSidebarWrapper}>
            <HostSidebar activeId="overview" onNavigate={handleSidebarNavigate} />
          </View>
        )}

        {/* Nội dung chính màn hình Dashboard */}
        <View style={styles.mainContentCol}>
          {/* Top Navigation Bar */}
          <HostTopNav
            breadcrumb="Tổng quan • Smart Travel Host Portal"
            onBack={() => navigation.goBack && navigation.goBack()}
            onMenuPress={() => setMobileDrawerVisible(true)}
            user={host}
          />

          {/* Toast Notification Bar */}
          {toast && (
            <View
              testID="dashboard-toast"
              style={[
                styles.toastBanner,
                toast.type === 'error' ? styles.toastError : styles.toastSuccess,
              ]}
            >
              <Ionicons
                name={toast.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.toastText}>{toast.message}</Text>
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
            {/* 1. Header Chào Mừng, Bộ Lọc Thời Gian & Nút Xuất Báo Cáo */}
            <HostDashboardHeader
              hostName={host?.name || 'Lê Hoàng Host'}
              selectedPeriod={period}
              periodLabel={periodLabel}
              onSelectPeriod={(p) => dispatch(setPeriod(p))}
              onExport={() => dispatch(exportReportThunk(period))}
              exportLoading={exportLoading}
            />

            {/* 2. SLA Alert Banner (Cảnh báo đơn chờ duyệt khẩn cấp) */}
            <HostSlaAlertBanner slaAlert={slaAlert} />

            {/* 3. Hàng 4 Thẻ KPI Cốt Lõi */}
            <HostDashboardKpiCards kpis={kpis} />

            {/* 4. Biểu Đồ Doanh Thu & Xu Hướng Đặt Phòng */}
            <HostRevenueTrendChart
              chartData={chart}
              chartMode={chartMode}
              onToggleMode={(mode) => dispatch(setChartMode(mode))}
              selectedRoomId={selectedRoomId}
              onSelectRoom={(rId) => dispatch(setSelectedRoom(rId))}
              periodLabel={periodLabel}
            />

            {/* 5. Hai Khối: Lịch Nhận/Trả Phòng & Đánh Giá Mới Nhất */}
            <View style={[styles.bottomColumnsRow, !isDesktop && !isTablet && styles.mobileBottomColumns]}>
              {/* Cột Trái: Lịch Nhận / Trả Phòng */}
              <HostCheckInOutSchedule
                schedule={schedule}
                activeTab={scheduleTab}
                onSwitchTab={(tab) => dispatch(setScheduleTab(tab))}
              />

              {/* Cột Phải: Đánh Giá Mới Nhất */}
              <HostRecentReviews recentReviews={recentReviews} />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>

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
                <HostSidebar activeId="overview" onNavigate={handleSidebarNavigate} />
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
    backgroundColor: '#F8FAFC',
  },
  appLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopSidebarWrapper: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  mainContentCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bottomColumnsRow: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 20,
    marginTop: 16,
  },
  mobileBottomColumns: {
    flexDirection: 'column',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
  },
  toastSuccess: {
    backgroundColor: '#00685F',
  },
  toastError: {
    backgroundColor: '#DC2626',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContent: {
    width: 280,
    backgroundColor: '#FFFFFF',
    height: '100%',
    ...SHADOWS.card,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  drawerHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

export default HostDashboardScreen;

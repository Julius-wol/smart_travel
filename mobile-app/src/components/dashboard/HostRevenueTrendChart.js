import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const HostRevenueTrendChart = ({
  chartData,
  chartMode = 'REVENUE',
  onToggleMode,
  selectedRoomId = 'ALL',
  onSelectRoom,
  periodLabel = '30 ngày qua',
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [roomDropdownVisible, setRoomDropdownVisible] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState(6); // Mặc định điểm 16/10 (Figma)

  const timeline = chartData?.timeline || [
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
    },
    {
      date: '2026-10-20',
      label: '20/10',
      revenue: 7500000,
      bookingsCount: 3,
      details: '3 đơn (Đỉnh doanh thu ngày phụ nữ)',
    },
  ];

  const roomsList = chartData?.roomsList || [
    { id: 'ALL', title: 'Tất cả 3 phòng' },
    { id: '6ace59ef30cddf9c0815f9bc', title: 'Villa Mộng Mơ H5' },
    { id: '6ace59ef30cddf9c0815f9c5', title: 'The Muse Bohemian Studio' },
    { id: '6ace59ef30cddf9c0815f9c8', title: 'Ocean View Bungalow' },
  ];

  const currentRoomTitle =
    roomsList.find((r) => r.id === selectedRoomId)?.title || 'Tất cả 3 phòng';

  const summary = chartData?.summary || {
    dailyAverageFormatted: '1.506.000 đ',
    peakRevenueFormatted: '7.500.000 đ (Ngày 20/10)',
  };

  // Trục Y tối đa
  const maxRevenue = 8000000;
  const maxBookings = 4;
  const chartHeight = 180;

  const yLabels =
    chartMode === 'REVENUE'
      ? ['8tr', '6tr', '4tr', '2tr', '0tr']
      : ['4 đơn', '3 đơn', '2 đơn', '1 đơn', '0 đơn'];

  const selectedPoint = timeline[selectedPointIndex] || timeline[timeline.length - 2];

  return (
    <View style={styles.cardContainer} testID="host-revenue-chart-card">
      {/* 1. Header & Controls (Figma 2.1, 2.2, 2.3) */}
      <View style={[styles.headerRow, isMobile && styles.mobileHeaderRow]}>
        <View style={styles.titleCol}>
          <Text style={styles.chartTitle}>Biểu đồ doanh thu & xu hướng đặt phòng</Text>
          <Text style={styles.chartSubtitle}>Doanh thu theo ngày trong {periodLabel}</Text>
        </View>

        <View style={styles.controlsRow}>
          {/* Segmented Toggle: Doanh thu (VNĐ) vs Số đơn */}
          <View style={styles.segmentedToggle}>
            <TouchableOpacity
              testID="toggle-mode-revenue"
              style={[styles.toggleBtn, chartMode === 'REVENUE' && styles.toggleBtnActive]}
              onPress={() => onToggleMode && onToggleMode('REVENUE')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  chartMode === 'REVENUE' && styles.toggleBtnTextActive,
                ]}
              >
                Doanh thu (VNĐ)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="toggle-mode-bookings"
              style={[styles.toggleBtn, chartMode === 'BOOKINGS' && styles.toggleBtnActive]}
              onPress={() => onToggleMode && onToggleMode('BOOKINGS')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  chartMode === 'BOOKINGS' && styles.toggleBtnTextActive,
                ]}
              >
                Số đơn
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown Lọc theo phòng */}
          <TouchableOpacity
            testID="room-filter-dropdown-btn"
            style={styles.roomSelectBtn}
            onPress={() => setRoomDropdownVisible(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.roomSelectText} numberOfLines={1}>
              {currentRoomTitle}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Interactive Tooltip Nổi (Figma Node 394:1125) */}
      {selectedPoint && (
        <View style={styles.tooltipCard} testID="chart-active-tooltip">
          <View style={styles.tooltipHeader}>
            <Ionicons name="calendar-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.tooltipDate}>{selectedPoint.date}</Text>
          </View>
          <Text style={styles.tooltipValue}>
            {chartMode === 'REVENUE'
              ? formatCurrency(selectedPoint.revenue)
              : `${selectedPoint.bookingsCount} đơn đặt phòng`}
          </Text>
          <Text style={styles.tooltipDetails} numberOfLines={1}>
            {selectedPoint.details}
          </Text>
        </View>
      )}

      {/* 3. Canvas Khu Vực Vẽ Biểu Đồ */}
      <View style={styles.chartCanvasArea}>
        {/* Y-Axis Labels & Horizontal Gridlines */}
        <View style={styles.gridlinesWrapper}>
          {yLabels.map((lbl, idx) => (
            <View key={idx} style={styles.gridlineRow}>
              <Text style={styles.yAxisLabel}>{lbl}</Text>
              <View style={styles.gridlineDash} />
            </View>
          ))}
        </View>

        {/* Data Bars & Points */}
        <View style={styles.plotArea}>
          {timeline.map((item, index) => {
            const isSelected = index === selectedPointIndex;
            const currentVal = chartMode === 'REVENUE' ? item.revenue : item.bookingsCount;
            const maxVal = chartMode === 'REVENUE' ? maxRevenue : maxBookings;
            const ratio = Math.min(1, Math.max(0.08, currentVal / maxVal));
            const barHeight = Math.round(ratio * chartHeight);

            return (
              <TouchableOpacity
                key={item.label}
                testID={`chart-point-${index}`}
                style={styles.plotCol}
                onPress={() => setSelectedPointIndex(index)}
                activeOpacity={0.8}
              >
                {/* Column Visual Fill */}
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: barHeight },
                      isSelected ? styles.barFillSelected : styles.barFillDefault,
                    ]}
                  />
                  {/* Point Marker */}
                  <View
                    style={[
                      styles.pointMarker,
                      { bottom: Math.max(0, barHeight - 6) },
                      isSelected && styles.pointMarkerSelected,
                    ]}
                  />
                </View>

                {/* X-Axis Date Label */}
                <Text style={[styles.xAxisLabel, isSelected && styles.xAxisLabelSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Chart Footer Summary (Figma 2.5) */}
      <View style={styles.chartFooter}>
        <View style={styles.summaryItem}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.summaryLabel}>
            Trung bình ngày:{' '}
            <Text style={styles.summaryValue}>{summary.dailyAverageFormatted}</Text>
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <View style={[styles.statusDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.summaryLabel}>
            Đỉnh doanh thu:{' '}
            <Text style={styles.summaryValue}>{summary.peakRevenueFormatted}</Text>
          </Text>
        </View>
      </View>

      {/* Modal Dropdown Chọn Phòng */}
      <Modal
        visible={roomDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoomDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRoomDropdownVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Lọc theo phòng lưu trú</Text>
            {roomsList.map((r) => {
              const isSelected = r.id === selectedRoomId;
              return (
                <TouchableOpacity
                  key={r.id}
                  testID={`room-opt-${r.id}`}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => {
                    onSelectRoom && onSelectRoom(r.id);
                    setRoomDropdownVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                    {r.title}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#00685F" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mobileHeaderRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleCol: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  roomSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 160,
  },
  roomSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  tooltipCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    alignSelf: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 240,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  tooltipDetails: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  chartCanvasArea: {
    height: 220,
    position: 'relative',
    marginTop: 10,
  },
  gridlinesWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabel: {
    width: 44,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  gridlineDash: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  plotArea: {
    position: 'absolute',
    top: 0,
    left: 48,
    right: 10,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  plotCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 24,
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barFill: {
    width: 14,
    borderRadius: 7,
  },
  barFillDefault: {
    backgroundColor: '#E0F2FE',
  },
  barFillSelected: {
    backgroundColor: '#0284C7',
  },
  pointMarker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0284C7',
  },
  pointMarkerSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderColor: '#0369A1',
    borderWidth: 4,
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  xAxisLabelSelected: {
    color: '#0284C7',
    fontWeight: '800',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  summaryValue: {
    color: '#0F172A',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    ...SHADOWS.card,
  },
  dropdownModalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownItemActive: {
    backgroundColor: '#E8FBF4',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },
});

export default HostRevenueTrendChart;

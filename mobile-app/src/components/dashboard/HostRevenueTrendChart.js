import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
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
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);

  const timeline = chartData?.timeline && chartData.timeline.length > 0 ? chartData.timeline : [];
  const roomsList = chartData?.roomsList && chartData.roomsList.length > 0
    ? chartData.roomsList
    : [{ id: 'ALL', title: 'Tất cả phòng' }];

  const currentRoomTitle =
    roomsList.find((r) => r.id === selectedRoomId)?.title || roomsList[0]?.title || 'Tất cả phòng';

  const summary = chartData?.summary || {
    dailyAverageFormatted: '0 đ',
    peakRevenueFormatted: '0 đ',
  };

  // Trục Y tính toán linh hoạt theo dữ liệu thực tế
  const maxRevValue = timeline.length > 0
    ? Math.max(...timeline.map((t) => t.revenue || 0), 2000000)
    : 2000000;
  const maxRevenue = Math.ceil(maxRevValue / 1000000) * 1000000;

  const maxBookingsVal = timeline.length > 0
    ? Math.max(...timeline.map((t) => t.bookingsCount || 0), 4)
    : 4;
  const maxBookings = Math.max(4, maxBookingsVal);
  const chartHeight = 180;

  const yLabels =
    chartMode === 'REVENUE'
      ? [
          `${(maxRevenue / 1000000).toFixed(0)}tr`,
          `${((maxRevenue * 0.75) / 1000000).toFixed(0)}tr`,
          `${((maxRevenue * 0.5) / 1000000).toFixed(0)}tr`,
          `${((maxRevenue * 0.25) / 1000000).toFixed(0)}tr`,
          '0tr',
        ]
      : [
          `${maxBookings} đơn`,
          `${Math.round(maxBookings * 0.75)} đơn`,
          `${Math.round(maxBookings * 0.5)} đơn`,
          `${Math.round(maxBookings * 0.25)} đơn`,
          '0 đơn',
        ];

  const selectedPoint = timeline[selectedPointIndex] || timeline[timeline.length - 1] || null;

  return (
    <View style={styles.cardContainer} testID="host-revenue-chart-card">
      {/* 1. Header & Controls */}
      <View style={[styles.headerRow, isMobile && styles.mobileHeaderRow]}>
        <View style={styles.titleCol}>
          <Text style={styles.chartTitle}>Biểu đồ doanh thu & xu hướng đặt phòng</Text>
          <Text style={styles.chartSubtitle}>Doanh thu thực tế theo ngày trong {periodLabel}</Text>
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

          {/* Filter Dropdown: Chọn phòng */}
          <TouchableOpacity
            testID="dropdown-room-filter"
            style={styles.roomSelectBtn}
            onPress={() => setRoomDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.roomSelectText} numberOfLines={1}>
              {currentRoomTitle}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Tooltip Điểm Đang Chọn */}
      {selectedPoint && (
        <View style={styles.tooltipContainer} testID="chart-active-tooltip">
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipDate}>Ngày {selectedPoint.label}</Text>
            {selectedPoint.isPeak && (
              <View style={styles.peakBadge}>
                <Ionicons name="flash" size={10} color="#D97706" style={{ marginRight: 2 }} />
                <Text style={styles.peakBadgeText}>Đỉnh doanh thu</Text>
              </View>
            )}
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
          {timeline.length === 0 ? (
            <View style={styles.emptyPlotBox}>
              <Text style={styles.emptyPlotText}>Chưa có phát sinh doanh thu trong khoảng thời gian này</Text>
            </View>
          ) : (
            timeline.map((item, index) => {
              const isSelected = index === selectedPointIndex;
              const currentVal = chartMode === 'REVENUE' ? item.revenue : item.bookingsCount;
              const maxVal = chartMode === 'REVENUE' ? maxRevenue : maxBookings;
              const ratio = Math.min(1, Math.max(0.08, currentVal / maxVal));
              const barHeight = Math.round(ratio * chartHeight);

              return (
                <TouchableOpacity
                  key={item.label + index}
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
            })
          )}
        </View>
      </View>

      {/* 4. Chart Footer Summary */}
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
                  testID={`filter-room-option-${r.id}`}
                  style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                  onPress={() => {
                    onSelectRoom && onSelectRoom(r.id);
                    setRoomDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {r.title}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#00685F" />
                  )}
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
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  mobileHeaderRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    minWidth: 200,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
    gap: 10,
    flexWrap: 'wrap',
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  toggleBtnTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },
  roomSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: 200,
  },
  roomSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tooltipContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
    alignSelf: 'flex-start',
    ...SHADOWS.card,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tooltipDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350F',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  peakBadgeText: {
    fontSize: 9,
    color: '#FDE68A',
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tooltipValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tooltipDetails: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  chartCanvasArea: {
    height: 220,
    marginTop: 12,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridlinesWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  gridlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabel: {
    width: 42,
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'right',
    paddingRight: 6,
  },
  gridlineDash: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  plotArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    marginLeft: 42,
    paddingBottom: 4,
  },
  plotCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barFill: {
    width: 8,
    borderRadius: 4,
  },
  barFillDefault: {
    backgroundColor: '#CBD5E1',
  },
  barFillSelected: {
    backgroundColor: '#00685F',
    width: 10,
  },
  pointMarker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  pointMarkerSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: '#00685F',
    backgroundColor: '#00685F',
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  xAxisLabelSelected: {
    color: '#00685F',
    fontWeight: '700',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
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
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyPlotBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlotText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 360,
    ...SHADOWS.card,
  },
  dropdownModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: '#E8FBF4',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  dropdownOptionTextSelected: {
    color: '#00685F',
    fontWeight: '700',
  },
});

export default HostRevenueTrendChart;

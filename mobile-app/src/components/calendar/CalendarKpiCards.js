import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const CalendarKpiCards = ({ kpi = {} }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const {
    occupancyRate = 78,
    soldNights = 23,
    availableNights = 7,
    estimatedRevenue = 46500000,
  } = kpi;

  // Format doanh thu dạng 46.5M đ
  const formatRevenue = (val) => {
    if (!val || val === 0) return '0 đ';
    if (val >= 1000000) {
      const millions = (val / 1000000).toFixed(1);
      return `${millions.endsWith('.0') ? millions.slice(0, -2) : millions}M đ`;
    }
    return `${val.toLocaleString('vi-VN')} đ`;
  };

  return (
    <View style={[styles.container, isDesktop ? styles.desktopContainer : styles.mobileContainer]}>
      {/* 1. TỶ LỆ LẤP ĐẦY */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>TỶ LỆ LẤP ĐẦY</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#E8FBF4' }]}>
            <MaterialCommunityIcons name="chart-arc" size={17} color="#00685F" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: '#00685F' }]}>
          {occupancyRate}%
        </Text>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Dựa trên số đêm khả dụng</Text>
        </View>
      </View>

      {/* 2. ĐÃ BÁN */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>ĐÃ BÁN</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF4FF' }]}>
            <MaterialCommunityIcons name="bed-outline" size={17} color="#4648D4" />
          </View>
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.kpiValue, { color: '#4648D4' }]}>
            {soldNights}
          </Text>
          <Text style={styles.unitText}>đêm</Text>
        </View>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Đã xác nhận & thanh toán</Text>
        </View>
      </View>

      {/* 3. NGÀY TRỐNG */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>NGÀY TRỐNG</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#E6F4F2' }]}>
            <MaterialCommunityIcons name="calendar-check-outline" size={17} color="#008378" />
          </View>
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.kpiValue, { color: COLORS.textHeading }]}>
            {availableNights}
          </Text>
          <Text style={styles.unitText}>đêm</Text>
        </View>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Sẵn sàng đón khách tức thì</Text>
        </View>
      </View>

      {/* 4. DOANH THU DỰ TÍNH */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>DOANH THU DỰ TÍNH</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
            <MaterialCommunityIcons name="cash-multiple" size={17} color="#D97706" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: COLORS.textHeading }]}>
          {formatRevenue(estimatedRevenue)}
        </Text>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Ước tính tháng hiện tại</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  desktopContainer: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'nowrap',
  },
  mobileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  desktopCard: {
    flex: 1,
    minWidth: 160,
  },
  mobileCard: {
    width: '48.5%',
    minHeight: 90,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kpiValue: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textHeading,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  unitText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  subBadgeWrap: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subBadgeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default CalendarKpiCards;

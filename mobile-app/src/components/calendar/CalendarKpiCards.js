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
          <View style={[styles.iconCircle, { backgroundColor: '#E6F4F2' }]}>
            <MaterialCommunityIcons name="chart-arc" size={14} color="#00685F" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: '#00685F' }]}>
          {occupancyRate}%
        </Text>
      </View>

      {/* 2. ĐÃ BÁN */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>ĐÃ BÁN</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#E5EEFF' }]}>
            <MaterialCommunityIcons name="bed-outline" size={14} color="#4648D4" />
          </View>
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.kpiValue, { color: '#4648D4' }]}>
            {soldNights}
          </Text>
          <Text style={styles.unitText}>đêm</Text>
        </View>
      </View>

      {/* 3. NGÀY TRỐNG */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>NGÀY TRỐNG</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#E8FBF4' }]}>
            <MaterialCommunityIcons name="calendar-check-outline" size={14} color="#008378" />
          </View>
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.kpiValue, { color: COLORS.textHeading }]}>
            {availableNights}
          </Text>
          <Text style={styles.unitText}>đêm</Text>
        </View>
      </View>

      {/* 4. DOANH THU DỰ TÍNH */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>DOANH THU DỰ TÍNH</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF4FF' }]}>
            <MaterialCommunityIcons name="cash-multiple" size={14} color="#0B1C30" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: COLORS.textHeading }]}>
          {formatRevenue(estimatedRevenue)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  desktopContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mobileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EFFD',
    justifyContent: 'space-between',
    ...SHADOWS.chip,
  },
  desktopCard: {
    flex: 1,
    minWidth: 130,
  },
  mobileCard: {
    width: '48.5%',
    minHeight: 74,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kpiValue: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textHeading,
    letterSpacing: -0.4,
  },
  unitText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 3,
  },
});

export default CalendarKpiCards;

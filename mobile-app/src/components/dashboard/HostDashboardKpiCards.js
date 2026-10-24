import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const HostDashboardKpiCards = ({ kpis }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isMobile = width < 600;

  const revenue = kpis?.revenue || {
    formatted: '45.2 M VND',
    subBadge: '14 đơn hoàn thành & đã xác nhận',
  };

  const newBookings = kpis?.newBookings || {
    formatted: '18 đơn',
    subBadge: 'Tỷ lệ chốt đơn tự động 82%',
  };

  const occupancyRate = kpis?.occupancyRate || {
    formatted: '68%',
  };

  const avgRating = kpis?.avgRating || {
    formatted: '4.7 ★',
  };

  const cards = [
    {
      id: 'kpi-revenue',
      title: 'Doanh thu',
      value: revenue.formatted,
      subBadge: revenue.subBadge,
      iconName: 'cash-multiple',
      iconColor: '#00685F',
      iconBg: '#E8FBF4',
    },
    {
      id: 'kpi-bookings',
      title: 'Đơn đặt mới',
      value: newBookings.formatted,
      subBadge: newBookings.subBadge,
      iconName: 'calendar-check',
      iconColor: '#4648D4',
      iconBg: '#EFF4FF',
    },
    {
      id: 'kpi-occupancy',
      title: 'Tỷ lệ lấp đầy',
      value: occupancyRate.formatted,
      subBadge: 'Dựa trên số đêm khả dụng',
      iconName: 'chart-pie',
      iconColor: '#D97706',
      iconBg: '#FFFBEB',
    },
    {
      id: 'kpi-rating',
      title: 'Điểm đánh giá TB',
      value: avgRating.formatted,
      subBadge: 'Dựa trên 32 đánh giá',
      iconName: 'star',
      iconColor: '#CA8A04',
      iconBg: '#FEF9C3',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
        {cards.map((item) => (
          <View
            key={item.id}
            testID={item.id}
            style={[
              styles.card,
              isDesktop ? styles.desktopCard : isMobile ? styles.mobileCard : styles.tabletCard,
            ]}
          >
            {/* Header: Title + Icon */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <MaterialCommunityIcons name={item.iconName} size={18} color={item.iconColor} />
              </View>
            </View>

            {/* Value */}
            <Text style={styles.cardValue}>{item.value}</Text>

            {/* Sub-badge */}
            {item.subBadge ? (
              <View style={styles.subBadgeWrap}>
                <Text style={styles.subBadgeText}>{item.subBadge}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  desktopGrid: {
    flexWrap: 'nowrap',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  desktopCard: {
    flex: 1,
  },
  tabletCard: {
    width: '48%',
  },
  mobileCard: {
    width: '47.5%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C30',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: -0.4,
    marginVertical: 4,
  },
  subBadgeWrap: {
    marginTop: 4,
  },
  subBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default HostDashboardKpiCards;

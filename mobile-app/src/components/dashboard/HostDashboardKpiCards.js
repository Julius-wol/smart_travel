import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const HostDashboardKpiCards = ({ kpis }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isMobile = width < 600;

  const revenue = kpis?.revenue || {
    formatted: '0 đ',
    subBadge: 'Chưa có đơn hoàn thành',
  };

  const newBookings = kpis?.newBookings || {
    formatted: '0 đơn',
    subBadge: 'Tỷ lệ chốt đơn 100%',
  };

  const occupancyRate = kpis?.occupancyRate || {
    formatted: '0%',
  };

  const avgRating = kpis?.avgRating || {
    formatted: '5.0 ★',
  };

  const totalReviewsCount = kpis?.avgRating?.totalReviewsCount !== undefined ? kpis.avgRating.totalReviewsCount : 0;

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
      subBadge: `Dựa trên ${totalReviewsCount} đánh giá`,
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
                {item.iconName === 'star' ? (
                  <Ionicons name="star" size={18} color={item.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={item.iconName} size={18} color={item.iconColor} />
                )}
              </View>
            </View>

            {/* KPI Main Value */}
            <Text style={styles.cardValue}>{item.value}</Text>

            {/* Sub-label Badge */}
            {item.subBadge ? (
              <View style={styles.subBadgeBox}>
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
    marginHorizontal: 20,
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
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  desktopCard: {
    flex: 1,
    minWidth: 180,
  },
  tabletCard: {
    width: '48%',
  },
  mobileCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subBadgeBox: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  subBadgeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
});

export default HostDashboardKpiCards;

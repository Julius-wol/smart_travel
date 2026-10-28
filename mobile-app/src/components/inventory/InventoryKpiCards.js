import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const InventoryKpiCards = ({ kpis = {}, onPendingPress }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const {
    totalRooms = 0,
    publishedRooms = 0,
    archivedRooms = 0,
    pendingBookings24h = 0,
  } = kpis;

  return (
    <View style={[styles.container, isDesktop ? styles.desktopContainer : styles.mobileContainer]}>
      {/* 1. TỔNG SỐ PHÒNG */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>TỔNG SỐ PHÒNG</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#E6F5F3' }]}>
            <MaterialCommunityIcons name="home-city-outline" size={17} color="#00685F" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: '#0F172A' }]}>{totalRooms}</Text>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Tất cả cơ sở lưu trú</Text>
        </View>
      </View>

      {/* 2. ĐANG MỞ BÁN */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>ĐANG MỞ BÁN</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={17} color="#16A34A" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: '#16A34A' }]}>{publishedRooms}</Text>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Sẵn sàng nhận khách</Text>
        </View>
      </View>

      {/* 3. TẠM DỪNG / BẢO TRÌ */}
      <View style={[styles.kpiCard, isDesktop ? styles.desktopCard : styles.mobileCard]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.kpiLabel}>TẠM DỪNG / BẢO TRÌ</Text>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <MaterialCommunityIcons name="pause-circle-outline" size={17} color="#D97706" />
          </View>
        </View>
        <Text style={[styles.kpiValue, { color: '#D97706' }]}>{archivedRooms}</Text>
        <View style={styles.subBadgeWrap}>
          <Text style={styles.subBadgeText}>Không hiển thị tìm kiếm</Text>
        </View>
      </View>

      {/* 4. ĐƠN CHỜ DUYỆT MỚI (LAVENDER HIGHLIGHT) */}
      <View
        style={[
          styles.kpiCard,
          styles.pendingCard,
          isDesktop ? styles.desktopCard : styles.mobileCard,
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.pendingLabelBadge}>
            <Text style={styles.pendingBadgeText}>CẦN XỬ LÝ</Text>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
            <MaterialCommunityIcons name="bell-ring-outline" size={17} color="#7C3AED" />
          </View>
        </View>
        <View style={styles.pendingValueRow}>
          <Text style={[styles.kpiValue, { color: '#6D28D9' }]}>{pendingBookings24h}</Text>
          <Text style={styles.pendingUnitText}>đơn mới</Text>
        </View>
        <TouchableOpacity
          style={styles.pendingLinkRow}
          onPress={onPendingPress}
          activeOpacity={0.7}
        >
          <Text style={styles.pendingLinkText}>Xem danh sách yêu cầu</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color="#6D28D9" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  desktopContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  mobileContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    ...SHADOWS.card,
  },
  desktopCard: {
    flex: 1,
  },
  mobileCard: {
    width: '100%',
  },
  pendingCard: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    lineHeight: 32,
    marginBottom: 6,
  },
  subBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subBadgeText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#94A3B8',
  },
  pendingLabelBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  pendingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  pendingUnitText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#7C3AED',
  },
  pendingLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pendingLinkText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#6D28D9',
  },
});

export default InventoryKpiCards;

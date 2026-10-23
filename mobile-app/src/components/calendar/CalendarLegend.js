import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

const CalendarLegend = () => {
  return (
    <View style={styles.cardContainer}>
      {/* 1. Nhóm Trạng Thái */}
      <View style={styles.statusRow}>
        <Text style={styles.legendTitle}>TRẠNG THÁI:</Text>

        {/* Trống */}
        <View style={[styles.legendPill, styles.pillAvailable]}>
          <View style={styles.dotAvailable} />
          <Text style={styles.labelAvailable}>Trống</Text>
        </View>

        {/* Đã đặt */}
        <View style={[styles.legendPill, styles.pillBooked]}>
          <View style={[styles.dotSolid, { backgroundColor: '#4648D4' }]} />
          <Text style={styles.labelBooked}>Đã đặt</Text>
        </View>

        {/* Chờ duyệt */}
        <View style={[styles.legendPill, styles.pillPending]}>
          <View style={[styles.dotSolid, { backgroundColor: '#D97706' }]} />
          <Text style={styles.labelPending}>Chờ duyệt</Text>
        </View>

        {/* Đã khóa / Bảo trì */}
        <View style={[styles.legendPill, styles.pillBlocked]}>
          <View style={[styles.dotSolid, { backgroundColor: '#BA1A1A' }]} />
          <Text style={styles.labelBlocked}>Đã khóa / Bảo trì</Text>
        </View>
      </View>

      {/* 2. Dòng Ghi Chú Giá */}
      <View style={styles.priceNoteBox}>
        <MaterialCommunityIcons name="information" size={15} color="#00685F" style={{ marginRight: 6 }} />
        <Text style={styles.priceNoteText}>
          Giá hiển thị: <Text style={{ fontWeight: '700', color: COLORS.textHeading }}>VNĐ / đêm</Text> (Tự động tăng vào Thứ 6 – Chủ Nhật)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 6,
  },
  legendTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: 5,
  },
  pillAvailable: {
    backgroundColor: '#E8FBF4',
    borderColor: '#A7F3D0',
  },
  labelAvailable: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#00513B',
  },
  pillBooked: {
    backgroundColor: '#E1E0FF',
    borderColor: '#C7D2FE',
  },
  labelBooked: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#4648D4',
  },
  pillPending: {
    backgroundColor: '#FFF0D4',
    borderColor: '#FDE68A',
  },
  labelPending: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  pillBlocked: {
    backgroundColor: '#FFECEC',
    borderColor: '#FECACA',
  },
  labelBlocked: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  dotAvailable: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: '#008378',
    backgroundColor: '#FFFFFF',
  },
  dotSolid: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priceNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D3E4FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '100%',
  },
  priceNoteText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11.5,
    color: '#3D4947',
    flex: 1,
  },
});

export default CalendarLegend;

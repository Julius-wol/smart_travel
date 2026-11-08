import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const DAY_HEADERS = [
  { key: 'T2', label: 'Thứ 2 (T2)', shortLabel: 'T2', isWeekend: false },
  { key: 'T3', label: 'Thứ 3 (T3)', shortLabel: 'T3', isWeekend: false },
  { key: 'T4', label: 'Thứ 4 (T4)', shortLabel: 'T4', isWeekend: false },
  { key: 'T5', label: 'Thứ 5 (T5)', shortLabel: 'T5', isWeekend: false },
  { key: 'T6', label: 'Thứ 6 (T6)', shortLabel: 'T6', isWeekend: false },
  { key: 'T7', label: 'Thứ 7 (T7)', shortLabel: 'T7', isWeekend: true, isSaturday: true },
  { key: 'CN', label: 'Chủ Nhật (CN)', shortLabel: 'CN', isWeekend: true, isSunday: true },
];

const CalendarGridMatrix = ({
  days = [],
  currentMonth = 11,
  currentYear = 2026,
  selectedRange,
  onDateClick,
  onPastDateClick,
  onOpenQuickBooking,
  onOpenUnblock,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isMobile = width < 768;
  const tableMinWidth = isDesktop ? 780 : (isMobile ? '100%' : 640);

  // Format giá dạng ngắn: 2500000 -> 2.5tr
  const formatShortPrice = (price) => {
    if (!price) return '';
    const millions = (price / 1000000).toFixed(1);
    return `${millions.endsWith('.0') ? millions.slice(0, -2) : millions}tr`;
  };

  // Tính số ô ngày của tháng trước (offset)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
  // Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6
  const offsetDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Lấy các ngày cuối của tháng trước để hiển thị mờ đúng chuẩn Figma
  const prevMonthLastDate = new Date(currentYear, currentMonth - 1, 0).getDate();
  const prevMonthFillerDays = [];
  for (let i = offsetDays - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDate - i;
    const isFriOrSat = (offsetDays - 1 - i) >= 4;
    prevMonthFillerDays.push({
      dayOfMonth: dayNum,
      price: isFriOrSat ? 2800000 : 2500000,
      isSaturday: (offsetDays - 1 - i) === 5,
    });
  }

  return (
    <ScrollView
      horizontal={!isMobile}
      scrollEnabled={!isMobile}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollWrap, isMobile && { width: '100%' }]}
      style={isMobile ? { width: '100%' } : null}
    >
      <View style={[styles.tableCard, { minWidth: tableMinWidth }]}>
        {/* 1. Header 7 cột theo đúng chuẩn Figma */}
        <View style={styles.headerRow}>
          {DAY_HEADERS.map((item) => (
            <View
              key={item.key}
              style={[
                styles.headerCol,
                item.isSaturday && styles.saturdayHeaderCol,
                item.isSunday && styles.sundayHeaderCol,
              ]}
            >
              <Text
                style={[
                  styles.headerText,
                  item.isSaturday && styles.saturdayHeaderText,
                  item.isSunday && styles.sundayHeaderText,
                  isMobile && styles.mobileHeaderText,
                ]}
              >
                {isMobile ? item.shortLabel : item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* 2. Grid các ô ngày */}
        <View style={styles.gridContainer}>
          {/* Ngày của tháng trước (hiển thị mờ) */}
          {prevMonthFillerDays.map((filler, idx) => (
            <View
              key={`filler-${idx}`}
              style={[
                styles.dayCell,
                isMobile && styles.mobileDayCell,
                styles.fillerCell,
                filler.isSaturday && styles.saturdayFillerCell,
              ]}
            >
              <View style={styles.cellTopRow}>
                <Text style={[styles.fillerDayNumber, isMobile && styles.mobileDayNumber]}>{filler.dayOfMonth}</Text>
                <Text style={[styles.fillerPriceText, isMobile && styles.mobilePriceText]}>{formatShortPrice(filler.price)}</Text>
              </View>
            </View>
          ))}

          {/* Ngày trong tháng thực tế */}
          {days.map((dayItem) => {
            const isSelected =
              selectedRange?.start === dayItem.date ||
              selectedRange?.end === dayItem.date ||
              (selectedRange?.start &&
                selectedRange?.end &&
                dayItem.date >= selectedRange.start &&
                dayItem.date <= selectedRange.end);

            const isBlocked = dayItem.status === 'BLOCKED';
            const isBooked = dayItem.status === 'BOOKED';
            const isPending = dayItem.status === 'PENDING';
            const isAvailable = dayItem.status === 'AVAILABLE';
            const isSunday = dayItem.dayOfWeek === 'CN';
            const isSaturday = dayItem.dayOfWeek === 'T7';

            const handlePress = () => {
              if (dayItem.isPast) {
                onPastDateClick && onPastDateClick();
                return;
              }
              if (isPending && dayItem.booking) {
                onOpenQuickBooking && onOpenQuickBooking(dayItem.booking);
                return;
              }
              if (isBlocked) {
                onOpenUnblock && onOpenUnblock(dayItem.date);
                return;
              }
              if (isAvailable) {
                onDateClick && onDateClick(dayItem);
                return;
              }
            };

            return (
              <TouchableOpacity
                key={dayItem.date}
                testID={`day-cell-${dayItem.date}`}
                style={[
                  styles.dayCell,
                  isMobile && styles.mobileDayCell,
                  isSaturday && styles.saturdayDayCell,
                  isSunday && styles.sundayDayCell,
                  dayItem.isPast && styles.pastDayCell,
                  isBlocked && styles.blockedDayCell,
                  isSelected && styles.selectedDayCell,
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                {/* Dòng trên: Số ngày (trái) & Giá / Icon Khóa (phải) */}
                <View style={styles.cellTopRow}>
                  <Text
                    style={[
                      styles.dayNumber,
                      isMobile && styles.mobileDayNumber,
                      isSunday && styles.sundayNumber,
                      dayItem.isPast && styles.pastText,
                    ]}
                  >
                    {dayItem.dayOfMonth}
                  </Text>

                  {/* Góc trên phải: Nếu bị khóa hiển thị icon ổ khóa đỏ, nếu mở hiển thị giá */}
                  {isBlocked ? (
                    <MaterialCommunityIcons name="lock" size={isMobile ? 12 : 14} color="#BA1A1A" />
                  ) : (
                    <Text
                      style={[
                        styles.priceText,
                        isMobile && styles.mobilePriceText,
                        isAvailable && styles.availablePriceText,
                        (isSaturday || dayItem.dayOfWeek === 'T6' || isSunday) &&
                          isBooked &&
                          styles.weekendBookedPriceText,
                      ]}
                    >
                      {formatShortPrice(dayItem.price)}
                    </Text>
                  )}
                </View>

                {/* Nội dung trạng thái ở thân ô */}
                <View style={styles.cellBody}>
                  {/* Trạng thái 1: Trống */}
                  {isAvailable && (
                    <View style={styles.availableBadge}>
                      <View style={styles.greenDot} />
                      <Text style={[styles.availableLabel, isMobile && { fontSize: 8.5 }]}>Trống</Text>
                    </View>
                  )}

                  {/* Trạng thái 2: Đã đặt */}
                  {isBooked && (
                    <View style={[styles.bookedPill, isMobile && styles.mobilePill]}>
                      <Text style={[styles.bookedGuestName, isMobile && styles.mobilePillText]} numberOfLines={1}>
                        {dayItem.booking?.customerName || dayItem.booking?.guestName || 'Lê Hoàng Nam'}
                      </Text>
                      {!isMobile && dayItem.booking?.bookingCode ? (
                        <Text style={styles.bookingCodeText} numberOfLines={1}>
                          {dayItem.booking.bookingCode}
                        </Text>
                      ) : null}
                    </View>
                  )}

                  {/* Trạng thái 3: Đã khóa / Bảo trì */}
                  {isBlocked && (
                    <View style={[styles.blockedPill, isMobile && styles.mobilePill]}>
                      <MaterialCommunityIcons name="lock" size={isMobile ? 9 : 11} color="#BA1A1A" style={{ marginRight: 2 }} />
                      <Text style={[styles.blockedPillText, isMobile && styles.mobilePillText]} numberOfLines={1}>
                        {isMobile ? 'Khóa' : (dayItem.block?.reasonLabel || dayItem.blockInfo?.reasonLabel || 'Khóa bảo trì')}
                      </Text>
                    </View>
                  )}

                  {/* Trạng thái 4: Chờ duyệt */}
                  {isPending && (
                    <View style={[styles.pendingPill, isMobile && styles.mobilePill]}>
                      <View style={[styles.pendingBadgeRow, isMobile && { paddingHorizontal: 2, paddingVertical: 0 }]}>
                        <Text style={[styles.pendingBadgeText, isMobile && { fontSize: 7.5 }]}>Chờ</Text>
                      </View>
                      <Text style={[styles.pendingGuestName, isMobile && styles.mobilePillText]} numberOfLines={1}>
                        {dayItem.booking?.customerName || dayItem.booking?.guestName || 'Nguyễn Văn An'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollWrap: {
    paddingBottom: 24,
  },
  tableCard: {
    minWidth: 780,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EFFD',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EFFD',
    backgroundColor: '#F8F9FF',
  },
  headerCol: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  saturdayHeaderCol: {
    backgroundColor: '#EFF4FF',
  },
  sundayHeaderCol: {
    backgroundColor: '#FFF1F2',
    borderRightWidth: 0,
  },
  headerText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#3D4947',
  },
  saturdayHeaderText: {
    color: '#4648D4',
  },
  sundayHeaderText: {
    color: '#DC2626',
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 96,
    padding: 7,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  saturdayDayCell: {
    backgroundColor: '#FAFBFF',
  },
  sundayDayCell: {
    backgroundColor: '#FFFDFD',
  },
  fillerCell: {
    backgroundColor: '#F8FAFC',
  },
  saturdayFillerCell: {
    backgroundColor: '#F1F5F9',
  },
  fillerDayNumber: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  fillerPriceText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 9.5,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  pastDayCell: {
    backgroundColor: '#F8FAFC',
    opacity: 0.65,
  },
  pastText: {
    color: '#94A3B8',
  },
  blockedDayCell: {
    backgroundColor: '#FFF8F8',
  },
  selectedDayCell: {
    borderColor: '#00685F',
    borderWidth: 2,
    backgroundColor: '#E6F4F2',
  },
  cellTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeading,
  },
  sundayNumber: {
    color: '#DC2626',
  },
  priceText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: '#00685F',
  },
  availablePriceText: {
    color: '#00685F',
  },
  weekendBookedPriceText: {
    color: '#4648D4',
  },
  cellBody: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 2,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#008378',
  },
  availableLabel: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00513B',
  },
  bookedPill: {
    backgroundColor: '#E1E0FF',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  bookedGuestName: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4648D4',
  },
  bookingCodeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 9,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 1,
  },
  blockedPill: {
    backgroundColor: '#FFECEC',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  blockedPillText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: '#BA1A1A',
    flex: 1,
  },
  pendingPill: {
    backgroundColor: '#FFF0D4',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingBadgeRow: {
    backgroundColor: '#D97706',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  pendingBadgeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  pendingGuestName: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  mobileDayCell: {
    minHeight: 68,
    padding: 3,
  },
  mobileHeaderText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  mobileDayNumber: {
    fontSize: 11.5,
  },
  mobilePriceText: {
    fontSize: 8,
  },
  mobilePill: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  mobilePillText: {
    fontSize: 8,
    fontWeight: '700',
  },
});

export default CalendarGridMatrix;

import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadBookingCalendar, overlapsBooking, isBookedNight } from '../services/bookingCalendar';

const DAY_MS = 86400000;
const toISO = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const fromISO = (value) => new Date(`${value}T12:00:00`);
const displayDate = (value) => value ? value.split('-').reverse().map((part, index) => index === 2 ? part.slice(-2) : part).join('/') : 'Chọn ngày';
const addDays = (value, days) => {
  const date = fromISO(value);
  date.setDate(date.getDate() + days);
  return toISO(date);
};
const monthOf = (value) => new Date(fromISO(value).getFullYear(), fromISO(value).getMonth(), 1);

export const DatePickerModal = ({ visible, onClose, initialCheckIn, initialCheckOut, onApply, roomId }) => {
  const today = toISO(new Date());
  const defaultIn = initialCheckIn?.slice(0, 10) || addDays(today, 1);
  const defaultOut = initialCheckOut?.slice(0, 10) || addDays(defaultIn, 2);
  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [selecting, setSelecting] = useState('checkIn');
  const [month, setMonth] = useState(monthOf(defaultIn));
  const [calendar, setCalendar] = useState({ roomId: null, status: 'idle', ranges: [] });
  const [refresh, setRefresh] = useState(0);
  const ranges = calendar.roomId === roomId ? calendar.ranges : [];
  const availabilityReady = !roomId || (calendar.roomId === roomId && calendar.status === 'ready');
  const rangeConflict = overlapsBooking(checkIn, checkOut, ranges);
  const nights = checkOut && checkOut > checkIn ? Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / DAY_MS) : 0;
  const canApply = availabilityReady && !rangeConflict && checkIn >= today && nights > 0;

  useEffect(() => {
    if (!visible || !roomId) return undefined;
    let active = true;
    const controller = new AbortController();
    setCalendar((previous) => ({ roomId, status: 'loading', ranges: previous.roomId === roomId ? previous.ranges : [] }));
    const timeout = setTimeout(() => controller.abort(), 10000);
    loadBookingCalendar(roomId, controller.signal)
      .then((bookedRanges) => {
        if (active) setCalendar({ roomId, status: 'ready', ranges: bookedRanges });
      })
      .catch(() => {
        if (active) setCalendar((previous) => ({ ...previous, roomId, status: 'error' }));
      })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [visible, roomId, refresh]);

  useEffect(() => {
    if (!visible || !roomId) return undefined;
    const interval = setInterval(() => setRefresh((value) => value + 1), 30000);
    return () => clearInterval(interval);
  }, [visible, roomId]);

  const resetSelection = () => {
    setCheckIn(defaultIn);
    setCheckOut(defaultOut);
    setSelecting('checkIn');
    setMonth(monthOf(defaultIn < today ? today : defaultIn));
  };
  useEffect(() => {
    if (visible) resetSelection();
  }, [visible, initialCheckIn, initialCheckOut]);

  const focusDate = (field) => {
    setSelecting(field);
    const value = field === 'checkIn' ? checkIn : checkOut || checkIn;
    setMonth(monthOf(value < today ? today : value));
  };
  const chooseDay = (value) => {
    if (!availabilityReady || value < today ||
      (selecting === 'checkIn' && isBookedNight(value, ranges)) ||
      (selecting === 'checkOut' && (value <= checkIn || overlapsBooking(checkIn, value, ranges)))) return;
    if (selecting === 'checkIn') {
      setCheckIn(value);
      setCheckOut(null);
      setSelecting('checkOut');
    } else {
      setCheckOut(value);
      setSelecting('checkIn');
    }
  };
  const preset = (days) => {
    const start = checkIn >= today ? checkIn : addDays(today, 1);
    if (!availabilityReady || overlapsBooking(start, addDays(start, days), ranges)) return;
    setCheckIn(start);
    setCheckOut(addDays(start, days));
    setMonth(monthOf(start));
    setSelecting('checkIn');
  };
  const changeMonth = (offset) => setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  const firstWeekday = (month.getDay() + 6) % 7;
  const monthDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + monthDays) / 7) * 7;
  const previousDisabled = month <= monthOf(today);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Đóng lịch" />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="calendar-outline" size={24} color="#00796B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Chọn thời gian lưu trú</Text>
              <Text style={styles.subtitle}>Nhận phòng 14:00 • Trả phòng 12:00</Text>
            </View>
            <TouchableOpacity testID="close-date-modal-btn" style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng">
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.dateRow}>
              {[
                { field: 'checkIn', label: 'Ngày nhận phòng', value: checkIn },
                { field: 'checkOut', label: 'Ngày trả phòng', value: checkOut },
              ].map(({ field, label, value }) => (
                <TouchableOpacity key={field} testID={`${field}-date-selector`} style={[styles.dateBox, selecting === field && styles.dateBoxActive]} onPress={() => focusDate(field)} accessibilityRole="button" accessibilityLabel={`${label}: ${displayDate(value)}`} accessibilityState={{ selected: selecting === field }}>
                  <Text style={styles.dateLabel}>{label}</Text>
                  <Text style={[styles.dateValue, !value && styles.placeholder]}>{displayDate(value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text accessibilityLiveRegion="polite" style={styles.hint}>{selecting === 'checkIn' ? 'Chạm để chọn ngày nhận phòng' : 'Tiếp theo, chọn ngày trả phòng'}</Text>
            {!!roomId && (
              <View>
                <View style={styles.legend}>
                  <Text style={styles.legendFree}>○ Còn trống</Text>
                  <Text style={styles.legendBooked}>▧ Đã đặt</Text>
                  <Text style={styles.legendSelected}>● Đang chọn</Text>
                </View>
                {calendar.status === 'loading' && <View style={styles.legend}><ActivityIndicator size="small" color="#00796B" /><Text style={styles.hint}>Đang cập nhật lịch phòng…</Text></View>}
                {calendar.status === 'error' && <View style={styles.errorBox}><Text style={styles.errorText}>Chưa tải được lịch phòng. Vui lòng thử lại trước khi chọn ngày.</Text><TouchableOpacity testID="calendar-retry" onPress={() => setRefresh((value) => value + 1)} accessibilityRole="button"><Text style={styles.retryText}>Thử lại</Text></TouchableOpacity></View>}
                {availabilityReady && rangeConflict && <Text accessibilityLiveRegion="polite" style={styles.errorText}>Khoảng ngày đang chọn có đêm đã được đặt. Vui lòng chọn ngày khác.</Text>}
                {availabilityReady && selecting === 'checkOut' && <Text style={styles.boundaryHint}>Có thể trả phòng vào ngày bắt đầu lượt đặt tiếp theo.</Text>}
              </View>
            )}
            <View style={styles.monthHeader}>
              <TouchableOpacity testID="calendar-prev-month" onPress={() => changeMonth(-1)} disabled={previousDisabled} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Tháng trước" accessibilityState={{ disabled: previousDisabled }}>
                <Ionicons name="chevron-back" size={22} color={previousDisabled ? '#CBD5E1' : '#00796B'} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>Tháng {month.getMonth() + 1}, {month.getFullYear()}</Text>
              <TouchableOpacity testID="calendar-next-month" onPress={() => changeMonth(1)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Tháng sau">
                <Ionicons name="chevron-forward" size={22} color="#00796B" />
              </TouchableOpacity>
            </View>
            <View style={styles.calendar}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
              {Array.from({ length: cellCount }, (_, index) => {
                const day = index - firstWeekday + 1;
                if (day < 1 || day > monthDays) return <View key={`blank-${index}`} style={styles.dayCell} />;
                const value = toISO(new Date(month.getFullYear(), month.getMonth(), day));
                const booked = isBookedNight(value, ranges);
                const disabled = !availabilityReady || value < today ||
                  (selecting === 'checkIn' && booked) ||
                  (selecting === 'checkOut' && (value <= checkIn || overlapsBooking(checkIn, value, ranges)));
                const endpoint = value === checkIn || value === checkOut;
                const inRange = checkOut && value > checkIn && value < checkOut;
                return (
                  <TouchableOpacity key={value} testID={`calendar-day-${value}`} onPress={() => chooseDay(value)} disabled={disabled} accessibilityRole="button" accessibilityLabel={`${day}/${month.getMonth() + 1}/${month.getFullYear()}${booked ? ', đã đặt' : ''}${value === checkIn ? ', ngày nhận phòng' : value === checkOut ? ', ngày trả phòng' : ''}`} accessibilityState={{ selected: !!endpoint, disabled }} style={[styles.dayCell, inRange && styles.inRange, booked && styles.bookedDay, endpoint && styles.endpoint]}>
                    <Text style={[styles.dayText, value === today && styles.todayText, disabled && styles.disabledText, booked && styles.bookedText, endpoint && styles.endpointText]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.duration}>
              <Ionicons name="moon-outline" size={18} color="#00796B" />
              <Text testID="calendar-duration" accessibilityLiveRegion="polite" style={styles.durationText}>{nights ? `${nights} đêm nghỉ dưỡng` : 'Chọn ngày trả phòng để xem số đêm'}</Text>
            </View>
            <Text style={styles.presetTitle}>Chọn nhanh số đêm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presets}>
              {[1, 2, 3, 4, 7].map((days) => {
                const start = checkIn >= today ? checkIn : addDays(today, 1);
                const disabled = !availabilityReady || overlapsBooking(start, addDays(start, days), ranges);
                return (
                <TouchableOpacity key={days} testID={`calendar-preset-${days}`} disabled={disabled} onPress={() => preset(days)} style={[styles.preset, nights === days && styles.presetActive, disabled && styles.disabledControl]} accessibilityRole="button" accessibilityState={{ disabled }} accessibilityLabel={`${days} đêm`}>
                  <Text style={[styles.presetText, nights === days && styles.endpointText]}>{days} đêm</Text>
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={resetSelection} style={styles.reset} accessibilityRole="button"><Text style={styles.resetText}>Đặt lại</Text></TouchableOpacity>
            <TouchableOpacity testID="apply-date-modal-btn" disabled={!canApply} accessibilityRole="button" accessibilityState={{ disabled: !canApply }} style={[styles.apply, !canApply && styles.applyDisabled]} onPress={() => {
              if (!canApply) return;
              onApply?.({ checkIn, checkOut, nights });
              onClose();
            }}>
              <Text style={styles.applyText}>{canApply ? `Áp dụng · ${nights} đêm` : !availabilityReady ? 'Chờ cập nhật lịch' : rangeConflict ? 'Chọn khoảng ngày khác' : 'Chọn ngày trả phòng'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,28,48,0.55)' },
  modal: { width: '100%', maxWidth: 440, maxHeight: '88%', backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 16, fontWeight: '700', color: '#0B1C30' },
  subtitle: { fontSize: 11, color: '#64748B', marginTop: 3 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 14 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateBox: { flex: 1, padding: 11, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  dateBoxActive: { borderColor: '#00796B', backgroundColor: '#EFFFFB' },
  dateLabel: { fontSize: 11, color: '#64748B', marginBottom: 5 },
  dateValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  placeholder: { color: '#94A3B8' },
  hint: { fontSize: 12, color: '#00796B', marginTop: 12 },
  legend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  legendFree: { fontSize: 11, color: '#475569' },
  legendBooked: { fontSize: 11, color: '#B45309' },
  legendSelected: { fontSize: 11, color: '#00796B' },
  bookedDay: { backgroundColor: '#FFF1E8' },
  bookedText: { color: '#B45309', textDecorationLine: 'line-through' },
  errorBox: { backgroundColor: '#FFF1F2', padding: 10, borderRadius: 10, marginTop: 10 },
  errorText: { fontSize: 12, color: '#B91C1C', marginTop: 8 },
  retryText: { color: '#00796B', fontWeight: '700', paddingVertical: 10 },
  boundaryHint: { fontSize: 11, color: '#64748B', marginTop: 8 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.285714%', textAlign: 'center', paddingVertical: 8, fontSize: 11, fontWeight: '600', color: '#64748B' },
  dayCell: { width: '14.285714%', height: 42, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  dayText: { fontSize: 14, color: '#0F172A' },
  todayText: { color: '#00796B', fontWeight: '800', textDecorationLine: 'underline' },
  disabledText: { color: '#CBD5E1' },
  inRange: { backgroundColor: '#DFF6F1' },
  endpoint: { backgroundColor: '#00796B', borderRadius: 12 },
  endpointText: { color: '#FFFFFF', fontWeight: '700' },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFFFFB', padding: 12, borderRadius: 12, marginTop: 12 },
  durationText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#00796B' },
  presetTitle: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 14, marginBottom: 8 },
  presets: { gap: 8 },
  preset: { minHeight: 40, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#F1F5F9' },
  presetActive: { backgroundColor: '#00796B' },
  disabledControl: { opacity: 0.4 },
  presetText: { fontSize: 12, color: '#475569' },
  footer: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  reset: { minHeight: 46, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  resetText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  apply: { flex: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#00796B' },
  applyDisabled: { backgroundColor: '#CBD5E1' },
  applyText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});

export default DatePickerModal;

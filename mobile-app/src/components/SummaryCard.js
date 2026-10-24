import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * SummaryCard Component (Figma Node #30:2434)
 * Thẻ tóm tắt thông tin phòng & lịch trình lưu trú
 */
export const SummaryCard = ({
  room = {},
  schedule = { checkIn: '2026-10-25', checkOut: '2026-10-27', nights: 2 },
  onScheduleChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState(schedule.checkIn);
  const [newCheckOut, setNewCheckOut] = useState(schedule.checkOut);
  const [dateError, setDateError] = useState('');

  const defaultImage =
    room.images && room.images.length > 0
      ? room.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500';

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleApplyDates = () => {
    const dIn = new Date(newCheckIn);
    const dOut = new Date(newCheckOut);

    if (isNaN(dIn.getTime()) || isNaN(dOut.getTime())) {
      setDateError('Định dạng ngày không hợp lệ (YYYY-MM-DD)');
      return;
    }

    if (dIn >= dOut) {
      setDateError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / msPerDay));

    setDateError('');
    setModalVisible(false);

    if (onScheduleChange) {
      onScheduleChange({
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        nights,
      });
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. Thông tin tóm tắt Homestay */}
      <View style={styles.roomHeader}>
        <Image source={{ uri: defaultImage }} style={styles.roomImage} />
        <View style={styles.roomMeta}>
          <Text style={styles.roomTitle} numberOfLines={2}>
            {room.title || 'An Nhiên Eco Retreat Đà Nẵng'}
          </Text>
          <Text style={styles.roomLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={13} color={COLORS.textBody} />{' '}
            {room.address || room.city || 'Ngũ Hành Sơn, Đà Nẵng'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={COLORS.starGold} />
              <Text style={styles.ratingText}>
                {room.rating ? room.rating.toFixed(2) : '4.95'}{' '}
                <Text style={styles.ratingCount}>({room.reviewCount || 84})</Text>
              </Text>
            </View>
            <View style={styles.guestBadge}>
              <Ionicons name="people-outline" size={12} color={COLORS.secondary} />
              <Text style={styles.guestText}>{room.maxGuests || 4} khách</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. Schedule Info Box */}
      <TouchableOpacity
        testID="schedule-info-box"
        style={styles.scheduleBox}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.scheduleIconWrap}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        </View>

        <View style={styles.scheduleDetails}>
          <View style={styles.scheduleTitleRow}>
            <Text style={styles.scheduleDates}>
              {formatDateDisplay(schedule.checkIn)} – {formatDateDisplay(schedule.checkOut)}
            </Text>
            <Text style={styles.scheduleNights}>({schedule.nights} đêm nghỉ)</Text>
          </View>
          <Text style={styles.standardHours}>
            Nhận phòng: 14:00 • Trả phòng: 12:00
          </Text>
        </View>

        <View style={styles.editDateBtn}>
          <Text style={styles.editDateText}>Đổi</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </View>
      </TouchableOpacity>

      {/* 3. Modal điều chỉnh ngày */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Điều chỉnh lịch trình lưu trú</Text>
            <Text style={styles.modalSubtitle}>Định dạng ngày chuẩn: YYYY-MM-DD</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày nhận phòng (Check-in)</Text>
              <TextInput
                testID="checkin-input"
                style={styles.dateTextInput}
                value={newCheckIn}
                onChangeText={setNewCheckIn}
                placeholder="2026-10-25"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày trả phòng (Check-out)</Text>
              <TextInput
                testID="checkout-input"
                style={styles.dateTextInput}
                value={newCheckOut}
                onChangeText={setNewCheckOut}
                placeholder="2026-10-28"
              />
            </View>

            {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="apply-dates-btn"
                style={styles.applyBtn}
                onPress={handleApplyDates}
              >
                <Text style={styles.applyBtnText}>Cập nhật giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  roomHeader: {
    flexDirection: 'row',
    gap: 14,
  },
  roomImage: {
    width: 82,
    height: 82,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.inputBg,
  },
  roomMeta: {
    flex: 1,
    justifyContent: 'space-between',
  },
  roomTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    lineHeight: 20,
  },
  roomLocation: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textBody,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#92400E',
  },
  ratingCount: {
    fontWeight: TYPOGRAPHY.weights.regular,
    color: COLORS.textBody,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  guestText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 14,
  },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  scheduleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOWS.chip,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  scheduleDates: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  scheduleNights: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  standardHours: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginTop: 2,
  },
  editDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  editDateText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginRight: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    ...SHADOWS.card,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.subheading,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginBottom: 6,
  },
  dateTextInput: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textHeading,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.discountText,
    marginBottom: 12,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textBody,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.button,
  },
  applyBtnText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default SummaryCard;

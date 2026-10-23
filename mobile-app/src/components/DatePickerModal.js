import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * DatePickerModal Component
 * Modal chọn ngày nhận phòng, trả phòng và xem chi tiết thời gian lưu trú
 */
export const DatePickerModal = ({
  visible,
  onClose,
  initialCheckIn = '2026-10-25',
  initialCheckOut = '2026-10-28',
  onApply,
}) => {
  const [checkIn, setCheckIn] = useState(initialCheckIn || '2026-10-25');
  const [checkOut, setCheckOut] = useState(initialCheckOut || '2026-10-28');
  const [nights, setNights] = useState(3);
  const [errorMsg, setErrorMsg] = useState(null);

  // Tính số đêm lưu trú
  const calculateNights = (inDateStr, outDateStr) => {
    try {
      const inDate = new Date(inDateStr);
      const outDate = new Date(outDateStr);
      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
        return null;
      }
      const diffTime = outDate.getTime() - inDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (visible) {
      setCheckIn(initialCheckIn || '2026-10-25');
      setCheckOut(initialCheckOut || '2026-10-28');
      const diff = calculateNights(initialCheckIn || '2026-10-25', initialCheckOut || '2026-10-28');
      setNights(diff && diff > 0 ? diff : 3);
      setErrorMsg(null);
    }
  }, [visible, initialCheckIn, initialCheckOut]);

  const handleDateChange = (type, value) => {
    setErrorMsg(null);
    if (type === 'checkIn') {
      setCheckIn(value);
      const diff = calculateNights(value, checkOut);
      if (diff !== null && diff > 0) {
        setNights(diff);
      }
    } else {
      setCheckOut(value);
      const diff = calculateNights(checkIn, value);
      if (diff !== null && diff > 0) {
        setNights(diff);
      }
    }
  };

  // Chọn nhanh các gói thời gian phổ biến
  const handleQuickPreset = (presetDays) => {
    setErrorMsg(null);
    const today = new Date();
    // Tạo ngày checkIn từ ngày mai
    const inD = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const outD = new Date(inD.getFullYear(), inD.getMonth(), inD.getDate() + presetDays);

    const formatISO = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const newIn = formatISO(inD);
    const newOut = formatISO(outD);
    setCheckIn(newIn);
    setCheckOut(newOut);
    setNights(presetDays);
  };

  const handleConfirm = () => {
    const diff = calculateNights(checkIn, checkOut);
    if (!diff || diff <= 0) {
      setErrorMsg('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.');
      return;
    }
    onApply &&
      onApply({
        checkIn,
        checkOut,
        nights: diff,
      });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="calendar-outline" size={20} color="#00685F" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>Chọn thời gian lưu trú</Text>
              <Text style={styles.headerSubtitle}>
                Nhận phòng 14:00 • Trả phòng 12:00
              </Text>
            </View>
            <TouchableOpacity testID="close-date-modal-btn" onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Khung nhập Ngày nhận phòng & Ngày trả phòng */}
            <View style={styles.dateInputsCard}>
              {/* Ngày nhận phòng */}
              <View style={styles.dateInputBlock}>
                <View style={styles.dateLabelRow}>
                  <Ionicons name="log-in-outline" size={16} color="#00685F" />
                  <Text style={styles.dateLabel}>Ngày nhận phòng</Text>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>14:00</Text>
                  </View>
                </View>
                <TextInput
                  testID="checkin-date-input"
                  style={styles.textInput}
                  value={checkIn}
                  onChangeText={(val) => handleDateChange('checkIn', val)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputDivider} />

              {/* Ngày trả phòng */}
              <View style={styles.dateInputBlock}>
                <View style={styles.dateLabelRow}>
                  <Ionicons name="log-out-outline" size={16} color="#4648D4" />
                  <Text style={styles.dateLabel}>Ngày trả phòng</Text>
                  <View style={[styles.timeBadge, { backgroundColor: '#EFF4FF' }]}>
                    <Text style={[styles.timeBadgeText, { color: '#4648D4' }]}>12:00</Text>
                  </View>
                </View>
                <TextInput
                  testID="checkout-date-input"
                  style={styles.textInput}
                  value={checkOut}
                  onChangeText={(val) => handleDateChange('checkOut', val)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Thông báo lỗi nếu có */}
            {errorMsg && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#BA1A1A" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Tổng số đêm nghỉ ngơi */}
            <View style={styles.durationBanner}>
              <Ionicons name="moon-outline" size={18} color="#00685F" />
              <Text style={styles.durationText}>
                Tổng thời gian:{' '}
                <Text style={styles.durationBold}>{nights} đêm nghỉ dưỡng</Text>
              </Text>
            </View>

            {/* Lựa chọn nhanh (Presets) */}
            <Text style={styles.presetHeading}>Lựa chọn nhanh thời gian:</Text>
            <View style={styles.presetsGrid}>
              {[
                { label: '2 ngày 1 đêm', days: 1 },
                { label: '3 ngày 2 đêm', days: 2 },
                { label: '4 ngày 3 đêm', days: 3 },
                { label: '5 ngày 4 đêm', days: 4 },
                { label: '7 ngày (1 tuần)', days: 7 },
              ].map((p) => {
                const isActive = nights === p.days;
                return (
                  <TouchableOpacity
                    key={p.days}
                    style={[styles.presetChip, isActive && styles.presetChipActive]}
                    activeOpacity={0.7}
                    onPress={() => handleQuickPreset(p.days)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isActive && styles.presetChipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              activeOpacity={0.7}
              onPress={() => handleQuickPreset(3)}
            >
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="apply-date-modal-btn"
              style={styles.applyButton}
              activeOpacity={0.88}
              onPress={handleConfirm}
            >
              <Text style={styles.applyButtonText}>Áp dụng thời gian</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8F9FF',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 16,
  },
  dateInputsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  dateInputBlock: {
    marginVertical: 4,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  timeBadge: {
    backgroundColor: '#E6F4F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00685F',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#BA1A1A',
    fontWeight: '500',
  },
  durationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  durationText: {
    fontSize: 13,
    color: '#166534',
  },
  durationBold: {
    fontWeight: '700',
  },
  presetHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#00685F',
    borderColor: '#00685F',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DatePickerModal;

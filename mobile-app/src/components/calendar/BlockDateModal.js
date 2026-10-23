import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const REASON_OPTIONS = [
  { value: 'MAINTENANCE', label: 'Sửa chữa / Bảo trì định kỳ', icon: 'wrench' },
  { value: 'EXTERNAL_GUEST', label: 'Giữ chỗ cho khách đặt ngoài hệ thống', icon: 'account-clock' },
  { value: 'HOLIDAY_PERSONAL', label: 'Nghỉ lễ / Gia đình sử dụng', icon: 'home-heart' },
  { value: 'OTHER', label: 'Khác', icon: 'dots-horizontal-circle' },
];

const BlockDateModal = ({
  visible,
  selectedRange,
  onClose,
  onConfirmBlock,
  loading,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const startDate = selectedRange?.start || '';
  const endDate = selectedRange?.end || selectedRange?.start || '';

  // Tính số đêm
  let nights = 1;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    nights = diff;
  }

  const handleConfirm = () => {
    if (!selectedReason) {
      setErrorMessage('Vui lòng chọn lý do khóa lịch phòng trước khi tiếp tục. (CAL-BLOCK-REASON-REQ)');
      return;
    }
    setErrorMessage('');
    onConfirmBlock({
      startDate,
      endDate,
      reason: selectedReason,
      internalNote,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Khóa lịch đón khách</Text>
              <Text style={styles.dateRangeText}>
                Từ ngày {startDate} đến {endDate} ({nights} đêm)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textHeading} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Lỗi cảnh báo nếu có */}
            {errorMessage ? (
              <View style={styles.errorAlertBox}>
                <Ionicons name="alert-circle" size={16} color="#BA1A1A" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Chọn lý do khóa */}
            <Text style={styles.sectionLabel}>Lý do khóa phòng <Text style={{ color: '#BA1A1A' }}>*</Text></Text>
            <View style={styles.reasonsList}>
              {REASON_OPTIONS.map((item) => {
                const isChecked = selectedReason === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    testID={`reason-${item.value}`}
                    style={[styles.reasonItem, isChecked && styles.reasonItemActive]}
                    onPress={() => {
                      setSelectedReason(item.value);
                      setErrorMessage('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reasonItemLeft}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={20}
                        color={isChecked ? COLORS.primary : COLORS.textBody}
                      />
                      <Text style={[styles.reasonLabel, isChecked && styles.reasonLabelActive]}>
                        {item.label}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isChecked && styles.radioCircleActive]}>
                      {isChecked && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ghi chú nội bộ */}
            <Text style={styles.sectionLabel}>Ghi chú nội bộ (Tối đa 100 ký tự)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: Thay hệ thống bồn vệ sinh cho phòng số 2..."
              placeholderTextColor="#9EABA8"
              value={internalNote}
              onChangeText={(text) => setInternalNote(text.slice(0, 100))}
              multiline
              maxLength={100}
            />
            <Text style={styles.charCount}>{internalNote.length}/100 ký tự</Text>
          </ScrollView>

          {/* Footer nút hành động */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-confirm-block"
              style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmBtnText}>
                {loading ? 'Đang khóa...' : 'Xác nhận khóa phòng'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeading,
  },
  dateRangeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: 14,
  },
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECEC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#BA1A1A',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeading,
    marginBottom: 8,
    marginTop: 6,
  },
  reasonsList: {
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  reasonItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E6F4F2',
  },
  reasonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  reasonLabel: {
    fontSize: 13,
    color: COLORS.textHeading,
    marginLeft: 10,
    fontWeight: '500',
  },
  reasonLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A5B4CB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.textHeading,
    minHeight: 65,
    textAlignVertical: 'top',
    backgroundColor: '#FAFCFF',
  },
  charCount: {
    fontSize: 11,
    color: '#9EABA8',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#BA1A1A', // Danger Solid theo Figma spec
    alignItems: 'center',
    ...SHADOWS.button,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BlockDateModal;

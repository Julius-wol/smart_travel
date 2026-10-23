import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const UnblockDateModal = ({
  visible,
  targetDate,
  onClose,
  onConfirmUnblock,
  loading,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Icon mở khóa */}
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lock-open-outline" size={32} color={COLORS.primary} />
          </View>

          {/* Tiêu đề & Thông điệp CAL-CONFIRM-UNBLOCK */}
          <Text style={styles.modalTitle}>Mở lại ngày đón khách</Text>
          <Text style={styles.dateBadgeText}>Ngày: {targetDate}</Text>
          <Text style={styles.modalMessage}>
            Bạn có chắc muốn mở lại ngày này? Phòng sẽ được hiển thị công khai trên ứng dụng để du khách đặt chỗ.
          </Text>

          {/* Nút hành động */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-confirm-unblock"
              style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
              onPress={() => onConfirmUnblock(targetDate)}
              disabled={loading}
            >
              <Text style={styles.confirmBtnText}>
                {loading ? 'Đang mở...' : 'Mở lại ngày'}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F4F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeading,
    marginBottom: 6,
    textAlign: 'center',
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#E8FBF4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
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
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default UnblockDateModal;

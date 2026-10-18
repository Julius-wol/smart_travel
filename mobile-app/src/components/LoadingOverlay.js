import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * LoadingOverlay Component (SMART-88 - CR_BOOK_05)
 * Modal mô phỏng tiến trình xác thực thanh toán an toàn trong 1.5 giây
 */
export const LoadingOverlay = ({ visible = false }) => {
  return (
    <Modal
      testID="loading-overlay-modal"
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
          <Text testID="loading-overlay-text" style={styles.loadingTitle}>
            Đang xử lý đặt phòng và xác nhận thanh toán an toàn...
          </Text>
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed" size={14} color={COLORS.primary} />
            <Text style={styles.securityText}>Bảo mật giao dịch mã hóa SSL 256-bit</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  securityText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default LoadingOverlay;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * CheckoutBottomBar Component (Figma Node #30:2762)
 * Thanh đáy cố định hiển thị tổng tiền và nút Xác nhận & Thanh toán
 */
export const CheckoutBottomBar = ({
  totalPrice = 0,
  onSubmit,
  loading = false,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
  };

  return (
    <View style={styles.bottomBar}>
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Thanh toán ngay:</Text>
        <Text testID="bottom-bar-price" style={styles.priceValue}>
          {formatCurrency(totalPrice)}
        </Text>
        <Text style={styles.policySubtext}>Miễn phí hủy trong 48h</Text>
      </View>

      <TouchableOpacity
        testID="checkout-submit-btn"
        style={[styles.payButton, loading ? styles.payButtonDisabled : null]}
        activeOpacity={0.85}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    ...SHADOWS.card,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.extraBold,
    color: COLORS.primary,
  },
  policySubtext: {
    fontSize: 10,
    color: COLORS.primaryDark,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.button,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default CheckoutBottomBar;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const PAYMENT_METHODS = [
  {
    id: 'NAPAS_QR',
    title: 'Chuyển khoản QR Napas 24/7',
    subtitle: 'Quét mã VietQR tự động, xác nhận ngay',
    badge: 'Khuyên dùng',
    icon: 'qr-code-outline',
  },
];

/**
 * PaymentMethodSelector Component (Figma Node #30:2648)
 * Nhóm Radio Button lựa chọn 3 phương thức thanh toán
 */
export const PaymentMethodSelector = ({ selectedMethod = 'NAPAS_QR', onSelectMethod }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Text style={styles.sectionSubtitle}>
            Bảo mật SSL 256-bit theo chuẩn Ngân hàng Nhà nước
          </Text>
        </View>
      </View>

      <View style={styles.methodsList}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              testID={`payment-method-${method.id}`}
              style={[
                styles.methodCard,
                isSelected ? styles.methodCardActive : styles.methodCardInactive,
              ]}
              activeOpacity={0.85}
              onPress={() => onSelectMethod && onSelectMethod(method.id)}
            >
              {/* Radio Indicator */}
              <View
                style={[
                  styles.radioOuter,
                  isSelected ? styles.radioOuterActive : styles.radioOuterInactive,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>

              {/* Icon */}
              <View style={styles.methodIconWrap}>
                <Ionicons
                  name={method.icon}
                  size={20}
                  color={isSelected ? COLORS.primary : COLORS.textBody}
                />
              </View>

              {/* Thông tin phương thức */}
              <View style={styles.methodInfo}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.methodTitle,
                      isSelected ? styles.methodTitleActive : null,
                    ]}
                  >
                    {method.title}
                  </Text>
                  {method.badge && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedBadgeText}>{method.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginTop: 2,
  },
  methodsList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3FAF9',
  },
  methodCardInactive: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioOuterInactive: {
    borderColor: COLORS.textMuted,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  methodIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  methodInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  methodTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  methodTitleActive: {
    color: COLORS.primary,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  methodSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginTop: 2,
  },
});

export default PaymentMethodSelector;

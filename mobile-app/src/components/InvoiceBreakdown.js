import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * InvoiceBreakdown Component (Figma Node #30:2707 & #30:2751)
 * Bảng chi tiết hóa đơn và khung cam kết bảo vệ khách hàng 150%
 */
export const InvoiceBreakdown = ({
  pricing = {
    pricePerNight: 1250000,
    nights: 2,
    subtotal: 2500000,
    totalPrice: 2500000,
  },
  checkInDate = '2026-10-25',
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. Header chi tiết hóa đơn */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>
      </View>

      {/* 2. Các dòng hóa đơn */}
      <View style={styles.invoiceRows}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Tiền phòng ({formatCurrency(pricing.pricePerNight)} x {pricing.nights} đêm)
          </Text>
          <Text testID="invoice-subtotal" style={styles.rowValue}>
            {formatCurrency(pricing.subtotal)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Thuế VAT & Phí dịch vụ (8%)</Text>
          <Text style={styles.includedTag}>Đã bao gồm</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền lưu trú</Text>
            <Text style={styles.totalSublabel}>Đã gồm trọn gói dịch vụ</Text>
          </View>
          <Text testID="invoice-total" style={styles.totalPrice}>
            {formatCurrency(pricing.totalPrice)}
          </Text>
        </View>
      </View>

      {/* 3. Khung Chính sách & Cam kết bồi thường 150% (Figma #30:2751) */}
      <View style={styles.policyContainer}>
        <View style={styles.policyItem}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
          <Text style={styles.policyText}>
            Miễn phí hủy phòng trước 14:00 ngày {formatDateDisplay(checkInDate)} hoàn lại 100% tổng tiền đã thanh toán.
          </Text>
        </View>

        <View style={styles.policyItem}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
          <Text style={styles.policyText}>
            <Text style={styles.policyBold}>Đảm bảo 100% giữ phòng:</Text> Smart Travel cam kết bồi thường 150% nếu phòng không đúng thực tế.
          </Text>
        </View>
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
    marginBottom: 14,
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
  invoiceRows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textBody,
  },
  rowValue: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  includedTag: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  totalSublabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginTop: 2,
  },
  totalPrice: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontWeight: TYPOGRAPHY.weights.extraBold,
    color: COLORS.primary,
  },
  policyContainer: {
    marginTop: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#C3E7E3',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  policyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    lineHeight: 18,
  },
  policyBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
});

export default InvoiceBreakdown;

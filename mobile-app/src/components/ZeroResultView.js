import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

/**
 * ZeroResultView Component (SMART-84 - SCR-MOB-BOOK-01)
 * Hiển thị trạng thái không có homestay nào khớp với tiêu chí tìm kiếm/lọc
 */
const ZeroResultView = ({ onResetFilters, searchQuery }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>🔍</Text>
      </View>
      <Text style={styles.title}>Không tìm thấy homestay phù hợp</Text>
      <Text style={styles.description}>
        {searchQuery
          ? `Không có kết quả nào cho "${searchQuery}". Hãy thử tìm kiếm tên khu vực khác hoặc điều chỉnh khoảng giá.`
          : 'Không có homestay nào phù hợp với bộ lọc hiện tại. Vui lòng thử nới lỏng các tiêu chí lọc.'}
      </Text>
      {onResetFilters && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onResetFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>Xóa tất cả bộ lọc</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.subheading,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.regular,
    color: COLORS.textBody,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.full,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default ZeroResultView;

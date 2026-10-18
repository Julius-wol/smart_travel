import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

export const FilterBottomSheet = ({
  visible,
  onClose,
  initialFilters = {},
  onApply,
}) => {
  const [priceRange, setPriceRange] = useState(
    initialFilters.minPrice === 0 && initialFilters.maxPrice === 1000000
      ? 'UNDER_1M'
      : initialFilters.minPrice === 1000000 && initialFilters.maxPrice === 2000000
      ? '1M_2M'
      : initialFilters.minPrice === 2000000
      ? 'OVER_2M'
      : 'ALL'
  );

  const [minRating, setMinRating] = useState(initialFilters.minRating || null);
  const [guests, setGuests] = useState(initialFilters.guests || 2);
  const [roomsCount, setRoomsCount] = useState(initialFilters.roomsCount || 1);

  // Đồng bộ khi mở modal với bộ lọc hiện tại
  useEffect(() => {
    if (visible) {
      setPriceRange(
        initialFilters.minPrice === 0 && initialFilters.maxPrice === 1000000
          ? 'UNDER_1M'
          : initialFilters.minPrice === 1000000 && initialFilters.maxPrice === 2000000
          ? '1M_2M'
          : initialFilters.minPrice === 2000000
          ? 'OVER_2M'
          : 'ALL'
      );
      setMinRating(initialFilters.minRating || null);
      setGuests(initialFilters.guests || 2);
      setRoomsCount(initialFilters.roomsCount || 1);
    }
  }, [visible, initialFilters]);

  const priceOptions = [
    { id: 'ALL', label: 'Tất cả mức giá' },
    { id: 'UNDER_1M', label: 'Dưới 1 triệu /đêm' },
    { id: '1M_2M', label: 'Từ 1tr - 2 triệu /đêm' },
    { id: 'OVER_2M', label: 'Trên 2 triệu /đêm' },
  ];

  const ratingOptions = [
    { value: null, label: 'Tất cả' },
    { value: 4.0, label: '★ 4.0+' },
    { value: 4.5, label: '★ 4.5+' },
    { value: 4.8, label: '★ 4.8+ (Xuất sắc)' },
  ];

  const handleApply = () => {
    let minPrice = null;
    let maxPrice = null;

    if (priceRange === 'UNDER_1M') {
      minPrice = 0;
      maxPrice = 1000000;
    } else if (priceRange === '1M_2M') {
      minPrice = 1000000;
      maxPrice = 2000000;
    } else if (priceRange === 'OVER_2M') {
      minPrice = 2000000;
      maxPrice = null;
    }

    onApply({
      minPrice,
      maxPrice,
      minRating,
      guests: Number(guests) || 1,
      roomsCount: Number(roomsCount) || 1,
    });
    onClose();
  };

  const handleReset = () => {
    setPriceRange('ALL');
    setMinRating(null);
    setGuests(2);
    setRoomsCount(1);
    onApply({
      minPrice: null,
      maxPrice: null,
      minRating: null,
      guests: 2,
      roomsCount: 1,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bộ lọc nâng cao</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. Mức giá */}
            <Text style={styles.sectionTitle}>Khoảng giá mỗi đêm</Text>
            <View style={styles.optionsGrid}>
              {priceOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionPill,
                    priceRange === opt.id && styles.optionPillActive,
                  ]}
                  onPress={() => setPriceRange(opt.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      priceRange === opt.id && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 2. Đánh giá sao */}
            <Text style={styles.sectionTitle}>Điểm đánh giá tối thiểu</Text>
            <View style={styles.optionsRow}>
              {ratingOptions.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[
                    styles.ratingPill,
                    minRating === opt.value && styles.optionPillActive,
                  ]}
                  onPress={() => setMinRating(opt.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      minRating === opt.value && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Số khách */}
            <Text style={styles.sectionTitle}>Số lượng khách</Text>
            <View style={styles.guestCounter}>
              <View>
                <Text style={styles.counterLabel}>Số khách tối thiểu:</Text>
                <Text style={styles.counterHint}>Bao gồm người lớn & trẻ em</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setGuests(Math.max(1, (parseInt(guests, 10) || 1) - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  value={String(guests)}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setGuests(cleaned === '' ? '' : parseInt(cleaned, 10));
                  }}
                  onBlur={() => {
                    if (!guests || guests < 1) setGuests(1);
                  }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setGuests((parseInt(guests, 10) || 1) + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Số phòng */}
            <Text style={styles.sectionTitle}>Số lượng phòng</Text>
            <View style={styles.guestCounter}>
              <View>
                <Text style={styles.counterLabel}>Số phòng tối thiểu:</Text>
                <Text style={styles.counterHint}>Số phòng ngủ cần đặt</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setRoomsCount(Math.max(1, (parseInt(roomsCount, 10) || 1) - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  value={String(roomsCount)}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setRoomsCount(cleaned === '' ? '' : parseInt(cleaned, 10));
                  }}
                  onBlur={() => {
                    if (!roomsCount || roomsCount < 1) setRoomsCount(1);
                  }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setRoomsCount((parseInt(roomsCount, 10) || 1) + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
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
    backgroundColor: 'rgba(11, 28, 48, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FA',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.subheading,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: COLORS.textBody,
  },
  content: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginTop: 14,
    marginBottom: 8,
  },
  optionsGrid: {
    gap: 8,
  },
  optionPill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: '#E2EAF8',
  },
  optionPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textHeading,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: '#E2EAF8',
  },
  guestCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  counterLabel: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.textHeading,
  },
  counterHint: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    color: COLORS.textBody,
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  numberInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textHeading,
    minWidth: 36,
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FA',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
  },
  resetBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: TYPOGRAPHY.weights.semiBold,
    color: COLORS.textBody,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});

export default FilterBottomSheet;

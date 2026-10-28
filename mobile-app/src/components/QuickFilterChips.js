import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export const QuickFilterChips = ({
  totalCount = 10,
  selectedChip = 'ALL',
  onSelectChip,
}) => {
  const chips = [
    { id: 'ALL', label: `Tất cả (${totalCount})`, icon: null },
    { id: 'BEACH', label: 'Gần biển', icon: '🌊' },
    { id: 'VIEW', label: 'View đồi / Săn mây', icon: '⛰️' },
    { id: 'BUDGET', label: 'Giá < 800k', icon: '💰' },
    { id: 'POOL', label: 'Bể bơi vô cực', icon: '🏊' },
    { id: 'PETS', label: 'Cho phép thú cưng', icon: '🐾' },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {chips.map((chip) => {
          const isActive = selectedChip === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => onSelectChip && onSelectChip(chip.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {chip.label}
              </Text>
              {chip.icon && <Text style={styles.chipIcon}> {chip.icon}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 44,
    marginVertical: 4,
  },
  container: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    height: 36,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipInactive: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: '#E6EFFD',
    ...SHADOWS.chip,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: COLORS.textHeading,
  },
  chipIcon: {
    fontSize: 12,
  },
});

export default QuickFilterChips;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export const calculateScore = (formData = {}) => {
  let score = 0;

  // 1. Tên & Vị trí (25%)
  const hasTitle = formData.title && formData.title.trim().length >= 10;
  const hasLocation = formData.city && formData.district && formData.address;
  const item1Done = hasTitle && hasLocation;
  if (item1Done) score += 25;
  else if (hasTitle || hasLocation) score += 15;

  // 2. Định giá & Chính sách (25%)
  const hasPrice = formData.pricePerNight && Number(formData.pricePerNight) >= 50000;
  const hasWeekend = !!formData.weekendPricePerNight;
  const hasPolicy = formData.cancellationPolicy48h !== false;
  const item2Done = hasPrice && hasWeekend && hasPolicy;
  if (item2Done) score += 25;
  else if (hasPrice) score += 18;

  // 3. Tiện ích đầy đủ (25%)
  const amenityCount = Array.isArray(formData.amenities) ? formData.amenities.length : 0;
  const item3Done = amenityCount >= 6;
  if (item3Done) score += 25;
  else if (amenityCount >= 1) score += 20;

  // 4. Album hình ảnh (25%)
  const imgCount = Array.isArray(formData.images) ? formData.images.length : 0;
  const item4Done = imgCount >= 5;
  if (item4Done) score += 25;
  else if (imgCount >= 3) score += 22;
  else if (imgCount > 0) score += 10;

  return {
    total: Math.min(100, Math.max(0, score)),
    item1Done,
    item2Done,
    item3Done,
    item4Done,
    amenityCount,
    imgCount,
  };
};

const SuperhostScoreCard = ({ formData = {} }) => {
  const { total, item1Done, item2Done, item3Done, item4Done, amenityCount, imgCount } =
    calculateScore(formData);

  const isSuperhost = total >= 80;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name={isSuperhost ? 'shield-star' : 'shield-outline'}
            size={20}
            color={isSuperhost ? '#00685F' : '#64748B'}
          />
          <Text style={styles.cardTitle}>Chỉ số tối ưu Superhost</Text>
        </View>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: isSuperhost ? '#DCFCE7' : '#FEF3C7' },
          ]}
        >
          <Text
            style={[
              styles.scoreBadgeText,
              { color: isSuperhost ? '#15803D' : '#B45309' },
            ]}
          >
            {total}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${total}%`,
              backgroundColor: isSuperhost ? '#00685F' : '#D97706',
            },
          ]}
        />
      </View>

      <Text style={styles.statusDescription}>
        {isSuperhost
          ? '🎉 Phòng của bạn đã đạt tiêu chuẩn hiển thị ưu tiên Superhost!'
          : 'Cần đạt tối thiểu 80% để nhận huy hiệu Superhost và tăng 35% lượt đặt.'}
      </Text>

      {/* Checklist Breakdown */}
      <View style={styles.checklist}>
        {/* Item 1 */}
        <View style={styles.checkItem}>
          <MaterialCommunityIcons
            name={item1Done ? 'check-circle' : 'circle-outline'}
            size={16}
            color={item1Done ? '#16A34A' : '#94A3B8'}
          />
          <Text style={[styles.checkText, item1Done && styles.checkTextDone]}>
            Tên và địa chỉ đầy đủ (+25%)
          </Text>
        </View>

        {/* Item 2 */}
        <View style={styles.checkItem}>
          <MaterialCommunityIcons
            name={item2Done ? 'check-circle' : 'circle-outline'}
            size={16}
            color={item2Done ? '#16A34A' : '#94A3B8'}
          />
          <Text style={[styles.checkText, item2Done && styles.checkTextDone]}>
            Giá ngày thường & cuối tuần linh hoạt (+25%)
          </Text>
        </View>

        {/* Item 3 */}
        <View style={styles.checkItem}>
          <MaterialCommunityIcons
            name={item3Done ? 'check-circle' : 'circle-outline'}
            size={16}
            color={item3Done ? '#16A34A' : '#94A3B8'}
          />
          <Text style={[styles.checkText, item3Done && styles.checkTextDone]}>
            Tối thiểu 6 tiện ích ({amenityCount}/6) (+25%)
          </Text>
        </View>

        {/* Item 4 */}
        <View style={styles.checkItem}>
          <MaterialCommunityIcons
            name={item4Done ? 'check-circle' : 'circle-outline'}
            size={16}
            color={item4Done ? '#16A34A' : '#94A3B8'}
          />
          <Text style={[styles.checkText, item4Done && styles.checkTextDone]}>
            Tối thiểu 5 hình ảnh chất lượng ({imgCount}/5) (+25%)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusDescription: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 14,
  },
  checklist: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
  },
  checkTextDone: {
    color: '#0F172A',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
  },
});

export default SuperhostScoreCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    guestName: 'Trần Thị Bình',
    initials: 'TB',
    rating: 5,
    roomName: 'Villa Mộng Mơ H5',
    date: '13/10/2026',
    comment:
      'Phòng sạch sẽ, view hồ bơi buổi sáng rất đẹp. Chủ nhà nhiệt tình hỗ trợ check-in sớm. Điểm trừ là wifi hơi yếu ở tầng 2.',
  },
  {
    id: 'rev-2',
    guestName: 'Lê Hoàng Nam',
    initials: 'LN',
    rating: 5,
    roomName: 'Villa Mộng Mơ',
    date: '05/11/2026',
    comment:
      'Chuyến nghỉ dưỡng tuyệt vời cho cả gia đình! Bếp nướng BBQ ngoài trời đầy đủ dụng cụ, hồ bơi nước ấm ngắm cảnh cực chill...',
  },
];

const HostRecentReviews = ({
  recentReviews,
  onNavigateReviews,
}) => {
  const reviewsList = recentReviews?.list || DEFAULT_REVIEWS;
  const overallRating = recentReviews?.overallRating || 4.7;

  return (
    <View style={styles.cardContainer} testID="recent-reviews-card">
      {/* 1. Header (Figma 4.1) */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.cardTitle}>Đánh giá mới nhất</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#CA8A04" style={{ marginRight: 3 }} />
              <Text style={styles.ratingBadgeText}>{`${overallRating} / 5.0`}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>Từ khách đã hoàn thành kỳ nghỉ</Text>
        </View>

        {/* Action Link: Xem tất cả */}
        <TouchableOpacity
          testID="btn-view-all-reviews"
          style={styles.viewAllBtn}
          onPress={onNavigateReviews}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="arrow-forward" size={13} color="#00685F" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>

      {/* 2. Top 3 Reviews List (Figma 4.2) */}
      <View style={styles.listContainer}>
        {reviewsList.map((item) => (
          <TouchableOpacity
            key={item.id}
            testID={`review-item-${item.id}`}
            style={styles.reviewItem}
            onPress={onNavigateReviews}
            activeOpacity={0.8}
          >
            {/* Top Row: Avatar + Name + Stars */}
            <View style={styles.reviewTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>

              <View style={styles.reviewerCol}>
                <Text style={styles.guestName}>{item.guestName}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color="#EAB308"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Meta Row: Room Name + Date */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {item.roomName} • {item.date}
              </Text>
            </View>

            {/* Review Comment Quote (max 2 lines) */}
            <Text style={styles.commentQuote} numberOfLines={2}>
              "{item.comment}"
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleCol: {
    flex: 1,
    minWidth: 160,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1C30',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00685F',
  },
  listContainer: {
    gap: 12,
  },
  reviewItem: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  reviewerCol: {
    flex: 1,
  },
  guestName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  metaRow: {
    marginBottom: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  commentQuote: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default HostRecentReviews;

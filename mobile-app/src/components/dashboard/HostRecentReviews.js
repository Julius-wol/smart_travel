import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const HostRecentReviews = ({
  recentReviews,
  onNavigateReviews,
}) => {
  const reviewsList = recentReviews?.list || [];
  const overallRating = recentReviews?.overallRating || 5.0;

  return (
    <View style={styles.cardContainer} testID="recent-reviews-card">
      {/* 1. Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.cardTitle}>Đánh giá mới nhất</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#CA8A04" style={{ marginRight: 3 }} />
              <Text style={styles.ratingBadgeText}>{`${overallRating} / 5.0`}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>Từ khách đã hoàn thành kỳ nghỉ thực tế</Text>
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

      {/* 2. Reviews List */}
      <View style={styles.listContainer}>
        {reviewsList.length === 0 ? (
          <View style={styles.emptyReviewBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#94A3B8" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyReviewText}>Chưa có đánh giá nào từ khách lưu trú.</Text>
          </View>
        ) : (
          reviewsList.map((item) => (
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
                        color={star <= Math.round(item.rating || 5) ? '#EAB308' : '#E2E8F0'}
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

              {/* Comment Body */}
              <Text style={styles.commentText} numberOfLines={3}>
                "{item.comment}"
              </Text>
            </TouchableOpacity>
          ))
        )}
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
    gap: 12,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#713F12',
    fontFamily: TYPOGRAPHY.fontFamily,
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
    fontFamily: TYPOGRAPHY.fontFamily,
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
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  reviewerCol: {
    flex: 1,
  },
  guestName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaRow: {
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  commentText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 6,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontStyle: 'italic',
  },
  emptyReviewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyReviewText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default HostRecentReviews;

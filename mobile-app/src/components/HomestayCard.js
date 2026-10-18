import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  BORDER_RADIUS,
} from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 24; // paddingHorizontal 12 mỗi bên

export const HomestayCard = ({
  room,
  isSaved = false,
  onToggleWishlist,
  onPress,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Danh sách hình ảnh mẫu nếu phòng chưa có ảnh
  const images = room.images && room.images.length > 0
    ? room.images
    : [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      ];

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveImageIndex(index);
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* 1. Image Media Container & Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.slideImage}
              resizeMode="cover"
            />
          )}
        />

        {/* AI Match Badge (Top-left) */}
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>
            ✨ {room.badge || (room.aiRecommended ? 'AI Đề xuất' : 'Top 1% Homestay lãng mạn')}
          </Text>
        </View>

        {/* Wishlist Heart Button (Top-right) */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => onToggleWishlist && onToggleWishlist(room)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={20}
            color={isSaved ? '#DC2626' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Image Indicator Pill (Bottom-right) */}
        <View style={styles.indicatorPill}>
          <Text style={styles.indicatorText}>
            {activeImageIndex + 1}/{images.length}
          </Text>
        </View>
      </View>

      {/* 2. Content Details */}
      <View style={styles.detailsContainer}>
        {/* Title & Rating Row */}
        <View style={styles.titleRatingRow}>
          <View style={styles.titleCol}>
            <Text style={styles.title} numberOfLines={1}>
              {room.name || room.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color="#00685F" style={{ marginRight: 2 }} />
              <Text style={styles.location} numberOfLines={1}>
                {room.address || room.city} • {room.distance || room.distanceInfo || 'Cách bãi biển 250m'}
              </Text>
            </View>
          </View>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFB800" style={{ marginRight: 2 }} />
            <Text style={styles.ratingScore}>{room.rating || 4.9}</Text>
            <Text style={styles.reviewCount}>({room.reviewCount || 128})</Text>
          </View>
        </View>

        {/* Amenities Tag Ribbon */}
        {room.amenities && room.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {room.amenities.slice(0, 3).map((amenity, idx) => {
              const amenityName =
                typeof amenity === 'object' && amenity !== null
                  ? amenity.name || amenity.title || ''
                  : String(amenity);
              return (
                <View key={amenity?.id || amenity?._id || idx} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenityName}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Pricing Block & Action */}
        <View style={styles.priceActionRow}>
          <View style={styles.priceBlock}>
            {room.originalPrice && room.originalPrice > (room.price || room.pricePerNight) && (
              <View style={styles.originalPriceRow}>
                <Text style={styles.originalPrice}>
                  {formatPrice(room.originalPrice)}
                </Text>
                {room.discountPercent > 0 && (
                  <View style={styles.discountTag}>
                    <Text style={styles.discountText}>
                      -{room.discountPercent}%
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.finalPriceRow}>
              <Text style={styles.finalPrice}>
                {formatPrice(room.price || room.pricePerNight)}
              </Text>
              <Text style={styles.perNightText}> /đêm</Text>
            </View>

            <View style={styles.policyRow}>
              <Ionicons name="shield-checkmark" size={12} color="#00685F" style={{ marginRight: 3 }} />
              <Text style={styles.policyText}>
                {room.cancellationPolicy || 'Miễn phí hủy phòng trước 48h'}
              </Text>
            </View>
          </View>

          {/* CTA "Xem phòng" */}
          <TouchableOpacity
            style={styles.viewRoomBtn}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewRoomBtnText}>Xem phòng</Text>
            <Text style={styles.chevronIcon}> ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.xl,
    padding: 8,
    marginHorizontal: 12,
    marginVertical: 8,
    ...SHADOWS.card,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2EAF8',
  },
  slideImage: {
    width: CARD_WIDTH - 16, // Tính trừ padding thẻ Card
    height: 200,
  },
  aiBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.aiBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  aiBadgeText: {
    color: COLORS.aiBadgeText,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  heartIcon: {
    fontSize: 16,
  },
  heartIconActive: {
    fontSize: 17,
  },
  indicatorPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.overlayDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  detailsContainer: {
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 4,
  },
  titleRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textBody,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 3,
  },
  starIcon: {
    color: COLORS.starGold,
    fontSize: 12,
  },
  ratingScore: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  reviewCount: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    color: COLORS.textBody,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  amenityTag: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  amenityText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    color: COLORS.textBody,
  },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FA',
  },
  priceBlock: {
    flex: 1,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: COLORS.discountBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.xs,
  },
  discountText: {
    color: COLORS.discountText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  finalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  finalPrice: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.subheading,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  perNightText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textBody,
  },
  policyText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },
  viewRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.button,
  },
  viewRoomBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  chevronIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomestayCard;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistThunk } from '../store/slices/wishlistSlice';
import { fetchRoomDetailApi } from '../services/roomService';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * RoomDetailScreen Component (SMART-84 - SCR-MOB-BOOK-02)
 * Màn hình hiển thị chi tiết Homestay được chọn từ màn hình tìm kiếm
 */
const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params || {};
  const dispatch = useDispatch();
  const savedRoomIds = useSelector((state) => state.wishlist.savedRoomIds);
  const isWishlisted = !!savedRoomIds[roomId];

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    const loadDetail = async () => {
      try {
        setLoading(true);
        const res = await fetchRoomDetailApi(roomId);
        if (res.data) {
          setRoom(res.data);
        }
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin phòng');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [roomId]);

  const handleToggleWishlist = () => {
    if (room) {
      dispatch(toggleWishlistThunk({ room }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết homestay...</Text>
      </SafeAreaView>
    );
  }

  if (error || !room) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy phòng'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const primaryImage =
    room.images && room.images.length > 0
      ? room.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0B1C30" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {room.title || room.name}
        </Text>
        <TouchableOpacity style={styles.iconCircle} onPress={handleToggleWishlist}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? '#DC2626' : '#0B1C30'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <Image source={{ uri: primaryImage }} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.contentPadding}>
          {/* Badge & Rating */}
          <View style={styles.metaRow}>
            {room.aiRecommended && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI Đề xuất</Text>
              </View>
            )}
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#FFB800" style={{ marginRight: 2 }} />
              <Text style={styles.ratingScore}>{room.rating?.toFixed(1) || '4.9'}</Text>
              <Text style={styles.reviewCount}>({room.reviewCount || 128} đánh giá)</Text>
            </View>
          </View>

          {/* Name & Address */}
          <Text style={styles.roomName}>{room.title || room.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="location-sharp" size={14} color="#00685F" style={{ marginRight: 3 }} />
            <Text style={styles.addressText}>{room.address || room.city}</Text>
          </View>

          {room.distanceInfo && (
            <Text style={styles.distanceText}>🚗 Cách trung tâm {room.distanceInfo}</Text>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Info blocks */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Sức chứa</Text>
              <Text style={styles.specValue}>{room.maxGuests || 2} khách</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Phòng ngủ</Text>
              <Text style={styles.specValue}>{room.bedrooms || 1} phòng</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Giường</Text>
              <Text style={styles.specValue}>{room.beds || 1} giường</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Giới thiệu homestay</Text>
          <Text style={styles.descText}>
            {room.description ||
              'Không gian nghỉ dưỡng lý tưởng với đầy đủ tiện nghi hiện đại, view biển thoáng mát và không gian xanh yên bình.'}
          </Text>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tiện nghi nổi bật</Text>
              <View style={styles.amenitiesWrap}>
                {room.amenities.map((item, idx) => {
                  const name =
                    typeof item === 'object' && item !== null
                      ? item.name || item.title || ''
                      : String(item);
                  return (
                    <View key={item?.id || item?._id || idx} style={styles.amenityChip}>
                      <Text style={styles.amenityText}>✓ {name}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Policy */}
          {room.cancellationPolicy && (
            <View style={styles.policyBox}>
              <Text style={styles.policyTitle}>Chính sách hủy phòng</Text>
              <Text style={styles.policyText}>{room.cancellationPolicy}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá mỗi đêm từ</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{formatCurrency(room.price)}</Text>
            {room.originalPrice && room.originalPrice > room.price && (
              <Text style={styles.originalPrice}>{formatCurrency(room.originalPrice)}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} activeOpacity={0.85}>
          <Text style={styles.bookButtonText}>Đặt phòng ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.screenBg,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textHeading,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  contentPadding: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiBadge: {
    backgroundColor: COLORS.aiBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  aiBadgeText: {
    color: COLORS.aiBadgeText,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    color: COLORS.starGold,
    fontSize: 16,
    marginRight: 4,
  },
  ratingScore: {
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textBody,
  },
  roomName: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginTop: 6,
    marginBottom: 6,
  },
  addressText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textBody,
    marginBottom: 4,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 16,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginBottom: 4,
  },
  specValue: {
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginBottom: 10,
  },
  descText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textBody,
    lineHeight: 22,
    marginBottom: 16,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amenityChip: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  amenityText: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textHeading,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  policyBox: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  policyTitle: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#92400E',
    marginBottom: 2,
  },
  policyText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: '#78350F',
  },
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.extraBold,
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.button,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textBody,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  errorText: {
    color: COLORS.discountText,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default RoomDetailScreen;

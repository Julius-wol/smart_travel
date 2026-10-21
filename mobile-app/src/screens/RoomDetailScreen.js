import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistThunk } from '../store/slices/wishlistSlice';
import { fetchRoomDetailApi } from '../services/roomService';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Figma Assets
const FIGMA_IMAGES = [
  require('../../assets/figma/hero_room.png'),
  require('../../assets/figma/thumb_1.png'),
  require('../../assets/figma/thumb_2.png'),
  require('../../assets/figma/thumb_3.png'),
  require('../../assets/figma/thumb_4.png'),
];

const REVIEW_PHOTOS = [
  require('../../assets/figma/review_1_photo1.png'),
  require('../../assets/figma/review_1_photo2.png'),
];

/**
 * RoomDetailScreen Component (SMART-84 - SCR-MOB-BOOK-02 / SMART-86)
 * Đồng bộ 100% UI với Figma Node 29:1974 (Home Details)
 */
const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params || {};
  const dispatch = useDispatch();
  const savedRoomIds = useSelector((state) => state.wishlist.savedRoomIds);
  const isWishlisted = !!savedRoomIds[roomId];

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedReviewFilter, setSelectedReviewFilter] = useState('all');

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
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + '₫';
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

  // Chuẩn bị danh sách ảnh gallery
  const galleryImages =
    room.images && room.images.length > 0
      ? room.images.map((img) => (typeof img === 'string' ? { uri: img } : img))
      : FIGMA_IMAGES;

  // Đảm bảo có ít nhất 4 ảnh cho strip thumbnails
  const thumbnails = [
    galleryImages[0] || FIGMA_IMAGES[0],
    galleryImages[1] || FIGMA_IMAGES[1],
    galleryImages[2] || FIGMA_IMAGES[2],
    galleryImages[3] || FIGMA_IMAGES[3],
  ];

  const currentHeroImage = galleryImages[selectedImageIndex] || thumbnails[0];

  const amenitiesList = [
    { title: 'Wifi tốc độ cao', subtitle: '250 Mbps cáp quang', icon: 'wifi' },
    { title: 'Bếp riêng cao cấp', subtitle: 'Gia vị & lò nướng', icon: 'restaurant-outline' },
    { title: 'Bồn tắm gỗ pơ-mu', subtitle: 'Tặng thảo mộc ngâm', icon: 'sparkles-outline' },
    { title: 'Máy chiếu phim 4K', subtitle: 'Netflix & âm thanh vòm', icon: 'videocam-outline' },
    { title: 'Giặt & Sấy khô', subtitle: 'Tự động trong phòng', icon: 'shirt-outline' },
    { title: 'Điều hòa 2 chiều', subtitle: 'Inverter lọc khí', icon: 'snow-outline' },
    { title: 'Ban công view biển', subtitle: 'Kê sẵn bàn trà chill', icon: 'sunny-outline' },
    { title: 'Chỗ đỗ xe ô tô', subtitle: 'Miễn phí khuôn viên', icon: 'car-outline' },
  ];

  const ratingCategories = [
    { label: 'Độ sạch sẽ', score: '5.0', percent: '100%' },
    { label: 'Vị trí & Cảnh quan', score: '4.9', percent: '98%' },
    { label: 'Dịch vụ & Chủ nhà', score: '4.9', percent: '98%' },
    { label: 'Tiện nghi phòng', score: '4.8', percent: '96%' },
    { label: 'Đáng giá tiền', score: '4.9', percent: '98%' },
  ];

  const displayPrice = room.price || room.pricePerNight || 1850000;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. Header Bar (Figma Node 29:2382) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#0B1C30" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home Detail</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleToggleWishlist}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? '#DC2626' : '#0B1C30'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAvatarButton} activeOpacity={0.8}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          {/* 2. Hero Gallery Section (Figma Node 29:2230) */}
          <View style={styles.heroSection}>
            <View style={styles.heroImageContainer}>
              <Image
                source={currentHeroImage}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroGradientOverlay} />

              {/* Floating Wishlist Heart */}
              <TouchableOpacity
                style={styles.heroFloatingHeart}
                onPress={handleToggleWishlist}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isWishlisted ? '#DC2626' : '#0B1C30'}
                />
              </TouchableOpacity>

              {/* Bottom Image Counter Badge */}
              <View style={styles.heroImageCounter}>
                <Ionicons name="camera-outline" size={13} color="#F8F9FF" style={{ marginRight: 4 }} />
                <Text style={styles.heroImageCounterText}>
                  {selectedImageIndex + 1}/{galleryImages.length > 4 ? galleryImages.length : 12}
                </Text>
              </View>
            </View>

            {/* Mini Gallery Thumbnails Strip */}
            <View style={styles.thumbnailsStrip}>
              {thumbnails.map((item, idx) => {
                const isSelected = selectedImageIndex === idx;
                const isLast = idx === 3;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.thumbnailWrapper,
                      isSelected && styles.thumbnailWrapperActive,
                    ]}
                    onPress={() => setSelectedImageIndex(idx)}
                    activeOpacity={0.85}
                  >
                    <Image source={item} style={styles.thumbnailImage} resizeMode="cover" />
                    {isLast && (
                      <View style={styles.thumbnailOverlay}>
                        <Text style={styles.thumbnailOverlayPlus}>+8</Text>
                        <Text style={styles.thumbnailOverlayText}>ảnh nữa</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Property Overview: Tags, Title, Rating (Figma Node 29:1976) */}
          <View style={styles.overviewSection}>
            <View style={styles.tagRow}>
              <View style={styles.tagSonTra}>
                <Text style={styles.tagSonTraText}>TOP 1% SƠN TRÀ</Text>
              </View>
              <View style={styles.tagEco}>
                <Text style={styles.tagEcoText}>Eco Living</Text>
              </View>
            </View>

            <Text
              style={styles.propertyTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {room.title || room.name || 'An Nhiên Eco Retreat Đà Nẵng'}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#EAB308" style={{ marginRight: 4 }} />
              <Text style={styles.ratingScoreNumber}>
                {(room.rating || 4.9).toFixed(1)}
              </Text>
              <Text style={styles.ratingDot}>•</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.ratingReviewsLink}>
                  {room.reviewCount || 142} đánh giá
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Location Card (Figma Node 29:2002) */}
          <View style={styles.locationCard}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="location-sharp" size={18} color="#00685F" />
            </View>
            <View style={styles.locationTextWrap}>
              <Text style={styles.locationAddress}>
                {room.address || room.city || 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng'}
              </Text>
              <Text style={styles.locationDistance}>
                {room.distanceInfo || 'Cách bãi tắm Mỹ Khê 250m • Gần Chùa Linh Ứng (4km)'}
              </Text>
            </View>
          </View>

          {/* 5. Room Specs Bento Badges (2x2 Grid) (Figma Node 29:2017) */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <View style={[styles.bentoIconBox, { backgroundColor: '#ABF8B7' }]}>
                <Ionicons name="home-outline" size={18} color="#00201D" />
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>LOẠI HÌNH</Text>
                <Text style={styles.bentoValue} numberOfLines={1}>Nguyên căn</Text>
              </View>
            </View>

            <View style={styles.bentoCard}>
              <View style={[styles.bentoIconBox, { backgroundColor: '#E1E0FF' }]}>
                <Ionicons name="people-outline" size={18} color="#07006C" />
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>SỨC CHỨA</Text>
                <Text style={styles.bentoValue} numberOfLines={1}>
                  Tối đa {room.maxGuests || 4} khách
                </Text>
              </View>
            </View>

            <View style={styles.bentoCard}>
              <View style={[styles.bentoIconBox, { backgroundColor: '#DCE9FF' }]}>
                <Ionicons name="bed-outline" size={18} color="#00685F" />
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>PHÒNG NGỦ</Text>
                <Text style={styles.bentoValue} numberOfLines={1}>
                  {room.bedrooms || 2} PN • 2 Giường King
                </Text>
              </View>
            </View>

            <View style={styles.bentoCard}>
              <View style={[styles.bentoIconBox, { backgroundColor: '#DCE9FF' }]}>
                <Ionicons name="water-outline" size={18} color="#00685F" />
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>PHÒNG TẮM</Text>
                <Text style={styles.bentoValue} numberOfLines={1}>
                  2 Phòng tắm riêng
                </Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Giới thiệu homestay</Text>
            <Text style={styles.descriptionParagraph}>
              {room.description ||
                'Không gian nghỉ dưỡng lý tưởng với đầy đủ tiện nghi hiện đại, view biển thoáng mát và không gian xanh yên bình.'}
            </Text>
          </View>

          {/* 6. Tiện nghi nổi bật (Figma Node 29:2054) */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Tiện nghi nổi bật</Text>
            <View style={styles.amenitiesGrid}>
              {amenitiesList.map((item, idx) => (
                <View key={idx} style={styles.amenityCard}>
                  <Ionicons name={item.icon} size={18} color="#00685F" style={styles.amenityIcon} />
                  <View style={styles.amenityTextContainer}>
                    <Text style={styles.amenityTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.amenitySubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.8}>
              <Text style={styles.viewAllButtonText}>Xem tất cả tiện ích</Text>
              <Ionicons name="chevron-forward" size={15} color="#0B1C30" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* 7. Bảng điểm Rating chi tiết (Figma Node 29:2312) */}
          <View style={styles.ratingScoreCard}>
            <View style={styles.scoreBanner}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>4.9</Text>
                <Text style={styles.scoreOutOf}>/ 5.0</Text>
              </View>
              <View style={styles.scoreTextCol}>
                <Text style={styles.scoreTitle}>Xuất sắc vượt mong đợi</Text>
                <Text style={styles.scoreSubtitle}>
                  Được bình chọn bởi {room.reviewCount || 142} khách hàng đã lưu trú
                </Text>
              </View>
            </View>

            <View style={styles.progressList}>
              {ratingCategories.map((cat, idx) => (
                <View key={idx} style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{cat.label}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: cat.percent }]} />
                  </View>
                  <Text style={styles.progressScore}>{cat.score}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 8. Khách hàng chia sẻ (Figma Node 29:2131) */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Khách hàng chia sẻ</Text>
              <Text style={styles.reviewTotalCount}>
                {room.reviewCount || 142} bài viết
              </Text>
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipRow}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedReviewFilter === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedReviewFilter('all')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedReviewFilter === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  Tất cả ({room.reviewCount || 142})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedReviewFilter === 'photo' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedReviewFilter('photo')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedReviewFilter === 'photo' && styles.filterChipTextActive,
                  ]}
                >
                  Có hình ảnh (48)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedReviewFilter === 'star5' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedReviewFilter('star5')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedReviewFilter === 'star5' && styles.filterChipTextActive,
                  ]}
                >
                  Đánh giá 5 sao (118)
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Review Cards */}
            <View style={styles.reviewsList}>
              {/* Review 1 */}
              <View style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewUserRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: '#008378' }]}>
                      <Text style={styles.avatarLetter}>N</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewAuthor}>Trần Hoàng Nam</Text>
                      <Text style={styles.reviewMeta}>
                        Du khách TP.HCM • Lưu trú Tháng 4/2024
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewRatingPill}>
                    <Ionicons name="star" size={11} color="#EAB308" style={{ marginRight: 2 }} />
                    <Text style={styles.reviewRatingText}>5.0</Text>
                  </View>
                </View>

                <Text style={styles.reviewContent}>
                  “Phòng đẹp y hệt hình, ánh sáng tự nhiên ngập tràn. Thích nhất bồn tắm gỗ ngâm thảo mộc sau ngày dài tắm biển Mỹ Khê. Chủ nhà siêu thân thiện và Gemini AI gợi ý quán ăn xung quanh rất chuẩn!”
                </Text>

                <View style={styles.reviewPhotosRow}>
                  <Image source={REVIEW_PHOTOS[0]} style={styles.reviewPhotoThumb} />
                  <Image source={REVIEW_PHOTOS[1]} style={styles.reviewPhotoThumb} />
                </View>
              </View>

              {/* Review 2 */}
              <View style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewUserRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: '#6063EE' }]}>
                      <Text style={styles.avatarLetter}>T</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewAuthor}>Nguyễn Minh Thư</Text>
                      <Text style={styles.reviewMeta}>
                        Du khách Hà Nội • Lưu trú Tháng 3/2024
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewRatingPill}>
                    <Ionicons name="star" size={11} color="#EAB308" style={{ marginRight: 2 }} />
                    <Text style={styles.reviewRatingText}>4.9</Text>
                  </View>
                </View>

                <Text style={styles.reviewContent}>
                  “Không gian rất thơ mộng, ban công ngắm hoàng hôn Sơn Trà tuyệt vời. Wifi mạnh nên mình vừa nghỉ dưỡng vừa họp online mượt mà không hề gián đoạn.”
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.8}>
              <Text style={styles.viewAllButtonText}>
                Xem toàn bộ {room.reviewCount || 142} đánh giá
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#0B1C30" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          {/* 9. Chính sách nhận/trả phòng & Lưu trú (Figma Node 29:2193) */}
          <View style={styles.policySection}>
            <View style={styles.policyHeaderRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#00685F" style={{ marginRight: 6 }} />
              <Text style={styles.policySectionTitle}>Chính sách lưu trú & Hủy phòng</Text>
            </View>

            <View style={styles.checkInOutRow}>
              <View style={styles.checkCard}>
                <View style={styles.checkCardTop}>
                  <Ionicons name="log-in-outline" size={15} color="#00685F" style={{ marginRight: 4 }} />
                  <Text style={styles.checkCardTag}>GIỜ NHẬN PHÒNG</Text>
                </View>
                <Text style={styles.checkCardTime}>14:00</Text>
                <Text style={styles.checkCardDesc}>Tự nhận phòng bằng mã SmartLock</Text>
              </View>

              <View style={styles.checkCard}>
                <View style={styles.checkCardTop}>
                  <Ionicons name="log-out-outline" size={15} color="#00685F" style={{ marginRight: 4 }} />
                  <Text style={styles.checkCardTag}>GIỜ TRẢ PHÒNG</Text>
                </View>
                <Text style={styles.checkCardTime}>12:00</Text>
                <Text style={styles.checkCardDesc}>Hỗ trợ gửi hành lý miễn phí</Text>
              </View>
            </View>

            <View style={styles.cancellationCard}>
              <View style={styles.cancellationIconCircle}>
                <Ionicons name="checkmark-circle" size={18} color="#002116" />
              </View>
              <View style={styles.cancellationTextCol}>
                <Text style={styles.cancellationHeaderLabel}>Chính sách hủy phòng</Text>
                <Text style={styles.cancellationTitle}>
                  {room.cancellationPolicy || 'Miễn phí hủy phòng trước 48h'}
                </Text>
                <Text style={styles.cancellationDesc}>
                  Hoàn tiền 100% nếu hủy trước 14:00 ngày 13 Th05. Hủy sau thời gian này áp dụng chính sách hoàn 50% đêm đầu tiên.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 10. Bottom Sticky Action Bar (Figma Node 29:2401) */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <View style={styles.priceAmountRow}>
            <Text style={styles.priceValue}>{formatCurrency(displayPrice)}</Text>
            <Text style={styles.pricePerNight}>/ đêm</Text>
          </View>
          <View style={styles.priceTaxRow}>
            <Ionicons name="sparkles" size={12} color="#00685F" style={{ marginRight: 4 }} />
            <Text style={styles.priceTaxIncluded}>Đã bao gồm thuế & phí</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} activeOpacity={0.88}>
          <Text style={styles.bookButtonText}>Đặt phòng ngay</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#3D4947',
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#00685F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // 1. Header (Figma 29:2382)
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E9F4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1C30',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  headerAvatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 110,
  },
  contentWrapper: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 16,
  },

  // 2. Hero Gallery (Figma 29:2230)
  heroSection: {
    gap: 10,
  },
  heroImageContainer: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5EEFF',
    ...SHADOWS.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 28, 48, 0.1)',
  },
  heroFloatingHeart: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(248, 249, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  heroImageCounter: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 28, 48, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  heroImageCounterText: {
    color: '#F8F9FF',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailsStrip: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  thumbnailWrapper: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5EEFF',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperActive: {
    borderColor: '#00685F',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 49, 69, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverlayPlus: {
    color: '#F8F9FF',
    fontSize: 14,
    fontWeight: '700',
  },
  thumbnailOverlayText: {
    color: '#D3E4FE',
    fontSize: 10,
    fontWeight: '600',
  },

  // 3. Property Overview (Figma 29:1976)
  overviewSection: {
    gap: 4,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 2,
  },
  tagSonTra: {
    backgroundColor: '#E1E0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagSonTraText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#07006C',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  tagEco: {
    backgroundColor: '#A6F2D1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagEcoText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#002116',
    fontSize: 11,
  },
  propertyTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: '#0B1C30',
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingScoreNumber: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: '#0B1C30',
  },
  ratingDot: {
    color: '#6D7A77',
    fontSize: 14,
    marginHorizontal: 2,
  },
  ratingReviewsLink: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: '#00685F',
    textDecorationLine: 'underline',
  },

  // 4. Location Card (Figma 29:2002)
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF4FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 10,
  },
  locationIconWrap: {
    marginTop: 2,
  },
  locationTextWrap: {
    flex: 1,
    gap: 2,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  locationDistance: {
    fontSize: 12,
    color: '#3D4947',
    lineHeight: 16,
  },

  // 5. Room Specs Bento Grid (Figma 29:2017)
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bentoCard: {
    width: (width - 24 - 8) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...SHADOWS.card,
  },
  bentoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoContent: {
    flex: 1,
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D4947',
    letterSpacing: 0.3,
  },
  bentoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
    marginTop: 2,
  },

  // Description / Sections
  sectionWrap: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1C30',
  },
  descriptionParagraph: {
    fontSize: 13,
    color: '#3D4947',
    lineHeight: 21,
  },

  // 6. Amenities Grid (Figma 29:2054)
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityCard: {
    width: (width - 24 - 8) / 2,
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityIcon: {
    width: 22,
  },
  amenityTextContainer: {
    flex: 1,
  },
  amenityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  amenitySubtitle: {
    fontSize: 11,
    color: '#3D4947',
    marginTop: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5EEFF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewAllButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },

  // 7. Rating Breakdown Card (Figma 29:2312)
  ratingScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    ...SHADOWS.card,
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239, 244, 255, 0.6)',
    padding: 12,
    borderRadius: 12,
  },
  scoreBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  scoreOutOf: {
    fontSize: 10,
    color: '#89F5E7',
    fontWeight: '600',
  },
  scoreTextCol: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
  },
  scoreSubtitle: {
    fontSize: 12,
    color: '#3D4947',
    marginTop: 2,
  },
  progressList: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    width: 125,
    fontSize: 12,
    color: '#0B1C30',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#E5EEFF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#00685F',
  },
  progressScore: {
    width: 26,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C30',
  },

  // 8. Reviews Section (Figma 29:2131)
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewTotalCount: {
    fontSize: 12,
    color: '#3D4947',
    fontWeight: '500',
  },
  filterChipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#E5EEFF',
  },
  filterChipActive: {
    backgroundColor: '#00685F',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    ...SHADOWS.card,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  reviewMeta: {
    fontSize: 11,
    color: '#3D4947',
    marginTop: 1,
  },
  reviewRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5EEFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C30',
  },
  reviewContent: {
    fontSize: 13,
    color: '#0B1C30',
    lineHeight: 20,
  },
  reviewPhotosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewPhotoThumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },

  // 9. Policy Section (Figma 29:2193)
  policySection: {
    backgroundColor: '#EFF4FF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  policyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  policySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
  },
  checkInOutRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  checkCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCardTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3D4947',
  },
  checkCardTime: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
  },
  checkCardDesc: {
    fontSize: 11,
    color: '#3D4947',
    lineHeight: 15,
  },
  cancellationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cancellationIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A6F2D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cancellationTextCol: {
    flex: 1,
    gap: 2,
  },
  cancellationHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00685F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cancellationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  cancellationDesc: {
    fontSize: 12,
    color: '#3D4947',
    lineHeight: 17,
  },

  // 10. Bottom Sticky Bar (Figma 29:2401)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  priceContainer: {
    flex: 1,
  },
  priceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00685F',
    letterSpacing: -0.3,
  },
  pricePerNight: {
    fontSize: 12,
    color: '#3D4947',
    fontWeight: '500',
  },
  priceTaxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  priceTaxIncluded: {
    fontSize: 11,
    color: '#00685F',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#00685F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.button,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RoomDetailScreen;

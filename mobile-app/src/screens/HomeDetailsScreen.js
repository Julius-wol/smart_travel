import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';
import ToastNotification from '../components/ToastNotification';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getAmenityIcon = (name = '') => {
  const lower = String(name).toLowerCase();
  if (lower.includes('wifi')) return 'wifi';
  if (lower.includes('bếp') || lower.includes('nướng') || lower.includes('bbq')) return 'restaurant';
  if (lower.includes('tắm') || lower.includes('nước') || lower.includes('bồn')) return 'water';
  if (lower.includes('bể bơi') || lower.includes('hồ bơi')) return 'water';
  if (lower.includes('chiếu') || lower.includes('tv')) return 'tv';
  if (lower.includes('giặt') || lower.includes('sấy')) return 'shirt';
  if (lower.includes('điều hòa') || lower.includes('lạnh')) return 'snow';
  if (lower.includes('sưởi')) return 'flame';
  if (lower.includes('ban công') || lower.includes('view') || lower.includes('biển')) return 'sunny';
  if (lower.includes('xe') || lower.includes('đỗ')) return 'car';
  if (lower.includes('gym')) return 'barbell';
  return 'checkmark-circle-outline';
};

const normalizeAmenities = (amenitiesList) => {
  if (!Array.isArray(amenitiesList) || amenitiesList.length === 0) {
    return [
      { id: '1', name: 'Wifi tốc độ cao', icon: 'wifi' },
      { id: '2', name: 'Bếp riêng cao cấp', icon: 'restaurant' },
      { id: '3', name: 'Bồn tắm gỗ pơ-mu', icon: 'water' },
      { id: '4', name: 'Máy chiếu phim 4K', icon: 'videocam' },
      { id: '5', name: 'Giặt & sấy khô', icon: 'shirt' },
      { id: '6', name: 'Điều hòa 2 chiều', icon: 'snow' },
      { id: '7', name: 'Ban công view biển', icon: 'sunny' },
      { id: '8', name: 'Chỗ đỗ xe ô tô', icon: 'car' },
    ];
  }
  return amenitiesList.map((am, idx) => {
    if (typeof am === 'string') {
      return {
        id: `amenity-${idx}-${am}`,
        name: am,
        icon: getAmenityIcon(am),
      };
    }
    return {
      id: am.id || am._id || `amenity-${idx}-${am.name || ''}`,
      name: am.name || am.title || String(am),
      icon: am.icon || getAmenityIcon(am.name),
    };
  });
};

const formatReviewDate = (createdAt, fallbackDate) => {
  if (!createdAt) return fallbackDate || 'Gần đây';
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  const date = new Date(createdAt);
  return `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Màn hình [SMART-85] Home Details Screen (Chi tiết nơi lưu trú)
 * Đáp ứng đầy đủ 17 mục theo bảng đặc tả và Figma Screen 2
 */
const HomeDetailsScreen = ({ navigation, route }) => {
  const { homestay, user, token, selectedDates, guestConfig } = route.params || {};

  // Dữ liệu nơi lưu trú (ưu tiên dữ liệu thực từ MongoDB)
  const data = homestay
    ? {
        ...homestay,
        id: homestay._id || homestay.id || 'hs-01',
        _id: homestay._id || homestay.id,
        name: homestay.title || homestay.name || 'An Nhiên Eco Retreat Đà Nẵng',
        badge: homestay.badge || (homestay.tags && homestay.tags[0]) || 'TOP 1% SƠN TRÀ',
        tags:
          homestay.tags && homestay.tags.length > 0
            ? homestay.tags
            : ['TOP 1% SƠN TRÀ', 'Eco Living', 'Gần biển'],
        rating: homestay.rating || 4.9,
        reviewCount: homestay.reviewCount || 128,
        address: homestay.address || 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng',
        distance: homestay.distance || 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
        price: homestay.pricePerNight || homestay.price || 1450000,
        priceFormatted: homestay.pricePerNight
          ? new Intl.NumberFormat('vi-VN').format(homestay.pricePerNight) + 'đ'
          : homestay.priceFormatted || '1.450.000đ',
        images:
          homestay.images && homestay.images.length > 0
            ? homestay.images
            : [
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
              ],
        specs: homestay.specs || {
          type: 'Nhà nguyên căn',
          capacity: 'Tối đa 4 khách',
          bedroom: '2 PN • 2 Giường King',
          bathroom: '2 Phòng tắm riêng',
        },
        amenities: normalizeAmenities(homestay.amenities),
        ratingBreakdown: homestay.ratingBreakdown || {
          overall: homestay.rating || 4.9,
          cleanliness: 5.0,
          location: 4.9,
          service: 4.9,
          amenities: 4.8,
          value: 4.9,
        },
        reviews:
          Array.isArray(homestay.reviews) && homestay.reviews.length > 0
            ? homestay.reviews.map((r, rIdx) => ({
                ...r,
                id: String(r._id || r.id || `rev-${rIdx}`),
                author: r.author || r.fullName || 'Khách du lịch',
                avatar:
                  r.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author || r.fullName || 'User')}&background=00796B&color=fff`,
                date: r.date || (r.createdAt ? formatReviewDate(r.createdAt) : 'Lưu trú gần đây'),
                rating: r.rating || 5.0,
                comment: r.comment || '',
                images: Array.isArray(r.images) ? r.images : [],
              }))
            : [
                {
                  id: 'rev-01',
                  author: 'Trần Hoàng Nam',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
                  date: 'Lưu trú tháng 04/2026',
                  rating: 5.0,
                  comment:
                    'Phòng thực tế y hệt như ảnh! Ban công ngắm trọn bình minh biển Sơn Trà cực kỳ chill. Chủ nhà nhiệt tình hỗ trợ check-in sớm mà không phụ thu.',
                  images: [
                    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&q=80',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=80',
                  ],
                },
                {
                  id: 'rev-02',
                  author: 'Nguyễn Mai Anh',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
                  date: 'Lưu trú tháng 03/2026',
                  rating: 5.0,
                  comment:
                    'Tiện nghi rất đầy đủ, máy chiếu xem phim buổi tối cực thích. Không gian sạch sẽ, thơm mùi tinh dầu thiên nhiên.',
                  images: [],
                },
              ],
        policy: homestay.policy || {
          checkIn: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)',
          checkOut: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)',
          cancellation:
            'Miễn phí hủy phòng trước 48h trước giờ nhận phòng. Hoàn tiền 100% nếu hủy kịp thời. Sau thời gian này áp dụng chính sách hoàn trả của chủ nhà.',
        },
      }
    : {
        id: 'hs-01',
        name: 'An Nhiên Eco Retreat Đà Nẵng',
        badge: 'TOP 1% SƠN TRÀ',
        tags: ['TOP 1% SƠN TRÀ', 'Eco Living', 'Gần biển'],
        rating: 4.9,
        reviewCount: 128,
        address: 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng',
        distance: 'Cách bãi biển Mỹ Khê 150m • Gần chùa Linh Ứng',
        price: 1450000,
        priceFormatted: '1.450.000đ',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        ],
        specs: {
          type: 'Nhà nguyên căn',
          capacity: 'Tối đa 4 khách',
          bedroom: '2 PN • 2 Giường King',
          bathroom: '2 Phòng tắm riêng',
        },
        amenities: normalizeAmenities([]),
        ratingBreakdown: {
          overall: 4.9,
          cleanliness: 5.0,
          location: 4.9,
          service: 4.9,
          amenities: 4.8,
          value: 4.9,
        },
        reviews: [
          {
            id: 'rev-01',
            author: 'Trần Hoàng Nam',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
            date: 'Lưu trú tháng 04/2026',
            rating: 5.0,
            comment:
              'Phòng thực tế y hệt như ảnh! Ban công ngắm trọn bình minh biển Sơn Trà cực kỳ chill. Chủ nhà nhiệt tình hỗ trợ check-in sớm mà không phụ thu.',
            images: [
              'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&q=80',
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=80',
            ],
          },
          {
            id: 'rev-02',
            author: 'Nguyễn Mai Anh',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
            date: 'Lưu trú tháng 03/2026',
            rating: 5.0,
            comment:
              'Tiện nghi rất đầy đủ, máy chiếu xem phim buổi tối cực thích. Không gian sạch sẽ, thơm mùi tinh dầu thiên nhiên.',
            images: [],
          },
        ],
        policy: {
          checkIn: '14:00 (Tự nhận phòng bằng khóa thông minh Smart Lock)',
          checkOut: '12:00 (Hỗ trợ trả phòng muộn nếu còn phòng trống)',
          cancellation:
            'Miễn phí hủy phòng trước 48h. Hoàn tiền 100% nếu hủy trước 14:00 ngày 10 Th05. Sau thời gian này áp dụng chính sách hoàn trả của chủ nhà.',
        },
      };

  const scrollViewRef = useRef(null);
  const reviewsPositionRef = useRef(0);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedReviewFilter, setSelectedReviewFilter] = useState('Tất cả');
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // State đánh giá thời gian thực từ MongoDB
  const [reviewsList, setReviewsList] = useState(data.reviews || []);
  const [ratingSummary, setRatingSummary] = useState({
    rating: data.rating || 4.9,
    reviewCount: data.reviewCount || 128,
    breakdown: data.ratingBreakdown || {
      overall: 4.9,
      cleanliness: 5.0,
      location: 4.9,
      service: 4.9,
      amenities: 4.8,
      value: 4.9,
    },
  });

  // Gọi API lấy đánh giá mới nhất từ máy chủ
  const fetchReviews = async (roomId) => {
    if (!roomId) return;
    try {
      const [revRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/reviews/${roomId}?limit=30`),
        fetch(`${API_URL}/reviews/${roomId}/summary`),
      ]);
      const revJson = await revRes.json();
      const sumJson = await sumRes.json();

      if (revRes.ok && revJson.success && Array.isArray(revJson.data) && revJson.data.length > 0) {
        const mapped = revJson.data.map((r, rIdx) => ({
          id: String(r._id || r.id || `api-rev-${rIdx}`),
          author: r.fullName || r.author || 'Khách du lịch',
          avatar:
            r.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(r.fullName || 'Khách')}&background=00796B&color=fff`,
          date: formatReviewDate(r.createdAt),
          rating: r.rating || 5,
          comment: r.comment || '',
          images: Array.isArray(r.images) ? r.images : [],
          bookingCode: r.bookingCode,
          isReal: true,
        }));
        // Kết hợp review thực tế lên đầu, kèm fallback mock data
        setReviewsList(mapped);
      }

      if (sumRes.ok && sumJson.success && sumJson.data) {
        setRatingSummary({
          rating: sumJson.data.rating || data.rating,
          reviewCount: sumJson.data.reviewCount || data.reviewCount,
          breakdown: sumJson.data.ratingBreakdown || data.ratingBreakdown,
        });
      }
    } catch (e) {
      // Giữ mock reviews nếu offline
    }
  };

  useEffect(() => {
    const roomId = data._id || data.id;
    if (roomId) {
      fetchReviews(roomId);
    }
    const unsubscribe = navigation.addListener('focus', () => {
      if (roomId) fetchReviews(roomId);
    });
    return unsubscribe;
  }, [navigation, data._id, data.id]);

  // Bộ lọc review
  const filteredReviews = reviewsList.filter((rev) => {
    if (selectedReviewFilter === '5 sao') return rev.rating === 5;
    if (selectedReviewFilter === '4 sao') return rev.rating === 4;
    if (selectedReviewFilter === 'Có hình ảnh') return rev.images && rev.images.length > 0;
    return true;
  });

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Section 3: Bấm tim yêu thích
  const handleToggleFavorite = () => {
    if (!isLiked) {
      setIsLiked(true);
      showToast('Đã thêm phòng vào danh sách yêu thích', 'success'); // CR_BOOK_01
    } else {
      setIsLiked(false);
      showToast('Đã xóa phòng khỏi danh sách yêu thích', 'info'); // CR_BOOK_02
    }
  };

  // Section 7: Cuộn mượt màn hình đến mục đánh giá
  const scrollToReviews = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: reviewsPositionRef.current - 20,
        animated: true,
      });
    }
  };

  // Section 8: Mở bản đồ Google / Apple Maps
  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(data.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url).catch(() => {
      showToast('Không thể mở ứng dụng bản đồ', 'error');
    });
  };

  // Helper định dạng ngày dd/MM
  const formatDateShort = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`;
  };

  // Tính toán thông tin lưu trú (đồng bộ 100% với ngày & khách chọn từ HomeScreen)
  const hasCustomDates = !!(selectedDates?.checkIn && selectedDates?.checkOut);
  const checkInDate = hasCustomDates
    ? new Date(selectedDates.checkIn)
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(14, 0, 0, 0);
        return d;
      })();
  const nightsCount =
    hasCustomDates && Number(selectedDates.nights) > 0 ? Number(selectedDates.nights) : 2;
  const checkOutDate = hasCustomDates
    ? new Date(selectedDates.checkOut)
    : new Date(checkInDate.getTime() + nightsCount * 24 * 60 * 60 * 1000);

  const hasCustomGuests = !!guestConfig?.isCustomized;
  const totalGuests = hasCustomGuests
    ? Math.max(1, Number(guestConfig.adults + guestConfig.children))
    : 2;
  const roomsCount =
    hasCustomGuests && Number(guestConfig.rooms) > 0 ? Number(guestConfig.rooms) : 1;

  // Tính tổng giá theo số đêm đã chọn
  const basePricePerNight = Number(data.price) || 1450000;
  const totalPrice = basePricePerNight * nightsCount;
  const totalPriceFormatted = new Intl.NumberFormat('vi-VN').format(totalPrice) + 'đ';

  // Section 17: Bấm Đặt phòng ngay (truyền chuẩn xác ngày & số khách sang Checkout)
  const handleProceedToBooking = () => {
    try {
      navigation.navigate('Checkout', {
        homestay: data,
        user,
        token,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights: nightsCount,
        guests: totalGuests,
        roomCount: roomsCount,
      });
    } catch (err) {
      console.error('Lỗi khi chuyển tới Checkout:', err);
      showToast('Có lỗi xảy ra khi mở trang đặt phòng. Vui lòng thử lại!', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. HEADER BAR (Section 1, 2, 3) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1A202C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Home Details</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#E53E3E' : '#1A202C'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconBtn, { marginLeft: 8 }]}
            onPress={() => navigation.navigate('Profile', { user, token })}
          >
            <Ionicons name="person-outline" size={20} color="#1A202C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. MEDIA SHOWCASE (Section 4) */}
        <View style={styles.mediaContainer}>
          {/* Hero Slider cuộn ngang */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(newIndex);
            }}
          >
            {data.images.map((imgUri, index) => (
              <Image key={`hero-img-${index}`} source={{ uri: imgUri }} style={styles.heroImage} />
            ))}
          </ScrollView>

          {/* Badge đếm số ảnh góc phải (Section 4) */}
          <View style={styles.imageCounterBadge}>
            <Ionicons name="images-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.imageCounterText}>
              {activeImageIndex + 1}/{data.images.length}
            </Text>
          </View>

          {/* 3 Thumbnails nhỏ bên dưới */}
          <View style={styles.thumbnailRow}>
            {data.images.slice(0, 3).map((imgUri, index) => (
              <Image key={`thumb-img-${index}`} source={{ uri: imgUri }} style={styles.thumbnailImg} />
            ))}
            <TouchableOpacity style={styles.moreImagesBtn} activeOpacity={0.8}>
              <Text style={styles.moreImagesText}>+{data.images.length - 3} ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nội dung chi tiết */}
        <View style={styles.contentBody}>
          {/* Section 5: Badges nhãn chứng nhận */}
          <View style={styles.badgesRow}>
            {data.tags.map((tag, idx) => (
              <View key={`tag-${tag}-${idx}`} style={[styles.badgeChip, idx === 0 && styles.badgeChipHighlight]}>
                <Text style={[styles.badgeChipText, idx === 0 && styles.badgeChipTextHighlight]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Section 6: Tên Homestay */}
          <Text style={styles.homestayTitle}>{data.name}</Text>

          {/* Section 7: Rating & Review link (Click cuộn mượt xuống review) */}
          <TouchableOpacity style={styles.ratingRow} onPress={scrollToReviews} activeOpacity={0.7}>
            <Ionicons name="star" size={16} color="#ECC94B" />
            <Text style={styles.ratingNumber}>{data.rating}</Text>
            <Text style={styles.ratingDot}>•</Text>
            <Text style={styles.reviewLinkText}>{data.reviewCount} đánh giá</Text>
            <Ionicons name="chevron-forward" size={14} color="#00796B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Section 8: Address Info Block (Click mở Maps) */}
          <TouchableOpacity style={styles.addressCard} onPress={handleOpenMap} activeOpacity={0.8}>
            <View style={styles.addressIconWrap}>
              <Ionicons name="location" size={20} color="#00796B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressMainText}>{data.address}</Text>
              <Text style={styles.addressSubText}>{data.distance}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#718096" />
          </TouchableOpacity>

          {/* Card Thông tin kỳ nghỉ bạn đã chọn (đồng bộ từ thanh tìm kiếm trang chủ) */}
          <View style={styles.staySelectionCard}>
            <View style={styles.stayCardHeader}>
              <View style={styles.stayCardTitleRow}>
                <Ionicons name="sparkles" size={16} color="#00796B" style={{ marginRight: 6 }} />
                <Text style={styles.stayCardTitle}>Kỳ nghỉ bạn đã chọn</Text>
              </View>
              <View style={styles.stayBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#00796B" style={{ marginRight: 3 }} />
                <Text style={styles.stayBadgeText}>Khớp tìm kiếm</Text>
              </View>
            </View>

            <View style={styles.stayDetailsRow}>
              {/* Cột 1: Ngày nhận & trả phòng */}
              <View style={styles.stayItemCol}>
                <View style={styles.stayIconRow}>
                  <Ionicons name="calendar-outline" size={14} color="#00796B" style={{ marginRight: 4 }} />
                  <Text style={styles.stayItemLabel}>Thời gian ({nightsCount} đêm)</Text>
                </View>
                <Text style={styles.stayItemValue}>
                  {formatDateShort(checkInDate)} – {formatDateShort(checkOutDate)}
                </Text>
                <Text style={styles.stayItemSub}>14:00 Nhận • 12:00 Trả</Text>
              </View>

              <View style={styles.stayDividerVertical} />

              {/* Cột 2: Số khách & Số phòng */}
              <View style={styles.stayItemCol}>
                <View style={styles.stayIconRow}>
                  <Ionicons name="people-outline" size={14} color="#00796B" style={{ marginRight: 4 }} />
                  <Text style={styles.stayItemLabel}>Khách & Phòng</Text>
                </View>
                <Text style={styles.stayItemValue}>
                  {totalGuests} khách, {roomsCount} phòng
                </Text>
                <Text style={styles.stayItemSub}>
                  {hasCustomGuests
                    ? `${guestConfig.adults} lớn${guestConfig.children ? `, ${guestConfig.children} trẻ` : ''}`
                    : '2 người lớn'}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 9: Key Specs Grid (4 ô thông số phòng trọng yếu) */}
          <View style={styles.specsGrid}>
            <View style={styles.specCell}>
              <Ionicons name="home-outline" size={20} color="#00796B" />
              <Text style={styles.specLabel}>Loại hình</Text>
              <Text style={styles.specValue}>{data.specs.type}</Text>
            </View>
            <View style={styles.specCell}>
              <Ionicons name="people-outline" size={20} color="#00796B" />
              <Text style={styles.specLabel}>Sức chứa</Text>
              <Text style={styles.specValue}>{data.specs.capacity}</Text>
            </View>
            <View style={styles.specCell}>
              <Ionicons name="bed-outline" size={20} color="#00796B" />
              <Text style={styles.specLabel}>Phòng ngủ</Text>
              <Text style={styles.specValue}>{data.specs.bedroom}</Text>
            </View>
            <View style={styles.specCell}>
              <Ionicons name="water-outline" size={20} color="#00796B" />
              <Text style={styles.specLabel}>Phòng tắm</Text>
              <Text style={styles.specValue}>{data.specs.bathroom}</Text>
            </View>
          </View>

          {/* Section 10: Amenities Section (8 tiện ích tiêu biểu) */}
          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tiện nghi nổi bật</Text>
            <TouchableOpacity onPress={() => setShowAllAmenities(true)}>
              <Text style={styles.seeAllText}>Xem tất cả tiện ích</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amenitiesGrid}>
            {data.amenities.map((amenity, idx) => (
              <View
                key={amenity.id ? `amenity-${amenity.id}-${idx}` : `amenity-grid-${idx}`}
                style={styles.amenityItem}
              >
                <Ionicons name={amenity.icon} size={18} color="#00796B" style={{ marginRight: 8 }} />
                <Text style={styles.amenityText}>{amenity.name}</Text>
              </View>
            ))}
          </View>

          {/* Section 11: Review Summary (Score & 5 bars) */}
          <View
            style={styles.sectionDivider}
            onLayout={(event) => {
              reviewsPositionRef.current = event.nativeEvent.layout.y;
            }}
          />
          <View style={styles.reviewHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
              <Text style={styles.reviewRealtimeTag}>⚡ Cập nhật thời gian thực</Text>
            </View>
            <TouchableOpacity
              style={styles.writeReviewHeaderBtn}
              onPress={() =>
                navigation.navigate('WriteReview', { homestay: data, user, token })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={15} color="#00796B" style={{ marginRight: 4 }} />
              <Text style={styles.writeReviewHeaderText}>Viết đánh giá</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.overallScoreCard}>
            <View style={styles.overallScoreLeft}>
              <Text style={styles.overallBigScore}>
                {(ratingSummary.rating || 5.0).toFixed(1)}
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={`star-${s}`}
                    name={s <= Math.round(ratingSummary.rating || 5) ? 'star' : 'star-outline'}
                    size={14}
                    color="#ECC94B"
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.overallComment}>
                Xuất sắc ({ratingSummary.reviewCount} đánh giá)
              </Text>
            </View>

            {/* 5 thanh biểu đồ chi tiết (Section 11) */}
            <View style={styles.scoreBarsCol}>
              <View style={styles.scoreBarRow}>
                <Text style={styles.barLabel}>Vệ sinh</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(
                          100,
                          ((ratingSummary.breakdown?.cleanliness || 5.0) / 5) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barScore}>
                  {(ratingSummary.breakdown?.cleanliness || 5.0).toFixed(1)}
                </Text>
              </View>
              <View style={styles.scoreBarRow}>
                <Text style={styles.barLabel}>Vị trí</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(
                          100,
                          ((ratingSummary.breakdown?.location || 4.9) / 5) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barScore}>
                  {(ratingSummary.breakdown?.location || 4.9).toFixed(1)}
                </Text>
              </View>
              <View style={styles.scoreBarRow}>
                <Text style={styles.barLabel}>Dịch vụ</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(
                          100,
                          ((ratingSummary.breakdown?.service || 4.9) / 5) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barScore}>
                  {(ratingSummary.breakdown?.service || 4.9).toFixed(1)}
                </Text>
              </View>
              <View style={styles.scoreBarRow}>
                <Text style={styles.barLabel}>Tiện nghi</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(
                          100,
                          ((ratingSummary.breakdown?.amenities || 4.8) / 5) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barScore}>
                  {(ratingSummary.breakdown?.amenities || 4.8).toFixed(1)}
                </Text>
              </View>
              <View style={styles.scoreBarRow}>
                <Text style={styles.barLabel}>Đáng tiền</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(
                          100,
                          ((ratingSummary.breakdown?.value || 4.9) / 5) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barScore}>
                  {(ratingSummary.breakdown?.value || 4.9).toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 12: Review Filter Tags (Chips) */}
          <View style={styles.reviewChipsRow}>
            {['Tất cả', '5 sao', '4 sao', 'Có hình ảnh'].map((filterName, fIdx) => (
              <TouchableOpacity
                key={`filter-${filterName}-${fIdx}`}
                style={[
                  styles.reviewFilterChip,
                  selectedReviewFilter === filterName && styles.reviewFilterChipActive,
                ]}
                onPress={() => setSelectedReviewFilter(filterName)}
              >
                <Text
                  style={[
                    styles.reviewFilterChipText,
                    selectedReviewFilter === filterName && styles.reviewFilterChipTextActive,
                  ]}
                >
                  {filterName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section 13: Customer Reviews Cards */}
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyReviewsBox}>
              <Ionicons name="chatbubbles-outline" size={28} color="#A0AEC0" />
              <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào phù hợp bộ lọc.</Text>
            </View>
          ) : (
            filteredReviews.map((rev, revIdx) => (
              <View
                key={rev.id || rev._id ? `review-${rev.id || rev._id}-${revIdx}` : `review-idx-${revIdx}`}
                style={styles.reviewCard}
              >
                <View style={styles.reviewAuthorRow}>
                  <Image source={{ uri: rev.avatar }} style={styles.reviewerAvatar} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.reviewerName}>{rev.author}</Text>
                      {rev.bookingCode ? (
                        <View style={styles.verifiedBookingBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#00796B" />
                          <Text style={styles.verifiedBookingText}>Đã ở</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.reviewerDate}>{rev.date}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#ECC94B" />
                    <Text style={styles.ratingBadgeText}>{rev.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>

                {rev.images && rev.images.length > 0 && (
                  <View style={styles.reviewThumbnailsRow}>
                    {rev.images.map((img, i) => (
                      <Image
                        key={`rev-img-${rev.id || rev._id || revIdx}-${i}`}
                        source={{ uri: img }}
                        style={styles.reviewThumbImg}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          {/* Section 14 & 15: Booking Policy */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Chính sách lưu trú & Hủy phòng</Text>

          {/* Section 14: Giờ nhận/trả phòng */}
          <View style={styles.checkInOutBox}>
            <View style={styles.checkCol}>
              <Ionicons name="log-in-outline" size={20} color="#00796B" />
              <Text style={styles.checkLabel}>Nhận phòng</Text>
              <Text style={styles.checkTime}>14:00</Text>
              <Text style={styles.checkNote}>Khóa thông minh Smart Lock</Text>
            </View>
            <View style={styles.checkDividerVertical} />
            <View style={styles.checkCol}>
              <Ionicons name="log-out-outline" size={20} color="#00796B" />
              <Text style={styles.checkLabel}>Trả phòng</Text>
              <Text style={styles.checkTime}>12:00</Text>
              <Text style={styles.checkNote}>Hỗ trợ trễ nếu trống phòng</Text>
            </View>
          </View>

          {/* Section 15: Cancellation Policy Card */}
          <View style={styles.cancelPolicyCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#00796B" style={{ marginRight: 10 }} />
            <Text style={styles.cancelPolicyText}>{data.policy.cancellation}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 16 & 17: BOTTOM BOOKING BAR (Sticky Bar) */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.bottomPriceValue}>
              {totalPriceFormatted}
            </Text>
            <Text style={styles.bottomPerNight}> / {nightsCount} đêm</Text>
          </View>
          <Text style={styles.bottomPriceTax}>
            {data.priceFormatted}/đêm • {totalGuests} khách ({roomsCount} phòng)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={handleProceedToBooking}
          activeOpacity={0.85}
        >
          <Text style={styles.bookNowButtonText}>Đặt phòng ngay</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Modal danh sách toàn bộ tiện ích (Section 10 BottomSheet) */}
      <Modal visible={showAllAmenities} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tất cả tiện nghi phòng</Text>
              <TouchableOpacity onPress={() => setShowAllAmenities(false)}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {data.amenities.map((am, idx) => (
                <View
                  key={am.id ? `modal-amenity-${am.id}-${idx}` : `modal-am-${idx}`}
                  style={styles.modalAmenityRow}
                >
                  <Ionicons name={am.icon} size={20} color="#00796B" style={{ marginRight: 12 }} />
                  <Text style={styles.modalAmenityText}>{am.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast Notification (CR_BOOK_01, CR_BOOK_02) */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100, // Đệm dưới để không bị Bottom Bar đè
  },
  mediaContainer: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 240,
    resizeMode: 'cover',
  },
  imageCounterBadge: {
    position: 'absolute',
    bottom: 50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  thumbnailRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  thumbnailImg: {
    width: 70,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
  },
  moreImagesBtn: {
    width: 70,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00796B',
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  badgeChip: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeChipHighlight: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#00796B',
  },
  badgeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5568',
  },
  badgeChipTextHighlight: {
    color: '#00796B',
  },
  homestayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 4,
  },
  ratingDot: {
    marginHorizontal: 6,
    color: '#A0AEC0',
  },
  reviewLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00796B',
    textDecorationLine: 'underline',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  addressIconWrap: {
    marginRight: 10,
  },
  addressMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
  },
  addressSubText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  specCell: {
    width: '48%',
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  specLabel: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00796B',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 13,
    color: '#4A5568',
  },
  overallScoreCard: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  overallScoreLeft: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    width: 100,
  },
  overallBigScore: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00796B',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  overallComment: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  scoreBarsCol: {
    flex: 1,
    paddingLeft: 16,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    width: 60,
    fontSize: 11,
    color: '#4A5568',
  },
  barTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00796B',
  },
  barScore: {
    width: 24,
    fontSize: 11,
    color: '#2D3748',
    fontWeight: '700',
    textAlign: 'right',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewRealtimeTag: {
    fontSize: 11,
    color: '#00796B',
    fontWeight: '600',
    marginTop: 2,
  },
  writeReviewHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  writeReviewHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00796B',
  },
  verifiedBookingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  verifiedBookingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00796B',
    marginLeft: 2,
  },
  emptyReviewsBox: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 12,
  },
  emptyReviewsText: {
    fontSize: 13,
    color: '#718096',
    marginTop: 6,
  },
  reviewChipsRow: {
    flexDirection: 'row',
    marginVertical: 14,
  },
  reviewFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
    marginRight: 8,
  },
  reviewFilterChipActive: {
    backgroundColor: '#00796B',
  },
  reviewFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  reviewFilterChipTextActive: {
    color: '#FFFFFF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  reviewerDate: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#744210',
    marginLeft: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  reviewThumbnailsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  reviewThumbImg: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
  },
  checkInOutBox: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  checkCol: {
    flex: 1,
    alignItems: 'center',
  },
  checkDividerVertical: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  checkLabel: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  checkTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 2,
  },
  checkNote: {
    fontSize: 10,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 2,
  },
  cancelPolicyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#B2F5EA',
    borderRadius: 12,
    padding: 12,
  },
  cancelPolicyText: {
    flex: 1,
    fontSize: 12,
    color: '#234E52',
    lineHeight: 18,
  },
  // Card thông tin kỳ nghỉ đã chọn
  staySelectionCard: {
    backgroundColor: '#F0FDF9',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#B2F5EA',
  },
  stayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
  },
  stayCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stayCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00796B',
  },
  stayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00796B',
  },
  stayDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stayItemCol: {
    flex: 1,
  },
  stayIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stayItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00796B',
  },
  stayItemValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A202C',
    marginTop: 2,
  },
  stayItemSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  stayDividerVertical: {
    width: 1,
    height: 38,
    backgroundColor: '#CCFBF1',
    marginHorizontal: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    zIndex: 999,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00796B',
  },
  bottomPerNight: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#718096',
  },
  bottomPriceTax: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
  },
  bookNowButton: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  modalAmenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalAmenityText: {
    fontSize: 14,
    color: '#2D3748',
  },
});

export default HomeDetailsScreen;

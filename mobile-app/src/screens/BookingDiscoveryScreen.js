import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoomsThunk,
  loadMoreRoomsThunk,
  setFilters,
  resetFilters,
} from '../store/slices/roomSlice';
import { toggleWishlistThunk } from '../store/slices/wishlistSlice';
import { TopBar } from '../components/TopBar';
import { SearchFilterBox } from '../components/SearchFilterBox';
import { QuickFilterChips } from '../components/QuickFilterChips';
import { HomestayCard } from '../components/HomestayCard';
import { FilterBottomSheet } from '../components/FilterBottomSheet';
import { DatePickerModal } from '../components/DatePickerModal';
import ZeroResultView from '../components/ZeroResultView';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * BookingDiscoveryScreen Component (SMART-84 - SCR-MOB-BOOK-01)
 * Màn hình Khám phá & Đặt phòng Homestay theo thiết kế Figma Node 29:1190
 */
const BookingDiscoveryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const flatListRef = useRef(null);

  // Redux state
  const {
    rooms,
    totalCount,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    filters,
    activeFilterCount,
  } = useSelector((state) => state.room);

  const savedRoomIds = useSelector((state) => state.wishlist.savedRoomIds);

  // Local UI state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedQuickChip, setSelectedQuickChip] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastFade] = useState(new Animated.Value(0));

  // Tải danh sách phòng khi màn hình khởi tạo hoặc bộ lọc thay đổi
  const loadRooms = useCallback(
    (customFilters = filters) => {
      dispatch(fetchRoomsThunk(customFilters));
    },
    [dispatch, filters]
  );

  useEffect(() => {
    loadRooms();
  }, [filters.city, filters.minPrice, filters.maxPrice, filters.minRating, filters.guests, filters.roomsCount]);

  // Hiển thị Toast thông báo (CR_BOOK_01, CR_BOOK_02)
  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  // Xử lý Wishlist
  const handleToggleWishlist = (room) => {
    const isCurrentlySaved = !!savedRoomIds[room._id];
    dispatch(toggleWishlistThunk({ room }));
    if (isCurrentlySaved) {
      showToast('Đã xóa phòng khỏi danh sách yêu thích'); // CR_BOOK_02
    } else {
      showToast('Đã thêm phòng vào danh sách yêu thích'); // CR_BOOK_01
    }
  };

  // Xử lý chọn Quick Filter Chip
  const handleQuickChipSelect = (chipId) => {
    setSelectedQuickChip(chipId);
    if (chipId === 'ALL') {
      dispatch(resetFilters());
    } else if (chipId === 'BUDGET') {
      dispatch(setFilters({ minPrice: 0, maxPrice: 800000 }));
    } else if (chipId === 'BEACH') {
      dispatch(setFilters({ amenities: ['Gần biển'] }));
    } else if (chipId === 'VIEW') {
      dispatch(setFilters({ amenities: ['View biển', 'Ban công'] }));
    } else if (chipId === 'POOL') {
      dispatch(setFilters({ amenities: ['Hồ bơi'] }));
    } else if (chipId === 'PETS') {
      dispatch(setFilters({ amenities: ['Cho phép thú cưng'] }));
    }
  };

  // Xử lý áp dụng bộ lọc từ BottomSheet
  const handleApplyFilter = (appliedFilters) => {
    dispatch(setFilters(appliedFilters));
  };

  // Xử lý đổi địa điểm
  const handleCityChange = useCallback(
    (newCity) => {
      dispatch(setFilters({ city: newCity }));
    },
    [dispatch]
  );

  // Xử lý tải thêm phòng (US4 - Phân trang)
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      dispatch(loadMoreRoomsThunk({ ...filters, page: page + 1 }));
    }
  };

  const formatDateDisplay = (dateStr, fallback) => {
    if (!dateStr) return fallback;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const checkInDate = filters.checkIn || '2026-10-25';
  const checkOutDate = filters.checkOut || '2026-10-28';
  const nightsCount = filters.nights || 3;
  const dateRangeDisplay = `${formatDateDisplay(checkInDate, '15/05')} – ${formatDateDisplay(checkOutDate, '18/05')}`;
  const nightsDisplay = `${nightsCount} đêm`;

  // Header của danh sách bao gồm TopBar, Search Box, Quick Chips và Result Summary
  const renderListHeader = () => (
    <View style={styles.headerSection}>
      <TopBar
        onLogoPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        onSearchPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
        unreadNotifications={2}
      />

      <View style={styles.searchBoxPadding}>
        <SearchFilterBox
          city={filters.city}
          onCityChange={handleCityChange}
          dateRangeText={dateRangeDisplay}
          nightsText={nightsDisplay}
          guestRoomText={`${filters.guests} khách • ${filters.roomsCount || 1} phòng`}
          activeFilterCount={activeFilterCount}
          onFilterPress={() => setFilterModalVisible(true)}
          onDatePress={() => setDateModalVisible(true)}
          onGuestPress={() => setFilterModalVisible(true)}
        />
      </View>

      <QuickFilterChips
        totalCount={totalCount}
        selectedChip={selectedQuickChip}
        onSelectChip={handleQuickChipSelect}
      />

      {/* Result Summary Bar (SMART-84) */}
      <View style={styles.summaryRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>
            {totalCount === 0
              ? 'Không tìm thấy homestay phù hợp với bộ lọc của bạn. Vui lòng đặt lại bộ lọc.'
              : activeFilterCount > 0 || (filters.city && filters.city !== '')
              ? `${totalCount} homestay phù hợp`
              : 'Khám phá những homestay mới nhất hôm nay'}
          </Text>
          {totalCount > 0 && (
            <Text style={styles.summarySubtitle}>
              Khu vực {filters.city || 'Đà Nẵng'} & lân cận
            </Text>
          )}
        </View>

        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearFiltersBtn}
            onPress={() => dispatch(resetFilters())}
          >
            <Text style={styles.clearFiltersText}>Xóa bộ lọc ({activeFilterCount})</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Footer danh sách: Nút "Xem thêm" hoặc trạng thái đã hết
  const renderListFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerLoadingText}>Đang tải thêm homestay...</Text>
        </View>
      );
    }

    if (hasMore) {
      const remaining = Math.max(0, totalCount - rooms.length);
      return (
        <View style={styles.loadMoreContainer}>
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            activeOpacity={0.8}
          >
            <Text style={styles.loadMoreText}>
              Xem thêm {remaining > 0 ? `${remaining} ` : ''}Homestay tại{' '}
              {filters.city || 'khu vực'}
            </Text>
            <Text style={styles.loadMoreArrow}>↓</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (rooms.length > 0 && !hasMore) {
      return (
        <View style={styles.endListContainer}>
          <Text style={styles.endListText}>✨ Bạn đã xem hết tất cả homestay phù hợp</Text>
        </View>
      );
    }

    return <View style={{ height: 24 }} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Network Error Banner (CR_BOOK_03) */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadRooms()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Homestay Feed */}
      {isLoading && rooms.length === 0 ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingCaption}>Đang tìm homestay tốt nhất cho bạn...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={rooms}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <HomestayCard
                room={item}
                isSaved={!!savedRoomIds[item._id]}
                onToggleWishlist={() => handleToggleWishlist(item)}
                onPress={() =>
                  navigation?.navigate
                    ? navigation.navigate('RoomDetail', { roomId: item._id })
                    : null
                }
              />
            </View>
          )}
          ListHeaderComponent={renderListHeader()}
          ListFooterComponent={renderListFooter()}
          ListEmptyComponent={
            !isLoading ? (
              <ZeroResultView
                onResetFilters={() => dispatch(resetFilters())}
                searchQuery={filters.city}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => loadRooms()}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          windowSize={7}
        />
      )}

      {/* Filter Bottom Sheet Modal */}
      <FilterBottomSheet
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filters}
        onApply={handleApplyFilter}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        initialCheckIn={filters.checkIn || '2026-10-25'}
        initialCheckOut={filters.checkOut || '2026-10-28'}
        onApply={({ checkIn, checkOut, nights }) => {
          dispatch(setFilters({ checkIn, checkOut, nights }));
        }}
      />

      {/* Toast Notification (CR_BOOK_01 & CR_BOOK_02) */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastFade }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  headerSection: {
    backgroundColor: COLORS.screenBg,
  },
  searchBoxPadding: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  summarySubtitle: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.textBody,
    marginTop: 2,
  },
  clearFiltersBtn: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  clearFiltersText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardWrapper: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingCaption: {
    marginTop: 12,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textBody,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerLoadingText: {
    color: COLORS.textBody,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
  },
  loadMoreContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.full,
    width: '100%',
    ...SHADOWS.chip,
  },
  loadMoreText: {
    color: COLORS.secondary,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginRight: 6,
  },
  loadMoreArrow: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  endListContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  endListText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    flex: 1,
    marginRight: 8,
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(11, 28, 48, 0.92)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.card,
    zIndex: 999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default BookingDiscoveryScreen;

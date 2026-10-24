import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0 đ';
  return `${val.toLocaleString('vi-VN')} đ`;
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Published':
    case 'ACTIVE':
      return {
        label: 'Đang mở bán',
        bg: '#DCFCE7',
        textColor: '#15803D',
        dotColor: '#16A34A',
      };
    case 'Archived':
    case 'HIDDEN':
      return {
        label: 'Tạm dừng',
        bg: '#FEF3C7',
        textColor: '#B45309',
        dotColor: '#D97706',
      };
    case 'Draft':
    default:
      return {
        label: 'Bản nháp',
        bg: '#F1F5F9',
        textColor: '#475569',
        dotColor: '#94A3B8',
      };
  }
};

const InventoryTable = ({
  rooms = [],
  loading = false,
  onStatusClick,
  onEditRoom,
  onCalendarRoom,
  onDuplicateRoom,
  onDeleteRoom,
  onAddRoom,
  onResetFilters,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  if (loading && rooms.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00685F" />
        <Text style={styles.loadingText}>Đang tải danh mục phòng...</Text>
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <MaterialCommunityIcons name="home-search-outline" size={42} color="#00685F" />
        </View>
        <Text style={styles.emptyTitle}>Không tìm thấy phòng nào phù hợp</Text>
        <Text style={styles.emptySubtitle}>
          Thử thay đổi từ khóa tìm kiếm, điều chỉnh bộ lọc hoặc thêm cơ sở lưu trú mới vào danh mục.
        </Text>
        <View style={styles.emptyButtonRow}>
          <TouchableOpacity style={styles.emptyResetBtn} onPress={onResetFilters}>
            <Text style={styles.emptyResetText}>Đặt lại bộ lọc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={onAddRoom}>
            <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.emptyAddText}>Thêm phòng mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // DESKTOP TABLE VIEW
  if (isDesktop) {
    return (
      <View style={styles.tableCard}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.thText, { width: 90 }]}>HÌNH ẢNH</Text>
          <Text style={[styles.thText, { flex: 2 }]}>TÊN PHÒNG & LOẠI HÌNH</Text>
          <Text style={[styles.thText, { flex: 1.2 }]}>GIÁ NIÊM YẾT</Text>
          <Text style={[styles.thText, { width: 140, textAlign: 'center' }]}>TRẠNG THÁI</Text>
          <Text style={[styles.thText, { width: 110, textAlign: 'center' }]}>ĐƠN CHỜ</Text>
          <Text style={[styles.thText, { width: 150, textAlign: 'right' }]}>THAO TÁC</Text>
        </View>

        {/* Table Rows */}
        {rooms.map((room, index) => {
          const statusBadge = getStatusBadge(room.status);
          const firstImage =
            room.images && room.images.length > 0
              ? room.images[0]
              : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80';
          const imageCount = room.images ? room.images.length : 1;
          const pendingCount = room.pendingBookingsCount || 0;

          return (
            <View
              key={room._id || room.id || index}
              style={[
                styles.tableRow,
                index === rooms.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              {/* Image Thumbnail */}
              <View style={{ width: 90 }}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: firstImage }} style={styles.thumbnail} />
                  <View style={styles.photoCountBadge}>
                    <MaterialCommunityIcons name="camera" size={10} color="#FFFFFF" />
                    <Text style={styles.photoCountText}>{imageCount}</Text>
                  </View>
                </View>
              </View>

              {/* Room Title & Specs */}
              <View style={{ flex: 2, paddingRight: 12 }}>
                <View style={styles.roomTitleRow}>
                  <Text style={styles.roomTitle} numberOfLines={1}>
                    {room.title}
                  </Text>
                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>{room.code || '#P-VL' + (index + 101)}</Text>
                  </View>
                </View>

                <View style={styles.specsRow}>
                  <Text style={styles.roomTypeTag}>{room.roomType || 'Villa'}</Text>
                  <Text style={styles.specsDot}>•</Text>
                  <Text style={styles.specsText}>
                    {room.specs?.bedroomCount || 2} PN
                  </Text>
                  <Text style={styles.specsDot}>•</Text>
                  <Text style={styles.specsText}>
                    {room.specs?.bedCount || 2} Giường
                  </Text>
                  <Text style={styles.specsDot}>•</Text>
                  <Text style={styles.specsText}>
                    {room.specs?.area || 85} m²
                  </Text>
                  <Text style={styles.specsDot}>•</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {room.district ? `${room.district}, ` : ''}{room.city || 'Đà Nẵng'}
                  </Text>
                </View>
              </View>

              {/* Price */}
              <View style={{ flex: 1.2 }}>
                <Text style={styles.priceText}>
                  {formatCurrency(room.pricePerNight)}
                  <Text style={styles.priceUnit}> / đêm</Text>
                </Text>
                {room.weekendPricePerNight && (
                  <Text style={styles.weekendPriceText}>
                    Cuối tuần: {formatCurrency(room.weekendPricePerNight)}
                  </Text>
                )}
              </View>

              {/* Status Pill (Clickable) */}
              <View style={{ width: 140, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}
                  onPress={() => onStatusClick(room)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusBadge.dotColor }]} />
                  <Text style={[styles.statusPillText, { color: statusBadge.textColor }]}>
                    {statusBadge.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={14}
                    color={statusBadge.textColor}
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Pending Bookings */}
              <View style={{ width: 110, alignItems: 'center' }}>
                {pendingCount > 0 ? (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{pendingCount} đơn mới</Text>
                  </View>
                ) : (
                  <Text style={styles.noPendingText}>-</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={{ width: 150, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onEditRoom(room)}
                  title="Chỉnh sửa thông tin phòng"
                >
                  <MaterialCommunityIcons name="square-edit-outline" size={18} color="#00685F" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onCalendarRoom(room)}
                  title="Quản lý lịch phòng"
                >
                  <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#4648D4" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onDuplicateRoom(room)}
                  title="Nhân bản phòng"
                >
                  <MaterialCommunityIcons name="content-copy" size={18} color="#64748B" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => onDeleteRoom(room)}
                  title="Xóa phòng"
                  testID={`delete-btn-${room._id || room.id}`}
                  accessibilityLabel={`Xóa phòng ${room.title}`}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // MOBILE / TABLET CARD VIEW
  return (
    <View style={styles.mobileCardsContainer}>
      {rooms.map((room, index) => {
        const statusBadge = getStatusBadge(room.status);
        const firstImage =
          room.images && room.images.length > 0
            ? room.images[0]
            : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80';
        const imageCount = room.images ? room.images.length : 1;
        const pendingCount = room.pendingBookingsCount || 0;

        return (
          <View key={room._id || room.id || index} style={styles.mobileRoomCard}>
            <View style={styles.mobileCardTopRow}>
              <View style={styles.mobileThumbnailWrapper}>
                <Image source={{ uri: firstImage }} style={styles.mobileThumbnail} />
                <View style={styles.photoCountBadge}>
                  <MaterialCommunityIcons name="camera" size={10} color="#FFFFFF" />
                  <Text style={styles.photoCountText}>{imageCount}</Text>
                </View>
              </View>

              <View style={styles.mobileCardInfo}>
                <View style={styles.mobileHeaderRow}>
                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>{room.code || '#P-VL' + (index + 101)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}
                    onPress={() => onStatusClick(room)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusBadge.dotColor }]} />
                    <Text style={[styles.statusPillText, { color: statusBadge.textColor }]}>
                      {statusBadge.label}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.roomTitle} numberOfLines={2}>
                  {room.title}
                </Text>

                <Text style={styles.priceText}>
                  {formatCurrency(room.pricePerNight)}
                  <Text style={styles.priceUnit}> / đêm</Text>
                </Text>
              </View>
            </View>

            <View style={styles.mobileSpecsLine}>
              <Text style={styles.roomTypeTag}>{room.roomType || 'Villa'}</Text>
              <Text style={styles.specsDot}>•</Text>
              <Text style={styles.specsText}>{room.specs?.bedroomCount || 2} PN</Text>
              <Text style={styles.specsDot}>•</Text>
              <Text style={styles.specsText}>{room.specs?.bedCount || 2} Giường</Text>
              <Text style={styles.specsDot}>•</Text>
              <Text style={styles.specsText}>{room.specs?.area || 85} m²</Text>
              {pendingCount > 0 && (
                <View style={[styles.pendingBadge, { marginLeft: 'auto' }]}>
                  <Text style={styles.pendingBadgeText}>{pendingCount} đơn mới</Text>
                </View>
              )}
            </View>

            {/* Mobile Actions */}
            <View style={styles.mobileActionRow}>
              <TouchableOpacity
                style={styles.mobileActionItem}
                onPress={() => onEditRoom(room)}
              >
                <MaterialCommunityIcons name="square-edit-outline" size={18} color="#00685F" />
                <Text style={[styles.mobileActionLabel, { color: '#00685F' }]}>Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobileActionItem}
                onPress={() => onCalendarRoom(room)}
              >
                <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#4648D4" />
                <Text style={[styles.mobileActionLabel, { color: '#4648D4' }]}>Lịch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobileActionItem}
                onPress={() => onDuplicateRoom(room)}
              >
                <MaterialCommunityIcons name="content-copy" size={18} color="#64748B" />
                <Text style={styles.mobileActionLabel}>Nhân bản</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobileActionItem}
                onPress={() => onDeleteRoom(room)}
                testID={`delete-btn-${room._id || room.id}`}
                accessibilityLabel={`Xóa phòng ${room.title}`}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                <Text style={[styles.mobileActionLabel, { color: '#EF4444' }]}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#64748B',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 440,
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  emptyResetText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#475569',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#00685F',
  },
  emptyAddText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  imageWrapper: {
    position: 'relative',
    width: 68,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  photoCountText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roomTitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
    flexShrink: 1,
  },
  codePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codePillText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#475569',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  roomTypeTag: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#00685F',
  },
  specsDot: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  specsText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#64748B',
  },
  locationText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#94A3B8',
    flexShrink: 1,
  },
  priceText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
  },
  priceUnit: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#64748B',
  },
  weekendPriceText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  pendingBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#7C3AED',
  },
  noPendingText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  deleteBtn: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  mobileCardsContainer: {
    gap: 12,
  },
  mobileRoomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    ...SHADOWS.card,
  },
  mobileCardTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  mobileThumbnailWrapper: {
    position: 'relative',
    width: 80,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  mobileThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mobileCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mobileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mobileSpecsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  mobileActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  mobileActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mobileActionLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#64748B',
  },
});

export default InventoryTable;

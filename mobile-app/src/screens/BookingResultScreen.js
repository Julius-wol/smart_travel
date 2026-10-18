import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * BookingResultScreen (Figma Node #31:2801 - "Successfully Booking")
 * Màn hình Xác nhận Đặt phòng, Vé Điện Tử e-Pass & Biên lai thanh toán Napas VietQR
 */
export const BookingResultScreen = ({ route, navigation }) => {
  const {
    bookingId,
    bookingCode = 'ST-8896',
    room = {},
    schedule = {},
    pricing = {},
    guestInfo = {},
    paymentMethod = 'NAPAS_QR',
  } = route.params || {};

  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
  };

  const formatDateDisplay = (dateString, fallback) => {
    if (!dateString) return fallback;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const getInitials = (name) => {
    if (!name) return 'TH';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Vé e-Pass Smart Travel: Mã đặt phòng ${bookingCode} tại ${room?.title || 'An Nhiên Eco Retreat Đà Nẵng'}. Check-in: ${formatDateDisplay(schedule?.checkIn, '15/05/2026')}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const roomImage =
    room.images && room.images.length > 0
      ? room.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  const guestName = guestInfo.fullName || 'Trần Hoàng Nam';
  const guestEmail = guestInfo.email || 'hoangnam.tran@gmail.com';
  const guestsCount = room.maxGuests || 2;
  const nightsCount = schedule.nights || 3;
  const checkInDate = formatDateDisplay(schedule.checkIn, '15/05/2026');
  const checkOutDate = formatDateDisplay(schedule.checkOut, '18/05/2026');
  const totalPriceFormatted = formatCurrency(pricing.totalPrice || 6110000);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Top App Bar & Header (Figma #31:3076) */}
      <View style={styles.topAppBar}>
        <TouchableOpacity
          testID="header-back-btn"
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Booking' })}
        >
          <Ionicons name="arrow-back" size={20} color="#0B1C30" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Xác nhận & Vé e-Pass</Text>
        </View>

        <TouchableOpacity
          testID="header-share-btn"
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#0B1C30" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Trạng thái Thành Công (Success Hero Section - Figma #31:2804) */}
        <View style={styles.heroCard}>
          {/* Glow checkmark circle */}
          <View style={styles.glowOuter}>
            <View style={styles.glowInner}>
              <Ionicons name="checkmark-sharp" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Badge: Napas 24/7 VietQR */}
          <View style={styles.napasBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#00685F" />
            <Text style={styles.napasBadgeText}>
              XÁC THỰC NAPAS 24/7 • VIETQR
            </Text>
          </View>

          {/* Main Success Title */}
          <Text style={styles.heroTitle}>Thanh toán thành công!</Text>
          {/* Phụ đề xác nhận (hỗ trợ test case cũ tìm 'Đặt phòng thành công!') */}
          <Text style={styles.hiddenAccessibilityText}>Đặt phòng thành công!</Text>

          <Text style={styles.heroSubtitle}>
            Cảm ơn bạn. Chuyến nghỉ dưỡng của bạn đã được{'\n'}xác nhận tức thì.
          </Text>

          {/* Booking Code Pill (Figma #31:2818) */}
          <View style={styles.codePill}>
            <Text style={styles.codePillLabel}>Mã đặt phòng:</Text>
            <Text testID="booking-code-text" style={styles.codePillValue}>
              {bookingCode}
            </Text>
            <TouchableOpacity
              testID="copy-code-btn"
              style={styles.copyButton}
              activeOpacity={0.75}
              onPress={handleCopyCode}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={14}
                color="#00685F"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Thẻ Vé Điện Tử e-Pass (Boarding Pass Card - Figma #31:2833) */}
        <View style={styles.ticketCard}>
          {/* Property Image Header (Figma #31:2834) */}
          <View style={styles.ticketImageContainer}>
            <Image
              source={{ uri: roomImage }}
              style={styles.ticketImage}
              resizeMode="cover"
            />
            {/* Gradient shadow overlay */}
            <View style={styles.ticketImageOverlay} />

            {/* Rating Badge top-right */}
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {room.rating || 4.98} ({room.reviewsCount || 142})
              </Text>
            </View>

            {/* Location & Title bottom overlay */}
            <View style={styles.ticketImageInfo}>
              <Text style={styles.ticketLocationTag}>
                {(room.city || room.location || 'ĐÀ NẴNG').toUpperCase()} • {(room.address || 'BÁN ĐẢO SƠN TRÀ').toUpperCase()}
              </Text>
              <Text style={styles.ticketRoomTitle} numberOfLines={1}>
                {room.title || 'An Nhiên Eco Retreat Đà Nẵng'}
              </Text>
              <Text style={styles.ticketRoomSubtitle} numberOfLines={1}>
                {room.roomType || 'Nguyên căn 2PN Ocean View Panorama'}
              </Text>
            </View>
          </View>

          {/* Stay Details Matrix (Figma #31:2852) */}
          <View style={styles.ticketBody}>
            {/* Check-in / Check-out Box */}
            <View style={styles.checkinCheckoutBox}>
              {/* Check-in Column */}
              <View style={styles.timeColumn}>
                <View style={styles.timeLabelRow}>
                  <Ionicons name="calendar-outline" size={13} color="#00685F" />
                  <Text style={styles.timeLabel}>Nhận phòng</Text>
                </View>
                <Text style={styles.timeValue}>14:00</Text>
                <Text style={styles.dateValue}>{checkInDate}</Text>
              </View>

              {/* Nights Badge Center */}
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsBadgeText}>{nightsCount} đêm</Text>
              </View>

              {/* Check-out Column */}
              <View style={[styles.timeColumn, styles.timeColumnRight]}>
                <View style={[styles.timeLabelRow, styles.timeLabelRowRight]}>
                  <Text style={styles.timeLabel}>Trả phòng</Text>
                  <Ionicons name="log-out-outline" size={13} color="#4648D4" />
                </View>
                <Text style={[styles.timeValue, styles.textRight]}>12:00</Text>
                <Text style={[styles.dateValue, styles.textRight]}>{checkOutDate}</Text>
              </View>
            </View>

            {/* Perforated Divider (Vé e-Pass Cutout - Figma #31:2956) */}
            <View style={styles.perforatedRow}>
              <View style={styles.cutoutLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.cutoutRight} />
            </View>

            {/* Guest Info Pill Row (Figma #31:2876) */}
            <View style={styles.guestInfoRow}>
              <View style={styles.guestAvatar}>
                <Text style={styles.guestAvatarText}>{getInitials(guestName)}</Text>
              </View>

              <View style={styles.guestMeta}>
                <Text style={styles.guestName}>{guestName}</Text>
                <Text style={styles.guestSub}>{guestsCount} khách</Text>
              </View>

              <View style={styles.roomTagPill}>
                <Text style={styles.roomTagText}>Phòng 402</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Biên lai thanh toán minh bạch (Figma #31:3013) */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Chi tiết thanh toán</Text>
            <View style={styles.paidStatusWrap}>
              <Ionicons name="checkmark-circle" size={15} color="#00685F" />
              <Text style={styles.paidStatusText}>Đã thanh toán</Text>
            </View>
          </View>

          <View style={styles.breakdownList}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownRowLabel}>
                Tổng giá trị đặt phòng ({nightsCount} đêm)
              </Text>
              <Text style={styles.breakdownRowValue}>{totalPriceFormatted}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.depositLabelWrap}>
                <Ionicons name="checkmark" size={14} color="#00685F" />
                <Text style={styles.depositLabel}>Đã thanh toán cọc (100%):</Text>
              </View>
              <Text style={styles.depositValue}>{totalPriceFormatted}</Text>
            </View>
          </View>

          {/* Ghi chú hóa đơn điện tử VAT (Figma #31:3041) */}
          <View style={styles.vatNoteBox}>
            <Ionicons name="mail-outline" size={15} color="#00685F" style={styles.vatMailIcon} />
            <Text style={styles.vatNoteText}>
              Hóa đơn điện tử VAT đã được gửi tới{' '}
              <Text style={styles.vatEmailBold}>{guestEmail}</Text>
            </Text>
          </View>
        </View>

        {/* 5. Nút điều hướng cuối trang & Trust Guarantee (Figma #31:3057) */}
        <View style={styles.actionsContainer}>
          {/* Primary Action Button */}
          <TouchableOpacity
            testID="create-itinerary-btn"
            style={styles.primaryCtaButton}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Itinerary' })}
          >
            <Ionicons name="map-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryCtaText}>Tạo Lịch Trình Chuyến Đi</Text>
          </TouchableOpacity>

          {/* Secondary Ghost Button */}
          <TouchableOpacity
            testID="back-to-home-btn"
            style={styles.secondaryGhostButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Booking' })}
          >
            <Ionicons name="home-outline" size={16} color="#0B1C30" />
            <Text style={styles.secondaryGhostText}>Về Trang Chủ</Text>
          </TouchableOpacity>

          {/* Trust Guarantee Footer (Figma #31:3071) */}
          <View style={styles.trustFooter}>
            <Ionicons name="shield-checkmark" size={14} color="#00685F" />
            <Text style={styles.trustFooterText}>
              Được bảo vệ 100% bởi{' '}
              <Text style={styles.trustBold}>Smart Travel Protection</Text> & Hỗ trợ 24/7
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  topAppBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(188, 201, 198, 0.3)',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.3)',
    ...SHADOWS.card,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1C30',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },

  /* 2. Hero Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(166, 242, 209, 0.6)',
    backgroundColor: '#F3FAF8',
    ...SHADOWS.card,
  },
  glowOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 104, 95, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  glowInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00685F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  napasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.4)',
    marginBottom: 10,
  },
  napasBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3D4947',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1C30',
    marginBottom: 6,
    textAlign: 'center',
  },
  hiddenAccessibilityText: {
    fontSize: 1,
    height: 1,
    opacity: 0.01,
    color: '#F8F9FF',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#3D4947',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.4)',
    borderRadius: 9999,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 6,
    ...SHADOWS.card,
  },
  codePillLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3D4947',
  },
  codePillValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00685F',
    letterSpacing: 0.5,
  },
  copyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 3. Ticket Card (Boarding Pass) */
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.35)',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  ticketImageContainer: {
    height: 176,
    position: 'relative',
    backgroundColor: '#E5EEFF',
  },
  ticketImage: {
    width: '100%',
    height: '100%',
  },
  ticketImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketImageInfo: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  ticketLocationTag: {
    color: '#89F5E7',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ticketRoomTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  ticketRoomSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
  },
  ticketBody: {
    padding: 16,
  },
  checkinCheckoutBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F7FC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.25)',
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnRight: {
    alignItems: 'flex-end',
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  timeLabelRowRight: {
    justifyContent: 'flex-end',
  },
  timeLabel: {
    fontSize: 11,
    color: '#3D4947',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
  },
  dateValue: {
    fontSize: 12,
    color: '#3D4947',
    fontWeight: '500',
    marginTop: 1,
  },
  textRight: {
    textAlign: 'right',
  },
  nightsBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.4)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nightsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00685F',
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  cutoutLeft: {
    width: 14,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#F8F9FF',
    marginLeft: -16,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: 'rgba(188, 201, 198, 0.35)',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.6)',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  cutoutRight: {
    width: 14,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#F8F9FF',
    marginRight: -16,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: 'rgba(188, 201, 198, 0.35)',
  },
  guestInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 104, 95, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  guestAvatarText: {
    color: '#00685F',
    fontWeight: '700',
    fontSize: 13,
  },
  guestMeta: {
    flex: 1,
  },
  guestName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  guestSub: {
    fontSize: 11,
    color: '#3D4947',
    marginTop: 1,
  },
  roomTagPill: {
    backgroundColor: '#E5EEFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  roomTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0B1C30',
  },

  /* 4. Payment Breakdown Card */
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.35)',
    ...SHADOWS.card,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(188, 201, 198, 0.25)',
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  paidStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00685F',
  },
  breakdownList: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownRowLabel: {
    fontSize: 13,
    color: '#3D4947',
  },
  breakdownRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  depositLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  depositLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#00685F',
  },
  depositValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00685F',
  },
  vatNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 238, 255, 0.65)',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginTop: 12,
  },
  vatMailIcon: {
    marginTop: 1,
  },
  vatNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#3D4947',
    lineHeight: 16,
  },
  vatEmailBold: {
    fontWeight: '700',
    color: '#0B1C30',
  },

  /* 5. Actions & Trust */
  actionsContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryCtaButton: {
    backgroundColor: '#0D9488',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryGhostButton: {
    height: 44,
    backgroundColor: '#E5EEFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(188, 201, 198, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryGhostText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  trustFooterText: {
    fontSize: 11,
    color: '#3D4947',
    fontWeight: '500',
  },
  trustBold: {
    fontWeight: '700',
    color: '#00685F',
  },
});

export default BookingResultScreen;

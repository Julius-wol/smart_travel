import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ToastNotification from '../components/ToastNotification';

/**
 * Màn hình [SMART-89] Booking Success / e-Pass (Vé điện tử sau khi thanh toán)
 * Tương thích với Screen 4 trong bản thiết kế Figma
 */
const BookingSuccessScreen = ({ navigation, route }) => {
  const { homestay, bookingCode = 'ST-5894', user, token, bookingDetails } = route.params || {};

  // Trạng thái Toast thông báo (CR_BOOK_06, CR_BOOK_08)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info', duration: 2500 });

  const showToast = (message, type = 'info', duration = 2500) => {
    setToast({ visible: true, message, type, duration });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // CR_BOOK_06: Bấm sao chép mã đặt phòng
  const handleCopyCode = () => {
    showToast('Đã sao chép mã đặt phòng vào bộ nhớ tạm', 'success', 2000);
  };

  // CR_BOOK_08: Bấm nút Tạo Lịch trình Chuyến đi
  const handleCreateAITrip = () => {
    showToast('Đang tạo lịch trình du lịch đồng bộ với phòng của bạn...', 'info', 2500);
    // Sau khi thông báo, có thể điều hướng tiếp sang màn hình AI Planner
    setTimeout(() => {
      navigation.navigate('Home', { user, token });
    }, 2500);
  };

  // Trở về trang chủ và truyền thông tin đơn đặt phòng mới để chuông thông báo cập nhật
  const handleBackToHome = () => {
    navigation.replace('Home', {
      user,
      token,
      recentBooking: {
        bookingCode,
        homestay,
        bookingDetails,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBackToHome}
        >
          <Ionicons name="arrow-back" size={22} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác Nhận & Vé e-Pass</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={30} color="#FFFFFF" />
          </View>
          <View style={styles.napasRow}>
            <Ionicons name="shield-checkmark" size={12} color="#00796B" />
            <Text style={styles.napasText}>XÁC THỰC NAPAS 24/7 • VIETQR</Text>
          </View>
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>
          <Text style={styles.successSub}>
            Cảm ơn bạn. Chuyến nghỉ dưỡng của bạn đã được{'\n'}xác nhận tức thì.
          </Text>
          {/* Mã booking */}
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Mã đặt phòng:</Text>
            <Text style={styles.codeText}>{bookingCode}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={14} color="#00796B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Pass Card */}
        <View style={styles.passCard}>
          {/* Rating + Location */}
          <View style={styles.passRatingRow}>
            <Ionicons name="star" size={12} color="#F6AD55" />
            <Text style={styles.passRatingVal}>
              {homestay?.rating || 4.98} ({homestay?.reviewCount || 142})
            </Text>
            <Text style={styles.passLocation}>
              {' '}• ĐÀ NẴNG • BÁN ĐẢO SƠN TRÀ
            </Text>
          </View>

          {/* Ảnh lớn */}
          <Image
            source={{
              uri:
                homestay?.images?.[0] ||
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            }}
            style={styles.passImage}
          />

          {/* Tên và địa chỉ */}
          <Text style={styles.passName} numberOfLines={2}>
            {homestay?.title || homestay?.name || 'An Nhiên Eco Retreat Đà Nẵng'}
          </Text>
          <Text style={styles.passSubName} numberOfLines={1}>
            {homestay?.subtitle || 'Nguyễn căn 2PN Ocean View Panorama'}
          </Text>

          {/* Divider */}
          <View style={styles.dashedDivider} />

          {/* Check-in / Check-out + Số đêm */}
          <View style={styles.timeGrid}>
            <View style={styles.timeCol}>
              <View style={styles.timeIconRow}>
                <Ionicons name="enter-outline" size={13} color="#00796B" />
                <Text style={styles.timeLabel}>Nhận phòng</Text>
              </View>
              <Text style={styles.timeValue}>14:00</Text>
              <Text style={styles.timeDate}>{bookingDetails?.checkIn || '15/05/2024'}</Text>
            </View>
            <View style={styles.nightsCenterBadge}>
              <Text style={styles.nightsCenterNum}>{bookingDetails?.nights || 3}</Text>
              <Text style={styles.nightsCenterLabel}>đêm</Text>
            </View>
            <View style={[styles.timeCol, { alignItems: 'flex-end' }]}>
              <View style={styles.timeIconRow}>
                <Text style={styles.timeLabel}>Trả phòng</Text>
                <Ionicons name="exit-outline" size={13} color="#718096" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.timeValue}>12:00</Text>
              <Text style={styles.timeDate}>{bookingDetails?.checkOut || '18/05/2024'}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dashedDivider} />

          {/* Guest info row */}
          <View style={styles.guestRow}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>
                {(bookingDetails?.fullName || 'T H').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.guestName}>{bookingDetails?.fullName || 'Trần Hoàng Nam'}</Text>
              <Text style={styles.guestDetail}>{bookingDetails?.guests || 2} khách</Text>
            </View>
            <View style={styles.roomBadgePill}>
              <Text style={styles.roomBadgeText}>Phòng {homestay?.roomNumber || '402'}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dashedDivider} />

          {/* Chi tiết thanh toán */}
          <View style={styles.paymentDetailHeader}>
            <Text style={styles.paymentDetailTitle}>Chi tiết thanh toán</Text>
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#00796B" />
              <Text style={styles.paidBadgeText}>Đã thanh toán</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tổng giá trị đặt phòng ({bookingDetails?.nights || 3} đêm)</Text>
            <Text style={styles.detailValue}>{bookingDetails?.totalAmount || '6.110.000đ'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>✂ Đã thanh toán cọc (100%):</Text>
            <Text style={[styles.detailValue, { color: '#00796B' }]}>{bookingDetails?.totalAmount || '6.110.000đ'}</Text>
          </View>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={13} color="#718096" />
            <Text style={styles.emailText}>
              Hóa đơn điện tử với VAT đã được gửi tới{'\n'}{bookingDetails?.email || 'nguyen.tran@gmail.com'}
            </Text>
          </View>
        </View>

        {/* 3. CTA Buttons */}
        <TouchableOpacity
          style={styles.aiPlannerBtn}
          onPress={handleCreateAITrip}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.aiPlannerBtnText}>Tạo Lịch Trình Chuyến Đi</Text>
        </TouchableOpacity>

        {/* Nút viết đánh giá */}
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() => navigation.navigate('WriteReview', { homestay, bookingCode, user, token })}
          activeOpacity={0.85}
        >
          <Ionicons name="star-outline" size={18} color="#00796B" style={{ marginRight: 8 }} />
          <Text style={styles.reviewBtnText}>Viết đánh giá về chỗ ở</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={handleBackToHome}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={16} color="#718096" style={{ marginRight: 6 }} />
          <Text style={styles.homeBtnText}>Về Trang Chủ</Text>
        </TouchableOpacity>

        {/* Security footer */}
        <View style={styles.securityFooter}>
          <Ionicons name="shield-checkmark" size={13} color="#00796B" />
          <Text style={styles.securityFooterText}>
            Được bảo vệ 100% bởi Smart Travel Protection & Hỗ trợ 24/7
          </Text>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Success banner
  successBanner: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  napasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  napasText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00796B',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  codeLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginRight: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00796B',
    marginRight: 8,
  },
  copyBtn: {
    padding: 4,
  },
  // Pass card
  passCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 16,
  },
  passRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  passRatingVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 4,
  },
  passLocation: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  passImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  passName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 3,
  },
  passSubName: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  timeGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeCol: {
    flex: 1,
  },
  timeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#718096',
    marginLeft: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
  },
  timeDate: {
    fontSize: 12,
    color: '#718096',
  },
  nightsCenterBadge: {
    backgroundColor: '#00796B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  nightsCenterNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nightsCenterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B2F5EA',
  },
  // Guest row
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guestName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
  },
  guestDetail: {
    fontSize: 12,
    color: '#718096',
    marginTop: 1,
  },
  roomBadge: {
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roomBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3748',
  },
  // Payment details
  paymentDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentDetailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
    marginLeft: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#718096',
    flex: 1,
    marginRight: 8,
  },
  discountLabel: {
    flex: 1,
    marginRight: 8,
  },
  discountPercent: {
    fontSize: 13,
    color: '#718096',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 10,
  },
  emailText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 6,
    flex: 1,
    lineHeight: 17,
  },
  // Buttons
  aiPlannerBtn: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    borderRadius: 14,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#00796B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiPlannerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  reviewBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#00796B',
  },
  reviewBtnText: {
    color: '#00796B',
    fontSize: 14,
    fontWeight: '700',
  },
  homeBtn: {
    flexDirection: 'row',
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  securityFooterText: {
    fontSize: 11,
    color: '#00796B',
    marginLeft: 5,
    fontWeight: '600',
  },
});

export default BookingSuccessScreen;

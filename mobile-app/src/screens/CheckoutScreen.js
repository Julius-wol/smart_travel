import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';
import ToastNotification from '../components/ToastNotification';
import { API_URL } from '../utils/config';

/**
 * Màn hình [SMART-88] Checkout & Payment (Xác nhận & Thanh toán)
 * Tương thích với Screen 3 trong bản thiết kế Figma
 * Tích hợp dữ liệu thời gian thực: Chọn ngày, tính số đêm, tính tổng tiền,
 * kiểm tra xung đột phòng trong MongoDB (CR_BOOK_07).
 */
const CheckoutScreen = ({ navigation, route }) => {
  const { homestay, user, token } = route.params || {};

  // Khởi tạo ngày nhận phòng mặc định theo thời gian thực (ngày mai)
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d;
  };

  const getSafeDate = (val) => {
    if (!val) return getTomorrow();
    const d = new Date(val);
    return isNaN(d.getTime()) ? getTomorrow() : d;
  };

  const initialCheckIn = getSafeDate(route.params?.checkIn);
  const initialNights =
    route.params?.nights && Number(route.params.nights) > 0 ? Number(route.params.nights) : 2;
  const initialGuests =
    route.params?.guests && Number(route.params.guests) > 0 ? Number(route.params.guests) : 2;

  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [nights, setNights] = useState(initialNights);
  const [guests, setGuests] = useState(initialGuests);
  const [activeDatePreset, setActiveDatePreset] = useState(
    route.params?.checkIn ? 'custom' : 'tomorrow'
  );

  // Modal cảnh báo xung đột phòng thời gian thực (CR_BOOK_07)
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  // Ngày trả phòng tính theo thời gian thực: checkIn + nights
  const checkOutDate = new Date(checkInDate.getTime() + nights * 24 * 60 * 60 * 1000);
  checkOutDate.setHours(12, 0, 0, 0);

  // Tính toán chi phí thực tế theo số đêm được chọn
  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  const pricePerNight = homestay?.pricePerNight || homestay?.price || 1450000;
  const roomTotal = pricePerNight * nights;
  const serviceFee = 150000;
  const voucherDiscount = 500000;
  const totalAmount = Math.max(0, roomTotal + serviceFee - voucherDiscount);

  // Form thông tin khách hàng
  const [fullName, setFullName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Nguyễn Văn Nam'
  );
  const [phoneNumber, setPhoneNumber] = useState('0912345678');
  const [email, setEmail] = useState(user?.email || 'namnguyen@gmail.com');

  // Phương thức thanh toán được chọn
  const [paymentMethod, setPaymentMethod] = useState('momo');

  // Trạng thái Loading Overlay (CR_BOOK_05)
  const [isProcessing, setIsProcessing] = useState(false);

  // Trạng thái Toast thông báo (CR_BOOK_04)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Format ngày tiếng Việt
  const formatDateVN = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDayNameVN = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };

  const formatDatesSummary = () => {
    const inD = new Date(checkInDate);
    const outD = new Date(checkOutDate);
    return `${inD.getDate()} Th${inD.getMonth() + 1} - ${outD.getDate()} Th${outD.getMonth() + 1}, ${outD.getFullYear()} (${nights} đêm)`;
  };

  // Các preset chọn ngày nhanh theo thời gian thực
  const setPresetDate = (type) => {
    setActiveDatePreset(type);
    const now = new Date();
    if (type === 'today') {
      const d = new Date();
      d.setHours(14, 0, 0, 0);
      setCheckInDate(d);
    } else if (type === 'tomorrow') {
      const d = new Date();
      d.setDate(now.getDate() + 1);
      d.setHours(14, 0, 0, 0);
      setCheckInDate(d);
    } else if (type === 'weekend') {
      const d = new Date();
      const dayOfWeek = d.getDay();
      const distanceToFriday = (5 - dayOfWeek + 7) % 7 || 7;
      d.setDate(d.getDate() + distanceToFriday);
      d.setHours(14, 0, 0, 0);
      setCheckInDate(d);
    }
  };

  // Xử lý xác nhận thanh toán (gọi API thực tế lưu vào MongoDB)
  const handleConfirmPayment = async () => {
    console.log('👉 [CheckoutScreen] Đang nhấn Xác nhận & Thanh toán...');

    // CR_BOOK_04: Kiểm tra thông tin liên hệ
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim()) {
      showToast('Vui lòng điền đầy đủ và chính xác thông tin liên hệ.', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showToast('Định dạng email liên hệ không hợp lệ.', 'error');
      return;
    }

    // CR_BOOK_05: Bật Loading Overlay full screen
    setIsProcessing(true);

    try {
      const roomId = homestay?._id || homestay?.id;
      const payload = {
        roomId,
        userId: user?._id || user?.id,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights,
        guests,
        paymentMethod,
        totalPrice: totalAmount,
      };

      console.log('📦 [CheckoutScreen] Gửi API tạo booking tới:', `${API_URL}/bookings`, payload);

      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('📥 [CheckoutScreen] Phản hồi từ máy chủ:', res.status, data);
      setIsProcessing(false);

      // CR_BOOK_07: Xung đột lịch phòng thời gian thực
      if (res.status === 409 || data.conflict) {
        setConflictMessage(
          data.message ||
            'Rất tiếc, phòng này vừa được khách khác đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương.'
        );
        setConflictModalVisible(true);
        return;
      }

      if (res.ok && data.success) {
        const now = new Date();
        const bookingTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')} - ${formatDateVN(now)}`;

        // Chuyển sang màn hình Vé e-Pass thành công với mã booking và thời gian thực tế
        navigation.replace('BookingSuccess', {
          homestay,
          bookingCode: data.bookingCode || 'ST-5894',
          user,
          token,
          bookingDetails: {
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email.trim(),
            totalAmount: formatVND(totalAmount),
            checkIn: formatDateVN(checkInDate),
            checkOut: formatDateVN(checkOutDate),
            nights,
            guests,
            dates: formatDatesSummary(),
            bookingTime: bookingTimeStr,
          },
        });
      } else {
        showToast(data.message || 'Không thể tạo đơn đặt phòng. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('❌ Lỗi khi thanh toán:', error);
      setIsProcessing(false);
      // CR_BOOK_03: Mất mạng hoặc lỗi kết nối máy chủ
      showToast('Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A202C" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Xác Nhận & Thanh Toán</Text>
          <View style={styles.headerSecurityBadge}>
            <Ionicons name="shield-checkmark" size={10} color="#00796B" />
            <Text style={styles.headerSecurityText}>ĐÀO MẮT SSL 256-BIT</Text>
          </View>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Tóm tắt phòng lưu trú */}
        <View style={styles.roomSummaryCard}>
          <Image
            source={{
              uri:
                homestay?.images?.[0] ||
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
            }}
            style={styles.roomThumb}
          />
          <View style={styles.roomInfoCol}>
            {/* Rating */}
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#F6AD55" />
              <Text style={styles.ratingVal}>
                {homestay?.rating || 4.9} ({homestay?.reviewCount || 142})
              </Text>
              <Text style={styles.ratingLocation}>
                {' '}• {typeof homestay?.location === 'string' ? homestay.location : (homestay?.city || 'Sơn Trà, Đà Nẵng')}
              </Text>
            </View>
            <Text style={styles.roomName} numberOfLines={2}>
              {homestay?.title || homestay?.name || 'An Nhiên Eco Retreat'}
            </Text>
            <Text style={styles.roomSubName} numberOfLines={1}>
              {homestay?.subtitle || 'Nguyễn căn 2PN View Biển'}
            </Text>
            <Text style={styles.roomCapacity}>
              Đã chọn: {guests} khách{route.params?.roomCount ? ` (${route.params.roomCount} phòng)` : ''} • Tối đa {homestay?.maxGuests || 4} người
            </Text>
            {/* Date strip */}
            <View style={styles.roomDateStrip}>
              <View style={styles.roomDateItem}>
                <Ionicons name="calendar-outline" size={11} color="#00796B" />
                <Text style={styles.roomDateText}>
                  {String(checkInDate.getDate()).padStart(2,'0')} Th{checkInDate.getMonth()+1}
                </Text>
              </View>
              <Text style={styles.roomDateDash}> – </Text>
              <View style={styles.roomDateItem}>
                <Text style={styles.roomDateText}>
                  {String(checkOutDate.getDate()).padStart(2,'0')} Th{checkOutDate.getMonth()+1}
                </Text>
              </View>
              <View style={styles.roomNightsBadge}>
                <Text style={styles.roomNightsText}>{nights} đêm nghỉ dưỡng</Text>
              </View>
            </View>
            {/* Check-in / Check-out times */}
            <View style={styles.roomTimesRow}>
              <View style={styles.roomTimeItem}>
                <Text style={styles.roomTimeLabel}>Nhận phòng</Text>
                <Text style={styles.roomTimeValue}>14:00 • {String(checkInDate.getDate()).padStart(2,'0')} Th{checkInDate.getMonth()+1}</Text>
              </View>
              <View style={styles.roomTimeDivider} />
              <View style={styles.roomTimeItem}>
                <Text style={styles.roomTimeLabel}>Trả phòng</Text>
                <Text style={styles.roomTimeValue}>12:00 • {String(checkOutDate.getDate()).padStart(2,'0')} Th{checkOutDate.getMonth()+1}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Chọn ngày & số khách thời gian thực */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Thời gian lưu trú & Số khách</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Thời gian thực</Text>
          </View>
        </View>

        <View style={styles.dateSelectorCard}>
          {/* Quick Preset Buttons */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[styles.presetBtn, activeDatePreset === 'today' && styles.presetBtnActive]}
              onPress={() => setPresetDate('today')}
            >
              <Text style={[styles.presetBtnText, activeDatePreset === 'today' && styles.presetBtnTextActive]}>
                Hôm nay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetBtn, activeDatePreset === 'tomorrow' && styles.presetBtnActive]}
              onPress={() => setPresetDate('tomorrow')}
            >
              <Text style={[styles.presetBtnText, activeDatePreset === 'tomorrow' && styles.presetBtnTextActive]}>
                Ngày mai
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetBtn, activeDatePreset === 'weekend' && styles.presetBtnActive]}
              onPress={() => setPresetDate('weekend')}
            >
              <Text style={[styles.presetBtnText, activeDatePreset === 'weekend' && styles.presetBtnTextActive]}>
                Cuối tuần này
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Range Display Box */}
          <View style={styles.dateRangeBox}>
            <View style={styles.dateCol}>
              <Text style={styles.dateColLabel}>NHẬN PHÒNG</Text>
              <Text style={styles.dateColMain}>{formatDateVN(checkInDate)}</Text>
              <Text style={styles.dateColSub}>{getDayNameVN(checkInDate)} • 14:00</Text>
            </View>

            <View style={styles.dateArrowBox}>
              <Ionicons name="arrow-forward" size={16} color="#00796B" />
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsBadgeText}>{nights} đêm</Text>
              </View>
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.dateColLabel}>TRẢ PHÒNG</Text>
              <Text style={styles.dateColMain}>{formatDateVN(checkOutDate)}</Text>
              <Text style={styles.dateColSub}>{getDayNameVN(checkOutDate)} • 12:00</Text>
            </View>
          </View>

          {/* Controls: Tăng giảm số đêm & số khách */}
          <View style={styles.steppersRow}>
            {/* Stepper Số đêm */}
            <View style={styles.stepperItem}>
              <View>
                <Text style={styles.stepperLabel}>Số đêm lưu trú</Text>
                <Text style={styles.stepperSub}>{nights} đêm</Text>
              </View>
              <View style={styles.stepperButtons}>
                <TouchableOpacity
                  style={[styles.stepBtn, nights <= 1 && styles.stepBtnDisabled]}
                  onPress={() => setNights((prev) => Math.max(1, prev - 1))}
                  disabled={nights <= 1}
                >
                  <Ionicons name="remove" size={16} color={nights <= 1 ? '#CBD5E0' : '#1A202C'} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{nights}</Text>
                <TouchableOpacity
                  style={[styles.stepBtn, nights >= 14 && styles.stepBtnDisabled]}
                  onPress={() => setNights((prev) => Math.min(14, prev + 1))}
                  disabled={nights >= 14}
                >
                  <Ionicons name="add" size={16} color={nights >= 14 ? '#CBD5E0' : '#1A202C'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stepperDivider} />

            {/* Stepper Số khách */}
            <View style={styles.stepperItem}>
              <View>
                <Text style={styles.stepperLabel}>Số lượng khách</Text>
                <Text style={styles.stepperSub}>{guests} người</Text>
              </View>
              <View style={styles.stepperButtons}>
                <TouchableOpacity
                  style={[styles.stepBtn, guests <= 1 && styles.stepBtnDisabled]}
                  onPress={() => setGuests((prev) => Math.max(1, prev - 1))}
                  disabled={guests <= 1}
                >
                  <Ionicons name="remove" size={16} color={guests <= 1 ? '#CBD5E0' : '#1A202C'} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{guests}</Text>
                <TouchableOpacity
                  style={[styles.stepBtn, guests >= (homestay?.maxGuests || 4) && styles.stepBtnDisabled]}
                  onPress={() => setGuests((prev) => Math.min(homestay?.maxGuests || 4, prev + 1))}
                  disabled={guests >= (homestay?.maxGuests || 4)}
                >
                  <Ionicons name="add" size={16} color={guests >= (homestay?.maxGuests || 4) ? '#CBD5E0' : '#1A202C'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Form thông tin người đặt */}
        <Text style={styles.sectionHeading}>Thông tin người đặt</Text>
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên khách</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại liên hệ</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="0912345678"
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.inputLabel}>Email nhận hóa đơn & vé</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@example.com"
            />
          </View>
        </View>

        {/* 4. Phương thức thanh toán */}
        <Text style={styles.sectionHeading}>Phương thức thanh toán</Text>
        <View style={styles.paymentMethodsCard}>
          {/* MoMo */}
          <TouchableOpacity
            style={[
              styles.methodRow,
              paymentMethod === 'momo' && styles.methodRowActive,
            ]}
            onPress={() => setPaymentMethod('momo')}
          >
            <Ionicons name="wallet-outline" size={22} color="#A21CAF" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>Ví MoMo / ZaloPay</Text>
              <Text style={styles.methodSub}>Thanh toán quét mã siêu nhanh</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'momo' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#00796B"
            />
          </TouchableOpacity>

          {/* Chuyển khoản VietQR */}
          <TouchableOpacity
            style={[
              styles.methodRow,
              paymentMethod === 'bank' && styles.methodRowActive,
            ]}
            onPress={() => setPaymentMethod('bank')}
          >
            <Ionicons name="qr-code-outline" size={22} color="#00796B" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>Chuyển khoản VietQR</Text>
              <Text style={styles.methodSub}>Miễn phí giao dịch 24/7</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'bank' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#00796B"
            />
          </TouchableOpacity>

          {/* Thẻ tín dụng */}
          <TouchableOpacity
            style={[
              styles.methodRow,
              paymentMethod === 'card' && styles.methodRowActive,
              { borderBottomWidth: 0 },
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card-outline" size={22} color="#2563EB" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>Thẻ Quốc tế (Visa / Master)</Text>
              <Text style={styles.methodSub}>Bảo mật 3D Secure</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#00796B"
            />
          </TouchableOpacity>
        </View>

        {/* 5. Chi tiết tiền thanh toán (Tự động cập nhật thời gian thực) */}
        <Text style={styles.sectionHeading}>Chi tiết giá tiền</Text>
        <View style={styles.pricingCard}>
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Tiền phòng ({formatVND(pricePerNight)} x {nights} đêm)</Text>
            <Text style={styles.priceVal}>{formatVND(roomTotal)}</Text>
          </View>
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Phí dịch vụ & tiện ích</Text>
            <Text style={styles.priceVal}>150.000đ</Text>
          </View>
          <View style={styles.priceLine}>
            <Text style={[styles.priceLabel, { color: '#00796B' }]}>Voucher giảm giá SMART2026</Text>
            <Text style={[styles.priceVal, { color: '#00796B' }]}>-500.000đ</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceLineTotal}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalVal}>{formatVND(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 6. Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalText}>Tổng tiền ({nights} đêm)</Text>
          <Text style={styles.bottomPriceValue}>{formatVND(totalAmount)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
          onPress={handleConfirmPayment}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : null}
          <Text style={styles.payBtnText}>
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
          </Text>
          {!isProcessing && (
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Alert Dialog Xung đột phòng (CR_BOOK_07) */}
      <Modal
        visible={conflictModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConflictModalVisible(false)}
      >
        <View style={styles.conflictBackdrop}>
          <View style={styles.conflictCard}>
            <View style={styles.conflictIconWrap}>
              <Ionicons name="alert-circle" size={42} color="#E53E3E" />
            </View>
            <Text style={styles.conflictTitle}>Phòng không còn trống</Text>
            <Text style={styles.conflictDesc}>
              {conflictMessage ||
                'Rất tiếc, phòng này vừa được khách khác đặt trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng tương đương.'}
            </Text>

            <View style={styles.conflictBtnRow}>
              <TouchableOpacity
                style={styles.conflictBtnSecondary}
                onPress={() => setConflictModalVisible(false)}
              >
                <Text style={styles.conflictBtnSecondaryText}>Chọn ngày khác</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.conflictBtnPrimary}
                onPress={() => {
                  setConflictModalVisible(false);
                  navigation.navigate('Home', { user, token });
                }}
              >
                <Text style={styles.conflictBtnPrimaryText}>Xem phòng khác</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay (CR_BOOK_05) */}
      <LoadingOverlay
        visible={isProcessing}
        message="Đang xử lý đặt phòng và xác nhận thanh toán an toàn..."
      />

      {/* Toast Notification (CR_BOOK_04, CR_BOOK_03) */}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  headerCenter: {
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSecurityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00796B',
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  roomSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roomThumb: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
    marginBottom: 12,
  },
  roomInfoCol: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 4,
  },
  ratingLocation: {
    fontSize: 11,
    color: '#718096',
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  roomSubName: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  roomCapacity: {
    fontSize: 11,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  roomDateStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  roomDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 4,
  },
  roomDateDash: {
    color: '#A0AEC0',
    fontSize: 12,
  },
  roomNightsBadge: {
    marginLeft: 'auto',
    backgroundColor: '#00796B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roomNightsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roomTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 8,
  },
  roomTimeItem: {
    flex: 1,
  },
  roomTimeDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  roomTimeLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '600',
    marginBottom: 2,
  },
  roomTimeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3748',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00796B',
    marginRight: 5,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },
  dateSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginRight: 6,
  },
  presetBtnActive: {
    backgroundColor: '#E6FFFA',
    borderColor: '#00796B',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  presetBtnTextActive: {
    color: '#00796B',
    fontWeight: '700',
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  dateCol: {
    flex: 1,
  },
  dateColLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A0AEC0',
    marginBottom: 2,
  },
  dateColMain: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
  },
  dateColSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  dateArrowBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  nightsBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  nightsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00796B',
  },
  steppersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stepperItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#EDF2F7',
    marginHorizontal: 12,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
  },
  stepperSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  stepperButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: '#F7FAFC',
  },
  stepValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A202C',
  },
  paymentMethodsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  methodRowActive: {},
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
  },
  methodSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#718096',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 10,
  },
  priceLineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00796B',
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
  bottomTotalText: {
    fontSize: 11,
    color: '#718096',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00796B',
  },
  payBtn: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  conflictBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  conflictCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  conflictIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  conflictTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  conflictDesc: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  conflictBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  conflictBtnSecondary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    marginRight: 8,
  },
  conflictBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  conflictBtnPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#00796B',
    alignItems: 'center',
    marginLeft: 8,
  },
  conflictBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CheckoutScreen;

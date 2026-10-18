import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import guestInfoValidationSchema from '../utils/checkoutValidation';
import {
  updateSchedule,
  setPaymentMethod,
  createBookingThunk,
} from '../store/slices/bookingSlice';
import { checkAvailabilityApi } from '../services/bookingService';
import SummaryCard from '../components/SummaryCard';
import GuestInfoForm from '../components/GuestInfoForm';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import InvoiceBreakdown from '../components/InvoiceBreakdown';
import CheckoutBottomBar from '../components/CheckoutBottomBar';
import LoadingOverlay from '../components/LoadingOverlay';

/**
 * CheckoutPaymentScreen Component (SMART-88 - Node 30:2418 View Recept)
 * Màn hình Xác nhận đặt phòng & Mô phỏng thanh toán an toàn
 */
export const CheckoutPaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { room = {} } = route.params || {};

  const bookingState = useSelector((state) => state.booking);
  const { schedule, pricing, paymentMethod, loading, simulatingPayment } = bookingState;

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const formik = useFormik({
    initialValues: {
      fullName: bookingState.guestInfo.fullName || 'Lê Đăng Trung Hiếu',
      phoneNumber: bookingState.guestInfo.phoneNumber || '0987654321',
      email: bookingState.guestInfo.email || 'hieu.le@smarttravel.vn',
      hasSpecialNote: bookingState.guestInfo.hasSpecialNote ?? true,
      specialNote: bookingState.guestInfo.specialNote || 'Xin check-in sớm 13:00 nếu có thể. Cảm ơn!',
      paymentMethod: paymentMethod || 'NAPAS_QR',
    },
    validationSchema: guestInfoValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const roomId = room._id || '664c1234567890abcdef1234';

        // 1. Kiểm tra tình trạng phòng trống trước khi thực hiện thanh toán
        try {
          const availRes = await checkAvailabilityApi(roomId, schedule.checkIn, schedule.checkOut);
          if (availRes.data && availRes.data.isAvailable === false) {
            showToast('Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác');
            return;
          }
        } catch (availErr) {
          if (availErr.statusCode === 409 || availErr.code === 'CR_BOOK_09') {
            showToast('Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác');
            return;
          }
        }

        // 2. Chuẩn bị payload tạo đơn
        const bookingPayload = {
          roomId,
          checkIn: schedule.checkIn,
          checkOut: schedule.checkOut,
          guests: room.maxGuests || 2,
          guestInfo: {
            fullName: values.fullName.trim(),
            phoneNumber: values.phoneNumber.trim(),
            email: values.email.trim(),
          },
          specialNote: values.hasSpecialNote ? values.specialNote.trim() : '',
          paymentMethod: values.paymentMethod,
        };

        // 3. Kích hoạt Redux thunk (1.5s simulated delay + API call)
        const resultAction = await dispatch(createBookingThunk(bookingPayload));

        if (createBookingThunk.fulfilled.match(resultAction)) {
          const createdBooking = resultAction.payload;
          navigation.replace('BookingResult', {
            bookingId: createdBooking._id,
            bookingCode: createdBooking.bookingCode,
            room,
            schedule,
            pricing,
            paymentMethod: values.paymentMethod,
            guestInfo: bookingPayload.guestInfo,
          });
        } else {
          const errPayload = resultAction.payload;
          if (errPayload?.code === 'CR_BOOK_09' || errPayload?.statusCode === 409) {
            showToast(
              'Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác'
            );
          } else if (errPayload?.code === 'CR_BOOK_04') {
            showToast('Vui lòng điền đầy đủ và chính xác thông tin liên hệ.');
          } else {
            showToast(
              errPayload?.message ||
                'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.'
            );
          }
        }
      } catch (err) {
        showToast('Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.');
      }
    },
  });

  const handleScheduleChange = (newSchedule) => {
    dispatch(
      updateSchedule({
        checkIn: newSchedule.checkIn,
        checkOut: newSchedule.checkOut,
        pricePerNight: room.pricePerNight || pricing.pricePerNight,
      })
    );
  };

  const handleSelectPaymentMethod = (methodId) => {
    dispatch(setPaymentMethod(methodId));
    formik.setFieldValue('paymentMethod', methodId);
  };

  const handleConfirmAndPay = () => {
    formik.handleSubmit();
    if (!formik.isValid) {
      showToast('Vui lòng điền đầy đủ và chính xác thông tin liên hệ.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header (Figma #30:2781) */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="checkout-back-btn"
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textHeading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận & Đặt phòng</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Thông báo lỗi Toast */}
      {toastMessage && (
        <View testID="toast-banner" style={styles.toastBanner}>
          <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 2. Scrollable Body Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Khối 1: Tóm tắt phòng & Lịch trình (Figma #30:2434) */}
        <SummaryCard
          room={room}
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
        />

        {/* Khối 2: Thông tin khách lưu trú (Figma #30:2485) */}
        <GuestInfoForm
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          setFieldValue={formik.setFieldValue}
        />

        {/* Khối 3: Phương thức thanh toán (Figma #30:2648) */}
        <PaymentMethodSelector
          selectedMethod={formik.values.paymentMethod}
          onSelectMethod={handleSelectPaymentMethod}
        />

        {/* Khối 4: Chi tiết hóa đơn & Cam kết 150% (Figma #30:2707 & #30:2751) */}
        <InvoiceBreakdown
          pricing={pricing}
          checkInDate={schedule.checkIn}
        />

        {/* Khoảng trống tránh thanh đáy che nội dung */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 3. Sticky Bottom Bar (Figma #30:2762) */}
      <CheckoutBottomBar
        totalPrice={pricing.totalPrice}
        onSubmit={handleConfirmAndPay}
        loading={loading}
      />

      {/* 4. Full-screen Loading Overlay 1.5s (CR_BOOK_05) */}
      <LoadingOverlay visible={simulatingPayment} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.discountText,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  scrollContent: {
    padding: 16,
  },
  bottomSpacer: {
    height: 90,
  },
});

export default CheckoutPaymentScreen;

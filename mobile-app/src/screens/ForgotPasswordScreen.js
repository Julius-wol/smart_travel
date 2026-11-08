import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';

// Hỗ trợ fallback nếu môi trường thiếu Modal
const SafeModal = Modal || View;

const ForgotPasswordScreen = ({ navigation }) => {
  // Step 1: Nhập email gửi OTP
  // Step 2: Màn hình nhập mã OTP riêng >> xác thực OTP
  // Step 3: Màn hình nhập mật khẩu mới riêng >> đổi mật khẩu
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Trạng thái Loading và Cooldown 60s
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Pop-up thông báo tùy chỉnh (không dùng cửa sổ lỗi mặc định của OS)
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error', // 'error' | 'success' | 'warning'
    action: null,
  });

  const showPopup = (message, title = 'Thông báo', type = 'error', action = null) => {
    setPopup({
      visible: true,
      title,
      message,
      type,
      action,
    });
  };

  const closePopup = () => {
    const nextAction = popup.action;
    setPopup((prev) => ({ ...prev, visible: false }));
    if (typeof nextAction === 'function') {
      nextAction();
    }
  };

  // Quản lý đếm ngược 60 giây chống Spam gửi OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // BƯỚC 1: Gửi mã OTP về email
  const handleSendEmail = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      showPopup('Vui lòng nhập địa chỉ Gmail đã đăng ký!', 'Chưa nhập Gmail');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      showPopup('Định dạng Gmail không hợp lệ. Vui lòng kiểm tra lại!', 'Email không hợp lệ');
      return;
    }

    if (countdown > 0) {
      showPopup(`Vui lòng đợi ${countdown} giây trước khi yêu cầu gửi lại mã!`, 'Vui lòng chờ', 'warning');
      return;
    }
    
    setLoadingSend(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });
      const data = await res.json();
      
      if (res.ok) {
        setCountdown(60);
        showPopup(
          data.message || 'Mã OTP đã được gửi đến Gmail của bạn. Vui lòng kiểm tra hộp thư!',
          'Gửi mã thành công',
          'success',
          () => setStep(2) // Chuyển sang màn hình nhập OTP riêng
        );
      } else {
        showPopup(data.message || 'Không thể gửi yêu cầu xác thực OTP', 'Gửi thất bại');
      }
    } catch (error) {
      console.error(error);
      showPopup('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!', 'Lỗi kết nối');
    } finally {
      setLoadingSend(false);
    }
  };

  // BƯỚC 2: Xác thực mã OTP riêng
  const handleVerifyOtp = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      showPopup('Vui lòng nhập mã OTP 6 chữ số!', 'Chưa nhập OTP');
      return;
    }
    if (trimmedOtp.length !== 6) {
      showPopup('Mã OTP phải có đúng 6 chữ số!', 'OTP không hợp lệ');
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: trimmedOtp })
      });
      const data = await res.json();

      if (res.ok) {
        showPopup(
          'Mã OTP hợp lệ! Hãy tiến hành đặt mật khẩu mới cho tài khoản.',
          'Xác thực thành công',
          'success',
          () => setStep(3) // Verify OTP đúng >> chuyển sang màn hình nhập mật khẩu mới
        );
      } else {
        showPopup(data.message || 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại!', 'Xác thực thất bại');
      }
    } catch (error) {
      console.error(error);
      showPopup('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!', 'Lỗi kết nối');
    } finally {
      setLoadingVerify(false);
    }
  };

  // BƯỚC 3: Đặt lại mật khẩu mới
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      showPopup('Vui lòng nhập mật khẩu mới!', 'Chưa nhập mật khẩu');
      return;
    }
    if (newPassword.length < 6) {
      showPopup('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'Mật khẩu quá ngắn');
      return;
    }
    if (!confirmPassword.trim()) {
      showPopup('Vui lòng xác nhận lại mật khẩu mới!', 'Chưa xác nhận mật khẩu');
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup('Mật khẩu xác nhận không khớp với mật khẩu mới!', 'Không trùng khớp');
      return;
    }

    setLoadingReset(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp.trim(), newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        showPopup(
          'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.',
          'Đổi mật khẩu thành công',
          'success',
          () => navigation.navigate('Login')
        );
      } else {
        showPopup(data.message || 'Mã OTP không đúng hoặc đã hết hạn', 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error(error);
      showPopup('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!', 'Lỗi kết nối');
    } finally {
      setLoadingReset(false);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Nút Back */}
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1A202C" />
          </TouchableOpacity>

          {/* Thanh chỉ báo bước tiến trình (Step Indicator) */}
          <View style={styles.stepIndicatorRow}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= 2 && styles.stepDotTextActive]}>2</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= 3 && styles.stepDotTextActive]}>3</Text>
            </View>
          </View>

          {/* Card nội dung Form */}
          <View style={styles.formCard}>
            {/* ======================================================== */}
            {/* BƯỚC 1: NHẬP EMAIL GỬI MÃ OTP */}
            {/* ======================================================== */}
            {step === 1 && (
              <View>
                <Text style={styles.title}>Quên mật khẩu</Text>
                <Text style={styles.subtitle}>
                  Nhập địa chỉ Gmail đăng ký tài khoản SmartTravel để nhận mã OTP xác thực.
                </Text>
                
                <Text style={styles.inputLabel}>Địa chỉ Gmail</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#00796B" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Nhập địa chỉ Gmail (ví dụ: ten@gmail.com)"
                    placeholderTextColor="#A0AEC0"
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, (loadingSend || countdown > 0) && styles.disabledBtn]} 
                  onPress={handleSendEmail}
                  disabled={loadingSend}
                  activeOpacity={0.85}
                >
                  {loadingSend ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Đang gửi OTP qua Gmail...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi mã OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ======================================================== */}
            {/* BƯỚC 2: MÀN HÌNH NHẬP MÃ OTP RIÊNG (ĐỘC LẬP) */}
            {/* ======================================================== */}
            {step === 2 && (
              <View>
                <Text style={styles.title}>Nhập mã OTP</Text>
                <Text style={styles.subtitle}>
                  Mã xác thực 6 chữ số đã được gửi đến{' '}
                  <Text style={{ fontWeight: 'bold', color: '#00796B' }}>{email}</Text>.
                </Text>

                <Text style={styles.inputLabel}>Mã xác thực OTP (6 chữ số)</Text>
                <View style={[styles.inputWrapper, styles.otpWrapper]}>
                  <Ionicons name="keypad-outline" size={22} color="#00796B" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, styles.otpInput]} 
                    placeholder="Nhập mã OTP 6 chữ số"
                    placeholderTextColor="#A0AEC0"
                    value={otp} 
                    onChangeText={setOtp} 
                    keyboardType="number-pad" 
                    maxLength={6} 
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, loadingVerify && styles.disabledBtn]} 
                  onPress={handleVerifyOtp}
                  disabled={loadingVerify}
                  activeOpacity={0.85}
                >
                  {loadingVerify ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Đang xác thực OTP...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitBtnText}>Xác nhận mã OTP</Text>
                  )}
                </TouchableOpacity>

                {/* Nút Gửi lại mã OTP với countdown 60s */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Chưa nhận được mã? </Text>
                  <TouchableOpacity 
                    onPress={handleSendEmail} 
                    disabled={countdown > 0 || loadingSend}
                  >
                    {loadingSend ? (
                      <ActivityIndicator size="small" color="#00796B" />
                    ) : (
                      <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
                        {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ======================================================== */}
            {/* BƯỚC 3: MÀN HÌNH NHẬP MẬT KHẨU MỚI RIÊNG (SAU KHI VERIFY ĐÚNG) */}
            {/* ======================================================== */}
            {step === 3 && (
              <View>
                <Text style={styles.title}>Đặt lại mật khẩu</Text>
                <Text style={styles.subtitle}>
                  Mã OTP đã được xác thực! Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                </Text>

                <Text style={styles.inputLabel}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#00796B" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Nhập mật khẩu mới" 
                    placeholderTextColor="#A0AEC0"
                    value={newPassword} 
                    onChangeText={setNewPassword} 
                    secureTextEntry={!showPassword} 
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.eyeBtn}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#888" 
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#00796B" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Nhập lại mật khẩu mới" 
                    placeholderTextColor="#A0AEC0"
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry={!showConfirmPassword} 
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={styles.eyeBtn}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#888" 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, loadingReset && styles.disabledBtn]} 
                  onPress={handleResetPassword}
                  disabled={loadingReset}
                  activeOpacity={0.85}
                >
                  {loadingReset ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Đang cập nhật mật khẩu...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitBtnText}>Xác nhận & Đổi mật khẩu</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pop-up Thông Báo Tùy Chỉnh (Thay thế hoàn toàn Alert mặc định của OS) */}
      <SafeModal
        transparent
        visible={popup.visible}
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[
              styles.modalIconCircle, 
              popup.type === 'success' && styles.modalIconCircleSuccess,
              popup.type === 'warning' && styles.modalIconCircleWarning
            ]}>
              <Ionicons 
                name={
                  popup.type === 'success' 
                    ? 'checkmark-circle' 
                    : popup.type === 'warning' 
                      ? 'warning-outline' 
                      : 'alert-circle'
                } 
                size={38} 
                color={
                  popup.type === 'success' 
                    ? '#00796B' 
                    : popup.type === 'warning' 
                      ? '#D97706' 
                      : '#E53E3E'
                } 
              />
            </View>

            <Text style={styles.modalTitle}>{popup.title}</Text>
            <Text style={styles.modalMessage}>{popup.message}</Text>

            <TouchableOpacity 
              style={[
                styles.modalBtn,
                popup.type === 'success' && styles.modalBtnSuccess
              ]} 
              onPress={closePopup}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>
                {popup.type === 'success' && step === 3 ? 'Đăng nhập ngay' : 'Đã hiểu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  scrollContent: {
    padding: 24,
    paddingTop: 20,
  },
  backBtn: { 
    marginTop: 20, 
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  // Step indicator
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#00796B',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#718096',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#00796B',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A202C', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#718096', 
    marginBottom: 24, 
    lineHeight: 22 
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#2D3748', 
    marginBottom: 8 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F7FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    marginBottom: 18 
  },
  otpWrapper: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
    paddingVertical: 2,
  },
  inputIcon: { 
    marginRight: 8 
  },
  input: { 
    flex: 1, 
    height: 48, 
    fontSize: 15, 
    color: '#2D3748' 
  },
  otpInput: {
    fontSize: 18,
    letterSpacing: 4,
    fontWeight: 'bold',
    color: '#00796B',
  },
  eyeBtn: {
    padding: 8,
  },
  submitBtn: { 
    backgroundColor: '#00796B', 
    borderRadius: 12, 
    paddingVertical: 15, 
    alignItems: 'center', 
    marginTop: 8,
    elevation: 2,
    shadowColor: '#00796B',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledBtn: { 
    opacity: 0.7, 
    backgroundColor: '#4DB6AC' 
  },
  submitBtnText: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  loadingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  resendContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 22 
  },
  resendText: { 
    fontSize: 14, 
    color: '#718096' 
  },
  resendLink: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#00796B' 
  },
  resendLinkDisabled: { 
    color: '#A0AEC0', 
    fontWeight: 'normal' 
  },

  // Modal Pop-up Tùy Chỉnh
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  modalIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconCircleSuccess: {
    backgroundColor: '#E6FFFA',
  },
  modalIconCircleWarning: {
    backgroundColor: '#FEF3C7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#E53E3E',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalBtnSuccess: {
    backgroundColor: '#00796B',
    shadowColor: '#00796B',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ForgotPasswordScreen;

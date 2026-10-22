import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Trạng thái Loading và Cooldown 60s
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Quản lý đếm ngược 60 giây chống Spam
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email!');
      return;
    }

    if (countdown > 0) {
      Alert.alert('Chờ một chút', `Vui lòng đợi ${countdown} giây trước khi yêu cầu gửi lại mã!`);
      return;
    }
    
    setLoadingSend(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('Thành công', data.message || 'Mã OTP đã được gửi đến Gmail của bạn!');
        setCountdown(60); // Bắt đầu đếm ngược 60s
        setStep(2); // Chuyển sang bước nhập OTP
      } else {
        Alert.alert('Thông báo', data.message || 'Không thể gửi yêu cầu');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ Backend');
    } finally {
      setLoadingSend(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP và mật khẩu mới!');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Xác nhận mật khẩu mới không khớp!');
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
        Alert.alert(
          'Thành công', 
          'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.', 
          [
            { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }
          ]
        );
      } else {
        Alert.alert('Lỗi', data.message || 'Mã OTP không đúng hoặc đã hết hạn');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ Backend');
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {step === 1 ? (
          <View>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>Nhập email đã đăng ký tài khoản SmartTravel để nhận mã OTP xác thực.</Text>
            
            <Text style={styles.inputLabel}>Email đăng ký</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#00796B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="example@gmail.com" 
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
        ) : (
          <View>
            <Text style={styles.title}>Nhập mã OTP</Text>
            <Text style={styles.subtitle}>
              Mã xác thực 6 chữ số đã được gửi đến <Text style={{ fontWeight: 'bold', color: '#00796B' }}>{email}</Text>.
            </Text>

            <Text style={styles.inputLabel}>Mã xác thực OTP (6 chữ số)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={20} color="#00796B" style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { letterSpacing: 3, fontWeight: 'bold' }]} 
                placeholder="123456" 
                value={otp} 
                onChangeText={setOtp} 
                keyboardType="number-pad" 
                maxLength={6} 
              />
            </View>

            <Text style={styles.inputLabel}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#00796B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Nhập mật khẩu mới" 
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry 
              />
            </View>

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#00796B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry 
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, loadingReset && styles.disabledBtn]} 
              onPress={handleResetPassword}
              disabled={loadingReset}
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

            {/* Nút Gửi lại mã có đếm ngược 60s */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  backBtn: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A202C', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#718096', marginBottom: 24, lineHeight: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#2D3748' },
  submitBtn: { backgroundColor: '#00796B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  disabledBtn: { opacity: 0.7, backgroundColor: '#4DB6AC' },
  submitBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  resendText: { fontSize: 14, color: '#718096' },
  resendLink: { fontSize: 14, fontWeight: 'bold', color: '#00796B' },
  resendLinkDisabled: { color: '#A0AEC0', fontWeight: 'normal' }
});

export default ForgotPasswordScreen;

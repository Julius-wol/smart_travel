import React, { useState, useEffect } from 'react';

import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { API_URL } from '../utils/config';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [role, setRole] = useState('USER');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ====== GOOGLE AUTH SETUP ======
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '539925498757-hurvt5soqoln2hd25scofvpk7uh1iug5.apps.googleusercontent.com',
    androidClientId: '539925498757-3ugbbj7ifb1260ljto341lam3ikfm1dm.apps.googleusercontent.com',
    webClientId: '539925498757-3ugbbj7ifb1260ljto341lam3ikfm1dm.apps.googleusercontent.com',
    redirectUri: 'host.exp.Exponent:/oauthredirect',
  });

  useEffect(() => {
    if (request?.url) {
      console.log('=== GOOGLE AUTH URL ===', request.url);
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken || response.params?.access_token;
      if (token) {
        handleGoogleResponse(token);
      } else {
        Alert.alert('Lỗi', 'Không nhận được access token từ Google');
      }
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
      Alert.alert('Lỗi đăng nhập Google', response.error?.message || 'Có lỗi xảy ra');
    }
  }, [response]);

  // Hàm Validate form và test API JWT
  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email hoặc Số điện thoại!');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const loginRes = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emailOrPhone, password })
      });
      
      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        Alert.alert('Đăng nhập thất bại', loginData.message || 'Sai thông tin');
        return;
      }

      const accessToken = loginData.accessToken;

      // GET PROFILE 
      const profileRes = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const profileData = await profileRes.json();

      if (profileRes.ok) {
        // Kiểm tra vai trò tài khoản so với vai trò đang chọn
        const userRole = profileData.role || 'USER';
        if (role === 'HOST' && userRole !== 'HOST') {
          Alert.alert(
            'Lưu ý vai trò',
            'Tài khoản này được đăng ký là "Khách du lịch", không phải "Chủ phòng". Bạn có muốn tiếp tục đăng nhập với tư cách Khách du lịch không?',
            [
              { text: 'Hủy', style: 'cancel' },
              { 
                text: 'Tiếp tục', 
                onPress: () => navigation.replace('Home', { user: profileData, token: accessToken }) 
              }
            ]
          );
          return;
        }

        // Chuyển hướng theo đúng vai trò: HOST -> HostCalendar, USER -> Home (Khách du lịch)
        if (userRole === 'HOST') {
          navigation.replace('HostCalendar', { user: profileData, token: accessToken });
        } else {
          navigation.replace('Home', { user: profileData, token: accessToken });
        }
      } else {
        Alert.alert('Lỗi', 'Không lấy được thông tin User');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến Server Node.js!');
    }
  };

  // ====== XỬ LÝ GOOGLE LOGIN ======
  const handleGoogleResponse = async (accessToken) => {
    setGoogleLoading(true);
    try {
      // Gửi token lên backend để xác thực và lấy JWT
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Lỗi', data.message || 'Đăng nhập Google thất bại');
        return;
      }

      // Lấy thông tin profile
      const profileRes = await fetch(`${API_URL}/user/me`, {
        headers: { 'Authorization': `Bearer ${data.accessToken}` },
      });
      const profileData = await profileRes.json();

      if (profileRes.ok) {
        const userRole = profileData.role || 'USER';
        if (userRole === 'HOST') {
          navigation.replace('HostCalendar', { user: profileData, token: data.accessToken });
        } else {
          navigation.replace('Home', { user: profileData, token: data.accessToken });
        }
      } else {
        Alert.alert('Lỗi', 'Không lấy được thông tin tài khoản');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến Server!');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header - Chào mừng */}
          <View style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
              <Ionicons name="airplane" size={32} color="#00796B" />
              <Text style={styles.logoText}>SmartTravel</Text>
            </View>
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục tối ưu hóa hành trình khám phá hoặc quản lý lưu trú của bạn.
            </Text>
          </View>

          {/* Selector - Chọn Vai trò */}
          <View style={styles.roleSelector}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'USER' && styles.roleButtonActive]}
              onPress={() => setRole('USER')}
            >
              <Ionicons name="compass" size={20} color={role === 'USER' ? '#00796B' : '#666'} />
              <Text style={[styles.roleText, role === 'USER' && styles.roleTextActive]}>Khách du lịch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.roleButton, role === 'HOST' && styles.roleButtonActive]}
              onPress={() => setRole('HOST')}
            >
              <Ionicons name="home" size={20} color={role === 'HOST' ? '#00796B' : '#666'} />
              <Text style={[styles.roleText, role === 'HOST' && styles.roleTextActive]}>Chủ phòng</Text>
            </TouchableOpacity>
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Tên đăng nhập / Email / Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="at-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Nhập tên đăng nhập, email hoặc số điện thoại"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Nhập mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Các tuỳ chọn phụ */}
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={20} color={rememberMe ? "#00796B" : "#888"} />
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Nút Đăng nhập */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {/* Nửa dưới Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={[styles.googleBtn, (googleLoading || !request) && { opacity: 0.7 }]} 
              onPress={() => promptAsync()}
              disabled={googleLoading || !request}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#DB4437" />
              ) : (
                <Ionicons name="logo-google" size={20} color="#DB4437" />
              )}
              <Text style={styles.googleBtnText}>
                {googleLoading ? 'Đang đăng nhập...' : 'Tiếp tục với Google'}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.termsText}>
              Bằng việc đăng nhập, bạn đồng ý với <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và <Text style={styles.termsLink}>Chính sách bảo mật</Text> của Smart Travel.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Nền hơi xám nhạt như ảnh
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  roleText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#718096',
  },
  roleTextActive: {
    color: '#00796B',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#2D3748',
  },
  eyeIcon: {
    padding: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4A5568',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00796B',
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footerContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#A0AEC0',
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 10,
  },
  registerRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#4A5568',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00796B',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 11,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;

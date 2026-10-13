import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';

const RegisterScreen = ({ navigation }) => {
  const [role, setRole] = useState('USER'); // 'USER' hoặc 'HOST'
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Validate email: đúng định dạng và domain hợp lệ (.com, .vn, .net, .org...)
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError('Email không hợp lệ (ví dụ: example@gmail.com)');
      return false;
    }
    // Bắt các lỗi gõ nhầm phổ biến: .con, .cpm, .vom, .cim...
    const commonTyPos = /\.(con|cpm|vom|cim|ocm|coml|comm)$/i;
    if (commonTyPos.test(value)) {
      setEmailError('⚠️ Email có vẻ sai (gõ nhầm đuôi). Ý bạn là .com?');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleRegister = async () => {
    if (!username || !firstName || !lastName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (!validateEmail(email)) {
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, firstName, lastName, email, phone, password, role })
      });
      
      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          'Thành công', 
          'Đăng ký tài khoản thành công!',
          [
            { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }
          ]
        );
      } else {
        Alert.alert('Lỗi đăng ký', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối Server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>Điền thông tin bên dưới để tham gia SmartTravel</Text>

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

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Tên đăng nhập (Username)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="wanderlust99" value={username} onChangeText={setUsername} autoCapitalize="none" />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tên (First Name)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Nguyễn" value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Họ (Last Name)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Văn A" value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <Ionicons name="mail-outline" size={20} color={emailError ? '#E53E3E' : '#888'} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="email@example.com" 
                value={email} 
                onChangeText={(v) => { setEmail(v); validateEmail(v); }} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="0912345678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="••••••••••" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Đang tạo tài khoản...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>Hoàn tất Đăng ký</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 24, paddingTop: 40 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A202C', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#718096', marginBottom: 24 },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 4 },
  inputWrapperError: { borderColor: '#E53E3E', backgroundColor: '#FFF5F5' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#2D3748' },
  eyeIcon: { padding: 4 },
  errorText: { color: '#E53E3E', fontSize: 12, marginBottom: 12, marginTop: 2, marginLeft: 4 },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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
  submitBtn: { backgroundColor: '#00796B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' }
});

export default RegisterScreen;

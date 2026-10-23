import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [registered, setRegistered] = useState(false);

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
    if (loading || registered) return;
    setFormError('');
    const details = {
      username: username.trim(), firstName: firstName.trim(), lastName: lastName.trim(),
      email: email.trim().toLowerCase(), phone: phone.trim(), password, role,
    };
    if (!details.username || !details.firstName || !details.lastName || !details.email || !password) {
      setFormError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (!validateEmail(details.email)) {
      return;
    }
    if (password.length < 6) {
      setFormError('Mật khẩu phải từ 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      
      const data = await res.json();

      if (res.ok) {
        setRegistered(true);
      } else {
        setFormError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error(error);
      setFormError('Không thể kết nối Server. Vui lòng thử lại.');
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

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Tên đăng nhập (Username)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nhập tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tên (First Name)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Nhập tên" value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Họ (Last Name)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Nhập họ" value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <Ionicons name="mail-outline" size={20} color={emailError ? '#E53E3E' : '#888'} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Nhập email"
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
              <TextInput style={styles.input} placeholder="Nhập số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {formError ? <Text accessibilityRole="alert" style={styles.errorText}>{formError}</Text> : null}
            {registered ? <Text accessibilityRole="alert" style={styles.successText}>Đăng ký tài khoản thành công!</Text> : null}

            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={registered ? () => navigation.navigate('Login') : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Đang tạo tài khoản...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>{registered ? 'Đăng nhập ngay' : 'Hoàn tất Đăng ký'}</Text>
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
  successText: { color: '#00796B', fontSize: 14, marginVertical: 12 },
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

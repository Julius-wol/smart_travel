import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ScrollView, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { BASE_URL, API_URL } from '../utils/config';

const ProfileScreen = ({ route, navigation }) => {
  // Nhận thông tin user và token truyền qua từ màn hình Login
  const { user, token } = route.params;

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user.avatar ? `${BASE_URL}${user.avatar}` : null);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ firstName, lastName, phone })
      });
      
      const data = await res.json();

      if (res.ok) {
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
      } else {
        Alert.alert('Lỗi', data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setAvatarUri(selectedImage);
      uploadAvatar(selectedImage);
    }
  };

  const uploadAvatar = (uri) => {
    return new Promise((resolve) => {
      try {
        // Dùng XMLHttpRequest — hỗ trợ multipart/form-data trên mọi phiên bản RN/Expo
        const formData = new FormData();
        formData.append('avatar', {
          uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/user/avatar`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công!');
          } else {
            Alert.alert('Lỗi', data.message || 'Upload thất bại');
          }
          resolve();
        };

        xhr.onerror = () => {
          Alert.alert('Lỗi', 'Không thể tải ảnh lên Server');
          resolve();
        };

        xhr.send(formData);
      } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên Server');
        resolve();
      }
    });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      // Bỏ qua lỗi mạng khi logout
    }
    navigation.replace('Login');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cũ và mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải từ 6 ký tự');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      
      const data = await res.json();

      if (res.ok) {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
      } else {
        Alert.alert('Lỗi', data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              <View style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person-circle-outline" size={100} color="#00796B" />
                )}
                <View style={styles.editIconBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
              <Text style={styles.usernameText}>@{user.username}</Text>
              <View style={[styles.roleBadge, user.role === 'HOST' ? styles.roleBadgeHost : styles.roleBadgeUser]}>
                <Ionicons 
                  name={user.role === 'HOST' ? "home" : "compass"} 
                  size={14} 
                  color={user.role === 'HOST' ? "#C53030" : "#00796B"} 
                />
                <Text style={[styles.roleBadgeText, user.role === 'HOST' ? styles.roleBadgeTextHost : styles.roleBadgeTextUser]}>
                  {user.role === 'HOST' ? 'Chủ phòng (Host)' : 'Khách du lịch (User)'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            
            <View style={styles.rowGroup}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Tên (First Name)</Text>
                <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Họ (Last Name)</Text>
                <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Nhập số điện thoại" />

            <Text style={styles.inputLabel}>Email (Không thể đổi)</Text>
            <TextInput style={[styles.input, { backgroundColor: '#EDF2F7', color: '#A0AEC0' }]} value={user.email} editable={false} />

            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
              <Text style={styles.updateBtnText}>Lưu thay đổi</Text>
              <Ionicons name="save-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {/* Form đổi mật khẩu */}
          <View style={[styles.formContainer, { marginTop: 20, marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
            
            <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.inputInner} 
                value={oldPassword} 
                onChangeText={setOldPassword} 
                secureTextEntry={!showOldPassword}
                placeholder="••••••••" 
                placeholderTextColor="#CBD5E0"
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeIcon}>
                <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#A0AEC0" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.inputInner} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry={!showNewPassword}
                placeholder="••••••••" 
                placeholderTextColor="#CBD5E0"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#A0AEC0" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.updateBtn, { backgroundColor: '#4A5568' }]} onPress={handleChangePassword}>
              <Text style={styles.updateBtnText}>Đổi mật khẩu</Text>
              <Ionicons name="key-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  avatarContainer: { flex: 1, alignItems: 'center' },
  avatarWrapper: { width: 100, height: 100, position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#00796B' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00796B', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  usernameText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginTop: 10 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    gap: 6,
  },
  roleBadgeUser: {
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  roleBadgeHost: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleBadgeTextUser: {
    color: '#00796B',
  },
  roleBadgeTextHost: {
    color: '#C53030',
  },
  logoutBtn: { padding: 8, backgroundColor: '#FED7D7', borderRadius: 8 },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 48, fontSize: 15, color: '#2D3748', marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },
  inputInner: { flex: 1, fontSize: 15, color: '#2D3748', height: '100%' },
  eyeIcon: { padding: 6, marginLeft: 4 },
  rowGroup: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  updateBtn: { flexDirection: 'row', backgroundColor: '#00796B', borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  updateBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' }
});

export default ProfileScreen;

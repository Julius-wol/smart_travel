// ==========================================
// Cấu hình tập trung URL máy chủ Backend
// ==========================================
// KHÔNG CẦN SỬA FILE NÀY KHI ĐỔI MẠNG!
// Expo tự động detect IP máy đang chạy Metro Bundler.
// Chỉ cần đảm bảo điện thoại và máy tính cùng mạng WiFi.

import Constants from 'expo-constants';

import { Platform } from 'react-native';

/**
 * Tự động lấy IP máy tính đang chạy Expo/Metro Bundler.
 * - Trong môi trường web: lấy hostname trình duyệt (localhost hoặc LAN IP)
 * - Trong môi trường mobile: lấy từ hostUri của Expo
 * - Fallback: Android emulator dùng 10.0.2.2, iOS/Web dùng localhost
 */
const getServerIP = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  }

  if (__DEV__) {
    // hostUri có dạng "192.168.x.x:8081" hoặc "localhost:8081"
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants.manifest?.debuggerHost ||
      '';

    const ip = hostUri.split(':')[0];

    if (ip && ip !== 'localhost' && ip !== '') {
      return ip;
    }

    // Fallback nếu chạy trên emulator Android (trỏ về máy host)
    if (Platform.OS === 'android') {
      return '10.0.2.2';
    }
    return 'localhost';
  }

  // ✏️ Production: thay bằng domain server thật của bạn
  return 'your-production-server.com';
};

export const SERVER_PORT = 5000;
export const SERVER_IP = getServerIP();
export const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;
export const API_URL = `${BASE_URL}/api`;

export default {
  SERVER_IP,
  SERVER_PORT,
  BASE_URL,
  API_URL,
};

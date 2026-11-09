// ==========================================
// Cấu hình tập trung URL máy chủ Backend
// ==========================================
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Tự động lấy IP máy tính đang chạy Expo/Metro Bundler.
 * - Web: window.location.hostname
 * - Expo Go / Mobile: trích xuất IP từ hostUri hoặc debuggerHost của Metro
 * - Fallback Android emulator: 10.0.2.2
 * - Fallback thiết bị thật qua mạng LAN: IP máy phát Metro (192.168.1.229)
 */
const getServerIP = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  }

  // 1. Lấy từ hostUri của Expo nếu có (ví dụ: "192.168.1.229:8081")
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    '';

  if (hostUri) {
    let cleanHost = hostUri.split(':')[0];
    if (cleanHost.includes('//')) {
      cleanHost = cleanHost.split('//')[1];
    }
    if (cleanHost && cleanHost !== 'localhost' && cleanHost !== '127.0.0.1') {
      return cleanHost;
    }
  }

  // 2. Fallback nếu chạy trên Android Emulator
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  // 3. Fallback cho thiết bị thật (iOS / Android) kết nối qua mạng WiFi LAN
  return '192.168.1.229';
};

export const SERVER_PORT = 5000;
export const SERVER_IP = getServerIP();

// Trỏ thẳng về Render Production để app điện thoại dùng được ở mọi nơi qua 4G/WiFi
export const BASE_URL = 'https://smart-travel-1cj5.onrender.com';
export const API_URL = `${BASE_URL}/api`;

// Host uploads are stored as paths; native Image needs the backend's full URL.
export const resolveMediaUrl = (uri) => {
  if (typeof uri !== 'string' || !uri.trim()) return undefined;
  const value = uri.trim();
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return value;
  if (value.startsWith('//')) return `${BASE_URL.split(':')[0]}:${value}`;
  return `${BASE_URL}/${value.replace(/^\/+/, '')}`;
};

export default {
  SERVER_IP,
  SERVER_PORT,
  BASE_URL,
  API_URL,
};

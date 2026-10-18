import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động nhận diện IP của máy tính khi chạy qua Expo Go trên điện thoại thật
const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const DEFAULT_HOST = getBaseUrl();

const api = axios.create({
  baseURL: DEFAULT_HOST,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm JWT Bearer Token nếu có
api.interceptors.request.use(
  async (config) => {
    // Có thể bổ sung lấy token từ AsyncStorage hoặc Redux nếu có
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Chuẩn hóa dữ liệu trả về theo format của Hiến pháp
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError = {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.',
      error: error.response?.data?.error || error.message,
      statusCode: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default api;

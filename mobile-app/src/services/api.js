import axios from 'axios';
import { API_URL } from '../utils/config';

const api = axios.create({
  baseURL: API_URL,
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
      code: error.response?.data?.code || null,
      message: error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.',
      error: error.response?.data?.error || error.message,
      statusCode: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default api;

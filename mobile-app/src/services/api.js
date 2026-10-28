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

// Request Interceptor: Tự động chuẩn hóa URL và đính kèm JWT Bearer Token nếu có
api.interceptors.request.use(
  async (config) => {
    // Nếu baseURL đã chứa /api mà config.url lại bắt đầu bằng /api/ -> xóa tiền tố trùng lặp
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    } else if (config.url === '/api') {
      config.url = '/';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Chuẩn hóa dữ liệu trả về theo format
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

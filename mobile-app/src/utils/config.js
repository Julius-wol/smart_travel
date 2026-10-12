// ==========================================
// Cấu hình tập trung IP & URL máy chủ Backend
// ==========================================
// Mẹo: Khi bạn đổi mạng WiFi hoặc người khác trong nhóm chạy code, 
// CHỈ CẦN đổi duy nhất địa chỉ IP ở biến SERVER_IP dưới đây!

// Thay đổi IP này theo IPv4 máy tính chạy Backend của bạn (kiểm tra bằng lệnh ipconfig)
export const SERVER_IP = '192.168.1.229'; 
export const SERVER_PORT = 5000;

export const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;
export const API_URL = `${BASE_URL}/api`;

export default {
  SERVER_IP,
  SERVER_PORT,
  BASE_URL,
  API_URL,
};

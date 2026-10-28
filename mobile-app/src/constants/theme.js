import { Platform } from 'react-native';
/**
 * Design Tokens & Theme - Smart Travel Mobile App
 * Trích xuất 100% từ thiết kế Figma (Node 29:1190)
 */

export const COLORS = {
  // Brand & Primary Colors
  primary: '#00685F',         // Deep Teal - Màu chủ đạo, nút hành động, giá tiền
  primaryDark: '#008378',     // Teal đậm
  primaryLight: '#E6F4F2',    // Nền highlight teal nhạt
  secondary: '#4648D4',       // Indigo - Icon số lượng khách & điểm nhấn
  secondaryLight: '#E5EEFF',  // Nền phân trang, nút xem toàn bộ

  // Text Colors
  textHeading: '#0B1C30',     // Dark Navy - Tiêu đề homestay, input search
  textBody: '#3D4947',        // Medium Grey - Địa chỉ, khoảng cách, nhãn
  textMuted: '#9EABA8',       // Light Grey - Giá gốc gạch ngang
  textLight: '#A5B4CB',       // Divider, placeholder

  // Background Colors
  screenBg: '#F8F9FF',        // Soft Cool Blue-White - Nền toàn màn hình
  cardBg: '#FFFFFF',          // Trắng - Nền thẻ Card homestay, Search Box
  inputBg: '#EFF4FF',         // Soft Light Blue - Nền input, tag tiện ích
  inputBorder: '#D3E4FE',     // Viền ngăn cách giữa các ô input
  filterBtnBg: '#DCE9FF',     // Nền nút icon filter tròn

  // Badges & Accents
  discountBg: '#FEE2E2',      // Nền tag giảm giá
  discountText: '#DC2626',    // Chữ tag giảm giá (-24%)
  aiBadgeBg: '#378166',       // Nền badge AI Đề xuất (xanh lá rêu)
  aiBadgeText: '#F5FFF8',     // Chữ badge AI
  wishlistActive: '#FF3B30',  // Đỏ trái tim khi đã thích
  wishlistInactive: '#0B1C30',// Viền xám đen khi chưa thích
  starGold: '#FFB800',        // Vàng sao đánh giá
  overlayDark: 'rgba(11, 28, 48, 0.65)', // Nền mờ chỉ số ảnh 1/8

  // Calendar Availability Status Tokens (SMART-105 Figma Node 394:1125 / 398:5099)
  calAvailableBg: '#E8FBF4',  // Nền xanh nhạt ngày trống
  calAvailableText: '#00513B',// Chữ xanh đậm ngày trống
  calAvailableDot: '#008378', // Chấm xanh lá
  calBookedBg: '#E1E0FF',     // Nền tím nhạt ngày đã đặt
  calBookedText: '#4648D4',   // Chữ tím ngày đã đặt
  calPendingBg: '#FFF0D4',    // Nền vàng cam chờ duyệt SLA
  calPendingText: '#D97706',  // Chữ vàng cam chờ duyệt SLA
  calBlockedBg: '#FFECEC',    // Nền đỏ hồng ngày khóa/bảo trì
  calBlockedText: '#BA1A1A',  // Chữ đỏ ngày khóa/bảo trì
  calWeekendBg: '#EFF4FF',    // Nền cột cuối tuần (T7, CN)
  calSundayText: '#EA580C',   // Tiêu đề Chủ Nhật đỏ cam
  calPastDayText: '#BCC9C6',  // Chữ ngày quá khứ bị làm mờ
};

// Đồng bộ font chữ hệ thống thống nhất 100% giữa module Host và User (HomeScreen, ProfileScreen, LoginScreen)
// Trên Web: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
// Trên iOS: System
// Trên Android: sans-serif
const SYSTEM_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  default: undefined,
});

const createFontFamilyToken = () => {
  const token = new String(SYSTEM_FONT || '');
  token.regular = SYSTEM_FONT;
  token.medium = SYSTEM_FONT;
  token.semiBold = SYSTEM_FONT;
  token.bold = SYSTEM_FONT;
  token.extraBold = SYSTEM_FONT;
  return token;
};

export const TYPOGRAPHY = {
  fontFamily: createFontFamilyToken(),
  fonts: {
    regular: SYSTEM_FONT,
    medium: SYSTEM_FONT,
    semiBold: SYSTEM_FONT,
    bold: SYSTEM_FONT,
    extraBold: SYSTEM_FONT,
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  sizes: {
    caption: 11,
    bodySmall: 12,
    body: 13,
    bodyLarge: 14,
    title: 16,
    subheading: 18,
    heading: 22,
    display: 26,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  chip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    shadowColor: '#00685F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  BORDER_RADIUS,
};

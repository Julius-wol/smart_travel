import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Component thông báo Toast dạng nổi ở đáy màn hình
 * Hỗ trợ các thông báo: CR_BOOK_01, CR_BOOK_02, CR_BOOK_03, CR_BOOK_04, CR_BOOK_06, CR_BOOK_08
 * 
 * Props:
 * - visible: boolean (ẩn / hiện)
 * - message: string (nội dung thông báo)
 * - type: 'success' | 'info' | 'error'
 * - duration: number (thời gian hiển thị tính bằng milliseconds, mặc định 2500ms)
 * - onHide: callback gọi khi toast tự đóng
 */
const ToastNotification = ({ 
  visible = false, 
  message = '', 
  type = 'info', 
  duration = 2500, 
  onHide 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // Hiệu ứng hiện ra (fade in + trượt nhẹ lên)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Đặt hẹn giờ tự động ẩn đi sau 'duration' ms
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  // Lựa chọn màu sắc và icon theo loại thông báo
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: '#00796B', // Xanh ngọc đậm theo phong cách app
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          bgColor: '#E53E3E', // Đỏ cảnh báo
          icon: 'alert-circle',
        };
      case 'info':
      default:
        return {
          bgColor: '#2D3748', // Xám đen hiện đại
          icon: 'information-circle',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name={config.icon} size={20} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Nằm phía trên Bottom Tab Bar
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 99999,
    elevation: 100, // Bóng đổ Android cao hơn Sticky Bottom Bar
    shadowColor: '#000', // Bóng đổ iOS
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ToastNotification;

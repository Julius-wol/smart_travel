import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';

/**
 * Component Loading Overlay toàn màn hình (CR_BOOK_05)
 * Dùng khi đang submit thanh toán hoặc xử lý đặt phòng
 * 
 * Props:
 * - visible: boolean
 * - message: string (mặc định: "Đang xử lý đặt phòng và xác nhận thanh toán an toàn...")
 */
const LoadingOverlay = ({ 
  visible = false, 
  message = 'Đang xử lý đặt phòng và xác nhận thanh toán an toàn...' 
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#00796B" style={styles.spinner} />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  spinner: {
    marginBottom: 16,
  },
  messageText: {
    fontSize: 15,
    color: '#2D3748',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default LoadingOverlay;

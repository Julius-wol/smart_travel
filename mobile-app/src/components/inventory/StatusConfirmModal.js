import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const StatusConfirmModal = ({
  visible,
  room,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!room) return null;

  const isPublished = room.status === 'Published' || room.status === 'ACTIVE';
  const targetStatus = isPublished ? 'Archived' : 'Published';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Icon */}
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isPublished ? '#FEF3C7' : '#DCFCE7' },
            ]}
          >
            <MaterialCommunityIcons
              name={isPublished ? 'pause-circle-outline' : 'check-circle-outline'}
              size={32}
              color={isPublished ? '#D97706' : '#16A34A'}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isPublished ? 'Tạm dừng hiển thị phòng?' : 'Kích hoạt mở bán phòng?'}
          </Text>

          {/* Room Name Badge */}
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText} numberOfLines={1}>
              {room.title} ({room.code || 'Phòng'})
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {isPublished
              ? 'Phòng sẽ bị ẩn khỏi kết quả tìm kiếm của khách hàng. Các đơn đặt phòng đã xác nhận trước đó vẫn giữ nguyên hiệu lực.'
              : 'Phòng sẽ hiển thị công khai trên ứng dụng để khách hàng tìm kiếm và đặt phòng ngay lập tức.'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: isPublished ? '#D97706' : '#00685F' },
              ]}
              onPress={() => onConfirm(room, targetStatus)}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {isPublished ? 'Xác nhận tạm dừng' : 'Mở bán ngay'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  roomBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    maxWidth: '90%',
  },
  roomBadgeText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#334155',
  },
  description: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
});

export default StatusConfirmModal;

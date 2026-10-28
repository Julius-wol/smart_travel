import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const DeleteConfirmModal = ({
  visible,
  room,
  blockReason = null, // Nếu có chuỗi cảnh báo booking tới
  onClose,
  onConfirmDelete,
  loading = false,
}) => {
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const confirmKeywordRef = React.useRef(confirmKeyword);
  confirmKeywordRef.current = confirmKeyword;

  useEffect(() => {
    if (visible) {
      setConfirmKeyword('');
      confirmKeywordRef.current = '';
    }
  }, [visible]);

  if (!room) return null;

  const isBlocked = !!blockReason || (room.pendingBookingsCount && room.pendingBookingsCount > 0);
  const upperKeyword = (confirmKeyword || confirmKeywordRef.current || '').trim().toUpperCase();
  const isKeywordValid = upperKeyword === 'XÓA' || upperKeyword === 'XOA' || upperKeyword === 'DELETE';

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
              { backgroundColor: isBlocked ? '#FEF3C7' : '#FEE2E2' },
            ]}
          >
            <MaterialCommunityIcons
              name={isBlocked ? 'shield-alert-outline' : 'trash-can-outline'}
              size={32}
              color={isBlocked ? '#D97706' : '#EF4444'}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isBlocked
              ? 'Không thể xóa phòng này!'
              : 'Xác nhận xóa vĩnh viễn phòng?'}
          </Text>

          {/* Room Name Badge */}
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText} numberOfLines={1}>
              {room.title} ({room.code || 'Phòng'})
            </Text>
          </View>

          {isBlocked ? (
            // Trạng thái bị chặn do có đơn đặt phòng sắp tới
            <>
              <View style={styles.warningBox}>
                <MaterialCommunityIcons name="alert" size={20} color="#B45309" />
                <Text style={styles.warningText}>
                  {blockReason ||
                    'Phòng này hiện đang có đơn đặt phòng chưa hoàn thành hoặc trong tương lai. Để bảo vệ quyền lợi của khách hàng và uy tín dịch vụ, hệ thống không cho phép xóa.'}
                </Text>
              </View>
              <Text style={styles.suggestionText}>
                Hệ thống đề xuất bạn nên chuyển sang trạng thái{' '}
                <Text style={{ fontWeight: 'bold' }}>TẠM DỪNG</Text> nếu không muốn nhận thêm khách mới.
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeBtnText}>Đã hiểu</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Trạng thái cho phép xóa với cơ chế gõ XÓA
            <>
              <Text style={styles.description}>
                Hành động này <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>không thể hoàn tác</Text>.
                Toàn bộ dữ liệu, hình ảnh và đánh giá của cơ sở lưu trú này sẽ bị xóa hoàn toàn khỏi hệ thống.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Vui lòng gõ chữ <Text style={styles.keywordHighlight}>XÓA</Text> vào ô dưới đây để xác nhận:
                </Text>
                <TextInput
                  style={styles.keywordInput}
                  placeholder="Gõ 'XÓA'..."
                  placeholderTextColor="#94A3B8"
                  value={confirmKeyword}
                  onChangeText={(val) => {
                    confirmKeywordRef.current = val;
                    setConfirmKeyword(val);
                  }}
                  autoCapitalize="characters"
                />
              </View>

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
                    styles.deleteButton,
                    !isKeywordValid && styles.disabledButton,
                  ]}
                  onPress={() => {
                    const key = (confirmKeyword || confirmKeywordRef.current || '').trim().toUpperCase();
                    if (key === 'XÓA' || key === 'XOA' || key === 'DELETE') {
                      onConfirmDelete(room);
                    }
                  }}
                  activeOpacity={0.8}
                  testID="confirm-delete-btn"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Xóa vĩnh viễn</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
    maxWidth: 440,
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
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  roomBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
    maxWidth: '90%',
  },
  roomBadgeText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#334155',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#92400E',
    lineHeight: 18,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  closeBtn: {
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  keywordHighlight: {
    color: '#EF4444',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
  },
  keywordInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
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
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#64748B',
  },
  deleteButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#FCA5A5',
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeleteConfirmModal;

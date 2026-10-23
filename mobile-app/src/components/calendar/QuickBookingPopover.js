import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const QuickBookingPopover = ({
  visible,
  booking,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
  if (!booking) return null;

  // Lấy 2 chữ cái đầu từ tên
  const getInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.popoverContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 1. Header Popover: SLA Badge, Mã đơn & Nút đóng */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.slaBadge}>
                <Text style={styles.slaBadgeText}>CHỜ DUYỆT SLA</Text>
              </View>
              <Text style={styles.bookingCodeText}>
                {booking.bookingCode || `#BK-${booking.id?.slice(-4)}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textHeading} />
            </TouchableOpacity>
          </View>

          {/* 2. Thông tin khách hàng */}
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(booking.customerName)}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{booking.customerName}</Text>
              <Text style={styles.customerPhone}>
                <Ionicons name="call-outline" size={12} color={COLORS.textBody} /> {booking.phoneNumber || '0912.***.678'}
              </Text>
            </View>
          </View>

          {/* 3. Chi tiết đặt phòng */}
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.detailLabel}>Thời gian:</Text>
              <Text style={styles.detailValue}>
                {booking.nights || 1} đêm nghỉ dưỡng
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-group-outline" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.detailLabel}>Số khách:</Text>
              <Text style={styles.detailValue}>
                {booking.guests || 2} người lớn
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash-multiple" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.detailLabel}>Tổng tiền:</Text>
              <Text style={styles.totalPriceValue}>
                {booking.totalPrice?.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>

          {/* 4. Yêu cầu đặc biệt của khách */}
          {booking.specialRequest ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Yêu cầu của khách:</Text>
              <Text style={styles.noteContent}>"{booking.specialRequest}"</Text>
            </View>
          ) : null}

          {/* 5. Nút Duyệt / Từ chối */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onReject && onReject(booking.id)}
              disabled={loading}
            >
              <Text style={styles.rejectBtnText}>Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-approve-booking"
              style={[styles.approveBtn, loading && { opacity: 0.6 }]}
              onPress={() => onApprove && onApprove(booking.id)}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.approveBtnText}>
                {loading ? 'Đang duyệt...' : '✓ Duyệt đơn'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popoverContainer: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slaBadge: {
    backgroundColor: '#FFF0D4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  bookingCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeading,
  },
  closeBtn: {
    padding: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8FBF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeading,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: COLORS.textBody,
  },
  detailsCard: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textBody,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textHeading,
  },
  totalPriceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  noteBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textBody,
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default QuickBookingPopover;

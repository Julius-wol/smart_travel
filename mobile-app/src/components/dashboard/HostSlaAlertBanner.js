import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

const HostSlaAlertBanner = ({
  slaAlert,
  onNavigateApproval,
}) => {
  if (!slaAlert || !slaAlert.hasPending || slaAlert.pendingCount <= 0) {
    return null;
  }

  const { pendingCount, urgentBookingCode, urgentExpireHours } = slaAlert;

  return (
    <View style={styles.bannerContainer} testID="sla-alert-banner">
      <View style={styles.contentRow}>
        {/* Warning Icon */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="alert-outline" size={20} color="#D97706" />
        </View>

        {/* Text Info */}
        <View style={styles.textCol}>
          <Text style={styles.alertText}>
            Bạn có <Text style={styles.boldText}>{`${pendingCount} đơn chờ duyệt`}</Text>, trong đó 1 đơn ({urgentBookingCode}) sẽ hết hạn sau <Text style={styles.boldText}>{`${urgentExpireHours} giờ`}</Text>.
          </Text>
        </View>

        {/* Action Link */}
        <TouchableOpacity
          testID="btn-navigate-approval"
          style={styles.actionLink}
          onPress={onNavigateApproval}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLinkText}>Chuyển tới Duyệt đơn</Text>
          <Ionicons name="arrow-forward" size={14} color="#D97706" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 220,
  },
  alertText: {
    fontSize: 13,
    color: '#92400E',
    fontFamily: TYPOGRAPHY.fontFamily,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#78350F',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default HostSlaAlertBanner;

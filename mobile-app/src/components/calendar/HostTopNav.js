import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const HostTopNav = ({
  breadcrumb = 'Lịch phòng & Trạng thái trống',
  onBack,
  onMenuPress,
  onProfile,
  user = {
    name: 'Robin Nguyen',
    email: 'robinnguyen@gmail.com',
    initials: 'RN',
  },
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isMobile = width < 768;

  const displayName = user?.name || user?.fullName || 'Robin Nguyen';
  const displayEmail = user?.email || 'robinnguyen@gmail.com';
  const displayInitials =
    user?.initials ||
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'RN';

  return (
    <View style={[styles.topNav, isMobile && styles.mobileTopNav]}>
      {/* 1. Left Nav: Hamburger Menu (Mobile) + Breadcrumb */}
      <View style={styles.leftNavRow}>
        {onMenuPress && (
          <TouchableOpacity style={styles.menuDrawerBtn} onPress={onMenuPress} activeOpacity={0.7}>
            <Ionicons name="menu" size={24} color="#00685F" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.breadcrumbLink} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={17} color="#00685F" style={{ marginRight: 5 }} />
          <Text style={styles.breadcrumbText} numberOfLines={1}>
            {breadcrumb}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Top Right Actions */}
      <View style={styles.rightActions}>
        {/* Language Switcher */}
        <View style={styles.langSwitchPill}>
          <Text style={styles.langActive}>VN</Text>
          <Text style={styles.langDivider}>|</Text>
          <Text style={styles.langInactive}>EN</Text>
        </View>

        {/* Bell Notification */}
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={18} color="#0B1C30" />
          <View style={styles.notifDot} />
        </TouchableOpacity>

        {/* User Profile Badge */}
        <TouchableOpacity
          style={styles.userProfileChip}
          onPress={onProfile}
          activeOpacity={0.8}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{displayInitials}</Text>
          </View>
          {!isMobile && (
            <View style={styles.userInfoCol}>
              <View style={styles.userNameRow}>
                <Text style={styles.userNameText}>{displayName}</Text>
                <Ionicons name="checkmark-circle" size={13} color="#00685F" style={{ marginLeft: 3 }} />
              </View>
              <Text style={styles.userEmailText}>{displayEmail}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileTopNav: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  leftNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  menuDrawerBtn: {
    padding: 4,
    marginRight: 6,
  },
  breadcrumbLink: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#00685F',
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#D3E4FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  langActive: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textHeading,
  },
  langDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  langInactive: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF4FF',
    borderWidth: 1,
    borderColor: '#D3E4FE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  userInfoCol: {
    marginLeft: 8,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeading,
  },
  userEmailText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    color: '#64748B',
  },
});

export default HostTopNav;

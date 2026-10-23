import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const MENU_ITEMS = [
  { id: 'overview', title: 'Tổng quan', icon: 'view-grid-outline' },
  { id: 'rooms', title: 'Quản lý phòng', icon: 'bed-outline' },
  { id: 'bookings', title: 'Đơn đặt phòng', icon: 'calendar-check-outline', badge: 2 },
  { id: 'calendar', title: 'Lịch phòng & Giá', icon: 'calendar-month-outline' },
  { id: 'reviews', title: 'Đánh giá & Phản hồi', icon: 'star-outline' },
  { id: 'revenue', title: 'Doanh thu & Rút tiền', icon: 'cash-multiple' },
  { id: 'settings', title: 'Cài đặt cơ sở lưu trú', icon: 'tune-variant' },
];

const HostSidebar = ({ activeId = 'calendar', onNavigate }) => {
  return (
    <View style={styles.sidebar}>
      {/* 1. Logo Brand Header */}
      <View style={styles.brandContainer}>
        <View style={styles.logoIconBox}>
          <MaterialCommunityIcons name="home-city" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.brandTextCol}>
          <Text style={styles.brandTitle}>Smart Travel</Text>
          <Text style={styles.brandSubtitle}>HOST PORTAL</Text>
        </View>
      </View>

      {/* 2. Menu Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>QUẢN TRỊ CƠ SỞ</Text>
      </View>

      {/* 3. Navigation List */}
      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => {
          const isActive = item.id === activeId;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => onNavigate && onNavigate(item.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={isActive ? '#00685F' : '#64748B'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                {item.title}
              </Text>
              {item.badge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Bottom Help */}
      <View style={styles.bottomHelpContainer}>
        <TouchableOpacity style={styles.bottomHelpBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="help-circle-outline" size={19} color="#64748B" style={styles.menuIcon} />
          <Text style={styles.bottomHelpText}>Trợ giúp & Hỗ trợ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: '100%',
    backgroundColor: '#F0F4FA',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 20,
    paddingHorizontal: 14,
    flexDirection: 'column',
    flex: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  logoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#00685F',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  sectionHeader: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  menuList: {
    gap: 4,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.chip,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  menuTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#4648D4',
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  bottomHelpContainer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bottomHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bottomHelpText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
});

export default HostSidebar;

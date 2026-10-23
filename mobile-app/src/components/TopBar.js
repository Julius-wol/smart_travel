import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

export const TopBar = ({
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  unreadNotifications = 2,
  onLogoPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Logo & Name */}
      <TouchableOpacity
        style={styles.brandRow}
        onPress={onLogoPress}
        activeOpacity={0.8}
      >
        <View style={styles.compassBox}>
          <Ionicons name="compass-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>Smart Travel</Text>
      </TouchableOpacity>

      {/* Action Icons */}
      <View style={styles.actionsRow}>
        {/* Global Search Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={22} color="#0B1C30" />
        </TouchableOpacity>

        {/* Notification Bell with Badge */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#0B1C30" />
          {unreadNotifications > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compassBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#00685F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: '700',
    fontSize: 20,
    color: '#00685F',
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
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
  avatarButton: {
    marginLeft: 2,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00685F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopBar;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const DEFAULT_TODAY = [
  {
    id: 'sc-1',
    bookingCode: '#BK-8821',
    guestName: 'Lê Hoàng Nam',
    initials: 'HN',
    roomName: 'Villa Mộng Mơ H5',
    maskedPhone: '0912.***.678',
    type: 'CHECK_IN',
    time: '14:00',
    statusBadge: '🟢 Check-in 14:00',
    specialNote: '',
  },
  {
    id: 'sc-2',
    bookingCode: '#BK-8815',
    guestName: 'Đỗ Thùy Dung',
    initials: 'TĐ',
    roomName: 'Studio Ban Công',
    maskedPhone: '0988.***.321',
    type: 'CHECK_OUT',
    time: '12:00',
    statusBadge: '🔵 Check-out 12:00',
    specialNote: 'Đã bàn giao chìa khóa',
  },
];

const DEFAULT_TOMORROW = [
  {
    id: 'sc-5',
    bookingCode: '#BK-8840',
    guestName: 'Nguyễn Phương Thảo',
    initials: 'NT',
    roomName: 'Studio Ban Công',
    maskedPhone: '0903.***.112',
    type: 'CHECK_IN',
    time: '14:00',
    statusBadge: '🟢 Check-in 14:00',
    specialNote: 'Check-in tự động Smart Lock',
  },
];

const HostCheckInOutSchedule = ({
  schedule,
  activeTab = 'TODAY',
  onSwitchTab,
}) => {
  const todayList = schedule?.today || DEFAULT_TODAY;
  const tomorrowList = schedule?.tomorrow || DEFAULT_TOMORROW;
  const currentList = activeTab === 'TODAY' ? todayList : tomorrowList;

  const todayCount = schedule?.todayCount || todayList.length;
  const tomorrowCount = schedule?.tomorrowCount || tomorrowList.length;

  return (
    <View style={styles.cardContainer} testID="checkinout-schedule-card">
      {/* 1. Header & Subtext (Figma 3.1) */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.cardTitle}>Lịch Nhận / Trả phòng</Text>
          <Text style={styles.cardSubtitle}>Theo dõi lịch trình đón khách chu đáo</Text>
        </View>

        {/* Tab Switcher: Hôm nay vs Ngày mai */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            testID="schedule-tab-today"
            style={[styles.tabBtn, activeTab === 'TODAY' && styles.tabBtnActive]}
            onPress={() => onSwitchTab && onSwitchTab('TODAY')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'TODAY' && styles.tabBtnTextActive,
              ]}
            >
              Hôm nay ({todayCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="schedule-tab-tomorrow"
            style={[styles.tabBtn, activeTab === 'TOMORROW' && styles.tabBtnActive]}
            onPress={() => onSwitchTab && onSwitchTab('TOMORROW')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'TOMORROW' && styles.tabBtnTextActive,
              ]}
            >
              Ngày mai ({tomorrowCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Guest List Items (Figma 3.2, 3.3) */}
      <View style={styles.listContainer}>
        {currentList.map((item) => {
          const isCheckIn = item.type === 'CHECK_IN';
          return (
            <View key={item.id} style={styles.guestItemRow} testID={`guest-item-${item.id}`}>
              {/* Left Initials Avatar */}
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: isCheckIn ? '#E8FBF4' : '#EFF4FF' },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: isCheckIn ? '#00685F' : '#3B82F6' },
                  ]}
                >
                  {item.initials}
                </Text>
              </View>

              {/* Guest Details */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.guestName}>{item.guestName}</Text>
                  <Text style={styles.bookingCode}>({item.bookingCode})</Text>
                </View>

                <Text style={styles.roomName}>{item.roomName}</Text>

                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.phoneText}>SĐT: {item.maskedPhone}</Text>
                </View>

                {item.specialNote ? (
                  <View style={styles.noteBadge}>
                    <Ionicons name="information-circle-outline" size={12} color="#D97706" style={{ marginRight: 4 }} />
                    <Text style={styles.noteText}>{item.specialNote}</Text>
                  </View>
                ) : null}
              </View>

              {/* Status Badge Pill */}
              <View
                style={[
                  styles.statusPill,
                  isCheckIn ? styles.statusCheckIn : styles.statusCheckOut,
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    isCheckIn ? styles.statusCheckInText : styles.statusCheckOutText,
                  ]}
                >
                  {item.statusBadge}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleCol: {
    flex: 1,
    minWidth: 160,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1C30',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  guestItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  bookingCode: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  roomName: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 11,
    color: '#64748B',
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  noteText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginLeft: 8,
  },
  statusCheckIn: {
    backgroundColor: '#E8FBF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusCheckInText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  statusCheckOut: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusCheckOutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default HostCheckInOutSchedule;

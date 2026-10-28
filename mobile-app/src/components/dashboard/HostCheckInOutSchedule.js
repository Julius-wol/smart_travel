import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const HostCheckInOutSchedule = ({
  schedule,
  activeTab = 'TODAY',
  onSwitchTab,
}) => {
  const todayList = schedule?.today || [];
  const tomorrowList = schedule?.tomorrow || [];
  const currentList = activeTab === 'TODAY' ? todayList : tomorrowList;

  const todayCount = schedule?.todayCount !== undefined ? schedule.todayCount : todayList.length;
  const tomorrowCount = schedule?.tomorrowCount !== undefined ? schedule.tomorrowCount : tomorrowList.length;

  return (
    <View style={styles.cardContainer} testID="checkinout-schedule-card">
      {/* 1. Header & Subtext */}
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

      {/* 2. Guest List Items */}
      <View style={styles.listContainer}>
        {currentList.length === 0 ? (
          <View style={styles.emptyScheduleBox}>
            <Ionicons name="calendar-outline" size={28} color="#94A3B8" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyScheduleText}>
              Không có lịch nhận hoặc trả phòng trong {activeTab === 'TODAY' ? 'hôm nay' : 'ngày mai'}.
            </Text>
          </View>
        ) : (
          currentList.map((item) => {
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
          })
        )}
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
    gap: 12,
    marginBottom: 16,
  },
  titleCol: {
    flex: 1,
    minWidth: 160,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tabBtnTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  guestItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  guestName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  bookingCode: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  roomName: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  noteText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusCheckIn: {
    backgroundColor: '#E8FBF4',
  },
  statusCheckOut: {
    backgroundColor: '#EFF4FF',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  statusCheckInText: {
    color: '#00685F',
  },
  statusCheckOutText: {
    color: '#2563EB',
  },
  emptyScheduleBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyScheduleText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default HostCheckInOutSchedule;

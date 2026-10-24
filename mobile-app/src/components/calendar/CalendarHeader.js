import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const CalendarHeader = ({
  rooms = [],
  selectedRoom,
  onSelectRoom,
  currentMonth = 11,
  currentYear = 2026,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const roomTitle = selectedRoom?.title || 'Villa Mộng Mơ View Hồ & Rừng Thông';
  const roomCode = selectedRoom?.code || '#P-VL204';
  const roomSpecs = selectedRoom?.specs?.bedroom || '4 phòng ngủ';

  return (
    <View style={[styles.cardContainer, !isDesktop && styles.mobileCardContainer]}>
      {/* 1. Bên Trái: Dropdown chọn phòng */}
      <TouchableOpacity
        style={[styles.roomSelector, isDesktop && styles.desktopRoomSelector]}
        onPress={() => setDropdownVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.roomIconWrapper}>
          <MaterialCommunityIcons name="home-city" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.roomInfoCol}>
          <View style={styles.roomTitleRow}>
            <Text style={styles.roomTitleText} numberOfLines={1}>
              {roomTitle}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#00685F" style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.roomSubtext}>
            Mã căn: {roomCode} • {roomSpecs}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 2. Bên Phải: Bộ điều khiển tháng & View mode */}
      <View style={[styles.controlsRight, !isDesktop && styles.mobileControlsRight]}>
        {/* Month Stepper */}
        <View style={styles.monthStepper}>
          <TouchableOpacity style={styles.stepperArrowBtn} onPress={onPrevMonth} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={16} color="#00685F" />
          </TouchableOpacity>

          <Text style={styles.monthTitleText}>
            Tháng {currentMonth}, {currentYear}
          </Text>

          <TouchableOpacity style={styles.stepperArrowBtn} onPress={onNextMonth} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={16} color="#00685F" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRightRow}>
          {/* Nút "Hôm nay" */}
          <TouchableOpacity style={styles.todayBtn} onPress={onToday} activeOpacity={0.7}>
            <Text style={styles.todayBtnText}>Hôm nay</Text>
          </TouchableOpacity>

          {/* Pill "Tháng" Active */}
          <View style={styles.viewModePill}>
            <Text style={styles.viewModeText}>Tháng</Text>
          </View>
        </View>
      </View>

      {/* Modal chọn phòng */}
      {dropdownVisible && (
        <Modal visible={dropdownVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={styles.dropdownModalContent}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Danh sách phòng quản lý</Text>
                <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                  <Ionicons name="close" size={20} color="#1E293B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={rooms}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                  const isSelected = selectedRoom?._id === item._id;
                  return (
                    <TouchableOpacity
                      style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                      onPress={() => {
                        onSelectRoom(item);
                        setDropdownVisible(false);
                      }}
                    >
                      <View style={styles.dropdownItemLeft}>
                        <MaterialCommunityIcons
                          name="home-outline"
                          size={20}
                          color={isSelected ? '#00685F' : '#64748B'}
                        />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected]}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemSubtitle}>
                            {item.code || '#P-VL204'} • {item.pricePerNight?.toLocaleString('vi-VN')} đ/đêm
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#00685F" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginVertical: 12,
  },
  mobileCardContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  roomSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
    ...SHADOWS.card,
  },
  desktopRoomSelector: {
    maxWidth: 440,
  },
  roomIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roomInfoCol: {
    flex: 1,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomTitleText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textHeading,
    letterSpacing: -0.3,
  },
  roomSubtext: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  controlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileControlsRight: {
    width: '100%',
    justifyContent: 'space-between',
  },
  actionsRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 5,
    ...SHADOWS.card,
  },
  stepperArrowBtn: {
    padding: 6,
  },
  monthTitleText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeading,
    paddingHorizontal: 6,
  },
  todayBtn: {
    backgroundColor: '#EFF4FF',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#D3E4FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  todayBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#00685F',
  },
  viewModePill: {
    backgroundColor: '#00685F',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...SHADOWS.chip,
  },
  viewModeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.card,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  dropdownTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeading,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemSelected: {
    backgroundColor: '#E6F4F2',
    borderRadius: 8,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  itemTitleSelected: {
    color: '#00685F',
    fontWeight: '700',
  },
  itemSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
});

export default CalendarHeader;

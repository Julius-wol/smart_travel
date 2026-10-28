import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const ROOM_TYPES = [
  { label: 'Tất cả loại hình', value: 'ALL' },
  { label: 'Villa', value: 'Villa' },
  { label: 'Homestay', value: 'Homestay' },
  { label: 'Resort', value: 'Resort' },
  { label: 'Căn hộ (Apartment)', value: 'Apartment' },
  { label: 'Khách sạn (Hotel)', value: 'Hotel' },
];

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đang mở bán', value: 'Published' },
  { label: 'Tạm dừng', value: 'Archived' },
  { label: 'Bản nháp', value: 'Draft' },
];

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Giá: Thấp đến cao', value: 'price_asc' },
  { label: 'Giá: Cao đến thấp', value: 'price_desc' },
];

const InventoryFilterBar = ({
  search = '',
  roomType = 'ALL',
  status = 'ALL',
  sort = 'newest',
  onSearchChange,
  onSearchSubmit,
  onRoomTypeChange,
  onStatusChange,
  onSortChange,
  onResetFilters,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [activeDropdown, setActiveDropdown] = useState(null); // 'roomType' | 'status' | 'sort' | null

  const getDropdownLabel = (type, val) => {
    if (type === 'roomType') {
      return ROOM_TYPES.find((t) => t.value === val)?.label || 'Loại hình';
    }
    if (type === 'status') {
      return STATUS_OPTIONS.find((s) => s.value === val)?.label || 'Trạng thái';
    }
    if (type === 'sort') {
      return SORT_OPTIONS.find((s) => s.value === val)?.label || 'Sắp xếp';
    }
    return '';
  };

  const getOptionsList = () => {
    if (activeDropdown === 'roomType') return ROOM_TYPES;
    if (activeDropdown === 'status') return STATUS_OPTIONS;
    if (activeDropdown === 'sort') return SORT_OPTIONS;
    return [];
  };

  const handleSelectOption = (item) => {
    if (activeDropdown === 'roomType') onRoomTypeChange(item.value);
    if (activeDropdown === 'status') onStatusChange(item.value);
    if (activeDropdown === 'sort') onSortChange(item.value);
    setActiveDropdown(null);
  };

  return (
    <View style={[styles.container, isDesktop ? styles.desktopContainer : styles.mobileContainer]}>
      {/* Search Input */}
      <View style={[styles.searchBox, isDesktop ? styles.desktopSearch : styles.mobileSearch]}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên phòng hoặc mã phòng..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={onSearchChange}
          onSubmitEditing={(e) => onSearchSubmit && onSearchSubmit(e?.nativeEvent?.text !== undefined ? e.nativeEvent.text : search)}
          returnKeyType="search"
          testID="inventory-search-input"
        />
        {search?.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Filters */}
      <View style={[styles.dropdownRow, isDesktop ? styles.desktopDropdownRow : styles.mobileDropdownRow]}>
        {/* Dropdown Loại phòng */}
        <TouchableOpacity
          style={[styles.dropdownBtn, roomType !== 'ALL' && styles.activeDropdownBtn]}
          onPress={() => setActiveDropdown('roomType')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.dropdownBtnText, roomType !== 'ALL' && styles.activeDropdownBtnText]}
            numberOfLines={1}
          >
            {getDropdownLabel('roomType', roomType)}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={roomType !== 'ALL' ? '#00685F' : '#64748B'} />
        </TouchableOpacity>

        {/* Dropdown Trạng thái */}
        <TouchableOpacity
          style={[styles.dropdownBtn, status !== 'ALL' && styles.activeDropdownBtn]}
          onPress={() => setActiveDropdown('status')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.dropdownBtnText, status !== 'ALL' && styles.activeDropdownBtnText]}
            numberOfLines={1}
          >
            {getDropdownLabel('status', status)}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={status !== 'ALL' ? '#00685F' : '#64748B'} />
        </TouchableOpacity>

        {/* Dropdown Sắp xếp */}
        <TouchableOpacity
          style={[styles.dropdownBtn, sort !== 'newest' && styles.activeDropdownBtn]}
          onPress={() => setActiveDropdown('sort')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.dropdownBtnText, sort !== 'newest' && styles.activeDropdownBtnText]}
            numberOfLines={1}
          >
            {getDropdownLabel('sort', sort)}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={sort !== 'newest' ? '#00685F' : '#64748B'} />
        </TouchableOpacity>

        {/* Nút đặt lại bộ lọc */}
        {(search || roomType !== 'ALL' || status !== 'ALL' || sort !== 'newest') && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={onResetFilters}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={16} color="#64748B" />
            <Text style={styles.resetBtnText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Dropdown Selection */}
      <Modal
        visible={!!activeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeDropdown === 'roomType'
                  ? 'Chọn loại hình'
                  : activeDropdown === 'status'
                  ? 'Chọn trạng thái'
                  : 'Sắp xếp theo'}
              </Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getOptionsList()}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected =
                  (activeDropdown === 'roomType' && roomType === item.value) ||
                  (activeDropdown === 'status' && status === item.value) ||
                  (activeDropdown === 'sort' && sort === item.value);

                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                    onPress={() => handleSelectOption(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={18} color="#00685F" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  desktopSearch: {
    flex: 2,
  },
  mobileSearch: {
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  desktopDropdownRow: {
    flex: 3,
    justifyContent: 'flex-end',
  },
  mobileDropdownRow: {
    width: '100%',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    gap: 6,
  },
  activeDropdownBtn: {
    borderColor: '#00685F',
    backgroundColor: '#E6F5F3',
  },
  dropdownBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#334155',
  },
  activeDropdownBtnText: {
    color: '#00685F',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 42,
  },
  resetBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#64748B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 360,
    maxHeight: 400,
    padding: 16,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#0F172A',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedOptionItem: {
    backgroundColor: '#E6F5F3',
  },
  optionText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#334155',
  },
  selectedOptionText: {
    color: '#00685F',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
  },
});

export default InventoryFilterBar;

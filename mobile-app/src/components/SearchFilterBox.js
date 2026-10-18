import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../constants/theme';

export const SearchFilterBox = ({
  city = 'Đà Nẵng, Sơn Trà',
  onCityChange,
  dateRangeText = '15 Th05 – 18 Th05',
  nightsText = '3 đêm',
  onDatePress,
  guestRoomText = '2 khách • 1 phòng',
  onGuestPress,
  onFilterPress,
  activeFilterCount = 0,
}) => {
  const [localCity, setLocalCity] = useState(city);

  // Đồng bộ khi prop city bên ngoài thay đổi (Reset filter, đổi chip)
  useEffect(() => {
    setLocalCity(city || '');
  }, [city]);

  // Xử lý debounce khi người dùng gõ
  const handleTextChange = (text) => {
    setLocalCity(text);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCity !== city) {
        onCityChange && onCityChange(localCity);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localCity, city, onCityChange]);

  const handleClear = () => {
    setLocalCity('');
    onCityChange && onCityChange('');
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. Main Search Row */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color="#00685F" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={localCity}
          onChangeText={handleTextChange}
          placeholder="Đà Nẵng, Sơn Trà"
          placeholderTextColor="#64748B"
          returnKeyType="search"
          onSubmitEditing={() => onCityChange && onCityChange(localCity)}
          autoCorrect={false}
        />
        {localCity ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
          <Ionicons name="mic-outline" size={19} color="#3D4947" />
        </TouchableOpacity>
      </View>

      {/* 2. Dates & Guests Micro Bar */}
      <View style={styles.microBar}>
        {/* Date Selector Button */}
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={onDatePress}
          activeOpacity={0.7}
        >
          <View style={styles.calendarIconBox}>
            <Ionicons name="calendar-outline" size={16} color="#00685F" />
          </View>
          <View style={styles.dateTextGroup}>
            <Text style={styles.dateText} numberOfLines={1}>
              {dateRangeText}
            </Text>
            <Text style={styles.nightsText} numberOfLines={1}>
              {nightsText}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Guests & Room Button */}
        <TouchableOpacity
          style={styles.guestSelector}
          onPress={onGuestPress}
          activeOpacity={0.7}
        >
          <View style={styles.guestIconBox}>
            <Ionicons name="people-outline" size={16} color="#4648D4" />
          </View>
          <Text style={styles.guestText} numberOfLines={1} ellipsizeMode="tail">
            {guestRoomText}
          </Text>
        </TouchableOpacity>

        {/* Filter Adjust Button */}
        <TouchableOpacity
          style={[
            styles.filterAdjustBtn,
            activeFilterCount > 0 && styles.filterAdjustBtnActive,
          ]}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilterCount > 0 ? '#FFFFFF' : '#00685F'}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: TYPOGRAPHY.fontFamily,
    color: '#0B1C30',
    fontWeight: '500',
    paddingVertical: 4,
  },
  clearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  dateSelector: {
    flex: 1.05,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
  },
  calendarIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E6F4F2',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  dateTextGroup: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  dateText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: '700',
    fontSize: 12.5,
    color: '#0B1C30',
  },
  nightsText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    flexShrink: 0,
  },
  guestSelector: {
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
  },
  guestIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  guestText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: '700',
    fontSize: 12.5,
    color: '#0B1C30',
    minWidth: 0,
  },
  filterAdjustBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCE9FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 8,
    flexShrink: 0,
  },
  filterAdjustBtnActive: {
    backgroundColor: '#00685F',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#BA1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SearchFilterBox;

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
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={17} color="#00685F" />
          </View>
          <View style={styles.dateTextGroup}>
            <Text style={styles.dateText}>{dateRangeText}</Text>
            <Text style={styles.nightsText}>{nightsText}</Text>
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
          <View style={styles.iconBox}>
            <Ionicons name="people-outline" size={17} color="#4648D4" />
          </View>
          <Text style={styles.guestText}>{guestRoomText}</Text>
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
    padding: 10,
    marginHorizontal: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
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
    marginRight: 2,
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
    paddingHorizontal: 2,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.15,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#E5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextGroup: {
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: '700',
    fontSize: 13,
    color: '#0B1C30',
  },
  nightsText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11.5,
    color: '#3D4947',
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D3E4FE',
    marginHorizontal: 6,
  },
  guestSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.25,
  },
  guestText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: '700',
    fontSize: 13,
    color: '#0B1C30',
  },
  filterAdjustBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCE9FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 4,
  },
  filterAdjustBtnActive: {
    backgroundColor: '#00685F',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#BA1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default SearchFilterBox;

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const POPULAR_LOCATIONS = [
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
  { name: 'Phú Quốc', lat: 10.2899, lng: 103.9840 },
  { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583 },
  { name: 'Hội An', lat: 15.8801, lng: 108.3380 },
  { name: 'Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
];

const LocationPickerModal = ({
  visible,
  currentCoordinates = { lat: 16.0544, lng: 108.2022 },
  onClose,
  onSaveCoordinates,
}) => {
  const [lat, setLat] = useState(String(currentCoordinates?.lat || 16.0544));
  const [lng, setLng] = useState(String(currentCoordinates?.lng || 108.2022));

  const handleApplyPreset = (preset) => {
    setLat(String(preset.lat));
    setLng(String(preset.lng));
  };

  const handleSave = () => {
    const latNum = parseFloat(lat) || 16.0544;
    const lngNum = parseFloat(lng) || 108.2022;
    onSaveCoordinates({ lat: latNum, lng: lngNum });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={22} color="#00685F" />
              <Text style={styles.title}>Định vị GPS cơ sở lưu trú</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Map Preview Placeholder */}
          <View style={styles.mapPreviewBox}>
            <MaterialCommunityIcons name="map" size={48} color="#94A3B8" />
            <Text style={styles.mapCoordsText}>
              Vĩ độ (Lat): {lat} • Kinh độ (Lng): {lng}
            </Text>
            <View style={styles.pinMarker}>
              <MaterialCommunityIcons name="map-marker" size={28} color="#EF4444" />
            </View>
          </View>

          {/* Presets */}
          <Text style={styles.sectionLabel}>Điểm đến phổ biến:</Text>
          <View style={styles.presetRow}>
            {POPULAR_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.name}
                style={styles.presetChip}
                onPress={() => handleApplyPreset(loc)}
              >
                <Text style={styles.presetChipText}>{loc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Coordinate Inputs */}
          <View style={styles.coordInputsRow}>
            <View style={styles.coordCol}>
              <Text style={styles.inputLabel}>Vĩ độ (Latitude):</Text>
              <TextInput
                style={styles.textInput}
                value={lat}
                onChangeText={setLat}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordCol}>
              <Text style={styles.inputLabel}>Kinh độ (Longitude):</Text>
              <TextInput
                style={styles.textInput}
                value={lng}
                onChangeText={setLng}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu vị trí GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    padding: 20,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
  },
  mapPreviewBox: {
    height: 140,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  mapCoordsText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#64748B',
    marginTop: 6,
  },
  pinMarker: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -14,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#475569',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#E6F5F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99D5CF',
  },
  presetChipText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#00685F',
  },
  coordInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  coordCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#334155',
    marginBottom: 4,
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
});

export default LocationPickerModal;

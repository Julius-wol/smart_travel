import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SHADOWS } from '../../constants/theme';

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
];

const RoomImageUploader = ({
  images = [],
  onChangeImages,
  minPhotos = 3,
  maxPhotos = 15,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const handleAddImage = (url) => {
    if (!url || images.length >= maxPhotos) return;
    onChangeImages([...images, url]);
    setInputUrl('');
    setModalVisible(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChangeImages(updated);
  };

  const handleSetCover = (indexToPromote) => {
    if (indexToPromote === 0) return;
    const coverItem = images[indexToPromote];
    const rest = images.filter((_, idx) => idx !== indexToPromote);
    onChangeImages([coverItem, ...rest]);
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Album hình ảnh phòng</Text>
          <Text style={styles.subtitle}>
            Tải lên từ {minPhotos} đến {maxPhotos} hình ảnh chất lượng cao. Ảnh đầu tiên sẽ là ảnh đại diện.
          </Text>
        </View>
        <View style={styles.counterBadge}>
          <Text
            style={[
              styles.counterText,
              images.length < minPhotos && styles.counterWarning,
            ]}
          >
            {images.length} / {maxPhotos} ảnh
          </Text>
        </View>
      </View>

      {/* Warning if under minPhotos */}
      {images.length < minPhotos && (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#B45309" />
          <Text style={styles.warningText}>
            Cần tối thiểu {minPhotos} hình ảnh để phòng được duyệt hiển thị mở bán. Hiện tại còn thiếu {minPhotos - images.length} ảnh.
          </Text>
        </View>
      )}

      {/* Image Grid */}
      <View style={styles.gridContainer}>
        {images.map((imgUrl, index) => {
          const isCover = index === 0;
          return (
            <View key={index} style={styles.photoCard}>
              <Image source={{ uri: imgUrl }} style={styles.photoThumbnail} />

              {/* Cover Badge */}
              {isCover ? (
                <View style={styles.coverBadge}>
                  <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.coverBadgeText}>Ảnh đại diện</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.setCoverBtn}
                  onPress={() => handleSetCover(index)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="star-outline" size={12} color="#00685F" />
                  <Text style={styles.setCoverText}>Đặt làm bìa</Text>
                </TouchableOpacity>
              )}

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deletePhotoBtn}
                onPress={() => handleRemoveImage(index)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add Photo Button */}
        {images.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addPhotoCard}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.addIconCircle}>
              <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#00685F" />
            </View>
            <Text style={styles.addPhotoText}>Thêm hình ảnh</Text>
            <Text style={styles.addPhotoSub}>Chọn mẫu hoặc dán URL</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Add Photo */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm hình ảnh mới</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Custom URL Input */}
            <Text style={styles.inputLabel}>Nhập URL ảnh trực tiếp:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#94A3B8"
                value={inputUrl}
                onChangeText={setInputUrl}
              />
              <TouchableOpacity
                style={styles.confirmUrlBtn}
                onPress={() => handleAddImage(inputUrl.trim())}
                disabled={!inputUrl.trim()}
              >
                <Text style={styles.confirmUrlText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Hoặc chọn ảnh mẫu có sẵn:</Text>
            <View style={styles.presetGrid}>
              {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetItem}
                  onPress={() => handleAddImage(preset)}
                >
                  <Image source={{ uri: preset }} style={styles.presetImage} />
                  <View style={styles.presetOverlay}>
                    <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#64748B',
    maxWidth: 480,
  },
  counterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#00685F',
  },
  counterWarning: {
    color: '#D97706',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#92400E',
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    position: 'relative',
    width: 130,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#00685F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  coverBadgeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  setCoverBtn: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  setCoverText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#00685F',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoCard: {
    width: 130,
    height: 100,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: '#00685F',
  },
  addPhotoSub: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 480,
    padding: 20,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  confirmUrlBtn: {
    backgroundColor: '#00685F',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmUrlText: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 13,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetItem: {
    position: 'relative',
    width: 100,
    height: 70,
    borderRadius: 6,
    overflow: 'hidden',
  },
  presetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  presetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 104, 95, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RoomImageUploader;

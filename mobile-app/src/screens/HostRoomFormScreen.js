import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  fetchRoomDetail,
  saveRoom,
  resetCurrentRoom,
} from '../store/slices/hostRoomInventorySlice';
import HostTopNav from '../components/calendar/HostTopNav';
import SuperhostScoreCard from '../components/inventory/SuperhostScoreCard';
import RoomImageUploader from '../components/inventory/RoomImageUploader';
import LocationPickerModal from '../components/inventory/LocationPickerModal';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

const AVAILABLE_AMENITIES = [
  { id: 'wifi', name: 'Wifi tốc độ cao', icon: 'wifi' },
  { id: 'pool', name: 'Hồ bơi riêng', icon: 'pool' },
  { id: 'kitchen', name: 'Bếp nấu đầy đủ dụng cụ', icon: 'silverware-fork-knife' },
  { id: 'ac', name: 'Điều hòa nhiệt độ', icon: 'air-conditioner' },
  { id: 'tv', name: 'Smart TV 4K', icon: 'television' },
  { id: 'balcony', name: 'Ban công view biển/núi', icon: 'balcony' },
  { id: 'bbq', name: 'Bếp nướng BBQ sân vườn', icon: 'grill' },
  { id: 'tub', name: 'Bồn tắm nước nóng', icon: 'bathtub-outline' },
  { id: 'washer', name: 'Máy giặt & Bàn là', icon: 'washing-machine' },
  { id: 'parking', name: 'Chỗ đỗ ô tô miễn phí', icon: 'car' },
  { id: 'breakfast', name: 'Bữa sáng theo yêu cầu', icon: 'food-croissant' },
  { id: 'pet', name: 'Cho phép mang thú cưng', icon: 'paw' },
];

const PROVINCES = [
  'Đà Nẵng',
  'Khánh Hòa (Nha Trang)',
  'Lâm Đồng (Đà Lạt)',
  'Kiên Giang (Phú Quốc)',
  'Quảng Nam (Hội An)',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Bà Rịa - Vũng Tàu',
  'Bình Thuận (Phan Thiết)',
  'Thừa Thiên Huế',
  'Quảng Ninh (Hạ Long)',
];

const ROOM_TYPES = ['Villa', 'Homestay', 'Resort', 'Apartment', 'Hotel'];

const HostRoomFormScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const mode = route.params?.mode || 'create';
  const roomId = route.params?.roomId;

  const { currentRoom, detailLoading, actionLoading } = useSelector(
    (state) => state.hostRoomInventory
  );

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    roomType: 'Villa',
    maxGuests: 4,
    bedroomCount: 2,
    bedCount: 2,
    area: 85,
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    address: '',
    coordinates: { lat: 16.0544, lng: 108.2022 },
    pricePerNight: 2500000,
    weekendPricePerNight: 2800000,
    description: '',
    cancellationPolicy48h: true,
    amenities: ['wifi', 'pool', 'kitchen', 'ac', 'tv', 'balcony'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    ],
  });

  const [formErrors, setFormErrors] = useState({});
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [provincePickerVisible, setProvincePickerVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Fetch room detail if in edit mode
  useEffect(() => {
    if (mode === 'edit' && roomId) {
      dispatch(fetchRoomDetail(roomId));
    } else {
      dispatch(resetCurrentRoom());
    }
  }, [mode, roomId, dispatch]);

  // Sync current room into formData
  useEffect(() => {
    if (currentRoom && mode === 'edit') {
      setFormData({
        title: currentRoom.title || '',
        roomType: currentRoom.roomType || 'Villa',
        maxGuests: currentRoom.maxGuests || 4,
        bedroomCount: currentRoom.specs?.bedroomCount || currentRoom.bedroomCount || 2,
        bedCount: currentRoom.specs?.bedCount || currentRoom.bedCount || 2,
        area: currentRoom.specs?.area || currentRoom.area || 85,
        city: currentRoom.city || 'Đà Nẵng',
        district: currentRoom.district || '',
        address: currentRoom.address || '',
        coordinates: currentRoom.coordinates || { lat: 16.0544, lng: 108.2022 },
        pricePerNight: currentRoom.pricePerNight || 0,
        weekendPricePerNight: currentRoom.weekendPricePerNight || 0,
        description: currentRoom.description || '',
        cancellationPolicy48h: currentRoom.cancellationPolicy48h !== false,
        amenities: currentRoom.amenities || [],
        images: currentRoom.images && currentRoom.images.length > 0 ? currentRoom.images : [],
      });
    }
  }, [currentRoom, mode]);

  // Auto-save timer (every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastAutoSaveTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Update Field Helper
  const updateField = (field, value) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Toggle Amenity Helper
  const toggleAmenity = (amenityId) => {
    const exists = formDataRef.current.amenities.includes(amenityId);
    const updated = exists
      ? formDataRef.current.amenities.filter((id) => id !== amenityId)
      : [...formDataRef.current.amenities, amenityId];
    formDataRef.current = { ...formDataRef.current, amenities: updated };
    setFormData((prev) => ({ ...prev, amenities: updated }));
  };

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Validate form
  const validateForm = (data = formDataRef.current) => {
    const errors = {};
    if (!data.title || data.title.trim().length < 10) {
      errors.title = 'Tên phòng phải có độ dài từ 10 đến 150 ký tự';
    }
    if (!data.address || !data.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ cơ sở lưu trú';
    }
    if (!data.pricePerNight || Number(data.pricePerNight) < 50000) {
      errors.pricePerNight = 'Giá niêm yết tối thiểu là 50.000 đ/đêm';
    }
    if (!data.images || data.images.length < 3) {
      errors.images = 'Cần tải lên tối thiểu 3 hình ảnh';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save room handler
  const handleSave = async (targetStatus = 'Published') => {
    const dataToSave = formDataRef.current;
    if (targetStatus === 'Published' && !validateForm(dataToSave)) {
      Alert.alert('Thiếu thông tin', 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.');
      return;
    }

    const payload = {
      ...dataToSave,
      status: targetStatus,
      pricePerNight: Number(dataToSave.pricePerNight),
      weekendPricePerNight: Number(dataToSave.weekendPricePerNight || dataToSave.pricePerNight),
      specs: {
        bedroomCount: Number(dataToSave.bedroomCount),
        bedCount: Number(dataToSave.bedCount),
        area: Number(dataToSave.area),
      },
    };

    const res = await dispatch(
      saveRoom({
        id: mode === 'edit' ? roomId : null,
        roomData: payload,
      })
    );

    if (res.meta.requestStatus === 'fulfilled') {
      Alert.alert(
        'Thành công',
        targetStatus === 'Published'
          ? 'Đã lưu và xuất bản phòng thành công!'
          : 'Đã lưu bản nháp thành công!',
        [{ text: 'Đóng', onPress: () => navigation.navigate('HostRoomInventory') }]
      );
    } else {
      Alert.alert('Thất bại', res.payload?.message || 'Có lỗi xảy ra khi lưu phòng');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TopNav */}
      <HostTopNav
        breadcrumb={`Quản lý phòng • ${mode === 'edit' ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}`}
      />

      {detailLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00685F" />
          <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
        </View>
      ) : (
        <View style={styles.contentLayout}>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Title */}
            <View style={styles.headerBox}>
              <View>
                <Text style={styles.pageTitle}>
                  {mode === 'edit' ? 'Chỉnh sửa cơ sở lưu trú' : 'Thêm cơ sở lưu trú mới'}
                </Text>
                <Text style={styles.pageSubtitle}>
                  Điền đầy đủ thông tin để thu hút khách du lịch và đạt chuẩn đối tác Superhost.
                </Text>
              </View>
              {mode === 'edit' && currentRoom?.code && (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{currentRoom.code}</Text>
                </View>
              )}
            </View>

            {/* Layout Columns */}
            <View style={[styles.mainColsRow, !isDesktop && styles.mobileColsRow]}>
              {/* LEFT COLUMN: 5 FORM SECTIONS */}
              <View style={styles.leftFormCol}>
                {/* SECTION 1: THÔNG TIN CƠ BẢN */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconCircle}>
                      <MaterialCommunityIcons name="information-outline" size={18} color="#00685F" />
                    </View>
                    <Text style={styles.sectionTitle}>1. Thông tin cơ bản</Text>
                  </View>

                  {/* Tên phòng */}
                  <View style={styles.formGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>
                        Tên phòng / Villa / Homestay <Text style={styles.requiredMark}>*</Text>
                      </Text>
                      <Text style={styles.counterHint}>
                        {formData.title.length} / 150 ký tự
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.textInput, formErrors.title && styles.inputError]}
                      placeholder="VD: Ocean View Luxury Villa Sơn Trà..."
                      placeholderTextColor="#94A3B8"
                      value={formData.title}
                      onChangeText={(val) => updateField('title', val)}
                      maxLength={150}
                    />
                    {formErrors.title && (
                      <Text style={styles.errorText}>{formErrors.title}</Text>
                    )}
                  </View>

                  {/* Loại phòng */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      Loại hình cơ sở lưu trú <Text style={styles.requiredMark}>*</Text>
                    </Text>
                    <View style={styles.pillSelectorRow}>
                      {ROOM_TYPES.map((type) => {
                        const isSelected = formData.roomType === type;
                        return (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.typePill,
                              isSelected && styles.typePillActive,
                            ]}
                            onPress={() => updateField('roomType', type)}
                          >
                            <Text
                              style={[
                                styles.typePillText,
                                isSelected && styles.typePillTextActive,
                              ]}
                            >
                              {type}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Steppers: Sức chứa, Phòng ngủ, Giường, Diện tích */}
                  <View style={styles.steppersGrid}>
                    {/* Sức chứa */}
                    <View style={styles.stepperItem}>
                      <Text style={styles.stepperLabel}>Sức chứa khách</Text>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() =>
                            updateField('maxGuests', Math.max(1, formData.maxGuests - 1))
                          }
                        >
                          <MaterialCommunityIcons name="minus" size={16} color="#334155" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{formData.maxGuests}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateField('maxGuests', formData.maxGuests + 1)}
                        >
                          <MaterialCommunityIcons name="plus" size={16} color="#334155" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Phòng ngủ */}
                    <View style={styles.stepperItem}>
                      <Text style={styles.stepperLabel}>Phòng ngủ</Text>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() =>
                            updateField('bedroomCount', Math.max(1, formData.bedroomCount - 1))
                          }
                        >
                          <MaterialCommunityIcons name="minus" size={16} color="#334155" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{formData.bedroomCount}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() =>
                            updateField('bedroomCount', formData.bedroomCount + 1)
                          }
                        >
                          <MaterialCommunityIcons name="plus" size={16} color="#334155" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Số giường */}
                    <View style={styles.stepperItem}>
                      <Text style={styles.stepperLabel}>Số giường ngủ</Text>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() =>
                            updateField('bedCount', Math.max(1, formData.bedCount - 1))
                          }
                        >
                          <MaterialCommunityIcons name="minus" size={16} color="#334155" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{formData.bedCount}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateField('bedCount', formData.bedCount + 1)}
                        >
                          <MaterialCommunityIcons name="plus" size={16} color="#334155" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Diện tích */}
                    <View style={styles.stepperItem}>
                      <Text style={styles.stepperLabel}>Diện tích (m²)</Text>
                      <TextInput
                        style={styles.areaInput}
                        value={String(formData.area)}
                        onChangeText={(val) => updateField('area', Number(val) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* SECTION 2: ĐỊA CHỈ & TỌA ĐỘ GPS */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconCircle}>
                      <MaterialCommunityIcons name="map-marker-outline" size={18} color="#00685F" />
                    </View>
                    <Text style={styles.sectionTitle}>2. Địa chỉ & Vị trí tọa độ</Text>
                  </View>

                  <View style={styles.twoColsRow}>
                    {/* Tỉnh / Thành */}
                    <View style={styles.halfCol}>
                      <Text style={styles.inputLabel}>Tỉnh / Thành phố</Text>
                      <TouchableOpacity
                        style={styles.pickerSelector}
                        onPress={() => setProvincePickerVisible(true)}
                      >
                        <Text style={styles.pickerText}>{formData.city}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={18} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    {/* Quận / Huyện */}
                    <View style={styles.halfCol}>
                      <Text style={styles.inputLabel}>Quận / Huyện</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="VD: Sơn Trà, Ngũ Hành Sơn..."
                        placeholderTextColor="#94A3B8"
                        value={formData.district}
                        onChangeText={(val) => updateField('district', val)}
                      />
                    </View>
                  </View>

                  {/* Địa chỉ chi tiết */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      Địa chỉ cụ thể (Số nhà, đường...) <Text style={styles.requiredMark}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.textInput, formErrors.address && styles.inputError]}
                      placeholder="VD: 120 Võ Nguyên Giáp, Phước Mỹ..."
                      placeholderTextColor="#94A3B8"
                      value={formData.address}
                      onChangeText={(val) => updateField('address', val)}
                    />
                    {formErrors.address && (
                      <Text style={styles.errorText}>{formErrors.address}</Text>
                    )}
                  </View>

                  {/* Định vị GPS Map Button */}
                  <TouchableOpacity
                    style={styles.gpsLocationBtn}
                    onPress={() => setLocationModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#00685F" />
                    <Text style={styles.gpsLocationText}>
                      Định vị GPS: {formData.coordinates.lat.toFixed(4)},{' '}
                      {formData.coordinates.lng.toFixed(4)} (Chạm để chỉnh sửa)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SECTION 3: ĐƠN GIÁ & MÔ TẢ */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconCircle}>
                      <MaterialCommunityIcons name="cash-multiple" size={18} color="#00685F" />
                    </View>
                    <Text style={styles.sectionTitle}>3. Đơn giá & Mô tả</Text>
                  </View>

                  <View style={styles.twoColsRow}>
                    {/* Giá ngày thường */}
                    <View style={styles.halfCol}>
                      <Text style={styles.inputLabel}>
                        Giá ngày thường / đêm (VND) <Text style={styles.requiredMark}>*</Text>
                      </Text>
                      <TextInput
                        style={[styles.textInput, formErrors.pricePerNight && styles.inputError]}
                        value={String(formData.pricePerNight)}
                        onChangeText={(val) => updateField('pricePerNight', val)}
                        keyboardType="numeric"
                        placeholder="VD: 2500000"
                      />
                      {formErrors.pricePerNight && (
                        <Text style={styles.errorText}>{formErrors.pricePerNight}</Text>
                      )}
                    </View>

                    {/* Giá cuối tuần */}
                    <View style={styles.halfCol}>
                      <Text style={styles.inputLabel}>Giá cuối tuần (T6, T7) (VND)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={String(formData.weekendPricePerNight)}
                        onChangeText={(val) => updateField('weekendPricePerNight', val)}
                        keyboardType="numeric"
                        placeholder="VD: 2800000"
                      />
                    </View>
                  </View>

                  {/* Mô tả */}
                  <View style={styles.formGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Mô tả không gian & trải nghiệm</Text>
                      <Text style={styles.counterHint}>
                        {formData.description.length} / 1000 ký tự
                      </Text>
                    </View>
                    <TextInput
                      style={styles.multilineInput}
                      placeholder="Mô tả không gian, tầm nhìn, phong cách thiết kế, tiện nghi nổi bật..."
                      placeholderTextColor="#94A3B8"
                      value={formData.description}
                      onChangeText={(val) => updateField('description', val)}
                      multiline={true}
                      numberOfLines={4}
                      maxLength={1000}
                    />
                  </View>

                  {/* Cancellation Policy Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() =>
                      updateField('cancellationPolicy48h', !formData.cancellationPolicy48h)
                    }
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={
                        formData.cancellationPolicy48h
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'
                      }
                      size={20}
                      color={formData.cancellationPolicy48h ? '#00685F' : '#94A3B8'}
                    />
                    <Text style={styles.checkboxLabel}>
                      Áp dụng chính sách miễn phí hủy phòng trước 48 giờ (Được khách ưu tiên chọn)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SECTION 4: TIỆN ÍCH & DỊCH VỤ */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconCircle}>
                      <MaterialCommunityIcons name="star-circle-outline" size={18} color="#00685F" />
                    </View>
                    <Text style={styles.sectionTitle}>4. Tiện ích & Dịch vụ nổi bật</Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Chọn các tiện ích có sẵn tại phòng (Chọn tối thiểu 6 tiện ích để đạt chuẩn Superhost):
                  </Text>

                  <View style={styles.amenitiesGrid}>
                    {AVAILABLE_AMENITIES.map((amenity) => {
                      const isChecked = formData.amenities.includes(amenity.id);
                      return (
                        <TouchableOpacity
                          key={amenity.id}
                          style={[
                            styles.amenityChip,
                            isChecked && styles.amenityChipActive,
                          ]}
                          onPress={() => toggleAmenity(amenity.id)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name={amenity.icon}
                            size={18}
                            color={isChecked ? '#00685F' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.amenityText,
                              isChecked && styles.amenityTextActive,
                            ]}
                          >
                            {amenity.name}
                          </Text>
                          {isChecked && (
                            <MaterialCommunityIcons
                              name="check"
                              size={14}
                              color="#00685F"
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* SECTION 5: ALBUM HÌNH ẢNH */}
                <RoomImageUploader
                  images={formData.images}
                  onChangeImages={(newImages) => updateField('images', newImages)}
                  minPhotos={3}
                  maxPhotos={15}
                />
              </View>

              {/* RIGHT COLUMN: SUPERHOST SCORE & PREVIEW (Desktop) */}
              <View style={[styles.rightCol, !isDesktop && styles.mobileRightCol]}>
                <SuperhostScoreCard formData={formData} />

                {/* Quick Info Card */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardTitle}>Trạng thái xuất bản</Text>
                  <View style={styles.summaryInfoRow}>
                    <Text style={styles.summaryLabel}>Mã định danh:</Text>
                    <Text style={styles.summaryValue}>{currentRoom?.code || 'Tạo tự động'}</Text>
                  </View>
                  <View style={styles.summaryInfoRow}>
                    <Text style={styles.summaryLabel}>Trạng thái hiện tại:</Text>
                    <Text style={styles.summaryValue}>
                      {currentRoom?.status === 'Published'
                        ? 'Đang mở bán'
                        : currentRoom?.status === 'Archived'
                        ? 'Tạm dừng'
                        : 'Bản nháp'}
                    </Text>
                  </View>
                  {lastAutoSaveTime && (
                    <View style={styles.summaryInfoRow}>
                      <Text style={styles.summaryLabel}>Tự động lưu nháp:</Text>
                      <Text style={[styles.summaryValue, { color: '#00685F' }]}>
                        {lastAutoSaveTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Sticky Bottom Bar */}
          <View style={styles.stickyBottomBar}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCancelModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Hủy thay đổi</Text>
            </TouchableOpacity>

            <View style={styles.rightActionGroup}>
              <TouchableOpacity
                style={styles.draftBtn}
                onPress={() => handleSave('Draft')}
                disabled={actionLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.draftBtnText}>Lưu bản nháp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.publishBtn}
                onPress={() => handleSave('Published')}
                disabled={actionLoading}
                activeOpacity={0.8}
                testID="publish-room-btn"
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                    <Text style={styles.publishBtnText}>
                      {mode === 'edit' ? 'Cập nhật & Đăng bán' : 'Xuất bản phòng'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* GPS Location Picker Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        currentCoordinates={formData.coordinates}
        onClose={() => setLocationModalVisible(false)}
        onSaveCoordinates={(coords) => updateField('coordinates', coords)}
      />

      {/* Province Picker Modal */}
      <Modal
        visible={provincePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProvincePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setProvincePickerVisible(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>Chọn Tỉnh / Thành phố</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {PROVINCES.map((prov) => (
                <TouchableOpacity
                  key={prov}
                  style={styles.provinceOptionItem}
                  onPress={() => {
                    updateField('city', prov);
                    setProvincePickerVisible(false);
                  }}
                >
                  <Text style={styles.provinceOptionText}>{prov}</Text>
                  {formData.city === prov && (
                    <MaterialCommunityIcons name="check" size={18} color="#00685F" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.cancelModalCard}>
            <MaterialCommunityIcons name="help-circle-outline" size={36} color="#D97706" />
            <Text style={styles.cancelModalTitle}>Hủy thay đổi?</Text>
            <Text style={styles.cancelModalText}>
              Các thay đổi chưa lưu sẽ bị hủy bỏ. Bạn có chắc chắn muốn quay lại danh mục phòng?
            </Text>
            <View style={styles.cancelButtonRow}>
              <TouchableOpacity
                style={styles.modalKeepBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalKeepText}>Tiếp tục chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalLeaveBtn}
                onPress={() => {
                  setCancelModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalLeaveText}>Rời khỏi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentLayout: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
  },
  codeBadge: {
    backgroundColor: '#E6F5F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99D5CF',
  },
  codeBadgeText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#00685F',
  },
  mainColsRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  mobileColsRow: {
    flexDirection: 'column',
  },
  leftFormCol: {
    flex: 1.8,
  },
  rightCol: {
    flex: 1,
  },
  mobileRightCol: {
    width: '100%',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#EF4444',
  },
  counterHint: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#94A3B8',
  },
  textInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#EF4444',
    marginTop: 4,
  },
  multilineInput: {
    height: 90,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  pillSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  typePillActive: {
    borderColor: '#00685F',
    backgroundColor: '#E6F5F3',
  },
  typePillText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#475569',
  },
  typePillTextActive: {
    color: '#00685F',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
  },
  steppersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  stepperItem: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  stepperLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
  },
  areaInput: {
    height: 28,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  twoColsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfCol: {
    flex: 1,
  },
  pickerSelector: {
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  pickerText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#0F172A',
  },
  gpsLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99D5CF',
    backgroundColor: '#E6F5F3',
  },
  gpsLocationText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#00685F',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  checkboxLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  amenityChipActive: {
    borderColor: '#00685F',
    backgroundColor: '#E6F5F3',
  },
  amenityText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#334155',
  },
  amenityTextActive: {
    color: '#00685F',
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...SHADOWS.card,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  summaryInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#0F172A',
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#64748B',
  },
  rightActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  draftBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00685F',
    backgroundColor: '#E6F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#00685F',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 380,
    padding: 16,
    ...SHADOWS.card,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  provinceOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  provinceOptionText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#334155',
  },
  cancelModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  cancelModalTitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 6,
  },
  cancelModalText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  cancelButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalKeepBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalKeepText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '600',
    color: '#475569',
  },
  modalLeaveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLeaveText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily, fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default HostRoomFormScreen;

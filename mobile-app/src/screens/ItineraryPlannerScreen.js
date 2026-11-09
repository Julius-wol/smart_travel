import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';
import { saveTripPlanOffline, getOfflineTripPlans, deleteOfflineTripPlan } from '../database/sqlite';
import ToastNotification from '../components/ToastNotification';

const ItineraryPlannerScreen = ({ navigation, route }) => {
  const { homestay: initialHomestay, booking, user, token, bookingDetails } = route.params || {};

  // Xác định thông tin Homestay mặc định hoặc truyền từ đặt phòng
  const homestay = initialHomestay || booking?.roomId || {
    title: 'An Nhiên Boutique Homestay Mỹ Khê',
    name: 'An Nhiên Boutique Homestay Mỹ Khê',
    address: '120 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    city: 'Đà Nẵng',
    lat: 16.0601,
    lng: 108.2435
  };

  // State chế độ hiển thị: 'create' (Tạo lộ trình mới) | 'saved' (Danh sách đã lưu offline)
  const [activeScreenTab, setActiveScreenTab] = useState('create');

  // State cấu hình bán kính & sở thích
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedPreferences, setSelectedPreferences] = useState([
    'Món ngon địa phương',
    'Biển & Cảnh quan'
  ]);
  const [daysCount, setDaysCount] = useState(2);

  // State trạng thái AI & dữ liệu lộ trình
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // State danh sách lịch trình đã lưu
  const [savedPlans, setSavedPlans] = useState([]);
  const [savingOffline, setSavingOffline] = useState(false);
  const [savingCloud, setSavingCloud] = useState(false);

  // State Toast thông báo
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ visible: true, message, type });

  // Tùy chọn thẻ sở thích
  const PREFERENCE_OPTIONS = [
    { id: '1', label: '🍲 Món ngon địa phương', val: 'Món ngon địa phương' },
    { id: '2', label: '📸 Check-in sống ảo', val: 'Check-in sống ảo' },
    { id: '3', label: '🏖️ Biển & Cảnh quan', val: 'Biển & Cảnh quan' },
    { id: '4', label: '☕ Cafe chill ngắm cảnh', val: 'Cafe chill' },
    { id: '5', label: '🏛️ Di tích & Văn hóa', val: 'Di tích & Văn hóa' },
    { id: '6', label: '🍢 Chợ đêm & Ẩm thực khuya', val: 'Chợ đêm' }
  ];

  // Tính số ngày nếu có ngày đặt phòng
  useEffect(() => {
    const checkIn = booking?.checkInDate || bookingDetails?.checkInDate;
    const checkOut = booking?.checkOutDate || bookingDetails?.checkOutDate;
    if (checkIn && checkOut) {
      const dIn = new Date(checkIn);
      const dOut = new Date(checkOut);
      const diffDays = Math.ceil(Math.abs(dOut - dIn) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) setDaysCount(diffDays);
    }
  }, [booking, bookingDetails]);

  // Tải danh sách offline khi chuyển tab
  useEffect(() => {
    if (activeScreenTab === 'saved') {
      loadSavedOfflinePlans();
    }
  }, [activeScreenTab]);

  const loadSavedOfflinePlans = async () => {
    const userId = user?._id || user?.id || 'default_user';
    const plans = await getOfflineTripPlans(userId);
    setSavedPlans(plans);
  };

  const togglePreference = (val) => {
    setSelectedPreferences((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  // Gọi API sinh Lộ trình AI
  const handleGenerateItinerary = async () => {
    setLoading(true);
    setLoadingStep('Đang quét các quán ngon & điểm check-in trong bán kính...');

    try {
      setTimeout(() => {
        setLoadingStep('Gemini AI đang tối ưu cung đường di chuyển từ homestay...');
      }, 900);

      const res = await fetch(`${API_URL}/tripplan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homestay: {
            title: homestay.title || homestay.name,
            name: homestay.title || homestay.name,
            address: homestay.address,
            city: homestay.city || 'Đà Nẵng',
            lat: homestay.lat || homestay.latitude,
            lng: homestay.lng || homestay.longitude
          },
          bookingId: booking?._id || bookingDetails?._id,
          radiusKm,
          days: daysCount,
          preferences: selectedPreferences
        })
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setItinerary(data.data);
        setSelectedDayIndex(0);
        showToast('Đã tạo lộ trình AI quanh chỗ ở thành công!', 'success');
      } else {
        showToast(data.message || 'Không thể tạo lộ trình lúc này', 'error');
      }
    } catch (error) {
      console.warn('Lỗi gọi API tripplan:', error);
      showToast('Có lỗi kết nối, vui lòng thử lại', 'error');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Mở bản đồ Google Maps chỉ đường
  const handleOpenMap = (activity) => {
    const url = activity.mapUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        activity.name + ' ' + (activity.address || homestay.city || '')
      )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Không thể mở Maps', 'Vui lòng kiểm tra ứng dụng bản đồ trên máy của bạn.');
    });
  };

  // Lưu ngoại tuyến (SQLite)
  const handleSaveOffline = async () => {
    if (!itinerary) return;
    setSavingOffline(true);
    const userId = user?._id || user?.id || 'default_user';
    const success = await saveTripPlanOffline(itinerary, userId);
    setSavingOffline(false);
    if (success) {
      showToast('Đã lưu ngoại tuyến vào SQLite! Bạn có thể xem khi mất mạng.', 'success');
    } else {
      showToast('Lỗi khi lưu ngoại tuyến.', 'error');
    }
  };

  // Lưu vào tài khoản Cloud (MongoDB)
  const handleSaveCloud = async () => {
    if (!itinerary) return;
    setSavingCloud(true);
    try {
      const res = await fetch(`${API_URL}/tripplan/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          title: itinerary.title,
          destinationCity: itinerary.destinationCity,
          days: itinerary.days,
          totalBudget: itinerary.totalBudget,
          schedule: itinerary.schedule,
          radiusKm: itinerary.radiusKm,
          homestay: itinerary.homestay,
          linkedBookings: booking?._id ? [booking._id] : [],
          preferences: selectedPreferences
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Đã lưu lịch trình vào tài khoản thành công!', 'success');
      } else {
        showToast(data.message || 'Lỗi lưu lịch trình', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối đến máy chủ', 'error');
    } finally {
      setSavingCloud(false);
    }
  };

  // Xóa lộ trình offline
  const handleDeleteOffline = async (planId) => {
    const success = await deleteOfflineTripPlan(planId);
    if (success) {
      showToast('Đã xóa lộ trình offline', 'info');
      loadSavedOfflinePlans();
    }
  };

  const currentScheduleDay = itinerary?.schedule?.[selectedDayIndex] || itinerary?.schedule?.[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Lộ Trình AI Quanh Chỗ Ở</Text>
          <Text style={styles.headerSubtitle}>SMART-104 • Tâm điểm & Bán kính</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Segment Switcher: Tạo lộ trình vs Đã lưu */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabSwitchBtn, activeScreenTab === 'create' && styles.tabSwitchBtnActive]}
          onPress={() => setActiveScreenTab('create')}
        >
          <Ionicons
            name="sparkles"
            size={16}
            color={activeScreenTab === 'create' ? '#00685F' : '#64748B'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.tabSwitchText, activeScreenTab === 'create' && styles.tabSwitchTextActive]}
          >
            Tạo Lộ Trình Mới
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabSwitchBtn, activeScreenTab === 'saved' && styles.tabSwitchBtnActive]}
          onPress={() => setActiveScreenTab('saved')}
        >
          <Ionicons
            name="cloud-offline"
            size={16}
            color={activeScreenTab === 'saved' ? '#00685F' : '#64748B'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.tabSwitchText, activeScreenTab === 'saved' && styles.tabSwitchTextActive]}
          >
            Đã Lưu Offline ({savedPlans.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeScreenTab === 'create' ? (
          <>
            {/* Banner Thông Tin Chỗ Ở Đã Đặt */}
            <View style={styles.homestayCard}>
              <View style={styles.homestayIconWrap}>
                <Ionicons name="home" size={24} color="#00685F" />
              </View>
              <View style={styles.homestayInfo}>
                <View style={styles.badgeRow}>
                  <View style={styles.homestayBadge}>
                    <Text style={styles.homestayBadgeText}>TÂM ĐIỂM XUẤT PHÁT</Text>
                  </View>
                  <Text style={styles.daysBadge}>{daysCount} ngày lưu trú</Text>
                </View>
                <Text style={styles.homestayName} numberOfLines={2}>
                  {homestay.title || homestay.name}
                </Text>
                <Text style={styles.homestayAddress} numberOfLines={1}>
                  📍 {homestay.address}
                </Text>
              </View>
            </View>

            {/* Bộ Chọn Bán Kính Quét */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="navigate-circle" size={20} color="#00685F" />
                <Text style={styles.sectionTitle}>Bán kính khám phá quanh phòng</Text>
              </View>
              <Text style={styles.sectionDesc}>
                Hệ thống sẽ quét các quán ăn ngon và điểm check-in trong phạm vi này:
              </Text>
              <View style={styles.radiusRow}>
                {[
                  { km: 3, label: '3 km', desc: '🚶 Đi bộ / Xe đạp' },
                  { km: 5, label: '5 km', desc: '🛵 Tiêu chuẩn (10p)' },
                  { km: 10, label: '10 km', desc: '🚗 Mở rộng khu vực' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.km}
                    style={[styles.radiusBtn, radiusKm === item.km && styles.radiusBtnActive]}
                    onPress={() => setRadiusKm(item.km)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.radiusBtnLabel, radiusKm === item.km && styles.radiusBtnLabelActive]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[styles.radiusBtnDesc, radiusKm === item.km && styles.radiusBtnDescActive]}
                    >
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Thẻ Chọn Sở Thích Du Lịch */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="heart" size={20} color="#E11D48" />
                <Text style={styles.sectionTitle}>Sở thích & Phong cách chuyến đi</Text>
              </View>
              <View style={styles.prefWrap}>
                {PREFERENCE_OPTIONS.map((item) => {
                  const selected = selectedPreferences.includes(item.val);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.prefTag, selected && styles.prefTagActive]}
                      onPress={() => togglePreference(item.val)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.prefTagText, selected && styles.prefTagTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Nút Kích Hoạt Tạo Lộ Trình */}
            <TouchableOpacity
              style={[styles.generateBtn, loading && { opacity: 0.7 }]}
              onPress={handleGenerateItinerary}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.loadingInner}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.generateBtnText}>AI đang phân tích & lập lộ trình...</Text>
                </View>
              ) : (
                <View style={styles.btnInner}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.generateBtnText}>Quét Bán Kính & Tạo Lộ Trình AI</Text>
                </View>
              )}
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingStatusBox}>
                <Ionicons name="compass-outline" size={18} color="#00685F" style={{ marginRight: 6 }} />
                <Text style={styles.loadingStatusText}>{loadingStep}</Text>
              </View>
            )}

            {/* KẾT QUẢ LỘ TRÌNH THÔNG MINH */}
            {itinerary && (
              <View style={styles.resultContainer}>
                {/* Summary Box */}
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>{itinerary.title}</Text>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryNum}>{itinerary.radiusKm} km</Text>
                      <Text style={styles.summaryLabel}>Bán kính</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryNum}>{itinerary.nearbySummary?.foodSpotsCount || 6}+</Text>
                      <Text style={styles.summaryLabel}>Quán ngon</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryNum}>{itinerary.nearbySummary?.attractionsCount || 4}+</Text>
                      <Text style={styles.summaryLabel}>Điểm check-in</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryNum, { color: '#00685F' }]}>
                        {Number(itinerary.totalBudget || 0).toLocaleString('vi-VN')} đ
                      </Text>
                      <Text style={styles.summaryLabel}>Dự kiến</Text>
                    </View>
                  </View>
                </View>

                {/* Day Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsScroll}>
                  {(itinerary.schedule || []).map((dayItem, idx) => (
                    <TouchableOpacity
                      key={dayItem.day}
                      style={[styles.dayTabBtn, selectedDayIndex === idx && styles.dayTabBtnActive]}
                      onPress={() => setSelectedDayIndex(idx)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.dayTabDayText, selectedDayIndex === idx && styles.dayTabDayTextActive]}
                      >
                        NGÀY {dayItem.day}
                      </Text>
                      <Text
                        style={[styles.dayTabCostText, selectedDayIndex === idx && styles.dayTabCostTextActive]}
                      >
                        {Number(dayItem.estimatedDayCost || 0).toLocaleString('vi-VN')} đ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Day Header */}
                <View style={styles.dayHeaderRow}>
                  <Text style={styles.dayThemeTitle}>
                    📅 Ngày {currentScheduleDay?.day}: {currentScheduleDay?.title}
                  </Text>
                </View>

                {/* Timeline Activities */}
                {(currentScheduleDay?.activities || []).map((act, actIdx) => (
                  <View key={actIdx} style={styles.activityCard}>
                    {/* Time & Period Column */}
                    <View style={styles.activityTimeCol}>
                      <View
                        style={[
                          styles.periodBadge,
                          act.period === 'Sáng' && { backgroundColor: '#FEF3C7' },
                          act.period === 'Trưa' && { backgroundColor: '#FED7AA' },
                          act.period === 'Chiều' && { backgroundColor: '#E0E7FF' },
                          act.period === 'Tối' && { backgroundColor: '#EDE9FE' }
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodText,
                            act.period === 'Sáng' && { color: '#B45309' },
                            act.period === 'Trưa' && { color: '#C2410C' },
                            act.period === 'Chiều' && { color: '#4338CA' },
                            act.period === 'Tối' && { color: '#6D28D9' }
                          ]}
                        >
                          {act.period}
                        </Text>
                      </View>
                      <Text style={styles.timeText}>{act.time}</Text>
                    </View>

                    {/* Content Column */}
                    <View style={styles.activityContentCol}>
                      <View style={styles.titleCatRow}>
                        <View style={styles.catBadge}>
                          <Text style={styles.catBadgeText}>
                            {act.type === 'FOOD' ? '🍲 MÓN NGON' : '📸 CHECK-IN'}
                          </Text>
                        </View>
                        {act.distanceKm !== null && (
                          <View style={styles.distBadge}>
                            <Ionicons name="location" size={12} color="#00685F" />
                            <Text style={styles.distBadgeText}>Cách phòng {act.distanceKm} km</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.actName}>{act.name}</Text>
                      <Text style={styles.actDesc}>{act.description}</Text>

                      {act.address && (
                        <Text style={styles.actAddress} numberOfLines={1}>
                          📍 {act.address}
                        </Text>
                      )}

                      <View style={styles.bottomActRow}>
                        <Text style={styles.costText}>
                          Chi phí: <Text style={styles.costVal}>{Number(act.costEstimate || 0).toLocaleString('vi-VN')} đ</Text>
                        </Text>

                        {/* Button Mở Google Maps Chỉ Đường */}
                        <TouchableOpacity
                          style={styles.mapBtn}
                          onPress={() => handleOpenMap(act)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="map" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.mapBtnText}>Chỉ đường Maps</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Bottom Actions: Lưu Offline & Lưu Cloud */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.saveOfflineBtn}
                    onPress={handleSaveOffline}
                    disabled={savingOffline}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cloud-download-outline" size={18} color="#00685F" style={{ marginRight: 6 }} />
                    <Text style={styles.saveOfflineBtnText}>
                      {savingOffline ? 'Đang lưu...' : 'Lưu Xem Offline'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveCloudBtn}
                    onPress={handleSaveCloud}
                    disabled={savingCloud}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bookmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveCloudBtnText}>
                      {savingCloud ? 'Đang lưu...' : 'Lưu Vào Tài Khoản'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        ) : (
          /* TAB DANH SÁCH LỘ TRÌNH ĐÃ LƯU OFFLINE */
          <View style={styles.savedContainer}>
            {savedPlans.length === 0 ? (
              <View style={styles.emptySavedBox}>
                <Ionicons name="cloud-offline-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptySavedTitle}>Chưa có lộ trình nào được lưu offline</Text>
                <Text style={styles.emptySavedDesc}>
                  Sau khi AI tạo lộ trình quanh homestay, bạn bấm nút "Lưu Xem Offline" để xem lại khi đi du lịch mà không cần 4G.
                </Text>
                <TouchableOpacity
                  style={styles.createNowBtn}
                  onPress={() => setActiveScreenTab('create')}
                >
                  <Text style={styles.createNowBtnText}>Tạo Lộ Trình Ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedPlans.map((plan) => (
                <View key={plan._id} style={styles.savedPlanCard}>
                  <View style={styles.savedCardHeader}>
                    <View style={styles.offlineTag}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={styles.offlineTagText}>ĐÃ LƯU OFFLINE</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteOffline(plan._id)}>
                      <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.savedPlanTitle}>{plan.title}</Text>
                  <Text style={styles.savedHomestayName}>🏠 {plan.homestay?.name || 'Homestay đã đặt'}</Text>
                  <Text style={styles.savedHomestayAddr}>📍 {plan.homestay?.address}</Text>

                  <View style={styles.savedMetaRow}>
                    <Text style={styles.savedMetaText}>⏱️ {plan.days} ngày</Text>
                    <Text style={styles.savedMetaText}>📍 Bán kính {plan.radiusKm} km</Text>
                    <Text style={[styles.savedMetaText, { color: '#00685F', fontWeight: '700' }]}>
                      💵 {Number(plan.totalBudget || 0).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewPlanBtn}
                    onPress={() => {
                      setItinerary(plan);
                      setActiveScreenTab('create');
                    }}
                  >
                    <Text style={styles.viewPlanBtnText}>Xem Chi Tiết Lộ Trình</Text>
                    <Ionicons name="chevron-forward" size={16} color="#00685F" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Toast Notification */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backBtn: {
    padding: 6
  },
  headerTitleBox: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4
  },
  tabSwitchBtnActive: {
    backgroundColor: '#E6F4F2'
  },
  tabSwitchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  tabSwitchTextActive: {
    color: '#00685F',
    fontWeight: '700'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  homestayCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  homestayIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  homestayInfo: {
    flex: 1
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  homestayBadge: {
    backgroundColor: '#00685F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8
  },
  homestayBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  daysBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  homestayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2
  },
  homestayAddress: {
    fontSize: 12,
    color: '#64748B'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12
  },
  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  radiusBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginHorizontal: 3,
    alignItems: 'center'
  },
  radiusBtnActive: {
    borderColor: '#00685F',
    backgroundColor: '#E6F4F2'
  },
  radiusBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155'
  },
  radiusBtnLabelActive: {
    color: '#00685F'
  },
  radiusBtnDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center'
  },
  radiusBtnDescActive: {
    color: '#00685F',
    fontWeight: '600'
  },
  prefWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  prefTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  prefTagActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF'
  },
  prefTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500'
  },
  prefTagTextActive: {
    color: '#E11D48',
    fontWeight: '700'
  },
  generateBtn: {
    backgroundColor: '#00685F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00685F',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadingInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  loadingStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#E6F4F2',
    borderRadius: 8
  },
  loadingStatusText: {
    fontSize: 12,
    color: '#00685F',
    fontWeight: '500'
  },
  resultContainer: {
    marginTop: 20
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B'
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0'
  },
  dayTabsScroll: {
    flexDirection: 'row',
    marginBottom: 12
  },
  dayTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    alignItems: 'center'
  },
  dayTabBtnActive: {
    backgroundColor: '#00685F',
    borderColor: '#00685F'
  },
  dayTabDayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B'
  },
  dayTabDayTextActive: {
    color: '#FFFFFF'
  },
  dayTabCostText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1
  },
  dayTabCostTextActive: {
    color: '#E6F4F2',
    fontWeight: '600'
  },
  dayHeaderRow: {
    marginBottom: 12
  },
  dayThemeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155'
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activityTimeCol: {
    width: 76,
    alignItems: 'center',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9'
  },
  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4
  },
  periodText: {
    fontSize: 10,
    fontWeight: '800'
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center'
  },
  activityContentCol: {
    flex: 1,
    paddingLeft: 10
  },
  titleCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  catBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569'
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  distBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00685F',
    marginLeft: 2
  },
  actName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2
  },
  actDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 4
  },
  actAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6
  },
  bottomActRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  costText: {
    fontSize: 11,
    color: '#64748B'
  },
  costVal: {
    fontWeight: '700',
    color: '#0F172A'
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00685F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  mapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14
  },
  saveOfflineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#00685F',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 6
  },
  saveOfflineBtnText: {
    color: '#00685F',
    fontSize: 13,
    fontWeight: '700'
  },
  saveCloudBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00685F',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 6
  },
  saveCloudBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  savedContainer: {
    marginTop: 8
  },
  emptySavedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptySavedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    textAlign: 'center'
  },
  emptySavedDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  createNowBtn: {
    backgroundColor: '#00685F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16
  },
  createNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  savedPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  savedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  offlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  offlineTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  savedPlanTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  savedHomestayName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2
  },
  savedHomestayAddr: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10
  },
  savedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10
  },
  savedMetaText: {
    fontSize: 12,
    color: '#475569'
  },
  viewPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#E6F4F2',
    borderRadius: 8
  },
  viewPlanBtnText: {
    color: '#00685F',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4
  }
});

export default ItineraryPlannerScreen;

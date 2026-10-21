import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';
import ToastNotification from '../components/ToastNotification';
import LoadingOverlay from '../components/LoadingOverlay';

/**
 * Màn hình Viết Đánh Giá
 * Props route: { homestay, bookingCode, user, token }
 */
const WriteReviewScreen = ({ navigation, route }) => {
  const { homestay, bookingCode, user, token } = route.params || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    cleanliness: 0,
    location: 0,
    service: 0,
    value: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') =>
    setToast({ visible: true, message, type });
  const hideToast = () =>
    setToast((p) => ({ ...p, visible: false }));

  const categoryLabels = {
    cleanliness: 'Vệ sinh',
    location:    'Vị trí',
    service:     'Dịch vụ',
    value:       'Giá trị',
  };

  const renderStars = (value, onPress, size = 32) =>
    [1, 2, 3, 4, 5].map((s) => (
      <TouchableOpacity key={s} onPress={() => onPress(s)} activeOpacity={0.7}>
        <Ionicons
          name={s <= value ? 'star' : 'star-outline'}
          size={size}
          color={s <= value ? '#F6AD55' : '#CBD5E0'}
          style={{ marginHorizontal: 3 }}
        />
      </TouchableOpacity>
    ));

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Vui lòng chọn số sao đánh giá tổng thể.', 'error');
      return;
    }
    if (comment.trim().length < 10) {
      showToast('Nhận xét cần ít nhất 10 ký tự.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomId = homestay?._id || homestay?.id;
      const fullName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        : 'Khách ẩn danh';

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          roomId,
          fullName,
          avatar: user?.avatar || '',
          rating,
          comment: comment.trim(),
          categories: {
            cleanliness: categories.cleanliness || undefined,
            location:    categories.location    || undefined,
            service:     categories.service     || undefined,
            value:       categories.value       || undefined,
          },
          bookingCode: bookingCode || '',
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        showToast('Cảm ơn bạn đã đánh giá! ⭐', 'success');
        setTimeout(() => navigation.goBack(), 1800);
      } else {
        showToast(data.message || 'Không thể gửi đánh giá. Thử lại nhé.', 'error');
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast('Không kết nối được máy chủ. Kiểm tra lại mạng.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết đánh giá</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tên phòng */}
        <View style={styles.roomNameCard}>
          <Ionicons name="home-outline" size={18} color="#00796B" />
          <Text style={styles.roomNameText} numberOfLines={1}>
            {homestay?.title || homestay?.name || 'An Nhiên Eco Retreat'}
          </Text>
        </View>

        {/* Rating tổng thể */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá tổng thể <Text style={{ color: '#E53E3E' }}>*</Text></Text>
          <View style={styles.starsRow}>
            {renderStars(rating, setRating, 36)}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingHint}>
              {['', 'Rất tệ', 'Tạm được', 'Bình thường', 'Tốt', 'Xuất sắc!'][rating]}
            </Text>
          )}
        </View>

        {/* Rating chi tiết */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiêu chí chi tiết <Text style={styles.optional}>(tuỳ chọn)</Text></Text>
          {Object.keys(categoryLabels).map((key) => (
            <View key={key} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>{categoryLabels[key]}</Text>
              <View style={styles.starsRowSmall}>
                {renderStars(
                  categories[key],
                  (v) => setCategories((p) => ({ ...p, [key]: v })),
                  22
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Nhận xét */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nhận xét của bạn <Text style={{ color: '#E53E3E' }}>*</Text>
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn về phòng, vị trí, dịch vụ..."
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{comment.length}/1000 ký tự</Text>
        </View>

        {/* Nút gửi */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={rating === 0}
        >
          <Ionicons name="star" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Đánh giá của bạn sẽ được hiển thị công khai và giúp cải thiện dịch vụ.
        </Text>
      </ScrollView>

      <LoadingOverlay visible={isSubmitting} message="Đang gửi đánh giá..." />
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  content: { padding: 16, paddingBottom: 40 },
  roomNameCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E6FFFA', borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  roomNameText: {
    fontSize: 14, fontWeight: '600', color: '#00796B',
    marginLeft: 8, flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.03,
    shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748', marginBottom: 12 },
  optional: { fontSize: 12, fontWeight: '400', color: '#A0AEC0' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  ratingHint: {
    textAlign: 'center', fontSize: 14, fontWeight: '700',
    color: '#F6AD55', marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  categoryLabel: { fontSize: 13, color: '#4A5568', fontWeight: '600', width: 80 },
  starsRowSmall: { flexDirection: 'row' },
  commentInput: {
    backgroundColor: '#F7FAFC', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#1A202C',
    minHeight: 110,
  },
  charCount: { fontSize: 11, color: '#A0AEC0', textAlign: 'right', marginTop: 6 },
  submitBtn: {
    flexDirection: 'row', backgroundColor: '#00796B',
    borderRadius: 14, paddingVertical: 15,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, elevation: 3,
    shadowColor: '#00796B', shadowOpacity: 0.3, shadowRadius: 8,
  },
  submitBtnDisabled: { backgroundColor: '#A0AEC0', elevation: 0 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disclaimer: {
    fontSize: 11, color: '#A0AEC0',
    textAlign: 'center', lineHeight: 16,
  },
});

export default WriteReviewScreen;

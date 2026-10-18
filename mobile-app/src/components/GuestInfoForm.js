import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * GuestInfoForm Component (Figma Node #30:2485)
 * Khối nhập và xác thực thông tin khách lưu trú kèm yêu cầu đặc biệt
 */
export const GuestInfoForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Tiêu đề phần thông tin khách */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-outline" size={18} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Thông tin khách lưu trú</Text>
          <Text style={styles.sectionSubtitle}>
            Thông tin liên hệ nhận vé e-Pass & hóa đơn điện tử
          </Text>
        </View>
      </View>

      {/* 1. Họ và tên */}
      <View style={styles.inputField}>
        <Text style={styles.inputLabel}>
          Họ và tên <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          testID="fullname-input"
          style={[
            styles.textInput,
            errors.fullName ? styles.inputErrorBorder : null,
          ]}
          value={values.fullName}
          onChangeText={handleChange('fullName')}
          onBlur={handleBlur('fullName')}
          placeholder="Ví dụ: Lê Đăng Trung Hiếu"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.fullName ? (
          <Text testID="fullname-error" style={styles.errorText}>
            {errors.fullName}
          </Text>
        ) : null}
      </View>

      {/* 2. Số điện thoại */}
      <View style={styles.inputField}>
        <Text style={styles.inputLabel}>
          Số điện thoại di động <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          testID="phone-input"
          style={[
            styles.textInput,
            errors.phoneNumber ? styles.inputErrorBorder : null,
          ]}
          value={values.phoneNumber}
          onChangeText={handleChange('phoneNumber')}
          onBlur={handleBlur('phoneNumber')}
          placeholder="0987654321"
          placeholderTextColor={COLORS.textLight}
          keyboardType="phone-pad"
        />
        {errors.phoneNumber ? (
          <Text testID="phone-error" style={styles.errorText}>
            {errors.phoneNumber}
          </Text>
        ) : null}
      </View>

      {/* 3. Email */}
      <View style={styles.inputField}>
        <Text style={styles.inputLabel}>
          Địa chỉ Email <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          testID="email-input"
          style={[
            styles.textInput,
            errors.email ? styles.inputErrorBorder : null,
          ]}
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          placeholder="hieu.le@smarttravel.vn"
          placeholderTextColor={COLORS.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? (
          <Text testID="email-error" style={styles.errorText}>
            {errors.email}
          </Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* 4. Yêu cầu đặc biệt đến chủ nhà */}
      <TouchableOpacity
        testID="special-note-toggle"
        style={styles.checkboxRow}
        activeOpacity={0.8}
        onPress={() => setFieldValue('hasSpecialNote', !values.hasSpecialNote)}
      >
        <View
          style={[
            styles.checkbox,
            values.hasSpecialNote ? styles.checkboxChecked : styles.checkboxUnchecked,
          ]}
        >
          {values.hasSpecialNote && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.checkboxLabel}>Yêu cầu đặc biệt đến chủ nhà</Text>
      </TouchableOpacity>

      {values.hasSpecialNote ? (
        <View style={styles.specialNoteContainer}>
          <TextInput
            testID="special-note-input"
            style={[
              styles.textArea,
              touched.specialNote && errors.specialNote ? styles.inputErrorBorder : null,
            ]}
            value={values.specialNote}
            onChangeText={handleChange('specialNote')}
            onBlur={handleBlur('specialNote')}
            placeholder="Ví dụ: Xin check-in sớm 13:00 nếu có thể. Cảm ơn!"
            placeholderTextColor={COLORS.textLight}
            multiline={true}
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.charCount}>
            {values.specialNote ? values.specialNote.length : 0}/200 ký tự
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textBody,
    marginTop: 2,
  },
  inputField: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textHeading,
    marginBottom: 6,
  },
  requiredStar: {
    color: COLORS.discountText,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#D3E4FE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textHeading,
  },
  inputErrorBorder: {
    borderColor: COLORS.errorBorder,
    borderWidth: 1.5,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.errorBorder,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxUnchecked: {
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textHeading,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  specialNoteContainer: {
    marginTop: 10,
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#D3E4FE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textHeading,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default GuestInfoForm;

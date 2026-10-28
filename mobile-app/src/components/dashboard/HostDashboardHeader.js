import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const PERIOD_OPTIONS = [
  { id: 'TODAY', label: 'Hôm nay' },
  { id: '7_DAYS', label: '7 ngày qua' },
  { id: '30_DAYS', label: '30 ngày qua' },
  { id: 'THIS_MONTH', label: 'Tháng này' },
  { id: 'LAST_MONTH', label: 'Tháng trước' },
];

const HostDashboardHeader = ({
  hostName = 'Lê Hoàng Host',
  selectedPeriod = '30_DAYS',
  periodLabel = '30 ngày qua',
  onSelectPeriod,
  onExport,
  exportLoading = false,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <View style={[styles.headerContainer, isMobile && styles.mobileHeader]}>
      {/* 1. Left Col: Lời chào & Tên Host */}
      <View style={styles.greetingCol}>
        <Text style={styles.headingTitle}>
          {`Xin chào, ${hostName} 👋`}
        </Text>
        <Text style={styles.subheading}>
          Đây là tình hình kinh doanh thực tế của bạn
        </Text>
      </View>

      {/* 2. Right Col: Bộ lọc Thời Gian & Nút Xuất Báo Cáo */}
      <View style={[styles.actionRow, isMobile && styles.mobileActionRow]}>
        {/* Dropdown Khoảng thời gian */}
        <TouchableOpacity
          testID="period-dropdown-btn"
          style={styles.dropdownBtn}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="calendar-outline" size={16} color="#00685F" style={{ marginRight: 6 }} />
          <Text style={styles.dropdownLabel}>{periodLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* Nút Xuất báo cáo */}
        <TouchableOpacity
          testID="btn-export-report"
          style={[styles.exportBtn, exportLoading && styles.exportBtnDisabled]}
          onPress={onExport}
          disabled={exportLoading}
          activeOpacity={0.8}
        >
          {exportLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : (
            <MaterialCommunityIcons name="file-export-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.exportBtnText}>
            {exportLoading ? 'Đang xuất...' : 'Xuất báo cáo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Dropdown Chọn Khoảng Thời Gian */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Chọn khoảng thời gian</Text>
            {PERIOD_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedPeriod;
              return (
                <TouchableOpacity
                  key={opt.id}
                  testID={`period-option-${opt.id}`}
                  style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                  onPress={() => {
                    onSelectPeriod && onSelectPeriod(opt.id);
                    setDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#00685F" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  mobileHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  greetingCol: {
    flex: 1,
  },
  headingTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileActionRow: {
    width: '100%',
    justifyContent: 'space-between',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...SHADOWS.card,
  },
  dropdownLabel: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00685F',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...SHADOWS.card,
  },
  exportBtnDisabled: {
    opacity: 0.7,
  },
  exportBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    ...SHADOWS.card,
  },
  dropdownModalTitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: '#E8FBF4',
  },
  dropdownOptionText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 13,
    color: '#334155',
  },
  dropdownOptionTextSelected: {
    color: '#00685F',
    fontWeight: '700',
  },
});

export default HostDashboardHeader;

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
  hostName = 'Robin Nguyen',
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
      {/* 1. Left Col: Lời chào & Tên Host (Figma 1.1) */}
      <View style={styles.greetingCol}>
        <Text style={styles.headingTitle}>
          {`Xin chào, ${hostName} 👋`}
        </Text>
        <Text style={styles.subheading}>
          Đây là tình hình kinh doanh của bạn
        </Text>
      </View>

      {/* 2. Right Col: Bộ lọc Thời Gian & Nút Xuất Báo Cáo (Figma 1.2, 1.3) */}
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
          testID="export-report-btn"
          style={[styles.exportBtn, exportLoading && styles.exportBtnDisabled]}
          onPress={onExport}
          disabled={exportLoading}
          activeOpacity={0.85}
        >
          {exportLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : (
            <MaterialCommunityIcons name="file-excel-box-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.exportBtnText}>Xuất báo cáo</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Dropdown Chọn Mốc Thời Gian */}
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
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownMenuTitle}>Chọn khoảng thời gian</Text>
            {PERIOD_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedPeriod;
              return (
                <TouchableOpacity
                  key={opt.id}
                  testID={`period-opt-${opt.id}`}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => {
                    onSelectPeriod && onSelectPeriod(opt.id);
                    setDropdownVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color="#00685F" />
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
  },
  greetingCol: {
    flex: 1,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C30',
    fontFamily: TYPOGRAPHY.fontFamily,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileActionRow: {
    width: '100%',
    justifyContent: 'space-between',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00685F',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#00685F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  exportBtnDisabled: {
    opacity: 0.7,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenu: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    ...SHADOWS.card,
  },
  dropdownMenuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownItemActive: {
    backgroundColor: '#E8FBF4',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },
});

export default HostDashboardHeader;

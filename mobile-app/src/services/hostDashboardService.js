import api from './api';

/**
 * 1. Lấy dữ liệu tổng quan kinh doanh của Host theo kỳ lọc và phòng
 */
export const getHostDashboardApi = async (period = '30_DAYS', roomId = 'ALL') => {
  let url = `/api/host/dashboard?period=${period}`;
  if (roomId && roomId !== 'ALL') {
    url += `&roomId=${roomId}`;
  }
  return await api.get(url);
};

/**
 * 2. Xuất báo cáo kinh doanh ra file Excel/PDF
 */
export const exportDashboardReportApi = async (period = '30_DAYS') => {
  return await api.get(`/api/host/dashboard/export?period=${period}`);
};

export default {
  getHostDashboardApi,
  exportDashboardReportApi,
};

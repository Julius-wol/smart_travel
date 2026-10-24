import api from './api';

/**
 * Service API cho Quản lý danh mục phòng (SMART-99)
 */

export const getInventoryApi = async ({
  page = 1,
  limit = 10,
  search = '',
  roomType = 'ALL',
  status = 'ALL',
  sort = 'newest',
} = {}) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  if (roomType && roomType !== 'ALL') params.append('roomType', roomType);
  if (status && status !== 'ALL') params.append('status', status);
  if (sort) params.append('sort', sort);

  return await api.get(`/api/rooms/host/inventory?${params.toString()}`);
};

export const getRoomByIdApi = async (id) => {
  return await api.get(`/api/rooms/host/inventory/${id}`);
};

export const createRoomApi = async (roomData) => {
  return await api.post('/api/rooms/host/inventory', roomData);
};

export const updateRoomApi = async (id, roomData) => {
  return await api.put(`/api/rooms/host/inventory/${id}`, roomData);
};

export const toggleStatusApi = async (id, status) => {
  return await api.patch(`/api/rooms/host/inventory/${id}/status`, { status });
};

export const duplicateRoomApi = async (id) => {
  return await api.post(`/api/rooms/host/inventory/${id}/duplicate`);
};

export const deleteRoomApi = async (id) => {
  return await api.delete(`/api/rooms/host/inventory/${id}`);
};

export const exportExcelApi = async ({ search = '', roomType = 'ALL', status = 'ALL' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (roomType && roomType !== 'ALL') params.append('roomType', roomType);
  if (status && status !== 'ALL') params.append('status', status);

  return await api.get(`/api/rooms/host/inventory/export?${params.toString()}`);
};

export default {
  getInventoryApi,
  getRoomByIdApi,
  createRoomApi,
  updateRoomApi,
  toggleStatusApi,
  duplicateRoomApi,
  deleteRoomApi,
  exportExcelApi,
};

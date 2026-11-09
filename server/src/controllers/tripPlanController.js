import TripPlan from '../models/TripPlan.js';
import { createPlanFromBookingService, scanNearbyPOIsInRadius, generateLocalSmartItinerary } from '../services/tripPlanService.js';
import { sendResponse } from '../utils/apiResponse.js';

/**
 * [SMART-104] API Sinh lộ trình thông minh bằng AI quét quanh chỗ ở (Homestay)
 * POST /api/tripplan/generate
 */
export const generateTripPlan = async (req, res) => {
  try {
    const { bookingId, roomId, radiusKm = 5, days = 2, preferences = [], homestay } = req.body;

    let result;
    if (homestay && (homestay.title || homestay.name)) {
      // Nếu client truyền trực tiếp thông tin homestay đã đặt
      const nearbyData = scanNearbyPOIsInRadius(homestay, Number(radiusKm));
      result = generateLocalSmartItinerary({
        homestayInfo: nearbyData.homestayInfo,
        nearbyData,
        days: Number(days),
        radiusKm: Number(radiusKm),
        preferences
      });
      if (bookingId) {
        result.linkedBookingId = bookingId;
      }
    } else {
      result = await createPlanFromBookingService({
        bookingId,
        roomId,
        radiusKm: Number(radiusKm),
        days: Number(days),
        preferences
      });
    }

    return sendResponse(res, 200, 'Tạo lộ trình du lịch quanh chỗ ở thành công!', result);
  } catch (error) {
    console.error('Lỗi khi tạo lộ trình AI:', error);
    return sendResponse(res, 500, 'Lỗi hệ thống khi tạo lộ trình AI', { error: error.message });
  }
};

/**
 * [SMART-104] API Lưu lộ trình chuyến đi vào tài khoản
 * POST /api/tripplan/save
 */
export const saveTripPlan = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || '6adf16d84430d1c8c1484c91'; // Fallback guest ID nếu không có token
    const {
      title,
      destinationCity,
      days,
      totalBudget,
      schedule,
      linkedBookings = [],
      radiusKm = 5,
      homestay,
      preferences = []
    } = req.body;

    if (!title || !destinationCity || !schedule) {
      return sendResponse(res, 400, 'Thiếu thông tin bắt buộc: title, destinationCity hoặc schedule');
    }

    const newTripPlan = new TripPlan({
      userId,
      title,
      destinationCity,
      days: days || (Array.isArray(schedule) ? schedule.length : 1),
      totalBudget: totalBudget || 0,
      schedule,
      linkedBookings,
      radiusKm,
      homestay,
      preferences
    });

    const savedPlan = await newTripPlan.save();
    return sendResponse(res, 201, 'Lưu lịch trình thành công!', savedPlan);
  } catch (error) {
    console.error('Lỗi khi lưu lịch trình:', error);
    return sendResponse(res, 500, 'Lỗi hệ thống khi lưu lịch trình', { error: error.message });
  }
};

/**
 * [SMART-104] API Lấy danh sách lộ trình của người dùng
 * GET /api/tripplan/my-plans
 */
export const getMyTripPlans = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || '6adf16d84430d1c8c1484c91';
    const plans = await TripPlan.find({ userId })
      .populate('linkedBookings')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Lấy danh sách lộ trình thành công', plans);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lộ trình:', error);
    return sendResponse(res, 500, 'Lỗi hệ thống khi lấy danh sách lộ trình', { error: error.message });
  }
};

/**
 * [SMART-104] API Lấy chi tiết một lộ trình theo ID
 * GET /api/tripplan/:id
 */
export const getTripPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await TripPlan.findById(id).populate('linkedBookings');
    if (!plan) {
      return sendResponse(res, 404, 'Không tìm thấy lộ trình du lịch này');
    }
    return sendResponse(res, 200, 'Lấy chi tiết lộ trình thành công', plan);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết lộ trình:', error);
    return sendResponse(res, 500, 'Lỗi hệ thống khi lấy chi tiết lộ trình', { error: error.message });
  }
};

/**
 * [SMART-104] API Xóa một lộ trình
 * DELETE /api/tripplan/:id
 */
export const deleteTripPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TripPlan.findByIdAndDelete(id);
    if (!deleted) {
      return sendResponse(res, 404, 'Không tìm thấy lộ trình cần xóa');
    }
    return sendResponse(res, 200, 'Đã xóa lộ trình thành công');
  } catch (error) {
    console.error('Lỗi khi xóa lộ trình:', error);
    return sendResponse(res, 500, 'Lỗi hệ thống khi xóa lộ trình', { error: error.message });
  }
};

export default {
  generateTripPlan,
  saveTripPlan,
  getMyTripPlans,
  getTripPlanById,
  deleteTripPlan
};

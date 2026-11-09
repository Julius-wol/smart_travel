import { calculateDistanceKm, scanNearbyPOIsInRadius, generateLocalSmartItinerary } from '../src/services/tripPlanService.js';
import request from 'supertest';
import app from '../server.js';

describe('SMART-104: AI Smart Trip Itinerary & Maps Service Tests', () => {
  const sampleHomestay = {
    title: 'An Nhiên Boutique Homestay Mỹ Khê',
    address: '120 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    city: 'Đà Nẵng',
    lat: 16.0601,
    lng: 108.2435
  };

  describe('1. Haversine Distance Calculation', () => {
    it('phải tính đúng khoảng cách giữa hai toạ độ GPS', () => {
      // Khoảng cách giữa 2 điểm gần nhau ở Đà Nẵng (~ 1.5 - 3 km)
      const dist = calculateDistanceKm(16.0601, 108.2435, 16.0682, 108.2215);
      expect(typeof dist).toBe('number');
      expect(dist).toBeGreaterThan(1);
      expect(dist).toBeLessThan(5);
    });

    it('phải trả về null nếu toạ độ không hợp lệ', () => {
      expect(calculateDistanceKm(undefined, 108, 16, 108)).toBeNull();
    });
  });

  describe('2. Quét địa điểm ẩm thực & check-in trong bán kính quanh homestay', () => {
    it('phải quét và phân loại danh sách quán ăn ngon và điểm tham quan theo bán kính 5km', () => {
      const result = scanNearbyPOIsInRadius(sampleHomestay, 5);

      expect(result).toHaveProperty('all');
      expect(result).toHaveProperty('foodSpots');
      expect(result).toHaveProperty('attractions');
      expect(result).toHaveProperty('homestayInfo');

      expect(result.foodSpots.length).toBeGreaterThan(0);
      expect(result.attractions.length).toBeGreaterThan(0);

      // Mọi địa điểm phải có thuộc tính khoảng cách và mapUrl
      const firstFood = result.foodSpots[0];
      expect(firstFood).toHaveProperty('distanceKm');
      expect(firstFood).toHaveProperty('mapUrl');
      expect(firstFood.mapUrl).toContain('google.com/maps');
    });

    it('phải xử lý được trường hợp bán kính nhỏ (3km)', () => {
      const result = scanNearbyPOIsInRadius(sampleHomestay, 3);
      expect(result.all.length).toBeGreaterThan(0);
      expect(result.all[0].distanceKm).toBeLessThanOrEqual(5); // Có cơ chế fallback gần nhất
    });
  });

  describe('3. Trình sinh Lộ trình AI Thông minh theo ngày (Stay-Centric Planner)', () => {
    it('phải sinh lịch trình chi tiết từng ngày bao gồm Sáng, Trưa, Chiều, Tối xuất phát từ homestay', () => {
      const nearbyData = scanNearbyPOIsInRadius(sampleHomestay, 5);
      const itinerary = generateLocalSmartItinerary({
        homestayInfo: nearbyData.homestayInfo,
        nearbyData,
        days: 3,
        radiusKm: 5
      });

      expect(itinerary).toHaveProperty('title');
      expect(itinerary.days).toBe(3);
      expect(itinerary.radiusKm).toBe(5);
      expect(itinerary.totalBudget).toBeGreaterThan(0);
      expect(itinerary.schedule.length).toBe(3);

      const day1 = itinerary.schedule[0];
      expect(day1.day).toBe(1);
      expect(day1.activities.length).toBeGreaterThanOrEqual(4);

      // Phải có đủ các buổi
      const periods = day1.activities.map(a => a.period);
      expect(periods).toContain('Sáng');
      expect(periods).toContain('Trưa');
      expect(periods).toContain('Tối');
    });
  });

  describe('4. API POST /api/tripplan/generate', () => {
    it('phải trả về mã 200 và dữ liệu lộ trình khi truyền thông tin homestay và bán kính', async () => {
      const res = await request(app)
        .post('/api/tripplan/generate')
        .send({
          homestay: sampleHomestay,
          radiusKm: 5,
          days: 2,
          preferences: ['Biển & Check-in', 'Món ngon địa phương']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('schedule');
      expect(res.body.data.schedule.length).toBe(2);
      expect(res.body.data.radiusKm).toBe(5);
    });
  });
});


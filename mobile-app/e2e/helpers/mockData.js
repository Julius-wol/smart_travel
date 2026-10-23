/**
 * Mock Data cho E2E Integration Tests
 * Phục vụ các kịch bản kiểm thử luồng người dùng thực tế
 */

export const mockRooms = [
  {
    _id: 'room_danang_01',
    name: 'An Nhiên Eco Retreat Đà Nẵng',
    city: 'Đà Nẵng',
    address: 'Bán đảo Sơn Trà, Đà Nẵng',
    price: 1250000,
    pricePerNight: 1250000,
    originalPrice: 1650000,
    discountPercent: 24,
    rating: 4.95,
    reviewCount: 128,
    distanceInfo: '2.5km tới Bãi Bụt',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    aiRecommended: true,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
    ],
    amenities: [
      { id: '1', name: 'Wifi 250Mbps', icon: 'wifi', _id: 'amenity_1' },
      { id: '2', name: 'Bếp riêng', icon: 'restaurant', _id: 'amenity_2' },
      { id: '3', name: 'Hồ bơi vô cực', icon: 'water', _id: 'amenity_3' },
    ],
    description: 'Không gian nghỉ dưỡng hòa mình vào thiên nhiên bán đảo Sơn Trà.',
  },
  {
    _id: 'room_danang_02',
    name: 'Sơn Trà Sunset Villa & Studio',
    city: 'Đà Nẵng',
    address: 'Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    price: 850000,
    pricePerNight: 850000,
    originalPrice: 1050000,
    discountPercent: 19,
    rating: 4.88,
    reviewCount: 94,
    distanceInfo: 'Cách bãi biển Mỹ Khê 200m',
    cancellationPolicy: 'Miễn phí hủy phòng trước 24h',
    aiRecommended: false,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    ],
    amenities: [
      { id: '1', name: 'Wifi tốc độ cao', icon: 'wifi', _id: 'amenity_1' },
      { id: '4', name: 'Gần biển', icon: 'beach', _id: 'amenity_4' },
    ],
    description: 'Phòng studio view biển ngắm hoàng hôn tuyệt đẹp.',
  },
];

export const mockRoomDetail = {
  ...mockRooms[0],
  fullAmenities: [
    { id: '1', name: 'Wifi 250Mbps', icon: 'wifi' },
    { id: '2', name: 'Bếp riêng', icon: 'restaurant' },
    { id: '3', name: 'Hồ bơi vô cực', icon: 'water' },
    { id: '5', name: 'Máy sấy tóc', icon: 'hardware' },
    { id: '6', name: 'Điều hòa 2 chiều', icon: 'snow' },
  ],
  host: {
    _id: 'host_01',
    name: 'Nguyễn Văn Minh',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    isSuperHost: true,
  },
};

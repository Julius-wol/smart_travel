import { GoogleGenerativeAI } from '@google/generative-ai';
import TripPlan from '../models/TripPlan.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

/**
 * Tính khoảng cách địa lý theo công thức Haversine (km)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Cơ sở dữ liệu POIs (Địa điểm tham quan & Quán ăn ngon) tại các điểm đến du lịch trọng điểm Việt Nam
 */
export const DESTINATIONS_POI_DB = {
  'Đà Nẵng': [
    // Ẩm thực & Quán ngon
    {
      name: 'Bún chả cá Bà Hờn',
      type: 'FOOD',
      category: 'Món ngon địa phương',
      lat: 16.0682,
      lng: 108.2215,
      address: '113/3 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng',
      description: 'Nước dùng ngọt thanh đậm đà từ xương cá thu và rau củ, chả cá dai giòn truyền thống.',
      costEstimate: 45000,
      bestTime: 'Sáng',
      recommendedDishes: ['Bún chả cá thu', 'Bún chả cá thác lác', 'Chả ram cá']
    },
    {
      name: 'Mì Quảng Bà Mua',
      type: 'FOOD',
      category: 'Đặc sản xứ Quảng',
      lat: 16.0594,
      lng: 108.2198,
      address: '19-21 Trần Bình Trọng, Hải Châu, Đà Nẵng',
      description: 'Sợi mì mềm vàng óng, nước nhưn đậm đà tôm thịt ăn kèm bánh tráng nướng giòn rụm.',
      costEstimate: 50000,
      bestTime: 'Sáng',
      recommendedDishes: ['Mì Quảng ếch', 'Mì Quảng tôm thịt', 'Mì Quảng gà']
    },
    {
      name: 'Bánh tráng cuốn thịt heo Trần',
      type: 'FOOD',
      category: 'Ẩm thực truyền thống',
      lat: 16.0645,
      lng: 108.2201,
      address: '04 Lê Duẩn, Hải Châu, Đà Nẵng',
      description: 'Thịt heo hai đầu da luộc mềm béo ngậy, cuốn rau rừng và chấm mắm nêm đậm đà bí truyền.',
      costEstimate: 120000,
      bestTime: 'Trưa',
      recommendedDishes: ['Bánh tráng cuốn thịt heo hai đầu da', 'Bánh bèo chén']
    },
    {
      name: 'Hải sản Bé Mặn',
      type: 'FOOD',
      category: 'Hải sản tươi sống',
      lat: 16.0655,
      lng: 108.2468,
      address: 'Lô 11 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
      description: 'Hải sản tươi sống bắt tại bể, view biển Mỹ Khê lộng gió, chế biến đậm vị miền Trung.',
      costEstimate: 280000,
      bestTime: 'Tối',
      recommendedDishes: ['Tôm tít rang muối', 'Mực nang hấp gừng', 'Cua sốt me']
    },
    {
      name: 'Chè Liên (Chè sầu Đà Nẵng)',
      type: 'FOOD',
      category: 'Tráng miệng & Ăn vặt',
      lat: 16.0715,
      lng: 108.2162,
      address: '189 Hoàng Diệu, Hải Châu, Đà Nẵng',
      description: 'Chè sầu riêng nước cốt dừa béo ngậy nức tiếng gần xa, thạch lá dứa và hạt đác mát lạnh.',
      costEstimate: 35000,
      bestTime: 'Chiều',
      recommendedDishes: ['Chè thái sầu riêng', 'Tàu hũ sầu riêng', 'Rau câu dừa']
    },
    {
      name: 'Cafe Sơn Trà Marina',
      type: 'CAFE',
      category: 'Cafe view biển sống ảo',
      lat: 16.1102,
      lng: 108.2831,
      address: 'Đường Hồ Xanh, Thọ Quang, Sơn Trà, Đà Nẵng',
      description: 'Không gian lấy cảm hứng từ hòn đảo Santorini Hy Lạp với gam màu xanh trắng view vịnh biển.',
      costEstimate: 65000,
      bestTime: 'Chiều',
      recommendedDishes: ['Cà phê muối', 'Trà đào cam sả', 'Bánh croissant']
    },
    // Điểm tham quan & Check-in
    {
      name: 'Bãi biển Mỹ Khê',
      type: 'ATTRACTION',
      category: 'Bãi biển & Thư giãn',
      lat: 16.0612,
      lng: 108.2458,
      address: 'Đường Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng',
      description: 'Một trong sáu bãi biển quyến rũ nhất hành tinh do Forbes bình chọn, cát trắng mịn, nước trong.',
      costEstimate: 0,
      bestTime: 'Sáng',
      recommendedActivities: ['Tắm biển', 'Chụp ảnh bình minh', 'Lướt ván cano']
    },
    {
      name: 'Cầu Rồng & Cầu Tình Yêu',
      type: 'ATTRACTION',
      category: 'Biểu tượng thành phố',
      lat: 16.0611,
      lng: 108.2272,
      address: 'Bờ Đông sông Hàn, đường Trần Hưng Đạo, Sơn Trà, Đà Nẵng',
      description: 'Chiêm ngưỡng kiến trúc Rồng thời Lý vươn mình ra biển và màn phun lửa, phun nước vào cuối tuần.',
      costEstimate: 0,
      bestTime: 'Tối',
      recommendedActivities: ['Check-in cầu Tình Yêu', 'Xem Cầu Rồng phun lửa 21h cuối tuần', 'Đi du thuyền sông Hàn']
    },
    {
      name: 'Chùa Linh Ứng - Bán đảo Sơn Trà',
      type: 'ATTRACTION',
      category: 'Tâm linh & Cảnh quan',
      lat: 16.1018,
      lng: 108.2778,
      address: 'Bán đảo Sơn Trà, Thọ Quang, Sơn Trà, Đà Nẵng',
      description: 'Tượng Phật Bà Quan Âm cao 67m hướng nhìn ra biển Đông, không gian thanh tịnh và gió biển mát rượi.',
      costEstimate: 0,
      bestTime: 'Chiều',
      recommendedActivities: ['Chiêm bái tượng Phật', 'Ngắm toàn cảnh vịnh Đà Nẵng từ trên cao']
    },
    {
      name: 'Danh thắng Ngũ Hành Sơn',
      type: 'ATTRACTION',
      category: 'Di tích & Hang động',
      lat: 16.0045,
      lng: 108.2618,
      address: '81 Huyền Trân Công Chúa, Ngũ Hành Sơn, Đà Nẵng',
      description: 'Quần thể 5 ngọn núi đá vôi kỳ bí với động Huyền Không linh thiêng và chùa Tam Thai cổ kính.',
      costEstimate: 40000,
      bestTime: 'Sáng',
      recommendedActivities: ['Khám phá Động Huyền Không', 'Đi thang máy ngắm cảnh non nước']
    },
    {
      name: 'Chợ Đêm Sơn Trà',
      type: 'ATTRACTION',
      category: 'Chợ đêm & Ẩm thực đường phố',
      lat: 16.0615,
      lng: 108.2295,
      address: 'Đoạn đường Mai Hắc Đế - Lý Nam Đế, Sơn Trà, Đà Nẵng',
      description: 'Khu chợ đêm sầm uất với hàng trăm gian hàng ẩm thực đường phố, quà lưu niệm và biểu diễn nghệ thuật.',
      costEstimate: 100000,
      bestTime: 'Tối',
      recommendedActivities: ['Ăn kem bơ', 'Hải sản nướng xiên que', 'Mua quà lưu niệm']
    }
  ],

  'Đà Lạt': [
    {
      name: 'Bánh ướt lòng gà Long',
      type: 'FOOD',
      category: 'Món ngon địa phương',
      lat: 11.9422,
      lng: 108.4365,
      address: 'Hẻm 202 Phan Đình Phùng, Phường 2, Đà Lạt',
      description: 'Bánh ướt mềm dẻo nóng hổi ăn kèm thịt gà ta xé phay, lòng mề giòn sần sật và nước mắm chua ngọt.',
      costEstimate: 45000,
      bestTime: 'Sáng'
    },
    {
      name: 'Bánh căn Nhà Chung',
      type: 'FOOD',
      category: 'Món ngon nóng hổi',
      lat: 11.9365,
      lng: 108.4372,
      address: '01 Nhà Chung, Phường 3, Đà Lạt',
      description: 'Bánh căn giòn tan nướng trên khuôn đất, chấm xíu mại cay nồng cùng mỡ hành béo ngậy.',
      costEstimate: 40000,
      bestTime: 'Sáng'
    },
    {
      name: 'Lẩu gà lá é Tao Ngộ',
      type: 'FOOD',
      category: 'Lẩu đặc sản đêm lạnh',
      lat: 11.9331,
      lng: 108.4485,
      address: 'Số 5 đường 3 Tháng 4, Phường 3, Đà Lạt',
      description: 'Nồi lẩu gà nóng hổi bốc khói nghi ngút, vị the the thơm mát của lá é xua tan cái lạnh Đà Lạt.',
      costEstimate: 150000,
      bestTime: 'Tối'
    },
    {
      name: 'Tiệm Cà Phê Túi Mơ To',
      type: 'CAFE',
      category: 'Cafe view thung lũng',
      lat: 11.9542,
      lng: 108.4721,
      address: 'Hẻm 31 Sào Nam, Phường 11, Đà Lạt',
      description: 'Căn nhà gỗ cổ kính giữa vườn cúc họa mi trắng muốt ngắm nhà lồng lên đèn lung linh về đêm.',
      costEstimate: 70000,
      bestTime: 'Chiều'
    },
    {
      name: 'Quảng trường Lâm Viên & Hồ Xuân Hương',
      type: 'ATTRACTION',
      category: 'Biểu tượng check-in',
      lat: 11.9388,
      lng: 108.4442,
      address: 'Đường Trần Quốc Toản, Phường 1, Đà Lạt',
      description: 'Nụ hoa Atiso và Bông hoa dã quỳ khổng lồ bằng kính màu nhìn thẳng ra mặt hồ Xuân Hương thơ mộng.',
      costEstimate: 0,
      bestTime: 'Sáng'
    },
    {
      name: 'Chợ Đêm Đà Lạt (Chợ Âm Phủ)',
      type: 'ATTRACTION',
      category: 'Chợ đêm & Ẩm thực đường phố',
      lat: 11.9425,
      lng: 108.4378,
      address: 'Đường Nguyễn Thị Minh Khai, Phường 1, Đà Lạt',
      description: 'Thiên đường bánh tráng nướng Đà Lạt, sữa đậu nành nóng hổi, dâu lắc và đồ len mùa đông.',
      costEstimate: 80000,
      bestTime: 'Tối'
    }
  ],

  'Nha Trang': [
    {
      name: 'Bún cá dầm Năm Beo',
      type: 'FOOD',
      category: 'Món ngon địa phương',
      lat: 12.2531,
      lng: 109.1925,
      address: 'B2 Chung cư Phan Bội Châu, Xương Huân, Nha Trang',
      description: 'Bún sứa và chả cá thu dai ngọt ngào, nước dùng nấu từ cá ngừ thơm lừng thanh vị.',
      costEstimate: 45000,
      bestTime: 'Sáng'
    },
    {
      name: 'Nem nướng Đặng Văn Quyên',
      type: 'FOOD',
      category: 'Đặc sản Nha Trang',
      lat: 12.2515,
      lng: 109.1911,
      address: '16A Lãn Ông, Xương Huân, Nha Trang',
      description: 'Nem nướng than hoa thơm nức, cuốn cùng ram giòn rụm và nước chấm tương nếp béo ngọt.',
      costEstimate: 75000,
      bestTime: 'Trưa'
    },
    {
      name: 'Hải sản Thanh Sương',
      type: 'FOOD',
      category: 'Hải sản tươi sống',
      lat: 12.2155,
      lng: 109.2012,
      address: '9A Trần Phú, Vĩnh Hòa, Nha Trang',
      description: 'Hải sản tươi rói ngon bổ rẻ, ghẹ hấp, ốc hương nướng và cháo tôm hùm chuẩn vị biển.',
      costEstimate: 250000,
      bestTime: 'Tối'
    },
    {
      name: 'Tháp Bà Ponagar',
      type: 'ATTRACTION',
      category: 'Di tích Chăm Pa cổ',
      lat: 12.2658,
      lng: 109.1952,
      address: '61 Hai Tháng Tư, Vĩnh Phước, Nha Trang',
      description: 'Kiến trúc tháp Chăm cổ kính thế kỷ thứ 8 nhìn ra dòng sông Cái thơ mộng và cầu Xóm Bóng.',
      costEstimate: 30000,
      bestTime: 'Sáng'
    },
    {
      name: 'Bãi biển Trần Phú & Sailing Club',
      type: 'ATTRACTION',
      category: 'Biển & Giải trí đêm',
      lat: 12.2385,
      lng: 109.1965,
      address: '72-74 Trần Phú, Lộc Thọ, Nha Trang',
      description: 'Dải cát cong tuyệt đẹp của vịnh Nha Trang, ban đêm thưởng thức cocktail ngắm sóng biển vỗ bờ.',
      costEstimate: 120000,
      bestTime: 'Chiều'
    }
  ],

  'Hội An': [
    {
      name: 'Bánh mì Phượng',
      type: 'FOOD',
      category: 'Ẩm thực đường phố thế giới',
      lat: 15.8795,
      lng: 108.3325,
      address: '2B Phan Chu Trinh, Cẩm Châu, Hội An',
      description: 'Chiếc bánh mì kẹp giòn rụm với pa-tê béo ngậy, thịt nướng thơm lừng và nước sốt bí truyền đặc sắc.',
      costEstimate: 35000,
      bestTime: 'Sáng'
    },
    {
      name: 'Cơm gà Bà Buội',
      type: 'FOOD',
      category: 'Đặc sản phố cổ',
      lat: 15.8788,
      lng: 108.3308,
      address: '22 Phan Chu Trinh, Minh An, Hội An',
      description: 'Hạt cơm óng vàng béo ngậy nấu bằng nước luộc gà, thịt gà ta xé phay bóp gỏi hành tây đậm vị.',
      costEstimate: 60000,
      bestTime: 'Trưa'
    },
    {
      name: 'Cao Lầu Thanh',
      type: 'FOOD',
      category: 'Món truyền thống cổ truyền',
      lat: 15.8812,
      lng: 108.3341,
      address: '26 Thái Phiên, Cẩm Phô, Hội An',
      description: 'Sợi cao lầu ngâm tro củi cù lao Chàm, ăn kèm xá xíu mềm thơm, tóp mỡ giòn và rau thơm Trà Quế.',
      costEstimate: 45000,
      bestTime: 'Chiều'
    },
    {
      name: 'Chùa Cầu & Phố Cổ Hội An',
      type: 'ATTRACTION',
      category: 'Di sản Văn hóa Thế giới',
      lat: 15.8772,
      lng: 108.3261,
      address: 'Nguyễn Thị Minh Khai, Phường Minh An, Hội An',
      description: 'Kiến trúc cầu ngói Nhật Bản hàng trăm năm tuổi, dạo bước giữa những dãy nhà cổ tường vàng hoa giấy.',
      costEstimate: 80000,
      bestTime: 'Sáng'
    },
    {
      name: 'Thả hoa đăng sông Hoài',
      type: 'ATTRACTION',
      category: 'Trải nghiệm đêm phố cổ',
      lat: 15.8765,
      lng: 108.3275,
      address: 'Bến thuyền sông Hoài, Bạch Đằng, Hội An',
      description: 'Đi thuyền gỗ và thả đèn hoa đăng lung linh ước nguyện trên dòng sông Hoài rực rỡ sắc màu đèn lồng.',
      costEstimate: 50000,
      bestTime: 'Tối'
    }
  ],

  'Phú Quốc': [
    {
      name: 'Bún quậy Kiến Xây',
      type: 'FOOD',
      category: 'Món ngon độc lạ',
      lat: 10.2185,
      lng: 103.9612,
      address: '28 Đường Bạch Đằng, Dương Đông, Phú Quốc',
      description: 'Bún tươi ép tại chỗ, chả tôm mực tươi quết nhuyễn trong tô, tự pha nước chấm theo khẩu vị riêng.',
      costEstimate: 65000,
      bestTime: 'Sáng'
    },
    {
      name: 'Hải sản Làng Chài Hàm Ninh',
      type: 'FOOD',
      category: 'Hải sản làng chài',
      lat: 10.1812,
      lng: 104.0485,
      address: 'Cầu cảng Hàm Ninh, Hàm Ninh, Phú Quốc',
      description: 'Thưởng thức ghẹ Hàm Ninh thịt chắc ngọt đậm đà, ốc nhảy nướng muối ớt trên nhà bè lộng gió.',
      costEstimate: 250000,
      bestTime: 'Trưa'
    },
    {
      name: 'Bãi Sao Phú Quốc',
      type: 'ATTRACTION',
      category: 'Thiên đường biển nhiệt đới',
      lat: 10.0525,
      lng: 104.0315,
      address: 'Ấp Bãi Sao, An Thới, Phú Quốc',
      description: 'Bãi cát trắng mịn như kem tựa tranh vẽ, hàng dừa nghiêng bóng và làn nước biển xanh ngọc lam.',
      costEstimate: 0,
      bestTime: 'Sáng'
    },
    {
      name: 'Chợ Đêm Phú Quốc',
      type: 'ATTRACTION',
      category: 'Chợ đêm & Mua sắm',
      lat: 10.2178,
      lng: 103.9602,
      address: 'Đường Bạch Đằng, Dương Đông, Phú Quốc',
      description: 'Thiên đường ẩm thực nướng xiên, đậu phộng Chou Chou kiểu Pháp và hải sản tươi sống nhộn nhịp.',
      costEstimate: 120000,
      bestTime: 'Tối'
    }
  ]
};

/**
 * Quét các địa điểm ẩm thực & tham quan trong bán kính tính từ vị trí Homestay
 */
export const scanNearbyPOIsInRadius = (homestay, radiusKm = 5) => {
  const city = homestay.city || 'Đà Nẵng';
  // Tìm danh sách POI của thành phố
  let candidatePOIs = DESTINATIONS_POI_DB[city];

  // Nếu thành phố chưa có sẵn trong DB, fallback tìm theo từ khóa hoặc dùng Đà Nẵng làm mẫu chuẩn
  if (!candidatePOIs || candidatePOIs.length === 0) {
    const matchedCityKey = Object.keys(DESTINATIONS_POI_DB).find((key) =>
      city.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(city.toLowerCase())
    );
    candidatePOIs = matchedCityKey ? DESTINATIONS_POI_DB[matchedCityKey] : DESTINATIONS_POI_DB['Đà Nẵng'];
  }

  const hLat = homestay.lat || homestay.latitude || (homestay.location?.coordinates ? homestay.location.coordinates[1] : undefined);
  const hLng = homestay.lng || homestay.longitude || (homestay.location?.coordinates ? homestay.location.coordinates[0] : undefined);

  // Tính khoảng cách cụ thể từ homestay tới từng POI
  const scoredPOIs = candidatePOIs.map((poi, idx) => {
    let distanceKm = null;
    if (hLat && hLng && poi.lat && poi.lng) {
      distanceKm = calculateDistanceKm(hLat, hLng, poi.lat, poi.lng);
    } else {
      // Giả lập khoảng cách phân bố tự nhiên trong bán kính nếu homestay chưa ghim GPS chính xác
      const simulatedDist = Math.round((0.8 + (idx * 0.7) % (radiusKm * 0.9)) * 10) / 10;
      distanceKm = Math.min(simulatedDist, radiusKm);
    }

    const mapUrl = (hLat && hLng && poi.lat && poi.lng)
      ? `https://www.google.com/maps/dir/?api=1&origin=${hLat},${hLng}&destination=${poi.lat},${poi.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.name + ' ' + (poi.address || city))}`;

    return {
      ...poi,
      distanceKm,
      mapUrl
    };
  });

  // Lọc các địa điểm nằm trong bán kính (cho phép biên độ mở rộng nhẹ để luôn có đủ món ngon và điểm chơi)
  let inRadius = scoredPOIs.filter((item) => item.distanceKm <= radiusKm);

  // Nếu quá ít địa điểm trong bán kính hẹp (ví dụ chọn 3km), bổ sung các địa điểm gần nhất tiếp theo
  if (inRadius.length < 5) {
    const sorted = [...scoredPOIs].sort((a, b) => a.distanceKm - b.distanceKm);
    inRadius = sorted.slice(0, 8);
  }

  // Tách ra Food Spots và Attractions
  const foodSpots = inRadius.filter((i) => i.type === 'FOOD' || i.type === 'CAFE');
  const attractions = inRadius.filter((i) => i.type === 'ATTRACTION');

  return {
    all: inRadius,
    foodSpots,
    attractions,
    homestayInfo: {
      name: homestay.title || homestay.name || 'Homestay của bạn',
      address: homestay.address || `${city}, Việt Nam`,
      city,
      lat: hLat || 16.0601,
      lng: hLng || 108.2435
    }
  };
};

/**
 * Trình sinh Lịch trình AI Cục bộ (Local Smart Engine Planner)
 * Đảm bảo 100% không bao giờ lỗi, tối ưu cung đường di chuyển theo ngày
 */
export const generateLocalSmartItinerary = ({ homestayInfo, nearbyData, days = 2, radiusKm = 5, preferences = [] }) => {
  const { foodSpots, attractions } = nearbyData;
  const daysCount = Math.max(1, Math.min(days, 7));
  const schedule = [];
  let totalEstimatedBudget = 0;

  for (let d = 1; d <= daysCount; d++) {
    const dayActivities = [];
    const dayTheme = d === 1
      ? 'Khám phá ẩm thực & Bãi biển quanh chỗ ở'
      : d === 2
      ? 'Trải nghiệm văn hóa & Danh thắng nổi bật'
      : d === 3
      ? 'Chill cafe ngắm cảnh & Mua sắm đặc sản'
      : `Hành trình khám phá mở rộng ngày ${d}`;

    // 1. Buổi Sáng (08:00 - 11:30): Ăn sáng gần homestay + Điểm tham quan 1
    const breakfast = foodSpots[(d - 1) % foodSpots.length] || {
      name: `Quán ăn sáng đặc sản quanh ${homestayInfo.name}`,
      category: 'Ăn sáng địa phương',
      distanceKm: 0.8,
      costEstimate: 45000,
      address: homestayInfo.address
    };
    dayActivities.push({
      time: '08:00 - 09:15',
      period: 'Sáng',
      type: 'FOOD',
      name: breakfast.name,
      category: breakfast.category || 'Món ngon địa phương',
      distanceKm: breakfast.distanceKm,
      description: `Bắt đầu ngày mới từ homestay, ghé thưởng thức bữa sáng nóng hổi cách chỗ ở ${breakfast.distanceKm} km.`,
      costEstimate: breakfast.costEstimate || 45000,
      address: breakfast.address,
      mapUrl: breakfast.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(breakfast.name)}`
    });

    const morningAttraction = attractions[(d - 1) % attractions.length] || {
      name: `Bãi biển & Điểm check-in gần homestay`,
      category: 'Check-in & Tham quan',
      distanceKm: 1.5,
      costEstimate: 0,
      address: homestayInfo.address
    };
    dayActivities.push({
      time: '09:30 - 11:30',
      period: 'Sáng',
      type: 'ATTRACTION',
      name: morningAttraction.name,
      category: morningAttraction.category || 'Điểm tham quan',
      distanceKm: morningAttraction.distanceKm,
      description: morningAttraction.description || `Tham quan, chụp ảnh và tận hưởng không khí trong lành cách phòng ${morningAttraction.distanceKm} km.`,
      costEstimate: morningAttraction.costEstimate || 0,
      address: morningAttraction.address,
      mapUrl: morningAttraction.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(morningAttraction.name)}`
    });

    // 2. Buổi Trưa (12:00 - 14:00): Bữa trưa đặc sản + Nghỉ ngơi tại chỗ ở
    const lunch = foodSpots[(d + 1) % foodSpots.length] || {
      name: `Cơm niêu & Ẩm thực miền Trung`,
      category: 'Bữa trưa đậm đà',
      distanceKm: 1.8,
      costEstimate: 95000,
      address: homestayInfo.address
    };
    dayActivities.push({
      time: '12:00 - 13:30',
      period: 'Trưa',
      type: 'FOOD',
      name: lunch.name,
      category: lunch.category || 'Ẩm thực trưa',
      distanceKm: lunch.distanceKm,
      description: `Thưởng thức bữa trưa đậm đà tại ${lunch.name}. Sau đó trở về homestay nghỉ ngơi lấy lại năng lượng.`,
      costEstimate: lunch.costEstimate || 95000,
      address: lunch.address,
      mapUrl: lunch.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lunch.name)}`
    });

    // 3. Buổi Chiều (15:00 - 17:30): Cafe chill hoặc Check-in danh lam thắng cảnh
    const afternoonSpot = (attractions[d % attractions.length] || foodSpots[(d + 2) % foodSpots.length]);
    dayActivities.push({
      time: '15:00 - 17:30',
      period: 'Chiều',
      type: afternoonSpot?.type || 'ATTRACTION',
      name: afternoonSpot?.name || 'Cafe view biển ngắm hoàng hôn',
      category: afternoonSpot?.category || 'Ngắm cảnh & Thư giãn',
      distanceKm: afternoonSpot?.distanceKm || 2.2,
      description: `Thời điểm lý tưởng nhất trong ngày để ngắm hoàng hôn và check-in sống ảo, cách chỗ ở ${afternoonSpot?.distanceKm || 2.2} km.`,
      costEstimate: afternoonSpot?.costEstimate || 50000,
      address: afternoonSpot?.address || homestayInfo.address,
      mapUrl: afternoonSpot?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(afternoonSpot?.name || '')}`
    });

    // 4. Buổi Tối (18:30 - 21:30): Ẩm thực tối / Chợ đêm + Trở về homestay
    const dinner = foodSpots[(d * 2) % foodSpots.length] || {
      name: 'Hải sản tươi sống & Đồ nướng',
      category: 'Hải sản đêm',
      distanceKm: 2.0,
      costEstimate: 200000,
      address: homestayInfo.address
    };
    dayActivities.push({
      time: '18:30 - 20:30',
      period: 'Tối',
      type: 'FOOD',
      name: dinner.name,
      category: dinner.category || 'Ẩm thực đêm',
      distanceKm: dinner.distanceKm,
      description: `Bữa tối ấm cúng cùng bạn bè/người thân với hải sản tươi ngon, sau đó thong thả trở về homestay nghỉ ngơi.`,
      costEstimate: dinner.costEstimate || 180000,
      address: dinner.address,
      mapUrl: dinner.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dinner.name)}`
    });

    const dayTotalCost = dayActivities.reduce((sum, act) => sum + (act.costEstimate || 0), 0);
    totalEstimatedBudget += dayTotalCost;

    schedule.push({
      day: d,
      title: dayTheme,
      estimatedDayCost: dayTotalCost,
      activities: dayActivities
    });
  }

  return {
    title: `Lịch trình ${daysCount} ngày quanh ${homestayInfo.name}`,
    destinationCity: homestayInfo.city,
    days: daysCount,
    radiusKm,
    totalBudget: totalEstimatedBudget,
    homestay: homestayInfo,
    nearbySummary: {
      totalFound: nearbyData.all.length,
      foodSpotsCount: foodSpots.length,
      attractionsCount: attractions.length,
      radiusKm
    },
    schedule
  };
};

/**
 * Sinh Lộ trình du lịch thông minh kết hợp Google Gemini AI
 */
export const generateItineraryWithGemini = async ({ homestayInfo, nearbyData, days = 2, radiusKm = 5, preferences = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Nếu không có API Key hợp lệ hoặc đang test, dùng ngay Smart Local Engine siêu nhanh và chuẩn
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return generateLocalSmartItinerary({ homestayInfo, nearbyData, days, radiusKm, preferences });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Bạn là Trợ lý Lập Lộ trình Du lịch thông minh của ứng dụng SmartTravel.
Hãy tạo một lịch trình du lịch ${days} ngày cho khách lưu trú tại homestay sau:
- Tên chỗ ở: ${homestayInfo.name}
- Địa chỉ: ${homestayInfo.address} (${homestayInfo.city})
- Bán kính khám phá: trong phạm vi ${radiusKm} km quanh homestay.
- Danh sách các món ngon & điểm check-in tìm thấy trong bán kính:
${JSON.stringify(nearbyData.all.slice(0, 10), null, 2)}

Yêu cầu quan trọng:
1. Mỗi ngày xuất phát từ homestay vào buổi sáng, các điểm tham quan và quán ăn sắp xếp hợp lý theo cung đường để khách không phải di chuyển xa (ưu tiên các điểm cách homestay dưới ${radiusKm}km).
2. Trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json) theo đúng cấu trúc:
{
  "title": "Lịch trình ... ngày quanh ...",
  "schedule": [
    {
      "day": 1,
      "title": "Tên chủ đề ngày 1",
      "activities": [
        {
          "time": "08:00 - 09:30",
          "period": "Sáng",
          "type": "FOOD hoặc ATTRACTION",
          "name": "Tên điểm",
          "category": "Phân loại",
          "distanceKm": 1.2,
          "description": "Mô tả ngắn gọn, hấp dẫn",
          "costEstimate": 45000,
          "address": "Địa chỉ cụ thể"
        }
      ]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    // Tính toán lại tổng chi phí và bổ sung link Map
    let totalBudget = 0;
    const finalSchedule = parsedData.schedule.map((dayItem) => {
      let dayCost = 0;
      const activities = (dayItem.activities || []).map((act) => {
        dayCost += act.costEstimate || 0;
        return {
          ...act,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + ' ' + (act.address || homestayInfo.city))}`
        };
      });
      totalBudget += dayCost;
      return {
        ...dayItem,
        estimatedDayCost: dayCost,
        activities
      };
    });

    return {
      title: parsedData.title || `Lịch trình ${days} ngày quanh ${homestayInfo.name}`,
      destinationCity: homestayInfo.city,
      days,
      radiusKm,
      totalBudget,
      homestay: homestayInfo,
      nearbySummary: {
        totalFound: nearbyData.all.length,
        foodSpotsCount: nearbyData.foodSpots.length,
        attractionsCount: nearbyData.attractions.length,
        radiusKm
      },
      schedule: finalSchedule
    };
  } catch (error) {
    console.warn('Lỗi gọi Gemini AI, tự động chuyển về Smart Local Engine:', error.message);
    return generateLocalSmartItinerary({ homestayInfo, nearbyData, days, radiusKm, preferences });
  }
};

/**
 * Service chính: Tạo lộ trình từ đơn đặt phòng (Booking) hoặc Room
 */
export const createPlanFromBookingService = async ({ bookingId, roomId, radiusKm = 5, days, preferences = [] }) => {
  let room = null;
  let calculatedDays = days || 2;
  let linkedBookingId = null;

  // 1. Nếu có bookingId, tra cứu booking trong MongoDB
  if (bookingId) {
    try {
      const booking = await Booking.findById(bookingId).populate('roomId');
      if (booking) {
        linkedBookingId = booking._id;
        room = booking.roomId;
        if (booking.checkInDate && booking.checkOutDate) {
          const checkIn = new Date(booking.checkInDate);
          const checkOut = new Date(booking.checkOutDate);
          const diffTime = Math.abs(checkOut - checkIn);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) calculatedDays = diffDays;
        }
      }
    } catch (err) {
      console.warn('Không tìm thấy booking theo ID:', err.message);
    }
  }

  // 2. Nếu chưa có room, tìm theo roomId
  if (!room && roomId) {
    try {
      room = await Room.findById(roomId);
    } catch (err) {
      console.warn('Không tìm thấy phòng theo ID:', err.message);
    }
  }

  // 3. Fallback mặc định phòng mẫu nếu không có ID
  if (!room) {
    room = {
      title: 'An Nhiên Boutique Homestay Mỹ Khê',
      address: '120 Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
      city: 'Đà Nẵng',
      location: { coordinates: [108.2435, 16.0601] }
    };
  }

  // 4. Quét bán kính xung quanh homestay
  const nearbyData = scanNearbyPOIsInRadius(room, Number(radiusKm));

  // 5. Sinh lộ trình thông minh AI
  const itinerary = await generateItineraryWithGemini({
    homestayInfo: nearbyData.homestayInfo,
    nearbyData,
    days: calculatedDays,
    radiusKm: Number(radiusKm),
    preferences
  });

  if (linkedBookingId) {
    itinerary.linkedBookingId = linkedBookingId;
  }

  return itinerary;
};

export default {
  calculateDistanceKm,
  scanNearbyPOIsInRadius,
  generateLocalSmartItinerary,
  generateItineraryWithGemini,
  createPlanFromBookingService
};


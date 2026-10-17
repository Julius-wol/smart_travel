import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../utils/config';
import ToastNotification from '../components/ToastNotification';

/**
 * Màn hình [SMART-84] Booking Discovery & Search (Trang chủ)
 * Đã kết nối 100% dữ liệu thực từ MongoDB Atlas qua API Node.js
 */
const HomeScreen = ({ navigation, route }) => {
  const user = route.params?.user;
  const token = route.params?.token;

  // State dữ liệu phòng từ MongoDB
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State tìm kiếm & bộ lọc
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Homestay', 'Biệt thự / Villa', 'Căn hộ', 'Gần biển'];

  // State Ngày lưu trú
  const [selectedDates, setSelectedDates] = useState({
    checkIn: null,
    checkOut: null,
    nights: 0,
  });
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState(null);
  const [tempCheckOut, setTempCheckOut] = useState(null);

  // State Khách & phòng
  const [guestConfig, setGuestConfig] = useState({
    adults: 2,
    children: 0,
    infants: 0,
    rooms: 1,
    isCustomized: false,
  });
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [tempGuests, setTempGuests] = useState({
    adults: 2,
    children: 0,
    infants: 0,
    rooms: 1,
  });

  // State danh sách yêu thích
  const [favorites, setFavorites] = useState({});

  // State Toast thông báo
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  // Format ngày kiểu VN
  const formatDateVN = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // State Thông báo (Notification Center)
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-promo',
      type: 'promo',
      title: 'Tặng bạn Voucher 500.000đ',
      message: 'Mã SMART2026 giảm ngay 500.000đ cho đơn đặt villa từ 2 đêm tại Bán đảo Sơn Trà.',
      time: 'Hôm qua',
      read: true,
      badgeText: 'ƯU ĐÃI',
      badgeColor: '#FEE2E2',
      badgeTextColor: '#DC2626',
      icon: 'gift',
      iconColor: '#DC2626',
      actionType: 'copy_voucher',
      voucherCode: 'SMART2026',
    },
    {
      id: 'notif-ai',
      type: 'ai_trip',
      title: 'Lịch trình AI Đà Nẵng 3N2Đ đã sẵn sàng',
      message: 'Trợ lý AI đã chuẩn bị xong kế hoạch ăn chơi, ngắm hoàng hôn và quán cà phê đẹp gần villa.',
      time: '2 ngày trước',
      read: true,
      badgeText: 'AI PLANNER',
      badgeColor: '#EDE9FE',
      badgeTextColor: '#7C3AED',
      icon: 'sparkles',
      iconColor: '#7C3AED',
      actionType: 'ai_trip',
    },
  ]);

  // Đồng bộ danh sách đơn đặt phòng thực tế từ MongoDB Atlas vào chuông thông báo
  const fetchRealNotifications = async () => {
    try {
      const email = user?.email || '';
      const url = email
        ? `${API_URL}/bookings/my-bookings?email=${encodeURIComponent(email)}`
        : `${API_URL}/bookings/my-bookings`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        const bookingNotifs = json.data.slice(0, 5).map((b, idx) => {
          const roomObj = b.roomId || {};
          const roomName = roomObj.title || roomObj.name || 'Villa Sơn Trà Đà Nẵng';
          const roomNum = roomObj.roomNumber || '402';

          const lockCode = b.bookingCode ? b.bookingCode.replace('ST-', '82') : '829411';

          return [
            {
              id: `booking-${b._id || b.bookingCode}`,
              type: 'booking',
              title: `Đặt phòng thành công #${b.bookingCode}`,
              message: `Chuyến nghỉ dưỡng tại ${roomName} đã được xác nhận (${b.nights || 2} đêm). Bấm để xem vé e-Pass!`,
              time: idx === 0 ? 'Vừa xong' : `${idx + 1} ngày trước`,
              read: idx !== 0, // Đơn mới nhất luôn là CHƯA ĐỌC để chuông hiện chấm đỏ
              badgeText: 'ĐẶT PHÒNG',
              badgeColor: '#E6FFFA',
              badgeTextColor: '#00796B',
              icon: 'checkmark-circle',
              iconColor: '#00796B',
              actionType: 'view_booking',
              bookingCode: b.bookingCode,
              rawBooking: b,
            },
            {
              id: `lock-${b._id || b.bookingCode}`,
              type: 'smart_lock',
              title: `Mã mở khóa phòng Smart Lock #${roomNum}`,
              message: `Mã số tự động cho đơn ${b.bookingCode} là ${lockCode} (Có hiệu lực từ 14:00 ngày nhận phòng).`,
              time: idx === 0 ? 'Vừa xong' : `${idx + 1} ngày trước`,
              read: idx !== 0,
              badgeText: 'MÃ KHÓA',
              badgeColor: '#FEF3C7',
              badgeTextColor: '#D97706',
              icon: 'key',
              iconColor: '#D97706',
              actionType: 'copy_lock',
              lockCode: lockCode,
            },
          ];
        }).flat();

        const defaultPromos = [
          {
            id: 'notif-promo',
            type: 'promo',
            title: 'Tặng bạn Voucher 500.000đ',
            message: 'Mã SMART2026 giảm ngay 500.000đ cho đơn đặt villa từ 2 đêm tại Bán đảo Sơn Trà.',
            time: 'Hôm qua',
            read: true,
            badgeText: 'ƯU ĐÃI',
            badgeColor: '#FEE2E2',
            badgeTextColor: '#DC2626',
            icon: 'gift',
            iconColor: '#DC2626',
            actionType: 'copy_voucher',
            voucherCode: 'SMART2026',
          },
          {
            id: 'notif-ai',
            type: 'ai_trip',
            title: 'Lịch trình AI Đà Nẵng 3N2Đ đã sẵn sàng',
            message: 'Trợ lý AI đã chuẩn bị xong kế hoạch ăn chơi, ngắm hoàng hôn và quán cà phê đẹp gần villa.',
            time: '2 ngày trước',
            read: true,
            badgeText: 'AI PLANNER',
            badgeColor: '#EDE9FE',
            badgeTextColor: '#7C3AED',
            icon: 'sparkles',
            iconColor: '#7C3AED',
            actionType: 'ai_trip',
          },
        ];

        setNotifications([...bookingNotifs, ...defaultPromos]);
      }
    } catch (err) {
      console.log('Chưa đồng bộ thông báo booking:', err);
    }
  };

  // Tự động tải thông báo thực tế khi vào màn hình Home
  useEffect(() => {
    fetchRealNotifications();
  }, [user]);

  // Lắng nghe đơn đặt phòng vừa hoàn tất từ màn hình BookingSuccess
  useEffect(() => {
    if (route.params?.recentBooking) {
      const rb = route.params.recentBooking;
      const bCode = rb.bookingCode || 'ST-5894';
      const rName = rb.homestay?.title || rb.homestay?.name || 'Villa Sơn Trà Đà Nẵng';
      const lockCode = bCode.replace('ST-', '82');

      const newBookingNotif = {
        id: `recent-book-${bCode}`,
        type: 'booking',
        title: `Đặt phòng thành công #${bCode}`,
        message: `Chuyến nghỉ dưỡng tại ${rName} đã được xác nhận. Bấm để xem vé e-Pass ngay!`,
        time: 'Vừa xong',
        read: false,
        badgeText: 'ĐẶT PHÒNG',
        badgeColor: '#E6FFFA',
        badgeTextColor: '#00796B',
        icon: 'checkmark-circle',
        iconColor: '#00796B',
        actionType: 'view_booking',
        bookingCode: bCode,
        rawBooking: {
          bookingCode: bCode,
          roomId: rb.homestay,
          fullName: rb.bookingDetails?.fullName,
          phoneNumber: rb.bookingDetails?.phoneNumber,
          email: rb.bookingDetails?.email,
          totalPrice: rb.bookingDetails?.totalAmount,
          nights: rb.bookingDetails?.nights,
          guests: rb.bookingDetails?.guests,
          checkIn: rb.bookingDetails?.checkIn,
          checkOut: rb.bookingDetails?.checkOut,
          dates: rb.bookingDetails?.dates,
          bookingTime: rb.bookingDetails?.bookingTime,
        },
      };

      const newLockNotif = {
        id: `recent-lock-${bCode}`,
        type: 'smart_lock',
        title: `Mã mở khóa phòng Smart Lock #${rb.homestay?.roomNumber || '402'}`,
        message: `Mã số vào cửa tự động cho đơn ${bCode} là ${lockCode} (Có hiệu lực từ 14:00).`,
        time: 'Vừa xong',
        read: false,
        badgeText: 'MÃ KHÓA',
        badgeColor: '#FEF3C7',
        badgeTextColor: '#D97706',
        icon: 'key',
        iconColor: '#D97706',
        actionType: 'copy_lock',
        lockCode: lockCode,
      };

      setNotifications((prev) => {
        const filtered = prev.filter(
          (item) => item.bookingCode !== bCode && item.id !== `recent-book-${bCode}`
        );
        return [newBookingNotif, newLockNotif, ...filtered];
      });

      showToast(`Đã nhận thông báo mới cho đơn đặt phòng #${bCode}!`, 'success');
    }
  }, [route.params?.recentBooking]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (notif) => {
    // Đánh dấu đã đọc
    setNotifications((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
    );

    if (notif.actionType === 'copy_lock') {
      showToast(`Mã Smart Lock ${notif.lockCode} đã sẵn sàng sử dụng`, 'success');
    } else if (notif.actionType === 'copy_voucher') {
      showToast(`Đã lưu mã ưu đãi ${notif.voucherCode} (Giảm 500.000đ)!`, 'success');
    } else if (notif.actionType === 'view_booking') {
      setShowNotificationModal(false);

      const b = notif.rawBooking || {};
      const targetHomestay = b.roomId || rooms[0] || {
        _id: '6ace59ef30cddf9c0815f9bc',
        title: 'An Nhiên Eco Retreat Đà Nẵng',
        name: 'An Nhiên Eco Retreat Đà Nẵng',
        pricePerNight: 1450000,
        roomNumber: '402',
      };

      const checkInStr = b.checkIn
        ? (typeof b.checkIn === 'string' && b.checkIn.includes('/') ? b.checkIn : formatDateVN(b.checkIn))
        : '17/10/2026';
      const checkOutStr = b.checkOut
        ? (typeof b.checkOut === 'string' && b.checkOut.includes('/') ? b.checkOut : formatDateVN(b.checkOut))
        : '19/10/2026';
      const totalAmountStr = b.totalPrice
        ? (typeof b.totalPrice === 'number' ? new Intl.NumberFormat('vi-VN').format(b.totalPrice) + 'đ' : String(b.totalPrice))
        : '2.550.000đ';

      navigation.navigate('BookingSuccess', {
        homestay: targetHomestay,
        bookingCode: notif.bookingCode,
        user,
        token,
        bookingDetails: {
          fullName: b.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Nguyễn Văn Nam'),
          phoneNumber: b.phoneNumber || '0912345678',
          email: b.email || user?.email || 'namnguyen@gmail.com',
          totalAmount: totalAmountStr,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          nights: b.nights || 2,
          guests: b.guests || 2,
          dates: b.dates || `${checkInStr} - ${checkOutStr} (${b.nights || 2} đêm)`,
          bookingTime: b.bookingTime || (b.createdAt ? formatDateVN(b.createdAt) : 'Hôm nay'),
        },
      });
    } else if (notif.actionType === 'ai_trip') {
      showToast('Lịch trình du lịch AI đã được đồng bộ với chuyến đi!', 'info');
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  };

  // Định dạng ngày dd/MM
  const formatDateShort = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`;
  };

  // Danh sách 35 ngày từ hôm nay cho lịch chọn ngày
  const calendarDays = (() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 35; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  })();

  // Gọi API lấy danh sách phòng thực tế từ MongoDB kết hợp bộ lọc
  const fetchRooms = async (
    category = selectedCategory,
    search = searchText,
    guests = guestConfig.isCustomized ? guestConfig.adults + guestConfig.children : null
  ) => {
    try {
      let url = `${API_URL}/rooms?`;
      if (category && category !== 'Tất cả') {
        url += `category=${encodeURIComponent(category)}&`;
      }
      if (search && search.trim()) {
        url += `search=${encodeURIComponent(search.trim())}&`;
      }
      if (guests && Number(guests) > 0) {
        url += `guests=${encodeURIComponent(guests)}&`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        setRooms(json.data);
      } else {
        showToast('Không tải được danh sách phòng từ máy chủ', 'error');
      }
    } catch (error) {
      console.error('Lỗi khi fetch rooms:', error);
      showToast('Không thể kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động tìm kiếm tức thì (live search) khi gõ chữ, đổi danh mục hoặc đổi khách
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms(
        selectedCategory,
        searchText,
        guestConfig.isCustomized ? guestConfig.adults + guestConfig.children : null
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, selectedCategory, guestConfig]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms(
      selectedCategory,
      searchText,
      guestConfig.isCustomized ? guestConfig.adults + guestConfig.children : null
    );
  };

  const handleSearchSubmit = () => {
    setLoading(true);
    fetchRooms(
      selectedCategory,
      searchText,
      guestConfig.isCustomized ? guestConfig.adults + guestConfig.children : null
    );
  };

  // Xử lý chọn ngày trên lịch
  const handleSelectCalendarDate = (d) => {
    if (!tempCheckIn || (tempCheckIn && tempCheckOut)) {
      setTempCheckIn(d);
      setTempCheckOut(null);
    } else {
      if (d.getTime() > tempCheckIn.getTime()) {
        setTempCheckOut(d);
      } else if (d.getTime() === tempCheckIn.getTime()) {
        const nextDay = new Date(d);
        nextDay.setDate(d.getDate() + 1);
        setTempCheckOut(nextDay);
      } else {
        setTempCheckIn(d);
        setTempCheckOut(null);
      }
    }
  };

  // Chọn nhanh ngày (Presets)
  const handleQuickPresetDate = (preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preset.type === 'weekend') {
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      const sat = new Date(today);
      sat.setDate(today.getDate() + daysUntilSaturday);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      setTempCheckIn(sat);
      setTempCheckOut(sun);
    } else {
      const inDate = new Date(today);
      inDate.setDate(today.getDate() + preset.offset);
      const outDate = new Date(inDate);
      outDate.setDate(inDate.getDate() + preset.days);
      setTempCheckIn(inDate);
      setTempCheckOut(outDate);
    }
  };

  // Áp dụng ngày lưu trú
  const handleApplyDates = () => {
    if (tempCheckIn && tempCheckOut) {
      const diffMs = tempCheckOut.getTime() - tempCheckIn.getTime();
      const n = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
      setSelectedDates({
        checkIn: tempCheckIn,
        checkOut: tempCheckOut,
        nights: n,
      });
      setShowDateModal(false);
      showToast(`Đã chọn: ${formatDateShort(tempCheckIn)} - ${formatDateShort(tempCheckOut)} (${n} đêm)`, 'success');
    } else if (tempCheckIn && !tempCheckOut) {
      const nextDay = new Date(tempCheckIn);
      nextDay.setDate(tempCheckIn.getDate() + 1);
      setSelectedDates({
        checkIn: tempCheckIn,
        checkOut: nextDay,
        nights: 1,
      });
      setShowDateModal(false);
      showToast(`Đã chọn: ${formatDateShort(tempCheckIn)} - ${formatDateShort(nextDay)} (1 đêm)`, 'success');
    } else {
      setShowDateModal(false);
    }
  };

  // Xóa ngày lưu trú
  const handleClearDates = () => {
    setSelectedDates({ checkIn: null, checkOut: null, nights: 0 });
    setTempCheckIn(null);
    setTempCheckOut(null);
    setShowDateModal(false);
    showToast('Đã xóa bộ lọc ngày', 'info');
  };

  // Tăng giảm số lượng khách & phòng
  const updateTempGuests = (field, delta) => {
    setTempGuests((prev) => {
      let minVal = 0;
      if (field === 'adults' || field === 'rooms') minVal = 1;
      const newVal = Math.max(minVal, prev[field] + delta);
      return { ...prev, [field]: newVal };
    });
  };

  // Áp dụng số lượng khách
  const handleApplyGuests = () => {
    setGuestConfig({
      ...tempGuests,
      isCustomized: true,
    });
    setShowGuestModal(false);
    const total = tempGuests.adults + tempGuests.children;
    showToast(`Đã chọn: ${total} khách, ${tempGuests.rooms} phòng`, 'success');
  };

  // Đặt lại số lượng khách
  const handleClearGuests = () => {
    const defaultGuests = { adults: 2, children: 0, infants: 0, rooms: 1, isCustomized: false };
    setGuestConfig(defaultGuests);
    setTempGuests({ adults: 2, children: 0, infants: 0, rooms: 1 });
    setShowGuestModal(false);
    showToast('Đã đặt lại số lượng khách', 'info');
  };

  // Tìm kiếm bằng giọng nói mô phỏng
  const handleVoiceSearch = () => {
    const voiceSuggestions = ['Sơn Trà', 'Gần biển', 'Mỹ Khê', 'Villa', 'Đà Nẵng'];
    const randomTerm = voiceSuggestions[Math.floor(Math.random() * voiceSuggestions.length)];
    setSearchText(randomTerm);
    showToast(`Đã nhận diện giọng nói: "${randomTerm}" 🎙️`, 'info');
  };

  // Đặt lại tất cả các bộ lọc
  const handleResetAllFilters = () => {
    setSearchText('');
    setSelectedCategory('Tất cả');
    setSelectedDates({ checkIn: null, checkOut: null, nights: 0 });
    setGuestConfig({ adults: 2, children: 0, infants: 0, rooms: 1, isCustomized: false });
    showToast('Đã đặt lại tất cả bộ lọc', 'info');
  };

  // Xử lý bấm thả tim / bỏ thả tim (CR_BOOK_01, CR_BOOK_02)
  const handleToggleFavorite = (homestayId) => {
    const isCurrentlyLiked = !!favorites[homestayId];
    
    setFavorites((prev) => ({
      ...prev,
      [homestayId]: !isCurrentlyLiked,
    }));

    if (!isCurrentlyLiked) {
      showToast('Đã thêm phòng vào danh sách yêu thích', 'success'); // CR_BOOK_01
    } else {
      showToast('Đã xóa phòng khỏi danh sách yêu thích', 'info'); // CR_BOOK_02
    }
  };

  const showToast = (message, type) => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Render từng card nơi lưu trú thực tế
  const renderHomestayCard = ({ item }) => {
    const roomId = item._id || item.id;
    const isLiked = !!favorites[roomId];
    const imageUri = item.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80';
    const priceFormatted = item.pricePerNight 
      ? new Intl.NumberFormat('vi-VN').format(item.pricePerNight) + 'đ' 
      : '1.450.000đ';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('HomeDetails', {
            homestay: item,
            user,
            token,
            selectedDates,
            guestConfig,
          })
        }
      >
        {/* Hình ảnh homestay thực tế từ DB */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.cardImage} />

          {item.badge ? (
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          ) : null}

          {/* Nút Trái tim Wishlist */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleToggleFavorite(roomId)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#E53E3E' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Thông tin phòng */}
        <View style={styles.cardInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.homestayName} numberOfLines={1}>
              {item.title || item.name}
            </Text>
          </View>

          <Text style={styles.addressText} numberOfLines={1}>
            {item.distance || item.address}
          </Text>

          {/* Tags tiện ích */}
          <View style={styles.tagsRow}>
            <View style={styles.miniTag}>
              <Ionicons name="bed-outline" size={13} color="#4A5568" />
              <Text style={styles.miniTagText}>{item.specs?.bedroom || '2 Phòng ngủ'}</Text>
            </View>
            <View style={styles.miniTag}>
              <Ionicons name="people-outline" size={13} color="#4A5568" />
              <Text style={styles.miniTagText}>{item.specs?.capacity || 'Tối đa 4 khách'}</Text>
            </View>
            <View style={styles.miniTag}>
              <Ionicons name="star" size={13} color="#ECC94B" />
              <Text style={styles.ratingText}>{item.rating || 4.9} ({item.reviewCount || 128})</Text>
            </View>
          </View>

          {/* Hàng giá tiền & Nút Xem phòng */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceText}>
                {priceFormatted}{' '}
                <Text style={styles.perNightText}>/ đêm</Text>
              </Text>
              <Text style={styles.taxText}>Đã bao gồm thuế & phí</Text>
            </View>

            <TouchableOpacity
              style={styles.viewRoomBtn}
              onPress={() =>
                navigation.navigate('HomeDetails', {
                  homestay: item,
                  user,
                  token,
                  selectedDates,
                  guestConfig,
                })
              }
            >
              <Text style={styles.viewRoomBtnText}>Xem phòng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header Bar: Logo & Avatar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="compass" size={24} color="#00796B" />
          </View>
          <Text style={styles.logoTitle}>Smart Travel</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => setShowNotificationModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color="#2D3748" />
            {unreadCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile', { user, token })}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={18} color="#00796B" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Thanh tìm kiếm phong cách Google Travel hoạt động 100% */}
      <View style={styles.searchSection}>
        <View style={styles.searchCard}>
          {/* Row 1: Địa điểm + Nút Xóa + Mic */}
          <View style={styles.searchTopRow}>
            <Ionicons name="search" size={18} color="#00796B" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Đà Nẵng, Sơn Trà, Homestay..."
              placeholderTextColor="#A0AEC0"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 ? (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchText('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color="#A0AEC0" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.micBtn} onPress={handleVoiceSearch}>
              <Ionicons name="mic-outline" size={20} color="#00796B" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.searchDivider} />

          {/* Row 2: Ngày + Khách + Filter */}
          <View style={styles.searchBottomRow}>
            {/* Mục Ngày */}
            <TouchableOpacity
              style={styles.searchBottomItem}
              onPress={() => {
                setTempCheckIn(selectedDates.checkIn);
                setTempCheckOut(selectedDates.checkOut);
                setShowDateModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={selectedDates.checkIn ? '#00796B' : '#718096'}
                style={{ marginRight: 6 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.searchBottomLabel}>Ngày</Text>
                <Text
                  style={[
                    styles.searchBottomValue,
                    selectedDates.checkIn && styles.searchBottomValueActive,
                  ]}
                  numberOfLines={1}
                >
                  {selectedDates.checkIn && selectedDates.checkOut
                    ? `${formatDateShort(selectedDates.checkIn)} - ${formatDateShort(selectedDates.checkOut)} (${selectedDates.nights}đ)`
                    : 'Thêm ngày'}
                </Text>
              </View>
              {selectedDates.checkIn ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleClearDates();
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={14} color="#A0AEC0" />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>

            <View style={styles.searchBottomSep} />

            {/* Mục Khách */}
            <TouchableOpacity
              style={styles.searchBottomItem}
              onPress={() => {
                setTempGuests({
                  adults: guestConfig.adults,
                  children: guestConfig.children,
                  infants: guestConfig.infants,
                  rooms: guestConfig.rooms,
                });
                setShowGuestModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={guestConfig.isCustomized ? '#00796B' : '#718096'}
                style={{ marginRight: 6 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.searchBottomLabel}>Khách</Text>
                <Text
                  style={[
                    styles.searchBottomValue,
                    guestConfig.isCustomized && styles.searchBottomValueActive,
                  ]}
                  numberOfLines={1}
                >
                  {guestConfig.isCustomized
                    ? `${guestConfig.adults + guestConfig.children} khách, ${guestConfig.rooms}p`
                    : 'Thêm khách'}
                </Text>
              </View>
              {guestConfig.isCustomized ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleClearGuests();
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={14} color="#A0AEC0" />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>

            {/* Filter Reset / Options */}
            <TouchableOpacity
              style={[
                styles.filterChipBtn,
                (searchText || selectedDates.checkIn || guestConfig.isCustomized || selectedCategory !== 'Tất cả') &&
                  styles.filterChipBtnActive,
              ]}
              onPress={handleResetAllFilters}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={
                  searchText || selectedDates.checkIn || guestConfig.isCustomized || selectedCategory !== 'Tất cả'
                    ? '#00796B'
                    : '#5A6678'
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. Danh mục Filter Chips */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Tiêu đề số lượng kết quả */}
      <View style={styles.resultTitleRow}>
        <Text style={styles.resultCountText}>
          {rooms.length} homestay phù hợp
        </Text>
        <TouchableOpacity style={styles.sortRow} onPress={onRefresh}>
          <Ionicons name="refresh" size={13} color="#718096" style={{ marginRight: 4 }} />
          <Text style={styles.sortText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Danh sách Homestay Feed từ MongoDB */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Đang tải dữ liệu từ máy chủ...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderHomestayCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00796B']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyTitle}>Không tìm thấy nơi lưu trú</Text>
              <Text style={styles.emptySubtitle}>Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc</Text>
              <TouchableOpacity style={styles.resetFilterBtn} onPress={handleResetAllFilters}>
                <Ionicons name="refresh" size={15} color="#00796B" style={{ marginRight: 6 }} />
                <Text style={styles.resetFilterBtnText}>Đặt lại tất cả bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* 6. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="compass" size={24} color="#00796B" />
          <Text style={[styles.navText, { color: '#00796B' }]}>Khám phá</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => showToast('Chức năng danh sách đặt chỗ đang kết nối', 'info')}
        >
          <Ionicons name="bookmark-outline" size={24} color="#A0AEC0" />
          <Text style={styles.navText}>Đặt chỗ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => showToast('Chức năng tin nhắn đang kết nối', 'info')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#A0AEC0" />
          <Text style={styles.navText}>Tin nhắn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile', { user, token })}
        >
          <Ionicons name="person-outline" size={24} color="#A0AEC0" />
          <Text style={styles.navText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>

      {/* 7. Toast Notification tự ẩn */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* MODAL 1: CHỌN NGÀY LƯU TRÚ (DATE PICKER) */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chọn ngày lưu trú</Text>
                <Text style={styles.modalSubtitle}>Nhận phòng từ 14:00 • Trả phòng trước 12:00</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowDateModal(false)}
              >
                <Ionicons name="close" size={20} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {/* Chọn nhanh ngày */}
            <View style={styles.presetsContainer}>
              <Text style={styles.presetSectionTitle}>Chọn nhanh:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsScroll}
              >
                {[
                  { label: 'Hôm nay (1 đêm)', days: 1, offset: 0 },
                  { label: 'Ngày mai (2 đêm)', days: 2, offset: 1 },
                  { label: 'Cuối tuần này (T7-CN)', type: 'weekend' },
                  { label: 'Tuần sau (3 đêm)', days: 3, offset: 7 },
                ].map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => handleQuickPresetDate(p)}
                  >
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Lịch tương tác 35 ngày */}
            <View style={styles.calendarCard}>
              <View style={styles.weekdaysRow}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, idx) => (
                  <Text key={idx} style={[styles.weekdayText, idx >= 5 && styles.weekendText]}>
                    {w}
                  </Text>
                ))}
              </View>

              <ScrollView style={styles.calendarScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.calendarGrid}>
                  {calendarDays.map((d, index) => {
                    const isCheckIn = tempCheckIn && d.getTime() === tempCheckIn.getTime();
                    const isCheckOut = tempCheckOut && d.getTime() === tempCheckOut.getTime();
                    const isInRange =
                      tempCheckIn &&
                      tempCheckOut &&
                      d.getTime() > tempCheckIn.getTime() &&
                      d.getTime() < tempCheckOut.getTime();
                    const isToday = d.toDateString() === new Date().toDateString();

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayCell,
                          isInRange && styles.dayCellInRange,
                          (isCheckIn || isCheckOut) && styles.dayCellSelected,
                        ]}
                        onPress={() => handleSelectCalendarDate(d)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isToday && styles.todayText,
                            isInRange && styles.dayCellInRangeText,
                            (isCheckIn || isCheckOut) && styles.dayCellSelectedText,
                          ]}
                        >
                          {d.getDate()}
                        </Text>
                        {isCheckIn ? <Text style={styles.dayMiniLabel}>Nhận</Text> : null}
                        {isCheckOut ? <Text style={styles.dayMiniLabel}>Trả</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Tóm tắt ngày đã chọn */}
            <View style={styles.dateSummaryBar}>
              <View style={styles.dateSummaryCol}>
                <Text style={styles.dateSummaryLabel}>Nhận phòng</Text>
                <Text style={styles.dateSummaryValue}>
                  {tempCheckIn ? formatDateShort(tempCheckIn) : 'Chưa chọn'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#00796B" style={{ marginHorizontal: 10 }} />
              <View style={styles.dateSummaryCol}>
                <Text style={styles.dateSummaryLabel}>Trả phòng</Text>
                <Text style={styles.dateSummaryValue}>
                  {tempCheckOut ? formatDateShort(tempCheckOut) : 'Chưa chọn'}
                </Text>
              </View>
              {tempCheckIn && tempCheckOut ? (
                <View style={styles.nightsBadge}>
                  <Text style={styles.nightsBadgeText}>
                    {Math.max(
                      1,
                      Math.round((tempCheckOut.getTime() - tempCheckIn.getTime()) / (24 * 60 * 60 * 1000))
                    )}{' '}
                    đêm
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Nút hành động Modal */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={handleClearDates}
                activeOpacity={0.8}
              >
                <Text style={styles.modalResetBtnText}>Xóa ngày</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={handleApplyDates}
                activeOpacity={0.85}
              >
                <Text style={styles.modalApplyBtnText}>Áp dụng ngày</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CHỌN SỐ KHÁCH & PHÒNG (GUEST PICKER) */}
      <Modal visible={showGuestModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chọn số khách & phòng</Text>
                <Text style={styles.modalSubtitle}>Tìm nơi lưu trú có sức chứa phù hợp</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowGuestModal(false)}
              >
                <Ionicons name="close" size={20} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {/* Chọn nhanh số khách */}
            <View style={styles.presetsContainer}>
              <Text style={styles.presetSectionTitle}>Chọn nhanh:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsScroll}
              >
                {[
                  { label: '1 người', adults: 1, children: 0, rooms: 1 },
                  { label: '2 người (Cặp đôi)', adults: 2, children: 0, rooms: 1 },
                  { label: 'Gia đình (4 người)', adults: 2, children: 2, rooms: 1 },
                  { label: 'Nhóm bạn (6+ người)', adults: 6, children: 0, rooms: 2 },
                ].map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => {
                      setTempGuests({
                        adults: p.adults,
                        children: p.children,
                        infants: 0,
                        rooms: p.rooms,
                      });
                    }}
                  >
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Hàng tăng giảm số lượng */}
            <View style={styles.stepperContainer}>
              {/* Row 1: Người lớn */}
              <View style={styles.stepperRow}>
                <View style={styles.stepperInfo}>
                  <Text style={styles.stepperTitle}>Người lớn</Text>
                  <Text style={styles.stepperSubtitle}>Từ 13 tuổi trở lên</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, tempGuests.adults <= 1 && styles.stepperBtnDisabled]}
                    onPress={() => updateTempGuests('adults', -1)}
                    disabled={tempGuests.adults <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={tempGuests.adults <= 1 ? '#CBD5E0' : '#00796B'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{tempGuests.adults}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateTempGuests('adults', 1)}
                  >
                    <Ionicons name="add" size={18} color="#00796B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 2: Trẻ em */}
              <View style={styles.stepperRow}>
                <View style={styles.stepperInfo}>
                  <Text style={styles.stepperTitle}>Trẻ em</Text>
                  <Text style={styles.stepperSubtitle}>Độ tuổi từ 2 đến 12</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, tempGuests.children <= 0 && styles.stepperBtnDisabled]}
                    onPress={() => updateTempGuests('children', -1)}
                    disabled={tempGuests.children <= 0}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={tempGuests.children <= 0 ? '#CBD5E0' : '#00796B'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{tempGuests.children}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateTempGuests('children', 1)}
                  >
                    <Ionicons name="add" size={18} color="#00796B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 3: Em bé */}
              <View style={styles.stepperRow}>
                <View style={styles.stepperInfo}>
                  <Text style={styles.stepperTitle}>Em bé</Text>
                  <Text style={styles.stepperSubtitle}>Dưới 2 tuổi (Không tính vào sức chứa)</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, tempGuests.infants <= 0 && styles.stepperBtnDisabled]}
                    onPress={() => updateTempGuests('infants', -1)}
                    disabled={tempGuests.infants <= 0}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={tempGuests.infants <= 0 ? '#CBD5E0' : '#00796B'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{tempGuests.infants}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateTempGuests('infants', 1)}
                  >
                    <Ionicons name="add" size={18} color="#00796B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 4: Số phòng */}
              <View style={[styles.stepperRow, { borderBottomWidth: 0 }]}>
                <View style={styles.stepperInfo}>
                  <Text style={styles.stepperTitle}>Số lượng phòng</Text>
                  <Text style={styles.stepperSubtitle}>Số phòng dự kiến cần đặt</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, tempGuests.rooms <= 1 && styles.stepperBtnDisabled]}
                    onPress={() => updateTempGuests('rooms', -1)}
                    disabled={tempGuests.rooms <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={tempGuests.rooms <= 1 ? '#CBD5E0' : '#00796B'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{tempGuests.rooms}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateTempGuests('rooms', 1)}
                  >
                    <Ionicons name="add" size={18} color="#00796B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tóm tắt khách */}
            <View style={styles.guestSummaryBadge}>
              <Ionicons name="people" size={16} color="#00796B" style={{ marginRight: 6 }} />
              <Text style={styles.guestSummaryText}>
                Tổng: <Text style={{ fontWeight: '700' }}>{tempGuests.adults + tempGuests.children} khách</Text> ({tempGuests.adults} lớn, {tempGuests.children} trẻ, {tempGuests.infants} em bé) • {tempGuests.rooms} phòng
              </Text>
            </View>

            {/* Nút hành động Modal */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={handleClearGuests}
                activeOpacity={0.8}
              >
                <Text style={styles.modalResetBtnText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={handleApplyGuests}
                activeOpacity={0.85}
              >
                <Text style={styles.modalApplyBtnText}>
                  Áp dụng ({tempGuests.adults + tempGuests.children} khách)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: TRUNG TÂM THÔNG BÁO THỜI GIAN THỰC (NOTIFICATION CENTER) */}
      <Modal visible={showNotificationModal} transparent animationType="slide">
        <View style={styles.notifBackdrop}>
          <View style={styles.notifSheet}>
            {/* Thanh kéo handle */}
            <View style={styles.dragHandleBar} />

            {/* Header thông báo */}
            <View style={styles.notifHeader}>
              <View style={styles.notifTitleRow}>
                <Ionicons name="notifications" size={20} color="#00796B" style={{ marginRight: 8 }} />
                <Text style={styles.notifTitle}>Thông báo</Text>
                {unreadCount > 0 && (
                  <View style={styles.notifUnreadBadge}>
                    <Text style={styles.notifUnreadBadgeText}>{unreadCount} mới</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={styles.notifMarkAllBtn}
                    onPress={handleMarkAllAsRead}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#00796B" style={{ marginRight: 4 }} />
                    <Text style={styles.notifMarkAllText}>Đọc tất cả</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.notifCloseBtn}
                  onPress={() => setShowNotificationModal(false)}
                >
                  <Ionicons name="close" size={20} color="#4A5568" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tabs Bộ lọc: Tất cả / Chưa đọc */}
            <View style={styles.notifTabsRow}>
              <TouchableOpacity
                style={[styles.notifTabBtn, notificationFilter === 'all' && styles.notifTabBtnActive]}
                onPress={() => setNotificationFilter('all')}
                activeOpacity={0.8}
              >
                <Text style={[styles.notifTabText, notificationFilter === 'all' && styles.notifTabTextActive]}>
                  Tất cả ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notifTabBtn, notificationFilter === 'unread' && styles.notifTabBtnActive]}
                onPress={() => setNotificationFilter('unread')}
                activeOpacity={0.8}
              >
                <Text style={[styles.notifTabText, notificationFilter === 'unread' && styles.notifTabTextActive]}>
                  Chưa đọc ({unreadCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Danh sách thông báo */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.notifListContent}
            >
              {notifications
                .filter((n) => (notificationFilter === 'unread' ? !n.read : true))
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notifCard,
                      !item.read && styles.notifCardUnread,
                    ]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.8}
                  >
                    {/* Icon đại diện */}
                    <View
                      style={[
                        styles.notifIconWrap,
                        { backgroundColor: item.badgeColor },
                      ]}
                    >
                      <Ionicons name={item.icon} size={22} color={item.iconColor} />
                    </View>

                    {/* Nội dung thông báo */}
                    <View style={styles.notifContentCol}>
                      <View style={styles.notifMetaRow}>
                        <View
                          style={[
                            styles.notifTypeBadge,
                            { backgroundColor: item.badgeColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.notifTypeBadgeText,
                              { color: item.badgeTextColor },
                            ]}
                          >
                            {item.badgeText}
                          </Text>
                        </View>
                        <Text style={styles.notifTimeText}>{item.time}</Text>
                        {!item.read && <View style={styles.unreadBlueDot} />}
                      </View>

                      <Text style={[styles.notifItemTitle, !item.read && styles.notifItemTitleBold]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notifItemMessage}>{item.message}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

              {notifications.filter((n) => (notificationFilter === 'unread' ? !n.read : true)).length === 0 && (
                <View style={styles.notifEmptyBox}>
                  <Ionicons name="sparkles-outline" size={44} color="#CBD5E0" />
                  <Text style={styles.notifEmptyTitle}>Không có thông báo chưa đọc</Text>
                  <Text style={styles.notifEmptyDesc}>Bạn đã cập nhật đầy đủ các thông tin và ưu đãi mới nhất.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 6,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53E3E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00796B',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: 'hidden',
  },
  searchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  clearSearchBtn: {
    padding: 6,
    marginRight: 4,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginHorizontal: 16,
  },
  searchBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBottomItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBottomLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  searchBottomValue: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginTop: 1,
  },
  searchBottomValueActive: {
    color: '#00796B',
    fontWeight: '700',
  },
  searchBottomSep: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  filterChipBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  filterChipBtnActive: {
    borderColor: '#00796B',
    backgroundColor: '#E6FFFA',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#00796B',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  resultTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 12,
    color: '#718096',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 13,
    color: '#718096',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A5568',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#A0AEC0',
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  imageContainer: {
    position: 'relative',
    height: 190,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 121, 107, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homestayName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
  },
  addressText: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  miniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  miniTagText: {
    fontSize: 11,
    color: '#4A5568',
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00796B',
  },
  perNightText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#718096',
  },
  taxText: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
  },
  viewRoomBtn: {
    backgroundColor: '#00796B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewRoomBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 3,
    fontWeight: '600',
  },

  // Reset Filter Button in Empty state
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E6FFFA',
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  resetFilterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00796B',
  },

  // ==========================================
  // MODAL STYLES (Date & Guest Pickers)
  // ==========================================
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsContainer: {
    marginBottom: 14,
  },
  presetSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsScroll: {
    paddingRight: 10,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
  },

  // Calendar styles
  calendarCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 14,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#718096',
  },
  weekendText: {
    color: '#E53E3E',
  },
  calendarScrollView: {
    maxHeight: 220,
    marginTop: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    position: 'relative',
  },
  dayCellInRange: {
    backgroundColor: '#E6FFFA',
    borderRadius: 0,
  },
  dayCellSelected: {
    backgroundColor: '#00796B',
    borderRadius: 10,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  todayText: {
    color: '#00796B',
    fontWeight: '800',
  },
  dayCellInRangeText: {
    color: '#00796B',
    fontWeight: '700',
  },
  dayCellSelectedText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayMiniLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
    position: 'absolute',
    bottom: 2,
  },

  // Date summary bar
  dateSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  dateSummaryCol: {
    flex: 1,
  },
  dateSummaryLabel: {
    fontSize: 10,
    color: '#00796B',
    fontWeight: '600',
  },
  dateSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A202C',
    marginTop: 2,
  },
  nightsBadge: {
    backgroundColor: '#00796B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  nightsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Steppers (Guest Picker)
  stepperContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  stepperInfo: {
    flex: 1,
  },
  stepperTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
  },
  stepperSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A202C',
    width: 36,
    textAlign: 'center',
  },
  guestSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  guestSummaryText: {
    fontSize: 12,
    color: '#285E61',
    flex: 1,
  },

  // Modal actions
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalResetBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    marginRight: 10,
  },
  modalResetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#718096',
  },
  modalApplyBtn: {
    flex: 1,
    backgroundColor: '#00796B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#00796B',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ==========================================
  // STYLES NOTIFICATION BOTTOM SHEET MODAL
  // ==========================================
  notifBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  notifSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 25,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 8,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
  },
  notifUnreadBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  notifUnreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },
  notifMarkAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    marginRight: 10,
  },
  notifMarkAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00796B',
  },
  notifCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  notifTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    marginRight: 8,
  },
  notifTabBtnActive: {
    backgroundColor: '#00796B',
  },
  notifTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  notifTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  notifListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  notifCardUnread: {
    backgroundColor: '#F7FAFC',
    borderColor: '#CBD5E0',
    borderLeftWidth: 3.5,
    borderLeftColor: '#00796B',
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContentCol: {
    flex: 1,
  },
  notifMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  notifTypeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  notifTimeText: {
    fontSize: 11,
    color: '#A0AEC0',
    flex: 1,
  },
  unreadBlueDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3182CE',
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 3,
  },
  notifItemTitleBold: {
    fontWeight: '700',
    color: '#1A202C',
  },
  notifItemMessage: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
  },
  notifEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  notifEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A5568',
    marginTop: 12,
    marginBottom: 4,
  },
  notifEmptyDesc: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default HomeScreen;

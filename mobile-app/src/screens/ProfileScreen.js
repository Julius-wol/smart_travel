import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Switch,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL, API_URL } from '../utils/config';
import ToastNotification from '../components/ToastNotification';
import { toggleWishlistThunk } from '../store/slices/wishlistSlice';

/**
 * Màn hình [SMART-92] / [SMART-83] Tài khoản của tôi (My Account & Dashboard)
 * Phiên bản hoàn thiện sau nghiệm thu FI:
 * - Header: Bỏ nút tìm kiếm; Nút chuông thông báo mở trực tiếp Modal Notification Center
 * - Card Yêu thích: Mở Modal danh sách Homestay đã thích, có thể xem chi tiết & bỏ thích
 * - Card Phòng đã đặt: Hiển thị danh sách Thẻ du lịch đầy đủ (ảnh, tên, mã vé, ngày, tiền),
 *   có nút bấm ra HomeDetails để tiện đặt lại & nút mở e-Pass
 * - e-Pass & Vé điện tử: Đồng bộ chính xác tên và email của user đang test
 */
const ProfileScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const passedUser = route.params?.user;
  const token = route.params?.token;

  // Lấy dữ liệu wishlist từ Redux store
  const savedRoomIds = useSelector((state) => state.wishlist?.savedRoomIds || {});
  const favoriteCountReal = Object.keys(savedRoomIds).length;

  // State thông tin người dùng
  const [user, setUser] = useState({
    fullName:
      passedUser?.fullName ||
      (passedUser?.firstName ? `${passedUser.firstName} ${passedUser.lastName || ''}`.trim() : '') ||
      'Linh Nguyễn',
    firstName: passedUser?.firstName || 'Linh',
    lastName: passedUser?.lastName || 'Nguyễn',
    email: passedUser?.email || 'linh.traveler@gmail.com',
    phone: passedUser?.phone || '0912345888',
    avatar: passedUser?.avatar
      ? passedUser.avatar.startsWith('http')
        ? passedUser.avatar
        : `${BASE_URL}${passedUser.avatar}`
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    username: passedUser?.username || 'linh.traveler',
    role: passedUser?.role || 'USER',
  });

  const [avatarUri, setAvatarUri] = useState(user.avatar);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  // Mock dữ liệu danh sách phòng đã đặt mẫu chất lượng cao
  const defaultBookedRooms = [
    {
      id: 'bk-01',
      bookingCode: 'ST-5894',
      title: 'West Lake Sunset Luxury Loft Hà Nội',
      subtitle: 'Nguyên căn 2PN Ocean View Panorama',
      thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      location: 'Tây Hồ, Hà Nội',
      checkIn: '27/10/2026',
      checkOut: '29/10/2026',
      dateRange: '27/10 - 29/10/2026',
      nights: 3,
      guests: 2,
      pricePerNight: 2050000,
      totalAmount: '6.110.000đ',
      rating: 4.98,
      reviewCount: 142,
      status: 'CONFIRMED',
      statusText: 'E-PASS SẴN SÀNG',
      roomNumber: '402',
    },
    {
      id: 'bk-02',
      bookingCode: 'BK-9821',
      title: 'Đà Nẵng Riverside Luxury Villa',
      subtitle: 'Villa hồ bơi riêng gần biển Mỹ Khê',
      thumbnail: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      location: 'Sơn Trà, Đà Nẵng',
      checkIn: '15/05/2026',
      checkOut: '18/05/2026',
      dateRange: '15/05 - 18/05/2026',
      nights: 3,
      guests: 2,
      pricePerNight: 1450000,
      totalAmount: '4.350.000đ',
      rating: 4.95,
      reviewCount: 98,
      status: 'CONFIRMED',
      statusText: 'E-PASS SẴN SÀNG',
      roomNumber: 'Villa 02',
    },
    {
      id: 'bk-03',
      bookingCode: 'BK-4412',
      title: 'An Nhiên Eco Retreat Bán Đảo Sơn Trà',
      subtitle: 'Bungalow gỗ view rừng nguyên sinh',
      thumbnail: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      location: 'Bán đảo Sơn Trà, Đà Nẵng',
      checkIn: '10/01/2026',
      checkOut: '13/01/2026',
      dateRange: '10/01 - 13/01/2026',
      nights: 3,
      guests: 2,
      pricePerNight: 1250000,
      totalAmount: '3.750.000đ',
      rating: 4.92,
      reviewCount: 115,
      status: 'COMPLETED',
      statusText: 'ĐÃ HOÀN THÀNH',
      roomNumber: 'BG-08',
    },
    {
      id: 'bk-04',
      bookingCode: 'BK-3390',
      title: 'Sapa Pine Hill Mountain Retreat',
      subtitle: 'Biệt thự trên mây ngắm đỉnh Fansipan',
      thumbnail: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      location: 'Thị xã Sapa, Lào Cai',
      checkIn: '20/12/2025',
      checkOut: '23/12/2025',
      dateRange: '20/12 - 23/12/2025',
      nights: 3,
      guests: 2,
      pricePerNight: 1650000,
      totalAmount: '4.950.000đ',
      rating: 4.96,
      reviewCount: 84,
      status: 'COMPLETED',
      statusText: 'ĐÃ HOÀN THÀNH',
      roomNumber: 'M-101',
    },
  ];

  const [bookedRooms, setBookedRooms] = useState(defaultBookedRooms);

  // Chuyến đi sắp tới (Hero Card)
  const [upcomingTrip, setUpcomingTrip] = useState(defaultBookedRooms[0]);

  // Mock danh sách homestay yêu thích
  const defaultWishlistRooms = [
    {
      id: 'wl-01',
      _id: 'wl-01',
      title: 'West Lake Sunset Luxury Loft Hà Nội',
      name: 'West Lake Sunset Luxury Loft Hà Nội',
      subtitle: 'Nguyên căn 2PN Ocean View Panorama',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
      location: { city: 'Tây Hồ, Hà Nội' },
      address: 'Đường Quảng An, Quận Tây Hồ, TP. Hà Nội',
      pricePerNight: 2050000,
      rating: 4.98,
      reviewCount: 142,
      badge: 'HOT NHẤT TÂY HỒ',
    },
    {
      id: 'wl-02',
      _id: 'wl-02',
      title: 'Đà Nẵng Riverside Luxury Villa',
      name: 'Đà Nẵng Riverside Luxury Villa',
      subtitle: 'Villa hồ bơi riêng gần biển Mỹ Khê',
      images: ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80'],
      location: { city: 'Sơn Trà, Đà Nẵng' },
      address: 'Đường Hoàng Sa, Bán đảo Sơn Trà, TP. Đà Nẵng',
      pricePerNight: 1450000,
      rating: 4.95,
      reviewCount: 98,
      badge: 'TOP 1% SƠN TRÀ',
    },
    {
      id: 'wl-03',
      _id: 'wl-03',
      title: 'Dalat Pine Garden & Cloud Villa',
      name: 'Dalat Pine Garden & Cloud Villa',
      subtitle: 'Biệt thự đồi thông săn mây sớm',
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'],
      location: { city: 'Phường 10, TP. Đà Lạt' },
      address: 'Đường Hùng Vương, Phường 10, TP. Đà Lạt',
      pricePerNight: 1350000,
      rating: 4.92,
      reviewCount: 89,
      badge: 'SĂN MÂY ĐÀ LẠT',
    },
    {
      id: 'wl-04',
      _id: 'wl-04',
      title: 'Phú Quốc Ocean Pearl Beachfront Villa',
      name: 'Phú Quốc Ocean Pearl Beachfront Villa',
      subtitle: 'Villa mặt biển hoàng hôn bãi Trường',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
      location: { city: 'Bãi Trường, Phú Quốc' },
      address: 'Dương Tơ, TP. Phú Quốc, Kiên Giang',
      pricePerNight: 2850000,
      rating: 4.99,
      reviewCount: 210,
      badge: 'NGHỈ DƯỠNG BIỂN',
    },
  ];

  const [wishlistRooms, setWishlistRooms] = useState(defaultWishlistRooms);

  // State Cài đặt
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt');
  const [selectedCurrency, setSelectedCurrency] = useState('VNĐ');

  // State Toasts & Popups
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  // State Thông báo (Notification Center Modal)
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-promo',
      type: 'promo',
      title: 'Tặng bạn Voucher 500.000đ',
      message: 'Mã SMART2026 giảm ngay 500.000đ cho đơn đặt villa từ 2 đêm tại Bán đảo Sơn Trà.',
      time: 'Hôm qua',
      read: false,
      badgeText: 'ƯU ĐÃI',
      badgeColor: '#FEE2E2',
      badgeTextColor: '#DC2626',
      icon: 'gift',
      iconColor: '#DC2626',
      actionType: 'copy_voucher',
      voucherCode: 'SMART2026',
    },
    {
      id: 'notif-epass',
      type: 'epass',
      title: 'Vé điện tử e-Pass ST-5894 đã sẵn sàng',
      message: 'Đơn đặt phòng tại West Lake Sunset Luxury Loft đã xác thực Napas thành công.',
      time: 'Hôm nay',
      read: false,
      badgeText: 'VÉ ĐIỆN TỬ',
      badgeColor: '#CCFBF1',
      badgeTextColor: '#00685F',
      icon: 'qr-code',
      iconColor: '#00685F',
      actionType: 'epass',
    },
    {
      id: 'notif-ai',
      type: 'ai_trip',
      title: 'Lịch trình AI Đà Nẵng 3N2Đ đã sẵn sàng',
      message: 'Trợ lý AI đã chuẩn bị xong kế hoạch ăn chơi, ngắm hoàng hôn và quán cà phê đẹp.',
      time: '2 ngày trước',
      read: true,
      badgeText: 'AI PLANNER',
      badgeColor: '#EDE9FE',
      badgeTextColor: '#7C3AED',
      icon: 'sparkles',
      iconColor: '#7C3AED',
      actionType: 'ai_trip',
    },
    {
      id: 'notif-weather',
      type: 'weather',
      title: 'Dự báo thời tiết chuyến đi sắp tới',
      message: 'Thời tiết Đà Nẵng những ngày tới nắng đẹp, nhiệt độ 26-30°C, lý tưởng tắm biển.',
      time: '3 ngày trước',
      read: true,
      badgeText: 'THỜI TIẾT',
      badgeColor: '#FEF3C7',
      badgeTextColor: '#D97706',
      icon: 'sunny',
      iconColor: '#D97706',
      actionType: 'weather',
    },
  ]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Modals & Sheets
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTopAvatarMenu, setShowTopAvatarMenu] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  // Form Edit Profile States
  const [editFullName, setEditFullName] = useState(user.fullName);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editEmail, setEditEmail] = useState(user.email);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Ref cuộn trang
  const scrollViewRef = useRef(null);

  // Helper Toast
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Helper che 3 số giữa của số điện thoại
  const formatMaskedPhone = (phoneStr) => {
    if (!phoneStr) return '0912 *** 888';
    const cleanPhone = phoneStr.replace(/\s+/g, '');
    if (cleanPhone.length >= 9) {
      const prefix = cleanPhone.slice(0, 4);
      const suffix = cleanPhone.slice(-3);
      return `${prefix} *** ${suffix}`;
    }
    return phoneStr;
  };

  // Tải danh sách đơn đặt phòng thực tế từ backend
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const queryEmail = user.email || passedUser?.email;
        if (!queryEmail) return;

        const res = await fetch(`${API_URL}/bookings/my-bookings?email=${encodeURIComponent(queryEmail)}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const formatted = json.data.map((b) => {
            const checkInDate = new Date(b.checkIn);
            const checkOutDate = new Date(b.checkOut);
            const formatDate = (d) =>
              `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            return {
              id: b._id,
              bookingCode: b.bookingCode || 'ST-5894',
              title: b.roomId?.title || b.roomId?.name || 'West Lake Sunset Luxury Loft Hà Nội',
              subtitle: b.roomId?.subtitle || 'Nguyên căn 2PN Ocean View Panorama',
              thumbnail:
                b.roomId?.images?.[0] ||
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
              location: b.roomId?.location?.city || b.roomId?.city || 'Hà Nội',
              checkIn: formatDate(checkInDate),
              checkOut: formatDate(checkOutDate),
              dateRange: `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`,
              nights: b.totalNights || 3,
              guests: b.guestDetails?.adults || 2,
              pricePerNight: b.pricePerNight || 2050000,
              totalAmount: b.totalPrice ? new Intl.NumberFormat('vi-VN').format(b.totalPrice) + 'đ' : '6.110.000đ',
              rating: b.roomId?.rating || 4.98,
              reviewCount: b.roomId?.reviewCount || 142,
              status: b.paymentStatus || 'CONFIRMED',
              statusText: 'E-PASS SẴN SÀNG',
              roomNumber: '402',
              rawRoom: b.roomId,
            };
          });

          setBookedRooms(formatted);
          setUpcomingTrip(formatted[0]);
        }
      } catch (err) {
        console.warn('Lỗi lấy thông tin booking:', err);
      }
    };

    fetchUserBookings();
  }, [user.email]);

  // Đổi ảnh đại diện
  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setAvatarUri(selectedUri);
        setUser((prev) => ({ ...prev, avatar: selectedUri }));

        if (token) {
          setUpdatingAvatar(true);
          const formData = new FormData();
          formData.append('avatar', {
            uri: selectedUri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
          });

          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${API_URL}/user/avatar`);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.onload = () => {
            setUpdatingAvatar(false);
            showToast('Cập nhật ảnh đại diện thành công!', 'success', 2500);
          };
          xhr.onerror = () => {
            setUpdatingAvatar(false);
            showToast('Không thể tải ảnh lên máy chủ, đã lưu cục bộ', 'info', 2500);
          };
          xhr.send(formData);
        } else {
          showToast('Đã cập nhật ảnh đại diện!', 'success', 2000);
        }
      }
    } catch (e) {
      console.warn('Lỗi chọn ảnh:', e);
      showToast('Không thể truy cập thư viện ảnh', 'error', 2500);
    }
  };

  // Cập nhật thông tin cá nhân
  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      showToast('Họ và tên không được để trống', 'error', 2500);
      return;
    }

    setSavingProfile(true);
    try {
      if (token) {
        const res = await fetch(`${API_URL}/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: editFullName.trim(),
            firstName: editFullName.trim().split(' ').slice(0, -1).join(' ') || editFullName.trim(),
            lastName: editFullName.trim().split(' ').slice(-1).join(''),
            phone: editPhone.trim(),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Cập nhật thất bại');
        }
      }

      setUser((prev) => ({
        ...prev,
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      }));

      setShowEditProfileModal(false);
      showToast('Cập nhật hồ sơ thành công!', 'success', 2500);
    } catch (err) {
      console.error(err);
      showToast('CR_ACC_07: ' + (err.message || 'Không thể tải thông tin hồ sơ. Vui lòng kiểm tra lại kết nối mạng.'), 'error', 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      showToast('Vui lòng nhập mật khẩu cũ và mới', 'error', 2500);
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên', 'error', 2500);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp', 'error', 2500);
      return;
    }

    setSavingPassword(true);
    try {
      if (token) {
        const res = await fetch(`${API_URL}/user/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Đổi mật khẩu thất bại');
        }
      }

      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Đổi mật khẩu thành công!', 'success', 2500);
    } catch (err) {
      showToast(err.message || 'Đổi mật khẩu thất bại', 'error', 3000);
    } finally {
      setSavingPassword(false);
    }
  };

  // Đăng xuất tài khoản
  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false);
    try {
      if (token) {
        await fetch(`${API_URL}/auth/signout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {
      // ignore
    }
    navigation.replace('Login');
  };

  // Điều hướng đến e-Pass (Đồng bộ chính xác tên và email của user đang test!)
  const handleOpenEPass = (tripItem) => {
    const targetTrip = tripItem || upcomingTrip;
    setShowBookingsModal(false);

    navigation.navigate('BookingSuccess', {
      bookingCode: targetTrip.bookingCode || 'ST-5894',
      homestay: {
        id: targetTrip.id || 'hs-01',
        _id: targetTrip.id || 'hs-01',
        title: targetTrip.title,
        name: targetTrip.title,
        subtitle: targetTrip.subtitle || 'Nguyên căn 2PN Ocean View Panorama',
        images: [targetTrip.thumbnail],
        address: targetTrip.location,
        location: { city: targetTrip.location },
        rating: targetTrip.rating || 4.98,
        reviewCount: targetTrip.reviewCount || 142,
        roomNumber: targetTrip.roomNumber || '402',
      },
      bookingDetails: {
        fullName: user.fullName || user.username || 'Linh Nguyễn',
        email: user.email || 'linh.traveler@gmail.com',
        phone: user.phone || '0912345888',
        checkIn: targetTrip.checkIn || targetTrip.dateRange?.split(' - ')[0] || '27/10/2026',
        checkOut: targetTrip.checkOut || targetTrip.dateRange?.split(' - ')[1] || '29/10/2026',
        nights: targetTrip.nights || 3,
        guests: targetTrip.guests || 2,
        totalAmount: targetTrip.totalAmount || '6.110.000đ',
      },
      user,
      token,
    });
  };

  // Điều hướng xem chi tiết phòng để đặt lại (Re-book)
  const handleRebookRoom = (tripItem) => {
    setShowBookingsModal(false);
    const homestayData = {
      id: tripItem.id || 'hs-01',
      _id: tripItem.id || 'hs-01',
      name: tripItem.title,
      title: tripItem.title,
      subtitle: tripItem.subtitle || 'Nguyên căn 2PN Ocean View Panorama',
      images: [tripItem.thumbnail],
      address: tripItem.location,
      rating: tripItem.rating || 4.98,
      reviewCount: tripItem.reviewCount || 142,
      pricePerNight: tripItem.pricePerNight || 2050000,
      priceFormatted: tripItem.totalAmount || '2.050.000đ',
      badge: 'HOMESTAY ĐÃ ĐẶT',
      specs: {
        type: 'Nhà nguyên căn',
        capacity: 'Tối đa 4 khách',
        bedroom: '2 PN • 2 Giường King',
        bathroom: '2 Phòng tắm riêng',
      },
      ...tripItem.rawRoom,
    };

    navigation.navigate('HomeDetails', {
      homestay: homestayData,
      user,
      token,
    });
  };

  // Xem chi tiết homestay từ danh sách yêu thích
  const handleViewWishlistDetail = (item) => {
    setShowWishlistModal(false);
    navigation.navigate('HomeDetails', {
      homestay: item,
      user,
      token,
    });
  };

  // Xóa homestay khỏi danh sách yêu thích (CR_ACC_02)
  const handleRemoveWishlist = (item) => {
    const targetId = item._id || item.id;
    setWishlistRooms((prev) => prev.filter((r) => r.id !== item.id && r._id !== item._id));
    
    // Chỉ gọi API đồng bộ server nếu là ObjectId hợp lệ của MongoDB
    if (targetId && /^[0-9a-fA-F]{24}$/.test(String(targetId))) {
      dispatch(toggleWishlistThunk({ room: item, isCurrentlySaved: true }));
    }
    showToast('CR_ACC_02: Đã xóa khỏi danh sách yêu thích', 'info', 2500);
  };

  // Xử lý click item thông báo
  const handleNotificationPress = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    if (item.actionType === 'copy_voucher') {
      showToast(`Đã sao chép voucher ${item.voucherCode}!`, 'success', 2500);
    } else if (item.actionType === 'epass') {
      setShowNotificationModal(false);
      handleOpenEPass(upcomingTrip);
    } else if (item.actionType === 'ai_trip') {
      showToast('Tính năng Lên lịch trình AI đang được hoàn thiện và sẽ sớm ra mắt!', 'info', 3000);
    }
  };

  const handleMarkAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success', 2000);
  };

  // CR_ACC_04: Thông báo AI Itinerary đang hoàn thiện
  const handleAITripNotice = () => {
    showToast('Tính năng Lên lịch trình AI đang được hoàn thiện và sẽ sớm ra mắt!', 'info', 3000);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. TOP BAR (Đã loại bỏ nút Search theo yêu cầu; Nút chuông mở trực tiếp Notification Modal) */}
      <View style={styles.topBar}>
        {/* Brand Logo & Name (Click: Scroll to top) */}
        <TouchableOpacity
          style={styles.brandContainer}
          activeOpacity={0.8}
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <View style={styles.compassBox}>
            <Ionicons name="compass" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Smart Travel</Text>
        </TouchableOpacity>

        {/* Action Icons bên phải: Chuông thông báo & Avatar Top */}
        <View style={styles.topActions}>
          {/* Nút Chuông thông báo (Mở trực tiếp Notification Modal) */}
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => setShowNotificationModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
            {unreadNotifCount > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>

          {/* Avatar nhỏ góc phải mở Overlay Card */}
          <TouchableOpacity
            style={styles.avatarMiniBtn}
            onPress={() => setShowTopAvatarMenu(true)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarMiniCircle}>
              <Ionicons name="person" size={17} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. PROFILE HEADER */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileRow}>
            {/* User Avatar & Edit Camera Badge */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handlePickAvatar}
              activeOpacity={0.85}
            >
              <Image source={{ uri: avatarUri }} style={styles.profileAvatar} />
              <View style={styles.cameraBadge}>
                {updatingAvatar ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            {/* User Info & Edit Profile CTA */}
            <View style={styles.profileInfoCol}>
              <Text style={styles.userNameText}>{user.fullName}</Text>
              <Text style={styles.userContactText}>
                {user.email} • {formatMaskedPhone(user.phone)}
              </Text>

              {/* Nút bo tròn "Chỉnh sửa hồ sơ" */}
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => {
                  setEditFullName(user.fullName);
                  setEditPhone(user.phone);
                  setEditEmail(user.email);
                  setShowEditProfileModal(true);
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="pencil" size={14} color="#00685F" style={{ marginRight: 6 }} />
                <Text style={styles.editProfileBtnText}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. STATS COUNTERS */}
          <View style={styles.statsRow}>
            {/* Thẻ Chuyến đi */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.8}
              onPress={() => setShowBookingsModal(true)}
            >
              <Text style={styles.statValue}>{bookedRooms.length}</Text>
              <Text style={styles.statLabel}>Chuyến đi</Text>
            </TouchableOpacity>

            {/* Thẻ Yêu thích (Click: Mở Modal Homestay Yêu Thích) */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.8}
              onPress={() => setShowWishlistModal(true)}
            >
              <Text style={styles.statValue}>{wishlistRooms.length}</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. UPCOMING TRIP CARD */}
        <View style={styles.sectionCard}>
          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <View style={styles.suitcaseIconWrap}>
                <Ionicons name="bag-handle-outline" size={18} color="#00685F" />
              </View>
              <Text style={styles.sectionTitle}>Chuyến đi sắp tới</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowBookingsModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>Xem tất cả ({bookedRooms.length})</Text>
            </TouchableOpacity>
          </View>

          {/* Trip Hero Card Container */}
          <View style={styles.tripHeroCard}>
            <View style={styles.tripMainRow}>
              {/* Thumbnail Image */}
              <Image source={{ uri: upcomingTrip.thumbnail }} style={styles.tripThumbnail} />

              {/* Thông tin chuyến đi */}
              <View style={styles.tripMetaCol}>
                <View style={styles.statusBadgeRow}>
                  <View style={styles.greenLiveDot} />
                  <Text style={styles.statusBadgeText}>{upcomingTrip.statusText || 'E-PASS SẴN SÀNG'}</Text>
                </View>

                <Text style={styles.tripTitleText} numberOfLines={1}>
                  {upcomingTrip.title}
                </Text>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.dateText}>{upcomingTrip.dateRange}</Text>
                </View>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.tripButtonsRow}>
              {/* CTA 1: Mở e-Pass & Vé */}
              <TouchableOpacity
                style={styles.primaryTicketBtn}
                onPress={() => handleOpenEPass(upcomingTrip)}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryTicketBtnText}>Mở e-Pass & Vé</Text>
              </TouchableOpacity>

              {/* CTA 2: Lộ trình (Hardcode Toast CR_ACC_04) */}
              <TouchableOpacity
                style={styles.secondaryRouteBtn}
                onPress={handleAITripNotice}
                activeOpacity={0.75}
              >
                <Ionicons name="book-outline" size={16} color="#00685F" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryRouteBtnText}>Lộ trình</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. QUICK SHORTCUTS */}
          <View style={styles.shortcutsRow}>
            {/* Shortcut 1: Phòng đã đặt (Mở Modal Thẻ Phòng Du Lịch Đã Đặt) */}
            <TouchableOpacity
              style={styles.shortcutCard}
              activeOpacity={0.8}
              onPress={() => setShowBookingsModal(true)}
            >
              <View style={[styles.shortcutIconWrap, { backgroundColor: '#E6F4F1' }]}>
                <Ionicons name="bed" size={18} color="#00685F" />
              </View>
              <Text style={styles.shortcutTitle}>Phòng đã đặt</Text>
              <Text style={styles.shortcutSub}>{bookedRooms.length} chỗ nghỉ</Text>
            </TouchableOpacity>

            {/* Shortcut 2: Lịch trình lưu (Toast CR_ACC_04) */}
            <TouchableOpacity
              style={styles.shortcutCard}
              activeOpacity={0.8}
              onPress={handleAITripNotice}
            >
              <View style={[styles.shortcutIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="bookmark" size={18} color="#7C3AED" />
              </View>
              <Text style={styles.shortcutTitle}>Lịch trình lưu</Text>
              <Text style={styles.shortcutSub}>3 kế hoạch</Text>
            </TouchableOpacity>

            {/* Shortcut 3: Lịch sử đi */}
            <TouchableOpacity
              style={styles.shortcutCard}
              activeOpacity={0.8}
              onPress={() => setShowBookingsModal(true)}
            >
              <View style={[styles.shortcutIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={18} color="#D97706" />
              </View>
              <Text style={styles.shortcutTitle}>Lịch sử đi</Text>
              <Text style={styles.shortcutSub}>{bookedRooms.length} hành trình</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. SETTINGS & SUPPORT */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cài đặt & Trợ giúp</Text>

          {/* Item 1: Push Notification Switch */}
          <View style={styles.settingItemRow}>
            <View style={styles.settingIconWrap}>
              <Ionicons name="notifications-outline" size={20} color="#00685F" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Thông báo chuyến đi & Ưu đãi</Text>
              <Text style={styles.settingSub}>Nhắc nhở e-Pass, thời tiết & deal mới</Text>
            </View>
            <Switch
              value={pushNotificationEnabled}
              onValueChange={(val) => {
                setPushNotificationEnabled(val);
                showToast(val ? 'Đã bật thông báo đẩy' : 'Đã tắt thông báo đẩy', 'info', 2000);
              }}
              trackColor={{ false: '#CBD5E1', true: '#00685F' }}
              thumbColor={Platform.OS === 'android' ? (pushNotificationEnabled ? '#FFFFFF' : '#F1F5F9') : undefined}
            />
          </View>

          <View style={styles.settingDivider} />

          {/* Item 2: Ngôn ngữ & Tiền tệ */}
          <TouchableOpacity
            style={styles.settingItemRow}
            activeOpacity={0.7}
            onPress={() => setShowLangModal(true)}
          >
            <View style={styles.settingIconWrap}>
              <Ionicons name="language-outline" size={20} color="#00685F" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Ngôn ngữ & Tiền tệ</Text>
            </View>
            <View style={styles.settingRightGroup}>
              <Text style={styles.settingValueText}>{selectedLanguage} ({selectedCurrency})</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* Item 3: Điều khoản & Bảo mật cá nhân */}
          <TouchableOpacity
            style={styles.settingItemRow}
            activeOpacity={0.7}
            onPress={() => setShowTermsModal(true)}
          >
            <View style={styles.settingIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#00685F" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Điều khoản & Bảo mật cá nhân</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 7. ACCOUNT ACTIONS */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutDialog(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        {/* 8. FOOTER NOTE */}
        <View style={styles.footerNoteWrap}>
          <Text style={styles.footerNoteText}>
            Smart Travel v2.4.1 (Build 2026) • Thiết kế bởi Smart AI
          </Text>
        </View>
      </ScrollView>

      {/* 9. BOTTOM NAVIGATION BAR (4 Tabs) */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Khám phá */}
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Home', { user, token })}
          activeOpacity={0.7}
        >
          <Ionicons name="compass-outline" size={22} color="#64748B" />
          <Text style={styles.bottomNavLabel}>Khám phá</Text>
        </TouchableOpacity>

        {/* Tab 2: Đặt phòng */}
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('BookingDiscovery', { user, token })}
          activeOpacity={0.7}
        >
          <Ionicons name="bed-outline" size={22} color="#64748B" />
          <Text style={styles.bottomNavLabel}>Đặt phòng</Text>
        </TouchableOpacity>

        {/* Tab 3: Lịch trình */}
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={handleAITripNotice}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={22} color="#64748B" />
          <Text style={styles.bottomNavLabel}>Lịch trình</Text>
        </TouchableOpacity>

        {/* Tab 4: Tài khoản (Active) */}
        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle" size={24} color="#00685F" />
          <Text style={[styles.bottomNavLabel, styles.bottomNavLabelActive]}>Tài khoản</Text>
        </TouchableOpacity>
      </View>

      {/* ================= MODALS & POPUPS ================= */}

      {/* MODAL THÔNG BÁO (NOTIFICATION CENTER - Đồng bộ 100% chức năng) */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.notifBackdrop}>
          <View style={styles.notifSheet}>
            <View style={styles.dragHandleBar} />

            <View style={styles.notifHeader}>
              <View style={styles.notifTitleRow}>
                <Ionicons name="notifications" size={20} color="#00685F" style={{ marginRight: 8 }} />
                <Text style={styles.notifTitle}>Thông báo</Text>
                {unreadNotifCount > 0 && (
                  <View style={styles.notifUnreadBadge}>
                    <Text style={styles.notifUnreadBadgeText}>{unreadNotifCount} mới</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {unreadNotifCount > 0 && (
                  <TouchableOpacity
                    style={styles.notifMarkAllBtn}
                    onPress={handleMarkAllNotifsAsRead}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#00685F" style={{ marginRight: 4 }} />
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

            {/* Filter Tabs */}
            <View style={styles.notifTabsRow}>
              <TouchableOpacity
                style={[styles.notifTabBtn, notificationFilter === 'all' && styles.notifTabBtnActive]}
                onPress={() => setNotificationFilter('all')}
              >
                <Text style={[styles.notifTabText, notificationFilter === 'all' && styles.notifTabTextActive]}>
                  Tất cả ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notifTabBtn, notificationFilter === 'unread' && styles.notifTabBtnActive]}
                onPress={() => setNotificationFilter('unread')}
              >
                <Text style={[styles.notifTabText, notificationFilter === 'unread' && styles.notifTabTextActive]}>
                  Chưa đọc ({unreadNotifCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notifListContent}>
              {notifications
                .filter((n) => (notificationFilter === 'unread' ? !n.read : true))
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.notifIconWrap, { backgroundColor: item.badgeColor }]}>
                      <Ionicons name={item.icon} size={20} color={item.iconColor} />
                    </View>
                    <View style={styles.notifContentCol}>
                      <View style={styles.notifMetaRow}>
                        <View style={[styles.notifTypeBadge, { backgroundColor: item.badgeColor }]}>
                          <Text style={[styles.notifTypeBadgeText, { color: item.badgeTextColor }]}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DANH SÁCH HOMESTAY YÊU THÍCH */}
      <Modal
        visible={showWishlistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWishlistModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContentCard, { maxHeight: '88%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="heart" size={22} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Homestay đã yêu thích ({wishlistRooms.length})</Text>
              </View>
              <TouchableOpacity onPress={() => setShowWishlistModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {wishlistRooms.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="heart-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>Chưa có homestay yêu thích</Text>
                  <Text style={styles.emptySub}>Hãy bấm vào biểu tượng trái tim ở các homestay để lưu vào đây.</Text>
                </View>
              ) : (
                wishlistRooms.map((room) => (
                  <View key={room.id || room._id} style={styles.wishlistCard}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleViewWishlistDetail(room)}
                      style={styles.wishlistCardImageWrapper}
                    >
                      <Image source={{ uri: room.images[0] }} style={styles.wishlistCardImg} />
                      <View style={styles.wishlistBadge}>
                        <Text style={styles.wishlistBadgeText}>{room.badge || 'HOMESTAY'}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.wishlistHeartBtn}
                        onPress={() => handleRemoveWishlist(room)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="heart" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    <View style={styles.wishlistCardBody}>
                      <View style={styles.wishlistRatingRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                        <Text style={styles.wishlistRatingText}>{room.rating} ({room.reviewCount} đánh giá)</Text>
                        <Text style={styles.wishlistLocationText}>• {room.location?.city || 'Đà Nẵng'}</Text>
                      </View>

                      <Text style={styles.wishlistTitle} numberOfLines={1}>
                        {room.title || room.name}
                      </Text>
                      <Text style={styles.wishlistSub} numberOfLines={1}>
                        {room.subtitle || room.address}
                      </Text>

                      <View style={styles.wishlistFooterRow}>
                        <View>
                          <Text style={styles.wishlistPrice}>
                            {new Intl.NumberFormat('vi-VN').format(room.pricePerNight)}đ
                            <Text style={styles.wishlistPriceUnit}> / đêm</Text>
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.wishlistViewBtn}
                          onPress={() => handleViewWishlistDetail(room)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.wishlistViewBtnText}>Xem phòng & Đặt ngay</Text>
                          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DANH SÁCH PHÒNG DU LỊCH ĐÃ ĐẶT (Đầy đủ Card du lịch & Nút Đặt Lại) */}
      <Modal
        visible={showBookingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContentCard, { maxHeight: '88%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="bed" size={22} color="#00685F" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Phòng du lịch đã đặt ({bookedRooms.length})</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBookingsModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {bookedRooms.map((item) => (
                <View key={item.id} style={styles.bookedTravelCard}>
                  {/* Ảnh và thông tin cơ bản */}
                  <View style={styles.bookedCardTopRow}>
                    <Image source={{ uri: item.thumbnail }} style={styles.bookedCardThumb} />
                    <View style={styles.bookedCardMeta}>
                      <View style={styles.bookedCodeBadgeRow}>
                        <Text style={styles.bookedCodeBadge}>Mã: {item.bookingCode}</Text>
                        <View
                          style={[
                            styles.bookedStatusBadge,
                            item.status === 'COMPLETED'
                              ? { backgroundColor: '#F1F5F9' }
                              : { backgroundColor: '#CCFBF1' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.bookedStatusText,
                              item.status === 'COMPLETED' ? { color: '#64748B' } : { color: '#00685F' },
                            ]}
                          >
                            {item.statusText || 'E-PASS SẴN SÀNG'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.bookedTravelTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.bookedInfoRow}>
                        <Ionicons name="location-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={styles.bookedInfoText} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>

                      <View style={styles.bookedInfoRow}>
                        <Ionicons name="calendar-outline" size={13} color="#00685F" style={{ marginRight: 4 }} />
                        <Text style={[styles.bookedInfoText, { color: '#00685F', fontWeight: '700' }]}>
                          {item.dateRange} ({item.nights} đêm)
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Giá và thanh toán */}
                  <View style={styles.bookedPriceRow}>
                    <Text style={styles.bookedPriceLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.bookedPriceValue}>{item.totalAmount}</Text>
                  </View>

                  {/* 2 Nút hành động: 1. Đặt lại (Re-book) -> sang HomeDetails; 2. Mở e-Pass & Vé */}
                  <View style={styles.bookedActionsRow}>
                    <TouchableOpacity
                      style={styles.bookedRebookBtn}
                      onPress={() => handleRebookRoom(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="refresh" size={15} color="#00685F" style={{ marginRight: 6 }} />
                      <Text style={styles.bookedRebookBtnText}>Xem phòng & Đặt lại</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bookedTicketBtn}
                      onPress={() => handleOpenEPass(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="qr-code-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.bookedTicketBtnText}>Xem vé e-Pass</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL CHỈNH SỬA HỒ SƠ */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                style={styles.modalInput}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Nhập họ và tên đầy đủ"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Địa chỉ Gmail (Tài khoản đăng nhập)</Text>
              <TextInput
                style={[styles.modalInput, styles.inputDisabled]}
                value={editEmail}
                editable={false}
              />
              <Text style={styles.inputHint}>Email cố định theo tài khoản bảo mật của Smart Travel.</Text>

              <TouchableOpacity
                style={[styles.saveModalBtn, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
            <View style={styles.passInputWrap}>
              <TextInput
                style={styles.passInnerInput}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPass}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                <Ionicons name={showOldPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
            <View style={styles.passInputWrap}>
              <TextInput
                style={styles.passInnerInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPass}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                <Ionicons name={showNewPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passInputWrap}>
              <TextInput
                style={styles.passInnerInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showNewPass}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveModalBtn, savingPassword && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveModalBtnText}>Xác nhận đổi mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* OVERLAY CARD TOP AVATAR */}
      <Modal
        visible={showTopAvatarMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTopAvatarMenu(false)}
      >
        <TouchableOpacity
          style={styles.avatarDropdownBackdrop}
          activeOpacity={1}
          onPress={() => setShowTopAvatarMenu(false)}
        >
          <View style={styles.avatarDropdownCard}>
            <View style={styles.avatarDropdownHeader}>
              <Text style={styles.dropdownName}>{user.fullName}</Text>
              <Text style={styles.dropdownEmail}>{user.email}</Text>
            </View>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowTopAvatarMenu(false);
                setShowEditProfileModal(true);
              }}
            >
              <Ionicons name="person-outline" size={18} color="#00685F" style={{ marginRight: 10 }} />
              <Text style={styles.dropdownItemText}>My Account (Hồ sơ)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowTopAvatarMenu(false);
                setShowPasswordModal(true);
              }}
            >
              <Ionicons name="key-outline" size={18} color="#00685F" style={{ marginRight: 10 }} />
              <Text style={styles.dropdownItemText}>Reset Password (Đổi mật khẩu)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowTopAvatarMenu(false);
                setShowLogoutDialog(true);
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 10 }} />
              <Text style={[styles.dropdownItemText, { color: '#DC2626', fontWeight: '700' }]}>Logout (Đăng xuất)</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CONFIRM DIALOG CR_ACC_05 */}
      <Modal
        visible={showLogoutDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutDialog(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="alert-circle" size={36} color="#DC2626" />
            </View>

            <Text style={styles.confirmTitle}>Xác nhận đăng xuất</Text>
            <Text style={styles.confirmMessage}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Smart Travel?
            </Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowLogoutDialog(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmDeleteBtnText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM SHEET CHỌN NGÔN NGỮ & TIỀN TỆ */}
      <Modal
        visible={showLangModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLangModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Ngôn ngữ & Tiền tệ</Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Chọn Ngôn ngữ hiển thị</Text>
            {['Tiếng Việt', 'English'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.selectOptionRow, selectedLanguage === lang && styles.selectOptionActive]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={[styles.selectOptionText, selectedLanguage === lang && styles.selectOptionTextActive]}>
                  {lang}
                </Text>
                {selectedLanguage === lang && (
                  <Ionicons name="checkmark-circle" size={20} color="#00685F" />
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Chọn Đơn vị tiền tệ</Text>
            {[
              { code: 'VNĐ', name: 'Việt Nam Đồng (₫)' },
              { code: 'USD', name: 'Đô la Mỹ ($)' },
            ].map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[styles.selectOptionRow, selectedCurrency === curr.code && styles.selectOptionActive]}
                onPress={() => setSelectedCurrency(curr.code)}
              >
                <Text style={[styles.selectOptionText, selectedCurrency === curr.code && styles.selectOptionTextActive]}>
                  {curr.code} - {curr.name}
                </Text>
                {selectedCurrency === curr.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#00685F" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.saveModalBtn}
              onPress={() => {
                setShowLangModal(false);
                showToast(`Đã thiết lập: ${selectedLanguage} (${selectedCurrency})`, 'success', 2000);
              }}
            >
              <Text style={styles.saveModalBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ĐIỀU KHOẢN & BẢO MẬT */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContentCard, { maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Điều khoản & Bảo mật cá nhân</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.termsHeading}>1. Cam kết bảo mật thông tin</Text>
              <Text style={styles.termsParagraph}>
                Smart Travel bảo vệ dữ liệu cá nhân của người dùng tuyệt đối theo chuẩn quốc tế. Thông tin số điện thoại của bạn luôn được ẩn 3 chữ số giữa trên mọi giao diện công cộng.
              </Text>
              <Text style={styles.termsHeading}>2. Điều khoản dịch vụ & Đặt phòng</Text>
              <Text style={styles.termsParagraph}>
                Vé điện tử e-Pass có giá trị pháp lý tương đương hợp đồng thuê phòng ngắn hạn. Khách hàng xuất trình mã QR e-Pass khi làm thủ tục Check-in tại homestay/villa.
              </Text>
              <Text style={styles.termsHeading}>3. Chính sách hủy phòng & Hoàn tiền</Text>
              <Text style={styles.termsParagraph}>
                Hủy trước 48 giờ nhận phòng được hoàn 100% tiền cọc. Mọi khiếu nại được xử lý trong vòng 24 giờ qua bộ phận CSKH Smart Travel.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.saveModalBtn, { marginTop: 16 }]}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.saveModalBtnText}>Đã hiểu & Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TOAST NOTIFICATION */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // 1. TOP BAR
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compassBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00685F',
    letterSpacing: -0.3,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarMiniBtn: {
    marginLeft: 4,
  },
  avatarMiniCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SCROLL CONTENT
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // 2. PROFILE HEADER
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00685F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfoCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  userContactText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00685F',
  },

  // 3. STATS
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00685F',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  // 4. SECTION CARD CHUNG
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suitcaseIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00685F',
  },

  // TRIP HERO CARD
  tripHeroCard: {
    backgroundColor: '#F0FDF9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 14,
  },
  tripMainRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tripThumbnail: {
    width: 84,
    height: 84,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  tripMetaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greenLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00685F',
    letterSpacing: 0.3,
  },
  tripTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tripButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryTicketBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00685F',
    paddingVertical: 11,
    borderRadius: 10,
  },
  primaryTicketBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryRouteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 11,
    borderRadius: 10,
  },
  secondaryRouteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00685F',
  },

  // 5. QUICK SHORTCUTS
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  shortcutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 2,
  },
  shortcutSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },

  // 6. SETTINGS
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  settingRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 13,
    color: '#64748B',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },

  // 7. ACCOUNT ACTIONS
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },

  // 8. FOOTER NOTE
  footerNoteWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // 9. BOTTOM NAVIGATION
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  bottomNavLabelActive: {
    color: '#00685F',
    fontWeight: '800',
  },

  // MODALS STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  inputHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 14,
  },
  saveModalBtn: {
    backgroundColor: '#00685F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  saveModalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
  },
  passInnerInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },

  // CONFIRM DIALOG CR_ACC_05
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  confirmIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // TOP AVATAR DROPDOWN
  avatarDropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 55,
    paddingRight: 16,
  },
  avatarDropdownCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarDropdownHeader: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dropdownName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },

  // SELECT OPTIONS
  selectOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  selectOptionActive: {
    borderColor: '#00685F',
    backgroundColor: '#F0FDF9',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  selectOptionTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },

  // TERMS
  termsHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  termsParagraph: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 8,
  },

  // ================= NOTIFICATION CENTER MODAL STYLES =================
  notifBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notifSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  dragHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  notifUnreadBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  notifUnreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  notifMarkAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  notifMarkAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00685F',
  },
  notifCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  notifTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  notifTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifTabBtnActive: {
    backgroundColor: '#E6F4F1',
    borderColor: '#00685F',
  },
  notifTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  notifTabTextActive: {
    color: '#00685F',
    fontWeight: '700',
  },
  notifListContent: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderLeftWidth: 3.5,
    borderLeftColor: '#00685F',
  },
  notifIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#94A3B8',
    flex: 1,
  },
  unreadBlueDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3B82F6',
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 3,
  },
  notifItemTitleBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  notifItemMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  // ================= WISHLIST CARD STYLES =================
  wishlistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  wishlistCardImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  wishlistCardImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  wishlistBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#00685F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  wishlistBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  wishlistHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  wishlistCardBody: {
    padding: 14,
  },
  wishlistRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wishlistRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  wishlistLocationText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  wishlistSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  wishlistFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  wishlistPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00685F',
  },
  wishlistPriceUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  wishlistViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00685F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  wishlistViewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ================= BOOKED TRAVEL CARDS (PHÒNG DU LỊCH ĐÃ ĐẶT) =================
  bookedTravelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  bookedCardTopRow: {
    flexDirection: 'row',
  },
  bookedCardThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  bookedCardMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  bookedCodeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookedCodeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00685F',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookedStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookedStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bookedTravelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  bookedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bookedInfoText: {
    fontSize: 12,
    color: '#64748B',
  },
  bookedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 10,
  },
  bookedPriceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  bookedPriceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00685F',
  },
  bookedActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bookedRebookBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookedRebookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00685F',
  },
  bookedTicketBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00685F',
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookedTicketBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default ProfileScreen;

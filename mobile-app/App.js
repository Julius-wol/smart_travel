import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { store } from './src/store/store';
import { initDatabase } from './src/database/sqlite';
import { loadWishlistFromLocalThunk } from './src/store/slices/wishlistSlice';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Khởi tạo cơ sở dữ liệu SQLite offline
    initDatabase()
      .then(() => {
        // 2. Tải danh sách phòng yêu thích đã lưu ngoại tuyến vào Redux store
        dispatch(loadWishlistFromLocalThunk());
      })
      .catch((err) => {
        console.warn('Lỗi khởi tạo SQLite:', err);
      });
  }, [dispatch]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AppContent />
    </ReduxProvider>
  );
}

registerRootComponent(App);

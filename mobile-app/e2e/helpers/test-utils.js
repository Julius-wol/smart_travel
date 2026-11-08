import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import roomReducer from '../../src/store/slices/roomSlice';
import wishlistReducer from '../../src/store/slices/wishlistSlice';
import hostCalendarReducer from '../../src/store/slices/hostCalendarSlice';
import BookingDiscoveryScreen from '../../src/screens/BookingDiscoveryScreen';
import RoomDetailScreen from '../../src/screens/RoomDetailScreen';

// Thiết lập môi trường act cho React 19 trong Jest
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock Expo SQLite để chạy mượt mà trong môi trường Jest không cần native binary
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(true),
    runAsync: jest.fn().mockResolvedValue(true),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: jest.fn().mockResolvedValue(true),
    runAsync: jest.fn().mockResolvedValue(true),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
}));

// Mock @expo/vector-icons để tránh bất đồng bộ tải font trong môi trường Jest
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, testID, ...props }) => (
    <Text testID={testID || `icon-${name}`} {...props}>{name}</Text>
  );
  return new Proxy({}, {
    get: () => MockIcon,
  });
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/**
 * Tạo một Redux store độc lập cho từng kịch bản kiểm thử E2E
 */
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      room: roomReducer,
      wishlist: wishlistReducer,
      hostCalendar: hostCalendarReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

const Stack = createNativeStackNavigator();

/**
 * E2E App Flow Navigator kết nối trực tiếp các màn hình nghiệp vụ
 */
export const E2EFlowNavigator = ({ initialRouteName = 'Discovery' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Discovery" component={BookingDiscoveryScreen} />
        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Render component hoặc toàn bộ App với đầy đủ Providers (Redux, Paper, SafeArea, Navigation)
 */
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    includeNavigation = false,
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => {
    return (
      <ReduxProvider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <PaperProvider>
            {includeNavigation ? (
              <NavigationContainer>{children}</NavigationContainer>
            ) : (
              children
            )}
          </PaperProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    );
  };

  const renderPromise = render(ui, { wrapper: Wrapper, ...renderOptions });
  renderPromise.store = store;
  return renderPromise;
};

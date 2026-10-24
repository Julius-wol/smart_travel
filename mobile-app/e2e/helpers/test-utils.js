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
import bookingReducer from '../../src/store/slices/bookingSlice';
import BookingDiscoveryScreen from '../../src/screens/BookingDiscoveryScreen';
import RoomDetailScreen from '../../src/screens/RoomDetailScreen';
import CheckoutPaymentScreen from '../../src/screens/CheckoutPaymentScreen';
import BookingResultScreen from '../../src/screens/BookingResultScreen';

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
      booking: bookingReducer,
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
export const E2EFlowNavigator = ({ initialRouteName = 'Discovery', initialParams = {} }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        {initialRouteName === 'CheckoutPayment' ? (
          <>
            <Stack.Screen
              name="CheckoutPayment"
              component={CheckoutPaymentScreen}
              initialParams={initialParams}
            />
            <Stack.Screen
              name="BookingResult"
              component={BookingResultScreen}
              initialParams={initialParams}
            />
            <Stack.Screen
              name="RoomDetail"
              component={RoomDetailScreen}
              initialParams={initialParams}
            />
            <Stack.Screen name="Discovery" component={BookingDiscoveryScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Discovery" component={BookingDiscoveryScreen} />
            <Stack.Screen
              name="RoomDetail"
              component={RoomDetailScreen}
              initialParams={initialParams}
            />
            <Stack.Screen
              name="CheckoutPayment"
              component={CheckoutPaymentScreen}
              initialParams={initialParams}
            />
            <Stack.Screen
              name="BookingResult"
              component={BookingResultScreen}
              initialParams={initialParams}
            />
          </>
        )}
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

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });
  renderResult.store = store;
  return {
    store,
    ...renderResult,
  };
};
